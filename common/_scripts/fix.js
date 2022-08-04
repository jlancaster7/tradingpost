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
;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQStDO0FBQy9DLDJFQUFtRDtBQUNuRCxpQ0FBK0I7QUFDL0IsNENBQW9CO0FBQ3BCLDREQUFrQztBQUNsQywyREFBMkQ7QUFFM0QseURBQW9EO0FBRXBELENBQUM7QUFFRCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUM3RCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQy9ELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsa0RBQWtEO0FBQ2xELDJEQUEyRDtBQUMzRCwyQ0FBMkM7QUFDM0MsRUFBRTtBQUNGLG9EQUFvRDtBQUNwRCx1Q0FBdUM7QUFDdkMsbURBQW1EO0FBQ25ELG1FQUFtRTtBQUNuRSwwQ0FBMEM7QUFDMUMsVUFBVTtBQUNWLEVBQUU7QUFDRixrREFBa0Q7QUFDbEQsMEZBQTBGO0FBQzFGLHlGQUF5RjtBQUN6RixrR0FBa0c7QUFDbEcsNERBQTREO0FBQzVELDJFQUEyRTtBQUMzRSxvREFBb0Q7QUFDcEQsUUFBUTtBQUNSLEVBQUU7QUFDRiwyQkFBMkI7QUFDM0IsSUFBSTtBQUNKLEVBQUU7QUFDRiw0R0FBNEc7QUFDNUcsdURBQXVEO0FBQ3ZELG1DQUFtQztBQUNuQyw0Q0FBNEM7QUFDNUMsd0RBQXdEO0FBQ3hELDJCQUEyQjtBQUMzQixFQUFFO0FBQ0YsMkNBQTJDO0FBQzNDLHVDQUF1QztBQUN2QyxtREFBbUQ7QUFDbkQseUNBQXlDO0FBQ3pDLFVBQVU7QUFDVixFQUFFO0FBQ0YsaUJBQWlCO0FBQ2pCLElBQUk7QUFFSix3R0FBd0c7QUFDeEcseUNBQXlDO0FBQ3pDLDhDQUE4QztBQUM5Qyx5Q0FBeUM7QUFDekMsa0dBQWtHO0FBQ2xHLFFBQVE7QUFDUixrQkFBa0I7QUFDbEIsSUFBSTtBQUNKLEVBQUU7QUFDRixtSEFBbUg7QUFDbkgsMkRBQTJEO0FBQzNELElBQUk7QUFFSixNQUFNLGVBQWUsR0FBRyxDQUFPLFVBQXNCLEVBQUUsR0FBUSxFQUFFLGFBQW9DLEVBQUUsRUFBRTtJQUNyRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMzQyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3ZDLElBQUk7WUFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQzNELFlBQVksRUFBRSxJQUFJO2dCQUNsQixnQkFBZ0IsRUFBRSxJQUFJO2FBQ3pCLENBQUMsQ0FBQztZQUVILElBQUksY0FBYyxHQUF1QixFQUFFLENBQUM7WUFDNUMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzdELE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLE1BQU0sRUFBRSxDQUFDLENBQUE7Z0JBQ2hELFNBQVE7YUFDWDtZQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQXdCLENBQUE7WUFDbkYsSUFBSSxTQUFTLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2RCxJQUFJLE9BQU8sR0FBRyxhQUFhLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25ELElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckQsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVyRCxJQUFJLFNBQVMsS0FBSyxJQUFJO2dCQUFFLE9BQU07WUFDOUIsSUFBSSxPQUFPLEtBQUssSUFBSTtnQkFBRSxPQUFPLEdBQUcsU0FBUyxDQUFBO1lBQ3pDLElBQUksUUFBUSxLQUFLLElBQUk7Z0JBQUUsUUFBUSxHQUFHLFNBQVMsQ0FBQTtZQUMzQyxJQUFJLFFBQVEsS0FBSyxJQUFJO2dCQUFFLFFBQVEsR0FBRyxTQUFTLENBQUE7WUFFM0MsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxFQUFFLEdBQUcsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUU7b0JBQ25FLElBQUksRUFBRSxrQkFBa0I7aUJBQzNCLENBQUMsQ0FBQztnQkFFSCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUNyQixJQUFJLEtBQUssS0FBSyxJQUFJO29CQUFFLFNBQVMsR0FBRyxLQUFLLENBQUE7Z0JBQ3JDLElBQUksS0FBSyxLQUFLLElBQUk7b0JBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQTtnQkFFckMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDakIsSUFBSSxHQUFHLEtBQUssSUFBSTtvQkFBRSxPQUFPLEdBQUcsR0FBRyxDQUFDO2dCQUNoQyxJQUFJLEdBQUcsS0FBSyxJQUFJO29CQUFFLEdBQUcsR0FBRyxPQUFPLENBQUM7Z0JBRWhDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLElBQUksSUFBSSxLQUFLLElBQUk7b0JBQUUsUUFBUSxHQUFHLElBQUksQ0FBQTtnQkFDbEMsSUFBSSxJQUFJLEtBQUssSUFBSTtvQkFBRSxJQUFJLEdBQUcsUUFBUSxDQUFBO2dCQUVsQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO2dCQUNuQixJQUFJLElBQUksS0FBSyxJQUFJO29CQUFFLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ25DLElBQUksSUFBSSxLQUFLLElBQUk7b0JBQUUsSUFBSSxHQUFHLFFBQVEsQ0FBQTtnQkFFbEMsY0FBYyxDQUFDLElBQUksQ0FBQztvQkFDaEIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osR0FBRyxFQUFFLEdBQUc7b0JBQ1IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQ25CLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtpQkFDbEMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUE7WUFDRixJQUFJLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFBRSxTQUFRO1lBQ3hDLE1BQU0sVUFBVSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ3hEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQTtTQUMzQjtLQUNKO0FBQ0wsQ0FBQyxDQUFBLENBQUE7QUFFRCxDQUFDLEdBQVMsRUFBRTtJQUNSLE1BQU0sS0FBSyxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0QsTUFBTSxHQUFHLEdBQUcsSUFBQSxvQkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUNqQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7UUFDaEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO1FBQ2hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtRQUN4QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7S0FDM0IsQ0FBQyxDQUFBO0lBQ0YsTUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7SUFFeEIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25FLE1BQU0sR0FBRyxHQUFHLElBQUksZUFBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRTFDLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMxQixNQUFNLFVBQVUsR0FBRyxNQUFNLFVBQVUsQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ3BFLE1BQU0sYUFBYSxHQUF3QyxFQUFFLENBQUM7SUFDOUQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFFM0QsTUFBTSxlQUFlLEdBQUcsSUFBQSxtQkFBVyxFQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQzVELE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELElBQUksUUFBNkIsQ0FBQztRQUVsQyxJQUFJO1lBQ0EsUUFBUSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNwRCxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsZ0JBQWdCLEVBQUUsSUFBSTthQUN6QixDQUFDLENBQUM7U0FDTjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsTUFBTSxlQUFlLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQTtZQUNyRCxTQUFRO1NBQ1g7UUFFRCxJQUFJLGNBQWMsR0FBdUIsRUFBRSxDQUFDO1FBQzVDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEIsTUFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUMsR0FBRyxHQUFHLENBQUM7WUFDekIsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzdELE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLE1BQU0sRUFBRSxDQUFDLENBQUE7Z0JBQ2hELE9BQU07YUFDVDtZQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQXdCLENBQUE7WUFDbkYsSUFBSSxTQUFTLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2RCxJQUFJLE9BQU8sR0FBRyxhQUFhLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25ELElBQUksUUFBUSxHQUFHLGFBQWEsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckQsSUFBSSxRQUFRLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVyRCxJQUFJLFNBQVMsS0FBSyxJQUFJO2dCQUFFLE9BQU07WUFDOUIsSUFBSSxPQUFPLEtBQUssSUFBSTtnQkFBRSxPQUFPLEdBQUcsU0FBUyxDQUFBO1lBQ3pDLElBQUksUUFBUSxLQUFLLElBQUk7Z0JBQUUsUUFBUSxHQUFHLFNBQVMsQ0FBQTtZQUMzQyxJQUFJLFFBQVEsS0FBSyxJQUFJO2dCQUFFLFFBQVEsR0FBRyxTQUFTLENBQUE7WUFFM0MsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxFQUFFLEdBQUcsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUU7b0JBQ25FLElBQUksRUFBRSxrQkFBa0I7aUJBQzNCLENBQUMsQ0FBQztnQkFFSCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUNyQixJQUFJLEtBQUssS0FBSyxJQUFJO29CQUFFLFNBQVMsR0FBRyxLQUFLLENBQUE7Z0JBQ3JDLElBQUksS0FBSyxLQUFLLElBQUk7b0JBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQTtnQkFFckMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDakIsSUFBSSxHQUFHLEtBQUssSUFBSTtvQkFBRSxPQUFPLEdBQUcsR0FBRyxDQUFDO2dCQUNoQyxJQUFJLEdBQUcsS0FBSyxJQUFJO29CQUFFLEdBQUcsR0FBRyxPQUFPLENBQUM7Z0JBRWhDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLElBQUksSUFBSSxLQUFLLElBQUk7b0JBQUUsUUFBUSxHQUFHLElBQUksQ0FBQTtnQkFDbEMsSUFBSSxJQUFJLEtBQUssSUFBSTtvQkFBRSxJQUFJLEdBQUcsUUFBUSxDQUFBO2dCQUVsQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO2dCQUNuQixJQUFJLElBQUksS0FBSyxJQUFJO29CQUFFLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ25DLElBQUksSUFBSSxLQUFLLElBQUk7b0JBQUUsSUFBSSxHQUFHLFFBQVEsQ0FBQTtnQkFFbEMsY0FBYyxDQUFDLElBQUksQ0FBQztvQkFDaEIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osR0FBRyxFQUFFLEdBQUc7b0JBQ1IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLElBQUk7b0JBQ1YsSUFBSSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQ25CLFVBQVUsRUFBRSxFQUFFO2lCQUNqQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxjQUFjLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxTQUFRO1FBQ3hDLE1BQU0sVUFBVSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3hEO0lBR0Qsb0RBQW9EO0lBQ3BELGdEQUFnRDtJQUNoRCxFQUFFO0lBQ0Ysb0RBQW9EO0lBQ3BELEVBQUU7SUFDRixlQUFlO0lBQ2YsdUNBQXVDO0lBQ3ZDLDJEQUEyRDtJQUMzRCxZQUFZO0lBQ1osOEVBQThFO0lBQzlFLHNEQUFzRDtJQUN0RCx5Q0FBeUM7SUFDekMsRUFBRTtJQUNGLHlEQUF5RDtJQUN6RCw4Q0FBOEM7SUFDOUMsaUVBQWlFO0lBQ2pFLEVBQUU7SUFDRix3R0FBd0c7SUFDeEcsdUZBQXVGO0lBQ3ZGLDZGQUE2RjtJQUM3Rix5Q0FBeUM7SUFDekMsbUNBQW1DO0lBQ25DLDhDQUE4QztJQUM5Qyw4Q0FBOEM7SUFDOUMsK0RBQStEO0lBQy9ELHdCQUF3QjtJQUN4Qiw2R0FBNkc7SUFDN0cscUJBQXFCO0lBQ3JCLFlBQVk7SUFDWixFQUFFO0lBQ0Ysc0ZBQXNGO0lBQ3RGLFVBQVU7SUFDVixFQUFFO0lBQ0YsMkRBQTJEO0lBQzNELHVEQUF1RDtJQUN2RCxJQUFJO0FBQ1IsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBO0FBRUosTUFBTSxhQUFhLEdBQUcsQ0FBQyxNQUE2QixFQUFFLEdBQVcsRUFBYyxFQUFFO0lBQzdFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNwQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQTtBQUVELHNDQUFzQztBQUN0Qyx1Q0FBdUM7QUFDdkMsNENBQTRDIn0=