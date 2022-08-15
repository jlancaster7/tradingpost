process.env.CONFIGURATION_ENV = 'production'
import { DefaultConfig } from "../configuration";
import pgPromise, { IDatabase, IMain } from "pg-promise";
import Repository from './repository';
import Finicity from "../finicity";
import FinicityService from "./finicity";
import Brokerage from './index';
import {DateTime} from "luxon";
import { PortfolioSummaryService } from './portfolio-summary'
import pg from "pg";
import FinicityTransformer from "./finicity/transformer";

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
    let pgClient: IDatabase<any>;
    let pgp: IMain;
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    pgp = pgPromise({});
    pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    await pgClient.connect()

    const repo = new Repository(pgClient, pgp);
    const portfolioSummaryService = new PortfolioSummaryService(repo);
    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init();
    const transformer = new FinicityTransformer(repo);
    const finicityService = new FinicityService(finicity, repo, transformer)
    const broker = new Brokerage(pgClient, pgp, finicity);
    const userId = '8e787902-f0e9-42aa-a8d8-18e5d7a1a34d';

    const account = await finicityService.exportAccounts(userId);
    await repo.upsertTradingPostBrokerageAccounts(account);

    const holdings = await finicityService.exportHoldings(userId);
    await repo.upsertTradingPostCurrentHoldings(holdings);
    
    const transactions = await finicityService.exportTransactions(userId);
    await repo.upsertTradingPostTransactions(transactions);

    const tpAccounts = await repo.getTradingPostBrokerageAccounts(userId)
    const start = DateTime.now().setZone("America/New_York");
    const end = start.minus({month: 24})
    for (let d of tpAccounts) {
        const holdingHistory = await broker.computeHoldingsHistory(d.id, start, end);
        await repo.upsertTradingPostHistoricalHoldings(holdingHistory);
    }
    const tpAccountIds = tpAccounts.map(a => a.id);
    await repo.addTradingPostAccountGroup(userId, 'default', tpAccountIds, 10117)
    const stat = await portfolioSummaryService.computeAccountGroupSummary(userId)
    console.log(stat);
})()