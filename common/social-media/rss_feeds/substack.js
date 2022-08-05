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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdWJzdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBZ0M7QUFNaEMsTUFBYSxRQUFRO0lBR2pCLFlBQVksVUFBc0I7UUFJbEMsZ0JBQVcsR0FBRyxDQUFPLFlBQWdELEVBQW1DLEVBQUU7WUFFdEcsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksSUFBOEIsQ0FBQztZQUNuQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFZCxJQUFJLFlBQTBCLENBQUM7WUFFL0IsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDUCxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixZQUFZLENBQUMsUUFBUSxnQkFBZ0IsWUFBWSxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQzthQUUvRztZQUNELE1BQU0sS0FBSyxHQUFHO2dCQUNWLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtnQkFDM0IsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLGNBQWMsRUFBRSxZQUFZLENBQUMsUUFBUTtnQkFDckMsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3hCLENBQUE7WUFDRCxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxJQUFJLFdBQVcsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLFdBQVcsQ0FBQyxNQUFN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
