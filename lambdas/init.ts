import {DefaultConfig} from "@tradingpost/common/configuration/index";
import pgPromise from "pg-promise";
import pg from "pg";
import IEX from "@tradingpost/common/iex/index";
import Holidays from "@tradingpost/common/market-data/holidays";
import Repository from "@tradingpost/common/market-data/repository";

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

export const init = (async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    const marketRepository = new Repository(pgClient, pgp);
    const marketHolidays = new Holidays(marketRepository);

    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    return {pgp, pgClient, marketHolidays, marketRepository, iex}
})();