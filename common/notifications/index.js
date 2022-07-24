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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notifications = exports.Repository = void 0;
const repository_1 = __importDefault(require("./repository"));
exports.Repository = repository_1.default;
class Notifications {
    constructor(iosMessenger, androidMessenger, repository) {
        this.sendMessageToUser = (userId, msg, msgOpts) => __awaiter(this, void 0, void 0, function* () {
            const userDevices = yield this.repository.getUserDevices(userId);
            const errors = [];
            for (let i = 0; i < userDevices.length; i++) {
                const userDevice = userDevices[i];
                try {
                    let sendMsg = { token: userDevice.deviceId };
                    switch (userDevice.provider) {
                        case "Apple":
                            sendMsg.apns = Object.assign(Object.assign({}, sendMsg.apns), { headers: {}, payload: {
                                    aps: {}
                                }, fcmOptions: {
                                    imageUrl: msg.imageUrl,
                                    analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                                } });
                            yield this.iOSMessenger.send(sendMsg);
                            break;
                        case "Android":
                            sendMsg.android = Object.assign(Object.assign({}, sendMsg.android), { notification: {
                                    title: msg.title,
                                    body: msg.body,
                                    imageUrl: msg.imageUrl
                                }, fcmOptions: {
                                    analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                                } });
                            yield this.androidMessenger.send(sendMsg);
                            break;
                        case "Web":
                            // TODO: Implement later
                            break;
                        default:
                            errors.push({
                                userId: userDevice.userId,
                                deviceId: userDevice.deviceId,
                                reason: `Unknown notification provider registered: Provider:[${userDevice.provider}] for sending notification`
                            });
                    }
                }
                catch (e) {
                    errors.push({
                        userId: userDevice.userId,
                        deviceId: userDevice.deviceId,
                        reason: e.toString()
                    });
                }
            }
            return { errors };
        });
        this.sendMessageToUserDevice = (userId, deviceId, msg, msgOpts) => __awaiter(this, void 0, void 0, function* () {
            let userDevice;
            try {
                userDevice = yield this.repository.getUserDeviceByDeviceId(deviceId);
            }
            catch (e) {
                return {
                    errors: [{ userId, deviceId, reason: e.toString() }]
                };
            }
            try {
                let sendMsg = { token: deviceId };
                switch (userDevice.provider) {
                    case "Apple":
                        sendMsg.apns = Object.assign(Object.assign({}, sendMsg.apns), { headers: {}, payload: {
                                aps: {}
                            }, fcmOptions: {
                                imageUrl: msg.imageUrl,
                                analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                            } });
                        yield this.iOSMessenger.send(sendMsg);
                        break;
                    case "Android":
                        sendMsg.android = Object.assign(Object.assign({}, sendMsg.android), { notification: {
                                title: msg.title,
                                body: msg.body,
                                imageUrl: msg.imageUrl
                            }, fcmOptions: {
                                analyticsLabel: msgOpts === null || msgOpts === void 0 ? void 0 : msgOpts.analyticsLabel
                            } });
                        yield this.androidMessenger.send(sendMsg);
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
                        };
                }
            }
            catch (e) {
                return {
                    errors: [{
                            userId: userId,
                            deviceId: deviceId,
                            reason: e.toString()
                        }]
                };
            }
            return { errors: [] };
        });
        this.sendMessageToAllUsers = (msg, msgOptions) => __awaiter(this, void 0, void 0, function* () {
            // Paginate over
        });
        this.iOSMessenger = iosMessenger;
        this.androidMessenger = androidMessenger;
        this.repository = repository;
    }
}
exports.Notifications = Notifications;
