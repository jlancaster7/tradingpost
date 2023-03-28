import {init} from "./init";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {streamToString} from "../utils";
import apn from "apn";
import {DefaultConfig} from "@tradingpost/common/configuration/index";
import AndroidNotifications from "@tradingpost/common/notifications/android";
import {Client as ElasticClient} from "@elastic/elasticsearch";

export const initNotifications = (async () => {
    const {s3Client} = await init;
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
        production: true
    }
    const apnProvider = new apn.Provider(iosOptions);

    const fcmConfig = await DefaultConfig.fromCacheOrSSM("fcm");
    const androidNotif = new AndroidNotifications(fcmConfig.authKey);

    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new ElasticClient({
        cloud: {
            id: elasticConfiguration.cloudId as string
        },
        auth: {
            apiKey: elasticConfiguration.apiKey as string
        },
        maxRetries: 5,
    });

    return {apnProvider, androidProvider: androidNotif, elasticClient}
})()