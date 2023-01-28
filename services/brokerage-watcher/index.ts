import 'dotenv/config';
import {DefaultConfig} from "@tradingpost/common/configuration"
import pgPromise from "pg-promise"
import pg from 'pg';
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import fs from "fs";
import chokidar from 'chokidar';
import {DateTime} from "luxon";
import Repository from "@tradingpost/common/brokerage/repository";
import {
    BrokerageTask,
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType
} from "@tradingpost/common/brokerage/interfaces";

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

const uploadFileToS3 = async (filePath: string, accountId: string, filename: string, s3Client: S3Client) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        await s3Client.send(new PutObjectCommand({
            Bucket: "tradingpost-brokerage-files",
            Key: `ibkr/${accountId}/${filename}`,
            Body: fileStream
        }));
    } catch (e) {
        console.error(e)
    }
}

(async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });

    await pgClient.connect()
    const repo = new Repository(pgClient, pgp);
    const s3Client = new S3Client({region: "us-east-1"});

    const ibkrWatchDirectory = process.env.IBKR_DIRECTORY as string;

    let filesToProcess: string[] = [];
    chokidar.watch(ibkrWatchDirectory).on('add', (path) => filesToProcess.push(path));

    const run = async () => {
        while (true) {
            if (filesToProcess.length <= 0) {
                await sleepAsync(1000)
                continue
            }

            const path = filesToProcess.pop();
            if (!path) continue

            const splitPath = path.split("/");
            const filename = splitPath[splitPath.length - 1];
            const filenameWithoutExt = filename.replace(".csv", "")
            const [ibkrUserId, fileType, date] = filenameWithoutExt.split("_");
            const dateDateTime = DateTime.fromFormat(date, "yyyyMMdd", {
                zone: "America/New_York"
            }).set({hour: 16, minute: 0, second: 0, millisecond: 0});

            const ibkrAccount = await repo.getIbkrAccount(ibkrUserId);
            if (!ibkrAccount) throw new Error("could not find ibkr account for account id");
            const existingTask = await repo.getExistingTaskByDate(DirectBrokeragesType.Ibkr, BrokerageTaskType.NewData, dateDateTime, ibkrAccount.userId, ibkrUserId);
            let updatedTask: BrokerageTask = {
                date: dateDateTime,
                started: null,
                userId: ibkrAccount.userId,
                finished: null,
                type: BrokerageTaskType.NewData,
                status: BrokerageTaskStatusType.Partial,
                data: {
                    filenames: [fileType],
                },
                brokerage: DirectBrokeragesType.Ibkr,
                brokerageUserId: ibkrUserId,
                error: null,
            }

            if (existingTask === null) {
                await repo.upsertBrokerageTasks([updatedTask])
                await uploadFileToS3(path, ibkrUserId, filename, s3Client)
                continue
            }

            if (existingTask.status === BrokerageTaskStatusType.Running
                || existingTask.status === BrokerageTaskStatusType.Pending
                || existingTask.status === BrokerageTaskStatusType.Failed
                || existingTask.status === BrokerageTaskStatusType.Successful) continue;
            if (existingTask.data.filenames.length === 7) continue;

            if (existingTask.data?.filenames.includes(fileType)) continue;

            existingTask.data.filenames = [...existingTask.data?.filenames, fileType];

            if (existingTask.data.filenames.length === 7) existingTask.status = BrokerageTaskStatusType.Pending

            await repo.updateTask(existingTask.id, {
                status: existingTask.status,
                data: existingTask.data
            })
            await uploadFileToS3(path, ibkrUserId, filename, s3Client)
        }
    }

    run().then();
})()

const sleepAsync = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, time);
    })
}

