import {ensureServerExtensions} from ".";
import {getHivePool} from "../../../db";
import NotificationSubscription from "./NotificationSubscription";


export default ensureServerExtensions<NotificationSubscription>({
    toggle: async (req) => {
        const pool = await getHivePool;

        await pool.query(`
                    INSERT INTO data_notification_subscription (type, type_id, user_id, disabled, data)
                    VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, type, type_id)
                              DO
                    UPDATE SET type = EXCLUDED.type, data = EXCLUDED.data, type_id = EXCLUDED.type_id, disabled = EXCLUDED.disabled;`,
            [req.body.type, req.body.typeId, req.extra.userId, req.body.disabled, !req.body.data ? null : req.body.data])
        return req.body;
    },
    getStatus: async (req): Promise<{ disabled: boolean }> => {
        const pool = await getHivePool;

        const res = await pool.query<{ disabled: boolean }>(`SELECT disabled
                                                             FROM data_notification_subscription
                                                             WHERE type = $1
                                                               AND type_id = $2`, [req.body.type, req.body.typeId])
        if (res.rows.length <= 0) return {
            disabled: true
        }

        return {disabled: res.rows[0].disabled};
    }
});