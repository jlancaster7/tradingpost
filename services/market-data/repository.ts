import {Client} from "pg";
import {DateTime} from "luxon";
import {
    addSecurityResponse,
    addSecurity,
    getSecurityBySymbol,
    getUSExchangeHoliday,
    addUSHoliday,
    getExchange,
    addExchange,
    upsertSecuritiesInformation,
    addSecurityPrice
} from "./interfaces";

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

    removeSecurityPricesAfter7Days = async (): Promise<any> => {
        return await this.db.query(`DELETE
                                    FROM security_prices
                                    WHERE time < now() - INTERVAL '8 days'
                                      AND (time AT TIME ZONE 'America/New_York')::TIME != '16:00:00';`)
    }
}