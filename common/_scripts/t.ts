import MarketData from "../market-data/index";
import {DefaultConfig} from "../configuration/index";
import pgPromise from "pg-promise";
import Repository from "../market-data/repository";
import IEX, {GetIntraDayPrices} from "../iex/index";
import {PriceSourceType} from "../market-data/interfaces";
import {DateTime} from "luxon";

(async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    })
    await pgClient.connect();

    const repo = new Repository(pgClient, pgp);
    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    const marketData = new MarketData(repo, iex);

    const response = {
        'AAPL': {
            'intraday-prices': <GetIntraDayPrices[]>[
                // {
                //     "date": "2023-02-27",
                //     "minute": "09:45",
                //     "label": "09:45 AM",
                //     "high": 148.24,
                //     "low": 147.735,
                //     "open": 147.79,
                //     "close": 148.24,
                //     "average": 147.878,
                //     "volume": 5800,
                //     "notional": 857691,
                //     "numberOfTrades": 41
                // },
            ]
        }
    }

    const r = await marketData._process([{
        price: 10,
        time: DateTime.now().setZone("America/New_York").set({
            hour: 9,
            minute: 50,
            second: 0,
            millisecond: 0
        }).minus({day: 1}),
        open: 12,
        high: 13,
        low: 14,
        securityId: 10,
        symbol: 'AAPL',
        priceSource: PriceSourceType.UNKNOWN
    }], response);

    console.log(r[1])
})()
