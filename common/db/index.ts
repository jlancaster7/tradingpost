import {DefaultConfig} from '../configuration'
import pg from 'pg'
import pgPromise from "pg-promise";
import Finicity from "../finicity";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import Repository from "../brokerage/repository";
import {Service} from "../brokerage/finicity";
import {Transformer} from "../brokerage/finicity/transformer";
import {SQSClient} from "@aws-sdk/client-sqs";
import Holidays from "../market-data/holidays";
import MarketDataRepo from "../market-data/repository";

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

const debug = true;

export const getHivePool = (async () => {
    let hive: pg.Pool

    const config = await DefaultConfig.fromCacheOrSSM("postgres");
    hive = new pg.Pool({...config, max: 10});
    return hive;
})()

export const init = (async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database,
        max: 10
    });

    const marketRepo = new MarketDataRepo(pgClient, pgp);
    const marketHolidays = new Holidays(marketRepo)
    const repository = new Repository(pgClient, pgp);

    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init();
    const finicityTransformer = new Transformer(repository, marketHolidays);
    const finicitySrv = new Service(finicity, repository, finicityTransformer);

    const portfolioSummarySrv = new PortfolioSummaryService(repository)
    const sqsClient = new SQSClient({
        region: 'us-east-1',
    })

    return {
        finicitySrv,
        portfolioSummarySrv,
        sqsClient,
        pgp,
        pgClient, repository
    }
})()


export const execProc = async <Result = any, Count extends number = 0, T = any>(proc: string, prms?: T, ensureCount?: Count, ensureCountMessage?: string): Promise<Count extends 1 ? Result : Result[]> => {
    const hive = await getHivePool;

    const result = prms ? await hive.query(`SELECT *
                                            FROM ${proc}($1)`, [JSON.stringify(prms)]) :
        await hive.query(`SELECT *
                          FROM ${proc}('{}')`)
    if (ensureCount && result.rowCount !== ensureCount) {

        const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
        if (debug) {
            console.error(defaultError);
            console.error(JSON.stringify(prms));
            console.error(JSON.stringify(proc));
        }
        throw {
            message: ensureCountMessage || defaultError,
            data: {
                procedure: proc,
                parameters: prms
            }
        }
    }

    if (ensureCount === 1)
        return result.rows[0]
    else return result.rows as (Count extends 1 ? Result : Result[]);
}

export const execProcOne = async <Result = any, T = any>(proc: string, prms?: T, ensureCountMessage?: string) => {
    return await execProc<Result, 1, T>(proc, prms, 1, ensureCountMessage);
}