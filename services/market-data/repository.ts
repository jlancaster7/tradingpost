import {DateTime} from "luxon";
import {
    addSecurity,
    getSecurityBySymbol,
    getUSExchangeHoliday,
    addUSHoliday,
    getExchange,
    addExchange,
    upsertSecuritiesInformation,
    addSecurityPrice, addIexSecurity, getIexSecurityBySymbol
} from "./interfaces";

import {ColumnSet, IDatabase, IMain} from 'pg-promise';

export class Repository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    upsertSecuritiesPrices = async (securityPrices: addSecurityPrice[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'price', prop: 'price'},
            {name: 'time', prop: 'time'}
        ], {table: 'security_price'})
        const query = this.pgp.helpers.insert(securityPrices, cs);
        await this.db.none(query);
    }

    getUSExchangeListedSecurities = async (): Promise<getSecurityBySymbol[]> => {
        const data = await this.db.query(`
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
            FROM security
            WHERE exchange NOT LIKE '%OTC%';`)
        return data.map((row: any) => {
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
        const data = await this.db.query(`
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
            FROM security;`)
        return data.map((row: any) => {
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
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'symbol', prop: 'symbol'},
            {name: 'company_name', prop: 'companyName'},
            {name: 'exchange', prop: 'exchange'},
            {name: 'industry', prop: 'industry'},
            {name: 'website', prop: 'website'},
            {name: 'description', prop: 'description'},
            {name: 'ceo', prop: 'ceo'},
            {name: 'security_name', prop: 'securityName'},
            {name: 'issue_type', prop: 'issueType'},
            {name: 'sector', prop: 'sector'},
            {name: 'primary_sic_code', prop: 'primarySicCode'},
            {name: 'employees', prop: 'employees'},
            {name: 'tags', prop: 'tags'},
            {name: 'address', prop: 'address'},
            {name: 'address2', prop: 'address2'},
            {name: 'state', prop: 'state'},
            {name: 'zip', prop: 'zip'},
            {name: 'country', prop: 'country'},
            {name: 'phone', prop: 'phone'},
            {name: 'logoUrl', prop: 'logoUrl'},
        ], {table: 'security'});
        const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
        await this.db.none(query);
    }

    addIexSecurities = async (securities: addIexSecurity[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'symbol', prop: 'symbol'},
            {name: 'company_name', prop: 'companyName'},
            {name: 'exchange', prop: 'exchange'},
            {name: 'industry', prop: 'industry'},
            {name: 'website', prop: 'website'},
            {name: 'description', prop: 'description'},
            {name: 'ceo', prop: 'ceo'},
            {name: 'security_name', prop: 'securityName'},
            {name: 'issue_type', prop: 'issueType'},
            {name: 'sector', prop: 'sector'},
            {name: 'primary_sic_code', prop: 'primarySicCode'},
            {name: 'employees', prop: 'employees'},
            {name: 'tags', prop: 'tags'},
            {name: 'address', prop: 'address'},
            {name: 'address2', prop: 'address2'},
            {name: 'state', prop: 'state'},
            {name: 'zip', prop: 'zip'},
            {name: 'country', prop: 'country'},
            {name: 'phone', prop: 'phone'},
            {name: 'logoUrl', prop: 'logoUrl'},
            {name: 'validated', prop: 'validated'},
        ], {table: 'iex_security'});
        const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
        await this.db.none(query);
    }

    getIexSecurities = async (): Promise<getIexSecurityBySymbol[]> => {
        const data = await this.db.query(`
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
                   created_at,
                   validated
            FROM iex_security;`)
        return data.map((row: any) => {
            let obj: getIexSecurityBySymbol = {
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
                createdAt: row.createdAt,
                validated: row.validated
            }
            return obj;
        })
    }

    getSecurityBySymbol = async (symbol: string): Promise<getSecurityBySymbol[]> => {
        const data = await this.db.query(`
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
            FROM security
            where symbol = $1;`, [symbol])
        return data.map((row: any) => {
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
        const data = await this.db.query(`
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
            FROM security
            WHERE symbol IN ($1);`, [symbols])
        return data.map((row: any) => {
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
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'name', prop: 'name'},
            {name: 'long_name', prop: 'longName'},
            {name: 'mic', prop: 'mic'},
            {name: 'tape_id', prop: 'tapeId'},
            {name: 'oats_id', prop: 'oatsId'},
            {name: 'ref_id', prop: 'refId'},
            {name: 'type', prop: 'type'},
            {name: 'region', prop: 'region'},
            {name: 'description', prop: 'description'},
            {name: 'segment', prop: 'segment'},
            {name: 'segment_description', prop: 'segmentDescription'},
            {name: 'suffix', prop: 'suffix'},
            {name: 'exchange_suffix', prop: 'exchangeSuffix'},
        ], {table: 'exchanges'})
        const query = this.pgp.helpers.insert(exchanges, cs) + ` ON CONFLICT DO NOTHING`;
        await this.db.none(query)
    }

    getExchanges = async (): Promise<getExchange[]> => {
        const data = await this.db.query(`
            SELECT id,
                   name,
                   long_name,
                   mic,
                   tape_id,
                   oats_id,
                   ref_id,
                   type,
                   region,
                   description,
                   segment,
                   segment_description,
                   suffix,
                   exchange_suffix,
                   last_updated,
                   created_at
            FROM exchanges`);
        return data.map((row: any) => {
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
    }

    addSecuritiesPrices = async (securitiesPrices: addSecurityPrice[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'price', prop: 'price'},
            {name: 'time', prop: 'time'},
        ], {table: 'security_price'})
        const query = this.pgp.helpers.insert(securitiesPrices, cs) + ` ON CONFLICT DO NOTHING;`
        await this.db.none(query);
    }

    upsertSecuritiesInformation = async (securitiesInformation: upsertSecuritiesInformation[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'calculation_price', prop: 'calculationPrice'},
            {name: 'delayed_price', prop: 'delayedPrice'},
            {name: 'delayed_price_time', prop: 'delayedPriceTime'},
            {name: 'odd_lot_delayed_price', prop: 'oddLotDelayedPrice'},
            {name: 'odd_lot_delayed_price_time', prop: 'oddLotDelayedPriceTime'},
            {name: 'extended_price', prop: 'extendedPrice'},
            {name: 'extended_change', prop: 'extendedChange'},
            {name: 'extended_change_percent', prop: 'extendedChangePercent'},
            {name: 'extended_price_time', prop: 'extendedPriceTime'},
            {name: 'previous_close', prop: 'previousClose'},
            {name: 'previous_volume', prop: 'previousVolume'},
            {name: 'avg_total_volume', prop: 'avgTotalVolume'},
            {name: 'market_cap', prop: 'marketCap'},
            {name: 'pe_ratio', prop: 'peRatio'},
            {name: 'week_52_high', prop: 'week52High'},
            {name: 'week_52_low', prop: 'week52Low'},
            {name: 'ytd_change', prop: 'ytdChange'},
            {name: 'last_trade_time', prop: 'lastTradeTime'},
            {name: 'currency', prop: 'currency'},
            {name: 'close', prop: 'close'},
            {name: 'high', prop: 'high'},
            {name: 'low', prop: 'low'},
            {name: 'open', prop: 'open'},
            {name: 'volume', prop: 'volume'},
            {name: 'market_change_over_time', prop: 'marketChangeOverTime'},
            {name: 'unadjusted_open', prop: 'unadjustedOpen'},
            {name: 'unadjusted_close', prop: 'unadjustedClose'},
            {name: 'unadjusted_low', prop: 'unadjustedLow'},
            {name: 'unadjusted_volume', prop: 'unadjustedVolume'},
            {name: 'fully_adjusted_open', prop: 'fullyAdjustedOpen'},
            {name: 'fully_adjusted_close', prop: 'fullyAdjustedClose'},
            {name: 'fully_adjusted_high', prop: 'fullyAdjustedHigh'},
            {name: 'fully_adjusted_low', prop: 'fullyAdjustedLow'},
            {name: 'fully_adjusted_volume', prop: 'fullyAdjustedVolume'},
            {name: 'label', prop: 'label'},
            {name: 'change', prop: 'change'},
            {name: 'change_percent', prop: 'changePercent'},
            {name: 'week_52_high_split_adjust_only', prop: 'week52HighSplitAdjustOnly'},
            {name: 'week_52_low_split_adjust_only', prop: 'week52LowSplitAdjustOnly'},
            {name: 'week_52_change', prop: 'week52Change'},
            {name: 'shares_outstanding', prop: 'sharesOutstanding'},
            {name: 'float', prop: 'float'},
            {name: 'avg_10_volume', prop: 'avg10Volume'},
            {name: 'avg_30_volume', prop: 'avg30Volume'},
            {name: 'day_200_moving_avg', prop: 'day200MovingAvg'},
            {name: 'day_50_moving_avg', prop: 'day50MovingAvg'},
            {name: 'employees', prop: 'employees'},
            {name: 'ttm_eps', prop: 'ttmEps'},
            {name: 'ttm_dividend_rate', prop: 'ttmDividendRate'},
            {name: 'dividend_yield', prop: 'dividendYield'},
            {name: 'next_dividend_date', prop: 'nextDividendDate'},
            {name: 'ex_dividend_date', prop: 'exDividendDate'},
            {name: 'next_earnings_date', prop: 'nextEarningsDate'},
            {name: 'beta', prop: 'beta'},
            {name: 'max_change_percent', prop: 'maxChangePercent'},
            {name: 'year_5_change_percent', prop: 'year5ChangePercent'},
            {name: 'year_2_change_percent', prop: 'year2ChangePercent'},
            {name: 'year_1_change_percent', prop: 'year1ChangePercent'},
            {name: 'ytd_change_percent', prop: 'ytdChangePercent'},
            {name: 'month_6_change_percent', prop: 'month6ChangePercent'},
            {name: 'month_3_change_percent', prop: 'month3ChangePercent'},
            {name: 'month_1_change_percent', prop: 'month1ChangePercent'},
            {name: 'day_30_change_percent', prop: 'day30ChangePercent'},
            {name: 'day_5_change_percent', prop: 'day5ChangePercent'},
            {name: 'last_updated', prop: 'now()'},
        ], {table: 'security_information'})
        const query = upsertReplaceQuery(securitiesInformation, cs, this.pgp, "security_id")
        await this.db.none(query);
    }

    addUsExchangeHolidays = async (holidays: addUSHoliday[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'date', prop: 'date'},
            {name: 'settlement_date', prop: 'settlementDate'},
        ], {table: 'us_exchange_holiday'})
        const query = this.pgp.helpers.insert(holidays, cs) + ` ON CONFLICT DO NOTHING`;
        await this.db.none(query)
    }

    getUsExchangeHolidays = async (): Promise<getUSExchangeHoliday[]> => {
        const data = await this.db.query(`
            SELECT id,
                   date,
                   settlement_date,
                   created_at
            FROM us_exchange_holidays;`)
        return data.map((row: any) => {
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
        const data = await this.db.query(`
            SELECT id,
                   date,
                   settlement_date,
                   created_at
            FROM us_exchange_holidays;`)
        return data.map((row: any) => {
            let obj: getUSExchangeHoliday = {
                id: row.id,
                date: DateTime.fromJSDate(row.date).setZone("America/New_York"),
                settlementDate: DateTime.fromJSDate(row.settlement_date).setZone("America/New_York"),
                CreatedAt: DateTime.fromJSDate(row.created_at)
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

function upsertReplaceQuery(data: any, cs: ColumnSet, pgp: IMain, conflict: string = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`
        }).join();
}