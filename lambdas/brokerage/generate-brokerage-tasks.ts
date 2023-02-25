import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from "@tradingpost/common/brokerage/repository";
import {
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType
} from "@tradingpost/common/brokerage/interfaces";
import {DateTime} from "luxon";
import {SendMessageCommand, SQSClient} from '@aws-sdk/client-sqs';

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


const run = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })

        await pgClient.connect();
    }

    if (DateTime.now().hour !== 7) return;

    const sqsClient = new SQSClient({
        region: "us-east-1"
    });

    const repository = new Repository(pgClient, pgp);
    const robinhoodUsers = await repository.getRobinhoodUsers();
    for (let i = 0; i < robinhoodUsers.length; i++) {
        const robinhoodUser = robinhoodUsers[i];
        const command = new SendMessageCommand({
            MessageBody: JSON.stringify({
                type: BrokerageTaskType.NewData,
                userId: robinhoodUser.userId,
                status: BrokerageTaskStatusType.Pending,
                data: null,
                started: null,
                finished: null,
                brokerage: DirectBrokeragesType.Robinhood,
                date: DateTime.now().setZone("America/New_York"),
                brokerageUserId: robinhoodUser.username,
                error: null,
                messageId: null
            }),
            DelaySeconds: 0,
            QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
        });
        await sqsClient.send(command)
    }

    const finicityUsers = await repository.getFinicityUsers()
    for (let i = 0; i < finicityUsers.length; i++) {
        const finicityUser = finicityUsers[i];
        const command = new SendMessageCommand({
            MessageBody: JSON.stringify({
                type: BrokerageTaskType.NewData,
                userId: finicityUser.tpUserId,
                status: BrokerageTaskStatusType.Pending,
                data: null,
                started: null,
                finished: null,
                brokerage: DirectBrokeragesType.Finicity,
                date: DateTime.now().setZone("America/New_York"),
                brokerageUserId: finicityUser.customerId,
                error: null,
                messageId: null
            }),
            DelaySeconds: 0,
            QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
        });
        await sqsClient.send(command)
    }
}

export const handler = async (event: any, context: Context) => {
    await run();
}