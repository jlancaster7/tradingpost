import {Context} from 'aws-lambda';
import IEX, {GetExchanges, GetUsExchanges, GetUSHolidayAndTradingDays} from '@tradingpost/common/iex';
import {DateTime} from 'luxon';
import {Repository} from "../../services/market-data/repository";
import {addUSHoliday, addExchange} from '../../services/market-data/interfaces';
import {Client} from 'pg';
import {Configuration} from "@tradingpost/common/configuration";

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);

// Pricing Cost 1 / year = 1 credit
module.exports.run = async (event: any, context: Context) => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const iexConfiguration = await configuration.fromSSM("/production/iex");
    const iex = new IEX(iexConfiguration['key'] as string);
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    });

    const repository = new Repository(pgClient);

    const usExchanges = await iex.getUsExchanges();
    const internationalExchanges = await iex.getInternationalExchanges();

    let exchanges: addExchange[] = [];
    usExchanges.forEach((exchange: GetUsExchanges) => {
        exchanges.push({
            longName: exchange.longName,
            mic: exchange.mic,
            name: exchange.name,
            oatsId: exchange.oatsId,
            refId: exchange.refId,
            tapeId: exchange.tapeId,
            type: exchange.type
        });
    });

    internationalExchanges.forEach((exchange: GetExchanges) => {
        exchanges.push({
            description: exchange.description,
            exchangeSuffix: exchange.exchangeSuffix,
            longName: exchange.description,
            mic: exchange.mic,
            name: exchange.exchange,
            region: exchange.region,
            segment: exchange.segment,
            segmentDescription: exchange.segmentDescription,
            suffix: exchange.suffix
        });
    });

    await repository.addExchanges(exchanges);
    const nextIexHolidays = await iex.getUSHolidayAndTradingDays("holiday", "next");
    const lastIexHolidays = await iex.getUSHolidayAndTradingDays("holiday", "last");
    let holidays: addUSHoliday[] = [];
    const holidayFunc = (h: GetUSHolidayAndTradingDays) => {
        const isoDate = DateTime.fromISO(h.date);
        const settlementDate = h.settlementDate == null ? null : DateTime.fromISO(h.settlementDate).toJSDate();
        holidays.push({date: isoDate.toJSDate(), settlementDate: settlementDate})
    }
    nextIexHolidays.forEach(holidayFunc);
    lastIexHolidays.forEach(holidayFunc);
    await repository.addUsExchangeHolidays(holidays);
};
