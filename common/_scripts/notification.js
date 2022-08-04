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
const configuration_1 = require("../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const notifications_1 = require("../notifications");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const fcmConfig = yield configuration_1.DefaultConfig.fromCacheOrSSM("fcm");
    const app = firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: fcmConfig.project_id,
            clientEmail: fcmConfig.client_email,
            privateKey: fcmConfig.private_key
        }),
    });
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    yield pgClient.connect();
    const notificationRepo = new notifications_1.Repository(pgClient, pgp);
    const notificationsSrv = new notifications_1.Notifications(app.messaging(), app.messaging(), notificationRepo);
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibm90aWZpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQStDO0FBQy9DLDREQUFtQztBQUNuQyxvREFBMkQ7QUFDM0Qsb0VBQW1DO0FBRW5DLENBQUMsR0FBUyxFQUFFO0lBQ1IsTUFBTSxTQUFTLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUU1RCxNQUFNLEdBQUcsR0FBRyx3QkFBSyxDQUFDLGFBQWEsQ0FBQztRQUM1QixVQUFVLEVBQUUsd0JBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQzlCLFNBQVMsRUFBRSxTQUFTLENBQUMsVUFBVTtZQUMvQixXQUFXLEVBQUUsU0FBUyxDQUFDLFlBQVk7WUFDbkMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxXQUFXO1NBQ3BDLENBQUM7S0FDTCxDQUFDLENBQUM7SUFFSCxNQUFNLHFCQUFxQixHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0UsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsSUFBSTtRQUNoQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtRQUN4QyxRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUTtLQUMzQyxDQUFDLENBQUE7SUFDRixNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUV4QixNQUFNLGdCQUFnQixHQUFHLElBQUksMEJBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFdkQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDZCQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBRW5HLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQSJ9