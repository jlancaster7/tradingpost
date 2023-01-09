
import { IBookmarkList, IUpvoteList, IUserList } from "./entities/interfaces"
import BookmarkApi from "./entities/apis/BookmarkApi"
import UpvoteApi from "./entities/apis/UpvoteApi"
import UserApi from "./entities/apis/UserApi"
import PostApi from "./entities/apis/PostApi"
import WatchlistApi from "./entities/apis/WatchlistApi"
import BlockListApi from "./entities/apis/BlockListApi"
import WatchlistSavedApi from "./entities/apis/WatchlistSavedApi"
import { execProc } from "../db"
import SubscriptionApi from "./entities/apis/SubscriptionApi"

type ExistsRecord = Record<string, true>
type CountRecord = Record<string, number>
export type PriceInfo = { id: number, symbol: string, price: { price: number, time: string, open: number, high: number, low: number } };
const caches: {
    user: Record<string, {
        profile: IUserList
        bookmarks: ExistsRecord,
        upvotes: ExistsRecord,
        watchlists: number[],
        blocked: string[]
    }>,
    post: Record<string, {
        upvotes: number,
    }>
    price: {
        byTicker: Record<string, PriceInfo["price"]>
    }
} = { user: {}, price: { byTicker: {} }, post: {} }

const existsCache = <T, M extends keyof T, C extends keyof T>(allRecords: T[], matchKey: M, matchValue: T[M], cacheKey: C) => {
    const rcd: ExistsRecord = {}
    allRecords.filter((r) => r[matchKey] === matchValue).forEach((r) => {
        rcd[String(r[cacheKey])] = true;
    })
    return rcd;
}
const idCache = <T, M extends keyof T, C extends keyof T>(allRecords: T[], matcher: { matchKey: M, matchValue: T[M] } | ((r: T) => boolean), cacheKey: C) => {
    return allRecords.filter((r) => typeof matcher === "function" ? matcher(r) : r[matcher.matchKey] === matcher.matchValue).map((r) => r[cacheKey])
}

//TODO: Should write a little local hook for the client that get notified when there are updates to keep components in sync if they are using it 
let userCacheInit = (async () => {
    const [users, bookmarks, upvotes, watchlists, watchlistSaved, blockList] =
        await Promise.all([UserApi.internal.list(),
        BookmarkApi.internal.list(),
        UpvoteApi.internal.list(),
        WatchlistApi.internal.list(),
        WatchlistSavedApi.internal.list(),
        BlockListApi.internal.list()
        ])


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
        }
    })

    upvotes.forEach((v) => {
        const record = caches.post[v.post_id] || (caches.post[v.post_id] = { upvotes: 0 })
        record.upvotes += 1;
    })

})()


export const getPriceCacheTask = (async () => {
    const updatePriceCache = async () => {
        const priceByTicker: typeof caches.price.byTicker = {}
        const prices = await execProc<PriceInfo>("tp.api_security_prices");
        prices.forEach((p) => {
            priceByTicker[p.symbol] = p.price;
        })
        caches.price.byTicker = priceByTicker;
    }

    await updatePriceCache();
    setInterval(() => {

        updatePriceCache();
    }, 5 * 60 * 1000)
    return caches.price
})()



export const getUserCache = async () => {
    await userCacheInit;

    return caches.user;
}
export const getPostCache = async () => {
    await userCacheInit;

    return caches.post;
}

//Special Monitor for cachable items
type MotitoredType = typeof UserApi | typeof PostApi | typeof WatchlistApi | typeof WatchlistSavedApi;


const ensureUserApi = (test: any): test is typeof UserApi => {
    return test.constructor.name === UserApi.constructor.name
}
const ensureSubscriptionApi = (test: any): test is typeof SubscriptionApi => {
    return test.constructor.name === SubscriptionApi.constructor.name
}
const ensurePostApi = (test: any): test is typeof PostApi => {
    return test.constructor.name === PostApi.constructor.name
}
const ensureWatchlistApi = (test: any): test is (typeof WatchlistApi) | (typeof WatchlistSavedApi) => {
    return test.constructor.name === WatchlistApi.constructor.name || test.constructor.name === WatchlistSavedApi.constructor.name
}

//make this check based on decorators?
export const cacheMonitor = async <A extends MotitoredType>(api: A, action: string, currentUserId: string, responseData: any) => {
    const cache = await getUserCache();

    if (ensureUserApi(api) || ensureSubscriptionApi(api)) {
        switch (action as "update" | "insert") {
            case "insert":
            case "update":
                //grab data from db and update it 
                const user = cache[currentUserId] || (cache[currentUserId] = {
                    bookmarks: {},
                    profile: null as any,
                    upvotes: {},
                    watchlists: [],
                    blocked: []
                })
                user.profile = (await UserApi.internal.list({
                    data: {
                        ids: [currentUserId]
                    }
                }))[0];
                break;


        }
        if (action === "setBlocked") {
            const user = cache[currentUserId] || (cache[currentUserId] = {
                bookmarks: {},
                profile: null as any,
                upvotes: {},
                watchlists: [],
                blocked: []
            })
            if (responseData.block) {
                user.blocked.push(responseData.userId);
            }
            else {
                user.blocked = user.blocked.filter(id => id === responseData.userId);
            }
        }
    }
    else if (ensurePostApi(api)) {
        const user = cache[currentUserId];
        switch (action as keyof (typeof PostApi)["extensions"]) {
            case "setBookmarked":
                if (responseData.is_bookmarked)
                    user.bookmarks[responseData.id] = true;
                else
                    delete user.bookmarks[responseData.id]
                break;
            case "setUpvoted":
                const postCache = await getPostCache();
                const record = postCache[responseData.id] || (postCache[responseData.id] = { upvotes: 0 })

                if (responseData.is_upvoted) {
                    record.upvotes += 1;
                    user.upvotes[responseData.id] = true;
                }
                else {
                    record.upvotes -= 1;
                    delete user.upvotes[responseData.id]
                }
                break;
        }
    }
    else if (ensureWatchlistApi(api)) {
        const user = cache[currentUserId]
        if (action === "insert")
            user.watchlists.push(responseData.id);
        else if (action === "saveWatchlist") {
            user.watchlists.push(responseData.id);
        }
    }
}