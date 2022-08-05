<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e5e89424657ca800da44b808fd90b16b6ade0be7
import { messaging } from 'firebase-admin';
import { MessagesResponse, Message, MessageOptions, INotificationsRepository } from "./interfaces";
import Repository from "./repository";
export { Repository };
export declare class Notifications {
    private iOSMessenger;
    private androidMessenger;
    private repository;
    constructor(iosMessenger: messaging.Messaging, androidMessenger: messaging.Messaging, repository: INotificationsRepository);
<<<<<<< HEAD
    sendMessageToUser: (userId: string, msg: Message, msgOpts?: MessageOptions) => Promise<MessagesResponse>;
    sendMessageToUserDevice: (userId: string, deviceId: string, msg: Message, msgOpts?: MessageOptions) => Promise<MessagesResponse>;
    sendMessageToAllUsers: (msg: Message, msgOptions?: MessageOptions) => Promise<void>;
}
=======
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
>>>>>>> bb6d1a32694047823b9299de87e419c4c51c228c
=======
    sendMessageToUser: (userId: string, msg: Message, msgOpts?: MessageOptions | undefined) => Promise<MessagesResponse>;
    sendMessageToUserDevice: (userId: string, deviceId: string, msg: Message, msgOpts?: MessageOptions | undefined) => Promise<MessagesResponse>;
    sendMessageToAllUsers: (msg: Message, msgOptions?: MessageOptions | undefined) => Promise<void>;
}
>>>>>>> e5e89424657ca800da44b808fd90b16b6ade0be7
