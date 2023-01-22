"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Notifications {
    constructor(iosMessenger, androidMessenger, repository) {
        this.sendBatchMessages = (msgs) => __awaiter(this, void 0, void 0, function* () {
            const bulkMessages = [];
            const appleMessages = [];
            const androidMessages = [];
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
                if (msg.provider === 'Android')
                    androidMessages.push(fbMsg);
                if (msg.provider === 'Apple')
                    appleMessages.push(fbMsg);
                if (!msg.provider)
                    bulkMessages.push(fbMsg);
            });
            if (bulkMessages.length > 500)
                throw new Error("bulk messages must be less than 500");
            if (appleMessages.length > 500)
                throw new Error("iOs bulk messages must be less than 500");
            if (androidMessages.length > 500)
                throw new Error("android bulk messages must be less than 500");
            try {
                if (appleMessages.length > 0)
                    yield this.iOSMessenger.sendAll(appleMessages);
                if (androidMessages.length > 0)
                    yield this.androidMessenger.sendAll(androidMessages);
                if (bulkMessages.length > 0)
                    yield this.iOSMessenger.sendAll(bulkMessages);
            }
            catch (e) {
                throw e;
            }
        });
        this.sendMessageToUser = (userId, msg, msgOpts) => __awaiter(this, void 0, void 0, function* () {
            const userDevices = yield this.repository.getUserDevices(userId);
            const errors = { errors: [] };
            for (let i = 0; i < userDevices.length; i++) {
                const userDevice = userDevices[i];
                try {
                    let sendMsg = {
                        token: userDevice.deviceId, data: msg.data, notification: {
                            title: msg.title,
                            body: msg.body,
                            imageUrl: msg.imageUrl
                        }
                    };
                    switch (userDevice.provider) {
                        case "Apple":
                            sendMsg.apns = Object.assign(Object.assign({}, sendMsg.apns), { fcmOptions: {
                                    imageUrl: msg.imageUrl,
                                    analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                                } });
                            yield this.iOSMessenger.send(sendMsg);
                            break;
                        case "Android":
                            sendMsg.android = Object.assign(Object.assign({}, sendMsg.android), { fcmOptions: {
                                    analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                                } });
                            yield this.androidMessenger.send(sendMsg);
                            break;
                        case "Web":
                            // TODO: Implement later
                            break;
                        default:
                            errors.errors.push({
                                userId: userDevice.userId,
                                deviceId: userDevice.deviceId,
                                reason: `Unknown notification provider registered: Provider:[${userDevice.provider}] for sending notification`
                            });
                    }
                }
                catch (e) {
                    errors.errors.push({
                        userId: userDevice.userId,
                        deviceId: userDevice.deviceId,
                        reason: e.toString()
                    });
                }
            }
            return errors;
        });
        // sendMessageToUserDevices all tokens passed should be for a single provider(e.g., Apple, v. Android)
        this.sendMessageToUserDevices = (userId, deviceIds, provider, msg, msgOpts) => __awaiter(this, void 0, void 0, function* () {
            if (deviceIds.length > 500)
                throw new Error("device ids limited to 500 per request");
            try {
                let sendMsg = {
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
                        sendMsg.apns = Object.assign(Object.assign({}, sendMsg.apns), { fcmOptions: {
                                imageUrl: msg.imageUrl,
                                analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                            } });
                        yield this.iOSMessenger.sendMulticast(sendMsg);
                        break;
                    case "Android":
                        sendMsg.android = Object.assign(Object.assign({}, sendMsg.android), { fcmOptions: {
                                analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                            } });
                        yield this.androidMessenger.sendMulticast(sendMsg);
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
                        };
                }
            }
            catch (e) {
                return {
                    errors: [{
                            userId: userId,
                            deviceIds: deviceIds,
                            reason: e.toString()
                        }]
                };
            }
            return { errors: [] };
        });
        this.iOSMessenger = iosMessenger;
        this.androidMessenger = androidMessenger;
        this.repository = repository;
    }
}
exports.default = Notifications;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW1CQSxNQUFxQixhQUFhO0lBSzlCLFlBQVksWUFBaUMsRUFBRSxnQkFBcUMsRUFBRSxVQUFvQztRQU0xSCxzQkFBaUIsR0FBRyxDQUFPLElBQW1CLEVBQWlCLEVBQUU7WUFDN0QsTUFBTSxZQUFZLEdBQXNCLEVBQUUsQ0FBQztZQUMzQyxNQUFNLGFBQWEsR0FBc0IsRUFBRSxDQUFDO1lBQzVDLE1BQU0sZUFBZSxHQUFzQixFQUFFLENBQUM7WUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDZixJQUFJLEtBQUssR0FBRztvQkFDUixZQUFZLEVBQUU7d0JBQ1YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO3dCQUNoQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7d0JBQ2QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO3FCQUN6QjtvQkFDRCxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtpQkFDakIsQ0FBQztnQkFFRixJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssU0FBUztvQkFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUMzRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssT0FBTztvQkFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVE7b0JBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMvQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxHQUFHO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUN0RixJQUFJLGFBQWEsQ0FBQyxN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