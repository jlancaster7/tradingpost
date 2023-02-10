import 'dotenv/config'
import {DefaultConfig} from "./configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import {Service} from "./brokerage/ibkr";
import {Transformer} from "./brokerage/finicity/transformer";
import * as FinicityApi from "./finicity";
import Repository from "./brokerage/repository";
import {PortfolioSummaryService} from "./brokerage/portfolio-summary";
import {DateTime} from "luxon";
import {BrokerageTaskStatusType, BrokerageTaskType, DirectBrokeragesType} from "./brokerage/interfaces";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import {S3Client, ListObjectsCommand} from "@aws-sdk/client-s3";
import BaseTransformer from "./brokerage/base-transformer";
import {sleep} from "./utils/sleep";
import {sort} from "mathjs";
import ibkr from "./api/entities/extensions/Ibkr";

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

    const sqsClient = new SQSClient({
        region: "us-east-1"
    });

    const s3Client = new S3Client({
        region: "us-east-1"
    });

    const repository = new Repository(pgClient, pgp);
    const portSummaryStats = new PortfolioSummaryService(repository);
    const ibkrService = new Service(repository, s3Client, portSummaryStats, sqsClient);
    const dt = DateTime.now().set({day: 25, month: 1, year: 2023});
    console.log("Started")
    await ibkrService.update("e96aea04-9a60-4832-9793-f790e60df8eb", "F6017651", dt)
    console.log("Fin")
    // Generate Ibkr Tasks
    // const sqsClient = new SQSClient({
    //     region: "us-east-1"
    // });
    //
    // const s3Client = new S3Client({
    //     region: "us-east-1"
    // });
    //
    // let lastMarker = null;
    // let count = 0;
    //
    // const availableDates = new Set();
    // while (true) {
    //     // @ts-ignore
    //     const getIbkrKeys = new ListObjectsCommand({
    //         Bucket: "tradingpost-brokerage-files",
    //         Prefix: "ibkr/F6017651/",
    //         Marker: lastMarker ? lastMarker : undefined
    //     });
    //
    //     // @ts-ignore
    //     const response = await s3Client.send(getIbkrKeys);
    //
    //     if (!response.Contents || response.Contents.length <= 0) break;
    //     for (let i = 0; i < response.Contents?.length; i++) {
    //         // @ts-ignore
    //         const content = response.Contents[i];
    //         const dateStr = content.Key.split('/')[2].split("_")[2].replace(".csv", "").trim();
    //         const dt = DateTime.fromFormat(dateStr, "yyyyMMdd").setZone("America/New_York").set({
    //             hour: 16,
    //             minute: 0,
    //             second: 0,
    //             millisecond: 0
    //         });
    //
    //         availableDates.add(dt.toISO())
    //         lastMarker = content.Key;
    //         count += 1
    //     }
    // }
    //
    // let arr = [];
    // for (let item of Array.from(availableDates.values())) {
    //     const command = new SendMessageCommand({
    //         MessageBody: JSON.stringify({
    //             type: BrokerageTaskType.NewData,
    //             userId: "e96aea04-9a60-4832-9793-f790e60df8eb",
    //             status: BrokerageTaskStatusType.Pending,
    //             data: {filenames: ["NAV", "Security", "Position", "PL", "CashReport", "Activity", "Account"]},
    //             started: null,
    //             finished: null,
    //             brokerage: DirectBrokeragesType.Ibkr,
    //             date: DateTime.fromISO(item as string),
    //             brokerageUserId: "F6017651",
    //             error: null,
    //             messageId: null
    //         }),
    //         DelaySeconds: 0,
    //         QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
    //         MessageAttributes: {
    //             Broker: {
    //                 DataType: "String",
    //                 StringValue: DirectBrokeragesType.Ibkr
    //             },
    //             Account: {
    //                 DataType: "String",
    //                 StringValue: "F6017651"
    //             }
    //         },
    //     });
    //
    //     arr.push(sqsClient.send(command))
    //     if (arr.length === 100) {
    //         await Promise.all(arr);
    //         arr = [];
    //     }
    // }
    //
    // if (arr.length > 0) await Promise.all(arr);
}

(async () => {
    await run()
})()