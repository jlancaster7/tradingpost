import { ensureServerExtensions } from ".";
import { getUserCache } from "../../cache";
import WatchlistApi from "../apis/WatchlistApi";
import WatchlistSavedApi from "../apis/WatchlistSavedApi";
import { getHivePool } from "../static/pool";

import Watchlist from "./Watchlist";

export default ensureServerExtensions<Watchlist>({
    getAllWatchlists: async (req) => {
        const cache = await getUserCache();
        const curUser = cache[req.extra.userId];
        const { extra: { userId } } = req
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
        if (req.body.is_saved)
            await pool.query(`INSERT INTO data_watchlist_saved(watchlist_id,user_id) VALUES($1,$2)`, [req.body.id, req.extra.userId])
        else
            await pool.query(`DELETE FROM data_watchlist_saved WHERE watchlist_id= $1 and user_id = $2`, [req.body.id, req.extra.userId])

        return req.body;
    }
});