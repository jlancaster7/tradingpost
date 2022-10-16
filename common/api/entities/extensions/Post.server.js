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
exports.CreateMultiTermQuery = void 0;
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
            var _a, _b, _c;
            h.ext = {
                user: (_b = userCache[((_a = h._source) === null || _a === void 0 ? void 0 : _a.user.id) || ""]) === null || _b === void 0 ? void 0 : _b.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id],
                upvoteCount: ((_c = postData[h._id]) === null || _c === void 0 ? void 0 : _c.upvotes) || 0
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
    }),
    multitermfeed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.page === null || req.body.page === undefined)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        const userCache = (yield (0, cache_1.getUserCache)());
        const curUserData = userCache[req.extra.userId];
        //TODO::::Need to think through how this is sorted in the future... and make this less stupid..
        postsPerPage = 10;
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
        if (req.body.data)
            console.log((0, exports.CreateMultiTermQuery)(req.body.data));
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                if (req.body.data) {
                    return (0, exports.CreateMultiTermQuery)(req.body.data);
                }
                else {
                    return yield feedQuery;
                }
            }))()
        });
        //TODO::: Need to limit terms on this 
        const { hits } = response.hits;
        hits.forEach((h) => {
            var _a, _b;
            h.ext = {
                user: (_b = userCache[((_a = h._source) === null || _a === void 0 ? void 0 : _a.user.id) || ""]) === null || _b === void 0 ? void 0 : _b.profile,
                is_bookmarked: curUserData.bookmarks[h._id],
                is_upvoted: curUserData.upvotes[h._id]
            };
        });
        //probably could trim down the responses in the future
        return hits;
    })
});
const CreateMultiTermQuery = (searchTerms) => {
    //if (typeof searchTerms === 'string' || typeof searchTerms === 'number') searchTerms = [searchTerms];
    let multiMatchQueryPart = [];
    const key = Object.keys(searchTerms)[0];
    for (let d of Object.values(searchTerms[key])) {
        const queryPart = {
            "multi_match": {
                "fields": ["content.body", "content.title"],
                "query": `${d}`,
                "analyzer": "synonym_analyzer",
                "boost": 1
            }
        };
        //console.log(JSON.stringify(queryPart))
        multiMatchQueryPart.push(JSON.stringify(queryPart));
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
`;
    //console.log(query)
    //console.log(query.bool.should[0].function_score.query.bool.must[0].bool?.should)
    return JSON.parse(query);
};
exports.CreateMultiTermQuery = CreateMultiTermQuery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSx3QkFBMkM7QUFDM0MsMERBQXVEO0FBQ3ZELDJEQUFzRDtBQUV0RCwwREFBaUU7QUFFakUsdUNBQXlEO0FBQ3pELG9DQUF5QztBQUN6QyxrREFBZ0U7QUFHaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDcEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUMsQ0FBQztBQUVQLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBUyxFQUFFO0lBQUMsT0FBQSxJQUFJLENBQUMsS0FBSyxDQUNyQyxNQUFNLGNBQWMsQ0FBQyxDQUNqQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQztRQUNuQyxNQUFNLEVBQUUsUUFBUTtRQUNoQixHQUFH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