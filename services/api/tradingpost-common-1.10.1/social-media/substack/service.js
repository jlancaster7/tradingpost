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
exports.DefaultSubstack = void 0;
const _1 = __importDefault(require("./"));
const repository_1 = __importDefault(require("../repository"));
class SubstackService {
    constructor(client, elasticSrv, repository, postPrepper) {
        this.importArticles = () => __awaiter(this, void 0, void 0, function* () {
            const substackIds = yield this.repository.getSubstackUsers();
            let articleIds = [];
            for (let i = 0; i < substackIds.length; i++) {
                const [results] = yield this.client.importArticles(substackIds[i].substack_user_id);
                results.forEach(article => {
                    articleIds.push(article.article_id);
                });
            }
            const articlesAndUsers = yield this.repository.getSubstackArticlesAndUsersByArticleIds(articleIds);
            yield this.elasticSrv.ingest(this.map(articlesAndUsers));
        });
        this.exportArticlesAndUsers = (lastId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.getSubstackArticlesAndUsers(lastId);
        });
        this.importUsers = (substackUsers) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.importUsers(substackUsers);
            console.log(`Successfully imported ${substackUsers.username}Substack user for userId: ${substackUsers.username}.`);
        });
        this.map = (items) => {
            return items.map((n) => {
                let obj = {
                    id: `substack_${n.article_id}`,
                    content: {
                        body: n.content_encoded_snippet,
                        description: n.content,
                        htmlBody: n.content_encoded,
                        htmlTitle: n.title,
                        title: n.title
                    },
                    imageUrl: n.newsletter_image.url,
                    meta: {},
                    platform: {
                        displayName: n.creator,
                        imageUrl: null,
                        profileUrl: n.newsletter_link,
                        username: null
                    },
                    platformCreatedAt: n.substack_article_created_at.toISO(),
                    platformUpdatedAt: n.substack_article_created_at.toISO(),
                    postType: "substack",
                    subscription_level: "standard",
                    postTypeValue: 3,
                    postUrl: n.link,
                    ratingsCount: 0,
                    tradingpostCreatedAt: n.tradingpost_substack_article_created_at.toISO(),
                    tradingpostUpdatedAt: n.tradingpost_substack_article_created_at.toISO(),
                    size: {
                        maxWidth: n.maxWidth,
                        aspectRatio: n.aspectRatio,
                    },
                    user: {
                        id: n.tradingpostUserId,
                        imageUrl: n.tradingpostProfileUrl,
                        name: "",
                        type: "",
                        username: n.tradingpostUserHandle
                    }
                };
                return obj;
            });
        };
        this.elasticSrv = elasticSrv;
        this.repository = repository;
        this.postPrepper = postPrepper;
        this.client = client;
    }
}
const DefaultSubstack = (pgClient, pgp, postPrepper, elastic) => {
    const repo = new repository_1.default(pgClient, pgp);
    const ss = new _1.default(repo, postPrepper);
    return new SubstackService(ss, elastic, repo, postPrepper);
};
exports.DefaultSubstack = DefaultSubstack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMENBQTBCO0FBQzFCLCtEQUF1QztBQU12QyxNQUFNLGVBQWU7SUFNakIsWUFBWSxNQUFnQixFQUFFLFVBQTBCLEVBQUUsVUFBc0IsRUFBRSxXQUF3QjtRQU8xRyxtQkFBYyxHQUFHLEdBQXdCLEVBQUU7WUFDdkMsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDN0QsSUFBSSxVQUFVLEdBQWEsRUFBRSxDQUFDO1lBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDcEYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDdEIsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQ3ZDLENBQUMsQ0FBQyxDQUFBO2FBQ0w7WUFDRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1Q0FBdUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FBTyxNQUFjLEVBQXlDLEVBQUU7WUFDckYsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsMkJBQTJCLENBQUMs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