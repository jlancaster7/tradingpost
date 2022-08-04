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
const _1 = require(".");
const client_s3_1 = require("@aws-sdk/client-s3");
const UserApi_1 = __importDefault(require("../apis/UserApi"));
const brokerage_1 = __importDefault(require("../../../brokerage"));
const configuration_1 = require("../../../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const finicity_1 = __importDefault(require("../../../finicity"));
const repository_1 = __importDefault(require("../../../brokerage/repository"));
//import FinicityTransformer from '../../../brokerage/finicity/transformer'
const pool_1 = require("../static/pool");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
let finicityService;
exports.default = (0, _1.ensureServerExtensions)({
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO: make this use a better pardigm... is a pool being used? Alternatively Maybe we ensure this loads when the server gets up and running.
        if (!finicityService) {
            const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
            const pgp = (0, pg_promise_1.default)({});
            const pgClient = pgp({
                host: pgCfg.host,
                user: pgCfg.user,
                password: pgCfg.password,
                database: pgCfg.database
            });
            yield pgClient.connect();
            const repository = new repository_1.default(pgClient, pgp);
            const finicityCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("finicity");
            const finicity = new finicity_1.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
            yield finicity.init();
            finicityService = new brokerage_1.default(pgClient, pgp, finicity);
        }
        //console.log(typeof test);
        //console.log(JSON.stringify(test));
        return {
            link: yield finicityService.generateBrokerageAuthenticationLink(req.extra.userId, "finicity")
        };
    }),
    uploadProfilePic: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        if (req.extra.userId !== body.userId) {
            yield client.send(new client_s3_1.PutObjectCommand({
                Bucket: "tradingpost-images",
                Key: `/profile-pics/${body.userId}`,
                Body: body.image
            }));
            yield UserApi_1.default.update(body.userId, {
                has_profile_pic: true
            });
        }
        else
            throw {
                message: "Unathorized",
                code: 401
            };
    }),
    getBrokerageAccounts: (r) => __awaiter(void 0, void 0, void 0, function* () {
        return (0, pool_1.execProc)("public.api_brokerage_account", {
            user_id: r.extra.userId,
            data: {}
        });
    }),
    initBrokerageAccounts: () => __awaiter(void 0, void 0, void 0, function* () {
        return [];
    }),
    linkSocialAccount: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.platform === "twitter") {
            const info = yield fetch("https://api.twitter.com/2/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: req.body.code,
                    grant_type: "authorization_code",
                    client_id: "cm9mUHBhbVUxZzcyVGJNX0xrc2E6MTpjaQ",
                    redirect_uri: 'http://localhost:19006/auth/twitter',
                    code_verifier: req.body.challenge
                }),
            });
            return (yield info.json()).access_token;
        }
        else
            return "";
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQXNEO0FBQ3RELG1FQUEwQztBQUMxQywwREFBdUQ7QUFDdkQsNERBQW1DO0FBQ25DLGlFQUF5QztBQUN6QywrRUFBc0Q7QUFDdEQsMkVBQTJFO0FBQzNFLHlDQUEwQztBQUcxQyxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDeEIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxDQUFDO0FBR0gsSUFBSSxlQUEwQixDQUFDO0FBQy9CLGtCQUFlLElBQUEseUJBQXNCLEVBQU87SUFDeEMscUJBQXFCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUNqQyw2SUFBNkk7UUFDN0ksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdELE1BQU0sR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztZQUMxQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7Z0JBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtnQkFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO2dCQUNoQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7Z0JBQ3hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTthQUMzQixDQUFDLENBQUM7WUFFSCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRWpELE1BQU0sV0FBVyxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdEIsZUFBZSxHQUFHLElBQUksbUJBQVMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsMkJBQTJCO1FBQzNCLG9DQUFvQztRQUNwQyxPQUFPO1lBQ0gsSUFBSSxFQUFFLE1BQU0sZUFBZSxDQUFDLG1DQUFtQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztTQUNoRyxDQUFBO0lBRUwsQ0FBQyxDQUFBO0lBQ0QsZ0JBQWdCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUM1QixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNsQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQztnQkFDbkMsTUFBTSxFQUFFLG9CQUFvQjtnQkFDNUIsR0FBRyxFQUFFLGlCQUFpQixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNuQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUs7YUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLGlCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCLENBQUMsQ0FBQztTQUVOOztZQUVHLE1BQU07Z0JBQ0YsT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLElBQUksRUFBRSxHQUFHO2FBQ1osQ0FBQTtJQUNULENBQUMsQ0FBQTtJQUNELG9CQUFvQixFQUFFLENBQU8sQ0FBQyxFQUFFLEVBQUU7UUFDOUIsT0FBTyxJQUFBLGVBQVEsRUFBQyw4QkFBOEIsRUFBRTtZQUM1QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFBO0lBQ0QscUJBQXFCLEVBQUUsR0FBUyxFQUFFO1FBQzlCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFBO0lBQ0QsaUJBQWlCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUM3QixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUNqQyxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyx3Q0FBd0MsRUFBRTtnQkFDL0QsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsT0FBTyxFQUFFO29CQUNMLGNBQWMsRUFBRSxrQkFBa0I7aUJBQ3JDO2dCQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJO29CQUNuQixVQUFVLEVBQUUsb0JBQW9CO29CQUNoQyxTQUFTLEVBQUUsb0NBQW9DO29CQUMvQyxZQUFZLEVBQUUscUNBQXFDO29CQUNuRCxhQUFhLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTO2lCQUNwQyxDQUFDO2FBRUwsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFBO1NBQzFDOztZQUNJLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQSJ9