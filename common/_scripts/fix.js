"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../configuration");
const repository_1 = __importDefault(require("../market-data/repository"));
const luxon_1 = require("luxon");
const pg_1 = __importDefault(require("pg"));
const pg_promise_1 = __importDefault(require("pg-promise"));
const utils_1 = require("../../lambdas/market-data/utils");
const index_1 = __importDefault(require("../iex/index"));
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, (value) => {
    return parseInt(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT8, (value) => {
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
const errorDoSingluar = (repository, iex, securityGroup) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < securityGroup.length; i++) {
        const symbol = securityGroup[i].symbol;
        try {
            const response = yield iex.bulk([symbol], ["intraday-prices"], {
                chartIEXOnly: true,
                chartIEXWhenNull: true
            });
            let securityPrices = [];
            if (response[symbol] === undefined || response[symbol] === null) {
                console.error(`could not find symbol ${symbol}`);
                continue;
            }
            const intradayPrices = (response[symbol]['intraday-prices']);
            let lastClose = getFirstValue(intradayPrices, 'close');
            let lastLow = getFirstValue(intradayPrices, 'low');
            let lastHigh = getFirstValue(intradayPrices, 'high');
            let lastOpen = getFirstValue(intradayPrices, 'open');
            if (lastClose === null)
                return;
            if (lastLow === null)
                lastLow = lastClose;
            if (lastHigh === null)
                lastHigh = lastClose;
            if (lastOpen === null)
                lastOpen = lastClose;
            intradayPrices.forEach(ip => {
                const dt = luxon_1.DateTime.fromFormat("2022-07-22 13:30", "yyyy-LL-dd HH:mm", {
                    zone: "America/New_York"
                });
                let close = ip.close;
                if (close !== null)
                    lastClose = close;
                if (close === null)
                    close = lastClose;
                let low = ip.low;
                if (low !== null)
                    lastLow = low;
                if (low === null)
                    low = lastLow;
                let high = ip.high;
                if (high !== null)
                    lastHigh = high;
                if (high === null)
                    high = lastHigh;
                let open = ip.open;
                if (open !== null)
                    lastOpen = open;
                if (open === null)
                    open = lastOpen;
                securityPrices.push({
                    price: close,
                    low: low,
                    high: high,
                    open: open,
                    time: dt.toJSDate(),
                    securityId: securityGroup[i].id
                });
            });
            if (securityPrices.length <= 0)
                continue;
            yield repository.addSecuritiesPrices(securityPrices);
        }
        catch (e) {
            console.error(e, symbol);
        }
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    yield pgClient.connect();
    const iexConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("iex");
    const iex = new index_1.default(iexConfiguration.key);
    const repository = new repository_1.default(pgClient, pgp);
    console.log("Starting...");
    const securities = yield repository.getUSExchangeListedSecurities();
    const securitiesMap = {};
    securities.forEach(sec => securitiesMap[sec.symbol] = sec);
    const groupSecurities = (0, utils_1.buildGroups)(securities);
    for (let i = 0; i < groupSecurities.length; i++) {
        console.log(`Processing ${i + 1}/${groupSecurities.length}`);
        const securityGroup = groupSecurities[i];
        const symbols = securityGroup.map(sec => sec.symbol);
        let response;
        try {
            response = yield iex.bulk(symbols, ["intraday-prices"], {
                chartIEXOnly: true,
                chartIEXWhenNull: true
            });
        }
        catch (e) {
            yield errorDoSingluar(repository, iex, securityGroup);
            continue;
        }
        let securityPrices = [];
        securityGroup.forEach(sec => {
            const { symbol, id } = sec;
            if (response[symbol] === undefined || response[symbol] === null) {
                console.error(`could not find symbol ${symbol}`);
                return;
            }
            const intradayPrices = (response[symbol]['intraday-prices']);
            let lastClose = getFirstValue(intradayPrices, 'close');
            let lastLow = getFirstValue(intradayPrices, 'low');
            let lastHigh = getFirstValue(intradayPrices, 'high');
            let lastOpen = getFirstValue(intradayPrices, 'open');
            if (lastClose === null)
                return;
            if (lastLow === null)
                lastLow = lastClose;
            if (lastHigh === null)
                lastHigh = lastClose;
            if (lastOpen === null)
                lastOpen = lastClose;
            intradayPrices.forEach(ip => {
                const dt = luxon_1.DateTime.fromFormat("2022-07-22 13:30", "yyyy-LL-dd HH:mm", {
                    zone: "America/New_York"
                });
                let close = ip.close;
                if (close !== null)
                    lastClose = close;
                if (close === null)
                    close = lastClose;
                let low = ip.low;
                if (low !== null)
                    lastLow = low;
                if (low === null)
                    low = lastLow;
                let high = ip.high;
                if (high !== null)
                    lastHigh = high;
                if (high === null)
                    high = lastHigh;
                let open = ip.open;
                if (open !== null)
                    lastOpen = open;
                if (open === null)
                    open = lastOpen;
                securityPrices.push({
                    price: close,
                    low: low,
                    high: high,
                    open: open,
                    time: dt.toJSDate(),
                    securityId: id
                });
            });
        });
        if (securityPrices.length <= 0)
            continue;
        yield repository.addSecuritiesPrices(securityPrices);
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
}))();
const getFirstValue = (values, tag) => {
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value[tag])
            return value[tag];
    }
    return null;
};
// Fill in history with High/Low/Open/
// Fill in intra-day with High/Low/Open
// Fill in any missing days for those prices
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQStDO0FBQy9DLDJFQUFtRDtBQUNuRCxpQ0FBK0I7QUFDL0IsNENBQW9CO0FBQ3BCLDREQUFrQztBQUNsQywyREFBMkQ7QUFFM0QseURBQW9EO0FBRXBELFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQzdELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDL0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxrREFBa0Q7QUFDbEQsMkRBQTJEO0FBQzNELDJDQUEyQztBQUMzQyxFQUFFO0FBQ0Ysb0RBQW9EO0FBQ3BELHVDQUF1QztBQUN2QyxtREFBbUQ7QUFDbkQsbUVBQW1FO0FBQ25FLDBDQUEwQztBQUMxQyxVQUFVO0FBQ1YsRUFBRTtBQUNGLGtEQUFrRDtBQUNsRCwwRkFBMEY7QUFDMUYseUZBQXlGO0FBQ3pGLGtHQUFrRztBQUNsRyw0REFBNEQ7QUFDNUQsMkVBQTJFO0FBQzNFLG9EQUFvRDtBQUNwRCxRQUFRO0FBQ1IsRUFBRTtBQUNGLDJCQUEyQjtBQUMzQixJQUFJO0FBQ0osRUFBRTtBQUNGLDRHQUE0RztBQUM1Ryx1REFBdUQ7QUFDdkQsbUNBQW1DO0FBQ25DLDRDQUE0QztBQUM1Qyx3REFBd0Q7QUFDeEQsMkJBQTJCO0FBQzNCLEVBQUU7QUFDRiwyQ0FBMkM7QUFDM0MsdUNBQXVDO0FBQ3ZDLG1EQUFt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