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
const cache_1 = require("../../cache");
const WatchlistApi_1 = __importDefault(require("../apis/WatchlistApi"));
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
        const test = yield finicityService.generateBrokerageAuthenticationLink(req.extra.userId, "finicity");
        console.log(JSON.stringify(test));
        return {
            link: test
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
    },
    getHoldings: r => (0, pool_1.execProc)("public.api_holding_list", {
        user_id: r.extra.userId,
        data: {}
    }),
    getWatchlists: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const cache = yield (0, cache_1.getUserCache)();
        //a tad inefficient but oh well
        const watchlist = yield WatchlistApi_1.default.internal.list({
            user_id: r.extra.userId,
            data: {
                ids: cache[r.body.userId].watchlists
            }
        });
        return watchlist.filter(w => w.user_id === r.body.userId && w.type === "public");
        //make sure there are public or that you are a subscriber 
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQXNEO0FBQ3RELG1FQUEwQztBQUMxQywwREFBdUQ7QUFDdkQsNERBQW1DO0FBQ25DLGlFQUF5QztBQUV6QywyRUFBMkU7QUFDM0UseUNBQTBDO0FBQzFDLCtEQUE0RTtBQUM1RSx1Q0FBMkM7QUFDM0Msd0VBQWdEO0FBVWhELE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQVEsQ0FBQztJQUN4QixNQUFNLEVBQUUsV0FBVztDQUN0QixDQUFDLENBQUM7QUFFSCx3R0FBd0c7QUFDeEcsOEZBQThGO0FBRTlGLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBUyxFQUFFO0lBQ3hCLE1BQU0sS0FBSyxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0QsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDekIsT0FBTztRQUNILEdBQUc7UUFDSCxRQUFRO0tBQ1gsQ0FBQTtBQUNMLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQTtBQUdKLElBQUksZUFBMEIsQ0FBQztBQUMvQixrQkFBZSxJQUFBLHlCQUFzQixFQUFPO0lBQ3hDLHFCQUFxQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDakMsNklBQTZJ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