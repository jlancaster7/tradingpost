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
const googleapis_1 = require("googleapis");
const EntityApiBase_1 = require("../static/EntityApiBase");
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
        var _a, _b;
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
            const oauth2Client = new googleapis_1.google.auth.OAuth2({
                clientId: "408632420955-7gsbtielmra10pj4sdccgml20tphfujk.apps.googleusercontent.com",
                redirectUri: `${req.body.callbackUrl}/auth/youtube`
            });
            if (!req.body.code)
                throw new EntityApiBase_1.PublicError("Invalid request. Missing auth 'code'");
            const { tokens } = yield oauth2Client.getToken(req.body.code);
            oauth2Client.setCredentials(tokens);
            const youtube = googleapis_1.google.youtube({
                version: "v3",
                auth: oauth2Client
            });
            //TODO: need to discuss if multiple channels what we wanna do
            const channels = yield youtube.channels.list();
            console.log(JSON.stringify(channels));
            const channel = (_b = channels.data.items) === null || _b === void 0 ? void 0 : _b.pop();
            if (channel === null || channel === void 0 ? void 0 : channel.id) {
                yield (0, db_1.execProc)("tp.update_youtube_social", {
                    user_id: req.extra.userId,
                    channel_id: (channel === null || channel === void 0 ? void 0 : channel.id) || ""
                });
            }
            return (channel === null || channel === void 0 ? void 0 : channel.id) || "";
        }
        else {
            return "";
        }
    }),
    getTrades: (r) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d;
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
        if (r.extra.userId === requestedId) {
            return yield brokerage.getUserTrades(requestedId, { limit: r.extra.limit || 6, offset: r.extra.page || 0 });
            /*
            return await execProc("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            })
            */
        }
        else if (((_c = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _c === void 0 ? void 0 : _c.portfolio_display.trades) && ((_d = requestedUser.subscription) === null || _d === void 0 ? void 0 : _d.is_subscribed)) {
            let result = yield brokerage.getUserTrades(requestedId, { limit: r.extra.limit || 6, offset: r.extra.page || 0 });
            /*
            let result = await execProc("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            })
            */
            let t = [];
            result.forEach((r, i) => {
                const o = {
                    date: r.date,
                    type: r.type,
                    quantity: 0,
                    price: r.price,
                    fees: r.fees,
                    currency: r.currency,
                    security_id: r.securityId,
                    option_id: r.optionId,
                    option_info: r.optionInfo
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
        var _e, _f;
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
        if (r.extra.userId === requestedId) {
            const result = yield brokerage.getUserHoldings(requestedId);
            let t = [];
            result.forEach((r, i) => {
                const o = {
                    security_id: r.securityId,
                    option_id: r.optionId,
                    option_info: r.optionInfo,
                    price: r.price,
                    quantity: r.quantity,
                    value: r.value,
                    cost_basis: !r.costBasis ? 'n/a' : r.costBasis,
                    pnl: r.pnl,
                    date: r.date
                };
                t.push(o);
            });
            return t;
            /*
            return await execProc("public.api_holding_list", {
                user_id: requestedId
            });
            */
        }
        else if (((_e = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _e === void 0 ? void 0 : _e.portfolio_display.holdings) && ((_f = requestedUser.subscription) === null || _f === void 0 ? void 0 : _f.is_subscribed)) {
            const result = yield brokerage.getUserHoldings(requestedId);
            /*
            const result = await execProc("public.api_holding_list", {
                user_id: requestedId
            });
            */
            let portValue = 0;
            result.forEach((r, i) => {
                portValue += r.value;
            });
            let t = [];
            result.forEach((r, i) => {
                const o = {
                    security_id: r.securityId,
                    option_id: r.optionId,
                    option_info: r.optionInfo,
                    price: r.price,
                    quantity: 0,
                    value: r.value / portValue,
                    cost_basis: !r.costBasis ? 'n/a' : r.costBasis,
                    pnl: 0,
                    date: r.date
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
        var _g, _h;
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
        if (r.extra.userId === requestedId || (((_g = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _g === void 0 ? void 0 : _g.portfolio_display.performance) && ((_h = requestedUser.subscription) === null || _h === void 0 ? void 0 : _h.is_subscribed))) {
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
        var _j, _k;
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
        if (r.extra.userId === requestedId || (((_j = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _j === void 0 ? void 0 : _j.portfolio_display.performance) && ((_k = requestedUser.subscription) === null || _k === void 0 ? void 0 : _k.is_subscribed))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUF3QztBQUN4QyxrREFBOEQ7QUFDOUQsOERBQXlFO0FBRXpFLDBEQUFxRDtBQUVyRCwwREFBK0Q7QUFDL0QsK0RBQThDO0FBRTlDLDJFQUEyRTtBQUMzRSxvQ0FBdUQ7QUFDdkQsdURBQXVEO0FBQ3ZELG1FQUFxRTtBQUNyRSxvRUFBdUU7QUFDdkUsbUVBQXFFO0FBQ3JFLHVDQUF5QztBQUN6Qyx3RUFBZ0Q7QUFDaEQsaUNBQThCO0FBQzlCLGdFQUE4QjtBQUM5QixnREFBZ0Q7QUFFaEQseUVBQWdEO0FBQ2hELDZCQUEwQjtBQUcxQiwyQ0FBNkM7QUFDN0MsMkRBQW9EO0FBVXBELE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQVEsQ0FBQztJQUN4QixNQUFNLEVBQUUsV0FBVztDQUN0QixDQUFDLENBQUM7QUFFSCx3R0FBd0c7QUFDeEcsOEZBQThGO0FBRzlGLGtCQUFlLElBQUEseUJBQXNCLEVBQU87SUFDeEMsWUFBWSxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDeEIsd0JBQXdCO1FBRXhCLE1BQU0sSUFBSSxHQUFHLHNCQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBbUIsQ0FBQztRQUNySCxNQUFNLElBQUksR0FBRyxNQUFNLGdCQUFXLENBQUM7UUFDL0IsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDOzs2Q0FFb0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtRQUMxRCxPQUFPLEVBQUUsQ0FBQTtJQUNiLENBQUMsQ0FBQTtJQUNELHFCQUFxQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDakMsTUFBTSxF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