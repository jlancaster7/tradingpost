import {TradeNotificationWithSubscriber, UserDevice} from "./interfaces";
import {IDatabase, IMain} from "pg-promise";
import {DateTime} from "luxon";

export default class Repository {
    private db: IDatabase<any>;
    private pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    getUserDevices = async (userId: string): Promise<UserDevice[]> => {
        return await this.getUsersDevices([userId]);
    }

    getUsersDevices = async (userIds: string[]): Promise<UserDevice[]> => {
        const response = await this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE user_id = ANY ($1::UUID)`, [userIds]);
        return response.map((row: any) => {
            return {
                userId: row[0],
                deviceId: row[1],
                provider: row[2],
                updatedAt: DateTime.fromJSDate(row[3]),
                createdAt: DateTime.fromJSDate(row[4])
            }
        });
    }

    getUserDeviceByDeviceId = async (deviceId: string): Promise<UserDevice> => {
        const response = await this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE device_id = $1`, [deviceId]);

        if (response.length <= 0) throw new Error(`device id ${deviceId} does not exist within our system`);

        return {
            userId: response[0],
            deviceId: response[1],
            provider: response[2],
            updatedAt: DateTime.fromJSDate(response[3]),
            createdAt: DateTime.fromJSDate(response[4])
        }
    }

    getTradeNotificationsWithSubscribers = async (tz: string, tradeDate: DateTime): Promise<TradeNotificationWithSubscriber[]> => {
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
                         AND date <= $3;`
        const startTradeDate = tradeDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
        const endTradeDate = tradeDate.set({hour: 23, minute: 59, second: 59, millisecond: 59});
        const response = await this.db.query(query, [tz, startTradeDate, endTradeDate])
        if (response.length <= 0) return [];
        return response.map((r: any) => {
            let o: TradeNotificationWithSubscriber = {
                accountId: r.account_id,
                securityId: r.security_id,
                date: DateTime.fromJSDate(r.date),
                subscriberUserId: r.subscriber_user_id,
                traderUserId: r.trader_user_id,
                subscriberProvider: r.subscriber_provider,
                subscriberDeviceId: r.subscriber_device_id,
                subscriberDeviceTimezone: r.subscriber_device_timezone
            }
            return o
        });
    }
}