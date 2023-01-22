"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const db_1 = require("../../../db");
const luxon_1 = require("luxon");
exports.default = (0, _1.ensureServerExtensions)({
    seenNotifications: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.body.notificationIds || req.body.notificationIds.length <= 0)
            return {};
        const pool = yield db_1.getHivePool;
        const query = `
            UPDATE notification
            SET seen = true
            WHERE id = ANY ($1::bigint[]);`;
        yield pool.query(query, [req.body.notificationIds]);
        return {};
    }),
    hasNotifications: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const query = `SELECT count(*)
                       FROM notification
                       WHERE user_id = $1
                         and seen = FALSE;`;
        const results = yield pool.query(query, [req.extra.userId]);
        if (results.rows.length <= 0)
            return { unseenCount: 0 };
        return { unseenCount: results.rows[0].count };
    }),
    listAlerts: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
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
        const results = yield pool.query(query, [req.extra.userId, limit, offset]);
        if (results.rows.length <= 0)
            return [];
        let res = [];
        results.rows.forEach(r => {
            let y = {
                id: r.id,
                type: r.type,
                dateTime: luxon_1.DateTime.fromJSDate(r.date_time).toString(),
                data: r.data,
                seen: r.seen,
            };
            res.push(y);
        });
        return res;
    }),
    listTrades: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
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
            LIMIT $2 OFFSET $3;`;
        const limit = req.body.limit && req.body.limit > 0 ? req.body.limit : 30;
        const offset = (req.body.page ? req.body.page : 0) * limit;
        const results = yield pool.query(query, [req.extra.userId, limit, offset]);
        if (results.rows.length <= 0)
            return [];
        let res = [];
        results.rows.forEach(r => {
            let y = {
                dateTime: r.date.toString(),
                handle: r.handle,
                id: r.id,
                price: r.price,
                type: r.type,
                symbol: r.symbol
            };
            res.push(y);
        });
        return res;
    }),
    registerUserDevice: (req) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.extra;
            const { provider, deviceId, timezone } = req.body;
            const pool = yield db_1.getHivePool;
            yield pool.query("INSERT INTO user_device(user_id, provider, device_id, timezone) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING;", [userId, provider, deviceId, timezone]);
            return {};
        }
        catch (e) {
            console.error(e);
            return {};
        }
    }),
    updateUserDeviceTimezone: (req) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { deviceId, timezone } = req.body;
            const pool = yield db_1.getHivePool;
            yield pool.query("UPDATE user_device SET timezone=$1 WHERE device_id=$2;", [timezone, deviceId]);
            return {};
        }
        catch (e) {
            console.error(e);
            return {};
        }
    }),
    updateNotification: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const query = `UPDATE
                           NOTIFICATION
                       SET TYPE       = $1,
                           date_time  = $2,
                           DATA       = $3,
                           seen       = $4,
                           updated_at = NOW()
                       WHERE id = $5;`;
        const pool = yield db_1.getHivePool;
        console.log(req.body);
        const { type, dateTime, id, data, seen } = req.body;
        yield pool.query(query, [type, dateTime, data, seen, id]);
        return {};
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uLnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk5vdGlmaWNhdGlvbi5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFFekMsb0NBQXdDO0FBQ3hDLGlDQUErQjtBQUcvQixrQkFBZSxJQUFBLHlCQUFzQixFQUFlO0lBQ2hELGlCQUFpQixFQUFFLENBQU8sR0FBRyxFQUFlLEVBQUU7UUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sSUFBSSxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUE7UUFFaEYsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBVyxDQUFDO1FBQy9CLE1BQU0sS0FBSyxHQUFHOzs7MkNBR3FCLENBQUM7UUFDcEMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLEVBQUUsQ0FBQTtJQUNiLENBQUMsQ0FBQTtJQUNELGdCQUFnQixFQUFFLENBQU8sR0FBRyxFQUFvQyxFQUFFO1FBQzlELE1BQU0sSUFBSSxHQUFHLE1BQU0sZ0JBQVcsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRzs7OzJDQUdxQixDQUFBO1FBQ25DLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBb0IsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBQzlFLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU8sRUFBQyxXQUFXLEVBQUUsQ0FBQyxFQUFDLENBQUE7UUFDckQsT0FBTyxFQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFD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