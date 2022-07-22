import {UserDevice} from "./interfaces";
import {IDatabase, IMain} from "pg-promise";
import {DateTime} from "luxon";

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

export default class Repository {
    private db: IDatabase<any>;
    private pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    getUserDevices = async (userId: string): Promise<UserDevice[]> => {
        return await this.getUsersDevices([userId]);
    }

    getUsersDevices = async (userIds: string[]): Promise<UserDevice[]> => {
        const response = await this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE user_id = ANY ($1::UUID)`, [userIds]);
        return response.map((row: any) => {
            return {
                userId: row[0],
                deviceId: row[1],
                provider: row[2],
                updatedAt: DateTime.fromJSDate(row[3]),
                createdAt: DateTime.fromJSDate(row[4])
            }
        });
    }

    getUserDeviceByDeviceId = async (deviceId: string): Promise<UserDevice> => {
        const response = await this.db.query(`
            SELECT user_id,
                   device_id,
                   provider,
                   updated_at,
                   created_at
            FROM user_device
            WHERE device_id = $1`, [deviceId]);

        if (response.length <= 0) throw new Error(`device id ${deviceId} does not exist within our system`);

        return {
            userId: response[0],
            deviceId: response[1],
            provider: response[2],
            updatedAt: DateTime.fromJSDate(response[3]),
            createdAt: DateTime.fromJSDate(response[4])
        }
    }
}