import 'dotenv/config'
import admin from "firebase-admin";
import {DefaultConfig} from '@tradingpost/common/configuration';
import Notifications from "./notifications";
import {Client as PGClient} from 'pg';
import Repository from "./repository";

const run = async () => {
    const fcmConfiguration = await DefaultConfig.fromCacheOrSSM('fcm');
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM('postgres');
    const app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: fcmConfiguration.project_id,
            clientEmail: fcmConfiguration.client_email,
            privateKey: fcmConfiguration.private_key
        })
    });

    const pg = new PGClient({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    const repository = new Repository(pg);
    const notificationService = new Notifications(app.messaging(), app.messaging(), repository);
}

run().catch(e => console.error(e));

