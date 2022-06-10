import {Client} from "pg";
import {DateTime} from "luxon";

export interface addSecurityPrice {
    securityId: number
    price: number
    time: Date
}

export interface upsertSecuritiesInformation {
    securityId: number
    calculationPrice: string | null
    delayedPrice: number | null
    delayedPriceTime: number | null
    oddLotDelayedPrice: number | null
    oddLotDelayedPriceTime: number | null
    extendedPrice: number | null
    extendedChange: number | null
    extendedChangePercent: number | null
    extendedPriceTime: number | null
    previousClose: number | null
    previousVolume: number | null
    avgTotalVolume: number | null
    marketCap: number | null
    peRatio: number | null
    week52High: number | null
    week52Low: number | null
    ytdChange: number | null
    lastTradeTime: number | null
    currency: string | null
    close: number | null
    high: number | null
    low: number | null
    open: number | null
    volume: number | null
    marketChangeOverTime: number | null
    unadjustedOpen: number | null
    unadjustedClose: number | null
    unadjustedLow: number | null
    unadjustedVolume: number | null
    fullyAdjustedOpen: number | null
    fullyAdjustedClose: number | null
    fullyAdjustedLow: number | null
    fullyAdjustedVolume: number | null
    label: string | null
    change: number | null
    changePercent: number | null
    week52HighSplitAdjustOnly: number | null
    week52LowSplitAdjustOnly: number | null
    week52Change: number | null
    sharesOutstanding: number | null
    float: number | null
    avg10Volume: number | null
    avg30Volume: number | null
    day200MovingAvg: number | null
    day50MovingAvg: number | null
    employees: number | null
    ttmEps: number | null
    ttmDividendRate: number | null
    dividendYield: number | null
    nextDividendDate: string | null
    exDividendDate: string | null
    nextEarningsDate: string | null
    beta: number | null
    maxChangePercent: number | null
    year5ChangePercent: number | null
    year2ChangePercent: number | null
    year1ChangePercent: number | null
    ytdChangePercent: number | null
    month6ChangePercent: number | null
    month3ChangePercent: number | null
    month1ChangePercent: number | null
    day30ChangePercent: number | null
    day5ChangePercent: number | null
}

export interface addExchange {
    name: string
    mic: string
    longName?: string
    tapeId?: string
    oatsId?: string
    refId?: string
    type?: string
    region?: string
    description?: string
    segment?: string
    segmentDescription?: string
    suffix?: string
    exchangeSuffix?: string
}

export interface getExchange {
    id: number
    name: string
    mic: string
    longName?: string
    tapeId?: string
    oatsId?: string
    refId?: string
    type?: string
    region?: string
    description?: string
    segment?: string
    segmentDescription?: string
    suffix?: string
    exchangeSuffix?: string
    lastUpdated?: Date
    createdAt?: Date
}

export interface addUSHoliday {
    date: Date
    settlementDate: Date | null
}

export interface getUSExchangeHoliday {
    id: number
    date: DateTime
    settlementDate: DateTime
    CreatedAt: DateTime
}

export interface getSecurityBySymbol {
    id: number
    symbol: string
    companyName: string
    exchange: string
    industry: string
    website: string
    description: string
    ceo: string
    securityName: string
    issueType: string
    sector: string
    primarySicCode: string
    employees: string
    tags: string[]
    address: string
    address2: string
    state: string
    zip: string
    country: string
    phone: string
    logoUrl: string
    lastUpdated: Date
    createdAt: Date
}

export interface addSecurity {
    symbol: string
    companyName: string
    exchange: string | null
    industry: string | null
    website: string | null
    description: string | null
    ceo: string | null
    securityName: string | null
    issueType: string | null
    sector: string | null
    primarySicCode: string | null
    employees: string | null
    tags: string[] | null
    address: string | null
    address2: string | null
    state: string | null
    zip: string | null
    country: string | null
    phone: string | null
    logoUrl: string | null
}

interface addSecurityResponse {
    id: number
    symbol: string
}

export class Repository {
    private db: Client;

    constructor(db: Client) {
        this.db = db;
    }

    upsertSecuritiesPrices = async (securityPrices: addSecurityPrice[]) => {
        await this.db.query('SELECT upsert_security_prices($1)', [JSON.stringify(securityPrices)]);
    }

    getUSExchangeListedSecurities = async (): Promise<getSecurityBySymbol[]> => {
        return (await this.db.query(`
            SELECT id,
                   symbol,
                   company_name,
                   exchange,
                   industry,
                   website,
                   description,
                   ceo,
                   security_name,
                   issue_type,
                   sector,
                   primary_sic_code,
                   employees,
                   tags,
                   address,
                   address2,
                   state,
                   zip,
                   country,
                   phone,
                   logo_url,
                   last_updated,
                   created_at
            FROM get_us_exchange_listed_securities()`)).rows.map(row => {
            let obj: getSecurityBySymbol = {
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logoUrl,
                lastUpdated: row.lastUpdated,
                createdAt: row.createdAt
            }
            return obj;
        })
    }

    getSecurities = async (): Promise<getSecurityBySymbol[]> => {
        return (await this.db.query(`
            SELECT id,
                   symbol,
                   company_name,
                   exchange,
                   industry,
                   website,
                   description,
                   ceo,
                   security_name,
                   issue_type,
                   sector,
                   primary_sic_code,
                   employees,
                   tags,
                   address,
                   address2,
                   state,
                   zip,
                   country,
                   phone,
                   logo_url,
                   last_updated,
                   created_at
            FROM get_securities();`)).rows.map(row => {
            let obj: getSecurityBySymbol = {
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logoUrl,
                lastUpdated: row.lastUpdated,
                createdAt: row.createdAt
            }
            return obj;
        })
    }

    addSecurities = async (securities: addSecurity[]) => {
        return (await this.db.query('SELECT new_id as id, new_symbol as symbol FROM add_securities($1)', [JSON.stringify(securities)])).rows.map(row => {
            let obj: addSecurityResponse = {
                id: row.id,
                symbol: row.symbol
            }
            return obj;
        });
    }

    getSecurityBySymbol = async (symbol: string): Promise<getSecurityBySymbol[]> => {
        return (await this.db.query(`SELECT id,
                                            symbol,
                                            company_name,
                                            exchange,
                                            industry,
                                            website,
                                            description,
                                            ceo,
                                            security_name,
                                            issue_type,
                                            sector,
                                            primary_sic_code,
                                            employees,
                                            tags,
                                            address,
                                            address2,
                                            state,
                                            zip,
                                            country,
                                            phone,
                                            logo_url,
                                            last_updated,
                                            created_at
                                     FROM get_security_by_symbol($1);`, [symbol])).rows.map(row => {
            let obj: getSecurityBySymbol = {
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logoUrl,
                lastUpdated: row.lastUpdated,
                createdAt: row.createdAt
            }
            return obj;
        });
    }

    getSecuritiesBySymbols = async (symbols: string[]): Promise<getSecurityBySymbol[]> => {
        return (await this.db.query(`SELECT id,
                                            symbol,
                                            company_name,
                                            exchange,
                                            industry,
                                            website,
                                            description,
                                            ceo,
                                            security_name,
                                            issue_type,
                                            sector,
                                            primary_sic_code,
                                            employees,
                                            tags,
                                            address,
                                            address2,
                                            state,
                                            zip,
                                            country,
                                            phone,
                                            logo_url,
                                            last_updated,
                                            created_at
                                     FROM get_securities_by_symbols($1);`, [JSON.stringify(symbols)])).rows.map(row => {
            let obj: getSecurityBySymbol = {
                id: row.id,
                symbol: row.symbol,
                companyName: row.company_name,
                exchange: row.exchange,
                industry: row.industry,
                website: row.website,
                description: row.description,
                ceo: row.ceo,
                securityName: row.security_name,
                issueType: row.issue_type,
                sector: row.sector,
                primarySicCode: row.primary_sic_code,
                employees: row.employees,
                tags: row.tags,
                address: row.address,
                address2: row.address2,
                state: row.state,
                zip: row.zip,
                country: row.country,
                phone: row.phone,
                logoUrl: row.logoUrl,
                lastUpdated: row.lastUpdated,
                createdAt: row.createdAt
            }
            return obj;
        });
    }

    addExchanges = async (exchanges: addExchange[]) => {
        await this.db.query('SELECT add_exchanges($1)', [JSON.stringify(exchanges)]);
    }

    getExchanges = async (): Promise<getExchange[]> => {
        try {
            const response = await this.db.query('SELECT id, name, long_name, mic, tape_id, oats_id, ref_id, type, region, description, segment, segment_description, suffix, exchange_suffix, last_updated, created_at FROM get_exchanges()');
            return response.rows.map(row => {
                let obj: getExchange = {
                    createdAt: row.created_at,
                    description: row.description,
                    exchangeSuffix: row.exchange_suffix,
                    id: row.id,
                    lastUpdated: row.last_updated,
                    longName: row.long_name,
                    mic: row.mic,
                    name: row.name,
                    oatsId: row.oats_id,
                    refId: row.ref_id,
                    region: row.region,
                    segment: row.segment,
                    segmentDescription: row.segment_description,
                    suffix: row.suffix,
                    tapeId: row.tape_id,
                    type: row.type
                }
                return obj;
            });
        } catch (e) {
            throw e
        }
    }

    addSecuritiesPrices = async (securitiesPrices: addSecurityPrice[]) => {
        await this.db.query('SELECT add_securities_prices($1)', [JSON.stringify(securitiesPrices)]);
    }

    upsertSecuritiesInformation = async (securitiesInformation: upsertSecuritiesInformation[]) => {
        await this.db.query('SELECT upsert_company_information($1)', [JSON.stringify(securitiesInformation)]);
    }

    addUsExchangeHolidays = async (holidays: addUSHoliday[]) => {
        await this.db.query('SELECT add_us_exchange_holidays($1)', [JSON.stringify(holidays)]);
    }

    getUsExchangeHolidays = async (): Promise<getUSExchangeHoliday[]> => {
        return (await this.db.query('SELECT id, date, settlement_date, created_at FROM get_us_exchange_holidays();')).rows.map(row => {
            let obj: getUSExchangeHoliday = {
                id: row.id,
                date: row.date,
                settlementDate: row.settlement_date,
                CreatedAt: row.created_at
            }
            return obj;
        })
    }

    getCurrentAndFutureExchangeHolidays = async (): Promise<getUSExchangeHoliday[]> => {
        return (await this.db.query('SELECT id, date, settlement_date, created_at FROM get_current_and_future_us_exchange_holidays();')).rows.map(row => {
            let obj: getUSExchangeHoliday = {
                id: row.id,
                date: DateTime.fromISO(row.date).setZone("America/New_York"),
                settlementDate: DateTime.fromISO(row.settlement_date).setZone("America/New_York"),
                CreatedAt: DateTime.fromISO(row.created_at)
            }
            return obj;
        })
    }
}