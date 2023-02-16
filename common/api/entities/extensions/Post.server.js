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
exports.createQueryByType = void 0;
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
    const beginDateTime = (data.beginDateTime ? new Date(data.beginDateTime) : new Date('1/1/2000')).toISOString();
    const endDateTime = (data.endDateTime ? new Date(data.endDateTime) : new Date(Date.now())).toISOString();
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
        return insertParamsIntoTemplate(yield feedQueryTemplate, {
            platformQueries,
            subscriptions: data.subscriptions,
            beginDateTime,
            endDateTime
        });
    }
    else if (type === 'search') {
        const searchSubQuery = [];
        data.searchTerms.forEach((el) => __awaiter(void 0, void 0, void 0, function* () {
            searchSubQuery.push(insertParamsIntoTemplate(yield typeSearchSubQueryTemplate, { searchTerm: el }));
        }));
        const platformQueries = yield createPlatformQueryByType(yield typeSearchQueryTemplate, Object.assign({ typeSearchSubQuery: searchSubQuery }, templateData), selectedPlatforms);
        return insertParamsIntoTemplate(yield feedQueryTemplate, {
            platformQueries,
            subscriptions: data.subscriptions,
            beginDateTime,
            endDateTime
        });
    }
    else {
        const platformQueries = yield createPlatformQueryByType(yield typeMainFeedQueryTemplate, Object.assign({}, templateData), selectedPlatforms);
        return insertParamsIntoTemplate(yield feedQueryTemplate, {
            platformQueries,
            subscriptions: data.subscriptions,
            beginDateTime,
            endDateTime
        });
    }
});
exports.createQueryByType = createQueryByType;
let postsPerPage = 10;
exports.default = (0, _1.ensureServerExtensions)({
    feed: (req) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
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
        const generalFeedData = {
            subscriptions,
            blocks: curUserData.blocked,
            selectedPlatforms: (_a = req.body.data) === null || _a === void 0 ? void 0 : _a.platforms,
            beginDateTime: (_b = req.body.data) === null || _b === void 0 ? void 0 : _b.beginDateTime,
            endDateTime: (_c = req.body.data) === null || _c === void 0 ? void 0 : _c.endDateTime
        };
        const response = yield elasticClient.search({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: yield (() => __awaiter(void 0, void 0, void 0, function* () {
                var _d;
                if (req.body.postId || req.body.bookmarkedOnly) {
                    return yield (0, exports.createQueryByType)('postIds', { postIds: (req.body.postId ? [req.body.postId] : bookmarkItems) });
                }
                else if (req.body.userId) {
                    return yield (0, exports.createQueryByType)('user', Object.assign(Object.assign({}, generalFeedData), { user_id: req.body.userId }));
                }
                else if ((_d = req.body.data) === null || _d === void 0 ? void 0 : _d.terms) {
                    return yield (0, exports.createQueryByType)('search', Object.assign(Object.assign({}, generalFeedData), { searchTerms: req.body.data.terms instanceof Array ? req.body.data.terms : [req.body.data.terms] }));
                }
                else {
                    return yield (0, exports.createQueryByType)('feed', Object.assign({}, generalFeedData));
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
                                         VALUES ($1, $2, $3, $4, $5,
                                                 $6) RETURNING id, created_at, updated_at`, [req.extra.userId, req.body.title, req.body.content, req.body.subscription_level, req.body.width, req.body.height]);
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
            VALUES ($1, $2, $3, $4,
                    $5) ON CONFLICT DO NOTHING`, [req.body.postId, req.extra.userId, req.body.reason, "REPORTED", req.body.details]);
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQb3N0LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFDekMsMERBQXFEO0FBQ3JELDJEQUFvRDtBQUVwRCwwREFBK0Q7QUFFL0QsdUNBQXVEO0FBQ3ZELG9DQUFpRDtBQUNqRCxrREFBOEQ7QUFFOUQsK0RBQTZDO0FBQzdDLHlGQUE0RTtBQUU1RSxpQ0FBK0I7QUFFL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDcEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUMsQ0FBQztBQUVQLE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBRXZDLE1BQU0seUJBQXlCLEdBQUcsQ0FBQyxHQUFTLEVBQUU7SUFDMUMsT0FBQSxNQUFNLGNBQWMsQ0FBQyxDQUNqQixNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBZ0IsQ0FBQztRQUNuQyxN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