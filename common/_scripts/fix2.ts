import {DefaultConfig} from "../configuration";
import Repository from "../market-data/repository";
import {DateTime} from 'luxon';
import pg from 'pg';
import pgPromise from 'pg-promise'
import IEX, {GetHistoricalPrice} from "../iex/index";
import {addSecurityPrice, getSecurityBySymbol} from "../market-data/interfaces";
import {buildGroups} from '../../lambdas/market-data/utils'
import {sleep} from "../utils/sleep";

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
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    })
    await pgClient.connect()

    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    const repository = new Repository(pgClient, pgp);
    const securities = await repository.getUSExchangeListedSecurities();
    const securitiesMap: Record<string, getSecurityBySymbol> = {};
    securities.forEach(sec => securitiesMap[sec.symbol] = sec);
    const groupSecurities = buildGroups(securities, 100);

    for (let i = 0; i < groupSecurities.length; i++) {
        const group = groupSecurities[i];
        const symbols = group.map(sec => sec.symbol);
        const response = await iex.bulk(symbols, ["chart"], {
            range: '1m'
        });

        let securityPrices: addSecurityPrice[] = []
        group.forEach(sec => {
            const {symbol, id} = sec;
            if (response[symbol] === undefined || response[symbol] === null) {
                console.error(`could not find symbol ${symbol}`)
                return
            }

            const historicPrices = (response[symbol]['chart']) as GetHistoricalPrice[];
            let latestPrice = sec.latestPrice
            historicPrices.forEach(hp => {
                const dt = DateTime.fromFormat(hp.date, 'yyyy-LL-dd', {
                    zone: "America/New_York"
                }).set({minute: 0, hour: 16, second: 0, millisecond: 0});

                let close = hp.close,
                    open = hp.open,
                    high = hp.high,
                    low = hp.low;
                if (close !== null) latestPrice = close
                else {
                    close = latestPrice
                    open = latestPrice
                    high = latestPrice
                    low = latestPrice
                }

                if (close === null) return;

                if (open === null) open = close
                if (high === null) high = close
                if (low === null) low = close
                securityPrices.push({
                    securityId: id,
                    price: close,
                    low: low,
                    high: high,
                    open: open,
                    time: dt.toJSDate(),
                    isEod: true,
                    isIntraday: false
                });
            })
        })

        await repository.upsertSecuritiesPrices(securityPrices)
    }
    console.log("Finished")
})()
