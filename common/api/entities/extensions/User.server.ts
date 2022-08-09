import User, { UploadProfilePicBody } from "./User"
import { ensureServerExtensions } from "."
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import UserApi, { IUserGet, IUserList, IUserUpdate } from '../apis/UserApi'
import Brokerage from '../../../brokerage'
import { DefaultConfig } from "../../../configuration";
import pgPromise from "pg-promise";
import Finicity from "../../../finicity";
//import FinicityTransformer from '../../../brokerage/finicity/transformer'
import { execProc } from "../static/pool";
import { addTwitterUsersByToken } from '../../../social-media/twitter/index'
import { getUserCache } from "../../cache";
import WatchlistApi from "../apis/WatchlistApi";


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

const init = (async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    let brokerage: Brokerage;


    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init();
    brokerage = new Brokerage(pgClient, pgp, finicity);


    await pgClient.connect();
    return {
        brokerage,
        pgp,
        pgClient
    }
})()


export default ensureServerExtensions<User>({
    generateBrokerageLink: async (req) => {
        //TODO: make this use a better pardigm... is a pool being used? Alternatively Maybe we ensure this loads when the server gets up and running.
        const { brokerage } = await init;
        //console.log(typeof test);
        const test = await brokerage.generateBrokerageAuthenticationLink(req.extra.userId, "finicity");
        console.log(JSON.stringify(test));
        return {
            link: test

        }

    },
    uploadProfilePic: async (req) => {
        const body = req.body;
        if (req.extra.userId !== body.userId) {
            await client.send(new PutObjectCommand({
                Bucket: "tradingpost-images",
                Key: `/profile-pics/${body.userId}`,
                Body: body.image
            }));
            await UserApi.update(body.userId, {
                has_profile_pic: true
            });

        }
        else
            throw {
                message: "Unathorized",
                code: 401
            }
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
                    redirect_uri: 'http://localhost:19006/auth/twitter',
                    code_verifier: req.body.challenge
                }),

            })
            const authResp = (await info.json()) as ITokenResponse;
            const { pgClient, pgp } = await init;
            const config = await DefaultConfig.fromCacheOrSSM("twitter");
            const handle = await addTwitterUsersByToken({
                accessToken: authResp.access_token,
                expiration: authResp.expires_in,
                refreshToken: authResp.refresh_token,
                userId: req.extra.userId
            }, pgClient, pgp, config)
            return handle.username;
        }
        else return "";
    },
    getTrades: (r) => {
        return execProc("public.api_trade_list", {
            limit: r.extra.limit || 5,
            user_id: r.extra.userId,
            page: r.extra.page,
            data: { user_id: r.body.user_id }
        })
    },
    getHoldings: r => execProc("public.api_holding_list", {
        user_id: r.extra.userId,
        data: {}
    }),
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
        return await brokerage.portfolioSummaryService.getSummary(r.body.userId || r.extra.userId);
    },
    search: async (r) => {
        const cache = await getUserCache();
        const output: IUserList[] = []
        if (r.body.term.length >= 3) {
            const regex = new RegExp(r.body.term, "i");
            Object.keys(cache).forEach((id) => {
                const item = cache[id as keyof typeof cache];
                if (regex.test(item.profile.handle) || regex.test(item.profile.display_name))
                    output.push(item.profile)
            });

        }
        else {
            throw new Error("Search term must be at least 3 characters");
        }
        return output;
    }
})
