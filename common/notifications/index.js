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
const IOSNotifications_1 = __importDefault(require("./IOSNotifications"));
const AndroidNotifications_1 = __importDefault(require("./AndroidNotifications"));
function bar(x1, x2) {
    return x1.length > x2.length ? x1 : x2;
}
function foo(x1, x2) {
    return x1.length > x2.length ? x1 : x2;
}
foo([1, 2, 3]);
foo(1);
foo("1234");
/**
 * 1. Build each respective Notification Service
 * 2. Build a Notification API that abstracts the two away
 * 3. Build tables with devices and users
 * 4. Call API with UserID and/or Device ID to push out a notification depending on what's registered
 * 5. Setup a CRON job table that will run a job or something to run push notifications to all users devices
 *
 *
 *
 *  SSM for iOS and Android
 *
 * TODO:
 *  - Setup Firebase Account
 *  - How can we clean up device registrations? e.g., old bad device, new install of OS, etc... can remove old token?
 *       maybe we do this upon failed request, comes back with error like device token not found,
 *       then we prune accordingly
 */
class Notifications {
    constructor(apnProvider) {
        this.test = () => __awaiter(this, void 0, void 0, function* () {
        });
        this._iosProvider = new IOSNotifications_1.default(apnProvider);
        this._androidProvider = new AndroidNotifications_1.default();
    }
}
exports.default = Notifications;
