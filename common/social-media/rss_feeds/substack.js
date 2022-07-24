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
const rss_parser_1 = __importDefault(require("rss-parser"));
class Substack {
    constructor(pg_client, pgp) {
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
        this.appendArticles = (formattedArticles) => __awaiter(this, void 0, void 0, function* () {
            try {
                const cs = new this.pgp.helpers.ColumnSet([
                    { name: 'substack_user_id', prop: 'substack_user_id' },
                    { name: 'creator', prop: 'creator' },
                    { name: 'title', prop: 'title' },
                    { name: 'link', prop: 'link' },
                    { name: 'substack_created_at', prop: 'substack_created_at' },
                    { name: 'content_encoded', prop: 'content_encoded' },
                    { name: 'content_encoded_snippet', prop: 'content_encoded_snippet' },
                    { name: 'enclosure', prop: 'enclosure' },
                    { name: 'dc_creator', prop: 'dc_creator' },
                    { name: 'content', prop: 'content' },
                    { name: 'content_snippet', prop: 'content_snippet' },
                    { name: 'article_id', prop: 'article_id' },
                    { name: 'itunes', prop: 'itunes' },
                ], { table: 'substack_articles' });
                const query = this.pgp.helpers.insert(formattedArticles, cs) + ' ON CONFLICT DO NOTHING';
                return (yield this.pg_client.result(query)).rowCount;
            }
            catch (err) {
                throw err;
            }
        });
        this.pg_client = pg_client;
        this.pgp = pgp;
    }
}
exports.Substack = Substack;
