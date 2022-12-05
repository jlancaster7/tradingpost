// import Repository from "../brokerage/repository";
// import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
// import FinicityService from "../brokerage/finicity/index";
// import FinicityTransformer from "../brokerage/finicity/transformer";
// import {DefaultConfig} from "../configuration/index";
// import Finicity from "../finicity/index";
// import pgPromise from "pg-promise";
// import pg from 'pg';
//
// pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
//     return parseInt(value);
// });
//
// pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
//     return parseFloat(value);
// });
//
// pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
//     return parseFloat(value);
// });
//
// pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
//     return parseFloat(value);
// });
//
// (async () => {
//     const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
//     const pgp = pgPromise({});
//     const pgClient = pgp({
//         host: pgCfg.host,
//         user: pgCfg.user,
//         password: pgCfg.password,
//         database: pgCfg.database
//     });
//
//     await pgClient.connect()
//
//     const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
//     const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
//     await finicity.init()
//     const repo = new Repository(pgClient, pgp)
//     const portSummary = new PortfolioSummaryService(repo);
//     const brokerageMap = {
//         "finicity": new FinicityService(finicity, repo, new FinicityTransformer(repo))
//     }
//
//     const fin = new FinicityService(finicity, repo, new FinicityTransformer(repo));
//
//     const repository = new Repository(pgClient, pgp);
//     const brokerageSrv = new BrokerageService(brokerageMap, repo, portSummary);
//
//     const brokerageUserId = "6011636851";
//     const tradingpostUserId = "6ebe730d-684f-4f62-b3e1-7e2b1c78e184"
//
//     console.log("Importing Holdings")
//     const holdings = await fin.importHoldings(brokerageUserId);
//     console.log("Upserting Holdings")
//     await repository.upsertTradingPostCurrentHoldings(holdings);
//
//     console.log("Importing Transactions")
//     const transactions = await fin.importTransactions(brokerageUserId);
//
//     console.log("Upserting Transactions")
//     await repository.upsertTradingPostTransactions(transactions);
//
//     console.log("Running Holdings History")
//     const accountsToProcess = await repository.getTradingPostBrokerageAccounts(tradingpostUserId);
//     for (let i = 0; i < accountsToProcess.length; i++) {
//         const account = accountsToProcess[i];
//         const oldestTransaction = await repository.getOldestTransaction(account.id);
//         if (!oldestTransaction) continue
//         const holdingHistory = await brokerageSrv.computeHoldingsHistory(account.id, oldestTransaction.date);
//         await repository.upsertTradingPostHistoricalHoldings(holdingHistory);
//     }
//
//     console.log("Computing Account Group Summaries")
//     // const tpAccountIds = accountsToProcess.map(tp => tp.id)
//     // await repository.addTradingPostAccountGroup(tradingpostUserId, 'default', tpAccountIds, 10117)
//     await portSummary.computeAccountGroupSummary(tradingpostUserId)
//     console.log("Fin")
// })()