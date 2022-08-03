import {DefaultConfig} from "../configuration/index";
import pgPromise from 'pg-promise';
import Finicity from "../finicity/index";
import FinicityService from "../brokerage/finicity";
import Repository from "../brokerage/repository"
import FinicityTransformer from "../brokerage/finicity/transformer";
import BrokerageService from "../brokerage/service";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import {DateTime} from "luxon";

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

    const portfolioSummaryService = new PortfolioSummaryService(repo);

    const finTransformer = new FinicityTransformer(repo);
    const finicityService = new FinicityService(finicity, repo, finTransformer);

    // console.log("Starting...")
    // const tpAccounts = await repo.getTradingPostBrokerageAccounts(tpUserId)
    //
    // const brokerageService = new BrokerageService({"finicity": finicityService}, repo, portfolioSummaryService);
    // for (let i = 0; i < tpAccounts.length; i++) {
    //     const acc = tpAccounts[i];
    //     const acctHoldingHistory = await brokerageService.computeHoldingsHistory(acc.id);
    //     await repo.upsertTradingPostHistoricalHoldings(acctHoldingHistory);
    // }
    //
    // console.log("finished")
})()
