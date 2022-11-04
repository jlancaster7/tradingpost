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
import PostPrepper from "../../../post-prepper";
import { TradingPostsAndUsers, TradingPostsAndUsersTable } from "../../../social-media/tradingposts/interfaces"
import { DateTime } from "luxon";
import { Browser } from "puppeteer";

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
const feedQuery = (async () => JSON.parse(
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/feed.json",
        }))).Body)))()

const userQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/userFeed.json",
        }))).Body))()

const searchQueryTemplate = (async () =>
    await streamToString((
        await client.send(new GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/search.json",
        }))).Body))()

let postsPerPage = 10;


const bookmarkQuery = (bookmarkItems: string[]) => {
    return {
        bool: {
            must: [
                {
                    terms: {
                        id: bookmarkItems
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
/*
const userQuery = (userId: string) => {
    return {
        bool: {
            must: [
                {
                    term: {
                        "user.id": userId
                    }
                }]
        }
    }
}
*/
const userQuery = async (data: Exclude<Parameters<(typeof PostApi)["extensions"]["feed"]>["0"]["data"], undefined>) => {
    const template = await userQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ... 
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to userQeury");
        //console.log("REG EXP:::::\${" + k + "}");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace))
        console.log("New QS:" + queryString);
    });
    return JSON.parse(queryString);
}

const searchQuery = async (data: Exclude<Parameters<(typeof PostApi)["extensions"]["feed"]>["0"]["data"], undefined>) => {
    const template = await searchQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ... 
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");

        //console.log("REG EXP:::::\${" + k + "}");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace))
        console.log("New QS:" + queryString);
    });

    return JSON.parse(queryString);

}

export default ensureServerExtensions<Omit<Post, "setPostsPerPage">>({
    feed: async (req) => {
        if (req.body.page === null || req.body.page === undefined)
            throw new PublicError("Invalid Request missing page", 400);




        const page = Number(req.body.page);
        const userCache = (await getUserCache());
        const curUserData = userCache[req.extra.userId];
        const postData = (await getPostCache())



        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        const bookmarkItems: string[] = []
        if (req.body.bookmarkedOnly) {
            bookmarkItems.push(...Object.keys(curUserData.bookmarks))
            postsPerPage = bookmarkItems.length;
        }
        else {
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


        const response = await elasticClient.search<IElasticPost["_source"]>({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: await (async () => {
                if (req.body.userId) {
                    return userQuery({ user_id: req.body.userId })
                }
                else if (req.body.bookmarkedOnly)
                    return bookmarkQuery(bookmarkItems)
                else if (req.body.data)
                    return await searchQuery(req.body.data);
                else
                    return await feedQuery;
            })()

        });
        //TODO::: Need to limit terms on this 
        const { hits } = response.hits;


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
        //console.log("BOOK MARK BODY" + JSON.stringify(rep.body));
        const pool = await getHivePool;
        if (rep.body.is_bookmarked)
            await pool.query(`INSERT INTO  data_bookmark(post_id,user_id) VALUES($1,$2)`, [rep.body.id, rep.extra.userId])
        else
            await pool.query(`DELETE FROM  data_bookmark WHERE post_id= $1 and user_id = $2`, [rep.body.id, rep.extra.userId])

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
            await pool.query(`INSERT INTO data_upvote(post_id,user_id) VALUES($1,$2)`, [rep.body.id, rep.extra.userId])
        else
            await pool.query(`DELETE FROM data_upvote WHERE post_id= $1 and user_id = $2`, [rep.body.id, rep.extra.userId])
        const result = await pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);

        rep.body.count = result.rows[0].count;
        return rep.body;
    },
    create: async (req) => {
        const pool = await getHivePool;
        const result = await pool.query(`INSERT INTO data_post(user_id, title, body, subscription_level, max_width, aspect_ratio) VALUES($1,$2,$3,$4,$5,$6) RETURNING id, created_at, updated_at`, [req.extra.userId, req.body.title, req.body.content, req.body.subscription_level, req.body.width, req.body.height])        
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
    multitermfeed: async (req) => {
        if (req.body.page === null || req.body.page === undefined)
            throw new PublicError("Invalid Request missing page", 400);

        const page = Number(req.body.page);
        const userCache = (await getUserCache());
        const curUserData = userCache[req.extra.userId];

        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        
        postsPerPage = 10;
        

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
        if (req.body.data) console.log(CreateMultiTermQuery(req.body.data))
        const response = await elasticClient.search<IElasticPost["_source"]>({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: await (async () => {
                if (req.body.data) {
                    return CreateMultiTermQuery(req.body.data)
                }
                else {
                    return await feedQuery;
                }
            })()

        });
        //TODO::: Need to limit terms on this 
        const { hits } = response.hits;


        hits.forEach((h) => {
            (h as IElasticPostExt).ext = {
                user: userCache[h._source?.user.id || ""]?.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id]
            }
        });
        //probably could trim down the responses in the future
        return hits as IElasticPostExt[]
    }
})

export const CreateMultiTermQuery = (searchTerms: Record<string, string | number | (string | number)[]>) => {
    let multiMatchQueryPart= [];
    const key = Object.keys(searchTerms)[0]
    for (let d of Object.values(searchTerms[key])) {
        const queryPart = {
            "multi_match": {
                "fields": ["content.body", "content.title"],
                "query": `${d}`,
                "analyzer": "synonym_analyzer",
                "boost": 1
            }
        }
        multiMatchQueryPart.push(JSON.stringify(queryPart))
    }
    let query = `{"bool": {
        "should": [
        {
            "function_score": {
                "query": { 
                "bool": {
                    "must": [
                        {
                        "bool": {
                            "should": [${multiMatchQueryPart}],
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                            }
                        ,
                        {
                            "match": {
                            "postType": "youtube"
                        }}
                        ]
                }
                },
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                "bool": {
                    "must": [
                        {
                        "bool": {
                            "should": [${multiMatchQueryPart}],
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                            }
                        ,
                        {
                            "match": {
                            "postType": "tweet"
                        }}
                        ]
                }},
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "12h"
                        }
                    },
                    "weight": 1
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                "bool": {
                    "must": [
                        {
                        "bool": {
                            "should": [${multiMatchQueryPart}],
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                            }
                        ,
                        {
                            "match": {
                            "postType": "substack"
                        }}
                        ]
                }},
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        },
        {
            "function_score": {
                "query": { 
                "bool": {
                    "must": [
                        {
                        "bool": {
                            "should": [${multiMatchQueryPart}],
                                "minimum_should_match": 1,
                                "boost": 1
                            }
                            }
                        ,
                        {
                            "match": {
                            "postType": "spotify"
                        }}
                        ]
                }},
                "functions": [
                    {
                    "exp": {
                        "platformCreatedAt": {
                        "origin": "now",
                        "scale": "7d"
                        }
                    },
                    "weight": 1.2
                    }
                ],
                "boost_mode": "replace"
            }
        }
        ],
        "minimum_should_match": 1,
        "boost": 1
    }
    }
`    
    //console.log(query)
    //console.log(query.bool.should[0].function_score.query.bool.must[0].bool?.should)
    return JSON.parse(query);
    
} 




