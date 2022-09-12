import {ensureServerExtensions} from ".";
import Notification from "./Notification";
import {getHivePool} from "../../../db/index";
import {DateTime} from "luxon";

export default ensureServerExtensions<Notification>({
    // listNotifications: async (req) => {
    //     const pool = await getHivePool;
    //     const query = `
    //         SELECT id,
    //                user_id,
    //                type,
    //                date_time,
    //                data
    //         FROM notification
    //         WHERE user_id = $1
    //         ORDER BY date_time DESC
    //         LIMIT $2 OFFSET $3;
    //     `;
    //     const limit = req.extra.limit && req.extra.limit > 0 ? req.extra.limit : 30;
    //     const offset = (req.extra.page ? req.extra.page : 0) * limit;
    //
    //     const results = await
    //         pool.query<{ id: number, user_id: string, type: string, date_time: Date, data: Record<string, any> }>(
    //             query, [req.extra.userId, limit, offset]
    //         );
    //
    //     if (results.rows.length <= 0) return 0;
    //
    //     return results.rows.map(r => {
    //         return {
    //             type: r.type,
    //             dateTime: DateTime.fromJSDate(r.date_time),
    //             data: r.data
    //         }
    //     })
    // }
})