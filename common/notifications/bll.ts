import Notifications from "./";
import Repository from "./repository";
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {DateTime} from "luxon";
import {createQueryByType} from "../elastic/queryCreation";
import * as T from '@elastic/elasticsearch/lib/api/types'
import Holidays from "../market-data/holidays";

const indexName = "tradingpost-search";

export const subscriptionsNewHoldings = async (notifSrv: Notifications, repo: Repository, marketHolidays: Holidays) => {
    const u = `https://m.tradingpostapp.com/dash/notification/trade`;

    let lastTradeDay = DateTime.now().setZone("America/New_York").minus({day: 1})
    while (!await marketHolidays.isTradingDay(lastTradeDay)) {
        lastTradeDay = lastTradeDay.minus({day: 1})
    }

    const serviceUsersWithTrades = await repo.getUsersWithTrades(lastTradeDay, lastTradeDay);
    if (serviceUsersWithTrades.length <= 0) return;

    const serviceUsersMap = new Map();
    for (let i = 0; i < serviceUsersWithTrades.length; i++) {
        const userWithTrade = serviceUsersWithTrades[i];
        let us = serviceUsersMap.get(userWithTrade.userId);
        if (!us) us = 0
        serviceUsersMap.set(userWithTrade.userId, us += 1);
    }

    // Subscribers are whom get the notification
    const subscribersForServiceUsers = await repo.getSubscribers(Array.from(serviceUsersMap.keys()));
    let subscribersMap: Map<string, Set<string>> = new Map();
    subscribersForServiceUsers.forEach(s => {
        const sid = subscribersMap.get(s.subscriberUserId)
        if (!sid) {
            const serviceSet = new Set<string>();
            serviceSet.add(s.serviceUserId)
            subscribersMap.set(s.subscriberUserId, serviceSet);
            return
        }
        sid.add(s.serviceUserId)
        subscribersMap.set(s.subscriberUserId, sid);
    })

    for (const [subscriber, serviceUserIds] of subscribersMap) {
        let tradeCount = 0;
        serviceUserIds.forEach((s: any) => tradeCount += serviceUsersMap.get(s));
        if (tradeCount === 0) continue;

        let msg = '';
        if (serviceUserIds.size > 1) {
            msg = `${serviceUserIds.size} analysts you follow have made a total of ${tradeCount} trades.`
        } else {
            msg = `1 analyst you follow has made a total of ${tradeCount} trade${tradeCount > 1 ? 's' : ''}.`;
        }

        await repo.addNewTradeNotification(subscriber, msg);
        await notifSrv.sendMessageToUser(subscriber, {
            data: {url: u},
            body: msg,
            title: "New Subscriber Trades"
        });
    }
}

export const holdingsPostNotifications = async (notifSrv: Notifications, repo: Repository, elasticClient: ElasticClient) => {
    let usersAndHoldings = await repo.getUsersCurrentHoldings();
    const currentTime = DateTime.now();
    const twelveHoursAgo = currentTime.minus({hour: 12});
    const curFormat = currentTime.toUTC().toISO();
    const twelveFormat = twelveHoursAgo.toUTC().toISO();
    const usersAndHoldingsKeys = Object.keys(usersAndHoldings);
    for (let i = 0; i < usersAndHoldingsKeys.length; i++) {
        const userId = usersAndHoldingsKeys[i];
        const userHoldings = usersAndHoldings[userId];
        const usersBlockList = await repo.getUserBlockedList(userId);
        const usersSubscriptionList = await repo.getUserSubscriberList(userId);
        const postTypeAggregations = await queryDatastore(elasticClient, usersSubscriptionList, usersBlockList, userHoldings, currentTime, twelveHoursAgo);
        const message = buildMessage(postTypeAggregations);
        const u = `https://m.tradingpostapp.com/dash/search?isHoldings=true&beginDateTime=${twelveFormat}&endDateTime=${curFormat}`;
        await notifSrv.sendMessageToUser(userId, {
            title: "New Current Holdings Posts",
            body: message,
            data: {
                link: u
            }
        });
    }
}

export const watchlistsPostNotifications = async (notifSrv: Notifications, repo: Repository, elasticClient: ElasticClient) => {
    let [usersAndWatchlists, watchlistIdToName] = await repo.getUsersAndWatchlists();
    const currentTime = DateTime.now();
    const twelveHoursAgo = currentTime.minus({hour: 12});

    const curFormat = currentTime.toUTC().toISO();
    const twelveFormat = twelveHoursAgo.toUTC().toISO();
    const userWatchlistsKeys = Object.keys(usersAndWatchlists);
    for (let i = 0; i < userWatchlistsKeys.length; i++) {
        const userId = userWatchlistsKeys[i];
        const watchlistsAndSymbols = usersAndWatchlists[userId];
        const watchlistAndSymbolsKeys = Object.keys(watchlistsAndSymbols);

        const usersBlockList = await repo.getUserBlockedList(userId);
        const usersSubscriptionList = await repo.getUserSubscriberList(userId);

        for (let j = 0; j < watchlistAndSymbolsKeys.length; j++) {
            const watchlistId = parseInt(watchlistAndSymbolsKeys[j]);
            const watchlistSymbols = watchlistsAndSymbols[watchlistId];
            const watchlistName = watchlistIdToName[watchlistId];
            const postTypeAggregations = await queryDatastore(elasticClient, usersSubscriptionList, usersBlockList, watchlistSymbols, currentTime, twelveHoursAgo);
            if (postTypeAggregations.length <= 0) continue;
            const message = buildWatchlistMessage(postTypeAggregations, watchlistName);
            const u = `https://m.tradingpostapp.com/dash/search?watchlistId=${watchlistId}&beginDateTime=${twelveFormat}&endDateTime=${curFormat}`;
            await notifSrv.sendMessageToUser(userId, {
                title: "New Watchlist Posts",
                body: message,
                data: {
                    url: u
                }
            });
        }
    }
}

const postTypeToNoun: Record<string, { plural: string, singular: string }> = {
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

const buildWatchlistMessage = (ptAgg: { postType: string, count: number }[], watchlistName: string): string => {
    if (ptAgg.length === 1) {
        let postTypeNouns = postTypeToNoun[ptAgg[0].postType];
        let msgAttr = ptAgg[0].count > 1 ? postTypeNouns.plural : postTypeNouns.singular
        return `For your watchlist ${watchlistName}, there has been ${ptAgg[0].count} ${msgAttr} in the last 12 hours.`;
    }

    if (ptAgg.length === 2) {
        let postTypeNounsOne = postTypeToNoun[ptAgg[0].postType];
        let msgAttr1 = ptAgg[0].count > 1 ? postTypeNounsOne.plural : postTypeNounsOne.singular

        let postTypeNounsTwo = postTypeToNoun[ptAgg[1].postType];
        let msgAttr2 = ptAgg[1].count > 1 ? postTypeNounsTwo.plural : postTypeNounsTwo.singular
        return `For your watchlist ${watchlistName} there have been ${ptAgg[0].count} ${msgAttr1} and ${ptAgg[1].count} ${msgAttr2} in the last 12 hours.`;
    }

    let message = `For your watchlist ${watchlistName}, there have been `;
    for (let i = 0; i < ptAgg.length; i++) {
        let pt = ptAgg[i];
        let postTypeNouns = postTypeToNoun[pt.postType];
        let msgAttr = pt.count > 1 ? postTypeNouns.plural : postTypeNouns.singular;
        if (ptAgg.length - 1 === i) message += 'and '
        message += `${pt.count} ${msgAttr}, `
    }

    //  remove last ,
    message = message.slice(0, message.length - 2)

    return `${message} in the last 12 hours.`
}

const buildMessage = (ptAgg: { postType: string, count: number }[]): string => {
    if (ptAgg.length === 1) {
        let postTypeNouns = postTypeToNoun[ptAgg[0].postType];
        let msgAttr = ptAgg[0].count > 1 ? postTypeNouns.plural : postTypeNouns.singular
        return `There has been ${ptAgg[0].count} ${msgAttr} in the last 12 hours.`;
    }

    if (ptAgg.length === 2) {
        let postTypeNounsOne = postTypeToNoun[ptAgg[0].postType];
        let msgAttr1 = ptAgg[0].count > 1 ? postTypeNounsOne.plural : postTypeNounsOne.singular

        let postTypeNounsTwo = postTypeToNoun[ptAgg[1].postType];
        let msgAttr2 = ptAgg[1].count > 1 ? postTypeNounsTwo.plural : postTypeNounsTwo.singular
        return `There have been ${ptAgg[0].count} ${msgAttr1} and ${ptAgg[1].count} ${msgAttr2} in the last 12 hours.`;
    }

    let message = 'There have been ';
    for (let i = 0; i < ptAgg.length; i++) {
        let pt = ptAgg[i];
        let postTypeNouns = postTypeToNoun[pt.postType];
        let msgAttr = pt.count > 1 ? postTypeNouns.plural : postTypeNouns.singular;
        if (ptAgg.length - 1 === i) message += 'and '
        message += `${pt.count} ${msgAttr}, `
    }

    //  remove last ,
    message = message.slice(0, message.length - 2)

    return `${message} in the last 12 hours.`
}

interface Aggregations {
    postTypeAgg: T.AggregationsTermsAggregateBase<{ key: string, doc_count: number }>
}

export const queryDatastore = async (elasticClient: ElasticClient, userSubscriptions: string[], userBlockedList: string[], searchTerms: string[], endDateTime: DateTime, startDateTime: DateTime) => {
    const res = await elasticClient.search<{}, Aggregations>({
        index: indexName,
        _source: [""],
        query: await createQueryByType('search', {
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

    if (!res.aggregations || !res.aggregations.postTypeAgg) return [];
    if (!(res.aggregations.postTypeAgg.buckets instanceof Array)) return [];

    return res.aggregations.postTypeAgg.buckets.map(b => ({postType: b.key, count: b.doc_count}));
}