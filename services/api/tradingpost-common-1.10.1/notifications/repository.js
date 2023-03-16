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
const luxon_1 = require("luxon");
class Repository {
    constructor(db, pgp) {
        this.getUserDevices = (userId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.getUsersDevices([userId]);
        });
        this.getUsersDevices = (userIds) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at,
                   active
            FROM user_device
            WHERE user_id IN ($1:list)
              AND active = TRUE;`, [userIds]);
            return response.map((row) => {
                return {
                    userId: row.user_id,
                    deviceId: row.device_id,
                    provider: row.provider,
                    updatedAt: luxon_1.DateTime.fromJSDate(row.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                    active: row.active
                };
            });
        });
        this.getUserDeviceByDeviceId = (deviceId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at,
                   active
            FROM user_device
            WHERE device_id = $1`, [deviceId]);
            if (response.length <= 0)
                throw new Error(`device id ${deviceId} does not exist within our system`);
            return {
                userId: response[0],
                deviceId: response[1],
                provider: response[2],
                updatedAt: luxon_1.DateTime.fromJSDate(response[3]),
                createdAt: luxon_1.DateTime.fromJSDate(response[4]),
                active: response[5]
            };
        });
        this.addNewTradeNotification = (userId, msg) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO notification (user_id, type, date_time, data)
                       VALUES ($1, 'NEW_TRADES', NOW(), $2);`;
            yield this.db.none(query, [userId, { message: msg }]);
        });
        this.getUsersWithTrades = (startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT tt.date,
                   tba.user_id,
                   tt.security_id
            FROM tradingpost_transaction tt
                     INNER JOIN tradingpost_brokerage_account tba ON tba.id = tt.account_id
            WHERE tt.date >= $1
              AND tt.date <= $2
              AND tt.SECURITY_TYPE NOT IN ('cashEquivalent');
        `;
            const st = startDate.setZone("America/New_York").set({ hour: 0, second: 0, minute: 0, millisecond: 0 });
            const et = endDate.setZone("America/New_York").set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
            const response = yield this.db.query(query, [st, et]);
            if (response.length <= 0)
                return [];
            return response.map(r => {
                return {
                    date: luxon_1.DateTime.fromJSDate(r.date),
                    userId: r.user_id,
                    securityId: r.security_id
                };
            });
        });
        this.getSubscribers = (userIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT ds.user_id  as subscriber_user_id,
                   ds2.user_id as service_user_id
            FROM data_subscriber ds
                     INNER JOIN data_subscription ds2 on ds.subscription_id = ds2.id
            where ds2.user_id in ($1:list);
        `;
            const response = yield this.db.query(query, [userIds]);
            if (response.length <= 0)
                return [];
            return response.map(r => {
                return {
                    subscriberUserId: r.subscriber_user_id,
                    serviceUserId: r.service_user_id
                };
            });
        });
        this.getUsersAndWatchlists = () => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT dw.id       AS watchlist_id,
                              dw.name     AS watchlist_name,
                              dwi.symbol  AS symbol,
                              dns.user_id AS user_id
                       FROM data_notification_subscription dns
                                INNER JOIN data_watchlist dw ON dw.id = dns.type_id
                                INNER JOIN data_watchlist_item dwi ON dwi.watchlist_id = dw.id
                       WHERE disabled = FALSE
                         AND dns.type = 'WATCHLIST_NOTIFICATION';`;
            const response = yield this.db.query(query);
            if (response.length <= 0)
                return [{}, {}];
            let idToName = {};
            let usersAndWatchlists = {};
            response.forEach(r => {
                let uh = usersAndWatchlists[r.user_id];
                if (!uh)
                    uh = {};
                let wi = uh[r.watchlist_id];
                if (!wi) {
                    wi = [];
                    idToName[r.watchlist_id] = r.watchlist_name;
                }
                wi.push("$" + r.symbol.toLowerCase());
                uh[r.watchlist_id] = wi;
                usersAndWatchlists[r.user_id] = uh;
            });
            return [usersAndWatchlists, idToName];
        });
        this.getUsersCurrentHoldings = () => __awaiter(this, void 0, void 0, function* () {
            let usersAndHoldings = {};
            const query = `
            SELECT s.symbol,
                   user_id
            FROM data_user du
                     INNER JOIN tradingpost_brokerage_account tba ON du.id = tba.user_id
                     INNER JOIN tradingpost_current_holding tch ON tch.account_id = tba.id
                     INNER JOIN
                 SECURITY s ON s.id = tch.security_id
            GROUP BY s.symbol,
                     user_id;
        `;
            const response = yield this.db.query(query);
            if (response.length <= 0)
                return {};
            response.forEach(r => {
                let uh = usersAndHoldings[r.user_id];
                if (!uh)
                    uh = [];
                uh.push("$" + r.symbol.toLowerCase());
                usersAndHoldings[r.user_id] = uh;
            });
            return usersAndHoldings;
        });
        this.getUserBlockedList = (userId) => __awaiter(this, void 0, void 0, function* () {
            const blocks = yield this.db.query(`select blocked_user_id
                                                                           from data_block_list dbl
                                                                           where blocked_by_id = $1;`, [userId]);
            return blocks.map(b => b.blocked_user_id);
        });
        this.getUserSubscriberList = (userId) => __awaiter(this, void 0, void 0, function* () {
            const subscriptions = yield this.db.query(`SELECT dsp.user_id AS "analyst_user_id"
                                                                                  FROM data_subscriber dsr
                                                                                           LEFT JOIN data_subscription dsp
                                                                                                     ON dsp.id = dsr.subscription_id
                                                                                  WHERE dsr.user_id = $1`, [userId]);
            return subscriptions.map(s => s.analyst_user_id);
        });
        this.disableUserDevices = (deviceIds) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.none(`UPDATE user_device
                            SET active = FALSE
                            WHERE device_id IN ($1:list);`, [deviceIds]);
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.default = Repository;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSxpQ0FBK0I7QUFFL0IsTUFBcUIsVUFBVTtJQUkzQixZQUFZLEVBQWtCLEVBQUUsR0FBVTtRQUsxQyxtQkFBYyxHQUFHLENBQU8sTUFBYyxFQUF5QixFQUFFO1lBQzdELE9BQU8sTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUEsQ0FBQTtRQUVELG9CQUFlLEdBQUcsQ0FBTyxPQUFpQixFQUF5QixFQUFFO1lBQ2pFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7OztpQ0FTWixFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0QyxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDN0IsT0FBTztvQkFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ25CLFFBQVEsRUFBRSxHQUFHLENBQUMsU0FBUztvQkFDdkIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztvQkFDOUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7b0JBQzlDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtpQkFDckIsQ0FBQTtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFBLENBQUE7UUFFRCw0QkFBdUIsR0FBRyxDQUFPLFFBQWdCLEVBQXVCLEVBQUU7WUFDdEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7Ozs7Ozs7aUNBUVosRUFBRSxD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