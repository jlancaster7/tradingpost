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
    constructor(repository) {
        this.importUsers = (substackUser) => __awaiter(this, void 0, void 0, function* () {
            let results = [];
            let data;
            let count = 0;
            let formatedUser;
            data = yield this.getUserFeed(substackUser.username);
            if (!data) {
                throw new Error(`Substack user: ${substackUser.username} for userId: ${substackUser.userId} was not found`);
            }
            const token = {
                userId: substackUser.userId,
                platform: 'substack',
                platformUserId: substackUser.username,
                accessToken: null,
                refreshToken: null,
                expiration: null,
                updatedAt: new Date()
            };
            formatedUser = this.formatUser(data);
            let dummyTokens = (yield this.repository.getTokens('platform_user_id', [token.platformUserId], 'substack'));
            if (dummyTokens.length && substackUser.userId !== dummyTokens[0].userId) {
                const dummyCheck = yield this.repository.isUserIdDummy(dummyTokens[0].userId);
                if (dummyCheck) {
                    yield this.repository.mergeDummyAccounts({ newUserId: substackUser.userId, dummyUserId: dummyTokens[0].userId });
                }
                else {
                    throw new Error("This account is claimed by another non-dummy user.");
                }
            }
            yield this.repository.upsertUserTokens(token);
            count = yield this.repository.insertSubstackUser(formatedUser);
            return [formatedUser, count];
        });
        this.importArticles = (username) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.getUserFeed(username);
            if (!results) {
                return [[], 0];
            }
            const formatedArticles = this.formatArticles(results);
            const success = yield this.repository.insertSubstackArticles(formatedArticles);
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
        this.repository = repository;
    }
}
exports.Substack = Substack;
