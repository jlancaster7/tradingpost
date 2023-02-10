import { ensureServerExtensions } from ".";
import { DefaultConfig } from "../../../configuration";
import { PublicError } from "../static/EntityApiBase";
import Post from './Post'
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { IElasticPost, IElasticPostExt, IUserGet } from "../interfaces";
import { getPostCache, getUserCache } from "../../cache";
import { execProc, getHivePool } from '../../../db'
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import PostApi from "../apis/PostApi";
import ElasticService from "../../../elastic"
import TradingPostsService from "../../../social-media/tradingposts/service"
import { TradingPostsAndUsersTable } from "../../../social-media/tradingposts/interfaces"
import { DateTime } from "luxon";

const client = new S3Client({
  region: "us-east-1"
});

const streamToString = (stream: any) =>
  new Promise<string>((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

const s3Bucket = 'tradingpost-app-data'

const typeMainFeedQueryTemplate = (async () =>
    await streamToString((
    await client.send(new GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeMainFeedQuery.json",
    }))).Body))()
const typeUserQueryTemplate = (async () =>
    await streamToString((
    await client.send(new GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeUserQuery.json",
    }))).Body))()
const typeSearchSubQueryTemplate = (async () =>
    await streamToString((
    await client.send(new GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeSearchSubQuery.json",
    }))).Body))()
const typeSearchQueryTemplate = (async () =>
    await streamToString((
    await client.send(new GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeSearchQuery.json",
    }))).Body))()
const platformQueryTemplate = (async () =>
  await streamToString((
    await client.send(new GetObjectCommand({
      Bucket: s3Bucket,
      Key: "post-query-templates/platformQueryv3.json",
    }))).Body))()
const platformQueryParameters = (async () =>
  await streamToString((
    await client.send(new GetObjectCommand({
      Bucket: s3Bucket,
      Key: "post-query-templates/platformQueryParametersv1.json",
    }))).Body))()
const feedQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feedv9.json",
        }))).Body))()


const bookmarkQuery = (bookmarkItems: string[]) => {
    return {
      bool: {
        must: [
          {
            terms: {
              _id: bookmarkItems
            }
          },
          {
            exists: {
              "field": "size"
            }
          }]
      }
    }
  }

  const insertParamsIntoTemplate = (template: string, data: Record<string, any>) => {
    
    let queryString = template;
    Object.keys(data).forEach((k) => {
      //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
      const dataToReplace = data[k];
      const dt = typeof dataToReplace;
      
      if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array) && !(dataToReplace instanceof Object))
        throw new Error("Invalid data passed to query template");
      queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace))
  
    });
    return JSON.parse(queryString);
  }

const createPlatformQueryByType = async (template: string, templateData: any, selectedPlatforms: string[]) => {
    let platformQueries: any[] = [];
    const platformParameters = JSON.parse(await platformQueryParameters);
    const allPlatforms = Object.keys(platformParameters);

    for (let d of (selectedPlatforms.length ? selectedPlatforms : allPlatforms)) {
        d = d === 'Twitter' ? 'tweet' : d;
        
        const typeSpecificQuery = insertParamsIntoTemplate(template, {platform: d.toLocaleLowerCase(), ...templateData});
        const platformQueryPart = insertParamsIntoTemplate(await platformQueryTemplate, {
            typeSpecificQuery, 
            ...templateData,
            platformOrigin: platformParameters[d.toLocaleLowerCase()].origin,
            platformScale: platformParameters[d.toLocaleLowerCase()].scale,
            platformWeight: platformParameters[d.toLocaleLowerCase()].weight
            });
          platformQueries.push(platformQueryPart);
    }
    return platformQueries;
}
const createQueryByType = async (type: string, data: any) => {
    
    
    const selectedPlatforms = data.selectedPlatforms || []
    const beginDateTime = data.beginDateTime || new Date('1/1/2000')
    const endDateTime = data.beginDateTime || new Date()
    const subscriptions = data.subscriptions || []
    const blocks = data.blocks || []
    const templateData = {
        subscriptions,
        blocks
    }
    if (type === 'postIds') {
        return bookmarkQuery(data.postIds)
    }
    else if (type === 'user') {       
        const platformQueries = await createPlatformQueryByType(await typeUserQueryTemplate, {user_id: data.user_id, ...templateData}, selectedPlatforms)
        return insertParamsIntoTemplate(await feedQueryTemplate, {platformQueries, subscriptions: data.subscriptions, beginDateTime, endDateTime})
    }
    else if (type === 'search') {
        const searchSubQuery: string[] = []
        data.searchTerms.forEach(async(el: string) => {
            searchSubQuery.push(insertParamsIntoTemplate(await typeSearchSubQueryTemplate, {searchTerm: el}))
        })
        const platformQueries = await createPlatformQueryByType(await typeSearchQueryTemplate, {typeSearchSubQuery: searchSubQuery, ...templateData}, selectedPlatforms)
        return insertParamsIntoTemplate(await feedQueryTemplate, {platformQueries, subscriptions: data.subscriptions, beginDateTime, endDateTime})
    }
    else {
        const platformQueries = await createPlatformQueryByType(await typeMainFeedQueryTemplate, {...templateData}, selectedPlatforms)
        return insertParamsIntoTemplate(await feedQueryTemplate, {platformQueries, subscriptions: data.subscriptions, beginDateTime, endDateTime})
    }   
}
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
        console.log('using right feed')
        const response = await elasticClient.search<IElasticPost["_source"]>({
        index: indexName,
        size: postsPerPage,
        from: page * postsPerPage,
        query: await (async () => {
            if (req.body.postId || req.body.bookmarkedOnly) {
              return await createQueryByType('postIds', {postIds: (req.body.postId ? [req.body.postId] : bookmarkItems)});
            } else if (req.body.userId) {
              return await createQueryByType('user', { ...generalFeedData, user_id: req.body.userId })
            } else if (req.body.bookmarkedOnly) {
              return await createQueryByType('postIds', {bookmarkItems});
            } else if (req.body.data?.terms) {
              return await createQueryByType('search', { ...generalFeedData, searchTerms: req.body.data.terms instanceof Array ? req.body.data.terms : [req.body.data.terms] });
            } else {
              return await createQueryByType('feed', {...generalFeedData,})
            }
        })()
        });

        //TODO::: Need to limit terms on this
        const { hits } = response.hits;
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
                                            VALUES ($1, $2, $3, $4, $5, $6)
                                            RETURNING id, created_at, updated_at`, [req.extra.userId, req.body.title, req.body.content, req.body.subscription_level, req.body.width, req.body.height])
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
        data: { id: req.extra.userId }
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
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED", req.body.details]);
        return {};
    }
})