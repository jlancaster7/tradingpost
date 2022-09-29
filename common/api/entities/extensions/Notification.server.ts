import {ensureServerExtensions} from ".";
import Notification from "./Notification";
import {getHivePool} from "../../../db";
import {DateTime} from "luxon";
import {ListTradesResponse, ListAlertsResponse} from "../interfaces";

export default ensureServerExtensions<Notification>({
    listAlerts: async (req): Promise<ListAlertsResponse[]> => {
        const pool = await getHivePool;
        const query = `
            SELECT id,
                   user_id,
                   type,
                   date_time,
                   data
            FROM notification
            WHERE user_id = $1
            ORDER BY date_time DESC
            LIMIT $2 OFFSET $3;`;

        const limit = req.extra.limit && req.extra.limit > 0 ? req.extra.limit : 30;
        const offset = (req.extra.page ? req.extra.page : 0) * limit;
        const results = await
            pool.query<{ id: number, user_id: string, type: string, date_time: Date, data: Record<string, any> }>(
                query, [req.extra.userId, limit, offset]
            );

        if (results.rows.length <= 0) return [];

        let res: ListAlertsResponse[] = [];

        results.rows.forEach(r => {
            let y: ListAlertsResponse = {
                id: r.id,
                type: r.type,
                dateTime: DateTime.fromJSDate(r.date_time).toString(),
                data: r.data
            }
            res.push(y)
        });

        return res;
    },
    listTrades: async (req): Promise<ListTradesResponse[]> => {
        const pool = await getHivePool;
        const query = `
            SELECT tt.id,
                   tt.date,
                   tt.price,
                   tt.type,
                   du.handle,
                   s.symbol
            FROM TRADINGPOST_TRANSACTION TT
                     INNER JOIN tradingpost_brokerage_account tba ON
                tba.id = tt.account_id
                     INNER JOIN SECURITY s ON
                s.id = tt.security_id
                     INNER JOIN data_subscription SUBSCRIPTION ON
                tba.user_id = SUBSCRIPTION.user_id
                     INNER JOIN data_user du ON
                du.ID = SUBSCRIPTION.USER_ID
                     INNER JOIN DATA_SUBSCRIBER subscriber
                                ON
                                    subscriber.subscription_id = SUBSCRIPTION.id
            WHERE subscriber.user_id = $1
              AND SECURITY_TYPE NOT IN ('cashEquivalent') AND tt.type NOT IN ('cancel')
            ORDER BY date DESC
            LIMIT $2 OFFSET $3;`
        const limit = req.extra.limit && req.extra.limit > 0 ? req.extra.limit : 30;
        const offset = (req.extra.page ? req.extra.page : 0) * limit;
        const results = await
            pool.query<{ id: number, date: Date, price: string, type: string, handle: string, symbol: string }>(
                query, [req.extra.userId, limit, offset]
            );

        if (results.rows.length <= 0) return [];

        let res: ListTradesResponse[] = [];

        results.rows.forEach(r => {
            let y: ListTradesResponse = {
                dateTime: r.date.toString(),
                handle: r.handle,
                id: r.id,
                price: r.price,
                type: r.type,
                symbol: r.symbol
            }
            res.push(y)
        });

        return res;
    }
})