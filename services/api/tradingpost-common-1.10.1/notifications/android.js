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
const node_fetch_1 = __importDefault(require("node-fetch"));
class AndroidNotifications {
    constructor(authKey) {
        this.send = (message, deviceIds, priority = "normal") => __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("About to sned to android devices: " + deviceIds.join(","));
            let prototypeRes = { success: [], failed: [] };
            for (let i = 0; i < deviceIds.length; i++) {
                const deviceId = deviceIds[i];
                const res = yield (0, node_fetch_1.default)('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `key=${this.authKey}`,
                    },
                    body: JSON.stringify({
                        to: deviceId,
                        token: deviceId,
                        priority: priority,
                        data: {
                            channelId: 'tp-default',
                            title: message.title,
                            message: message.body,
                            icon: 'notification_icon',
                            url: (_a = message.data) === null || _a === void 0 ? void 0 : _a.url
                        }
                    }),
                });
                if (res.ok) {
                    const contentType = res.headers.get("content-type");
                    if (!contentType || contentType.indexOf("application/json") === -1)
                        throw new Error(yield res.text());
                    const body = yield res.json();
                    console.log(body);
                    if ('error' in body.results[0])
                        prototypeRes.failed.push(deviceId);
                    else
                        prototypeRes.success.push(deviceId);
                }
                else {
                    console.log("Android Send Status :" + res.status);
                }
            }
            return prototypeRes;
        });
        this.authKey = authKey;
    }
}
exports.default = AndroidNotifications;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFHL0IsTUFBcUIsb0JBQW9CO0lBR3JDLFlBQVksT0FBZTtRQUkzQixTQUFJLEdBQUcsQ0FBTyxPQUFnQixFQUFFLFNBQW1CLEVBQUUsV0FBbUIsUUFBUSxFQUFvRCxFQUFFOztZQUNsSSxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLFlBQVksR0FBNEMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQTtZQUN2RixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsb0JBQUssRUFBQyxxQ0FBcUMsRUFBRTtvQkFDM0QsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFO3dCQUNMLGNBQWMsRUFBRSxrQkFBa0I7d0JBQ2xDLGFBQWEsRUFBRSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUU7cUJBQ3ZDO29CQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUNqQixFQUFFLEVBQUUsUUFBUTt3QkFDWixLQUFLLEVBQUUsUUFBUTt3QkFDZixRQUFRLEVBQUUsUUFBUTt3QkFDbEIsSUFBSSxFQUFFOzRCQUNGLFNBQVMsRUFBRSxZQUFZOzRCQUN2QixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7NEJBQ3BCLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSTs0QkFDckIsSUFBSSxFQUFFLG1CQUFtQjs0QkFDekIsR0FBRyxFQUFFLE1BQUEsT0FBTyxDQUFDLElBQUksMENBQUUsR0FBRzt5QkFDekI7cUJBQ0osQ0FBQztpQkFDTCxDQUFDLENBQUM7Z0JBR0gsSUFBSSxHQUFHLENBQUMsRUFBRSxFQUFFO29CQUVSLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNwRCxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO29CQUNyRyxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFbEIsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQUUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7O3dCQUU3RCxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtpQkFDM0M7cUJBQ0k7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7aUJBQ3BEO2FBRUo7WUFFRCxPQUFPLFlBQVksQ0FBQTtRQUN2QixDQUFDLENBQUEsQ0FBQTtRQS9DRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0NBK0NKO0FBcERELHVDQW9EQyJ9