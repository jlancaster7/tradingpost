import {DefaultConfig} from "../configuration/index";
import pgPromise from 'pg-promise';
import Finicity from "../finicity/index";
import FinicityService from "../brokerage/finicity";
import Repository from "../brokerage/repository"
import FinicityTransformer from "../brokerage/finicity/transformer";
import Brokerage from "../brokerage/index";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import pg from "pg";

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

    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init()

    const tpUserId = "8e787902-f0e9-42aa-a8d8-18e5d7a1a34d";
    const repo = new Repository(pgClient, pgp);
    const g = await repo.getAccountGroupSummary(24);
    console.log(g.exposure.net)
    // console.log("Starting...")
    // const brokerageService = new Brokerage(pgClient, pgp, finicity);
    // await brokerageService.addNewAccounts("6007115349", "finicity")
    // // await brokerageService.newlyAuthenticatedBrokerage(tpUserId, 'finicity')
    // console.log("Finished")
})()
