import {DefaultConfig} from "../configuration";
import pg from 'pg';
import pgPromise, {IMain, IDatabase} from 'pg-promise'

import Repository from '../brokerage/repository';
import Brokerage from '../brokerage';
import Finicity from "../finicity";
import {DateTime} from 'luxon';

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

const getTradingMap = async (client: IDatabase<any>, pgp: IMain) => {
    const query = `SELECT date
                   FROM us_exchange_holiday
                   ORDER BY date`;
    const response = await client.query(query);
    let holidayMap: Record<string, unknown> = {};
    response.forEach((row: any) => {
        const dt = DateTime.fromJSDate(row.date)
        dt.set({hour: 16, minute: 0, second: 0, millisecond: 0})
        holidayMap[dt.toSeconds()] = {}
    });

    let tradingDayMap: Record<number, any> = {}
    let startDate = DateTime.local(2006, 1, 1, 16, 0, 0, 0, {zone: 'America/New_York'})
    let endDate = DateTime.local(2026, 1, 1, 16, 0, 0, 0, {zone: 'America/New_York'});
    for (; startDate.toSeconds() < endDate.toSeconds(); startDate = startDate.plus({day: 1})) {
        if (startDate.toSeconds() in holidayMap) continue
        if (startDate.weekday === 6 || startDate.weekday === 7) continue
        tradingDayMap[startDate.toSeconds()] = {}
    }

    return tradingDayMap
}

const getTimeAndPriceMap = async (client: IDatabase<any>, pgp: IMain, securityId: number): Promise<Record<string, string>> => {
    const query = `SELECT time, price
                   FROM security_price
                   WHERE security_id = $1 AND time < NOW() - INTERVAL '8 DAYS'
                   ORDER BY time`;
    const res = await client.query(query, [securityId]);

    let pp: Record<string, string> = {};
    res.forEach((r: any) => {
        const dt = DateTime.fromJSDate(r.time)
        pp[dt.toSeconds()] = r.price
    });

    return pp;
}

const getClosestPrice = (timeInSeconds: number, priceMap: Record<string, string>): string | null => {
    const keys = Object.keys(priceMap)
    for (let i = 0; i < keys.length; i++) {
        const key = parseInt(keys[i]);
        if (timeInSeconds > key) return i - 1 >= 0 ? priceMap[keys[i - 1]] : priceMap[keys[i]];
    }
    return null
}

const insertPrices = async (client: IDatabase<any>, pgp: IMain, prices: { security_id: number, time: DateTime, price: string }[]) => {
    const cs = new pgp.helpers.ColumnSet([
        {name: 'security_id', prop: 'security_id'},
        {name: 'time', prop: 'time'},
        {name: 'price', prop: 'price'}
    ], {table: 'security_price'});
    const query = pgp.helpers.insert(prices, cs) + ` ON CONFLICT DO NOTHING;`
    await client.none(query)
}

// (async () => {
//     const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
//     const pgp = pgPromise({});
//     const pgClient = pgp({
//         host: pgCfg.host,
//         user: pgCfg.user,
//         password: pgCfg.password,
//         database: pgCfg.database
//     })
//     await pgClient.connect()
//
//     const finCfg = await DefaultConfig.fromCacheOrSSM('finicity');
//
//     const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
//     const iex = new IEX(iexConfiguration.key);
//     const finicity = new Finicity(finCfg.partnerId, finCfg.partnerSecret, finCfg.appKey);
//     await finicity.init();
//     const brokerage = new Brokerage(pgClient, pgp, finicity);
//     console.log("Starting")
//     await brokerage.removeAccounts('6007115349', ['6011899109'], 'finicity');
//     console.log("Removing")
//     const securities = await repository.getUSExchangeListedSecurities();
//     const securitiesMap: Record<string, getSecurityBySymbol> = {};
//     securities.forEach(sec => securitiesMap[sec.symbol] = sec);
//     const groupSecurities = buildGroups(securities, 100);
//
//     let latestSecurityPrices: Record<string, number> = {};
//     securities.forEach(sec => latestSecurityPrices[sec.symbol] = 0); //sec.latestPrice);
//
//     const dates = ["20220808", "20220809", "20220810", "20220811", "20220812"];
//     for (let i = 0; i < groupSecurities.length; i++) {
//         console.log(`Processing ${i + 1}/${groupSecurities.length}`)
//         const securityGroup = groupSecurities[i];
//         const symbols = securityGroup.map(sec => sec.symbol);
//         for (let dateIdx = 0; dateIdx < dates.length; dateIdx++) {
//             const date = dates[dateIdx];
//             console.log(`\t\tProcessing Day: ${date}`)
//             let response: Record<string, any>;
//
//             try {
//                 response = await iex.bulk(symbols, ["chart"], {
//                     chartIEXOnly: true,
//                     chartIEXWhenNull: true,
//                     exactDate: date,
//                 });
//             } catch (e) {
//                 console.error(e)
//                 continue
//             }
//
//             let securityPrices: addSecurityPrice[] = [];
//             securityGroup.forEach(sec => {
//                 const {symbol, id} = sec;
//                 if (response[symbol] === undefined || response[symbol] === null) {
//                     console.error(`could not find symbol ${symbol}`)
//                     return
//                 }
//
//                 const intradayPrices = (response[symbol]['chart']) as GetIntraDayPrices[]
//
//                 let latestPrice = latestSecurityPrices[symbol];
//                 intradayPrices.forEach(ip => {
//                     const dt = DateTime.fromFormat(`${ip.date} ${ip.minute}`, "yyyy-LL-dd HH:mm", {
//                         zone: "America/New_York"
//                     }).set({second: 0, millisecond: 0});
//
//                     let close = ip.close,
//                         open = ip.open,
//                         high = ip.high,
//                         low = ip.low;
//                     if (close !== null) latestPrice = close
//                     else {
//                         close = latestPrice;
//                         open = latestPrice;
//                         high = latestPrice;
//                         low = latestPrice;
//                     }
//
//                     if (close === null) return;
//                     if (open === null) open = close
//                     if (high === null) high = close
//                     if (low === null) low = close
//
//
//                     latestSecurityPrices[symbol] = close
//
//                     securityPrices.push({
//                         price: close,
//                         low: low,
//                         high: high,
//                         open: open,
//                         time: dt.toJSDate(),
//                         securityId: id,
//                         isEod: false,
//                         isIntraday: true
//                     });
//                 })
//             });
//
//             const newSecPrices = securityPrices.filter(sec => {
//                 return sec.price !== null;
//
//             })
//             if (newSecPrices.length <= 0) continue
//             await repository.upsertSecuritiesPrices(newSecPrices);
//         }
//     }
//
//
//     const tradingMap = await getTradingMap(pgClient);
//     const tradingTimes = Object.keys(tradingMap);
//
//     const securities = await getSecurities(pgClient);
//
//     let cnt = 1;
//     for (const security of securities) {
//         console.log(`Processed ${cnt}/${securities.length}`)
//         cnt++
//         const timeAndPriceMap = await getTimeAndPriceMap(pgClient, security.id)
//         const timesHave = Object.keys(timeAndPriceMap);
//         if (timesHave.length < 1) continue
//
//         // get start Time and end time for current trading
//         const oldestTradingTime = timesHave[0];
//         const newestTradingTime = timesHave[timesHave.length - 1];
//
//         let constrainedTimes = tradingTimes.filter(x => x >= oldestTradingTime && x <= newestTradingTime)
//         const missingTradingTimes = constrainedTimes.filter(x => !timesHave.includes(x))
//         let missingTimesInsert: { security_id: number, time: DateTime, price: string }[] = [];
//         missingTradingTimes.forEach(t => {
//             const tInt = parseInt(t)
//             let dt = DateTime.fromSeconds(tInt)
//             dt = dt.setZone('America/New_York')
//             const price = getClosestPrice(tInt, timeAndPriceMap)
//             if (!price) {
//                 console.error(`Could not find price for security(${security.symbol}. For time: ${dt.toISO()}`)
//                 return
//             }
//
//             missingTimesInsert.push({security_id: security.id, time: dt, price: price})
//         });
//
//         console.log(`Total: ${missingTimesInsert.length}\n`)
//         await insertPrices(pgClient, missingTimesInsert)
//     }
// })()