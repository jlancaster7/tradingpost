import { ensureServerExtensions } from ".";
import { getPriceCacheTask, getUserCache } from "../../cache";
import { ISecurityGet } from "../static/interfaces";
import { execProc, getHivePool } from  '../../../db';
import SecurityApi from "../static/SecurityApi";
import Security from "./Security";


export default ensureServerExtensions<Security>({
    get: async (sec: ISecurityGet, extra) => {
        const prices = await getPriceCacheTask;

        sec.price = prices.byTicker[sec.symbol];
        //get user's quick watch
        const pool = await getHivePool;
        const item = await pool.query("SELECT * FROM public.data_watchlist_item where symbol=$1 and watchlist_id =(SELECT id from public.data_watchlist where type ='primary' and user_id = $2)", [sec.symbol, extra.userId]);
        sec.isOnQuickWatch = Boolean(item.rows.length)
    },
    quickadd: async (r) => {
        console.log(r.extra.userId);
        await execProc("tp.api_security_quickadd", {
            user_id: r.extra.userId,
            data: r.body
        })
    },
    list: () => SecurityApi.internal.list()
})