
import { IBookmarkList, IUpvoteList, IUserList } from "./entities/interfaces"
import BookmarkApi from "./entities/apis/BookmarkApi"
import UpvoteApi from "./entities/apis/UpvoteApi"
import UserApi from "./entities/apis/UserApi"
import PostApi from "./entities/apis/PostApi"
import WatchlistApi from "./entities/apis/WatchlistApi"
import WatchlistSavedApi from "./entities/apis/WatchlistSavedApi"
import { execProc } from "../db"

type ExistsRecord = Record<string, true>
export type PriceInfo = { id: number, symbol: string, price: { price: number, time: string, open: number, high: number, low: number } };
const caches: {
    user: Record<string, {
        profile: IUserList
        bookmarks: ExistsRecord,
        upvotes: ExistsRecord,
        watchlists: number[]
    }>
    price: {
        byTicker: Record<string, PriceInfo["price"]>
    }
} = { user: {}, price: { byTicker: {} } }

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
    const [users, bookmarks, upvotes, watchlists, watchlistSaved] =
        await Promise.all([UserApi.internal.list(),
        BookmarkApi.internal.list(),
        UpvoteApi.internal.list(),
        WatchlistApi.internal.list(),
        WatchlistSavedApi.internal.list()
        ])

    //console.log(JSON.stringify(watchlists));
    caches.user = {};

    users.forEach((u) => {
        caches.user[u.id] = {
            profile: u,
            bookmarks: existsCache(bookmarks, "user_id", u.id, "post_id"),
            upvotes: existsCache(upvotes, "user_id", u.id, "post_id"),
            watchlists: [
                ...idCache(watchlists, { matchKey: "user_id", matchValue: u.id }, "id"),
                ...idCache(watchlistSaved, { matchKey: "user_id", matchValue: u.id }, "watchlist_id")
            ]
            // bookmarks: (() => {
            //     const rcd: ExistsRecord = {}
            //     bookmarks.filter((b) => b.user_id === u.id).forEach((b) => {
            //         rcd[b.post_id] = true;
            //     })
            //     return rcd;
            // })(),
        }
    })
})()




export const getPriceCacheTask = (async () => {
    const updatePriceCache = async () => {
        const priceByTicker: typeof caches.price.byTicker = {}
        const prices = await execProc<PriceInfo>("tp.api_security_prices");
        //    console.log(JSON.stringify(prices));
        prices.forEach((p) => {
            priceByTicker[p.symbol] = p.price;
        })
        caches.price.byTicker = priceByTicker;
    }
    console.log("Updating Prices");
    await updatePriceCache();
    setInterval(() => {
        console.log("Updating Prices")
        updatePriceCache();
    }, 5 * 60 * 1000)
    return caches.price
})()



export const getUserCache = async () => {
    await userCacheInit;
    // console.log(JSON.stringify(caches.user));
    return caches.user;
}

//Special Monitor for cachable items
type MotitoredType = typeof UserApi | typeof PostApi | typeof WatchlistApi | typeof WatchlistSavedApi;



//make this check based on decorators?
export const cacheMonitor = async <A extends MotitoredType>(api: A, action: string, currentUserId: string, responseData: any) => {
    const cache = await getUserCache();
    if (api === UserApi) {
        switch (action as "update" | "insert") {
            case "insert":
            case "update":
                //grab data from db and update it 
                const user = cache[currentUserId] || (cache[currentUserId] = {
                    bookmarks: {},
                    profile: null as any,
                    upvotes: {},
                    watchlists: []
                })
                user.profile = (await api.internal.list({
                    data: {
                        ids: [currentUserId]
                    }
                }))[0];
                break;
        }
    }
    else if (api === PostApi) {
        const user = cache[currentUserId];
        switch (action as keyof (typeof PostApi)["extensions"]) {
            case "setBookmarked":
                if (responseData.is_bookmarked)
                    user.bookmarks[responseData.id] = true;
                else
                    delete user.bookmarks[responseData.id]
                break;
            case "setUpvoted":
                if (responseData.is_upvoted)
                    user.upvotes[responseData.id] = true;
                else
                    delete user.upvotes[responseData.id]
                break;
        }
    }
    else if (api === WatchlistApi || api === WatchlistSavedApi) {
        const user = cache[currentUserId]
        if (action === "insert")
            user.watchlists.push(responseData.id);
        else if (action === "saveWatchlist") {
            user.watchlists.push(responseData.id);
        }
    }
}