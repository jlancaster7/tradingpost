import { DateTime } from "luxon";
export declare type Message = {
    title?: string;
    body?: string;
    imageUrl?: string;
};
export declare type UserDevice = {
    userId: string;
    deviceId: string;
    provider: "Apple" | "Android" | "Web";
    updatedAt: DateTime;
    createdAt: DateTime;
};
export declare type MessageOptions = {
    analyticsLabel?: string;
};
export interface INotificationsRepository {
    getUserDevices(userId: string): Promise<UserDevice[]>;
    getUsersDevices(userIds: string[]): Promise<UserDevice[]>;
    getUserDeviceByDeviceId(deviceId: string): Promise<UserDevice>;
}
export declare type MessagesResponse = {
    errors: {
        reason: string;
        deviceId: string;
        userId: string;
    }[];
};
