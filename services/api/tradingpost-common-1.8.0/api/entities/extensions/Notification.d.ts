import Extension from ".";
import { ListAlertsResponse, ListTradesResponse } from "../interfaces";
export default class extends Extension {
    listAlerts: (settings: {
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<ListAlertsResponse[]>;
    listTrades: (settings: {
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<ListTradesResponse[]>;
    registerUserDevice: (settings: {
        provider: string;
        deviceId: string;
        timezone: string;
    }) => Promise<{}>;
    updateUserDeviceTimezone: (settings: {
        deviceId: string;
        timezone: string;
    }) => Promise<{}>;
    seenNotifications: (settings: {
        notificationIds: number[];
    }) => Promise<{}>;
    hasNotifications: (settings: void) => Promise<{
        unseenCount: number;
    }>;
    updateNotification: (settings: ListAlertsResponse) => Promise<{}>;
}
