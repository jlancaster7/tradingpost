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
const luxon_1 = require("luxon");
// Create our own type of error response, if its not that type of errors response than we should not log that
// message to our end user and instead we should just return a internal system issue message for the time being
/**
 *
 *     const app = admin.initializeApp({
 *         credential: admin.credential.cert({
 *             projectId: fcmConfiguration.project_id,
 *             clientEmail: fcmConfiguration.client_email,
 *             privateKey: fcmConfiguration.private_key
 *         })
 *     });
 */
class Repository {
    constructor(db, pgp) {
        this.getUserDevices = (userId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.getUsersDevices([userId]);
        });
        this.getUsersDevices = (userIds) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE user_id = ANY ($1::UUID)`, [userIds]);
            return response.map((row) => {
                return {
                    userId: row[0],
                    deviceId: row[1],
                    provider: row[2],
                    updatedAt: luxon_1.DateTime.fromJSDate(row[3]),
                    createdAt: luxon_1.DateTime.fromJSDate(row[4])
                };
            });
        });
        this.getUserDeviceByDeviceId = (deviceId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE device_id = $1`, [deviceId]);
            if (response.length <= 0)
                throw new Error(`device id ${deviceId} does not exist within our system`);
            return {
                userId: response[0],
                deviceId: response[1],
                provider: response[2],
                updatedAt: luxon_1.DateTime.fromJSDate(response[3]),
                createdAt: luxon_1.DateTime.fromJSDate(response[4])
            };
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.default = Repository;
