import {ensureServerExtensions} from ".";
import {getPriceCacheTask, getUserCache} from "../../cache";
import WatchlistSavedApi from "../apis/WatchlistSavedApi";
import WatchlistApi, {IWatchlistGet} from "../apis/WatchlistApi";
import {getHivePool} from '../../../db'

import Watchlist, {IWatchlistGetExt} from "./Watchlist";
import {NotificationSubscriptionTypes} from "../../../notifications/interfaces";

export default ensureServerExtensions<Watchlist>({
    get: async (watchlistId: number) => {


    },
    getAllWatchlists: async (req) => {
        const cache = await getUserCache();
        const {extra: {userId}} = req
        const curUser = cache[userId];
        const watchlists = await WatchlistApi.internal.list({
            user_id: userId,
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
        console.log('save watchlist firing')
        console.log(req.body)
        if (req.body.is_saved) {
            await pool.query(`INSERT INTO data_watchlist_saved(watchlist_id,user_id) VALUES($1,$2)`, [req.body.id, req.extra.userId])
            return true;
        }
        else {
            await pool.query(`DELETE FROM data_watchlist_saved WHERE watchlist_id= $1 and user_id = $2`, [req.body.id, req.extra.userId])
            await pool.query(`DELETE
                    FROM data_notification_subscription
                    WHERE user_id = $1
                    and type_id = $2
                    and type = $3`, [req.extra.userId, req.body.id, NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION]); 
            return false
        }
    },
    toggleNotification: async (req) => {
        const pool = await getHivePool;
        console.log('toggle api firing')
        if (!req.body.is_notification){
            await pool.query(`
                    INSERT INTO data_notification_subscription (type, type_id, user_id, disabled)
                    VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, type, type_id)
                              DO
                    UPDATE SET type = EXCLUDED.type, type_id = EXCLUDED.type_id, disabled = EXCLUDED.disabled;`,
            [NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION, req.body.id, req.extra.userId, false])
            return true
        }
        else {
            await pool.query(`DELETE
                    FROM data_notification_subscription
                    WHERE user_id = $1
                    and type_id = $2
                    and type = $3`, [req.extra.userId, req.body.id, NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION]);
            return false
        }
    }
});