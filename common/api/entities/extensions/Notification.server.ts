import {ensureServerExtensions} from ".";
import Notification from "./Notification";
import {getHivePool} from "../../../db";
import {DateTime} from "luxon";
import {ListTradesResponse, ListAlertsResponse} from "../interfaces";

export default ensureServerExtensions<Notification>({
    seenNotifications: async (req): Promise<{}> => {
        
        if (!req.body.notificationIds || req.body.notificationIds.length <= 0) return {}

        const pool = await getHivePool;
        const query = `
            UPDATE notification
            SET seen = true
            WHERE id = ANY ($1::bigint[]);`;
        await pool.query(query, [req.body.notificationIds]);
        return {}
    },
    hasNotifications: async (req): Promise<{ unseenCount: number }> => {
        const pool = await getHivePool;
        const query = `SELECT count(*)
                       FROM notification
                       WHERE user_id = $1
                         and seen = FALSE;`
        const results = await pool.query<{ count: number }>(query, [req.extra.userId])
        if (results.rows.length <= 0) return {unseenCount: 0}
        return {unseenCount: results.rows[0].count};
    },
    listAlerts: async (req): Promise<ListAlertsResponse[]> => {
        const pool = await getHivePool;
        const query = `
            SELECT id,
                   user_id,
                   type,
                   date_time,
                   data,
                   seen
            FROM notification
            WHERE user_id = $1
            ORDER BY date_time DESC
            LIMIT $2 OFFSET $3;`;

        const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 30;
        const offset = (req.body.page ? req.body.page : 0) * limit;

        const results = await
            pool.query<{ id: number, user_id: string, type: string, date_time: Date, data: Record<string, any>, seen: boolean }>(
                query, [req.extra.userId, limit, offset]
            );

        if (results.rows.length <= 0) return [];

        let res: ListAlertsResponse[] = [];

        results.rows.forEach(r => {
            let y: ListAlertsResponse = {
                id: r.id,
                type: r.type,
                dateTime: DateTime.fromJSDate(r.date_time).toString(),
                data: r.data,
                seen: r.seen,
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
              AND SECURITY_TYPE NOT IN ('cashEquivalent')
              AND tt.type NOT IN ('cancel')
            ORDER BY date DESC
            LIMIT $2 OFFSET $3;`
        const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 30;
        const offset = (req.body.page ? req.body.page : 0) * limit;
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
    },
    registerUserDevice: async (req) => {
        try {
            const {userId} = req.extra;
            const {provider, deviceId, timezone} = req.body;
            const pool = await getHivePool;
            await pool.query("INSERT INTO user_device(user_id, provider, device_id, timezone) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING;", [userId, provider, deviceId, timezone]);
            return {}
        } catch (e) {
            console.error(e)
            return {}
        }

    },
    updateUserDeviceTimezone: async (req) => {
        try {
            const {deviceId, timezone} = req.body;
            const pool = await getHivePool;
            await pool.query("UPDATE user_device SET timezone=$1 WHERE device_id=$2;", [timezone, deviceId])
            return {}
        } catch (e) {
            console.error(e)
            return {}
        }
    }
})