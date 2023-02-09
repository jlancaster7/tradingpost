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
const typeMainFeedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeMainFeedQuery.json",
    }))).Body);
}))();
const typeUserQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeUserQuery.json",
    }))).Body);
}))();
const typeSearchSubQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeSearchSubQuery.json",
    }))).Body);
}))();
const typeSearchQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/typeSearchQuery.json",
    }))).Body);
}))();
const platformQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/platformQueryv3.json",
    }))).Body);
}))();
const platformQueryParameters = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/platformQueryParametersv1.json",
    }))).Body);
}))();
const feedQueryTemplate = (() => __awaiter(void 0, void 0, void 0, function* () {
    return yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
        Bucket: s3Bucket,
        Key: "post-query-templates/feedv9.json",
    }))).Body);
}))();
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
const insertParamsIntoTemplate = (template, data) => {
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array) && !(dataToReplace instanceof Object))
            throw new Error("Invalid data passed to query template");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
    });
    return JSON.parse(queryString);
};
const createPlatformQueryByType = (template, templateData, selectedPlatforms) => __awaiter(void 0, void 0, void 0, function* () {
    let platformQueries = [];
    const platformParameters = JSON.parse(yield platformQueryParameters);
    const allPlatforms = Object.keys(platformParameters);
    for (let d of (selectedPlatforms.length ? selectedPlatforms : allPlatforms)) {
        d = d === 'Twitter' ? 'tweet' : d;
        const typeSpecificQuery = insertParamsIntoTemplate(template, Object.assign({ platform: d.toLocaleLowerCase() }, templateData));
        const platformQueryPart = insertParamsIntoTemplate(yield platformQueryTemplate, Object.assign(Object.assign({ typeSpecificQuery }, templateData), { platformOrigin: platformParameters[d.toLocaleLowerCase()].origin, platformScale: platformParameters[d.toLocaleLowerCase()].scale, platformWeight: platformParameters[d.toLocaleLowerCase()].weight }));
        platformQueries.push(platformQueryPart);
    }
    return platformQueries;
});
const createQueryByType = (type, data) => __awaiter(void 0, void 0, void 0, function* () {
    const selectedPlatforms = data.selectedPlatforms || [];
    const subscriptions = data.subscriptions || [];
    const blocks = data.blocks || [];
    const templateData = {
        subscriptions,
        blocks
    };
    if (type === 'postIds') {
        return bookmarkQuery(data.postIds);
    }
    else if (type === 'user') {
        const platformQueries = yield createPlatformQueryByType(yield typeUserQueryTemplate, Object.assign({ user_id: data.user_id }, templateData), selectedPlatforms);
        return insertParamsIntoTemplate(yield feedQueryTemplate, { platformQueries, subscriptions: data.subscriptions });
    }
    else if (type === 'search') {
        const searchSubQuery = [];
        data.searchTerms.forEach((el) => __awaiter(void 0, void 0, void 0, function* () {
            searchSubQuery.push(insertParamsIntoTemplate(yield typeSearchSubQueryTemplate, { searchTerm: el }));
        }));
        const platformQueries = yield createPlatformQueryByType(yield typeSearchQueryTemplate, Object.assign({ typeSearchSubQuery: searchSubQuery }, templateData), selectedPlatforms);
        return insertParamsIntoTemplate(yield feedQueryTemplate, { platformQueries, subscriptions: data.subscriptions });
    }
    else {
        const platformQueries = yield createPlatformQueryByType(yield typeMainFeedQueryTemplate, Object.assign({}, templateData), selectedPlatforms);
        return insertParamsIntoTemplate(yield feedQueryTemplate, { platformQueries, subscriptions: data.subscriptions });
    }
});
let postsPerPage = 10;
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
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                if (req.body.postId || req.body.bookmarkedOnly) {
                    return yield createQueryByType('postIds', { postIds: (req.body.postId ? [req.body.postId] : bookmarkItems) });
                }
                else if (req.body.userId) {
                    return yield createQueryByType('user', { user_id: req.body.userId, subscriptions: subscriptions, blocks: curUserData.blocked });
                }
                else if (req.body.bookmarkedOnly) {
                    return yield createQueryByType('postIds', { bookmarkItems });
                }
                else if ((_a = req.body.data) === null || _a === void 0 ? void 0 : _a.terms) {
                    return yield createQueryByType('search', { searchTerms: req.body.data.terms instanceof Array ? req.body.data.terms : [req.body.data.terms], subscriptions: subscriptions, blocks: curUserData.blocked });
                }
                else {
                    return yield createQueryByType('feed', { subscriptions, blocks: curUserData.blocked, selectedPlatforms: (_b = req.body.data) === null || _b === void 0 ? void 0 : _b.platforms });
                }
            }))()
        });
        //TODO::: Need to limit terms on this
        const { hits } = response.hits;
        console.log("My response has this man hits " + hits.length);
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
    report: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        yield pool.query(`
                INSERT INTO flagged_content_log (post_id, user_reporter_id, reason, status, details)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED", req.body.details]);
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHdCQUEyQztBQUMzQywwREFBdUQ7QUFDdkQsMkRBQXNEO0FBRXRELDBEQUFpRTtBQUVqRSx1Q0FBeUQ7QUFDekQsb0NBQW1EO0FBQ25ELGtEQUFnRTtBQUVoRSwrREFBNkM7QUFDN0MseUZBQTRFO0FBRTVFLGlDQUFpQztBQUVqQyxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFRLENBQUM7SUFDMUIsTUFBTSxFQUFFLFdBQVc7Q0FDcEIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFXLEVBQUUsRUFBRSxDQUNyQyxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QyxNQUFNLE1BQU0sR0FBVSxFQUFFLENBQUM7SUFDekIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLENBQUMsQ0FBQyxDQUFDO0FBRUwsTUFBTSxRQUFRLEdBQUcsc0JBQXNCLENBQUE7QUFFdkMsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLEdBQVMsRUFBRTtJQUMxQyxPQUFBLE1BQU0sY0FBYyxDQUFDLENBQ3JCLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDO1FBQ25DLE1B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