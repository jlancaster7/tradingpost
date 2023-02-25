import {ensureServerExtensions} from ".";
import {DefaultConfig} from "../../../configuration";
import {PublicError} from "../static/EntityApiBase";
import Post from './Post'
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {IElasticPost, IElasticPostExt, IUserGet} from "../interfaces";
import {getPostCache, getUserCache} from "../../cache";
import {execProc, getHivePool} from '../../../db'
import ElasticService from "../../../elastic"
import TradingPostsService from "../../../social-media/tradingposts/service"
import {TradingPostsAndUsersTable} from "../../../social-media/tradingposts/interfaces"
import {DateTime} from "luxon";
import {createQueryByType} from "../../../elastic/queryCreation"

let postsPerPage = 10;

export default ensureServerExtensions<Omit<Post, "setPostsPerPage">>({
    feed: async (req) => {
        if (req.body.page === null || req.body.page === undefined)
            throw new PublicError("Invalid Request missing page", 400);

        const page = Number(req.body.page);
        const userCache = (await getUserCache());
        const curUserData = userCache[req.extra.userId];

        const postData = (await getPostCache())
        const pool = await getHivePool;
        const results = await pool.query<{ analyst_user_id: string }>(`SELECT dsp.user_id AS "analyst_user_id"
                                                                       FROM data_subscriber dsr
                                                                                LEFT JOIN data_subscription dsp
                                                                                          ON dsp.id = dsr.subscription_id
                                                                       WHERE dsr.user_id = $1`, [req.extra.userId]
        )
        const subscriptions = results.rows.map(a => a.analyst_user_id);
        subscriptions.push(req.extra.userId)
        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        const bookmarkItems: string[] = []
        if (req.body.bookmarkedOnly) {
            bookmarkItems.push(...Object.keys(curUserData.bookmarks))
            postsPerPage = bookmarkItems.length;
        } else {
            postsPerPage = 10;
        }

        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
        const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
        const elasticClient = new ElasticClient({
            cloud: {
                id: elasticConfiguration['cloudId'] as string
            },
            auth: {
                apiKey: elasticConfiguration['apiKey'] as string
            },
            maxRetries: 5,
        });
        const generalFeedData = {
            subscriptions,
            blocks: curUserData.blocked,
            selectedPlatforms: req.body.data?.platforms as string[],
            beginDateTime: req.body.data?.beginDateTime,
            endDateTime: req.body.data?.endDateTime
        }
        const response = await elasticClient.search<IElasticPost["_source"]>({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: await (async () => {
                if (req.body.postId || req.body.bookmarkedOnly) {
                    return await createQueryByType('postIds', {postIds: (req.body.postId ? [req.body.postId] : bookmarkItems)});
                } else if (req.body.userId) {
                    return await createQueryByType('user', {...generalFeedData, user_id: req.body.userId})
                } else if (req.body.data?.terms) {
                    return await createQueryByType('search', {
                        ...generalFeedData,
                        searchTerms: req.body.data.terms instanceof Array ? req.body.data.terms : [req.body.data.terms]
                    });
                } else {
                    return await createQueryByType('feed', {...generalFeedData,})
                }
            })()
        });

        //TODO::: Need to limit terms on this
        const {hits} = response.hits;
        console.log("My response has this man hits " + hits.length)
        hits.forEach((h) => {
            (h as IElasticPostExt).ext = {
                user: userCache[h._source?.user.id || ""]?.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id],
                upvoteCount: postData[h._id]?.upvotes || 0
            }
        });
        //probably could trim down the responses in the future
        return hits as IElasticPostExt[]
    },
    setBookmarked: async (rep) => {
        //TODO:  need to to add incorp into api build in the future

        const pool = await getHivePool;
        if (rep.body.is_bookmarked)
            await pool.query(`INSERT INTO data_bookmark(post_id, user_id)
                              VALUES ($1, $2)`, [rep.body.id, rep.extra.userId])
        else
            await pool.query(`DELETE
                              FROM data_bookmark
                              WHERE post_id = $1
                                and user_id = $2`, [rep.body.id, rep.extra.userId])

        return rep.body;
    },
    getUpvotes: async (rep) => {
        const pool = await getHivePool;
        const result = await pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);
        rep.body.count = result.rows[0].count;
        return rep.body;
    },
    setUpvoted: async (rep) => {
        //TODO:  need to to add incorp into api build in the future
        const pool = await getHivePool;
        if (rep.body.is_upvoted)
            await pool.query(`INSERT INTO data_upvote(post_id, user_id)
                              VALUES ($1, $2)`, [rep.body.id, rep.extra.userId])
        else
            await pool.query(`DELETE
                              FROM data_upvote
                              WHERE post_id = $1
                                and user_id = $2`, [rep.body.id, rep.extra.userId])
        const result = await pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);

        rep.body.count = result.rows[0].count;
        return rep.body;
    },
    create: async (req) => {
        const pool = await getHivePool;
        const result = await pool.query(`INSERT INTO data_post(user_id, title, body, subscription_level, max_width, aspect_ratio)
                                         VALUES ($1, $2, $3, $4, $5,
                                                 $6) RETURNING id, created_at, updated_at`, [req.extra.userId, req.body.title, req.body.content, req.body.subscription_level, req.body.width, req.body.height])
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
        const user: IUserGet = (await execProc('public.api_user_get', {
            data: {id: req.extra.userId}
        }))[0]
        const elasticService = new ElasticService(elasticClient, indexName);
        const usersAndTradingPosts: TradingPostsAndUsersTable = {
            id: result.rows[0].id,
            user_id: req.extra.userId,
            subscription_level: req.body.subscription_level,
            title: req.body.title,
            body: req.body.content,
            tradingpost_user_handle: user.handle,
            tradingpost_user_email: user.email,
            tradingpost_user_profile_url: user.profile_url || '',
            aspect_ratio: req.body.height,
            max_width: req.body.width,
            created_at: DateTime.fromJSDate(result.rows[0].created_at),
            updated_at: DateTime.fromJSDate(result.rows[0].updated_at)
        }
        await elasticService.ingest(TradingPostsService.map([usersAndTradingPosts]))


        return {}
    },
    report: async (req) => {
        const pool = await getHivePool;
        await pool.query(`
            INSERT INTO flagged_content_log (post_id, user_reporter_id, reason, status, details)
            VALUES ($1, $2, $3, $4,
                    $5) ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED", req.body.details]);
        return {};
    }
})