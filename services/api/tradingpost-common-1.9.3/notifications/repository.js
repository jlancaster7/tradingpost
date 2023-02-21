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
                   created_at
            FROM user_device
            WHERE user_id = ANY ($1::UUID)`, [userIds]);
            return response.map((row) => {
                return {
                    userId: row[0],
                    deviceId: row[1],
                    provider: row[2],
                    updatedAt: luxon_1.DateTime.fromJSDate(row[3]),
                    createdAt: luxon_1.DateTime.fromJSDate(row[4])
                };
            });
        });
        this.getUserDeviceByDeviceId = (deviceId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE device_id = $1`, [deviceId]);
            if (response.length <= 0)
                throw new Error(`device id ${deviceId} does not exist within our system`);
            return {
                userId: response[0],
                deviceId: response[1],
                provider: response[2],
                updatedAt: luxon_1.DateTime.fromJSDate(response[3]),
                createdAt: luxon_1.DateTime.fromJSDate(response[4])
            };
        });
        this.getTradeNotificationsWithSubscribers = (tz, tradeDate) => __awaiter(this, void 0, void 0, function* () {
            const query = `WITH txs_with_subscription AS (SELECT tt.security_id,
                                                             tt.account_id,
                                                             tt.date,
                                                             ds.user_id,
                                                             ds.ID AS subscription_id
                                                      FROM TRADINGPOST_TRANSACTION TT
                                                               INNER JOIN TRADINGPOST_BROKERAGE_ACCOUNT TBA ON
                                                          TBA.id = TT.ACCOUNT_ID
                                                               INNER JOIN data_subscription ds ON ds.user_id = TBA.USER_ID)
                       SELECT tx.security_id,
                              tx.account_id,
                              tx.date,
                              ds.user_id   AS subscriber_user_id,
                              tx.user_id   AS trader_user_id,
                              ud.device_id AS subscriber_device_id,
                              ud.provider  AS subscriber_provider,
                              ud.timezone  AS subscriber_device_timezone
                       FROM data_subscriber AS ds
                                INNER JOIN USER_DEVICE UD ON ud.user_id = ds.USER_ID
                                LEFT JOIN txs_with_subscription tx ON tx.subscription_id = ds.subscription_id
                       WHERE ud.timezone = $1
                         AND date >= $2
                         AND date <= $3;`;
            const startTradeDate = tradeDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const endTradeDate = tradeDate.set({ hour: 23, minute: 59, second: 59, millisecond: 59 });
            const response = yield this.db.query(query, [tz, startTradeDate, endTradeDate]);
            if (response.length <= 0)
                return [];
            return response.map((r) => {
                let o = {
                    accountId: r.account_id,
                    securityId: r.security_id,
                    date: luxon_1.DateTime.fromJSDate(r.date),
                    subscriberUserId: r.subscriber_user_id,
                    traderUserId: r.trader_user_id,
                    subscriberProvider: r.subscriber_provider,
                    subscriberDeviceId: r.subscriber_device_id,
                    subscriberDeviceTimezone: r.subscriber_device_timezone
                };
                return o;
            });
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.default = Repository;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFFQSxpQ0FBK0I7QUFFL0IsTUFBcUIsVUFBVTtJQUkzQixZQUFZLEVBQWtCLEVBQUUsR0FBVTtRQUsxQyxtQkFBYyxHQUFHLENBQU8sTUFBYyxFQUF5QixFQUFFO1lBQzdELE9BQU8sTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUEsQ0FBQTtRQUVELG9CQUFlLEdBQUcsQ0FBTyxPQUFpQixFQUF5QixFQUFFO1lBQ2pFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7MkNBT0YsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEQsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQzdCLE9BQU87b0JBQ0gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNoQixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QyxDQUFBO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUEsQ0FBQTtRQUVELDRCQUF1QixHQUFHLENBQU8sUUFBZ0IsRUFBdUIsRUFBRTtZQUN0RSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozs7O2lDQU9aLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRXZDLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxRQUFRLG1DQUFtQyxDQUFDLENBQUM7WUFFcEcsT0FBTztnQkFDSCxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlDLENBQUE7UUFDTCxDQUFDLENBQUEsQ0FBQTtRQUVELHlDQUFvQyxHQUFHLENBQU8sRUFBVSxFQUFFLFNBQW1CLEVBQThDLEVBQUU7WUFDekgsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBc0JtQixDQUFBO1lBQ2pDLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7WUFDeEYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUE7WUFDL0UsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFDcEMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxHQUFvQztvQkFDckMsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVO29CQUN2QixVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVc7b0JBQ3pCLElBQUksRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNqQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsa0JBQWtCO29CQUN0QyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQzlCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxtQkFBbUI7b0JBQ3pDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxvQkFBb0I7b0JBQzFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQywwQkFBMEI7aUJBQ3pELENBQUE7Z0JBQ0QsT0FBTyxDQUFDLENBQUE7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFBO1FBMUZHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztDQXlGSjtBQWhHRCw2QkFnR0MifQ==