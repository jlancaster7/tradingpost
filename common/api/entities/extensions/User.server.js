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
const configuration_1 = require("../../../configuration");
const elasticsearch_1 = require("@elastic/elasticsearch");
const elastic_1 = __importDefault(require("../../../elastic"));
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
const fs_1 = require("fs");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
//Really should think about how to default this... we dont need to pass this everywhere all the time... 
//it just makes it harder to manage .. we should just have settings based on prod vs. dev etc.
exports.default = (0, _1.ensureServerExtensions)({
    validateUser: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //to do need to id match
        const data = jsonwebtoken_1.default.verify(req.body.verificationToken, yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey"));
        const pool = yield db_1.getHivePool;
        yield pool.query(`update tp.local_login
                          set verified = true
                          where user_id = $1`, [req.extra.userId]);
        return {};
    }),
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { brokerage } = yield db_1.init;
        const test = yield brokerage.generateBrokerageAuthenticationLink(req.extra.userId, "finicity");
        return {
            link: test
        };
    }),
    uploadProfilePic: (req) => __awaiter(void 0, void 0, void 0, function* () {
        (0, fs_1.writeFileSync)("test.url", req.body.image);
        (0, fs_1.writeFileSync)("test.jpg", Buffer.from(req.body.image.substring(23), 'base64'));
        yield client.send(new client_s3_1.PutObjectCommand({
            Bucket: "tradingpost-images",
            Key: `profile-pics/${req.extra.userId}`,
            Body: Buffer.from(req.body.image.substring(23), 'base64'),
            ACL: 'public-read'
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
                    redirect_uri: `${req.body.callbackUrl}/auth/twitter`,
                    code_verifier: req.body.challenge
                }),
            });
            const authResp = (yield info.json());
            const { pgClient, pgp } = yield db_1.init;
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
            const { pgClient, pgp } = yield db_1.init;
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
                yield (0, service_2.DefaultSubstack)(pgClient, pgp, pp, elastic).importUsers({
                    userId: req.extra.userId,
                    username: req.body.platform_idenifier
                });
                return req.body.platform_idenifier;
            }
            else {
                return '';
            }
        }
        else if (req.body.platform === 'spotify') {
            const { pgClient, pgp } = yield db_1.init;
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
                yield (0, service_3.DefaultSpotify)(elastic, pgClient, pgp, config).importSpotifyShows({
                    userId: req.extra.userId,
                    showId: showId
                });
                return req.body.platform_idenifier;
            }
            else {
                return '';
            }
        }
        else if (req.body.platform === 'youtube') {
            const info = yield fetch("https://accounts.google.com/o/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: req.body.code,
                    grant_type: "authorization_code",
                    client_id: "",
                    redirect_uri: `${req.body.callbackUrl}/auth/youtube`,
                    code_verifier: req.body.challenge
                }),
            });
            if (info.ok) {
                const username = ((yield info.json()).claims.username);
                (0, db_1.execProc)("tp.update_youtube_social", {
                    user_id: req.extra.userId
                });
                return username;
            }
            else
                throw new Error(yield info.text());
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
                    security_id: r.security_id,
                    option_id: r.option_id,
                    option_info: r.option_info
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
                    security_id: r.security_id,
                    option_id: r.option_id,
                    option_info: r.option_info
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
        const { brokerage } = yield db_1.init;
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
        const { brokerage } = yield db_1.init;
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
                Weblink: (process.env.WEBLINK_BASE_URL || "https://m.tradingpostapp.com") + `/verifyaccount?token=${token}`
            }
        });
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQTJFO0FBRTNFLDBEQUF1RDtBQUV2RCwwREFBaUU7QUFDakUsK0RBQThDO0FBRTlDLDJFQUEyRTtBQUMzRSxvQ0FBeUQ7QUFDekQsdURBQXVEO0FBQ3ZELG1FQUF1RTtBQUN2RSxvRUFBeUU7QUFDekUsbUVBQXVFO0FBQ3ZFLHVDQUEyQztBQUMzQyx3RUFBZ0Q7QUFDaEQsaUNBQWdDO0FBQ2hDLGdFQUE4QjtBQUM5QixnREFBa0Q7QUFFbEQseUVBQWdEO0FBQ2hELDZCQUE0QjtBQUU1QiwyQkFBbUM7QUFVbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILHdHQUF3RztBQUN4Ryw4RkFBOEY7QUFHOUYsa0JBQWUsSUFBQSx5QkFBc0IsRUFBTztJQUN4QyxZQUFZLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUN4Qix3QkFBd0I7UUFFeEIsTUFBTSxJQUFJLEdBQUcsc0JBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFtQixDQUFDO1FBQ3JILE1BQU0sSUFBSSxHQUFHLE1BQU0sZ0JBQVcsQ0FBQztRQUMvQixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUM7OzZDQUVvQixFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQzFELE9BQU8sRUFBRSxDQUFBO0lBQ2IsQ0FBQyxDQUFBO0lBQ0QscUJBQXFCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUNqQyxNQUFNLEVBQUUsU0FBUyxFQUFF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