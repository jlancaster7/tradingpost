import { messaging } from 'firebase-admin';
import { MessagesResponse, Message, MessageOptions, INotificationsRepository } from "./interfaces";
export default class Notifications {
    private iOSMessenger;
    private androidMessenger;
    private repository;
    constructor(iosMessenger: messaging.Messaging, androidMessenger: messaging.Messaging, repository: INotificationsRepository);
    sendMessageToUser: (userId: string, msg: Message, msgOpts?: MessageOptions | undefined) => Promise<MessagesResponse>;
    sendMessageToUserDevice: (userId: string, deviceId: string, msg: Message, msgOpts?: MessageOptions | undefined) => Promise<MessagesResponse>;
    sendMessageToAllUsers: (msg: Message, msgOptions?: MessageOptions | undefined) => Promise<void>;
}
