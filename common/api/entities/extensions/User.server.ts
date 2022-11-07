import User, { UploadProfilePicBody } from "./User"
import { ensureServerExtensions } from "."
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import UserApi, { IUserGet, IUserList, IUserUpdate } from '../apis/UserApi'
import Brokerage from '../../../brokerage'
import { DefaultConfig } from "../../../configuration";
import pgPromise from "pg-promise";
import { Client as ElasticClient } from '@elastic/elasticsearch';
import ElasticService from "../../../elastic";
import Finicity from "../../../finicity";
//import FinicityTransformer from '../../../brokerage/finicity/transformer'
import { execProc, getHivePool, init } from '../../../db'
//import { } from '../../../social-media/twitter/index'
import { DefaultTwitter } from "../../../social-media/twitter/service";
import { DefaultSubstack } from "../../../social-media/substack/service";
import { DefaultSpotify } from "../../../social-media/spotify/service";
import { getUserCache } from "../../cache";
import WatchlistApi from "../apis/WatchlistApi";
import { DateTime } from 'luxon'
import jwt from 'jsonwebtoken'
import { sendByTemplate } from '../../../sendGrid'
import { TradingPostAccountGroupStats } from "../../../brokerage/interfaces";
import PostPrepper from "../../../post-prepper";
import { parse } from "url";
import { i } from "mathjs";
export interface ITokenResponse {
    "token_type": "bearer",
    "expires_in": number,
    "access_token": string,
    "scope": string,
    "refresh_token": string,
}

const client = new S3Client({
    region: "us-east-1"
});

//Really should think about how to default this... we dont need to pass this everywhere all the time... 
//it just makes it harder to manage .. we should just have settings based on prod vs. dev etc.


export default ensureServerExtensions<User>({
    validateUser: async (req) => {
        //to do need to id match
        console.log("Validating User");
        const data = jwt.verify(req.body.verificationToken, await DefaultConfig.fromCacheOrSSM("authkey")) as jwt.JwtPayload;
        const pool = await getHivePool;
        await pool.query(`update tp.local_login set verified = true where user_id = $1`, [req.extra.userId])
        return {}
    },
    generateBrokerageLink: async (req) => {
        const { brokerage } = await init;
        const test = await brokerage.generateBrokerageAuthenticationLink(req.extra.userId, "finicity");
        console.log(JSON.stringify(test));
        return {
            link: test
        }

    },
    uploadProfilePic: async (req) => {
        await client.send(new PutObjectCommand({
            Bucket: "tradingpost-images",
            Key: `/profile-pics/${req.extra.userId}`,
            Body: Buffer.from(req.body.image, 'base64url')
        }));
        await UserApi.internal.update({
            user_id: req.extra.userId,
            data: {
                id: req.extra.userId,
                has_profile_pic: true,
                profile_url: `https://tradingpost-images.s3.amazonaws.com/profile-pics/${req.extra.userId}`
            }
        });
        return {};
    },
    getBrokerageAccounts: (r) => {
        return execProc("public.api_brokerage_account", {
            user_id: r.extra.userId,
            data: {}
        });
    },
    initBrokerageAccounts: async () => {
        return [];
    },
    linkSocialAccount: async (req) => {

        if (req.body.platform === "twitter") {
            const info = await fetch("https://api.twitter.com/2/oauth2/token", {
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

            })
            const authResp = (await info.json()) as ITokenResponse;
            const { pgClient, pgp } = await init;
            const config = await DefaultConfig.fromCacheOrSSM("twitter");
            console.log("TWITTER Auth Response: " + JSON.stringify(authResp))
            const handle = await DefaultTwitter(config, pgClient, pgp).addTwitterUsersByToken({
                accessToken: authResp.access_token,
                expiration: authResp.expires_in,
                refreshToken: authResp.refresh_token,
                userId: req.extra.userId
            });
            return handle.username;
        }
        else if (req.body.platform === 'substack') {
            const { pgClient, pgp } = await init;
            const pp = new PostPrepper();
            const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
            const elasticClient = new ElasticClient({
                cloud: {
                    id: elasticConfiguration.cloudId as string
                },
                auth: {
                    apiKey: elasticConfiguration.apiKey as string
                },
                maxRetries: 5,
            })

            const indexName = "tradingpost-search";
            const elastic = new ElasticService(elasticClient, indexName);
            if (req.body.platform_idenifier) {
                await DefaultSubstack(pgClient, pgp, pp, elastic).importUsers({ userId: req.extra.userId, username: req.body.platform_idenifier })
                return req.body.platform_idenifier;
            }
            else {
                return ''
            }
        }
        else if (req.body.platform === 'spotify') {
            const { pgClient, pgp } = await init;
            const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
            const elasticClient = new ElasticClient({
                cloud: {
                    id: elasticConfiguration.cloudId as string
                },
                auth: {
                    apiKey: elasticConfiguration.apiKey as string
                },
                maxRetries: 5,
            })

            const indexName = "tradingpost-search";
            const elastic = new ElasticService(elasticClient, indexName);
            const config = await DefaultConfig.fromCacheOrSSM("spotify");

            if (req.body.platform_idenifier) {
                let showId = parse(req.body.platform_idenifier).pathname?.slice(6) || ''
                console.log(showId);
                await DefaultSpotify(elastic, pgClient, pgp, config).importSpotifyShows({ userId: req.extra.userId, showId: showId })
                return req.body.platform_idenifier;
            }
            else {
                return ''
            }
        }
        else if (req.body.platform === 'youtube') {
            const info = await fetch("https://accounts.google.com/o/oauth2/token", {
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

            })
            if (info.ok) {
                const username = ((await info.json()).claims.username);
                execProc("tp.update_youtube_social", {
                    user_id: req.extra.userId
                })
                return username;
            }
            else
                throw new Error(await info.text());
        }
        else {
            return "";
        }
    },
    getTrades: async (r) => {
        let requestedUser = {} as IUserGet;
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (await execProc("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId
        }
        if (r.extra.userId === requestedId) {
            return await execProc("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            })
        } else if (requestedUser?.settings?.portfolio_display.trades && requestedUser.subscription?.is_subscribed) {
            let result = await execProc("public.api_trade_list", {
                limit: r.extra.limit || 5,
                user_id: r.extra.userId,
                page: r.extra.page,
                data: { user_id: r.body.userId }
            })
            let t: any[] = []
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
                }
                t.push(o);
            })
            return t;
        }
        else {
            return [];
        }
    },
    getHoldings: async (r) => {
        let requestedUser = {} as IUserGet;
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (await execProc("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId
        }
        if (r.extra.userId === requestedId) {
            return await execProc("public.api_holding_list", {
                user_id: requestedId
            });
        }
        else if (requestedUser?.settings?.portfolio_display.holdings && requestedUser.subscription?.is_subscribed) {
            const result = await execProc("public.api_holding_list", {
                user_id: requestedId
            })
            let portValue = 0;
            result.forEach((r, i) => {
                portValue += parseFloat(r.value);
            })
            let t: any[] = [];
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
                }
                t.push(o);
            })
            return t;
        }
        else {
            return [];
        }
    },
    getReturns: async r => {
        const { brokerage } = await init;
        let requestedUser = {} as IUserGet;
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (await execProc("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId
        }
        if (r.extra.userId === requestedId || (requestedUser?.settings?.portfolio_display.performance && requestedUser.subscription?.is_subscribed)) {
            return await brokerage.getUserReturns(r.body.userId || r.extra.userId, DateTime.fromISO(r.body.startDate as any as string), DateTime.fromISO(r.body.endDate as any as string));
        } else {
            return []
        }
    },
    getWatchlists: async r => {
        const cache = await getUserCache();
        //a tad inefficient but oh well
        const watchlist = await WatchlistApi.internal.list({
            user_id: r.extra.userId,
            data: {
                ids: cache[r.body.userId].watchlists
            }
        });
        return watchlist.filter(w => w.user_id === r.body.userId && w.type === "public")
        //make sure there are public or that you are a subscriber 
    },
    getPortfolio: async (r) => {
        const { brokerage } = await init;
        let requestedUser = {} as IUserGet;
        let requestedId;
        if (r.body.userId) {
            requestedId = r.body.userId;
            requestedUser = (await execProc("public.api_user_get", {
                user_id: r.extra.userId,
                data: {
                    id: r.body.userId
                }
            }))[0];
        }
        else {
            requestedId = r.extra.userId
        }
        if (r.extra.userId === requestedId || (requestedUser?.settings?.portfolio_display.performance && requestedUser.subscription?.is_subscribed)) {
            return await brokerage.portfolioSummaryService.getSummary(requestedId);
        }
        else {
            return {} as TradingPostAccountGroupStats;
        }
    },
    search: async (r) => {
        const cache = await getUserCache();
        const output: IUserList[] = []
        if (r.body.term.length >= 3) {
            const regex = new RegExp(r.body.term, "i");
            Object.keys(cache).forEach((id) => {
                const item = cache[id as keyof typeof cache];
                if ( /* Ensure that the user is an analyst */
                    item.profile.subscription?.id &&
                    (regex.test(item.profile.handle) || regex.test(item.profile.display_name)))
                    output.push(item.profile)
            });
        } else {
            throw new Error("Search term must be at least 3 characters");
        }
        return output;
    },
    sendEmailValidation: async (r) => {

        const authKey = await DefaultConfig.fromCacheOrSSM("authkey");

        const user = await UserApi.internal.get({
            data: { id: r.extra.userId },
            user_id: r.extra.userId
        })

        //TODO: make this token expire faster and attach this to a code ( to prevent multiple tokens from working)
        const token = jwt.sign({ verified: true }, authKey, { subject: r.extra.userId });
        console.log("About to send email..." + user.email)
        await sendByTemplate({
            to: user.email,
            templateId: "d-23c8fc09ded942d386d7c888a95a0653",
            dynamicTemplateData: {
                Weblink: (process.env.WEBLINK_BASE_URL || "https://m.tradingpostapp.com") + `/verifyaccount?token=${token}`
            }
        })
        console.log("Sent email...")
        return {}
    }
})
