import {DefaultConfig} from "../../configuration";
import {FinicityService} from "../../brokerage/finicity";
import pgPromise from "pg-promise";
import pg from 'pg'
import Finicity from "../../finicity/index";
import Repository from "../../brokerage/repository";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
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
    const repository = new Repository(pgClient, pgp);

    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity")
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey)
    const finicityService = new FinicityService(finicity, repository);
})()