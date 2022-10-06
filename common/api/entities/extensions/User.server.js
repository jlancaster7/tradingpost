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
const elasticsearch_1 = require("@elastic/elasticsearch");
const elastic_1 = __importDefault(require("../../../elastic"));
const finicity_1 = __importDefault(require("../../../finicity"));
//import FinicityTransformer from '../../../brokerage/finicity/transformer'
const db_1 = require("../../../db");
//import { } from '../../../social-media/twitter/index'
const service_1 = require("../../../social-media/twitter/service");
const service_2 = require("../../../social-media/substack/service");
const service_3 = require("../../../social-media/spotify/service");
const cache_1 = require("../../cache");
const WatchlistApi_1 = __importDefault(require("../apis/WatchlistApi"));
const luxon_1 = require("luxon");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendGrid_1 = require("../../../sendGrid");
const post_prepper_1 = __importDefault(require("../../../post-prepper"));
const url_1 = require("url");
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
        var _a;
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
        else if (req.body.platform === 'substack') {
            const { pgClient, pgp } = yield init;
            const pp = new post_prepper_1.default();
            const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
            const elasticClient = new elasticsearch_1.Client({
                cloud: {
                    id: elasticConfiguration.cloudId
                },
                auth: {
                    apiKey: elasticConfiguration.apiKey
                },
                maxRetries: 5,
            });
            const indexName = "tradingpost-search";
            const elastic = new elastic_1.default(elasticClient, indexName);
            if (req.body.platform_idenifier) {
                yield (0, service_2.DefaultSubstack)(pgClient, pgp, pp, elastic).importUsers({ userId: req.extra.userId, username: req.body.platform_idenifier });
                return req.body.platform_idenifier;
            }
            else {
                return '';
            }
        }
        else if (req.body.platform === 'spotify') {
            const { pgClient, pgp } = yield init;
            const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
            const elasticClient = new elasticsearch_1.Client({
                cloud: {
                    id: elasticConfiguration.cloudId
                },
                auth: {
                    apiKey: elasticConfiguration.apiKey
                },
                maxRetries: 5,
            });
            const indexName = "tradingpost-search";
            const elastic = new elastic_1.default(elasticClient, indexName);
            const config = yield configuration_1.DefaultConfig.fromCacheOrSSM("spotify");
            if (req.body.platform_idenifier) {
                let showId = ((_a = (0, url_1.parse)(req.body.platform_idenifier).pathname) === null || _a === void 0 ? void 0 : _a.slice(6)) || '';
                console.log(showId);
                yield (0, service_3.DefaultSpotify)(elastic, pgClient, pgp, config).importSpotifyShows({ userId: req.extra.userId, showId: showId });
                return req.body.platform_idenifier;
            }
            else {
                return '';
            }
        }
        else if (req.body.platform === 'youtube') {
            return "";
        }
        else {
            return "";
        }
    }),
    getTrades: (r) => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        let requestedUser = {};
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (yield (0, db_1.execProc)("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId;
        }
        if (r.extra.userId === requestedId) {
            return yield (0, db_1.execProc)("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            });
        }
        else if (((_b = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _b === void 0 ? void 0 : _b.portfolio_display.trades) && ((_c = requestedUser.subscription) === null || _c === void 0 ? void 0 : _c.is_subscribed)) {
            let result = yield (0, db_1.execProc)("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            });
            let t = [];
            result.forEach((r, i) => {
                const o = {
                    date: r.date,
                    type: r.type,
                    quantity: 0,
                    price: r.price,
                    fees: r.fees,
                    currency: r.currency,
                    security_id: r.security_id
                };
                t.push(o);
            });
            return t;
        }
        else {
            return [];
        }
    }),
    getHoldings: (r) => __awaiter(void 0, void 0, void 0, function* () {
        var _d, _e;
        let requestedUser = {};
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (yield (0, db_1.execProc)("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId;
        }
        if (r.extra.userId === requestedId) {
            return yield (0, db_1.execProc)("public.api_holding_list", {
                user_id: requestedId
            });
        }
        else if (((_d = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _d === void 0 ? void 0 : _d.portfolio_display.holdings) && ((_e = requestedUser.subscription) === null || _e === void 0 ? void 0 : _e.is_subscribed)) {
            const result = yield (0, db_1.execProc)("public.api_holding_list", {
                user_id: requestedId
            });
            let portValue = 0;
            result.forEach((r, i) => {
                portValue += parseFloat(r.value);
            });
            let t = [];
            result.forEach((r, i) => {
                const o = {
                    id: r.id,
                    price_as_of: r.price_as_of,
                    quantity: 0,
                    price: r.price,
                    value: parseFloat(r.value) / portValue,
                    cost_basis: !r.cost_basis ? 'n/a' : r.cost_basis,
                    security_id: r.security_id
                };
                t.push(o);
            });
            return t;
        }
        else {
            return [];
        }
    }),
    getReturns: (r) => __awaiter(void 0, void 0, void 0, function* () {
        var _f, _g;
        const { brokerage } = yield init;
        let requestedUser = {};
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (yield (0, db_1.execProc)("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId;
        }
        if (r.extra.userId === requestedId || (((_f = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _f === void 0 ? void 0 : _f.portfolio_display.performance) && ((_g = requestedUser.subscription) === null || _g === void 0 ? void 0 : _g.is_subscribed))) {
            return yield brokerage.getUserReturns(r.body.userId || r.extra.userId, luxon_1.DateTime.fromISO(r.body.startDate), luxon_1.DateTime.fromISO(r.body.endDate));
        }
        else {
            return [];
        }
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
        var _h, _j;
        const { brokerage } = yield init;
        let requestedUser = {};
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (yield (0, db_1.execProc)("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId;
        }
        if (r.extra.userId === requestedId || (((_h = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _h === void 0 ? void 0 : _h.portfolio_display.performance) && ((_j = requestedUser.subscription) === null || _j === void 0 ? void 0 : _j.is_subscribed))) {
            return yield brokerage.portfolioSummaryService.getSummary(requestedId);
        }
        else {
            return {};
        }
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
    }),
    sendEmailValidation: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
        const user = yield UserApi_1.default.internal.get({
            data: { id: r.extra.userId },
            user_id: r.extra.userId
        });
        //TODO: make this token expire faster and attach this to a code ( to prevent multiple tokens from working)
        const token = jsonwebtoken_1.default.sign({ verified: true }, authKey, { subject: r.extra.userId });
        yield (0, sendGrid_1.sendByTemplate)({
            to: user.email,
            templateId: "d-23c8fc09ded942d386d7c888a95a0653",
            dynamicTemplateData: {
                Weblink: (process.env.WEBLINK_BASE_URL || "https://app.tradingpostapp.com") + `/verifyaccount?token=${token}`
            }
        });
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQTJFO0FBQzNFLG1FQUEwQztBQUMxQywwREFBdUQ7QUFDdkQsNERBQW1DO0FBQ25DLDBEQUErRDtBQUMvRCwrREFBOEM7QUFDOUMsaUVBQXlDO0FBQ3pDLDJFQUEyRTtBQUMzRSxvQ0FBc0M7QUFDdEMsdURBQXVEO0FBQ3ZELG1FQUF1RTtBQUN2RSxvRUFBeUU7QUFDekUsbUVBQXVFO0FBQ3ZFLHVDQUEyQztBQUMzQyx3RUFBZ0Q7QUFDaEQsaUNBQWdDO0FBQ2hDLGdFQUE4QjtBQUM5QixnREFBa0Q7QUFFbEQseUVBQWdEO0FBQ2hELDZCQUE0QjtBQVM1QixNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDeEIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxDQUFDO0FBRUgsd0dBQXdHO0FBQ3hHLDhGQUE4RjtBQUU5RixNQUFNLElBQUksR0FBRyxDQUFDLEdBQVMsRUFBRTtJQUNyQixNQUFNLEtBQUssR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdELE1BQU0sR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO0tBQzNCLENBQUMsQ0FBQztJQUNILElBQUksU0FBb0IsQ0FBQztJQUd6QixNQUFNLFdBQVcsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FB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