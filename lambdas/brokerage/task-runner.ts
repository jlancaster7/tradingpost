import 'dotenv/config'
import {Context, SQSEvent} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import Repository from '@tradingpost/common/brokerage/repository';
import {Service as FinicityService} from "@tradingpost/common/brokerage/finicity";
import {Transformer as FinicityTransformer} from "@tradingpost/common/brokerage/finicity/transformer";
import {Service as IbkrService} from "@tradingpost/common/brokerage/ibkr";
import {Service as RobinhoodService} from "@tradingpost/common/brokerage/robinhood";
import {default as RobinhoodTransformer} from "@tradingpost/common/brokerage/robinhood/transformer";
import {PortfolioSummaryService} from "@tradingpost/common/brokerage/portfolio-summary";
import {
    BrokerageTask,
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType
} from "@tradingpost/common/brokerage/interfaces";
import {DateTime} from "luxon";
import {SendMessageCommand} from "@aws-sdk/client-sqs";
import {RetryError} from "@tradingpost/common/iex/index";
import {init} from "../init/init";
import {brokerageInit} from "../init/brokerage";
import * as Teams from "@tradingpost/common/teams";

interface Process {
    add(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    update(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    remove(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>

    calculatePortfolioStatistics(userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void>
}

const createTaskDefinitionFromMessage = (body: string): BrokerageTask => {
    const response = JSON.parse(body);
    return <BrokerageTask>{
        error: response.error,
        data: response.data,
        finished: response.finished ? DateTime.fromISO(response.finished) : null,
        started: response.started ? DateTime.fromISO(response.started) : null,
        type: response.type,
        brokerageUserId: response.brokerageUserId,
        status: response.status,
        date: DateTime.fromISO(response.date),
        userId: response.userId,
        brokerage: response.brokerage,
        retry: response.retry ? response.retry : undefined
    }
}

const run = async (taskDefinition: BrokerageTask, messageId: string, tokenFile?: string) => {
    const {pgClient, pgp, s3Client, sqsClient, marketHolidays} = await init;
    const {finicity} = await brokerageInit(tokenFile);
    const repository = new Repository(pgClient, pgp);
    const portfolioSummaryService = new PortfolioSummaryService(repository);
    const finicityTransformer = new FinicityTransformer(repository, marketHolidays);
    const robinhoodTransformer = new RobinhoodTransformer(repository);
    const robinhoodCfg = await DefaultConfig.fromCacheOrSSM("robinhood");

    const processMap: Record<DirectBrokeragesType, Process> = {
        [DirectBrokeragesType.Robinhood]: new RobinhoodService(robinhoodCfg.clientId, robinhoodCfg.scope, robinhoodCfg.expiresIn, repository, robinhoodTransformer, portfolioSummaryService),
        [DirectBrokeragesType.Ibkr]: new IbkrService(repository, s3Client, portfolioSummaryService, sqsClient),
        [DirectBrokeragesType.Finicity]: new FinicityService(finicity, repository, finicityTransformer)
    }

    const taskId = await repository.getOrInsertBrokerageTaskByMessageId(messageId, taskDefinition);
    if (taskId === null) return;

    try {
        const broker = processMap[taskDefinition.brokerage];

        taskDefinition.started = DateTime.now().setZone("America/New_York");
        taskDefinition.finished = null;

        if (taskDefinition.type === BrokerageTaskType.NewData) {
            await broker.update(taskDefinition.userId, taskDefinition.brokerageUserId as string, taskDefinition.date, taskDefinition.data);
        } else if (taskDefinition.type === BrokerageTaskType.NewAccount) {
            await broker.add(taskDefinition.userId, taskDefinition.brokerageUserId as string, taskDefinition.date, taskDefinition.data);
        } else if (taskDefinition.type === BrokerageTaskType.UpdatePortfolioStatistics) {
            await broker.calculatePortfolioStatistics(taskDefinition.userId, taskDefinition.brokerageUserId as string, taskDefinition.date, taskDefinition.data);
        } else if (taskDefinition.type === BrokerageTaskType.Test) {
            throw new RetryError("RETRYING...!");
        } else throw new Error("undefined type")

        await repository.updateTask(taskId, {
            status: BrokerageTaskStatusType.Successful,
            finished: DateTime.now().setZone("America/New_York")
        });
    } catch (e) {
        await repository.updateTask(taskId, {
            status: BrokerageTaskStatusType.Failed,
            finished: DateTime.now().setZone("America/New_York"),
            error: {
                msg: (e as Error).message,
                stack: (e as Error).stack,
                name: (e as Error).name
            }
        });

        if (e instanceof RetryError) {
            if (taskDefinition.retry !== undefined && taskDefinition.retry !== null && taskDefinition.retry >= 2) {
                console.error(`retried job for ${taskDefinition.brokerage} 3x for user ${taskDefinition.userId} -- investigate`);
                await Teams.alert(`Retried ${taskDefinition.brokerage} task ${taskDefinition.type} 3x for user ${taskDefinition.userId} and all have failed -- review brokerage_task table for more information`);
                return;
            }

            await sqsClient.send(new SendMessageCommand({
                MessageBody: JSON.stringify({
                    type: taskDefinition.type,
                    userId: taskDefinition.userId,
                    status: taskDefinition.status,
                    data: taskDefinition.data,
                    started: null,
                    finished: null,
                    brokerage: taskDefinition.brokerage,
                    date: taskDefinition.date,
                    brokerageUserId: taskDefinition.brokerageUserId,
                    error: null,
                    messageId: null,
                    retry: taskDefinition.retry ? taskDefinition.retry + 1 : 1
                }),
                DelaySeconds: e.getDelayedSeconds(),
                QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue"
            }));
            return;
        }

        await Teams.alert(`Failed Brokerage Task: Brokerage: ${taskDefinition.brokerage} Task Type: ${taskDefinition.type} User ID: ${taskDefinition.userId} -- review brokerage_task table for more information`);
    }
}

export const handler = async (event: SQSEvent, context: Context) => {
    for (let i = 0; i < event.Records.length; i++) {
        const record = event.Records[i];
        const taskDefinition = createTaskDefinitionFromMessage(record.body);
        const messageId = record.messageId;
        await run(taskDefinition, messageId, "/tmp/token-file.json");
    }
}