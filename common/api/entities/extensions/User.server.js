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
//import FinicityTransformer from '../../../brokerage/finicity/transformer'
const pool_1 = require("../static/pool");
const index_1 = require("../../../social-media/twitter/index");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
//Really should think about how to default this... we dont need to pass this everywhere all the time... 
//it just makes it harder to manage .. we should just have settings based on prod vs. dev etc.
const dbStuff = (() => __awaiter(void 0, void 0, void 0, function* () {
    const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    yield pgClient.connect();
    return {
        pgp,
        pgClient
    };
}))();
let finicityService;
exports.default = (0, _1.ensureServerExtensions)({
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO: make this use a better pardigm... is a pool being used? Alternatively Maybe we ensure this loads when the server gets up and running.
        if (!finicityService) {
            const { pgClient, pgp } = yield dbStuff;
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
    getBrokerageAccounts: (r) => {
        return (0, pool_1.execProc)("public.api_brokerage_account", {
            user_id: r.extra.userId,
            data: {}
        });
    },
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
            const authResp = (yield info.json());
            const { pgClient, pgp } = yield dbStuff;
            const config = yield configuration_1.DefaultConfig.fromCacheOrSSM("twitter");
            const handle = yield (0, index_1.addTwitterUsersByToken)([{
                    accessToken: authResp.access_token,
                    expiration: new Date(authResp.expires_in),
                    refreshToken: authResp.refresh_token,
                    userId: req.extra.userId
                }], pgClient, pgp, config);
            return handle[0].username;
        }
        else
            return "";
    }),
    getTrades: (r) => {
        return (0, pool_1.execProc)("public.api_trade_list", {
            user_id: r.extra.userId,
            data: {}
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQXNEO0FBQ3RELG1FQUEwQztBQUMxQywwREFBdUQ7QUFDdkQsNERBQW1DO0FBQ25DLGlFQUF5QztBQUV6QywyRUFBMkU7QUFDM0UseUNBQTBDO0FBQzFDLCtEQUE0RTtBQVU1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDeEIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxDQUFDO0FBRUgsd0dBQXdHO0FBQ3hHLDhGQUE4RjtBQUU5RixNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQVMsRUFBRTtJQUN4QixNQUFNLEtBQUssR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdELE1BQU0sR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO0tBQzNCLENBQUMsQ0FBQztJQUVILE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3pCLE9BQU87UUFDSCxHQUFHO1FBQ0gsUUFBUTtLQUNYLENBQUE7QUFDTCxDQUFDLENBQUEsQ0FBQyxFQUFFLENBQUE7QUFHSixJQUFJLGVBQTBCLENBQUM7QUFDL0Isa0JBQWUsSUFBQSx5QkFBc0IsRUFBTztJQUN4QyxxQkFBcUIsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQ2pDLDZJQUE2STtRQUM3SSxJQUFJLENBQUMsZUFBZSxFQUFF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