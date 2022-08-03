import {DefaultConfig} from "../configuration";
import Repository from "../market-data/repository";
import {DateTime} from 'luxon';
import pg from 'pg';
import pgPromise, {IDatabase} from 'pg-promise'
import {addSecurityPrice, getSecurityBySymbol, securityPrice} from "../market-data/interfaces";
import IEX, {GetIntraDayPrices} from "../iex/index";


pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

const getTradingMap = async (client: IDatabase<any>): Promise<Record<number, any>> => {
    const response = await client.query(`SELECT date
                                         FROM us_exchange_holiday
                                         WHERE date > '2017-08-01 00:00:00'
                                         ORDER BY date`)

    let holidayMap: Record<string, unknown> = {};
    response.forEach((row: any) => {
        const dt = DateTime.fromJSDate(row.date)
        dt.set({hour: 16, minute: 0, second: 0, millisecond: 0})
        holidayMap[dt.toUnixInteger()] = {}
    });

    let tradingDayMap: Record<number, any> = {}
    let startDate = DateTime.local(2017, 8, 1, 16, 0, 0, 0, {zone: 'America/New_York'})
    let endDate = DateTime.local(2022, 8, 1, 16, 0, 0, 0, {zone: 'America/New_York'});
    for (; startDate.toUnixInteger() < endDate.toUnixInteger(); startDate = startDate.plus({day: 1})) {
        if (startDate.toUnixInteger() in holidayMap) continue
        if (startDate.weekday === 6 || startDate.weekday === 7) continue
        tradingDayMap[startDate.toUnixInteger()] = {}
    }

    return tradingDayMap
}

const getTimeAndPriceMap = async (client: IDatabase<any>, securityId: number): Promise<Record<string, securityPrice>> => {
    const response = await client.query(`
        SELECT id,
               high,
               low,
               open,
               price,
               time,
               created_at
        FROM security_price
        WHERE security_id = $1
          AND time::date < '2022-08-02'
          AND time > '2017-08-01 00:00:00-04'
        ORDER BY time;`, [securityId])
    let pp: Record<string, securityPrice> = {};
    response.forEach((row: any) => {
        let o: securityPrice = {
            id: row.id,
            price: row.price,
            high: row.high,
            low: row.low,
            open: row.open,
            time: DateTime.fromJSDate(row.time),
            createdAt: DateTime.fromJSDate(row.created_at)
        }
        pp[o.time.toUnixInteger()] = o
    });
    return pp;
}

const getClosestPrice = (timeInSeconds: number, priceMap: Record<string, securityPrice>): securityPrice | null => {
    const keys = Object.keys(priceMap)
    for (let i = 0; i < keys.length; i++) {
        const key = parseInt(keys[i]);
        if (timeInSeconds > key) return i - 1 >= 0 ? priceMap[keys[i - 1]] : priceMap[keys[i]];
    }
    return null
}

const errorDoSingluar = async (repository: Repository, iex: IEX, securityGroup: getSecurityBySymbol[]) => {
    for (let i = 0; i < securityGroup.length; i++) {
        const symbol = securityGroup[i].symbol;
        try {
            const response = await iex.bulk([symbol], ["intraday-prices"], {
                chartIEXOnly: true,
                chartIEXWhenNull: true
            });

            let securityPrices: addSecurityPrice[] = [];
            if (response[symbol] === undefined || response[symbol] === null) {
                console.error(`could not find symbol ${symbol}`)
                continue
            }

            const intradayPrices = (response[symbol]['intraday-prices']) as GetIntraDayPrices[]
            let lastClose = getFirstValue(intradayPrices, 'close');
            let lastLow = getFirstValue(intradayPrices, 'low');
            let lastHigh = getFirstValue(intradayPrices, 'high');
            let lastOpen = getFirstValue(intradayPrices, 'open');

            if (lastClose === null) return
            if (lastLow === null) lastLow = lastClose
            if (lastHigh === null) lastHigh = lastClose
            if (lastOpen === null) lastOpen = lastClose

            intradayPrices.forEach(ip => {
                const dt = DateTime.fromFormat("2022-07-22 13:30", "yyyy-LL-dd HH:mm", {
                    zone: "America/New_York"
                });

                let close = ip.close;
                if (close !== null) lastClose = close
                if (close === null) close = lastClose

                let low = ip.low;
                if (low !== null) lastLow = low;
                if (low === null) low = lastLow;

                let high = ip.high;
                if (high !== null) lastHigh = high
                if (high === null) high = lastHigh

                let open = ip.open;
                if (open !== null) lastOpen = open;
                if (open === null) open = lastOpen

                securityPrices.push({
                    price: close,
                    low: low,
                    high: high,
                    open: open,
                    time: dt.toJSDate(),
                    securityId: securityGroup[i].id
                });
            })
            if (securityPrices.length <= 0) continue
            await repository.addSecuritiesPrices(securityPrices);
        } catch (e) {
            console.error(e, symbol)
        }
    }
}

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

    const repository = new Repository(pgClient, pgp);
    console.log("Starting...")
    try {
        await pgClient.tx(async (tx) => {
            await tx.one("UPDATE STATEEM");
            await tx.none("DELETE STATEMENT")
        });
    } catch (err) {
        throw new Error("handle db error some where from the client " + err)
    }


    // const securities = await repository.getUSExchangeListedSecurities();
    // const securitiesMap: Record<string, getSecurityBySymbol> = {};
    // securities.forEach(sec => securitiesMap[sec.symbol] = sec);
    //
    // const groupSecurities = buildGroups(securities);
    // for (let i = 0; i < groupSecurities.length; i++) {
    //     console.log(`Processing ${i + 1}/${groupSecurities.length}`)
    //     const securityGroup = groupSecurities[i];
    //     const symbols = securityGroup.map(sec => sec.symbol);
    //     let response: Record<string, any>;
    //
    //     try {
    //         response = await iex.bulk(symbols, ["intraday-prices"], {
    //             chartIEXOnly: true,
    //             chartIEXWhenNull: true
    //         });
    //     } catch (e) {
    //         await errorDoSingluar(repository, iex, securityGroup)
    //         continue
    //     }
    //
    //     let securityPrices: addSecurityPrice[] = [];
    //     securityGroup.forEach(sec => {
    //         const {symbol, id} = sec;
    //         if (response[symbol] === undefined || response[symbol] === null) {
    //             console.error(`could not find symbol ${symbol}`)
    //             return
    //         }
    //
    //         const intradayPrices = (response[symbol]['intraday-prices']) as GetIntraDayPrices[]
    //         let lastClose = getFirstValue(intradayPrices, 'close');
    //         let lastLow = getFirstValue(intradayPrices, 'low');
    //         let lastHigh = getFirstValue(intradayPrices, 'high');
    //         let lastOpen = getFirstValue(intradayPrices, 'open');
    //
    //         if (lastClose === null) return
    //         if (lastLow === null) lastLow = lastClose
    //         if (lastHigh === null) lastHigh = lastClose
    //         if (lastOpen === null) lastOpen = lastClose
    //
    //         intradayPrices.forEach(ip => {
    //             const dt = DateTime.fromFormat("2022-07-22 13:30", "yyyy-LL-dd HH:mm", {
    //                 zone: "America/New_York"
    //             });
    //
    //             let close = ip.close;
    //             if (close !== null) lastClose = close
    //             if (close === null) close = lastClose
    //
    //             let low = ip.low;
    //             if (low !== null) lastLow = low;
    //             if (low === null) low = lastLow;
    //
    //             let high = ip.high;
    //             if (high !== null) lastHigh = high
    //             if (high === null) high = lastHigh
    //
    //             let open = ip.open;
    //             if (open !== null) lastOpen = open;
    //             if (open === null) open = lastOpen
    //
    //             securityPrices.push({
    //                 price: close,
    //                 low: low,
    //                 high: high,
    //                 open: open,
    //                 time: dt.toJSDate(),
    //                 securityId: id
    //             });
    //         })
    //     });
    //     if (securityPrices.length <= 0) continue
    //     await repository.addSecuritiesPrices(securityPrices);
    // }


    const tradingMap = await getTradingMap(pgClient);
    const tradingTimes = Object.keys(tradingMap);
    const securities = await repository.getSecurities();

    let cnt = 1;
    for (const security of securities) {
        console.log(`Processed ${cnt}/${securities.length}`)
        cnt++
        const timeAndPriceMap = await getTimeAndPriceMap(pgClient, security.id)
        const timesHave = Object.keys(timeAndPriceMap);
        if (timesHave.length < 1) continue

        // get start Time and end time for current trading
        const oldestTradingTime = timesHave[0];
        const newestTradingTime = timesHave[timesHave.length - 1];

        let constrainedTimes = tradingTimes.filter(x => x >= oldestTradingTime && x <= newestTradingTime)
        const missingTradingTimes = constrainedTimes.filter(x => !timesHave.includes(x))

        let missingTimesInsert: addSecurityPrice[] = [];
        missingTradingTimes.forEach(t => {
            const tInt = parseInt(t)
            let dt = DateTime.fromSeconds(tInt)
            dt = dt.setZone('America/New_York')

            const secPrice = getClosestPrice(tInt, timeAndPriceMap)
            if (!secPrice) {
                console.error(`Could not find price for security(${security.symbol}. For time: ${dt.toISO()}`)
                return
            }

            missingTimesInsert.push({
                price: secPrice.price,
                high: secPrice.high,
                low: secPrice.low,
                open: secPrice.open,
                time: dt.toJSDate(),
                securityId: security.id
            })
        });

        console.log(`Total: ${missingTimesInsert.length}\n`)
        await repository.upsertSecuritiesPrices(missingTimesInsert)
    }
})()

const getFirstValue = (values: Record<string, any>[], tag: string): any | null => {
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value[tag]) return value[tag]
    }
    return null;
}

// Fill in history with High/Low/Open/
// Fill in intra-day with High/Low/Open
// Fill in any missing days for those prices