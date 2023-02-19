import {ensureServerExtensions} from ".";
import {getPriceCacheTask, getUserCache} from "../../cache";
import WatchlistSavedApi from "../apis/WatchlistSavedApi";
import WatchlistApi, {IWatchlistGet} from "../apis/WatchlistApi";
import {getHivePool} from '../../../db'

import Watchlist, {IWatchlistGetExt} from "./Watchlist";
import {NotificationSubscriptionTypes} from "../../../notifications/interfaces";

export default ensureServerExtensions<Watchlist>({
    get: async (watchlist: IWatchlistGet) => {
        const prices = await getPriceCacheTask;

        (watchlist as IWatchlistGetExt).items.forEach((wi) => {
            const found = prices.byTicker[wi.symbol]


            wi.price = found;
        })


        //return watchlist;
    },
    getAllWatchlists: async (req) => {
        const cache = await getUserCache();
        const curUser = cache[req.extra.userId];
        const {extra: {userId}} = req
        const watchlists = await WatchlistApi.internal.list({
            user_id: req.extra.userId,
            data: {
                ids: curUser.watchlists
            }
        });


        return {
            quick: watchlists.find(w => w.type === "primary") || {
                id: 0,
                item_count: 0,
                name: "Invalid Watchlist",
                type: "primary",
                saved_by_count: 0,
                user: [curUser.profile]
            },
            //get all my watchlists
            created: watchlists.filter(w => w.user_id === userId && w.type !== "primary"),
            //get all shared watchlists
            saved: watchlists.filter(w => w.user_id !== userId)
        }
    },
    saveWatchlist: async (req) => {
        //TODO:  need to to add incorp into api build in the future 
        const pool = await getHivePool;
        if (req.body.is_saved) {
            const response = await pool.query<{ id: number }>(`INSERT INTO data_watchlist_saved(watchlist_id, user_id)
                                                               VALUES ($1,
                                                                       $2) RETURNING id;`, [req.body.id, req.extra.userId])
            const watchlistSavedId = response.rows[0].id;
            await pool.query(`
                        INSERT INTO data_notification_subscription (type, data, type_id, user_id, disabled)
                        VALUES ($1, NULL, $2, $3, $4) ON CONFLICT (user_id, type, type_id)
                                  DO
                        UPDATE SET type = EXCLUDED.type, data = EXCLUDED.data, type_id = EXCLUDED.type_id, disabled = EXCLUDED.disabled;`,
                [NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION, watchlistSavedId, req.extra.userId,
                    req.body.disableNotification])
        } else {
            await pool.query(`DELETE
                              FROM data_watchlist_saved
                              WHERE watchlist_id = $1
                                and user_id = $2`, [req.body.id, req.extra.userId]);
            await pool.query(`DELETE
                              FROM data_notification_subscription
                              WHERE user_id = $1
                                and type_id = $2
                                and type = $3`, [req.extra.userId, req.body.id, NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION]);
        }

        return req.body;
    }
});