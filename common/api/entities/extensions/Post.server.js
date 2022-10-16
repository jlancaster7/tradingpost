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
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const configuration_1 = require("../../../configuration");
const EntityApiBase_1 = require("../static/EntityApiBase");
const elasticsearch_1 = require("@elastic/elasticsearch");
const cache_1 = require("../../cache");
const db_1 = require("../../../db");
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});
const s3Bucket = 'tradingpost-app-data';
const feedQuery = (() => __awaiter(void 0, void 0, void 0, function* () {
    return JSON.parse(yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feed.json",
    }))).Body));
}))();
const userQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/userFeed.json",
    }))).Body);
}))();
const searchQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/search.json",
    }))).Body);
}))();
let postsPerPage = 10;
const bookmarkQuery = (bookmarkItems) => {
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
                }
            ]
        }
    };
};
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
const userQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield userQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ... 
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to userQeury");
        //console.log("REG EXP:::::\${" + k + "}");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
        console.log("New QS:" + queryString);
    });
    return JSON.parse(queryString);
});
const searchQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield searchQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ... 
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");
        //console.log("REG EXP:::::\${" + k + "}");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
        console.log("New QS:" + queryString);
    });
    return JSON.parse(queryString);
});
exports.default = (0, _1.ensureServerExtensions)({
    feed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.page === null || req.body.page === undefined)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        const userCache = (yield (0, cache_1.getUserCache)());
        const curUserData = userCache[req.extra.userId];
        const postData = (yield (0, cache_1.getPostCache)());
        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        const bookmarkItems = [];
        if (req.body.bookmarkedOnly) {
            bookmarkItems.push(...Object.keys(curUserData.bookmarks));
            postsPerPage = bookmarkItems.length;
        }
        else {
            postsPerPage = 10;
        }
        if (page * postsPerPage + 20 > 10000)
            return [];
        const indexName = "tradingpost-search";
        const elasticConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("elastic");
        const elasticClient = new elasticsearch_1.Client({
            cloud: {
                id: elasticConfiguration['cloudId']
            },
            auth: {
                apiKey: elasticConfiguration['apiKey']
            },
            maxRetries: 5,
        });
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                if (req.body.userId) {
                    return userQuery({ user_id: req.body.userId });
                }
                else if (req.body.bookmarkedOnly)
                    return bookmarkQuery(bookmarkItems);
                else if (req.body.data)
                    return yield searchQuery(req.body.data);
                else
                    return yield feedQuery;
            }))()
        });
        //TODO::: Need to limit terms on this 
        const { hits } = response.hits;
        hits.forEach((h) => {
            var _a, _b;
            h.ext = {
                user: (_b = userCache[((_a = h._source) === null || _a === void 0 ? void 0 : _a.user.id) || ""]) === null || _b === void 0 ? void 0 : _b.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id],
                upvoteCount: postData[h._id].upvotes || 0
            };
        });
        //probably could trim down the responses in the future
        return hits;
    }),
    setBookmarked: (rep) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO:  need to to add incorp into api build in the future 
        //console.log("BOOK MARK BODY" + JSON.stringify(rep.body));
        const pool = yield db_1.getHivePool;
        if (rep.body.is_bookmarked)
            yield pool.query(`INSERT INTO  data_bookmark(post_id,user_id) VALUES($1,$2)`, [rep.body.id, rep.extra.userId]);
        else
            yield pool.query(`DELETE FROM  data_bookmark WHERE post_id= $1 and user_id = $2`, [rep.body.id, rep.extra.userId]);
        return rep.body;
    }),
    getUpvotes: (rep) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const result = yield pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);
        rep.body.count = result.rows[0].count;
        return rep.body;
    }),
    setUpvoted: (rep) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO:  need to to add incorp into api build in the future 
        const pool = yield db_1.getHivePool;
        if (rep.body.is_upvoted)
            yield pool.query(`INSERT INTO data_upvote(post_id,user_id) VALUES($1,$2)`, [rep.body.id, rep.extra.userId]);
        else
            yield pool.query(`DELETE FROM data_upvote WHERE post_id= $1 and user_id = $2`, [rep.body.id, rep.extra.userId]);
        const result = yield pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);
        rep.body.count = result.rows[0].count;
        return rep.body;
    }),
    create: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        yield pool.query(`INSERT INTO data_internal_post(user_id, title, content) VALUES($1,$2,$3)`, [req.extra.userId, req.body.title, req.body.content]);
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHdCQUEyQztBQUMzQywwREFBdUQ7QUFDdkQsMkRBQXNEO0FBRXRELDBEQUFpRTtBQUVqRSx1Q0FBeUQ7QUFDekQsb0NBQXlDO0FBQ3pDLGtEQUFnRTtBQUdoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDeEIsTUFBTSxFQUFFLFdBQVc7Q0FDdEIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFXLEVBQUUsRUFBRSxDQUNuQyxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUNwQyxNQUFNLE1BQU0sR0FBVSxFQUFFLENBQUM7SUFDekIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVFLENBQUMsQ0FBQyxDQUFDO0FBRVAsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUE7QUFDdkMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFTLEVBQUU7SUFBQyxPQUFBLElBQUksQ0FBQyxLQUFLLENBQ3JDLE1BQU0sY0FBYyxDQUFDLENBQ2pCLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDO1FBQ25DLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEdBQUcs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