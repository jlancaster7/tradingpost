import {Context} from "aws-lambda";
import pg from "pg";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {DefaultConfig} from "@tradingpost/common/configuration/index";
import {Client as ElasticClient} from '@elastic/elasticsearch';
import Notifications from "@tradingpost/common/notifications";
import Repository from "@tradingpost/common/notifications/repository";
import apn from 'apn'
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import AndroidNotifications from "@tradingpost/common/notifications/android";
import {holdingsPostNotifications} from "@tradingpost/common/notifications/bll";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

let pgClient: IDatabase<any>;
let pgp: IMain;
let elasticClient: ElasticClient;
let notificationsSrv: Notifications;
let notificationsRepo: Repository;

const streamToString = (stream: any) =>
    new Promise<string>((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

const run = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });

        const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
        elasticClient = new ElasticClient({
            cloud: {
                id: elasticConfiguration.cloudId as string
            },
            auth: {
                apiKey: elasticConfiguration.apiKey as string
            },
            maxRetries: 5,
        });

        const s3Client = new S3Client({
            region: "us-east-1"
        });

        const s3Res = await s3Client.send(new GetObjectCommand({
            Bucket: "tradingpost-app-data",
            Key: "ios/AuthKey_6WPUHTZ3LU.p8"
        }));

        const iosKeyBody = await streamToString(s3Res.Body);

        const iosOptions: apn.ProviderOptions = {
            token: {
                key: iosKeyBody,
                keyId: '6WPUHTZ3LU',
                teamId: '25L2ZZWUPA',
            },
            production: false
        }
        const apnProvider = new apn.Provider(iosOptions);

        const fcmConfig = await DefaultConfig.fromCacheOrSSM("fcm");
        const androidNotif = new AndroidNotifications(fcmConfig.authKey);
        notificationsRepo = new Repository(pgClient, pgp);
        notificationsSrv = new Notifications(apnProvider, androidNotif, notificationsRepo);
    }

    await holdingsPostNotifications(notificationsSrv, notificationsRepo, elasticClient);
}

export const handler = async (event: any, context: Context) => {
    await run();
}