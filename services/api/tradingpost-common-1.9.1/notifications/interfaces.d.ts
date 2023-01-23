import { DateTime } from "luxon";
export interface BulkMessage {
    token: string;
    title: string;
    body: string;
    imageUrl?: string;
    provider?: "Android" | "Apple";
    data: Record<string, any>;
}
export type Message = {
    data: Record<string, any>;
    title?: string;
    body?: string;
    imageUrl?: string;
};
export type UserDevice = {
    userId: string;
    deviceId: string;
    provider: "Apple" | "Android" | "Web";
    updatedAt: DateTime;
    createdAt: DateTime;
};
export type MessageOptions = {
    analyticsLabel?: string;
};
export interface INotificationsRepository {
    getUserDevices(userId: string): Promise<UserDevice[]>;
    getUsersDevices(userIds: string[]): Promise<UserDevice[]>;
    getUserDeviceByDeviceId(deviceId: string): Promise<UserDevice>;
}
export type MessageResponse = {
    errors: {
        reason: string;
        deviceId: string;
        userId: string;
    }[];
};
export type MulticastMessageResponse = {
    errors: {
        reason: string;
        deviceIds: string[];
        userId: string;
    }[];
};
export type TradeNotificationWithSubscriber = {
    securityId: number;
    accountId: number;
    date: DateTime;
    subscriberUserId: string;
    subscriberDeviceId: string;
    subscriberProvider: string;
    subscriberDeviceTimezone: string;
    traderUserId: string;
};
