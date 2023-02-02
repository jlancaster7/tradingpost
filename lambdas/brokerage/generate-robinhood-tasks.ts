import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from "@tradingpost/common/brokerage/repository";
import {
    BrokerageTask,
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


const run = async () => {
//     if (!pgClient || !pgp) {
//         const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
//         pgp = pgPromise({});
//         pgClient = pgp({
//             host: postgresConfiguration.host,
//             user: postgresConfiguration.user,
//             password: postgresConfiguration.password,
//             database: postgresConfiguration.database
//         })
//
//         await pgClient.connect();
//     }
//
//     if (DateTime.now().hour !== 7) return;
//
//     const repository = new Repository(pgClient, pgp);
//     const robinhoodUsers = await repository.getRobinhoodUsers();
//     const robinhoodTasks = robinhoodUsers.map(ru => {
//         let x: BrokerageTask = {
//             date: DateTime.now().setZone("America/New_York").set({minute: 0, second: 0, millisecond: 0, hour: 7}),
//             status: BrokerageTaskStatusType.Pending,
//             data: null,
//             userId: ru.userId,
//             brokerage: DirectBrokeragesType.Robinhood,
//             type: BrokerageTaskType.NewData,
//             brokerageUserId: ru.userId,
//             finished: null,
//             started: null,
//             error: null
//         }
//         return x;
//     });
//
//     await repository.upsertBrokerageTasks(robinhoodTasks);
}

export const handler = async (event: any, context: Context) => {
    await run();
}