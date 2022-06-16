import IEX, {GetCompany, GetLogo, GetPreviousDayPrice, GetQuote, GetStatsBasic} from "@tradingpost/common/iex";
import {Client} from "pg";
import {Repository} from "../../services/market-data/repository";
import {
    addSecurity,
    addSecurityPrice,
    getSecurityBySymbol,
    upsertSecuritiesInformation
} from '../../services/market-data/interfaces';
import {GetIexSymbols, GetOtcSymbols} from '@tradingpost/common/iex';
import {DateTime} from "luxon";
import {Configuration} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);

// Pricing Charge
// AM
// OTC Symbols = 100
// Stock Symbols = 1
// Company(10) & Logo(1) = N/A
// 1 Per Request = 3 credits
// Per Day = 100 + 1 + 3 + Variable = 104 Credits / Day
//
// PM
// Previous =  2 / symbol
// Stats = 5 / symbol
// Quote = 1 / symbol
// Total For All Securities = 26747 * 8
// 1 Per Request = 268
// Per Day = (26748 * 8) + 268 = 214,244 / Day * 21
// Per Month = 4,501,308
const run = async () => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const iexConfiguration = await configuration.fromSSM("/production/iex");
    const iex = new IEX(iexConfiguration['key'] as string);
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string,
        port: 5432,
    });
    await pgClient.connect();
    const repository = new Repository(pgClient);
    await start(pgClient, repository, iex)
    await pgClient.end();
}

const start = async (pgClient: Client, repository: Repository, iex: IEX) => {
    const now = DateTime.now().setZone("America/New_York");
    if (now.hour == 16) {
        console.log("ran evening ingestion")
        await ingestEveningSecuritiesInformation(repository, iex);
    }

    if (now.hour == 8) {
        console.log("ran morning ingestion")
        await ingestMorningSecuritiesInformation(repository, iex);
    }
    console.log("finished running function")
}

const ingestEveningSecuritiesInformation = async (repository: Repository, iex: IEX) => {
    const securities = await repository.getSecurities();
    let securitiesMap = buildSecuritiesMap(securities);
    let securityGroups = buildGroups(securities, 100);
    for (let i = 0; i < securityGroups.length; i++) {
        const securities = securityGroups[i];
        const symbols = securities.map(sec => sec.symbol);
        const iexResponse = await iex.bulk(symbols, ["previous", "stats", "quote"]);

        let securitiesInformation: upsertSecuritiesInformation[] = [];
        let securityPrices: addSecurityPrice[] = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (iexResponse[symbol] === undefined || iexResponse === null) continue;

            const existingSecurity = securitiesMap[symbol];
            if (existingSecurity === undefined || existingSecurity === null) continue;

            let quote = (iexResponse[symbol].quote as GetQuote);
            let stats = (iexResponse[symbol].stats as GetStatsBasic);
            let previous = (iexResponse[symbol].previous as GetPreviousDayPrice);

            // Ingest end of day price & all stats stuff....
            securityPrices.push({
                price: quote.latestPrice,
                securityId: existingSecurity.id,
                time: DateTime.now().setZone('America/New_York').set({minute: 0, second: 0, hour: 16}).toJSDate()
            });

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
                fullyAdjustedClose: previous.fClose,
                fullyAdjustedLow: previous.fLow,
                fullyAdjustedOpen: previous.fOpen,
                fullyAdjustedVolume: previous.fVolume,
                high: quote.high,
                label: previous.label,
                lastTradeTime: quote.lastTradeTime,
                low: quote.low,
                marketCap: quote.marketCap,
                marketChangeOverTime: previous.marketChangeOverTime,
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
                unadjustedClose: previous.uClose,
                unadjustedLow: previous.uLow,
                unadjustedOpen: previous.uOpen,
                unadjustedVolume: previous.uVolume,
                volume: previous.volume,
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

        await repository.upsertSecuritiesPrices(securityPrices);
        await repository.upsertSecuritiesInformation(securitiesInformation);
    }
}

const ingestMorningSecuritiesInformation = async (repository: Repository, iex: IEX) => {
    const currentSecurities = await repository.getSecurities();
    const currentSecuritiesMap = buildSecuritiesMap(currentSecurities);
    const possiblyNewSecurities = await iex.getIexSymbols();
    const possiblyNewOTCSymbols = await iex.getOtcSymbols();

    let newSymbols: string[] = [];
    possiblyNewSecurities.forEach((n: GetIexSymbols) => {
        const cs = currentSecuritiesMap[n.symbol]
        if (cs === undefined || cs === null) newSymbols.push(n.symbol)
    })
    possiblyNewOTCSymbols.forEach((n: GetOtcSymbols) => {
        const cs = currentSecuritiesMap[n.symbol]
        if (cs === undefined || cs === null) newSymbols.push(n.symbol)
    });

    // These are companies I need to ingest company info, logo, and as a new security
    const newSymbolsGroups = buildGroups(newSymbols);
    for (let i = 0; i < newSymbolsGroups.length; i++) {
        let newSymbols = newSymbolsGroups[i];
        const response = await iex.bulk(newSymbols, ["company", "logo"]);
        let newSecurities: addSecurity[] = [];
        newSymbols.forEach(symbol => {
            const res = response[symbol];
            if (res === undefined || res === null) return;

            const company = (res.company as GetCompany);
            const logo = (res.logo as GetLogo);

            if (company.companyName === null) return;

            newSecurities.push({
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
            });
        });
        await repository.addSecurities(newSecurities);
    }
}

const buildSecuritiesMap = (securities: getSecurityBySymbol[]): Record<string, getSecurityBySymbol> => {
    let m: Record<string, getSecurityBySymbol> = {};
    securities.forEach(sec => m[sec.symbol] = sec);
    return m
}

const buildGroups = (securities: any[], max: number = 100): any[][] => {
    let groups: any[][] = [];
    let group: any[] = [];
    securities.forEach(sec => {
        group.push(sec)
        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });

    if (group.length > 0) groups.push(group);

    return groups;
}

module.exports.run = async (event: any, context: Context) => {
    await run();
};