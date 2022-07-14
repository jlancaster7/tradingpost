import 'dotenv/config';
import {Context} from 'aws-lambda';
import IEX, {GetUSHolidayAndTradingDays} from '@tradingpost/common/iex';
import {DateTime} from 'luxon';
import {Repository} from "../../services/market-data/repository";
import {addUSHoliday} from '../../services/market-data/interfaces';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from 'pg-promise'

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration['host'] as string,
            user: postgresConfiguration['user'] as string,
            password: postgresConfiguration['password'] as string,
            database: postgresConfiguration['database'] as string
        })
    }

    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    await pgClient.connect()

    const repository = new Repository(pgClient, pgp);
    try {
        await start(repository, iex);
    } catch (e) {
        console.error(e)
        throw e
    } finally {
        await pgp.end()
    }
}

const start = async (repository: Repository, iex: IEX) => {
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