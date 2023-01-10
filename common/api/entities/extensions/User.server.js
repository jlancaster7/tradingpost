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
const db_1 = require("../../../db");
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
const repository_1 = __importDefault(require("../../../social-media/repository"));
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
//Really should think about how to default this... we dont need to pass this everywhere all the time... 
//it just makes it harder to manage .. we should just have settings based on prod vs. dev etc.
exports.default = (0, _1.ensureServerExtensions)({
    getBlocked: (req) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const cache = yield (0, cache_1.getUserCache)();
        const blockList = ((_a = cache[req.extra.userId]) === null || _a === void 0 ? void 0 : _a.blocked) || [];
        if (!blockList.length)
            return [];
        else
            return yield UserApi_1.default.internal.list({
                data: {
                    ids: blockList
                }
            });
    }),
    setBlocked: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        if (req.body.block)
            yield pool.query(`INSERT INTO data_block_list(blocked_user_id, blocked_by_id)
                              VALUES ($1, $2)`, [req.body.userId, req.extra.userId]);
        else
            yield pool.query(`DELETE
                              FROM data_block_list
                              WHERE blocked_user_id = $1
                                and blocked_by_id = $2`, [req.body.userId, req.extra.userId]);
        return req.body;
    }),
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
        const { finicitySrv } = yield db_1.init;
        const test = yield finicitySrv.generateBrokerageAuthenticationLink(req.extra.userId);
        console.log(test);
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
    getBrokerageAccounts: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const accs = yield (0, db_1.execProc)("public.api_brokerage_account", {
            user_id: r.extra.userId,
            data: {}
        });
        if (accs.length <= 0)
            return [];
        return accs.filter(acc => acc.hidden_for_deletion !== true);
    }),
    initBrokerageAccounts: () => __awaiter(void 0, void 0, void 0, function* () {
        return [];
    }),
    linkSocialAccount: (req) => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c, _d;
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
                let showId = ((_b = (0, url_1.parse)(req.body.platform_idenifier).pathname) === null || _b === void 0 ? void 0 : _b.slice(6)) || '';
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
                redirectUri: `${req.body.callbackUrl}/auth/youtube`,
                clientSecret: "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"
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
            const channels = yield youtube.channels.list({ part: ["snippet"], mine: true });
            //console.log(JSON.stringify(channels));
            const channel = (_c = channels.data.items) === null || _c === void 0 ? void 0 : _c.pop();
            const channelId = channel === null || channel === void 0 ? void 0 : channel.id;
            const channelTitle = (_d = channel === null || channel === void 0 ? void 0 : channel.snippet) === null || _d === void 0 ? void 0 : _d.title;
            if (channelId) {
                const pool = yield db_1.getHivePool;
                const existingUsers = yield pool.query("SELECT user_id, u.dummy FROM data_platform_claim c inner join data_user u on u.id  = c.user_id where platform = 'youtube' and platform_user_id=$1", [channelId]);
                if (!existingUsers.rows.length) {
                    yield pool.query("delete from public.data_platform_claim where user_id = $1 and platform  ='youtube'", [req.extra.userId]);
                    yield pool.query("INSERT INTO public.data_platform_claim(platform, platform_user_id , claims , user_id , created_at , updated_at )"
                        + "VALUES ('youtube', $1,$2,$3, NOW(),NOW())", [channelId, JSON.stringify({ handle: channelTitle }), req.extra.userId]);
                    //TODO: will fix later
                    // await execProc("tp.update_youtube_social", {
                    //     user_id: req.extra.userId,
                    //     channel_id: channel?.id || ""
                    // })
                }
                else if (existingUsers.rows[0].dummy) {
                    const { pgClient, pgp } = yield db_1.init;
                    const repo = new repository_1.default(pgClient, pgp);
                    yield repo.mergeDummyAccounts({
                        dummyUserId: existingUsers.rows[0].user_id,
                        newUserId: req.extra.userId
                    });
                }
                else {
                    throw new EntityApiBase_1.PublicError("This account is claimed by another user.");
                }
                //check if somebody has the channel... if they are dummy then you can merge... if not then you will not merge 
            }
            return channelTitle || "";
        }
        else {
            return "";
        }
    }),
    getTrades: (r) => __awaiter(void 0, void 0, void 0, function* () {
        var _e, _f;
        const { portfolioSummarySrv } = yield db_1.init;
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
            return yield portfolioSummarySrv.getTrades(requestedId, {
                limit: r.extra.limit || 6,
                offset: r.extra.page || 0
            });
            /*
            return await execProc("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            })
            */
        }
        else if (((_e = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _e === void 0 ? void 0 : _e.portfolio_display.trades) && ((_f = requestedUser.subscription) === null || _f === void 0 ? void 0 : _f.is_subscribed)) {
            let result = yield portfolioSummarySrv.getTrades(requestedId, {
                limit: r.extra.limit || 6,
                offset: r.extra.page || 0
            });
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
        var _g, _h;
        const { portfolioSummarySrv } = yield db_1.init;
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
            const result = yield portfolioSummarySrv.getCurrentHoldings(requestedId);
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
        else if (((_g = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _g === void 0 ? void 0 : _g.portfolio_display.holdings) && ((_h = requestedUser.subscription) === null || _h === void 0 ? void 0 : _h.is_subscribed)) {
            const result = yield portfolioSummarySrv.getCurrentHoldings(requestedId);
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
        var _j, _k;
        const { portfolioSummarySrv } = yield db_1.init;
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
            return yield portfolioSummarySrv.getReturns(r.body.userId || r.extra.userId, luxon_1.DateTime.fromISO(r.body.startDate), luxon_1.DateTime.fromISO(r.body.endDate));
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
        var _l, _m;
        const { portfolioSummarySrv } = yield db_1.init;
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
        if (r.extra.userId === requestedId || (((_l = requestedUser === null || requestedUser === void 0 ? void 0 : requestedUser.settings) === null || _l === void 0 ? void 0 : _l.portfolio_display.performance) && ((_m = requestedUser.subscription) === null || _m === void 0 ? void 0 : _m.is_subscribed))) {
            return yield portfolioSummarySrv.getSummary(requestedId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQThEO0FBRTlELDBEQUF1RDtBQUN2RCwwREFBaUU7QUFDakUsK0RBQThDO0FBQzlDLG9DQUF5RDtBQUN6RCxtRUFBdUU7QUFDdkUsb0VBQXlFO0FBQ3pFLG1FQUF1RTtBQUN2RSx1Q0FBMkM7QUFDM0Msd0VBQWdEO0FBQ2hELGlDQUFnQztBQUNoQyxnRUFBOEI7QUFDOUIsZ0RBQWtEO0FBRWxELHlFQUFnRDtBQUNoRCw2QkFBNEI7QUFDNUIsMkNBQW1DO0FBQ25DLDJEQUFzRDtBQUN0RCxrRkFBMEQ7QUFXMUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILHdHQUF3RztBQUN4Ryw4RkFBOEY7QUFHOUYsa0JBQWUsSUFBQSx5QkFBc0IsRUFBTztJQUN4QyxVQUFVLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTs7UUFDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEdBQUUsQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxDQUFBLE1BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLDBDQUFFLE9BQU8sS0FBSSxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNO1lBQ2pCLE9BQU8sRUFBRSxDQUFDOztZQUVWLE9BQU8sTUFBTSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksRUFBRTtvQkFDRixHQUFHLEVBQUUsU0FBUztpQkFDakI7YUFDSixDQUFDLENBQUM7SUFHWCxDQUFDLENBQUE7SUFDRCxVQUFVLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUV0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