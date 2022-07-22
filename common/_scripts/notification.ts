import {DefaultConfig} from "../configuration";
import pgPromise from "pg-promise";
import {Notifications, Repository} from "../notifications";
import admin from 'firebase-admin';

(async () => {
    const fcmConfig = await DefaultConfig.fromCacheOrSSM("fcm");

    const app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: fcmConfig.project_id,
            clientEmail: fcmConfig.client_email,
            privateKey: fcmConfig.private_key
        }),
    });

    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    })
    await pgClient.connect()

    const notificationRepo = new Repository(pgClient, pgp);

    const notificationsSrv = new Notifications(app.messaging(), app.messaging(), notificationRepo);

})()