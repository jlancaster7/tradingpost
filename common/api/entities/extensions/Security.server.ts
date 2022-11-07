import {ensureServerExtensions} from ".";
import {getPriceCacheTask, getUserCache} from "../../cache";
import {ISecurityGet} from "../static/interfaces";
import {execProc, getHivePool} from '../../../db';
import SecurityApi from "../static/SecurityApi";
import Security from "./Security";
import {ISecurityPrices} from "../interfaces/index";


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
        
        await execProc("tp.api_security_quickadd", {
            user_id: r.extra.userId,
            data: r.body
        })
    },
    list: () => SecurityApi.internal.list(),
    getPrices: async (req) => {
        const {securityId} = req.body;
        const db = await getHivePool;
        const pricingPromises: any[2] = [null, null];
        if (req.body.includeIntraday) {
            pricingPromises[1] = db.query<{ high: number, low: number, open: number, price: number, time: Date }>
            (`SELECT high, low, open, price, time
              FROM security_price
              WHERE is_intraday = true
                AND security_id = $1
              ORDER BY time DESC`, [securityId]);
        }

        if (req.body.includeHistorical) {
            pricingPromises[0] = db.query<{ high: number, low: number, open: number, price: number, time: Date }>
            (`SELECT high, low, open, price, time
              FROM security_price
              WHERE is_eod = true
                AND security_id = $1
              ORDER BY time asc`, [securityId]);
        }

        const [historical, intraday] = await Promise.all(pricingPromises);
        let res: ISecurityPrices = {
            historical: [],
            intraday: [],
        }

        if (req.body.includeIntraday) {
            intraday && intraday.rows.forEach((r: { high: any; low: any; open: any; price: any; time: Date }) => {
                return res.intraday.push({
                    high: parseFloat(r.high),
                    low: parseFloat(r.low),
                    open: parseFloat(r.open),
                    close: parseFloat(r.price),
                    date: r.time.toString()
                });
            })
        }

        if (req.body.includeHistorical) {
            historical && historical.rows.forEach((r: { high: any; low: any; open: any; price: any; time: Date }) => {
                return res.historical.push({
                    high: parseFloat(r.high),
                    low: parseFloat(r.low),
                    open: parseFloat(r.open),
                    close: parseFloat(r.price),
                    date: r.time.toString()
                })
            })
        }

        return res;
    },
})