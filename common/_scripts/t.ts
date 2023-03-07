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

    // let hardCoded = [663, 664, 665]
    // for (let i = 0; i < hardCoded.length; i++) {
    //     const newAccountId = hardCoded[i];
    //     // Don't compute some security types for historical holdings since we do not have pricing at the moment
    //     console.log(newAccountId);
    //     await finicityTransformer.computeHoldingsHistory(newAccountId, true);
    // }

    const accounts = [
        {
            internalId: 289,
            externalId: '6036155893'
        },
        {
            internalId: 324,
            externalId: '6036155894'
        },
        {
            internalId: 291,
            externalId: '6036155895'
        }
    ];

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const transactions = await repository.getFinicityTransactions([account.internalId])
        if (transactions.length <= 0) throw new Error("no transactions")
        await finicityTransformer.transactions('806e4c98-20e1-4c20-b633-0ae3a8703190', '6020539284',
            transactions, account.externalId)
    }

    // console.log("Computing")
    // await portfolioSummaryService.computeAccountGroupSummary('806e4c98-20e1-4c20-b633-0ae3a8703190');
    // console.log("Fin Computing")
    // try {
    //     console.log("Adding...")
    //     await finicitySrv.add("806e4c98-20e1-4c20-b633-0ae3a8703190", "6020539284", DateTime.now(), null, true);
    // } catch (e) {
    //     console.error(e)
    // }

}

(async () => {
    await run()
})()