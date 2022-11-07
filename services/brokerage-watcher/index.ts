import 'dotenv/config';
import {DefaultConfig} from "@tradingpost/common/configuration"
import pgPromise, {ColumnSet, IDatabase, IMain} from "pg-promise"
import pg from 'pg';
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import fs from "fs";
import chokidar from 'chokidar';
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

function upsertReplaceQuery(data: any, cs: ColumnSet, pgp: IMain, conflict: string = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`;
        }).join()
}

enum BrokerageJobStatusType {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    FAILED = "FAILED",
    SUCCESSFUL = "SUCCESSFUL"
}

type BrokerageJobStatus = {
    brokerage: string
    brokerageUserId: string
    dateToProcess: DateTime
    status: BrokerageJobStatusType
    data?: any
}

type BrokerageJobStatusTable = {
    id: number
    brokerage: string
    brokerageUserId: string
    dateToProcess: DateTime
    status: BrokerageJobStatusType
    data?: any
    updatedAt: DateTime
    createdAt: DateTime
}

class Repository {
    private _db: IDatabase<any>;
    private readonly _pgp: IMain;

    constructor(client: IDatabase<any>, pgp: IMain) {
        this._db = client;
        this._pgp = pgp;
    }

    getExistingJobStatus = async (brokerage: string, brokerageUserId: string, dateToProcess: DateTime): Promise<BrokerageJobStatusTable | null> => {
        const query = `
            SELECT id,
                   brokerage,
                   brokerage_user_id,
                   date_to_process,
                   status,
                   data,
                   updated_at,
                   created_at
            FROM brokerage_to_process
            WHERE brokerage = $1
              AND brokerage_user_id = $2
              AND date_to_process = $3`;
        const result = await this._db.oneOrNone(query, [brokerage, brokerageUserId, dateToProcess]);
        if (!result) return null;
        return {
            id: result.id,
            brokerage: result.brokerage,
            brokerageUserId: result.brokerage_user_id,
            dateToProcess: DateTime.fromJSDate(result.date_to_process),
            status: result.status,
            data: result.data,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
        }
    }

    upsertBrokerageJobStatus = async (jobStatus: BrokerageJobStatus) => {
        const cs = new this._pgp.helpers.ColumnSet([
            {name: 'brokerage', prop: 'brokerage'},
            {name: 'brokerage_user_id', prop: 'brokerageUserId'},
            {name: 'date_to_process', prop: 'dateToProcess'},
            {name: 'status', prop: 'status'},
            {name: 'data', prop: 'data', mod: ':json'}
        ], {table: 'brokerage_to_process'});
        const query = upsertReplaceQuery(jobStatus, cs, this._pgp, "brokerage, brokerage_user_id, date_to_process")
        await this._db.none(query);
    }
}

const uploadFileToS3 = async (filePath: string, filename: string, s3Client: S3Client) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        await s3Client.send(new PutObjectCommand({
            Bucket: "tradingpost-brokerage-files",
            Key: `ibkr/${filename}`,
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

            console.log("NEW FILE: ", path)
            const splitPath = path.split("/");
            const filename = splitPath[splitPath.length - 1];
            const filenameWithoutExt = filename.replace(".csv", "")
            const [ibkrUserId, fileType, date] = filenameWithoutExt.split("_");
            const dateDateTime = DateTime.fromFormat(date, "yyyyMMdd", {
                zone: "America/New_York"
            });

            const brokerageJobStatus = await repo.getExistingJobStatus("ibkr", ibkrUserId, dateDateTime)
            let newBrokerageJobStatus = {
                status: BrokerageJobStatusType.PENDING,
                data: {
                    filenames: [fileType],
                },
                brokerage: "ibkr",
                dateToProcess: dateDateTime,
                brokerageUserId: ibkrUserId
            }

            if (brokerageJobStatus === null) {
                await repo.upsertBrokerageJobStatus(newBrokerageJobStatus)
                await uploadFileToS3(path, filename, s3Client)
                continue
            }

            if (brokerageJobStatus.status === BrokerageJobStatusType.RUNNING
                || brokerageJobStatus.status === BrokerageJobStatusType.FAILED
                || brokerageJobStatus.status === BrokerageJobStatusType.SUCCESSFUL) continue;

            if (brokerageJobStatus.data?.filenames.includes(fileType)) continue;

            newBrokerageJobStatus.data.filenames = [...brokerageJobStatus.data?.filenames, fileType];

            await repo.upsertBrokerageJobStatus(newBrokerageJobStatus)
            await uploadFileToS3(path, filename, s3Client)
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

