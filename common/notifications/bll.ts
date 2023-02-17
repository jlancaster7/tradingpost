import Notifications from "./";
import Repository from "./repository";
import {Client as ElasticClient} from '@elastic/elasticsearch';
import {DateTime} from "luxon";
import {createQueryByType} from "../api/entities/extensions/Post.server";
import * as T from '@elastic/elasticsearch/lib/api/types'

const indexName = "tradingpost-search";

export const holdingsPostNotifications = async (notifSrv: Notifications, repo: Repository, elasticClient: ElasticClient) => {
    let usersAndHoldings = await repo.getUsersCurrentHoldings();
    const currentTime = DateTime.now();
    const twelveHoursAgo = currentTime.minus({hour: 12});
    const usersAndHoldingsKeys = Object.keys(usersAndHoldings);
    for (let i = 0; i < usersAndHoldingsKeys.length; i++) {
        const userId = usersAndHoldingsKeys[i];
        const userHoldings = usersAndHoldings[userId];
        const usersBlockList = await repo.getUserBlockedList(userId);
        const usersSubscriptionList = await repo.getUserSubscriberList(userId);
        const postTypeAggregations = await queryDatastore(elasticClient, usersSubscriptionList, usersBlockList, userHoldings, currentTime, twelveHoursAgo);
        const message = buildMessage(postTypeAggregations);
        await notifSrv.sendMessageToUser(userId, {
            title: "New Current Holdings Posts",
            body: message,
            data: {
                link: 'https://m.tradingpostapp.com/dash/Search'
            }
        });
    }
}

export const watchlistsPostNotifications = async (notifSrv: Notifications, repo: Repository, elasticClient: ElasticClient) => {
    let [usersAndWatchlists, watchlistIdToName] = await repo.getUsersAndWatchlists();
    const currentTime = DateTime.now();
    const twelveHoursAgo = currentTime.minus({hour: 36});
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
            await notifSrv.sendMessageToUser(userId, {
                title: "New Watchlist Posts",
                body: message,
                data: {
                    link: 'https://m.tradingpostapp.com/dash/Search'
                }
            });
            console.log("Sent")
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

    console.log(res.aggregations)

    if (!res.aggregations || !res.aggregations.postTypeAgg) return [];
    if (!(res.aggregations.postTypeAgg.buckets instanceof Array)) return [];

    return res.aggregations.postTypeAgg.buckets.map(b => ({postType: b.key, count: b.doc_count}));
}