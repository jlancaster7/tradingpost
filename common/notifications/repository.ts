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
                   created_at,
                   active
            FROM user_device
            WHERE user_id IN ($1:list)
              AND active = TRUE;`, [userIds]);
        return response.map((row: any) => {
            return {
                userId: row.user_id,
                deviceId: row.device_id,
                provider: row.provider,
                updatedAt: DateTime.fromJSDate(row.updated_at),
                createdAt: DateTime.fromJSDate(row.created_at),
                active: row.active
            }
        });
    }

    getUserDeviceByDeviceId = async (deviceId: string): Promise<UserDevice> => {
        const response = await this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at,
                   active
            FROM user_device
            WHERE device_id = $1`, [deviceId]);

        if (response.length <= 0) throw new Error(`device id ${deviceId} does not exist within our system`);

        return {
            userId: response[0],
            deviceId: response[1],
            provider: response[2],
            updatedAt: DateTime.fromJSDate(response[3]),
            createdAt: DateTime.fromJSDate(response[4]),
            active: response[5]
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

    getUsersAndWatchlists = async (): Promise<[Record<string, Record<number, string[]>>, Record<number, string>]> => {
        const query = `SELECT dw.id       AS watchlist_id,
                              dw.name     AS watchlist_name,
                              dwi.symbol  AS symbol,
                              dns.user_id AS user_id
                       FROM data_notification_subscription dns
                                INNER JOIN data_watchlist dw ON dw.id = dns.type_id
                                INNER JOIN data_watchlist_item dwi ON dwi.watchlist_id = dw.id
                       WHERE disabled = FALSE
                         AND dns.type = 'WATCHLIST_NOTIFICATION';`;
        const response = await this.db.query<{ watchlist_id: number, watchlist_name: string, symbol: string, user_id: string }[]>(query);
        if (response.length <= 0) return [{}, {}];

        let idToName: Record<number, string> = {};
        let usersAndWatchlists: Record<string, Record<number, string[]>> = {};
        response.forEach(r => {
            let uh = usersAndWatchlists[r.user_id];
            if (!uh) uh = {};

            let wi = uh[r.watchlist_id];
            if (!wi) {
                wi = [];
                idToName[r.watchlist_id] = r.watchlist_name
            }

            wi.push("$" + r.symbol.toLowerCase())
            uh[r.watchlist_id] = wi;

            usersAndWatchlists[r.user_id] = uh
        });

        return [usersAndWatchlists, idToName];
    }

    getUsersCurrentHoldings = async () => {
        let usersAndHoldings: Record<string, string[]> = {};

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
        const response = await this.db.query<{ symbol: string, user_id: string }[]>(query);
        if (response.length <= 0) return {};
        response.forEach(r => {
            let uh = usersAndHoldings[r.user_id];
            if (!uh) uh = [];
            uh.push("$" + r.symbol.toLowerCase());
            usersAndHoldings[r.user_id] = uh;
        });
        return usersAndHoldings;
    }

    getUserBlockedList = async (userId: string): Promise<string[]> => {
        const blocks = await this.db.query<{ blocked_user_id: string }[]>(`select blocked_user_id
                                                                           from data_block_list dbl
                                                                           where blocked_by_id = $1;`, [userId]);
        return blocks.map(b => b.blocked_user_id);
    }

    getUserSubscriberList = async (userId: string): Promise<string[]> => {
        const subscriptions = await this.db.query<{ analyst_user_id: string }[]>(`SELECT dsp.user_id AS "analyst_user_id"
                                                                                  FROM data_subscriber dsr
                                                                                           LEFT JOIN data_subscription dsp
                                                                                                     ON dsp.id = dsr.subscription_id
                                                                                  WHERE dsr.user_id = $1`, [userId]);
        return subscriptions.map(s => s.analyst_user_id);
    }

    disableUserDevices = async (deviceIds: string[]): Promise<void> => {
        await this.db.none(`UPDATE user_device
                            SET active = FALSE
                            WHERE device_id IN ($1:list);`, [deviceIds]);
    }
}