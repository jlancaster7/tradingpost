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
        yield pool.query(`update tp.local_login set verified = true where user_id = $1`, [req.extra.userId]);
        return {};
    }),
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { brokerage } = yield db_1.init;
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
                yield (0, service_2.DefaultSubstack)(pgClient, pgp, pp, elastic).importUsers({ userId: req.extra.userId, username: req.body.platform_idenifier });
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
                console.log(showId);
                yield (0, service_3.DefaultSpotify)(elastic, pgClient, pgp, config).importSpotifyShows({ userId: req.extra.userId, showId: showId });
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
                    redirect_uri: 'http://m.tradingpostapp.com/auth/youtube',
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
        console.log("About to send email..." + user.email);
        yield (0, sendGrid_1.sendByTemplate)({
            to: user.email,
            templateId: "d-23c8fc09ded942d386d7c888a95a0653",
            dynamicTemplateData: {
                Weblink: (process.env.WEBLINK_BASE_URL || "https://m.tradingpostapp.com") + `/verifyaccount?token=${token}`
            }
        });
        console.log("Sent email...");
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQTJFO0FBRTNFLDBEQUF1RDtBQUV2RCwwREFBaUU7QUFDakUsK0RBQThDO0FBRTlDLDJFQUEyRTtBQUMzRSxvQ0FBeUQ7QUFDekQsdURBQXVEO0FBQ3ZELG1FQUF1RTtBQUN2RSxvRUFBeUU7QUFDekUsbUVBQXVFO0FBQ3ZFLHVDQUEyQztBQUMzQyx3RUFBZ0Q7QUFDaEQsaUNBQWdDO0FBQ2hDLGdFQUE4QjtBQUM5QixnREFBa0Q7QUFFbEQseUVBQWdEO0FBQ2hELDZCQUE0QjtBQVU1QixNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDeEIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxDQUFDO0FBRUgsd0dBQXdHO0FBQ3hHLDhGQUE4RjtBQUc5RixrQkFBZSxJQUFBLHlCQUFzQixFQUFPO0lBQ3hDLFlBQVksRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQ3hCLHdCQUF3QjtRQUN4QixNQUFNLElBQUksR0FBRyxzQkFBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQW1CLENBQUM7UUFDckgsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBVyxDQUFDO1FBQy9CLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyw4REFBOEQsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtRQUNwRyxPQUFPLEVBQUUsQ0FBQTtJQUNiLENBQUMsQ0FBQTtJQUNELHFCQUFxQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDakMsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sU0FBSSxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLE1BQU0sU0FBUyxDQUFDLG1DQUFtQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9GLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSTtTQUNiLENBQUE7SUFFTCxDQUFDLENBQUE7SUFDRCxnQkFBZ0IsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQzVCLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDO1lBQ25DLE1BQU0sRUFBRSxvQkFBb0I7WUFDNUIsR0FBRyxFQUFFLGlCQUFpQixHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUN4QyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUM7U0FDakQsQ0FBQyxDQUFDLENBQUM7UUFDSixNQUFNLGlCQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMxQixPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQ3pCLElBQUksRUFBRTtnQkFDRixFQUFFLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUNwQixlQUFlLEVBQUUsSUFBSTtnQkFDckIsV0FBVyxFQUFFLDREQUE0RCxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTthQUM5RjtTQUNKLENBQUMsQ0FBQztRQUNILE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFBO0lBQ0Qsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUN4QixPQUFPLElBQUEsYUFBUSxFQUFDLDhCQUE4QixFQUFFO1lBQzVDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU07WUFDdkIsSUFBSSxFQUFFLEVBQUU7U0FDWCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0QscUJBQXFCLEVBQUUsR0FBUyxFQUFFO1FBQzlCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQyxDQUFBO0lBQ0QsaUJBQWlCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTs7UUFDN0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDakMsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsd0NBQXdDLEVBQUU7Z0JBQy9ELE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRTtvQkFDTCxjQUFjLEVBQUUsa0JBQWtCO2lCQUNyQztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSTtvQkFDbkIsVUFBVSxFQUFFLG9CQUFvQjtvQkFDaEMsU0FBUyxFQUFFLG9DQUFvQztvQkFDL0MsWUFBWSxFQUFFLHFDQUFxQztvQkFDbkQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUztpQkFDcEMsQ0FBQzthQUVMLENBQUMsQ0FBQTtZQUNGLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQW1CLENBQUM7WUFDdkQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLFNBQUksQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSx3QkFBYyxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsc0JBQXNCLENBQUM7Z0JBQzlFLFdBQVcsRUFBRSxRQUFRLENBQUMsWUFBWTtnQkFDbEMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVO2dCQUMvQixZQUFZLEVBQUUsUUFBUSxDQUFDLGFBQWE7Z0JBQ3BDLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU07YUFDM0IsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQzFCO2FBQ0ksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxVQUFVLEVBQUU7WUFDdkMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLFNBQUksQ0FBQztZQUNyQyxNQUFNLEVBQUUsR0FBRyxJQUFJLHNCQUFXLEVBQUUsQ0FBQztZQUM3QixNQUFNLG9CQUFvQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxzQkFBYSxDQUFDO2dCQUNwQyxLQUFLLEVBQUU7b0JBQ0gsRUFBRSxFQUFFLG9CQUFvQixDQUFDLE9BQWlCO2lCQUM3QztnQkFDRCxJQUFJLEVBQUU7b0JBQ0YsTUFBTSxFQUFFLG9CQUFvQixDQUFDLE1BQWdCO2lCQUNoRDtnQkFDRCxVQUFVLEVBQUUsQ0FBQzthQUNoQixDQUFDLENBQUE7WUFFRixNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztZQUN2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFjLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzdELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDN0IsTUFBTSxJQUFBLHlCQUFlLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtnQkFDbEksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO2FBQ3RDO2lCQUNJO2dCQUNELE9BQU8sRUFBRSxDQUFBO2FBQ1o7U0FDSjthQUNJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQ3RDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxTQUFJLENBQUM7WUFDckMsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQWEsQ0FBQztnQkFDcEMsS0FBSyxFQUFFO29CQUNILEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxPQUFpQjtpQkFDN0M7Z0JBQ0QsSUFBSSxFQUFFO29CQUNGLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxNQUFnQjtpQkFDaEQ7Z0JBQ0QsVUFBVSxFQUFFLENBQUM7YUFDaEIsQ0FBQyxDQUFBO1lBRUYsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUM7WUFDdkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBYyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3RCxNQUFNLE1BQU0sR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTdELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDN0IsSUFBSSxNQUFNLEdBQUcsQ0FBQSxNQUFBLElBQUEsV0FBSyxFQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxRQUFRLDBDQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSSxFQUFFLENBQUE7Z0JBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sSUFBQSx3QkFBYyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO2dCQUNySCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7YUFDdEM7aUJBQ0k7Z0JBQ0QsT0FBTyxFQUFFLENBQUE7YUFDWjtTQUNKO2FBQ0ksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsNENBQTRDLEVBQUU7Z0JBQ25FLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRTtvQkFDTCxjQUFjLEVBQUUsa0JBQWtCO2lCQUNyQztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSTtvQkFDbkIsVUFBVSxFQUFFLG9CQUFvQjtvQkFDaEMsU0FBUyxFQUFFLEVBQUU7b0JBQ2IsWUFBWSxFQUFFLDBDQUEwQztvQkFDeEQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUztpQkFDcEMsQ0FBQzthQUVMLENBQUMsQ0FBQTtZQUNGLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtnQkFDVCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZELElBQUEsYUFBUSxFQUFDLDBCQUEwQixFQUFFO29CQUNqQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNO2lCQUM1QixDQUFDLENBQUE7Z0JBQ0YsT0FBTyxRQUFRLENBQUM7YUFDbkI7O2dCQUVHLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMxQzthQUNJO1lBQ0QsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUMsQ0FBQTtJQUNELFNBQVMsRUFBRSxDQUFPLENBQUMsRUFBRSxFQUFFOztRQUNuQixJQUFJLGFBQWEsR0FBRyxFQUFjLENBQUM7UUFDbkMsSUFBSSxXQUFXLENBQUM7UUFDaEIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUM1QixhQUFhLEdBQUcsQ0FBQyxNQUFNLElBQUEsYUFBUSxFQUFDLHFCQUFxQixFQUFFO2dCQUNuRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUN2QixJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTTtpQkFDcEI7YUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNWO2FBQ0k7WUFDRCxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7U0FDL0I7UUFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtZQUNoQyxPQUFPLE1BQU0sSUFBQSxhQUFRLEVBQUMsdUJBQXVCLEVBQUU7Z0JBQzNDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDO2dCQUN6QixPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUN2QixJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUNsQixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7YUFDbkMsQ0FBQyxDQUFBO1NBQ0w7YUFBTSxJQUFJLENBQUEsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsUUFBUSwwQ0FBRSxpQkFBaUIsQ0FBQyxNQUFNLE1BQUksTUFBQSxhQUFhLENBQUMsWUFBWSwwQ0FBRSxhQUFhLENBQUEsRUFBRTtZQUN2RyxJQUFJLE1BQU0sR0FBRyxNQUFNLElBQUEsYUFBUSxFQUFDLHVCQUF1QixFQUFFO2dCQUNqRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFDekIsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDdkIsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSTtnQkFDbEIsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2FBQ25DLENBQUMsQ0FBQTtZQUNGLElBQUksQ0FBQyxHQUFVLEVBQUUsQ0FBQTtZQUNqQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQixNQUFNLENBQUMsR0FBRztvQkFDTixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLFFBQVEsRUFBRSxDQUFDO29CQUNYLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO29CQUNwQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7b0JBQzFCLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztvQkFDdEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2lCQUM3QixDQUFBO2dCQUNELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQTtZQUNGLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFDSTtZQUNELE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDLENBQUE7SUFDRCxXQUFXLEVBQUUsQ0FBTyxDQUFDLEVBQUUsRUFBRTs7UUFDckIsSUFBSSxhQUFhLEdBQUcsRUFBYyxDQUFDO1FBQ25DLElBQUksV0FBVyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDNUIsYUFBYSxHQUFHLENBQUMsTUFBTSxJQUFBLGFBQVEsRUFBQyxxQkFBcUIsRUFBRTtnQkFDbkQsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDdkIsSUFBSSxFQUFFO29CQUNGLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU07aUJBQ3BCO2FBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDVjthQUNJO1lBQ0QsV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFBO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7WUFDaEMsT0FBTyxNQUFNLElBQUEsYUFBUSxFQUFDLHlCQUF5QixFQUFFO2dCQUM3QyxPQUFPLEVBQUUsV0FBVzthQUN2QixDQUFDLENBQUM7U0FDTjthQUNJLElBQUksQ0FBQSxNQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxRQUFRLDBDQUFFLGlCQUFpQixDQUFDLFFBQVEsTUFBSSxNQUFBLGFBQWEsQ0FBQyxZQUFZLDBDQUFFLGFBQWEsQ0FBQSxFQUFFO1lBQ3ZHLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxhQUFRLEVBQUMseUJBQXlCLEVBQUU7Z0JBQ3JELE9BQU8sRUFBRSxXQUFXO2FBQ3ZCLENBQUMsQ0FBQTtZQUNGLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQixTQUFTLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQTtZQUNGLElBQUksQ0FBQyxHQUFVLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQixNQUFNLENBQUMsR0FBRztvQkFDTixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1IsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUMxQixRQUFRLEVBQUUsQ0FBQztvQkFDWCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUztvQkFDdEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTtvQkFDaEQsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUMxQixTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7b0JBQ3RCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztpQkFDN0IsQ0FBQTtnQkFDRCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUE7WUFDRixPQUFPLENBQUMsQ0FBQztTQUNaO2FBQ0k7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQyxDQUFBO0lBQ0QsVUFBVSxFQUFFLENBQU0sQ0FBQyxFQUFDLEVBQUU7O1FBQ2xCLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLFNBQUksQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRyxFQUFjLENBQUM7UUFDbkMsSUFBSSxXQUFXLENBQUM7UUFDaEIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUM1QixhQUFhLEdBQUcsQ0FBQyxNQUFNLElBQUEsYUFBUSxFQUFDLHFCQUFxQixFQUFFO2dCQUNuRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUN2QixJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTTtpQkFDcEI7YUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNWO2FBQ0k7WUFDRCxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7U0FDL0I7UUFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUEsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsUUFBUSwwQ0FBRSxpQkFBaUIsQ0FBQyxXQUFXLE1BQUksTUFBQSxhQUFhLENBQUMsWUFBWSwwQ0FBRSxhQUFhLENBQUEsQ0FBQyxFQUFFO1lBQ3pJLE9BQU8sTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGdCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBMEIsQ0FBQyxFQUFFLGdCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBd0IsQ0FBQyxDQUFDLENBQUM7U0FDbEw7YUFBTTtZQUNILE9BQU8sRUFBRSxDQUFBO1NBQ1o7SUFDTCxDQUFDLENBQUE7SUFDRCxhQUFhLEVBQUUsQ0FBTSxDQUFDLEVBQUMsRUFBRTtRQUNyQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsb0JBQVksR0FBRSxDQUFDO1FBQ25DLCtCQUErQjtRQUMvQixNQUFNLFNBQVMsR0FBRyxNQUFNLHNCQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUMvQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRTtnQkFDRixHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVTthQUN2QztTQUNKLENBQUMsQ0FBQztRQUNILE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQTtRQUNoRiwwREFBMEQ7SUFDOUQsQ0FBQyxDQUFBO0lBQ0QsWUFBWSxFQUFFLENBQU8sQ0FBQyxFQUFFLEVBQUU7O1FBQ3RCLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLFNBQUksQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRyxFQUFjLENBQUM7UUFDbkMsSUFBSSxXQUFXLENBQUM7UUFDaEIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUM1QixhQUFhLEdBQUcsQ0FBQyxNQUFNLElBQUEsYUFBUSxFQUFDLHFCQUFxQixFQUFFO2dCQUNuRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUN2QixJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTTtpQkFDcEI7YUFDSixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNWO2FBQ0k7WUFDRCxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUE7U0FDL0I7UUFDRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUEsTUFBQSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsUUFBUSwwQ0FBRSxpQkFBaUIsQ0FBQyxXQUFXLE1BQUksTUFBQSxhQUFhLENBQUMsWUFBWSwwQ0FBRSxhQUFhLENBQUEsQ0FBQyxFQUFFO1lBQ3pJLE9BQU8sTUFBTSxTQUFTLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzFFO2FBQ0k7WUFDRCxPQUFPLEVBQWtDLENBQUM7U0FDN0M7SUFDTCxDQUFDLENBQUE7SUFDRCxNQUFNLEVBQUUsQ0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNoQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsb0JBQVksR0FBRSxDQUFDO1FBQ25DLE1BQU0sTUFBTSxHQUFnQixFQUFFLENBQUE7UUFDOUIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7O2dCQUM5QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsRUFBd0IsQ0FBQyxDQUFDO2dCQUM3QyxLQUFLLHdDQUNELENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsRUFBRTtvQkFDN0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMxRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNqQyxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7U0FDaEU7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDLENBQUE7SUFDRCxtQkFBbUIsRUFBRSxDQUFPLENBQUMsRUFBRSxFQUFFO1FBRTdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFOUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDcEMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQzVCLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU07U0FDMUIsQ0FBQyxDQUFBO1FBRUYsMEdBQTBHO1FBQzFHLE1BQU0sS0FBSyxHQUFHLHNCQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEQsTUFBTSxJQUFBLHlCQUFjLEVBQUM7WUFDakIsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2QsVUFBVSxFQUFFLG9DQUFvQztZQUNoRCxtQkFBbUIsRUFBRTtnQkFDakIsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSw4QkFBOEIsQ0FBQyxHQUFHLHdCQUF3QixLQUFLLEVBQUU7YUFDOUc7U0FDSixDQUFDLENBQUE7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBQzVCLE9BQU8sRUFBRSxDQUFBO0lBQ2IsQ0FBQyxDQUFBO0NBQ0osQ0FBQyxDQUFBIn0=