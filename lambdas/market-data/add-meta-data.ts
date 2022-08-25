import 'dotenv/config';
import IEX, {
    GetCompany,
    GetLogo,
    GetPreviousDayPrice,
    GetQuote,
    GetStatsBasic,
    GetIexSymbols,
    GetOtcSymbols
} from "@tradingpost/common/iex";
import Repository from "@tradingpost/common/market-data/repository";
import {
    addIexSecurity,
    addSecurity,
    updateIexSecurity,
    upsertSecuritiesInformation
} from '@tradingpost/common/market-data/interfaces';
import {DateTime} from "luxon";
import {DefaultConfig} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {diff} from "deep-object-diff";
import {buildGroups} from "./utils";
import pg from "pg";

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

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })
        await pgClient.connect();
    }

    const iexConfiguration = await DefaultConfig.fromSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    const repository = new Repository(pgClient, pgp);

    try {
        await start(repository, iex)
    } catch (e) {
        console.error(e)
        throw e
    }
}

const start = async (repository: Repository, iex: IEX) => {
    const now = DateTime.now().setZone("America/New_York");
    if (now.hour == 16) await ingestEveningSecuritiesInformation(repository, iex);

    if (now.hour == 8) {
        if (now.weekday === 5) {
            await updateSecurities(repository, iex);
            return
        }

        await ingestMorningSecuritiesInformation(repository, iex);
    }
}

const updateSecurities = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getIexSecurities();
    const securitiesMap = buildSecuritiesMap(securities);
    const securityGroups = buildGroups(securities, 100);

    const updateSymbols: string[] = [];

    for (let i = 0; i < securityGroups.length; i++) {
        const securities = securityGroups[i];
        const symbols = securities.map(sec => sec.symbol);
        const iexResponse = await iex.bulk(symbols, ["company", "logo"]);

        const newSecurities: addSecurity[] = [];
        const newIexSecurities: addIexSecurity[] = [];
        const updateIexSecurities: updateIexSecurity[] = [];

        symbols.forEach((symbol: string) => {
            const sec = iexResponse[symbol];
            if (sec === undefined || sec === null) return;

            const logo = sec.logo as GetLogo
            const company = sec.company as GetCompany

            const newSec: addSecurity = {
                address: company.address || null,
                address2: company.address2 || null,
                ceo: company.CEO || null,
                companyName: company.companyName,
                country: company.country || null,
                description: company.description || null,
                employees: company.employees !== null ? company.employees.toString() : null,
                exchange: company.exchange || null,
                industry: company.industry || null,
                issueType: company.issueType || null,
                logoUrl: logo.url || null,
                phone: company.phone || null,
                primarySicCode: company.primarySicCode !== null ? company.primarySicCode.toString() : null,
                sector: company.sector || null,
                securityName: company.securityName || null,
                state: company.state || null,
                symbol: company.symbol,
                tags: company.tags || null,
                website: company.website || null,
                zip: company.zip || null
            }

            const newIexSecurity: addIexSecurity = {
                ...newSec,
                validated: false
            }

            // Couldn't find anything, lets insert it!
            const curSec = securitiesMap[symbol];
            if (curSec === undefined || curSec === null) {
                newSecurities.push(newSec);
                newIexSecurities.push(newIexSecurity);
                updateSymbols.push(symbol)
                return
            }

            newIexSecurity.validated = true
            curSec.validated = true;

            // Compare Objects...
            if (Object.keys(diff(curSec, newIexSecurity)).length === 0) return;

            newIexSecurity.validated = false
            updateIexSecurities.push(newIexSecurity)
            updateSymbols.push(newIexSecurity.symbol)
        })

        await repository.addIexSecurities(newIexSecurities)
        await repository.addSecurities(newSecurities)
        await repository.updateIexSecurities(updateIexSecurities)
    }

    // TODO: Publish message to Teams
    console.log(`${updateSymbols.length} New/Updated Securities. Security Symbols List: ${updateSymbols.join(",")}`)
}

const ingestEveningSecuritiesInformation = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getSecurities();
    const securitiesMap = buildSecuritiesMap(securities);
    const securityGroups = buildGroups(securities, 100);
    for (let i = 0; i < securityGroups.length; i++) {
        const securities = securityGroups[i];
        const symbols = securities.map(sec => sec.symbol);
        const iexResponse = await iex.bulk(symbols, ["previous", "stats", "quote"]);

        const securitiesInformation: upsertSecuritiesInformation[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (iexResponse[symbol] === undefined || iexResponse === null) continue;

            const existingSecurity = securitiesMap[symbol];
            if (existingSecurity === undefined || existingSecurity === null) continue;

            const quote = (iexResponse[symbol].quote as GetQuote);
            const stats = (iexResponse[symbol].stats as GetStatsBasic);
            const previous = (iexResponse[symbol].previous as GetPreviousDayPrice) || {};

            securitiesInformation.push({
                avg10Volume: stats.avg10Volume,
                avg30Volume: stats.avg30Volume,
                avgTotalVolume: quote.avgTotalVolume,
                beta: stats.beta,
                calculationPrice: quote.calculationPrice,
                change: quote.change,
                changePercent: quote.changePercent,
                close: quote.close,
                currency: quote.currency,
                day200MovingAvg: stats.day200MovingAvg,
                day30ChangePercent: stats.day30ChangePercent,
                day50MovingAvg: stats.day50MovingAvg,
                day5ChangePercent: stats.day5ChangePercent,
                delayedPrice: quote.delayedPrice,
                delayedPriceTime: quote.delayedPriceTime,
                dividendYield: stats.dividendYield,
                employees: stats.employees,
                exDividendDate: stats.exDividendDate,
                extendedChange: quote.extendedChange,
                extendedChangePercent: quote.extendedChangePercent,
                extendedPrice: quote.extendedPrice,
                extendedPriceTime: quote.extendedPriceTime,
                float: stats.float,
                fullyAdjustedClose: previous.fClose || null,
                fullyAdjustedLow: previous.fLow || null,
                fullyAdjustedOpen: previous.fOpen || null,
                fullyAdjustedVolume: previous.fVolume || null,
                high: quote.high,
                label: previous.label || null,
                lastTradeTime: quote.lastTradeTime,
                low: quote.low,
                marketCap: quote.marketCap,
                marketChangeOverTime: previous.marketChangeOverTime || null,
                maxChangePercent: stats.maxChangePercent,
                month1ChangePercent: stats.month1ChangePercent,
                month3ChangePercent: stats.month3ChangePercent,
                month6ChangePercent: stats.month6ChangePercent,
                nextDividendDate: stats.nextDividendDate,
                nextEarningsDate: stats.nextEarningsDate,
                oddLotDelayedPrice: quote.oddLotDelayedPrice,
                oddLotDelayedPriceTime: quote.oddLotDelayedPriceTime,
                open: quote.open,
                peRatio: quote.peRatio,
                previousClose: quote.previousClose,
                previousVolume: quote.previousVolume,
                securityId: existingSecurity.id,
                sharesOutstanding: stats.sharesOutstanding,
                ttmDividendRate: stats.ttmDividendRate,
                ttmEps: stats.ttmEPS,
                unadjustedClose: previous.uClose || null,
                unadjustedLow: previous.uLow || null,
                unadjustedOpen: previous.uOpen || null,
                unadjustedVolume: previous.uVolume || null,
                volume: previous.volume || null,
                week52Change: stats.week52change,
                week52High: stats.week52high,
                week52HighSplitAdjustOnly: stats.week52highSplitAdjustOnly,
                week52Low: stats.week52low,
                week52LowSplitAdjustOnly: stats.week52lowSplitAdjustOnly,
                year1ChangePercent: stats.year1ChangePercent,
                year2ChangePercent: stats.year2ChangePercent,
                year5ChangePercent: stats.year5ChangePercent,
                ytdChange: quote.ytdChange,
                ytdChangePercent: stats.ytdChangePercent
            });
        }

        await repository.upsertSecuritiesInformation(securitiesInformation);
    }
}

const ingestMorningSecuritiesInformation = async (repository: Repository, iex: IEX) => {
    const currentSecurities = await repository.getIexSecurities();
    const currentSecuritiesMap = buildSecuritiesMap(currentSecurities);
    const possiblyNewSecurities = await iex.getIexSymbols();
    const possiblyNewOTCSymbols = await iex.getOtcSymbols();

    const newSymbols: string[] = [];
    possiblyNewSecurities.forEach((n: GetIexSymbols) => {
        const cs = currentSecuritiesMap[n.symbol]
        if (cs === undefined || cs === null) newSymbols.push(n.symbol)
    });

    possiblyNewOTCSymbols.forEach((n: GetOtcSymbols) => {
        const cs = currentSecuritiesMap[n.symbol]
        if (cs === undefined || cs === null) newSymbols.push(n.symbol)
    });

    // These are companies I need to ingest company info, logo, and as a new security
    const newSymbolsGroups = buildGroups(newSymbols);
    const newSymbolsCollection: string[] = [];
    for (let i = 0; i < newSymbolsGroups.length; i++) {
        const newSymbols = newSymbolsGroups[i];
        const response = await iex.bulk(newSymbols, ["company", "logo"]);
        const newSecurities: addSecurity[] = [];
        const newIexSecurities: addIexSecurity[] = [];

        newSymbols.forEach(symbol => {
            const res = response[symbol];
            if (res === undefined || res === null) return;

            const company = (res.company as GetCompany);
            const logo = (res.logo as GetLogo);

            if (company.companyName === null) return;

            const newSec: addSecurity = {
                address: company.address || null,
                address2: company.address2 || null,
                ceo: company.CEO || null,
                companyName: company.companyName,
                country: company.country || null,
                description: company.description || null,
                employees: company.employees !== null ? company.employees.toString() : null,
                exchange: company.exchange || null,
                industry: company.industry || null,
                issueType: company.issueType || null,
                logoUrl: logo.url || null,
                phone: company.phone || null,
                primarySicCode: company.primarySicCode !== null ? company.primarySicCode.toString() : null,
                sector: company.sector || null,
                securityName: company.securityName || null,
                state: company.state || null,
                symbol: company.symbol,
                tags: company.tags || null,
                website: company.website || null,
                zip: company.zip || null
            }
            const newIexSec: addIexSecurity = {...newSec, validated: false}

            newSecurities.push(newSec);
            newIexSecurities.push(newIexSec);
            newSymbolsCollection.push(newSec.symbol)
        });

        await repository.addSecurities(newSecurities);
        await repository.addIexSecurities(newIexSecurities)
    }

    // TODO: Publish message to Teams
    console.log(`${newSymbolsCollection.length} New Securities. Security Symbols List: ${newSymbolsCollection.join(",")}`)
}

const buildSecuritiesMap = <T extends { symbol: string }>(securities: T[]): Record<string, T> => {
    const m: Record<string, T> = {};
    securities.forEach(sec => m[sec.symbol] = sec);
    return m
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};