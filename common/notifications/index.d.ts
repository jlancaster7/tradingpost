import { messaging } from 'firebase-admin';
import { MessagesResponse, Message, MessageOptions, INotificationsRepository } from "./interfaces";
import Repository from "./repository";
export { Repository };
export declare class Notifications {
    private iOSMessenger;
    private androidMessenger;
    private repository;
    constructor(iosMessenger: messaging.Messaging, androidMessenger: messaging.Messaging, repository: INotificationsRepository);
    sendMessageToUser: (userId: string, msg: Message, msgOpts?: MessageOptions) => Promise<MessagesResponse>;
    sendMessageToUserDevice: (userId: string, deviceId: string, msg: Message, msgOpts?: MessageOptions) => Promise<MessagesResponse>;
    sendMessageToAllUsers: (msg: Message, msgOptions?: MessageOptions) => Promise<void>;
}
