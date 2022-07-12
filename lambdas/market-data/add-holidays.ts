import 'dotenv/config';
import {Context} from 'aws-lambda';
import IEX, {GetUSHolidayAndTradingDays} from '@tradingpost/common/iex';
import {DateTime} from 'luxon';
import {Repository} from "../../services/market-data/repository";
import {addUSHoliday} from '../../services/market-data/interfaces';
import {Client} from 'pg';
import {DefaultConfig} from "@tradingpost/common/configuration";

const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);
    const pgClient = new Client({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    await pgClient.connect()
    const repository = new Repository(pgClient);
    await start(pgClient, repository, iex);
    await pgClient.end();
}

const start = async (pgClient: Client, repository: Repository, iex: IEX) => {
    const nextIexHolidays = await iex.getUSHolidayAndTradingDays("holiday", "next", 100000);
    const lastIexHolidays = await iex.getUSHolidayAndTradingDays("holiday", "last", 100000);

    let holidays: addUSHoliday[] = [];
    const holidayFunc = (h: GetUSHolidayAndTradingDays) => {
        const isoDate = DateTime.fromISO(h.date);
        const settlementDate = h.settlementDate == null ? null : DateTime.fromISO(h.settlementDate);
        holidays.push({date: isoDate.toJSDate(), settlementDate: settlementDate?.toJSDate() || null})
    }

    nextIexHolidays.forEach(holidayFunc);
    lastIexHolidays.forEach(holidayFunc);
    try {
        await repository.addUsExchangeHolidays(holidays);
    } catch (e) {
        console.error(e)
    }
}

// Pricing Cost 1 / year = 1 credit
module.exports.run = async (event: any, context: Context) => {
    await run();
}