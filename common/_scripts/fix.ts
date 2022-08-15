import {DefaultConfig} from "../configuration";
import Repository from "../market-data/repository";
import {DateTime} from 'luxon';
import pg from 'pg';
import pgPromise from 'pg-promise'
import {buildGroups} from '../../lambdas/market-data/utils'
import {addSecurityPrice, getSecurityBySymbol} from "../market-data/interfaces";
import IEX, {GetHistoricalPrice, GetIntraDayPrices} from "../iex/index";

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

// const getTradingMap = async (client: Knex) => {
//     const response = await client('us_exchange_holiday')
//         .orderBy('date').select('date');
//
//     let holidayMap: Record<string, unknown> = {};
//     response.forEach((row: any) => {
//         const dt = DateTime.fromJSDate(row.date)
//         dt.set({hour: 16, minute: 0, second: 0, millisecond: 0})
//         holidayMap[dt.toSeconds()] = {}
//     });
//
//     let tradingDayMap: Record<number, any> = {}
//     let startDate = DateTime.local(2006, 1, 1, 16, 0, 0, 0, {zone: 'America/New_York'})
//     let endDate = DateTime.local(2026, 1, 1, 16, 0, 0, 0, {zone: 'America/New_York'});
//     for (; startDate.toSeconds() < endDate.toSeconds(); startDate = startDate.plus({day: 1})) {
//         if (startDate.toSeconds() in holidayMap) continue
//         if (startDate.weekday === 6 || startDate.weekday === 7) continue
//         tradingDayMap[startDate.toSeconds()] = {}
//     }
//
//     return tradingDayMap
// }
//
// const getTimeAndPriceMap = async (client: Knex, securityId: number): Promise<Record<string, string>> => {
//     const response = await client('security_prices')
//         .select('time', 'price')
//         .where({security_id: securityId})
//         .whereRaw(`time < NOW() - INTERVAL '8 DAYS'`)
//         .orderBy('time')
//
//     let pp: Record<string, string> = {};
//     response.forEach((row: any) => {
//         const dt = DateTime.fromJSDate(row.time)
//         pp[dt.toSeconds()] = row.price
//     });
//
//     return pp;
// }

// const getClosestPrice = (timeInSeconds: number, priceMap: Record<string, string>): string | null => {
//     const keys = Object.keys(priceMap)
//     for (let i = 0; i < keys.length; i++) {
//         const key = parseInt(keys[i]);
//         if (timeInSeconds > key) return i - 1 >= 0 ? priceMap[keys[i - 1]] : priceMap[keys[i]];
//     }
//     return null
// }
//
// const insertPrices = async (client: Knex, prices: { security_id: number, time: DateTime, price: string }[]) => {
//     await client.batchInsert('security_prices', prices);
// }

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

    let latestSecurityPrices: Record<string, number> = {};
    securities.forEach(sec => latestSecurityPrices[sec.symbol] = 0); //sec.latestPrice);

    const dates = ["20220808", "20220809", "20220810", "20220811", "20220812"];
    for (let i = 0; i < groupSecurities.length; i++) {
        console.log(`Processing ${i + 1}/${groupSecurities.length}`)
        const securityGroup = groupSecurities[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        for (let dateIdx = 0; dateIdx < dates.length; dateIdx++) {
            const date = dates[dateIdx];
            console.log(`\t\tProcessing Day: ${date}`)
            let response: Record<string, any>;

            try {
                response = await iex.bulk(symbols, ["chart"], {
                    chartIEXOnly: true,
                    chartIEXWhenNull: true,
                    exactDate: date,
                });
            } catch (e) {
                console.error(e)
                continue
            }

            let securityPrices: addSecurityPrice[] = [];
            securityGroup.forEach(sec => {
                const {symbol, id} = sec;
                if (response[symbol] === undefined || response[symbol] === null) {
                    console.error(`could not find symbol ${symbol}`)
                    return
                }

                const intradayPrices = (response[symbol]['chart']) as GetIntraDayPrices[]

                let latestPrice = latestSecurityPrices[symbol];
                intradayPrices.forEach(ip => {
                    const dt = DateTime.fromFormat(`${ip.date} ${ip.minute}`, "yyyy-LL-dd HH:mm", {
                        zone: "America/New_York"
                    }).set({second: 0, millisecond: 0});

                    let close = ip.close,
                        open = ip.open,
                        high = ip.high,
                        low = ip.low;
                    if (close !== null) latestPrice = close
                    else {
                        close = latestPrice;
                        open = latestPrice;
                        high = latestPrice;
                        low = latestPrice;
                    }

                    if (close === null) return;
                    if (open === null) open = close
                    if (high === null) high = close
                    if (low === null) low = close


                    latestSecurityPrices[symbol] = close

                    securityPrices.push({
                        price: close,
                        low: low,
                        high: high,
                        open: open,
                        time: dt.toJSDate(),
                        securityId: id,
                        isEod: false,
                        isIntraday: true
                    });
                })
            });

            const newSecPrices = securityPrices.filter(sec => {
                if (sec.price === null) return false;
                return true;
            })
            if (newSecPrices.length <= 0) continue
            await repository.upsertSecuritiesPrices(newSecPrices);
        }
    }


    // const tradingMap = await getTradingMap(pgClient);
    // const tradingTimes = Object.keys(tradingMap);
    //
    // const securities = await getSecurities(pgClient);
    //
    // let cnt = 1;
    // for (const security of securities) {
    //     console.log(`Processed ${cnt}/${securities.length}`)
    //     cnt++
    //     const timeAndPriceMap = await getTimeAndPriceMap(pgClient, security.id)
    //     const timesHave = Object.keys(timeAndPriceMap);
    //     if (timesHave.length < 1) continue
    //
    //     // get start Time and end time for current trading
    //     const oldestTradingTime = timesHave[0];
    //     const newestTradingTime = timesHave[timesHave.length - 1];
    //
    //     let constrainedTimes = tradingTimes.filter(x => x >= oldestTradingTime && x <= newestTradingTime)
    //     const missingTradingTimes = constrainedTimes.filter(x => !timesHave.includes(x))
    //     let missingTimesInsert: { security_id: number, time: DateTime, price: string }[] = [];
    //     missingTradingTimes.forEach(t => {
    //         const tInt = parseInt(t)
    //         let dt = DateTime.fromSeconds(tInt)
    //         dt = dt.setZone('America/New_York')
    //         const price = getClosestPrice(tInt, timeAndPriceMap)
    //         if (!price) {
    //             console.error(`Could not find price for security(${security.symbol}. For time: ${dt.toISO()}`)
    //             return
    //         }
    //
    //         missingTimesInsert.push({security_id: security.id, time: dt, price: price})
    //     });
    //
    //     console.log(`Total: ${missingTimesInsert.length}\n`)
    //     await insertPrices(pgClient, missingTimesInsert)
    // }
})()

// Fill in history with High/Low/Open/
// Fill in intra-day with High/Low/Open
// Fill in any missing days for those prices