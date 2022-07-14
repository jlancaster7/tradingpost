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
const index_1 = require("@tradingpost/common/configuration/index");
const luxon_1 = require("luxon");
const knex_1 = __importDefault(require("knex"));
const pg_1 = __importDefault(require("pg"));
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, (value) => {
    return parseInt(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT8, (value) => {
    return parseFloat(value);
});
const getTradingMap = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield client('us_exchange_holidays')
        .orderBy('date').select('date');
    let holidayMap = {};
    response.forEach(row => {
        const dt = luxon_1.DateTime.fromJSDate(row.date);
        dt.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
        holidayMap[dt.toSeconds()] = {};
    });
    let tradingDayMap = {};
    let startDate = luxon_1.DateTime.local(2006, 1, 1, 16, 0, 0, 0, { zone: 'America/New_York' });
    let endDate = luxon_1.DateTime.local(2026, 1, 1, 16, 0, 0, 0, { zone: 'America/New_York' });
    for (; startDate.toSeconds() < endDate.toSeconds(); startDate = startDate.plus({ day: 1 })) {
        if (startDate.toSeconds() in holidayMap)
            continue;
        if (startDate.weekday === 6 || startDate.weekday === 7)
            continue;
        tradingDayMap[startDate.toSeconds()] = {};
    }
    return tradingDayMap;
});
const getSecurities = (client) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield client('securities').select('id', 'symbol');
    return response.map(row => {
        return { id: row.id, symbol: row.symbol };
    });
});
const getTimeAndPriceMap = (client, securityId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield client('security_prices')
        .select('time', 'price')
        .where({ security_id: securityId })
        .whereRaw(`time < NOW() - INTERVAL '8 DAYS'`)
        .orderBy('time');
    let pp = {};
    response.forEach(row => {
        const dt = luxon_1.DateTime.fromJSDate(row.time);
        pp[dt.toSeconds()] = row.price;
    });
    return pp;
});
const getClosestPrice = (timeInSeconds, priceMap) => {
    const keys = Object.keys(priceMap);
    for (let i = 0; i < keys.length; i++) {
        const key = parseInt(keys[i]);
        if (timeInSeconds > key)
            return i - 1 >= 0 ? priceMap[keys[i - 1]] : priceMap[keys[i]];
    }
    return null;
};
const insertPrices = (client, prices) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.batchInsert('security_prices', prices);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield index_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = (0, knex_1.default)({
        client: 'pg',
        connection: {
            host: postgresConfiguration.host,
            port: postgresConfiguration.port,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        }
    });
    const tradingMap = yield getTradingMap(pgClient);
    const tradingTimes = Object.keys(tradingMap);
    const securities = yield getSecurities(pgClient);
    let cnt = 1;
    for (const security of securities) {
        console.log(`Processed ${cnt}/${securities.length}`);
        cnt++;
        const timeAndPriceMap = yield getTimeAndPriceMap(pgClient, security.id);
        const timesHave = Object.keys(timeAndPriceMap);
        if (timesHave.length < 1)
            continue;
        // get start Time and end time for current trading
        const oldestTradingTime = timesHave[0];
        const newestTradingTime = timesHave[timesHave.length - 1];
        let constrainedTimes = tradingTimes.filter(x => x >= oldestTradingTime && x <= newestTradingTime);
        const missingTradingTimes = constrainedTimes.filter(x => !timesHave.includes(x));
        let missingTimesInsert = [];
        missingTradingTimes.forEach(t => {
            const tInt = parseInt(t);
            let dt = luxon_1.DateTime.fromSeconds(tInt);
            dt = dt.setZone('America/New_York');
            const price = getClosestPrice(tInt, timeAndPriceMap);
            if (!price) {
                console.error(`Could not find price for security(${security.symbol}. For time: ${dt.toISO()}`);
                return;
            }
            missingTimesInsert.push({ security_id: security.id, time: dt, price: price });
        });
        console.log(`Total: ${missingTimesInsert.length}\n`);
        yield insertPrices(pgClient, missingTimesInsert);
    }
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZml4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUVBQXNFO0FBQ3RFLGlDQUErQjtBQUMvQixnREFBK0I7QUFDL0IsNENBQW9CO0FBRXBCLFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQzdELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDL0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLGFBQWEsR0FBRyxDQUFPLE1BQVksRUFBRSxFQUFFO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLHNCQUFzQixDQUFDO1NBQ2hELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFcEMsSUFBSSxVQUFVLEdBQTRCLEVBQUUsQ0FBQztJQUM3QyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ25CLE1BQU0sRUFBRSxHQUFHLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4QyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUE7UUFDeEQsVUFBVSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUs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