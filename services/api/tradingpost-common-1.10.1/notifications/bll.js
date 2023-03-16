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
exports.queryDatastore = exports.watchlistsPostNotifications = exports.holdingsPostNotifications = exports.subscriptionsNewHoldings = void 0;
const luxon_1 = require("luxon");
const queryCreation_1 = require("../elastic/queryCreation");
const indexName = "tradingpost-search";
const allowedNotifs = new Map();
allowedNotifs.set("8e787902-f0e9-42aa-a8d8-18e5d7a1a34d", true);
allowedNotifs.set("e96aea04-9a60-4832-9793-f790e60df8eb", true);
allowedNotifs.set("4a6f0899-dc6d-40cc-aa6a-1febb579d65a", true);
const subscriptionsNewHoldings = (notifSrv, repo) => __awaiter(void 0, void 0, void 0, function* () {
    const u = `https://m.tradingpostapp.com/dash/notification/trade`;
    const dt = luxon_1.DateTime.now().minus({ day: 1 }).setZone("America/New_York");
    const serviceUsersWithTrades = yield repo.getUsersWithTrades(dt, dt);
    if (serviceUsersWithTrades.length <= 0)
        return;
    const serviceUsersMap = new Map();
    for (let i = 0; i < serviceUsersWithTrades.length; i++) {
        const userWithTrade = serviceUsersWithTrades[i];
        let us = serviceUsersMap.get(userWithTrade.userId);
        if (!us)
            us = 0;
        serviceUsersMap.set(userWithTrade.userId, us += 1);
    }
    // Subscribers are whom get the notification
    const subscribersForServiceUsers = yield repo.getSubscribers(Array.from(serviceUsersMap.keys()));
    let subscribersMap = new Map();
    subscribersForServiceUsers.forEach(s => {
        const sid = subscribersMap.get(s.subscriberUserId);
        if (!sid) {
            const serviceSet = new Set();
            serviceSet.add(s.serviceUserId);
            subscribersMap.set(s.subscriberUserId, serviceSet);
            return;
        }
        sid.add(s.serviceUserId);
        subscribersMap.set(s.subscriberUserId, sid);
    });
    for (const [subscriber, serviceUserIds] of subscribersMap) {
        let tradeCount = 0;
        serviceUserIds.forEach((s) => tradeCount += serviceUsersMap.get(s));
        if (tradeCount === 0)
            continue;
        let msg = '';
        if (serviceUserIds.size > 1) {
            msg = `${serviceUserIds.size} analysts you follow have made a total of ${tradeCount} trades.`;
        }
        else {
            msg = `1 analyst you follow has made a total of ${tradeCount} trade${tradeCount > 1 ? 's' : null}.`;
        }
        if (!allowedNotifs.has(subscriber))
            continue;
        yield repo.addNewTradeNotification(subscriber, msg);
        yield notifSrv.sendMessageToUser(subscriber, {
            data: { url: u },
            body: msg,
            title: "New Subscriber Trades"
        });
    }
});
exports.subscriptionsNewHoldings = subscriptionsNewHoldings;
const holdingsPostNotifications = (notifSrv, repo, elasticClient) => __awaiter(void 0, void 0, void 0, function* () {
    let usersAndHoldings = yield repo.getUsersCurrentHoldings();
    const currentTime = luxon_1.DateTime.now();
    const twelveHoursAgo = currentTime.minus({ hour: 12 });
    const curFormat = currentTime.toUTC().toISO();
    const twelveFormat = twelveHoursAgo.toUTC().toISO();
    const usersAndHoldingsKeys = Object.keys(usersAndHoldings);
    for (let i = 0; i < usersAndHoldingsKeys.length; i++) {
        const userId = usersAndHoldingsKeys[i];
        const userHoldings = usersAndHoldings[userId];
        const usersBlockList = yield repo.getUserBlockedList(userId);
        const usersSubscriptionList = yield repo.getUserSubscriberList(userId);
        const postTypeAggregations = yield (0, exports.queryDatastore)(elasticClient, usersSubscriptionList, usersBlockList, userHoldings, currentTime, twelveHoursAgo);
        const message = buildMessage(postTypeAggregations);
        const u = `https://m.tradingpostapp.com/dash/search?isHoldings=true&beginDateTime=${twelveFormat}&endDateTime=${curFormat}`;
        if (!allowedNotifs.has(userId))
            continue;
        yield notifSrv.sendMessageToUser(userId, {
            title: "New Current Holdings Posts",
            body: message,
            data: {
                link: u
            }
        });
    }
});
exports.holdingsPostNotifications = holdingsPostNotifications;
const watchlistsPostNotifications = (notifSrv, repo, elasticClient) => __awaiter(void 0, void 0, void 0, function* () {
    let [usersAndWatchlists, watchlistIdToName] = yield repo.getUsersAndWatchlists();
    const currentTime = luxon_1.DateTime.now();
    const twelveHoursAgo = currentTime.minus({ hour: 12 });
    const curFormat = currentTime.toUTC().toISO();
    const twelveFormat = twelveHoursAgo.toUTC().toISO();
    const userWatchlistsKeys = Object.keys(usersAndWatchlists);
    for (let i = 0; i < userWatchlistsKeys.length; i++) {
        const userId = userWatchlistsKeys[i];
        const watchlistsAndSymbols = usersAndWatchlists[userId];
        const watchlistAndSymbolsKeys = Object.keys(watchlistsAndSymbols);
        const usersBlockList = yield repo.getUserBlockedList(userId);
        const usersSubscriptionList = yield repo.getUserSubscriberList(userId);
        for (let j = 0; j < watchlistAndSymbolsKeys.length; j++) {
            const watchlistId = parseInt(watchlistAndSymbolsKeys[j]);
            const watchlistSymbols = watchlistsAndSymbols[watchlistId];
            const watchlistName = watchlistIdToName[watchlistId];
            const postTypeAggregations = yield (0, exports.queryDatastore)(elasticClient, usersSubscriptionList, usersBlockList, watchlistSymbols, currentTime, twelveHoursAgo);
            if (postTypeAggregations.length <= 0)
                continue;
            const message = buildWatchlistMessage(postTypeAggregations, watchlistName);
            const u = `https://m.tradingpostapp.com/dash/search?watchlistId=${watchlistId}&beginDateTime=${twelveFormat}&endDateTime=${curFormat}`;
            if (!allowedNotifs.has(userId))
                continue;
            yield notifSrv.sendMessageToUser(userId, {
                title: "New Watchlist Posts",
                body: message,
                data: {
                    url: u
                }
            });
        }
    }
});
exports.watchlistsPostNotifications = watchlistsPostNotifications;
const postTypeToNoun = {
    tweet: {
        plural: 'Tweets',
        singular: 'Tweet'
    },
    youtube: {
        plural: 'YouTube Videos',
        singular: 'YouTube Video'
    },
    substack: {
        plural: 'Substacks',
        singular: 'Substack'
    },
    spotify: {
        plural: 'Spotify Podcasts',
        singular: 'Spotify Podcast'
    },
    tradingpost: {
        plural: 'TradingPost Posts',
        singular: 'TradingPost Post'
    }
};
const buildWatchlistMessage = (ptAgg, watchlistName) => {
    if (ptAgg.length === 1) {
        let postTypeNouns = postTypeToNoun[ptAgg[0].postType];
        let msgAttr = ptAgg[0].count > 1 ? postTypeNouns.plural : postTypeNouns.singular;
        return `For your watchlist ${watchlistName}, there has been ${ptAgg[0].count} ${msgAttr} in the last 12 hours.`;
    }
    if (ptAgg.length === 2) {
        let postTypeNounsOne = postTypeToNoun[ptAgg[0].postType];
        let msgAttr1 = ptAgg[0].count > 1 ? postTypeNounsOne.plural : postTypeNounsOne.singular;
        let postTypeNounsTwo = postTypeToNoun[ptAgg[1].postType];
        let msgAttr2 = ptAgg[1].count > 1 ? postTypeNounsTwo.plural : postTypeNounsTwo.singular;
        return `For your watchlist ${watchlistName} there have been ${ptAgg[0].count} ${msgAttr1} and ${ptAgg[1].count} ${msgAttr2} in the last 12 hours.`;
    }
    let message = `For your watchlist ${watchlistName}, there have been `;
    for (let i = 0; i < ptAgg.length; i++) {
        let pt = ptAgg[i];
        let postTypeNouns = postTypeToNoun[pt.postType];
        let msgAttr = pt.count > 1 ? postTypeNouns.plural : postTypeNouns.singular;
        if (ptAgg.length - 1 === i)
            message += 'and ';
        message += `${pt.count} ${msgAttr}, `;
    }
    //  remove last ,
    message = message.slice(0, message.length - 2);
    return `${message} in the last 12 hours.`;
};
const buildMessage = (ptAgg) => {
    if (ptAgg.length === 1) {
        let postTypeNouns = postTypeToNoun[ptAgg[0].postType];
        let msgAttr = ptAgg[0].count > 1 ? postTypeNouns.plural : postTypeNouns.singular;
        return `There has been ${ptAgg[0].count} ${msgAttr} in the last 12 hours.`;
    }
    if (ptAgg.length === 2) {
        let postTypeNounsOne = postTypeToNoun[ptAgg[0].postType];
        let msgAttr1 = ptAgg[0].count > 1 ? postTypeNounsOne.plural : postTypeNounsOne.singular;
        let postTypeNounsTwo = postTypeToNoun[ptAgg[1].postType];
        let msgAttr2 = ptAgg[1].count > 1 ? postTypeNounsTwo.plural : postTypeNounsTwo.singular;
        return `There have been ${ptAgg[0].count} ${msgAttr1} and ${ptAgg[1].count} ${msgAttr2} in the last 12 hours.`;
    }
    let message = 'There have been ';
    for (let i = 0; i < ptAgg.length; i++) {
        let pt = ptAgg[i];
        let postTypeNouns = postTypeToNoun[pt.postType];
        let msgAttr = pt.count > 1 ? postTypeNouns.plural : postTypeNouns.singular;
        if (ptAgg.length - 1 === i)
            message += 'and ';
        message += `${pt.count} ${msgAttr}, `;
    }
    //  remove last ,
    message = message.slice(0, message.length - 2);
    return `${message} in the last 12 hours.`;
};
const queryDatastore = (elasticClient, userSubscriptions, userBlockedList, searchTerms, endDateTime, startDateTime) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield elasticClient.search({
        index: indexName,
        _source: [""],
        query: yield (0, queryCreation_1.createQueryByType)('search', {
            subscriptions: userSubscriptions,
            blocks: userBlockedList,
            searchTerms: searchTerms,
            beginDateTime: startDateTime.toJSDate(),
            endDateTime: endDateTime.toJSDate()
        }),
        aggs: {
            postTypeAgg: {
                terms: {
                    field: "postType"
                }
            }
        }
    });
    if (!res.aggregations || !res.aggregations.postTypeAgg)
        return [];
    if (!(res.aggregations.postTypeAgg.buckets instanceof Array))
        return [];
    return res.aggregations.postTypeAgg.buckets.map(b => ({ postType: b.key, count: b.doc_count }));
});
exports.queryDatastore = queryDatastore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYmxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLGlDQUErQjtBQUMvQiw0REFBMkQ7QUFHM0QsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUM7QUFFdkMsTUFBTSxhQUFhLEdBQXlCLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdEQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRSxhQUFhLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hFLGFBQWEsQ0FBQyxHQUFHLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFekQsTUFBTSx3QkFBd0IsR0FBRyxDQUFPLFFBQXVCLEVBQUUsSUFBZ0IsRUFBRSxFQUFFO0lBQ3hGLE1BQU0sQ0FBQyxHQUFHLHNEQUFzRCxDQUFDO0lBQ2pFLE1BQU0sRUFBRSxHQUFHLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFFeEUsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckUsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLElBQUksQ0FBQztRQUFFLE9BQU87SUFFL0MsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BELE1BQU0sYUFBYSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELElBQUksRUFBRSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENB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