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
    response.forEach((row) => {
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
    return response.map((row) => {
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
    response.forEach((row) => {
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
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
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
