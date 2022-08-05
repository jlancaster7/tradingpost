import { ensureServerExtensions } from ".";
import { getUserCache } from "../../cache";
import WatchlistApi from "../apis/WatchlistApi";
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
    }
});