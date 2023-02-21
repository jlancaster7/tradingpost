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
exports.cacheMonitor = exports.getPostCache = exports.getUserCache = exports.getPriceCacheTask = void 0;
const BookmarkApi_1 = __importDefault(require("./entities/apis/BookmarkApi"));
const UpvoteApi_1 = __importDefault(require("./entities/apis/UpvoteApi"));
const UserApi_1 = __importDefault(require("./entities/apis/UserApi"));
const PostApi_1 = __importDefault(require("./entities/apis/PostApi"));
const WatchlistApi_1 = __importDefault(require("./entities/apis/WatchlistApi"));
const BlockListApi_1 = __importDefault(require("./entities/apis/BlockListApi"));
const WatchlistSavedApi_1 = __importDefault(require("./entities/apis/WatchlistSavedApi"));
const db_1 = require("../db");
const SubscriptionApi_1 = __importDefault(require("./entities/apis/SubscriptionApi"));
const caches = { user: {}, price: { byTicker: {} }, post: {} };
const existsCache = (allRecords, matchKey, matchValue, cacheKey) => {
    const rcd = {};
    allRecords.filter((r) => r[matchKey] === matchValue).forEach((r) => {
        rcd[String(r[cacheKey])] = true;
    });
    return rcd;
};
const idCache = (allRecords, matcher, cacheKey) => {
    return allRecords.filter((r) => typeof matcher === "function" ? matcher(r) : r[matcher.matchKey] === matcher.matchValue).map((r) => r[cacheKey]);
};
//TODO: Should write a little local hook for the client that get notified when there are updates to keep components in sync if they are using it 
let userCacheInit = (() => __awaiter(void 0, void 0, void 0, function* () {
    const [users, bookmarks, upvotes, watchlists, watchlistSaved, blockList] = yield Promise.all([UserApi_1.default.internal.list(),
        BookmarkApi_1.default.internal.list(),
        UpvoteApi_1.default.internal.list(),
        WatchlistApi_1.default.internal.list(),
        WatchlistSavedApi_1.default.internal.list(),
        BlockListApi_1.default.internal.list()
    ]);
    caches.user = {};
    users.forEach((u) => {
        caches.user[u.id] = {
            profile: u,
            bookmarks: existsCache(bookmarks, "user_id", u.id, "post_id"),
            upvotes: existsCache(upvotes, "user_id", u.id, "post_id"),
            watchlists: [
                ...idCache(watchlists, { matchKey: "user_id", matchValue: u.id }, "id"),
                ...idCache(watchlistSaved, { matchKey: "user_id", matchValue: u.id }, "watchlist_id")
            ],
            blocked: idCache(blockList, { matchKey: "blocked_by_id", matchValue: u.id }, "blocked_user_id"),
            // bookmarks: (() => {
            //     const rcd: ExistsRecord = {}
            //     bookmarks.filter((b) => b.user_id === u.id).forEach((b) => {
            //         rcd[b.post_id] = true;
            //     })
            //     return rcd;
            // })(),
        };
    });
    upvotes.forEach((v) => {
        const record = caches.post[v.post_id] || (caches.post[v.post_id] = { upvotes: 0 });
        record.upvotes += 1;
    });
}))();
exports.getPriceCacheTask = (() => __awaiter(void 0, void 0, void 0, function* () {
    const updatePriceCache = () => __awaiter(void 0, void 0, void 0, function* () {
        const priceByTicker = {};
        const prices = yield (0, db_1.execProc)("tp.api_security_prices");
        prices.forEach((p) => {
            priceByTicker[p.symbol] = p.price;
        });
        caches.price.byTicker = priceByTicker;
    });
    yield updatePriceCache();
    setInterval(() => {
        updatePriceCache();
    }, 5 * 60 * 1000);
    return caches.price;
}))();
const getUserCache = () => __awaiter(void 0, void 0, void 0, function* () {
    yield userCacheInit;
    return caches.user;
});
exports.getUserCache = getUserCache;
const getPostCache = () => __awaiter(void 0, void 0, void 0, function* () {
    yield userCacheInit;
    return caches.post;
});
exports.getPostCache = getPostCache;
const ensureUserApi = (test) => {
    return test.constructor.name === UserApi_1.default.constructor.name;
};
const ensureSubscriptionApi = (test) => {
    return test.constructor.name === SubscriptionApi_1.default.constructor.name;
};
const ensurePostApi = (test) => {
    return test.constructor.name === PostApi_1.default.constructor.name;
};
const ensureWatchlistApi = (test) => {
    return test.constructor.name === WatchlistApi_1.default.constructor.name || test.constructor.name === WatchlistSavedApi_1.default.constructor.name;
};
//make this check based on decorators?
const cacheMonitor = (api, action, currentUserId, responseData) => __awaiter(void 0, void 0, void 0, function* () {
    const cache = yield (0, exports.getUserCache)();
    if (ensureUserApi(api) || ensureSubscriptionApi(api)) {
        switch (action) {
            case "insert":
            case "update":
                //grab data from db and update it 
                const user = cache[currentUserId] || (cache[currentUserId] = {
                    bookmarks: {},
                    profile: null,
                    upvotes: {},
                    watchlists: [],
                    blocked: []
                });
                user.profile = (yield UserApi_1.default.internal.list({
                    data: {
                        ids: [currentUserId]
                    }
                }))[0];
                break;
        }
        if (action === "setBlocked") {
            const user = cache[currentUserId] || (cache[currentUserId] = {
                bookmarks: {},
                profile: null,
                upvotes: {},
                watchlists: [],
                blocked: []
            });
            if (responseData.block) {
                user.blocked.push(responseData.userId);
            }
            else {
                user.blocked = user.blocked.filter(id => id !== responseData.userId);
            }
        }
    }
    else if (ensurePostApi(api)) {
        const user = cache[currentUserId];
        switch (action) {
            case "setBookmarked":
                if (responseData.is_bookmarked)
                    user.bookmarks[responseData.id] = true;
                else
                    delete user.bookmarks[responseData.id];
                break;
            case "setUpvoted":
                const postCache = yield (0, exports.getPostCache)();
                const record = postCache[responseData.id] || (postCache[responseData.id] = { upvotes: 0 });
                if (responseData.is_upvoted) {
                    record.upvotes += 1;
                    user.upvotes[responseData.id] = true;
                }
                else {
                    record.upvotes -= 1;
                    delete user.upvotes[responseData.id];
                }
                break;
        }
    }
    else if (ensureWatchlistApi(api)) {
        const user = cache[currentUserId];
        if (action === "insert")
            user.watchlists.push(responseData.id);
        else if (action === "saveWatchlist") {
            user.watchlists.push(responseData.id);
        }
    }
});
exports.cacheMonitor = cacheMonitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFFQSw4RUFBcUQ7QUFDckQsMEVBQWlEO0FBQ2pELHNFQUE2QztBQUM3QyxzRUFBNkM7QUFDN0MsZ0ZBQXVEO0FBQ3ZELGdGQUF1RDtBQUN2RCwwRkFBaUU7QUFDakUsOEJBQWdDO0FBQ2hDLHNGQUE2RDtBQUs3RCxNQUFNLE1BQU0sR0FjUixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQTtBQUVuRCxNQUFNLFdBQVcsR0FBRyxDQUEwQyxVQUFlLEVBQUUsUUFBVyxFQUFFLFVBQWdCLEVBQUUsUUFBVyxFQUFFLEVBQUU7SUFDekgsTUFBTSxHQUFHLEdBQWlCLEVBQUUsQ0FBQTtJQUM1QixVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDL0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxPQUFPLEdBQUcsQ0FBMEMsVUFBZSxFQUFFLE9BQWdFLEVBQUUsUUFBVyxFQUFFLEVBQUU7SUFDeEosT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLE9BQU8sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFR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