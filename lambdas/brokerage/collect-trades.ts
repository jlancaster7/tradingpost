import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from '@tradingpost/common/brokerage/repository';
import BrokerageService from '@tradingpost/common/brokerage';
import Finicity from "@tradingpost/common/finicity/index";

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

        await pgClient.connect();
    }

    const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey, tokenFile);
    await finicity.init();

    // TODO: Run this every 15 mins from 4AM MT -> 6AM MT if an accounts positions have not been updated to today,
    //      then check
    const brokerageService = new BrokerageService(pgClient, pgp, finicity);
    const repository = new Repository(pgClient, pgp);
    const finicityUsers = await repository.getFinicityUsers();
    for (let i = 0; i < finicityUsers.length; i++) {
        const finicityUser = finicityUsers[i];
        await brokerageService.pullNewData('finicity', finicityUser.customerId);
    }
}

// export const handler = async (event: any, context: Context) => {
//     await run("/tmp/token-file.json");
// }

(async() => {
   await run();
})()