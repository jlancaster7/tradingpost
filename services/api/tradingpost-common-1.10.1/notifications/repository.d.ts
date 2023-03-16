import { UserDevice } from "./interfaces";
import { IDatabase, IMain } from "pg-promise";
import { DateTime } from "luxon";
export default class Repository {
    private db;
    private pgp;
    constructor(db: IDatabase<any>, pgp: IMain);
    getUserDevices: (userId: string) => Promise<UserDevice[]>;
    getUsersDevices: (userIds: string[]) => Promise<UserDevice[]>;
    getUserDeviceByDeviceId: (deviceId: string) => Promise<UserDevice>;
    addNewTradeNotification: (userId: string, msg: string) => Promise<void>;
    getUsersWithTrades: (startDate: DateTime, endDate: DateTime) => Promise<{
        date: DateTime;
        userId: string;
        securityId: number;
    }[]>;
    getSubscribers: (userIds: string[]) => Promise<{
        subscriberUserId: string;
        serviceUserId: string;
    }[]>;
    getUsersAndWatchlists: () => Promise<[Record<string, Record<number, string[]>>, Record<number, string>]>;
    getUsersCurrentHoldings: () => Promise<Record<string, string[]>>;
    getUserBlockedList: (userId: string) => Promise<string[]>;
    getUserSubscriberList: (userId: string) => Promise<string[]>;
    disableUserDevices: (deviceIds: string[]) => Promise<void>;
}
