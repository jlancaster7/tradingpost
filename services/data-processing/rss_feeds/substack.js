"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Substack = void 0;
const pg_format_1 = __importDefault(require("pg-format"));
const rss_parser_1 = __importDefault(require("rss-parser"));
class Substack {
    constructor(pg_client) {
        this.importUsers = (username) => __awaiter(this, void 0, void 0, function* () {
            if (typeof username === 'string') {
                username = [username];
            }
            let results = [];
            let data;
            let count = 0;
            let formatedUser;
            for (let i = 0; i < username.length; i++) {
                data = yield this.getUserFeed(username[i]);
                if (!data) {
                    continue;
                }
                formatedUser = this.formatUser(data);
                count += yield this.appendUser(formatedUser);
                results.push(formatedUser);
            }
            return [results, count];
        });
        this.importArticles = (username) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getUserFeed(username);
            if (!results) {
                return [[], 0];
            }
            const formatedArticles = this.formatArticles(results);
            const success = yield this.appendArticles(formatedArticles);
            return [formatedArticles, success];
        });
        this.getUserFeed = (username) => __awaiter(this, void 0, void 0, function* () {
            const parser = new rss_parser_1.default();
            try {
                const results = yield parser.parseURL(`https://${username}.substack.com/feed`);
                results.username = username;
                return results;
            }
            catch (err) {
                console.log(`${username} appears to be an invalid Substack username.`);
                return;
            }
        });
        this.formatUser = (userFeed) => {
            const formatedUser = {
                substack_user_id: userFeed.username,
                title: userFeed.title,
                description: userFeed.description,
                link: userFeed.link,
                language: userFeed.language,
                email: userFeed.webMaster,
                image: userFeed.image,
                itunes: userFeed.itunes,
                last_build_date: new Date(userFeed.lastBuildDate)
            };
            return formatedUser;
        };
        this.formatArticles = (userFeed) => {
            const rawArticles = userFeed.items;
            let formatedArticles = [];
            let temp;
            for (let i = 0; i < rawArticles.length; i++) {
                if (!rawArticles[i].creator) {
                    rawArticles[i].creator = '';
                }
                temp = {
                    substack_user_id: userFeed.username,
                    creator: rawArticles[i].creator,
                    title: rawArticles[i].title,
                    link: rawArticles[i].link,
                    substack_created_at: new Date(rawArticles[i].pubDate),
                    content_encoded: rawArticles[i]['content:encoded'],
                    content_encoded_snippet: rawArticles[i]['content:encodedSnippet'],
                    enclosure: JSON.stringify(rawArticles[i].enclosure),
                    dc_creator: rawArticles[i]['dc:creator'],
                    content: rawArticles[i].content,
                    content_snippet: rawArticles[i].contentSnippet,
                    article_id: rawArticles[i].guid,
                    itunes: JSON.stringify(rawArticles[i].itunes)
                };
                formatedArticles.push(temp);
            }
            return formatedArticles;
        };
        this.appendUser = (data) => __awaiter(this, void 0, void 0, function* () {
            let keys;
            let values;
            let value_index;
            let query;
            let result;
            let success = 0;
            try {
                keys = Object.keys(data).join(' ,');
                values = Object.values(data);
                value_index = '';
                values.map((obj, index) => {
                    value_index += `$${index + 1}, `;
                });
                value_index = value_index.substring(0, value_index.length - 2);
                query = `INSERT INTO substack_users(${keys})
                     VALUES (${value_index})
                     ON CONFLICT (substack_user_id) DO NOTHING`;
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                result = yield this.pg_client.result(query, values);
                success += result.rowCount;
                return success;
            }
            catch (err) {
                return success;
            }
        });
        this.appendArticles = (formatedArticles) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            try {
                let keys;
                let values = [];
                let query;
                let result;
                keys = Object.keys(formatedArticles[0]).join(' ,');
                formatedArticles.forEach(element => {
                    values.push(Object.values(element));
                });
                query = `INSERT INTO substack_articles(${keys})
            VALUES
            %L
                     ON CONFLICT (article_id)
            DO NOTHING`;
                result = yield this.pg_client.result((0, pg_format_1.default)(query, values));
                success += result.rowCount;
            }
            catch (err) {
                throw err;
            }
            return success;
        });
        this.pg_client = pg_client;
    }
}
exports.Substack = Substack;
