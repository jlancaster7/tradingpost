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
exports.CreateMultiTermQuery = exports.createNewFeedQuery = void 0;
const _1 = require(".");
const configuration_1 = require("../../../configuration");
const EntityApiBase_1 = require("../static/EntityApiBase");
const elasticsearch_1 = require("@elastic/elasticsearch");
const cache_1 = require("../../cache");
const db_1 = require("../../../db");
const client_s3_1 = require("@aws-sdk/client-s3");
const elastic_1 = __importDefault(require("../../../elastic"));
const service_1 = __importDefault(require("../../../social-media/tradingposts/service"));
const luxon_1 = require("luxon");
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
const userQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/userFeedv3.json",
    }))).Body);
}))();
const searchQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/searchv3.json",
    }))).Body);
}))();
const feedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feedv6.json",
    }))).Body);
}))();
const newFeedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feedv7.json",
    }))).Body);
}))();
const platformQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/platformQueryv1.json",
    }))).Body);
}))();
const platformQueryParameters = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/platformQueryParametersv1.json",
    }))).Body);
}))();
const multipartFeedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/multipartFeedv1.json",
    }))).Body);
}))();
let postsPerPage = 10;
const bookmarkQuery = (bookmarkItems) => {
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
                }
            ]
        }
    };
};
const userQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield userQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to userQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
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
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const platformQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield platformQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to platformQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const feedQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield feedQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to feedQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const newFeedQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield newFeedQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to newFeedQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
});
const multipartFeedQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield multipartFeedQueryTemplate;
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to multipartQeury");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
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
        const pool = yield db_1.getHivePool;
        const results = yield pool.query(`SELECT dsp.user_id AS "analyst_user_id"
                                                                       FROM data_subscriber dsr
                                                                                LEFT JOIN data_subscription dsp
                                                                                          ON dsp.id = dsr.subscription_id
                                                                       WHERE dsr.user_id = $1`, [req.extra.userId]);
        const subscriptions = results.rows.map(a => a.analyst_user_id);
        subscriptions.push(req.extra.userId);
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
        console.log(req.body.data);
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                if (req.body.postId) {
                    return { "ids": { "values": [req.body.postId] } };
                }
                else if (req.body.userId) {
                    //return searchQuery({user_id: req.body.userId})
                    return userQuery({ user_id: req.body.userId, subscriptions: subscriptions });
                }
                else if (req.body.bookmarkedOnly) {
                    const query = bookmarkQuery(bookmarkItems);
                    return query;
                }
                else if ((_a = req.body.data) === null || _a === void 0 ? void 0 : _a.terms)
                    return searchQuery({ terms: req.body.data.terms, subscriptions: subscriptions, blocks: curUserData.blocked });
                else
                    return (0, exports.createNewFeedQuery)(subscriptions, curUserData.blocked, (_b = req.body.data) === null || _b === void 0 ? void 0 : _b.platforms);
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
        const pool = yield db_1.getHivePool;
        if (rep.body.is_bookmarked)
            yield pool.query(`INSERT INTO data_bookmark(post_id, user_id)
                              VALUES ($1, $2)`, [rep.body.id, rep.extra.userId]);
        else
            yield pool.query(`DELETE
                              FROM data_bookmark
                              WHERE post_id = $1
                                and user_id = $2`, [rep.body.id, rep.extra.userId]);
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
            yield pool.query(`INSERT INTO data_upvote(post_id, user_id)
                              VALUES ($1, $2)`, [rep.body.id, rep.extra.userId]);
        else
            yield pool.query(`DELETE
                              FROM data_upvote
                              WHERE post_id = $1
                                and user_id = $2`, [rep.body.id, rep.extra.userId]);
        const result = yield pool.query('SELECT count(post_id) from data_upvote where post_id = $1', [rep.body.id]);
        rep.body.count = result.rows[0].count;
        return rep.body;
    }),
    create: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const result = yield pool.query(`INSERT INTO data_post(user_id, title, body, subscription_level, max_width, aspect_ratio)
                                         VALUES ($1, $2, $3, $4, $5, $6)
                                         RETURNING id, created_at, updated_at`, [req.extra.userId, req.body.title, req.body.content, req.body.subscription_level, req.body.width, req.body.height]);
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
        const user = (yield (0, db_1.execProc)('public.api_user_get', {
            data: { id: req.extra.userId }
        }))[0];
        const elasticService = new elastic_1.default(elasticClient, indexName);
        const usersAndTradingPosts = {
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
            created_at: luxon_1.DateTime.fromJSDate(result.rows[0].created_at),
            updated_at: luxon_1.DateTime.fromJSDate(result.rows[0].updated_at)
        };
        yield elasticService.ingest(service_1.default.map([usersAndTradingPosts]));
        return {};
    }),
    multitermfeed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.page === null || req.body.page === undefined)
            throw new EntityApiBase_1.PublicError("Invalid Request missing page", 400);
        const page = Number(req.body.page);
        const userCache = (yield (0, cache_1.getUserCache)());
        const curUserData = userCache[req.extra.userId];
        const pool = yield db_1.getHivePool;
        const results = yield pool.query(`SELECT dsp.user_id AS "analyst_user_id"
                                                                       FROM data_subscriber dsr
                                                                                LEFT JOIN data_subscription dsp
                                                                                          ON dsp.id = dsr.subscription_id
                                                                       WHERE dsr.user_id = $1`, [req.extra.userId]);
        const subscriptions = results.rows.map(a => a.analyst_user_id);
        subscriptions.push(req.extra.userId);
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
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                if (req.body.data) {
                    return (0, exports.CreateMultiTermQuery)(req.body.data, subscriptions, curUserData.blocked);
                }
                else {
                    return feedQuery({ subscriptions, blocks: curUserData.blocked });
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
    }),
    report: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        yield pool.query(`
            INSERT INTO flagged_content_log (post_id, user_reporter_id, reason, status, details)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED", req.body.details]);
        return {};
    })
});
const createNewFeedQuery = (subscriptions, blocks, selectedPlatforms) => __awaiter(void 0, void 0, void 0, function* () {
    let platformQueries = [];
    const platformParameters = JSON.parse(yield platformQueryParameters);
    const allPlatforms = Object.keys(platformParameters);
    for (let d of (selectedPlatforms || allPlatforms)) {
        d = d === 'Twitter' ? 'tweet' : d;
        const platformQueryPart = yield platformQuery({
            platform: d.toLocaleLowerCase(),
            subscriptions,
            blocks,
            platformOrigin: platformParameters[d.toLocaleLowerCase()].origin,
            platformScale: platformParameters[d.toLocaleLowerCase()].scale,
            platformWeight: platformParameters[d.toLocaleLowerCase()].weight
        });
        platformQueries.push(platformQueryPart);
    }
    return newFeedQuery({ platformQuery: platformQueries });
});
exports.createNewFeedQuery = createNewFeedQuery;
const CreateMultiTermQuery = (searchTerms, subscriptions, blocks) => {
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
        multiMatchQueryPart.push(queryPart);
    }
    return multipartFeedQuery({ multiMatchQueryPart, subscriptions, blocks });
};
exports.CreateMultiTermQuery = CreateMultiTermQuery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBMkM7QUFDM0MsMERBQXVEO0FBQ3ZELDJEQUFzRDtBQUV0RCwwREFBaUU7QUFFakUsdUNBQXlEO0FBQ3pELG9DQUFtRDtBQUNuRCxrREFBZ0U7QUFFaEUsK0RBQTZDO0FBQzdDLHlGQUE0RTtBQUU1RSxpQ0FBaUM7QUFFakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQzFCLE1BQU0sRUFBRSxXQUFXO0NBQ3BCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDckMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUMsQ0FBQztBQUVMLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBRXZDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFTLEVBQUU7SUFDcEMsT0FBQSxNQUFNLGNBQWMsQ0FBQyxDQUNuQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQztRQUNyQyxN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