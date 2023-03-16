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
const apn_1 = __importDefault(require("apn"));
const luxon_1 = require("luxon");
class Notifications {
    constructor(iosMessenger, androidMessenger, repository) {
        this.sendMessageToUserAndDevice = (userId, deviceIds, deviceType, msg, expDateTime = luxon_1.DateTime.now().plus({ hour: 5 })) => __awaiter(this, void 0, void 0, function* () {
            yield this._sendToDevice(deviceType, deviceIds, msg, expDateTime);
        });
        this.sendMessageToUser = (userId, msg, expDateTime = luxon_1.DateTime.now().plus({ hour: 5 })) => __awaiter(this, void 0, void 0, function* () {
            console.log("My user Id is " + userId);
            const userDevices = yield this.repository.getUserDevices(userId);
            let androidDeviceIds = [];
            let iosDeviceIds = [];
            userDevices.forEach(u => {
                if (u.provider === 'ios')
                    iosDeviceIds.push(u.deviceId);
                if (u.provider === 'android')
                    androidDeviceIds.push(u.deviceId);
            });
            let badDevices = [];
            if (androidDeviceIds.length > 0) {
                const { failed } = yield this._sendToDevice('android', androidDeviceIds, msg, expDateTime);
                badDevices = [...badDevices, ...failed];
            }
            if (iosDeviceIds.length > 0) {
                const { failed } = yield this._sendToDevice('ios', iosDeviceIds, msg, expDateTime);
                badDevices = [...badDevices, ...failed];
            }
            if (badDevices.length > 0)
                yield this.repository.disableUserDevices(badDevices);
        });
        this._sendToDevice = (userDeviceType, deviceIds, msg, expDateTime) => __awaiter(this, void 0, void 0, function* () {
            let successRes = { failed: [], successful: [] };
            switch (userDeviceType) {
                case "ios":
                    const note = new apn_1.default.Notification({
                        alert: {
                            title: msg.title,
                            body: msg.body,
                        },
                        payload: msg.data,
                        sound: 'ping.aiff',
                        badge: 3,
                        expiry: expDateTime.millisecond,
                        topic: 'com.tradingpostapp'
                    });
                    note.contentAvailable = true;
                    if (msg.imageUrl)
                        note.alert = {
                            "launch-image": msg.imageUrl,
                            body: msg.body
                        };
                    const appleRes = yield this.iOSMessenger.send(note, deviceIds);
                    appleRes.failed.forEach(f => successRes.failed.push(f.device));
                    appleRes.sent.forEach(f => successRes.successful.push(f.device));
                    return successRes;
                case "android":
                    const { success, failed } = yield this.androidMessenger.send({
                        title: msg.title,
                        body: msg.body,
                        imageUrl: msg.imageUrl,
                        data: msg.data
                    }, deviceIds);
                    success.forEach(s => successRes.successful.push(s));
                    failed.forEach(f => successRes.failed.push(f));
                    return successRes;
                default:
                    throw new Error(`Unknown notification provider registered: Provider:[${userDeviceType}] for sending notification`);
            }
        });
        this.iOSMessenger = iosMessenger;
        this.androidMessenger = androidMessenger;
        this.repository = repository;
    }
}
exports.default = Notifications;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUlBLDhDQUFzQjtBQUV0QixpQ0FBK0I7QUFFL0IsTUFBcUIsYUFBYTtJQUs5QixZQUFZLFlBQTBCLEVBQUUsZ0JBQXNDLEVBQUUsVUFBb0M7UUFNN0csK0JBQTBCLEdBQUcsQ0FBTyxNQUFjLEVBQUUsU0FBbUIsRUFBRSxVQUFxQyxFQUFFLEdBQVksRUFBRSxjQUF3QixnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDM0wsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQSxDQUFBO1FBRU0sc0JBQWlCLEdBQUcsQ0FBTyxNQUFjLEVBQUUsR0FBWSxFQUFFLGNBQXdCLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQWlCLEVBQUU7WUFDckksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUN2QyxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ2hFLElBQUksZ0JBQWdCLEdBQWEsRUFBRSxDQUFDO1lBQ3BDLElBQUksWUFBWSxHQUFhLEVBQUUsQ0FBQztZQUVoQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNwQixJQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssS0FBSztvQkFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLENBQUMsUUFB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