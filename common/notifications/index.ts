import {messaging} from 'firebase-admin';
import {MessagesResponse, UserDevice, Message, MessageOptions, INotificationsRepository} from "./interfaces";


export default class Notifications {
    private iOSMessenger: messaging.Messaging;
    private androidMessenger: messaging.Messaging;
    private repository: INotificationsRepository

    constructor(iosMessenger: messaging.Messaging, androidMessenger: messaging.Messaging, repository: INotificationsRepository) {
        this.iOSMessenger = iosMessenger
        this.androidMessenger = androidMessenger
        this.repository = repository
    }

    sendMessageToUser = async (userId: string, msg: Message, msgOpts?: MessageOptions): Promise<MessagesResponse> => {
        const userDevices = await this.repository.getUserDevices(userId)
        const errors: {
            reason: string
            userId: string
            deviceId: string
        }[] = [];

        for (let i = 0; i < userDevices.length; i++) {
            const userDevice = userDevices[i];
            try {
                let sendMsg: messaging.Message = {token: userDevice.deviceId};
                switch (userDevice.provider) {
                    case "Apple":
                        sendMsg.apns = {
                            ...sendMsg.apns,
                            headers: {},
                            payload: {
                                aps: {}
                            },
                            fcmOptions: {
                                imageUrl: msg.imageUrl,
                                analyticsLabel: msgOpts?.analyticsLabel
                            }
                        }
                        await this.iOSMessenger.send(sendMsg)
                        break;
                    case "Android":
                        sendMsg.android = {
                            ...sendMsg.android,
                            notification: {
                                title: msg.title,
                                body: msg.body,
                                imageUrl: msg.imageUrl
                            },
                            fcmOptions: {
                                analyticsLabel: msgOpts?.analyticsLabel
                            }
                        }
                        await this.androidMessenger.send(sendMsg);
                        break;
                    case "Web":
                        // TODO: Implement later
                        break;
                    default:
                        errors.push({
                            userId: userDevice.userId,
                            deviceId: userDevice.deviceId,
                            reason: `Unknown notification provider registered: Provider:[${userDevice.provider}] for sending notification`
                        })
                }
            } catch (e: any) {
                errors.push({
                    userId: userDevice.userId,
                    deviceId: userDevice.deviceId,
                    reason: e.toString()
                })
            }
        }

        return {errors};
    }

    sendMessageToUserDevice = async (userId: string, deviceId: string, msg: Message, msgOpts?: MessageOptions): Promise<MessagesResponse> => {
        let userDevice: UserDevice;
        try {
            userDevice = await this.repository.getUserDeviceByDeviceId(deviceId);
        } catch (e: any) {
            return {
                errors: [{userId, deviceId, reason: e.toString()}]
            }
        }

        try {

            let sendMsg: messaging.Message = {token: deviceId};
            switch (userDevice.provider) {
                case "Apple":
                    sendMsg.apns = {
                        ...sendMsg.apns,
                        headers: {},
                        payload: {
                            aps: {}
                        },
                        fcmOptions: {
                            imageUrl: msg.imageUrl,
                            analyticsLabel: msgOpts?.analyticsLabel
                        }
                    }
                    await this.iOSMessenger.send(sendMsg)
                    break;
                case "Android":
                    sendMsg.android = {
                        ...sendMsg.android,
                        notification: {
                            title: msg.title,
                            body: msg.body,
                            imageUrl: msg.imageUrl
                        },
                        fcmOptions: {
                            analyticsLabel: msgOpts?.analyticsLabel
                        }
                    }
                    await this.androidMessenger.send(sendMsg);
                    break;
                case "Web": // TODO: Implement Web Notifications
                    break;
                default:
                    return {
                        errors: [{
                            userId: userId,
                            deviceId: deviceId,
                            reason: `Unknown notification provider registered: Provider:[${userDevice.provider}] for sending notification`
                        }]
                    }
            }
        } catch (e: any) {
            return {
                errors: [{
                    userId: userId,
                    deviceId: deviceId,
                    reason: e.toString()
                }]
            }
        }

        return {errors: []}
    }

    sendMessageToAllUsers = async (msg: Message, msgOptions?: MessageOptions) => {
        // Paginate over
    }
}