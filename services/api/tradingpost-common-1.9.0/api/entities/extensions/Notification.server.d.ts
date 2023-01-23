import { ListTradesResponse, ListAlertsResponse } from "../interfaces";
declare const _default: {
    listAlerts: (req: {
        body: {
            page?: number | undefined;
            limit?: number | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<ListAlertsResponse[]>;
    listTrades: (req: {
        body: {
            page?: number | undefined;
            limit?: number | undefined;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<ListTradesResponse[]>;
    registerUserDevice: (req: {
        body: {
            provider: string;
            deviceId: string;
            timezone: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    updateUserDeviceTimezone: (req: {
        body: {
            deviceId: string;
            timezone: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    seenNotifications: (req: {
        body: {
            notificationIds: number[];
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
    hasNotifications: (req: {
        body: void;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        unseenCount: number;
    }>;
    updateNotification: (req: {
        body: ListAlertsResponse;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{}>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
