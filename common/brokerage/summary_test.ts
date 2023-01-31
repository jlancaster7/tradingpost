import 'dotenv/config'
import {DefaultConfig} from "../configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import Repository from './repository';
import {BrokerageTaskStatusType, BrokerageTaskType, DirectBrokeragesType} from "./interfaces";
import {DateTime} from "luxon";

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

    const repo = new Repository(pgClient, pgp);
    try {
        await repo.execTx(async (t) => {
            await t.upsertBrokerageTasks([{
                status: BrokerageTaskStatusType.Pending,
                date: DateTime.now(),
                userId: "4a6f0899-dc6d-40cc-aa6a-1febb579d65a",
                messageId: null,
                brokerage: DirectBrokeragesType.Robinhood,
                type: BrokerageTaskType.ToDo,
                started: null,
                data: null,
                finished: null,
                brokerageUserId: "12347",
                error: null
            }]);
            await t.upsertBrokerageTasks([{
                status: BrokerageTaskStatusType.Pending,
                date: DateTime.now(),
                userId: "4a6f0899-dc6d-40cc-aa6a-1febb579d65a",
                messageId: null,
                brokerage: DirectBrokeragesType.Robinhood,
                type: BrokerageTaskType.ToDo,
                started: null,
                data: null,
                finished: null,
                brokerageUserId: "123456",
                error: null
            }]);
            throw new Error("Yeah")
        });
    } catch (e) {
        console.error("Error happened: ", e)
    }

    console.log("FIN!")
}

(async () => {
    await run();
})()