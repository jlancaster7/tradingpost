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
const db_1 = require("../../../db");
//import { } from '../../../social-media/twitter/index'
const service_1 = require("../../../social-media/twitter/service");
const cache_1 = require("../../cache");
const WatchlistApi_1 = __importDefault(require("../apis/WatchlistApi"));
const luxon_1 = require("luxon");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
//Really should think about how to default this... we dont need to pass this everywhere all the time... 
//it just makes it harder to manage .. we should just have settings based on prod vs. dev etc.
const init = (() => __awaiter(void 0, void 0, void 0, function* () {
    const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    let brokerage;
    const finicityCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new finicity_1.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    console.log("Start Init ");
    yield finicity.init();
    brokerage = new brokerage_1.default(pgClient, pgp, finicity);
    console.log("Start Connection ");
    yield pgClient.connect();
    console.log("Returning ");
    return {
        brokerage,
        pgp,
        pgClient
    };
}))();
exports.default = (0, _1.ensureServerExtensions)({
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { brokerage } = yield init;
        const test = yield brokerage.generateBrokerageAuthenticationLink(req.extra.userId, "finicity");
        console.log(JSON.stringify(test));
        return {
            link: test
        };
    }),
    uploadProfilePic: (req) => __awaiter(void 0, void 0, void 0, function* () {
        yield client.send(new client_s3_1.PutObjectCommand({
            Bucket: "tradingpost-images",
            Key: `/profile-pics/${req.extra.userId}`,
            Body: Buffer.from(req.body.image, 'base64url')
        }));
        yield UserApi_1.default.internal.update({
            user_id: req.extra.userId,
            data: {
                id: req.extra.userId,
                has_profile_pic: true,
                profile_url: `https://tradingpost-images.s3.amazonaws.com/profile-pics/${req.extra.userId}`
            }
        });
        return {};
    }),
    getBrokerageAccounts: (r) => {
        return (0, db_1.execProc)("public.api_brokerage_account", {
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
            const { pgClient, pgp } = yield init;
            const config = yield configuration_1.DefaultConfig.fromCacheOrSSM("twitter");
            const handle = yield (0, service_1.DefaultTwitter)(config, pgClient, pgp).addTwitterUsersByToken({
                accessToken: authResp.access_token,
                expiration: authResp.expires_in,
                refreshToken: authResp.refresh_token,
                userId: req.extra.userId
            });
            return handle.username;
        }
        else
            return "";
    }),
    getTrades: (r) => {
        return (0, db_1.execProc)("public.api_trade_list", {
            limit: r.extra.limit || 5,
            user_id: r.extra.userId,
            page: r.extra.page,
            data: { user_id: r.body.user_id }
        });
    },
    getHoldings: r => (0, db_1.execProc)("public.api_holding_list", {
        user_id: r.extra.userId,
        data: {}
    }),
    getReturns: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const { brokerage } = yield init;
        return yield brokerage.getUserReturns(r.body.userId || r.extra.userId, luxon_1.DateTime.fromISO(r.body.startDate), luxon_1.DateTime.fromISO(r.body.endDate));
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
    }),
    getPortfolio: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const { brokerage } = yield init;
        return yield brokerage.portfolioSummaryService.getSummary(r.body.userId || r.extra.userId);
    }),
    search: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const cache = yield (0, cache_1.getUserCache)();
        const output = [];
        if (r.body.term.length >= 3) {
            const regex = new RegExp(r.body.term, "i");
            Object.keys(cache).forEach((id) => {
                var _a;
                const item = cache[id];
                if ( /* Ensure that the user is an analyst */((_a = item.profile.subscription) === null || _a === void 0 ? void 0 : _a.id) &&
                    (regex.test(item.profile.handle) || regex.test(item.profile.display_name)))
                    output.push(item.profile);
            });
        }
        else {
            throw new Error("Search term must be at least 3 characters");
        }
        return output;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQTJFO0FBQzNFLG1FQUEwQztBQUMxQywwREFBdUQ7QUFDdkQsNERBQW1DO0FBQ25DLGlFQUF5QztBQUN6QywyRUFBMkU7QUFDM0Usb0NBQXNDO0FBQ3RDLHVEQUF1RDtBQUN2RCxtRUFBdUU7QUFDdkUsdUNBQTJDO0FBQzNDLHdFQUFnRDtBQUNoRCxpQ0FBZ0M7QUFVaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILHdHQUF3RztBQUN4Ryw4RkFBOEY7QUFFOUYsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFTLEVBQUU7SUFDckIsTUFBTSxLQUFLLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RCxNQUFNLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1FBQ3hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtLQUMzQixDQUFDLENBQUM7SUFDSCxJQUFJLFNBQW9CLENBQUM7SUFHekIsTUFBTSxXQUFXLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRSxNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMs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