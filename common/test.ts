import 'dotenv/config'
import {DefaultConfig} from "./configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import {Service} from "./brokerage/finicity";
import {Transformer} from "./brokerage/finicity/transformer";
import * as FinicityApi from "./finicity";
import Repository from "./brokerage/repository";
import {PortfolioSummaryService} from "./brokerage/portfolio-summary";
import {DateTime} from "luxon";
import {BrokerageTaskStatusType, BrokerageTaskType, DirectBrokeragesType} from "./brokerage/interfaces";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import {S3Client, ListObjectsCommand} from "@aws-sdk/client-s3";

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


const run = async (tokenFile?: string) => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const repository = new Repository(pgClient, pgp);
    const finicity = new FinicityApi.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    const finicityTransformer = new Transformer(repository);
    const portSummaryStats = new PortfolioSummaryService(repository);
    const finicitySrv = new Service(finicity, repository, finicityTransformer, portSummaryStats);

    // await finicitySrv.remove("a0c8491b-1bac-4c25-b255-c656ee3cedd1", "421720186", DateTime.now(), {
    //     accounts: [{
    //         finicityAccountId: 0,
    //         finicityAccountNumber: '421720186'
    //     }]
    // });

    // console.log("Starting")
    // await robinhoodSrv.add("4a6f0899-dc6d-40cc-aa6a-1febb579d65a", "djbozentka@gmail.com", DateTime.fromISO("2023-01-30T13:26:37.624-05:00"));
    // console.log("Finished")

    // Generate Ibkr Tasks
    const sqsClient = new SQSClient({
        region: "us-east-1"
    });

    const s3Client = new S3Client({
        region: "us-east-1"
    });

    let lastMarker = null;
    let count = 0;

    const availableDates = new Set();
    while (true) {
        // @ts-ignore
        const getIbkrKeys = new ListObjectsCommand({
            Bucket: "tradingpost-brokerage-files",
            Prefix: "ibkr/F6017651/",
            Marker: lastMarker ? lastMarker : undefined
        });

        // @ts-ignore
        const response = await s3Client.send(getIbkrKeys);

        if (!response.Contents || response.Contents.length <= 0) break;
        for (let i = 0; i < response.Contents?.length; i++) {
            // @ts-ignore
            const content = response.Contents[i];
            const dateStr = content.Key.split('/')[2].split("_")[2].replace(".csv", "").trim();
            const dt = DateTime.fromFormat(dateStr, "yyyyMMdd").setZone("America/New_York").set({
                hour: 16,
                minute: 0,
                second: 0,
                millisecond: 0
            });

            availableDates.add(dt.toISO())
            lastMarker = content.Key;
            count += 1
        }
    }

    let arr = [];
    for (let item of Array.from(availableDates.values())) {
        const command = new SendMessageCommand({
            MessageBody: JSON.stringify({
                type: BrokerageTaskType.NewData,
                userId: "e96aea04-9a60-4832-9793-f790e60df8eb",
                status: BrokerageTaskStatusType.Pending,
                data: {filenames: ["NAV", "Security", "Position", "PL", "CashReport", "Activity", "Account"]},
                started: null,
                finished: null,
                brokerage: DirectBrokeragesType.Ibkr,
                date: DateTime.fromISO(item as string),
                brokerageUserId: "F6017651",
                error: null,
                messageId: null
            }),
            DelaySeconds: 0,
            QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
            MessageAttributes: {
                Broker: {
                    DataType: "String",
                    StringValue: DirectBrokeragesType.Ibkr
                },
                Account: {
                    DataType: "String",
                    StringValue: "F6017651"
                }
            },
        });

        arr.push(sqsClient.send(command))
        if (arr.length === 100) {
            await Promise.all(arr);
            arr = [];
        }
    }

    if (arr.length > 0) await Promise.all(arr);
}

(async () => {
    await run()
})()