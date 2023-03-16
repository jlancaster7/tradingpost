import { Message, INotificationsRepository } from "./interfaces";
import apn from "apn";
import AndroidNotifications from "./android";
import { DateTime } from "luxon";
export default class Notifications {
    private iOSMessenger;
    private androidMessenger;
    private repository;
    constructor(iosMessenger: apn.Provider, androidMessenger: AndroidNotifications, repository: INotificationsRepository);
    sendMessageToUserAndDevice: (userId: string, deviceIds: string[], deviceType: "ios" | "android" | "web", msg: Message, expDateTime?: DateTime) => Promise<void>;
    sendMessageToUser: (userId: string, msg: Message, expDateTime?: DateTime) => Promise<void>;
    private _sendToDevice;
}
