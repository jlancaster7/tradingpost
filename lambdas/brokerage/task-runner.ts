import 'dotenv/config'
import {Context} from 'aws-lambda';
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
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType
} from "@tradingpost/common/brokerage/interfaces";
import {DateTime} from "luxon";

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

interface Process {
    add(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    update(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>
}

let processMap: Record<string, Process> = {};
let repository: Repository;

const run = async (tokenFile?: string): Promise<boolean> => {
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

        processMap[DirectBrokeragesType.Robinhood] = new RobinhoodService(robinhoodCfg.clientId, robinhoodCfg.scope, robinhoodCfg.expiresIn, repository, robinhoodTransformer, portfolioSummaryService);
        processMap[DirectBrokeragesType.Ibkr] = new IbkrService(repository, s3Client, portfolioSummaryService);
        processMap[DirectBrokeragesType.Finicity] = new FinicityService(finicity, repository, finicityTransformer);
    }

    // Pull off a job and start processing based on brokerage type
    const pendingTask = await repository.getPendingBrokerageTask();
    if (pendingTask === null) return false;

    try {
        const broker = processMap[pendingTask.brokerage];
        if (pendingTask.type === BrokerageTaskType.NewData) {
            await broker.update(pendingTask.userId, pendingTask.brokerageUserId as string, pendingTask.date, pendingTask.data);
        } else if (pendingTask.type === BrokerageTaskType.NewAccount) {
            await broker.add(pendingTask.userId, pendingTask.brokerageUserId as string, pendingTask.date, pendingTask.data);
        } else throw new Error("undefined type")

        await repository.updateTask(pendingTask.id, {
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
        await repository.updateTask(pendingTask.id, {
            status: BrokerageTaskStatusType.Failed,
            finished: DateTime.now().setZone("America/New_York"),
            error: error
        })
    }

    return true
}

(async () => {
    console.log("Starting")
    let flag = true;
    while (flag) {
        flag = await run();
    }
    console.log("DONE!")
})()

export const handler = async (event: any, context: Context) => {
    await run("/tmp/token-file.json");
}