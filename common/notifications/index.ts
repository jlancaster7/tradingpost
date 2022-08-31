import {messaging} from 'firebase-admin';
import {
    Message,
    MessageOptions,
    INotificationsRepository,
    MulticastMessageResponse,
    MessageResponse
} from "./interfaces";
import {Message as FirebaseMessage} from 'firebase-admin/lib/messaging'

export interface BulkMessage {
    token: string
    title: string
    body: string
    imageUrl?: string
    provider?: "Android" | "Apple"
    data: Record<string, any>
}

export default class Notifications {
    private iOSMessenger: messaging.Messaging;
    private androidMessenger: messaging.Messaging;
    private repository: INotificationsRepository

    constructor(iosMessenger: messaging.Messaging, androidMessenger: messaging.Messaging, repository: INotificationsRepository) {
        this.iOSMessenger = iosMessenger
        this.androidMessenger = androidMessenger
        this.repository = repository
    }

    sendBatchMessages = async (msgs: BulkMessage[]): Promise<void> => {
        const bulkMessages: FirebaseMessage[] = [];
        const appleMessages: FirebaseMessage[] = [];
        const androidMessages: FirebaseMessage[] = [];
        msgs.forEach(msg => {
            let fbMsg = {
                notification: {
                    title: msg.title,
                    body: msg.body,
                    imageUrl: msg.imageUrl
                },
                token: msg.token,
                data: msg.data
            };

            if (msg.provider === 'Android') androidMessages.push(fbMsg)
            if (msg.provider === 'Apple') appleMessages.push(fbMsg)
            if (!msg.provider) bulkMessages.push(fbMsg)
        });

        if (bulkMessages.length > 500) throw new Error("bulk messages must be less than 500");
        if (appleMessages.length > 500) throw new Error("iOs bulk messages must be less than 500");
        if (androidMessages.length > 500) throw new Error("android bulk messages must be less than 500");

        try {
            if (appleMessages.length > 0) await this.iOSMessenger.sendAll(appleMessages)
            if (androidMessages.length > 0) await this.androidMessenger.sendAll(androidMessages);
            if (bulkMessages.length > 0) await this.iOSMessenger.sendAll(bulkMessages);
        } catch (e) {
            throw e;
        }
    }

    sendMessageToUser = async (userId: string, msg: Message, msgOpts?: MessageOptions): Promise<MessageResponse> => {
        const userDevices = await this.repository.getUserDevices(userId)
        const errors: MessageResponse = {errors: []};

        for (let i = 0; i < userDevices.length; i++) {
            const userDevice = userDevices[i];
            try {
                let sendMsg: messaging.Message = {
                    token: userDevice.deviceId, data: msg.data, notification: {
                        title: msg.title,
                        body: msg.body,
                        imageUrl: msg.imageUrl
                    }
                };
                switch (userDevice.provider) {
                    case "Apple":
                        sendMsg.apns = {
                            ...sendMsg.apns,
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
                        errors.errors.push({
                            userId: userDevice.userId,
                            deviceId: userDevice.deviceId,
                            reason: `Unknown notification provider registered: Provider:[${userDevice.provider}] for sending notification`
                        })
                }
            } catch (e: any) {
                errors.errors.push({
                    userId: userDevice.userId,
                    deviceId: userDevice.deviceId,
                    reason: e.toString()
                })
            }
        }

        return errors;
    }

    // sendMessageToUserDevices all tokens passed should be for a single provider(e.g., Apple, v. Android)
    sendMessageToUserDevices = async (userId: string, deviceIds: string[], provider: string, msg: Message, msgOpts?: MessageOptions): Promise<MulticastMessageResponse> => {
        if (deviceIds.length > 500) throw new Error("device ids limited to 500 per request")
        try {
            let sendMsg: messaging.MulticastMessage = {
                data: msg.data,
                tokens: deviceIds,
                notification: {
                    title: msg.title,
                    body: msg.body,
                    imageUrl: msg.imageUrl
                }
            };

            switch (provider) {
                case "Apple":
                    sendMsg.apns = {
                        ...sendMsg.apns,
                        fcmOptions: {
                            imageUrl: msg.imageUrl,
                            analyticsLabel: msgOpts?.analyticsLabel
                        }
                    }
                    await this.iOSMessenger.sendMulticast(sendMsg)
                    break;
                case "Android":
                    sendMsg.android = {
                        ...sendMsg.android,
                        fcmOptions: {
                            analyticsLabel: msgOpts?.analyticsLabel
                        }
                    }
                    await this.androidMessenger.sendMulticast(sendMsg);
                    break;
                case "Web": // TODO: Implement Web Notifications
                    break;
                default:
                    return {
                        errors: [{
                            userId: userId,
                            deviceIds: deviceIds,
                            reason: `Unknown notification provider registered: Provider:[${provider}] for sending notification`
                        }]
                    }
            }
        } catch (e: any) {
            return {
                errors: [{
                    userId: userId,
                    deviceIds: deviceIds,
                    reason: e.toString()
                }]
            }
        }

        return {errors: []}
    }
}