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
