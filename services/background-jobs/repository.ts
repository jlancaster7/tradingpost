import {UserDevice} from "./interfaces";
import {Client} from 'pg';
import {DateTime} from "luxon";

// Create our own type of error response, if its not that type of errors response than we should not log that
// message to our end user and instead we should just return a internal system issue message for the time being

export default class Repository {
    private db: Client;

    constructor(db: Client) {
        this.db = db;
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
        return response.rows.map(row => {
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

        if (response.rows.length <= 0) throw new Error(`device id ${deviceId} does not exist within our system`);

        return {
            userId: response.rows[0],
            deviceId: response.rows[1],
            provider: response.rows[2],
            updatedAt: DateTime.fromJSDate(response.rows[3]),
            createdAt: DateTime.fromJSDate(response.rows[4])
        }
    }
}