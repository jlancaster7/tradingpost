import { ensureServerExtensions } from ".";
import { DefaultConfig } from "../../../configuration";
import { PublicError } from "../static/EntityApiBase";
import Post from './Post'
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { IElasticPost, IElasticPostExt } from "../interfaces";
import { getUserCache } from "../../cache";
import { getHivePool } from '../static/pool'
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import PostApi from "../apis/PostApi";

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
        //console.log("New QS:" + queryString);
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
                    return userQuery(req.body.userId)
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
                is_upvoted: curUserData.upvotes[h._id]
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
    setUpvoted: async (rep) => {
        //TODO:  need to to add incorp into api build in the future 
        const pool = await getHivePool;
        if (rep.body.is_upvoted)

            await pool.query(`INSERT INTO data_upvote(post_id,user_id) VALUES($1,$2)`, [rep.body.id, rep.extra.userId])
        else
            await pool.query(`DELETE FROM data_upvote WHERE post_id= $1 and user_id = $2`, [rep.body.id, rep.extra.userId])

        return rep.body;
    }
})