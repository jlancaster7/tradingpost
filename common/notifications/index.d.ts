import { messaging } from 'firebase-admin';
import { Message, MessageOptions, INotificationsRepository, MulticastMessageResponse, MessageResponse } from "./interfaces";
import apn from "apn";
export interface BulkMessage {
    token: string;
    title: string;
    body: string;
    imageUrl?: string;
    provider?: "Android" | "Apple";
    data: Record<string, any>;
}
export default class Notifications {
    private iOSMessenger;
    private androidMessenger;
    private repository;
    constructor(iosMessenger: apn.Provider, androidMessenger: messaging.Messaging, repository: INotificationsRepository);
    sendBatchMessages: (msgs: BulkMessage[]) => Promise<void>;
    testMessage: () => Promise<void>;
    sendMessageToUser: (userId: string, msg: Message, msgOpts?: MessageOptions) => Promise<MessageResponse>;
    sendMessageToUserDevices: (userId: string, deviceIds: string[], provider: string, msg: Message, msgOpts?: MessageOptions) => Promise<MulticastMessageResponse>;
}
