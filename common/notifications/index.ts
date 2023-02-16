import {
    Message,
    MessageOptions,
    INotificationsRepository,
    MulticastMessageResponse,
    MessageResponse, BulkMessage
} from "./interfaces";
import apn from "apn";
import AndroidNotifications from "./android";
import {DateTime} from "luxon";


class BadDeviceError extends Error {
    constructor() {
        super();
    }
}

export default class Notifications {
    private iOSMessenger: apn.Provider;
    private androidMessenger: AndroidNotifications;
    private repository: INotificationsRepository

    constructor(iosMessenger: apn.Provider, androidMessenger: AndroidNotifications, repository: INotificationsRepository) {
        this.iOSMessenger = iosMessenger
        this.androidMessenger = androidMessenger
        this.repository = repository
    }

    public sendMessageToUserAndDevice = async (userId: string, deviceIds: string[], deviceType: "ios" | "android" | "web", msg: Message, expDateTime: DateTime = DateTime.now().plus({hour: 5})) => {
        await this._sendToDevice(deviceType, deviceIds, msg, expDateTime);
    }

    public sendMessageToUser = async (userId: string, msg: Message, expDateTime: DateTime = DateTime.now().plus({hour: 5})): Promise<void> => {
        const userDevices = await this.repository.getUserDevices(userId)
        let androidDeviceIds: string[] = [];
        let iosDeviceIds: string[] = [];
        userDevices.forEach(u => {
            if (u.provider === 'ios') iosDeviceIds.push(u.deviceId);
            if (u.provider === 'android') androidDeviceIds.push(u.deviceId);
        });

        let badDevices: string[] = [];
        if (androidDeviceIds.length > 0) {
            const {failed} = await this._sendToDevice('android', androidDeviceIds, msg, expDateTime);
            badDevices = [...badDevices, ...failed];
        }

        if (iosDeviceIds.length > 0) {
            const {failed} = await this._sendToDevice('ios', iosDeviceIds, msg, expDateTime);
            badDevices = [...badDevices, ...failed];
        }

        if (badDevices.length > 0) await this.repository.disableUserDevices(badDevices);
    }

    private _sendToDevice = async (userDeviceType: "ios" | "android" | "web", deviceIds: string[], msg: Message, expDateTime: DateTime): Promise<{ failed: string[], successful: string[] }> => {
        let successRes: { failed: string[], successful: string[] } = {failed: [], successful: []}
        switch (userDeviceType) {
            case "ios":
                const note = new apn.Notification({
                    alert: {
                        title: msg.title,
                        body: msg.body,
                    },
                    payload: msg.data,
                    sound: 'ping.aiff',
                    badge: 3,
                    expiry: expDateTime.millisecond,  // Expires 1 hour from now.
                    topic: 'com.tradingpostapp'
                });

                if (msg.imageUrl) note.alert = {
                    "launch-image": msg.imageUrl,
                    body: msg.body
                }

                console.log("SENDING!!")
                const appleRes = await this.iOSMessenger.send(note, deviceIds);
                console.log(appleRes)
                appleRes.failed.forEach(f => successRes.failed.push(f.device))
                appleRes.sent.forEach(f => successRes.successful.push(f.device));
                return successRes
            case "android":
                const {success, failed} = await this.androidMessenger.send({
                    title: msg.title,
                    body: msg.body,
                    imageUrl: msg.imageUrl,
                    data: msg.data
                }, deviceIds);

                success.forEach(s => successRes.successful.push(s));
                failed.forEach(f => successRes.failed.push(f))
                return successRes
            default:
                throw new Error(`Unknown notification provider registered: Provider:[${userDeviceType}] for sending notification`);
        }
    }
}