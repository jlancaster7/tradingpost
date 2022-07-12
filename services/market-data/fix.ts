import {DefaultConfig} from "@tradingpost/common/configuration/index";
import {DateTime} from 'luxon';
import knex, {Knex} from 'knex'
import pg from "pg";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

const getTradingMap = async (client: Knex) => {
    const response = await client('us_exchange_holidays')
        .orderBy('date').select('date');

    let holidayMap: Record<string, unknown> = {};
    response.forEach(row => {
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

const getSecurities = async (client: Knex): Promise<{ id: number; symbol: string }[]> => {
    const response = await client('securities').select('id', 'symbol');

    return response.map(row => {
        return {id: row.id, symbol: row.symbol}
    }) as { id: number, symbol: string }[];
}

const getTimeAndPriceMap = async (client: Knex, securityId: number): Promise<Record<string, string>> => {
    const response = await client('security_prices')
        .select('time', 'price')
        .where({security_id: securityId})
        .whereRaw(`time < NOW() - INTERVAL '8 DAYS'`)
        .orderBy('time')

    let pp: Record<string, string> = {};
    response.forEach(row => {
        const dt = DateTime.fromJSDate(row.time)
        pp[dt.toSeconds()] = row.price
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

const insertPrices = async (client: Knex, prices: { security_id: number, time: DateTime, price: string }[]) => {
    await client.batchInsert('security_prices', prices);
}

(async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgClient = knex({
        client: 'pg',
        connection: {
            host: postgresConfiguration.host,
            port: postgresConfiguration.port,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        }
    });

    const tradingMap = await getTradingMap(pgClient);
    const tradingTimes = Object.keys(tradingMap);

    const securities = await getSecurities(pgClient);

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
        let missingTimesInsert: { security_id: number, time: DateTime, price: string }[] = [];
        missingTradingTimes.forEach(t => {
            const tInt = parseInt(t)
            let dt = DateTime.fromSeconds(tInt)
            dt = dt.setZone('America/New_York')
            const price = getClosestPrice(tInt, timeAndPriceMap)
            if (!price) {
                console.error(`Could not find price for security(${security.symbol}. For time: ${dt.toISO()}`)
                return
            }

            missingTimesInsert.push({security_id: security.id, time: dt, price: price})
        });

        console.log(`Total: ${missingTimesInsert.length}\n`)
        await insertPrices(pgClient, missingTimesInsert)
    }
})()