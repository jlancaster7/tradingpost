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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFFQSw4REFBcUM7QUFFN0IscUJBRkQsb0JBQVUsQ0FFQztBQUVsQixNQUFhLGFBQWE7SUFLdEIsWUFBWSxZQUFpQyxFQUFFLGdCQUFxQyxFQUFFLFVBQW9DO1FBTTFILHNCQUFpQixHQUFHLENBQU8sTUFBYyxFQUFFLEdBQVksRUFBRSxPQUF3QixFQUE2QixFQUFFO1lBQzVHLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDaEUsTUFBTSxNQUFNLEdBSU4sRUFBRSxDQUFDO1lBRVQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsSUFBSTtvQkFDQSxJQUFJLE9BQU8sR0FBc0IsRUFBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBQyxDQUFDO29CQUM5RCxRQUFRLFVBQVUsQ0FBQyxRQUFRLEVBQUU7d0JBQ3pCLEtBQUssT0FBTzs0QkFDUixPQUFPLENBQUMsSUFBSSxtQ0FDTCxPQUFPLENBQUMsSUFBSSxLQUNmLE9BQU8sRUFBRSxFQUFFLEVBQ1gsT0FBTyxFQUFFO29DQUNMLEdBQUcsRUFBRSxFQUFFO2lDQUNWLEVBQ0QsVUFBVSxFQUFFO29DQUNSLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQ0FDdEIsY0FBYyxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxjQUFjO2lDQUMxQyxHQUNKLENBQUE7NEJBQ0QsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTs0QkFDckMsTUFBTTt3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