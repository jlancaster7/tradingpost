"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
exports.default = (0, _1.ensureServerExtensions)({
/*
toggle: async (req) => {
    const pool = await getHivePool;

    await pool.query(`
                INSERT INTO data_notification_subscription (type, type_id, user_id, disabled, data)
                VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, type, type_id)
                          DO
                UPDATE SET type = EXCLUDED.type, data = EXCLUDED.data, type_id = EXCLUDED.type_id, disabled = EXCLUDED.disabled;`,
        [req.body.type, req.body.typeId, req.extra.userId, req.body.disabled, !req.body.data ? null : req.body.data])
    await pool.query(`DELETE
        FROM data_notification_subscription
        WHERE user_id = $1
          and type_id = $2
          and type = $3`, [req.extra.userId, req.body.id, NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION]);
    return req.body;
}
*/
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uU3Vic2NyaXB0aW9uLnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk5vdGlmaWNhdGlvblN1YnNjcmlwdGlvbi5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3QkFBeUM7QUFLekMsa0JBQWUsSUFBQSx5QkFBc0IsRUFBMkI7QUFDNUQ7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBaUJFO0NBQ0wsQ0FBQyxDQUFDIn0=