import 'dotenv/config'
import {Context, SQSEvent} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from '@tradingpost/common/brokerage/repository';
import {Service as FinicityService} from "@tradingpost/common/brokerage/finicity";
import {Transformer as FinicityTransformer} from "@tradingpost/common/brokerage/finicity/transformer";
import {default as FinicityApi} from "@tradingpost/common/finicity";
import {Service as IbkrService} from "@tradingpost/common/brokerage/ibkr";
import {Service as RobinhoodService} from "@tradingpost/common/brokerage/robinhood";
import {default as RobinhoodTransformer} from "@tradingpost/common/brokerage/robinhood/transformer";
import {S3Client} from "@aws-sdk/client-s3";
import {PortfolioSummaryService} from "@tradingpost/common/brokerage/portfolio-summary";
import {
    BrokerageTask,
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType
} from "@tradingpost/common/brokerage/interfaces";
import {DateTime} from "luxon";
import {SQSClient} from "@aws-sdk/client-sqs";

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
let sqsClient: SQSClient;

interface Process {
    add(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    update(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    remove(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    calculatePortfolioStatistics(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>
}

let processMap: Record<string, Process> = {};
let repository: Repository;

const createTaskDefinitionFromMessage = (body: string): BrokerageTask => {
    const response = JSON.parse(body);
    return <BrokerageTask>{
        messageId: response.messageId,
        error: response.error,
        data: response.data,
        finished: response.finished ? DateTime.fromISO(response.finished) : null,
        started: response.started ? DateTime.fromISO(response.started) : null,
        type: response.type,
        brokerageUserId: response.brokerageUserId,
        status: response.status,
        date: DateTime.fromISO(response.date),
        userId: response.userId,
        brokerage: response.brokerage
    }
}

const run = async (taskDefinition: BrokerageTask, messageId: string, tokenFile?: string): Promise<boolean> => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })

        repository = new Repository(pgClient, pgp);
        const portfolioSummaryService = new PortfolioSummaryService(repository);
        const s3Client = new S3Client({region: "us-east-1"});
        const robinhoodCfg = await DefaultConfig.fromCacheOrSSM("robinhood");
        const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');
        const finicity = new FinicityApi(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey, tokenFile);
        await finicity.init();

        const robinhoodTransformer = new RobinhoodTransformer(repository);
        const finicityTransformer = new FinicityTransformer(repository);

        sqsClient = new SQSClient({region: 'us-east-1'});

        processMap[DirectBrokeragesType.Robinhood] = new RobinhoodService(robinhoodCfg.clientId, robinhoodCfg.scope, robinhoodCfg.expiresIn, repository, robinhoodTransformer, portfolioSummaryService);
        processMap[DirectBrokeragesType.Ibkr] = new IbkrService(repository, s3Client, portfolioSummaryService, sqsClient);
        processMap[DirectBrokeragesType.Finicity] = new FinicityService(finicity, repository, finicityTransformer);
    }

    // Pull off a job and start processing based on brokerage type
    // Check to see if a job is already running, if so, then ignore and return
    let taskId = null;
    try {
        // If broker doesn't exist will throw error
        const broker = processMap[taskDefinition.brokerage];

        taskDefinition.started = DateTime.now().setZone("America/New_York");
        taskDefinition.finished = null;
        taskId = await repository.getOrInsertBrokerageTaskByMessageId(messageId, taskDefinition);
        if (taskId === null) return true;

        if (taskDefinition.type === BrokerageTaskType.NewData) {
            await broker.update(taskDefinition.userId, taskDefinition.brokerageUserId as string, taskDefinition.date, taskDefinition.data);
        } else if (taskDefinition.type === BrokerageTaskType.NewAccount) {
            console.log("Running")
            await broker.add(taskDefinition.userId, taskDefinition.brokerageUserId as string, taskDefinition.date, taskDefinition.data);
        } else if (taskDefinition.type === BrokerageTaskType.UpdatePortfolioStatistics) {
            await broker.calculatePortfolioStatistics(taskDefinition.userId, taskDefinition.brokerageUserId as string, taskDefinition.date, taskDefinition.data);
        } else throw new Error("undefined type")

        await repository.updateTask(taskId, {
            status: BrokerageTaskStatusType.Successful,
            finished: DateTime.now().setZone("America/New_York")
        });
    } catch (e) {
        console.error(e)
        let error = {msg: '', stack: '', name: ''};
        if (e instanceof Error) {
            error.msg = e.message;
            error.stack = e.stack ? e.stack : '';
            error.name = e.name;
        }

        if (taskId) await repository.updateTask(taskId, {
            status: BrokerageTaskStatusType.Failed,
            finished: DateTime.now().setZone("America/New_York"),
            error: error
        });
        return false;
    }
    return true
}

// (async () => {
//     await run({
//         userId: 'e2268937-157b-4a33-a970-a9ba88d10a46',
//         messageId: '',
//         brokerage: DirectBrokeragesType.Finicity,
//         status: BrokerageTaskStatusType.Pending,
//         data: {},
//         date: DateTime.now(),
//         error: null,
//         type: BrokerageTaskType.NewAccount,
//         brokerageUserId: "6020539284",
//         finished: null,
//         started: null
//     }, '');
// })()


export const handler = async (event: SQSEvent, context: Context) => {
    for (let i = 0; i < event.Records.length; i++) {
        const record = event.Records[i];

        const taskDefinition = createTaskDefinitionFromMessage(record.body);
        const messageId = record.messageId;
        await run(taskDefinition, messageId, "/tmp/token-file.json");
    }
}