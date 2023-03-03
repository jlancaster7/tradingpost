import 'dotenv/config'
import {DefaultConfig} from "../configuration";
import pgPromise from "pg-promise";
import pg from 'pg';
import Repository from '../brokerage/repository';
import {Service as FinicityService} from "../brokerage/finicity";
import {Transformer as FinicityTransformer} from "../brokerage/finicity/transformer";
import {default as FinicityApi} from "../finicity";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
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


const run = async () => {
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: "127.0.0.1",
        user: "postgres",
        password: "test",
        database: "tradingpost_db"
    })

    const repository = new Repository(pgClient, pgp);
    const portfolioSummaryService = new PortfolioSummaryService(repository);

    const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');
    const finicityApi = new FinicityApi(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicityApi.init();

    const finicityTransformer = new FinicityTransformer(repository);
    const finicitySrv = new FinicityService(finicityApi, repository, finicityTransformer, portfolioSummaryService);

    // await finicityTransformer.computeHoldingsHistory(498, false);
    // console.log("FIN!")
    try {
        console.log("Adding...")
        await finicitySrv.add("e2268937-157b-4a33-a970-a9ba88d10a46", "6020539284", DateTime.now(), null, true);
    } catch (e) {
        console.error(e)
    }

}

(async () => {
    await run()
})()