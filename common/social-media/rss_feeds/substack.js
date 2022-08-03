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
                count += yield this.repository.insertSubstackUser(formatedUser);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdWJzdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBZ0M7QUFLaEMsTUFBYSxRQUFRO0lBR2pCLFlBQVksVUFBc0I7UUFJbEMsZ0JBQVcsR0FBRyxDQUFPLFFBQTJCLEVBQXFDLEVBQUU7WUFDbkYsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7Z0JBQzlCLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQ3hCO1lBRUQsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksSUFBOEIsQ0FBQztZQUNuQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxJQUFJLFlBQTBCLENBQUM7WUFDL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1AsU0FBUztpQkFDWjtnQkFDRCxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFckMsS0FBSyxJQUFJLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDaEUsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM5QjtZQUNELE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFBLENBQUE7UUFFRCxtQkFBYyxHQUFHLENBQU8sUUFBZ0IsRUFBeUMsRUFBRTtZQUMvRSxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFD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