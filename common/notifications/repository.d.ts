import { UserDevice } from "./interfaces";
import { Client } from 'pg';
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
    private db;
    constructor(db: Client);
    getUserDevices: (userId: string) => Promise<UserDevice[]>;
    getUsersDevices: (userIds: string[]) => Promise<UserDevice[]>;
    getUserDeviceByDeviceId: (deviceId: string) => Promise<UserDevice>;
}
