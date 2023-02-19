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

    addNewTradeNotification = async (userId: string, msg: string) => {
        const query = `INSERT INTO notification (user_id, type, date_time, data)
                       VALUES ($1, 'NEW_TRADES', NOW(), $2);`
        await this.db.none(query, [userId, {message: msg}]);
    }

    getUsersWithTrades = async (startDate: DateTime, endDate: DateTime): Promise<{ date: DateTime, userId: string, securityId: number }[]> => {
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
        const st = startDate.setZone("America/New_York").set({hour: 0, second: 0, minute: 0, millisecond: 0});
        const et = endDate.setZone("America/New_York").set({hour: 23, minute: 59, second: 59, millisecond: 999});
        const response = await this.db.query<{ date: Date, user_id: string, security_id: number }[]>(query, [st, et])
        if (response.length <= 0) return [];
        return response.map(r => {
            return {
                date: DateTime.fromJSDate(r.date),
                userId: r.user_id,
                securityId: r.security_id
            }
        });
    }

    getSubscribers = async (userIds: string[]) => {
        const query = `
            SELECT ds.user_id  as subscriber_user_id,
                   ds2.user_id as service_user_id
            FROM data_subscriber ds
                     INNER JOIN data_subscription ds2 on ds.subscription_id = ds2.id
            where ds2.user_id in ($1:list);
        `;
        const response = await this.db.query<{ subscriber_user_id: string, service_user_id: string }[]>(query, [userIds]);
        if (response.length <= 0) return [];
        return response.map(r => {
            return {
                subscriberUserId: r.subscriber_user_id,
                serviceUserId: r.service_user_id
            }
        })
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