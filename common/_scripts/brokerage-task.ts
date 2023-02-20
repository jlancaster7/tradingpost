import 'dotenv/config'
import {DefaultConfig} from "../configuration";
import pgPromise from "pg-promise";
import pg from 'pg';
import {DateTime} from "luxon";
import {BrokerageTaskStatusType, BrokerageTaskType, DirectBrokeragesType} from "../brokerage/interfaces";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import Repository from "../brokerage/repository";

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

    const repo = new Repository(pgClient, pgp);
    const portSummarySrv = new PortfolioSummaryService(repo);
    await portSummarySrv.computeAccountGroupSummary("e96aea04-9a60-4832-9793-f790e60df8eb");

    // const sqsClient = new SQSClient({
    //     region: "us-east-1"
    // });

    // -- 17, 16,15, 14, 13, 10
    // const command = new SendMessageCommand({
    //     MessageBody: JSON.stringify({
    //         type: BrokerageTaskType.NewData,
    //         userId: "e96aea04-9a60-4832-9793-f790e60df8eb",
    //         status: BrokerageTaskStatusType.Pending,
    //         data: {filenames: ["NAV", "Security", "Position", "PL", "CashReport", "Activity", "Account"]},
    //         started: null,
    //         finished: null,
    //         brokerage: DirectBrokeragesType.Ibkr,
    //         date: DateTime.now().minus({day: 10}),
    //         brokerageUserId: "F6017651",
    //         error: null,
    //         messageId: null
    //     }),
    //     DelaySeconds: 0,
    //     QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
    //     MessageAttributes: {
    //         Broker: {
    //             DataType: "String",
    //             StringValue: DirectBrokeragesType.Ibkr
    //         },
    //         Account: {
    //             DataType: "String",
    //             StringValue: "F6017651"
    //         }
    //     },
    // });
    //
    // const res = await sqsClient.send(command)
    // console.log(res);
}

(async () => {
    await run()
})()