import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from '@tradingpost/common/brokerage/repository';
import * as Finicity from "@tradingpost/common/finicity";
import * as Ibkr from "@tradingpost/common/brokerage/ibkr";
import * as Robinhood from "@tradingpost/common/brokerage/robinhood";
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
    add(userId: string, brokerageUserId: string, data?: any): Promise<void>

    update(userId: string, brokerageUserId: string, data?: any): Promise<void>
}

let processMap: Record<DirectBrokeragesType, Process>;

const run = async (tokenFile?: string) => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })
    }

    const repository = new Repository(pgClient, pgp);
    const portfolioSummaryService = new PortfolioSummaryService(repository);
    const s3Client = new S3Client({region: "us-east-1"});
    const robinhoodCfg = await DefaultConfig.fromCacheOrSSM("robinhood");
    const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');

    const finicity = new Finicity.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey, tokenFile);
    await finicity.init();

    const robinhoodTransformer = new Robinhood.Transformer(repository);

    processMap[DirectBrokeragesType.Robinhood] = new Robinhood.Service(robinhoodCfg.clientId, robinhoodCfg.scope,robinhoodCfg.expiresIn, repository, robinhoodTransformer, portfolioSummaryService);
    processMap[DirectBrokeragesType.Ibkr] = new Ibkr.default(repository, s3Client, portfolioSummaryService);
    processMap[DirectBrokeragesType.Finicity] = finicity;

    // Pull off a job and start processing based on brokerage type
    const pendingTask = await repository.getPendingBrokerageTask();
    if (pendingTask === null) return;

    await repository.updateTask(pendingTask.id, {
        status: BrokerageTaskStatusType.Running,
        startDate: DateTime.now().setZone("America/New_York"),
    });

    try {
        const broker = processMap[pendingTask.brokerage];
        if (pendingTask.type === BrokerageTaskType.NewData) await broker.update(pendingTask.userId, pendingTask.brokerageUserId, pendingTask.data);
        if (pendingTask.type === BrokerageTaskType.NewAccount) await broker.add(pendingTask.userId, pendingTask.brokerageUserId, pendingTask.data);
        await repository.updateTask(pendingTask.id, {
            status: BrokerageTaskStatusType.Successful,
            endDate: DateTime.now().setZone("America/New_York")
        });
    } catch (e) {
        await repository.updateTask(pendingTask.id, {
            status: BrokerageTaskStatusType.Failed,
            endDate: DateTime.now().setZone("America/New_York"),
            error: JSON.stringify(e)
        })
    }
}

export const handler = async (event: any, context: Context) => {
    await run("/tmp/token-file.json");
}