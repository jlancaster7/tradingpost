import 'dotenv/config'
import {DefaultConfig} from "../configuration";
import pgPromise from "pg-promise";
import pg from 'pg';
import Repository from '../brokerage/repository';
import {Service as FinicityService} from "../brokerage/finicity";
import {Transformer as FinicityTransformer} from "../brokerage/finicity/transformer";
import {default as FinicityApi} from "../finicity";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import Holidays from "../market-data/holidays";
import MarketDataRepository from "../market-data/repository";
import {DateTime} from "luxon";
import {accounts} from "../brokerage/robinhood/api";

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


const run = async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    })

    const repository = new Repository(pgClient, pgp);
    const portfolioSummaryService = new PortfolioSummaryService(repository);

    const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');
    const finicityApi = new FinicityApi(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicityApi.init();

    const marketDataRepo = new MarketDataRepository(pgClient, pgp);
    const marketHolidays = new Holidays(marketDataRepo);
    const finicityTransformer = new FinicityTransformer(repository, marketHolidays);
    const finicitySrv = new FinicityService(finicityApi, repository, finicityTransformer, portfolioSummaryService);

    // await finicitySrv.add("e2268937-157b-4a33-a970-a9ba88d10a46", "6020539284", DateTime.now(), {}, true);

    console.log("Start")
    await portfolioSummaryService.computeAccountGroupSummary('e2268937-157b-4a33-a970-a9ba88d10a46')
    console.log("Fin")
    const accountIds = [
        {
            tpAccountId: 689,
            internalId: 347,
            externalId: '6036155893',
            detail: {
                description: "ROLLOVER IRA",
                dateAsOf: 1678258800
            },
            aggregationSuccessDate: 1678379879
        },
        {
            tpAccountId: 690,
            internalId: 348,
            externalId: '6036155894',
            detail: {
                description: "ROTH IRA",
                dateAsOf: 1678258800
            },
            aggregationSuccessDate: 1678379884
        },
        {
            tpAccountId: 691,
            internalId: 349,
            externalId: '6036155895',
            detail: {
                description: "INDIVIDUAL",
                dateAsOf: 1678258800
            },
            aggregationSuccessDate: 1678379884
        }
    ];

    console.log("Starting")
    // for (let i = 0; i < accountIds.length; i++) {
    //     const account = accountIds[i];
    //     // const holdings = await repository.getFinicityHoldings([account.internalId]);
    //     // await finicityTransformer.holdings('e2268937-157b-4a33-a970-a9ba88d10a46', '6020539284', account.externalId, holdings, 'USD', account.detail, DateTime.fromSeconds(account.aggregationSuccessDate));
    //     await finicityTransformer.computeHoldingsHistory(account.tpAccountId)
    //     // const transactions = await repository.getFinicityTransactions([account.internalId])
    //     // console.log("Account: ", account.internalId, "Transaction length: ", transactions.length)
    //     // await finicityTransformer.transactions('e2268937-157b-4a33-a970-a9ba88d10a46', '6020539284',
    //     //     transactions, account.externalId)
    // }
    // console.log("fin")

}

(async () => {
    await run()
})()