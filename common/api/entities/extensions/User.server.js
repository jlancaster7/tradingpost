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
const apn_1 = __importDefault(require("apn"));
const android_1 = __importDefault(require("../../../notifications/android"));
const notifications_1 = __importDefault(require("../../..//notifications"));
const repository_2 = __importDefault(require("../../..//notifications/repository"));
const interfaces_1 = require("../../../notifications/interfaces");
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
    }),
    testNotifcation: (r) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("I'm testing notifications");
        const streamToString = (stream) => new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });
        const { pgClient, pgp } = yield db_1.init;
        const s3Client = new client_s3_1.S3Client({
            region: "us-east-1"
        });
        const s3Res = yield s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: "tradingpost-app-data",
            Key: "ios/AuthKey_6WPUHTZ3LU.p8"
        }));
        const iosKeyBody = yield streamToString(s3Res.Body);
        console.log("I'm starting all the setup");
        const iosOptions = {
            token: {
                key: iosKeyBody,
                keyId: '6WPUHTZ3LU',
                teamId: '25L2ZZWUPA',
            },
            production: false
        };
        const apnProvider = new apn_1.default.Provider(iosOptions);
        const fcmConfig = yield configuration_1.DefaultConfig.fromCacheOrSSM("fcm");
        const androidNotif = new android_1.default(fcmConfig.authKey);
        const repo = new repository_2.default(pgClient, pgp);
        const notificationsSrv = new notifications_1.default(apnProvider, androidNotif, repo);
        console.log("I'm past all the setup");
        const u = `https://m.tradingpostapp.com/post?id=youtube_4Il00Mrkqnc`;
        yield notificationsSrv.sendMessageToUser(
        //'e96aea04-9a60-4832-9793-f790e60df8eb'
        r.extra.userId, {
            title: "Test Notification",
            body: "You have recieved a test notifcation from the api server! Click to open up the trading post app",
            data: {
                url: u
            }
        });
        return {};
    }),
    getPortfolioNotifications: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const result = yield pool.query(`SELECT * FROM data_notification_subscription WHERE user_id = $1 AND type_id = $2`, [r.extra.userId, r.body.typeId]);
        return { is_notification: result.rowCount ? true : false };
    }),
    togglePortfolioNotifications: (r) => __awaiter(void 0, void 0, void 0, function* () {
        var _o;
        const pool = yield db_1.getHivePool;
        console.log('portfolio toggle api firing');
        if ((_o = r.body) === null || _o === void 0 ? void 0 : _o.is_notification) {
            yield pool.query(`
                    INSERT INTO data_notification_subscription (type, type_id, user_id, disabled)
                    VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, type, type_id)
                              DO
                    UPDATE SET type = EXCLUDED.type, type_id = EXCLUDED.type_id, disabled = EXCLUDED.disabled;`, [interfaces_1.NotificationSubscriptionTypes.HOLDINGS_NOTIFICATION, r.body.typeId, r.extra.userId, false]);
            return true;
        }
        else {
            yield pool.query(`DELETE
                    FROM data_notification_subscription
                    WHERE user_id = $1
                    and type_id = $2
                    and type = $3`, [r.extra.userId, r.body.typeId, interfaces_1.NotificationSubscriptionTypes.HOLDINGS_NOTIFICATION]);
            return false;
        }
    }),
    discoveryOne: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        //sudpc.title, 
        //sudpc.description, 
        //sudpc.link,
        //substack
        const results = yield pool.query(`SELECT sudpc.title, 
                                                sudpc.description,   
                                                du.id,
                                                du.handle,
                                                du.tags,
                                                (concat(du.first_name,' ',du.last_name)) as "display_name",
                                                '{}' as "subscription",
                                                du.profile_url,
                                                du.social_analytics,
                                                du.is_deleted 
                                        FROM data_user du 
                                        INNER JOIN 
                                            (SELECT dpc.user_id, su.title, su.description, su.link 
                                            FROM substack_users su 
                                            INNER JOIN data_platform_claim dpc 
                                                ON su.substack_user_id = dpc.platform_user_id) sudpc 
                                            ON du.id = sudpc.user_id
                                        ORDER BY id DESC
                                        OFFSET $1
                                        LIMIT $2
                                        `, [r.body.page, r.body.limit]);
        return results.rows;
    }),
    discoveryTwo: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        //sudpc.title, 
        //sudpc.description, 
        //sudpc.link,
        //spotify
        const results = yield pool.query(`SELECT sudpc.name as "title",
                                                sudpc.description,
                                                du.id,
                                                du.handle,
                                                du.tags,
                                                (concat(du.first_name,' ',du.last_name)) as "display_name",
                                                '{}' as "subscription",
                                                du.profile_url,
                                                du.social_analytics,
                                                du.is_deleted 
                                        FROM data_user du 
                                        INNER JOIN 
                                            (SELECT dpc.user_id, su.name, su.description
                                            FROM spotify_users su  
                                            INNER JOIN data_platform_claim dpc 
                                                ON su.spotify_show_id = dpc.platform_user_id) sudpc 
                                            ON du.id = sudpc.user_id
                                        ORDER BY id DESC
                                        OFFSET $1
                                        LIMIT $2
                                        `, [r.body.page, r.body.limit]);
        return results.rows;
    }),
    discoveryThree: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        //sudpc.title, 
        //sudpc.description, 
        //sudpc.link,
        //Youtube
        const results = yield pool.query(`SELECT  
                                                du.id,
                                                du.handle,
                                                du.tags,
                                                (concat(du.first_name,' ',du.last_name)) as "display_name",
                                                '{}' as "subscription",
                                                du.profile_url,
                                                du.social_analytics,
                                                du.is_deleted 
                                        FROM data_user du 
                                        INNER JOIN 
                                            (SELECT dpc.user_id, yu.title, yu.description
                                            FROM youtube_users yu 
                                            INNER JOIN data_platform_claim dpc 
                                                ON yu.youtube_channel_id = dpc.platform_user_id) sudpc 
                                            ON du.id = sudpc.user_id
                                        ORDER BY id DESC
                                        OFFSET $1
                                        LIMIT $2
                                        `, [r.body.page, r.body.limit]);
        return results.rows;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUEwQztBQUMxQyxrREFBa0Y7QUFDbEYsOERBQThEO0FBRTlELDBEQUF1RDtBQUN2RCwwREFBaUU7QUFDakUsK0RBQThDO0FBQzlDLG9DQUF5RDtBQUN6RCxtRUFBdUU7QUFDdkUsb0VBQXlFO0FBQ3pFLG1FQUF1RTtBQUN2RSx1Q0FBMkM7QUFDM0Msd0VBQWdEO0FBQ2hELGlDQUFnQztBQUNoQyxnRUFBOEI7QUFDOUIsZ0RBQWtEO0FBRWxELHlFQUFnRDtBQUNoRCw2QkFBNEI7QUFDNUIsMkNBQW1DO0FBQ25DLDJEQUFzRDtBQUN0RCxrRkFBMEQ7QUFJMUQsOENBQXFCO0FBQ3JCLDZFQUFrRTtBQUNsRSw0RUFBb0Q7QUFDcEQsb0ZBQWlFO0FBRWpFLGtFQUFrRjtBQVVsRixNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDeEIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxDQUFDO0FBRUgsd0dBQXdHO0FBQ3hHLDhGQUE4RjtBQUc5RixrQkFBZSxJQUFBLHlCQUFzQixFQUFPO0lBQ3hDLFVBQVUsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFOztRQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsb0JBQVksR0FBRSxDQUFDO1FBQ25DLE1BQU0sU0FBUyxHQUFHLENBQUEsTUFBQSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07WUFDakIsT0FBTyxFQUFFLENBQUM7O1lBRVYsT0FBTyxNQUFNLGlCQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDL0IsSUFBSSxFQUFFO29CQUNGLEdBQUcsRUFBRSxTQUFTO2lCQUNqQjthQUNK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