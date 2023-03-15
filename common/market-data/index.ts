import Repository from "./repository"
import {
    addIexSecurity,
    addSecurity,
    addSecurityPrice,
    addUSHoliday,
    getSecurityBySymbol,
    getSecurityWithLatestPrice,
    iexSecurityWithSecurityCompanyLogoAndName,
    PriceSourceType,
    upsertSecuritiesInformation
} from "./interfaces";
import IEX, {
    GetCompany,
    GetIntraDayPrices,
    GetLogo,
    GetStatsBasic,
    GetUSHolidayAndTradingDays,
    PermissionRequiredError
} from "../iex";
import {DateTime} from "luxon";
import {diff} from "deep-object-diff";
import Holidays from "./holidays";
import {SecurityType} from "../brokerage/interfaces";

let m: Map<string, number> = new Map();

export const buildGroups = (securities: any[], max = 100): any[][] => {
    const groups: any[][] = [];
    let group: any[] = [];
    securities.forEach(sec => {
        group.push(sec)

        let x = m.get(sec.symbol)
        if (!x) m.set(sec.symbol, 1);
        else console.log("FOUND AGAIN ", sec.symbol)

        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });

    if (group.length > 0) groups.push(group);

    return groups;
}

const convertIssueType = (issueTypeTest: string | null): SecurityType | null => {
    switch (issueTypeTest) {
        // ADR
        case "ad":
            return SecurityType.equity

        // common stock
        case "cs":
            return SecurityType.equity

        // Close Ended Fund
        case "cef":
            return SecurityType.mutualFund

        // Open Ended Fund
        case "oetf":
            return SecurityType.mutualFund

        // Preferred Stock
        case "ps":
            return SecurityType.fixedIncome

        case "temp":
            return SecurityType.unknown

        case "gd":
            return SecurityType.unknown

        // Right
        case "rt":
            return SecurityType.option

        // Structured Product
        case "struct":
            return SecurityType.fixedIncome

        // Unit
        case "ut":
            return SecurityType.equity

        // When Issued
        case "wi":
            return SecurityType.unknown

        // Warrant
        case "wt":
            return SecurityType.option

        // ETF
        case "et":
            return SecurityType.etf

        case "":
            return SecurityType.unknown

        case null:
            return null;

        default:
            console.log("unknown type: ", issueTypeTest)
            return null
    }
}


export default class MarketData {
    constructor(private readonly repository: Repository, private readonly iex: IEX, private readonly holiday: Holidays) {
        this.repository = repository
        this.iex = iex;
        this.holiday = holiday;
    }

    public prunePricing = async () => {
        await this.repository.removeSecurityPricesAfter7Days()
    }

    private _addNewSymbols = async () => {
        const currentIexSecurities = await this.repository.getIexSecuritiesAndSecurityCompanyNameAndLogo();
        const currentIexSecuritiesMap: Map<string, iexSecurityWithSecurityCompanyLogoAndName> = new Map();
        for (let i = 0; i < currentIexSecurities.length; i++) {
            const c = currentIexSecurities[i];
            currentIexSecuritiesMap.set(c.symbol, c);
        }

        const iexSymbols = await this.iex.getIexSymbols();
        const otcSymbols = await this.iex.getOtcSymbols();

        let newIexSecurities: addIexSecurity[] = [];
        let newSecurities: addSecurity[] = [];

        const nonExistentIexSymbols = iexSymbols.filter(i => currentIexSecuritiesMap.get(i.symbol) === undefined);
        const nonExistentOtcSymbols = otcSymbols.filter(i => currentIexSecuritiesMap.get(i.symbol) === undefined);

        newIexSecurities = [...newIexSecurities, ...nonExistentIexSymbols.map(i => ({
            symbol: i.symbol,
            tags: [],
            validated: false,
            website: null,
            sector: null,
            exchange: null,
            state: null,
            securityName: null,
            zip: null,
            ceo: null,
            primarySicCode: null,
            phone: null,
            logoUrl: null,
            issueType: null,
            industry: null,
            country: null,
            employees: null,
            description: null,
            companyName: '',
            address2: null,
            address: null,
        })) as addIexSecurity[]];
        newIexSecurities = [...newIexSecurities, ...nonExistentOtcSymbols.map(i => ({
            symbol: i.symbol,
            tags: null,
            sector: null,
            exchange: i.exchange,
            industry: null,
            zip: null,
            state: null,
            address2: null,
            issueType: i.type,
            website: null,
            primarySicCode: null,
            logoUrl: null,
            ceo: null,
            validated: false,
            companyName: i.name,
            description: null,
            phone: null,
            country: i.region,
            address: null,
            employees: null,
            securityName: i.name,
        })) as addIexSecurity[]]

        newSecurities = [...newSecurities, ...nonExistentIexSymbols.map(i => ({
            symbol: i.symbol,
            tags: null,
            exchange: null,
            sector: null,
            enableUtp: false,
            priceSource: PriceSourceType.IEX,
            website: null,
            address2: null,
            state: null,
            issueType: null,
            industry: null,
            zip: null,
            primarySicCode: null,
            companyName: '',
            logoUrl: null,
            description: null,
            phone: null,
            country: null,
            address: null,
            employees: null,
            ceo: null,
            securityName: null
        })) as addSecurity[]]
        newSecurities = [...newSecurities, ...nonExistentOtcSymbols.map(i => ({
            symbol: i.symbol,
            securityName: i.name,
            country: i.region,
            companyName: i.name,
            issueType: convertIssueType(i.type),
            priceSource: PriceSourceType.IEX,
            exchange: i.exchange,
            enableUtp: false,
            tags: null,
            ceo: null,
            employees: null,
            address: null,
            phone: null,
            description: null,
            logoUrl: null,
            zip: null,
            primarySicCode: null,
            industry: null,
            state: null,
            address2: null,
            website: null,
            sector: null,
        })) as addSecurity[]]

        await this.repository.addIexSecurities(newIexSecurities)
        await this.repository.addSecurities(newSecurities);
    }

    upsertSecurities = async () => {
        // await this._addNewSymbols();

        const currentIexSecurities = await this.repository.getIexSecuritiesAndSecurityCompanyNameAndLogo();
        const iexSecurityGroups: iexSecurityWithSecurityCompanyLogoAndName[][] = buildGroups(currentIexSecurities, 100);

        let runningJobs: Promise<any>[] = [];
        for (let i = 0; i < iexSecurityGroups.length; i++) {
            const iexSecurityGroup = iexSecurityGroups[i];
            runningJobs.push((async () => {
                const iexSecurityGroupSymbols = iexSecurityGroup.map(f => f.symbol);
                const iexResponse = await this.iex.bulk(iexSecurityGroupSymbols, ["company", "logo"]);

                let iexSecuritiesToAdd: addIexSecurity[] = [];
                let securitiesToAdd: addSecurity[] = [];
                for (let j = 0; j < iexSecurityGroup.length; j++) {
                    const oldIexSecurityAndCompany = iexSecurityGroup[j];
                    const iexCompanyAndLogo = iexResponse[oldIexSecurityAndCompany.symbol];
                    if (iexCompanyAndLogo === undefined || iexCompanyAndLogo === null) continue;

                    const logo = iexCompanyAndLogo.logo as GetLogo;
                    const company = iexCompanyAndLogo.company as GetCompany;
                    const newIexSecurity: addIexSecurity = {
                        address: emptyOrNull(company.address),
                        address2: emptyOrNull(company.address2),
                        state: emptyOrNull(company.state),
                        zip: emptyOrNull(company.zip),
                        country: emptyOrNull(company.country),
                        phone: emptyOrNull(company.phone),
                        logoUrl: emptyOrNull(logo.url),
                        symbol: company.symbol,
                        companyName: company.companyName ? company.companyName.toString() : '',
                        description: emptyOrNull(company.description),
                        ceo: emptyOrNull(company.CEO),
                        securityName: emptyOrNull(company.securityName),
                        employees: company.employees ? emptyOrNull(company.employees.toString()) : null,
                        tags: company.tags,
                        industry: emptyOrNull(company.industry),
                        website: emptyOrNull(company.website),
                        issueType: emptyOrNull(company.issueType),
                        sector: emptyOrNull(company.sector),
                        primarySicCode: company.primarySicCode ? emptyOrNull(company.primarySicCode.toString()) : null,
                        exchange: emptyOrNull(company.exchange),
                        validated: false,
                    }

                    const orgIexSecurity: addIexSecurity = {
                        logoUrl: oldIexSecurityAndCompany.logoUrl,
                        tags: oldIexSecurityAndCompany.tags,
                        address: oldIexSecurityAndCompany.address,
                        companyName: oldIexSecurityAndCompany.companyName,
                        sector: oldIexSecurityAndCompany.sector,
                        validated: false,
                        securityName: oldIexSecurityAndCompany.securityName,
                        country: oldIexSecurityAndCompany.country,
                        phone: oldIexSecurityAndCompany.phone,
                        employees: oldIexSecurityAndCompany.employees,
                        ceo: oldIexSecurityAndCompany.ceo,
                        description: oldIexSecurityAndCompany.description,
                        symbol: oldIexSecurityAndCompany.symbol,
                        primarySicCode: oldIexSecurityAndCompany.primarySicCode,
                        website: oldIexSecurityAndCompany.website,
                        issueType: oldIexSecurityAndCompany.issueType,
                        address2: oldIexSecurityAndCompany.address2,
                        state: oldIexSecurityAndCompany.state,
                        zip: oldIexSecurityAndCompany.zip,
                        industry: oldIexSecurityAndCompany.industry,
                        exchange: oldIexSecurityAndCompany.exchange,
                    }

                    const diffRes = diff(orgIexSecurity, newIexSecurity)
                    if (Object.keys(diffRes).length !== 0) {
                        console.log("DIF")
                        console.log(diffRes)
                    }

                    const issueTypeConversion = convertIssueType(newIexSecurity.issueType);

                    newIexSecurity.validated = oldIexSecurityAndCompany.validated
                    iexSecuritiesToAdd.push(newIexSecurity);

                    const newSecurity = {
                        logoUrl: oldIexSecurityAndCompany.securityLogoUrl,
                        companyName: oldIexSecurityAndCompany.securityCompanyName as string,
                        sector: oldIexSecurityAndCompany.securitySector,
                        tags: oldIexSecurityAndCompany.securityTags,

                        securityName: newIexSecurity.securityName,
                        ceo: newIexSecurity.ceo,
                        employees: newIexSecurity.employees,
                        address: newIexSecurity.address,
                        country: newIexSecurity.country,
                        phone: newIexSecurity.phone,
                        description: newIexSecurity.description,
                        primarySicCode: newIexSecurity.primarySicCode,
                        zip: newIexSecurity.zip,
                        industry: newIexSecurity.industry,
                        website: newIexSecurity.website,
                        issueType: issueTypeConversion,
                        state: newIexSecurity.state,
                        address2: newIexSecurity.address2,
                        priceSource: PriceSourceType.IEX,
                        exchange: newIexSecurity.exchange,
                        symbol: newIexSecurity.symbol,
                        enableUtp: false,
                    }

                    if (!newSecurity.companyName || newSecurity.companyName === '') newSecurity.companyName = newIexSecurity.companyName;
                    if (!newSecurity.sector || newSecurity.sector === '') newSecurity.sector = newIexSecurity.sector;
                    if (!newSecurity.tags || newSecurity.tags.length === 0) newSecurity.tags = newIexSecurity.tags ? newIexSecurity.tags : [];
                    if (!newSecurity.logoUrl || newSecurity.logoUrl === '') {
                        // TODO: SET DEFAULT SECURITY IMAGE
                        newSecurity.logoUrl = newIexSecurity.logoUrl === 'https://storage.googleapis.com/iexcloud-hl37opg/api/logos/placeholder.png' || !newIexSecurity.logoUrl || newIexSecurity.logoUrl === '' ? '' : newIexSecurity.logoUrl;
                    }

                    securitiesToAdd.push(newSecurity);
                }

                await this.repository.addIexSecurities(iexSecuritiesToAdd);
                // await this.repository.addSecurities(securitiesToAdd);
            })())

            if (runningJobs.length === 8) {
                await Promise.all(runningJobs)
                runningJobs = []
            }

            console.log(`Processed ${i}/${iexSecurityGroups.length}`)
        }

        await Promise.all(runningJobs);
    }

    morningPricingRollover = async () => {
        const time930 = DateTime.now().setZone("America/New_York").set({hour: 9, minute: 30, second: 0, millisecond: 0})

        if (!(await this.holiday.isTradingDay(time930))) return

        const securities = await this.repository.getUsExchangeListedSecuritiesWithPricing();
        let securityPrices: addSecurityPrice[] = [];

        for (let i = 0; securities.length; i++) {
            const sec = securities[i];

            if (!sec || !sec.price) continue;

            securityPrices.push({
                price: sec.price,
                high: sec.high,
                low: sec.low,
                open: sec.open,
                time: time930,
                securityId: sec.securityId,
                isEod: true,
                isIntraday: false,
            });

            if (securityPrices.length === 5000) {
                console.log("Inserting...")
                await this.repository.upsertEodPrices(securityPrices);
                securityPrices = [];
            }
        }

        await this.repository.upsertEodPrices(securityPrices)
        console.log("Inserting... fin")
    }

    upsertHolidays = async () => {
        const nextIexHolidays = await this.iex.getUSHolidayAndTradingDays("holiday", "next", 100000);
        const lastIexHolidays = await this.iex.getUSHolidayAndTradingDays("holiday", "last", 100000);

        const holidays: addUSHoliday[] = [];
        const holidayFunc = (h: GetUSHolidayAndTradingDays) => {
            let isoDate = DateTime.fromISO(h.date);
            const settlementDate = h.settlementDate == null ? null : DateTime.fromISO(h.settlementDate);
            isoDate = isoDate.setZone("America/New_York").set({hour: 16, minute: 0, second: 0, millisecond: 0})
            holidays.push({date: isoDate, settlementDate: settlementDate})
        }

        nextIexHolidays.forEach(holidayFunc);
        lastIexHolidays.forEach(holidayFunc);

        await this.repository.addUsExchangeHolidays(holidays);
    }

    updateSecuritiesInformation = async () => {
        const securities = await this.repository.getUSExchangeListedSecurities();
        const securityGroups: getSecurityBySymbol[][] = buildGroups(securities, 100);

        let securitiesInformation: upsertSecuritiesInformation[] = [];
        let runningTasks: Promise<any>[] = [];
        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            runningTasks.push((async () => {
                const securityGroupSymbols = securityGroup.map(sec => sec.symbol);
                const iexResponse = await this.iex.bulk(securityGroupSymbols, ["stats"]);

                for (let j = 0; j < securityGroup.length; j++) {
                    const sec = securityGroup[j];
                    const symbol = sec.symbol;
                    if (iexResponse[symbol] === undefined || iexResponse[symbol] === null) continue;

                    const stats = iexResponse[symbol].stats as GetStatsBasic;
                    if (stats === undefined || stats === null) continue;

                    securitiesInformation.push({
                        avg10Volume: stats.avg10Volume,
                        avg30Volume: stats.avg30Volume,
                        avgTotalVolume: null,
                        beta: stats.beta,
                        calculationPrice: null,
                        change: null,
                        changePercent: null,
                        close: null,
                        currency: null,
                        day200MovingAvg: stats.day200MovingAvg,
                        day30ChangePercent: stats.day30ChangePercent,
                        day50MovingAvg: stats.day50MovingAvg,
                        day5ChangePercent: stats.day5ChangePercent,
                        delayedPrice: null,
                        delayedPriceTime: null,
                        dividendYield: stats.dividendYield,
                        employees: stats.employees,
                        exDividendDate: stats.exDividendDate,
                        extendedChange: null,
                        extendedChangePercent: null,
                        extendedPrice: null,
                        extendedPriceTime: null,
                        float: stats.float,
                        fullyAdjustedClose: null,
                        fullyAdjustedLow: null,
                        fullyAdjustedOpen: null,
                        fullyAdjustedVolume: null,
                        high: null,
                        label: null,
                        lastTradeTime: null,
                        low: null,
                        marketCap: stats.marketcap,
                        marketChangeOverTime: null,
                        maxChangePercent: stats.maxChangePercent,
                        month1ChangePercent: stats.month1ChangePercent,
                        month3ChangePercent: stats.month3ChangePercent,
                        month6ChangePercent: stats.month6ChangePercent,
                        nextDividendDate: stats.nextDividendDate,
                        nextEarningsDate: stats.nextEarningsDate,
                        oddLotDelayedPrice: null,
                        oddLotDelayedPriceTime: null,
                        open: null,
                        peRatio: stats.peRatio,
                        previousClose: null,
                        previousVolume: null,
                        securityId: sec.id,
                        sharesOutstanding: stats.sharesOutstanding,
                        ttmDividendRate: stats.ttmDividendRate,
                        ttmEps: stats.ttmEPS,
                        unadjustedClose: null,
                        unadjustedLow: null,
                        unadjustedOpen: null,
                        unadjustedVolume: null,
                        volume: null,
                        week52Change: stats.week52change,
                        week52High: stats.week52high,
                        week52HighSplitAdjustOnly: stats.week52highSplitAdjustOnly,
                        week52Low: stats.week52low,
                        week52LowSplitAdjustOnly: stats.week52lowSplitAdjustOnly,
                        year1ChangePercent: stats.year1ChangePercent,
                        year2ChangePercent: stats.year2ChangePercent,
                        year5ChangePercent: stats.year5ChangePercent,
                        ytdChange: null,
                        ytdChangePercent: stats.ytdChangePercent
                    });
                }
            })());

            if (runningTasks.length === 8) {
                await Promise.all(runningTasks);
                await this.repository.upsertSecuritiesInformation(securitiesInformation);
                runningTasks = [];
                securitiesInformation = []
            }

            console.log(`Processed ${i}/${securityGroups.length} `)
        }

        if (runningTasks.length > 0) {
            await Promise.all(runningTasks);
            await this.repository.upsertSecuritiesInformation(securitiesInformation);
        }
    }

    public ingestEodOfDayPricing = async () => {
        let securities = await this.repository.getUsExchangeListedSecuritiesWithPricing();

        securities = securities.filter(s => s.priceSource === PriceSourceType.IEX);
        const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

        let eodPrices: addSecurityPrice[] = []
        let runningTasks: Promise<any>[] = [];
        let securityUtpUpdate: number[] = [];

        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            runningTasks.push((async () => {
                const symbols = securityGroup.map(sec => sec.symbol);
                try {
                    const response = await this.iex.bulk(symbols, ["intraday-prices"], {
                        sort: "desc",
                        chartLast: 1
                    });

                    const _eodPrices = await this._processEod(securityGroup, response);
                    eodPrices = [...eodPrices, ..._eodPrices];
                } catch (err) {
                    if (!(err instanceof PermissionRequiredError)) {
                        console.error(`could not fetch data for symbols=${symbols.join(',')} err=`, err)
                        return;
                    }

                    for (let i = 0; i < securityGroup.length; i++) {
                        const sec = securityGroup[i];

                        let response;
                        try {
                            response = await this.iex.bulk([sec.symbol], ["intraday-prices"], {
                                sort: "desc",
                                chartLast: 1
                            });
                        } catch (err) {
                            if (err instanceof PermissionRequiredError) securityUtpUpdate = [...securityUtpUpdate, sec.securityId];

                            else {
                                console.error(`fetching eod prices from iex for symbol=${sec.symbol} err=`, err)
                                continue
                            }
                        }

                        const _eodPrices = await this._processEod([sec], response);
                        eodPrices = [...eodPrices, ..._eodPrices];
                    }
                }
            })());

            if (runningTasks.length === 8) {
                await Promise.all(runningTasks);

                console.log("Upserting Prices...")
                await this.repository.upsertEodPrices(eodPrices);
                await this.repository.updateSecurityUtp(securityUtpUpdate, true)
                eodPrices = [];
                runningTasks = [];
            }
        }

        await Promise.all(runningTasks)
        await this.repository.upsertEodPrices(eodPrices);
    }

    private _processEod = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any> | undefined) => {
        const today4pm = DateTime.now().setZone("America/New_York").set({
            hour: 16,
            second: 0,
            minute: 0,
            millisecond: 0
        });

        let eodPrices = []
        for (let j = 0; j < securityGroup.length; j++) {
            const security = securityGroup[j];
            if (!response) {
                if (!security.time) continue;
                if (!security.price) continue;

                // We have a past item in there, so lets roll it forward
                eodPrices.push({
                    price: security.price,
                    high: security.high,
                    low: security.low,
                    isEod: true,
                    isIntraday: false,
                    open: security.open,
                    time: today4pm,
                    securityId: security.securityId
                })
                continue;
            }

            const iexSecurity = response[security.symbol];
            if (!iexSecurity) {
                if (!security.time) continue;
                if (!security.price) continue;

                // We have a past item in there, so lets roll it forward
                eodPrices.push({
                    price: security.price,
                    high: security.high,
                    low: security.low,
                    isEod: true,
                    isIntraday: false,
                    open: security.open,
                    time: today4pm,
                    securityId: security.securityId
                })
                continue;
            }

            const iexSecurityIntradayPrices = iexSecurity['intraday-prices'] as GetIntraDayPrices[];
            if (!iexSecurityIntradayPrices || iexSecurityIntradayPrices.length === 0) {
                if (!security.time) continue;
                if (!security.price) continue;
                eodPrices.push({
                    price: security.price,
                    high: security.high,
                    low: security.low,
                    isEod: true,
                    securityId: security.securityId,
                    time: today4pm,
                    isIntraday: false,
                    open: security.open
                });
                continue;
            }

            const p = iexSecurityIntradayPrices[0];
            let marketClose: number | null = p.marketClose;
            if (!marketClose) marketClose = p.close !== null ? p.close : security.price
            if (!marketClose) continue

            let marketOpen: number | null = p.marketOpen
            if (!marketOpen) marketOpen = p.open !== null ? p.open : security.open

            let marketHigh: number | null = p.marketHigh
            if (!marketHigh) marketHigh = p.high !== null ? p.high : security.high

            let marketLow: number | null = p.marketLow
            if (!marketLow) marketLow = p.low !== null ? p.low : security.low

            eodPrices.push({
                price: marketClose,
                open: marketOpen,
                time: today4pm,
                low: marketLow,
                high: marketHigh,
                isIntraday: false,
                isEod: true,
                securityId: security.securityId,
            })
        }

        return eodPrices;
    }

    public ingestPricing = async () => {
        let securities = await this.repository.getUsExchangeListedSecuritiesWithPricing();
        securities = securities.filter(sec => sec.priceSource === 'IEX' && !sec.enableUtp)

        const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

        let intradayPrices: addSecurityPrice[] = [];
        let eodPrices: addSecurityPrice[] = []
        let runningTasks: Promise<any>[] = [];

        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            runningTasks.push((async () => {
                const symbols = securityGroup.map(sec => sec.symbol);
                try {

                    // Try/Catch for IEX Errors(Too many Requests/Permission/etc...) -- dealio hereio
                    // Add in retries and such...
                    const response = await this.iex.bulk(symbols, ["intraday-prices"], {
                        chartIEXOnly: true,
                        chartIEXWhenNull: true
                    });

                    const [intraday, eod] = await this._process(securityGroup, response);
                    intradayPrices = [...intradayPrices, ...intraday]
                    eodPrices = [...eodPrices, ...eod];
                } catch (err) {
                    if (err instanceof PermissionRequiredError) {
                        for (let i = 0; i < securityGroup.length; i++) {
                            const sec = securityGroup[i];
                            try {
                                const response = await this.iex.bulk([sec.symbol], ["intraday-prices"], {
                                    chartIEXOnly: true,
                                    chartIEXWhenNull: true
                                });
                                const [intraday, eod] = await this._process(securityGroup, response);
                                intradayPrices = [...intradayPrices, ...intraday]
                                eodPrices = [...eodPrices, ...eod];
                            } catch (err) {
                                if (err instanceof PermissionRequiredError) {
                                    await this.repository.updateSecurityUtp([sec.securityId], true);
                                    continue;
                                }
                                console.error(`fetching intraday prices from iex for symbol=${sec.symbol}`)
                            }
                        }
                        return
                    }
                    console.error(`could not fetch prices from IEX symbols=${symbols.join(',')} error=${err}`)
                }
            })());

            if (runningTasks.length === 8) {
                await Promise.all(runningTasks);
                try {
                    await this.repository.upsertEodPrices(eodPrices)
                } catch (e) {
                    console.error(e)
                    console.error("eod price")
                }

                try {
                    await this.repository.upsertIntradayPrices(intradayPrices);
                } catch (e) {
                    console.error(e)
                    console.log("intraday price")
                }

                eodPrices = [];
                intradayPrices = [];
                runningTasks = [];
            }
        }

        if (runningTasks.length > 0) await Promise.all(runningTasks)

        try {
            await this.repository.upsertEodPrices(eodPrices)
        } catch (e) {
            console.error(e)
            console.error("eod price")
        }

        try {
            await this.repository.upsertIntradayPrices(intradayPrices);
        } catch (e) {
            console.error(e)
            console.log("intraday price")
        }
    }

    private _process = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>) => {
        const currentTime = DateTime.now().setZone("America/New_York").set({second: 0, millisecond: 0});

        let eodPrices: addSecurityPrice[] = [];
        let intradayPrices: addSecurityPrice[] = [];

        for (let j = 0; j < securityGroup.length; j++) {
            const security = securityGroup[j];

            const iexSecurity = response[security.symbol];
            if (!iexSecurity) {
                // Check to see if we have made a record yet for today... for is_eod, if not, then do it with curr time
                if (!security.time) continue;
                if (security.time.day === currentTime.day) continue;
                if (!security.price) continue;

                // Rolling Yesterday Forward
                eodPrices.push({
                    price: security.price,
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    isEod: true,
                    isIntraday: false,
                    time: DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    }),
                    securityId: security.securityId
                })
                continue;
            }

            const iexSecurityPrices = iexSecurity['intraday-prices'] as GetIntraDayPrices[];
            if (!iexSecurityPrices || iexSecurityPrices.length <= 0) {
                if (!security.time) continue;
                if (security.time.day === currentTime.day) continue;
                if (!security.price) continue;

                // Rolling Yesterday Forward
                eodPrices.push({
                    price: security.price,
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    isEod: true,
                    isIntraday: false,
                    time: DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    }),
                    securityId: security.securityId
                })
                continue;
            }

            // Sorted prices, exclude ones without valid timestamp and no price
            const iexSecurityPricesSorted = iexSecurityPrices
                .map(p => {
                    return {
                        ...p, parsedTime: DateTime.fromFormat(`${p.date} ${p.minute}`, "yyyy-LL-dd HH:mm", {
                            zone: "America/New_York"
                        })
                    };
                })
                .filter(p => p.parsedTime.isValid && p.close !== null)
                .sort((a, b) => a.parsedTime.toUnixInteger() - b.parsedTime.toUnixInteger());

            if (iexSecurityPricesSorted.length === 0) {
                if (!security.price) continue

                eodPrices.push({
                    price: security.price,
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    isEod: true,
                    isIntraday: false,
                    time: DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    }),
                    securityId: security.securityId
                })
                continue
            }

            if (security.time && iexSecurityPricesSorted[iexSecurityPricesSorted.length - 1].parsedTime.toUnixInteger() === security.time.toUnixInteger()) continue

            let securityPrice = security.price;
            if (!security.time) security.time = DateTime.now().setZone("America/New_York").set({
                hour: 9,
                minute: 30,
                second: 0,
                millisecond: 0
            });

            security.open = iexSecurityPricesSorted[0].open ? iexSecurityPricesSorted[0].open : iexSecurityPricesSorted[0].close
            security.low = iexSecurityPricesSorted[0].close
            security.open = iexSecurityPricesSorted[0].close
            security.price = iexSecurityPricesSorted[0].close

            iexSecurityPricesSorted.forEach(p => {
                security.time = p.parsedTime
                securityPrice = p.close

                if (security.low) {
                    if (p.low && p.low < security.low) security.low = p.low
                } else if (p.low) security.low = p.low

                if (security.high) {
                    if (p.high && p.high > security.high) security.high = p.high
                } else if (p.high) security.high = p.high

                intradayPrices.push({
                    price: p.close as number,
                    open: p.open,
                    time: p.parsedTime,
                    high: p.high,
                    low: p.low,
                    isEod: false,
                    securityId: security.securityId,
                    isIntraday: true
                })
            });

            if (!securityPrice) continue

            eodPrices.push({
                price: securityPrice,
                low: security.low,
                high: security.high,
                open: security.open,
                time: security.time,
                isIntraday: false,
                isEod: true,
                securityId: security.securityId
            })
        }

        return [intradayPrices, eodPrices];
    }
}

const emptyOrNull = (value: string | null | undefined): string | null => {
    if (value === '') return null;
    if (value === null || value === undefined) return null;
    return value;
}