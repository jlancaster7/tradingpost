import { TradeNotificationWithSubscriber, UserDevice } from "./interfaces";
import { IDatabase, IMain } from "pg-promise";
import { DateTime } from "luxon";
export default class Repository {
    private db;
    private pgp;
    constructor(db: IDatabase<any>, pgp: IMain);
    getUserDevices: (userId: string) => Promise<UserDevice[]>;
    getUsersDevices: (userIds: string[]) => Promise<UserDevice[]>;
    getUserDeviceByDeviceId: (deviceId: string) => Promise<UserDevice>;
    getTradeNotificationsWithSubscribers: (tz: string, tradeDate: DateTime) => Promise<TradeNotificationWithSubscriber[]>;
}
