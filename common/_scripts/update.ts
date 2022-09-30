import BrokerageService from "../brokerage/service";
import Repository from "../brokerage/repository";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import FinicityService from "../brokerage/finicity/index";
import FinicityTransformer from "../brokerage/finicity/transformer";
import {DefaultConfig} from "../configuration/index";
import Finicity from "../finicity/index";
import pgPromise from "pg-promise";
import pg from 'pg';

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
    const repo = new Repository(pgClient, pgp)
    const portSummary = new PortfolioSummaryService(repo);
    const brokerageMap = {
        "finicity": new FinicityService(finicity, repo, new FinicityTransformer(repo))
    }
    const repository = new Repository(pgClient, pgp);
    const brokerageSrv = new BrokerageService(brokerageMap, repo, portSummary);

    const accountId = 340
    const oldestTransaction = await repository.getOldestTransaction(accountId);
    console.log(oldestTransaction)
    if (!oldestTransaction) return
    console.log(oldestTransaction.date.toString())
    const holdingHistory = await brokerageSrv.computeHoldingsHistory(accountId, oldestTransaction.date);
    console.log(holdingHistory)
    await repository.upsertTradingPostHistoricalHoldings(holdingHistory);
    console.log("Finished")
})()