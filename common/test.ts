import 'dotenv/config'
import {DefaultConfig} from "./configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from './brokerage/repository';
import {Service as RobinhoodService} from "./brokerage/robinhood";
import {default as RobinhoodTransformer} from "./brokerage/robinhood/transformer";
import {PortfolioSummaryService} from "./brokerage/portfolio-summary";
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

    // const rhCfg = await DefaultConfig.fromCacheOrSSM("robinhood");
    // const repository = new Repository(pgClient, pgp);
    // const transformer = new RobinhoodTransformer(repository);
    // const portSummarty = new PortfolioSummaryService(repository);
    // const robinhood = new RobinhoodService(rhCfg.clientId, rhCfg.scope, rhCfg.expiresIn, repository, transformer, portSummarty);
    // const institution = await repository.getInstitutionByName("Robinhood");
    // if (!institution) throw new Error(" no robinhood institution")
    // await robinhood.positions("ea05f297-461f-49be-99b9-67ce9ad238c6");

    const dtNow = DateTime.now();
    const dtJson = JSON.stringify({t: dtNow});
    console.log("Date JOSN", dtJson)
    const dtObj = JSON.parse(dtJson)
    const dt = DateTime.fromISO(dtObj.t);
    console.log(dt);
}

(async() => {
    await run()
})()