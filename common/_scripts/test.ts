import Brokerage from "../brokerage";
import {DefaultConfig} from "../configuration/index";
import pgPromise from 'pg-promise';
import Finicity from "../finicity/index";
import {DateTime} from 'luxon';

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

})()