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
    getComments: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = r.body.userId || r.extra.userId;
        const pool = yield db_1.getHivePool;
        const comments = (yield pool.query("SELECT * FROM public.data_comment where related_id = $1 and related_type ='user' order by created_at desc", [userId])).rows;
        const userCache = yield (0, cache_1.getUserCache)();
        comments.forEach((c) => c.profile = userCache[c.user_id].profile);
        //get user data
        return comments;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBZ0U7QUFDaEUsOERBQThEO0FBRTlELDBEQUF1RDtBQUN2RCwwREFBaUU7QUFDakUsK0RBQThDO0FBQzlDLG9DQUF5RDtBQUN6RCxtRUFBdUU7QUFDdkUsb0VBQXlFO0FBQ3pFLG1FQUF1RTtBQUN2RSx1Q0FBMkM7QUFDM0Msd0VBQWdEO0FBQ2hELGlDQUFnQztBQUNoQyxnRUFBOEI7QUFDOUIsZ0RBQWtEO0FBRWxELHlFQUFnRDtBQUNoRCw2QkFBNEI7QUFDNUIsMkNBQW1DO0FBQ25DLDJEQUFzRDtBQUN0RCxrRkFBMEQ7QUFZMUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILHdHQUF3RztBQUN4Ryw4RkFBOEY7QUFHOUYsa0JBQWUsSUFBQSx5QkFBc0IsRUFBTztJQUN4QyxVQUFVLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTs7UUFDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEdBQUUsQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxDQUFBLE1BQUEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLDBDQUFFLE9BQU8sS0FBSSxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNO1lBQ2pCLE9BQU8sRUFBRSxDQUFDOztZQUVWLE9BQU8sTUFBTSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksRUFBRTtvQkFDRixHQUFHLEVBQUUsU0FBUztpQkFDakI7YUFDSixDQUFDLENBQUM7SUFHWCxDQUFDLENBQUE7SUFDRCxVQUFVLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUV0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