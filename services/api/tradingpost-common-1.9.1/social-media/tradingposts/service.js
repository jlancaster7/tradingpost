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
exports.DefaultTradingPost = void 0;
const repository_1 = __importDefault(require("../repository"));
class TradingPostsService {
    constructor(repository, elasticSrv) {
        this.exportTradingPostsAndUsers = (lastTradingPostId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.getTradingPostsAndUsers(lastTradingPostId);
        });
        this.repository = repository;
        this.elasticSrv = elasticSrv;
    }
}
exports.default = TradingPostsService;
TradingPostsService.map = (items) => {
    return items.map((n) => {
        let obj = {
            id: `tradingpost_${n.id}`,
            content: {
                body: n.body,
                description: null,
                htmlBody: null,
                htmlTitle: null,
                title: n.title
            },
            imageUrl: null,
            meta: {},
            platform: {
                displayName: n.tradingpost_user_handle,
                imageUrl: null,
                profileUrl: null,
                username: null
            },
            platformCreatedAt: n.created_at.toISO(),
            platformUpdatedAt: n.updated_at.toISO(),
            postType: "tradingpost",
            subscription_level: n.subscription_level,
            postTypeValue: 3,
            postUrl: null,
            ratingsCount: 0,
            tradingpostCreatedAt: n.created_at.toISO(),
            tradingpostUpdatedAt: n.updated_at.toISO(),
            size: {
                maxWidth: n.max_width,
                aspectRatio: n.aspect_ratio,
            },
            user: {
                id: n.user_id,
                imageUrl: n.tradingpost_user_profile_url,
                name: "",
                type: "",
                username: n.tradingpost_user_handle
            }
        };
        console.log(obj.size);
        return obj;
    });
};
const DefaultTradingPost = (pgClient, pgp, elastic) => {
    const repo = new repository_1.default(pgClient, pgp);
    return new TradingPostsService(repo, elastic);
};
exports.DefaultTradingPost = DefaultTradingPost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsK0RBQXVDO0FBTXZDLE1BQXFCLG1CQUFtQjtJQUlwQyxZQUFZLFVBQXNCLEVBQUUsVUFBMEI7UUFJOUQsK0JBQTBCLEdBQUcsQ0FBTyxpQkFBeUIsRUFBd0MsRUFBRTtZQUNuRyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQSxDQUFBO1FBTEcsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQzs7QUFQTCxzQ0F1REM7QUE1Q1UsdUJBQUcsR0FBRyxDQUFDLEtBQWtDLEVBQWdCLEVBQUU7SUFDOUQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBNEIsRUFBRSxFQUFFO1FBQzlDLElBQUksR0FBRyxHQUFlO1lBQ2xCLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDekIsT0FBTyxFQUFFO2dCQUNMLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtnQkFDWixXQUFXLEVBQUUsSUFBSTtnQkFDakIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO2FBQ2pCO1lBQ0QsUUFBUSxFQUFFLElBQUk7WUFDZCxJQUFJLEVBQUUsRUFBRTtZQUNSLFFBQVEsRUFBRTtnQkFDTixXQUFXLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtnQkFDdEMsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFFBQVEsRUFBRSxJQUFJO2FBQ2pCO1lBQ0QsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDdkMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDdkMsUUFBUSxFQUFFLGFBQWE7WUFDdkIsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtZQUN4QyxhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsSUFBSTtZQUNiLFlBQVksRUFBRSxDQUFDO1lBQ2Ysb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDMUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDMUMsSUFBSSxFQUFFO2dCQUNGLFFBQVEsRUFBRSxDQUFDLENBQUMsU0FBUztnQkFDckIsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZO2FBQzlCO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTztnQkFDYixRQUFRLEVBQUcsQ0FBQyxDQUFDLDRCQUE0QjtnQkFDekMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsUUFBUSxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7YUFDdEM7U0FDSixDQUFDO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTtBQUVFLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxRQUF3QixFQUFFLEdBQVUsRUFBRSxPQUF1QixFQUF1QixFQUFFO0lBQ3JILE1BQU0sSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDMUMsT0FBTyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUE7QUFIWSxRQUFBLGtCQUFrQixzQkFHOUIifQ==