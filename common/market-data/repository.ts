import {DateTime} from "luxon";
import {
    addSecurity,
    getSecurityBySymbol,
    getUSExchangeHoliday,
    addUSHoliday,
    upsertSecuritiesInformation,
    addSecurityPrice,
    addIexSecurity,
    getIexSecurityBySymbol,
    getSecurityWithLatestPrice,
    updateIexSecurity,
    updateSecurity, iexSecurityWithSecurityCompanyLogoAndName,
} from "./interfaces";

import {ColumnSet, IDatabase, IMain} from 'pg-promise';
import {sec} from "mathjs";

export default class Repository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    insertSecuritiesPrices = async (securitiesPrices: addSecurityPrice[]) => {
        if (securitiesPrices.length <= 0) return
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'high', prop: 'high'},
            {name: 'low', prop: 'low'},
            {name: 'open', prop: 'open'},
            {name: 'price', prop: 'price'},
            {name: 'time', prop: 'time'},
            {name: 'is_eod', prop: 'isEod'},
            {name: 'is_intraday', prop: 'isIntraday'}
        ], {table: 'security_price'})
        const query = this.pgp.helpers.insert(securitiesPrices, cs);
        await this.db.none(query);
    }

    upsertIntradayPrices = async (securityPrices: addSecurityPrice[]) => {
        if (securityPrices.length <= 0) return
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'high', prop: 'high'},
            {name: 'low', prop: 'low'},
            {name: 'open', prop: 'open'},
            {name: 'price', prop: 'price'},
            {name: 'time', prop: 'time'},
            {name: 'is_eod', prop: 'isEod'},
            {name: 'is_intraday', prop: 'isIntraday'}
        ], {table: 'security_price'})
        const query = upsertReplaceQuery(securityPrices, cs, this.pgp, "security_id,time,is_intraday")
        await this.db.none(query);
    }

    upsertEodPrices = async (securityPrices: addSecurityPrice[]) => {
        if (securityPrices.length <= 0) return
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'high', prop: 'high'},
            {name: 'low', prop: 'low'},
            {name: 'open', prop: 'open'},
            {name: 'price', prop: 'price'},
            {name: 'time', prop: 'time'},
            {name: 'is_eod', prop: 'isEod'},
            {name: 'is_intraday', prop: 'isIntraday'}
        ], {table: 'security_price'})
        const query = upsertReplaceQuery(securityPrices, cs, this.pgp, `security_id, ((("time" AT TIME ZONE 'America/New_York'::text))::date)`, `where (is_eod = true)`)
        await this.db.none(query);
    }

    getUsExchangeListedSecuritiesWithPricing = async (): Promise<getSecurityWithLatestPrice[]> => {
        const data = await this.db.query(`
            WITH latest_pricing AS (SELECT sp.security_id,
                                           sp.time,
                                           sp.price,
                                           sp.open,
                                           sp.low,
                                           sp.high
                                    FROM security_price sp
                                             INNER JOIN (SELECT security_id,
                                                                max(time) AS time
                                                         FROM
                                                             security_price security_price
                                                         WHERE
                                                             time >= date_trunc('day'
                                                             , now()) - interval '4 day'
                                                           AND is_eod = TRUE
                                                         GROUP BY
                                                             security_id) AS max_prices
                                                        ON max_prices.security_id = sp.security_id
                                                            AND max_prices.time = sp.time
                                    WHERE is_eod = TRUE)
            SELECT s.id AS security_id,
                   s.symbol,
                   lp.time AS time,
                    lp.price AS price,
                    lp.high AS high,
                    lp.low AS low,
                    lp.open AS open,
                    s.price_source AS price_source,
                    s.enable_utp AS enable_utp
            FROM
                SECURITY s
                INNER JOIN iex_security iexs
            ON iexs.symbol = s.symbol
                LEFT JOIN latest_pricing lp ON s.id = lp.security_id;`)
        return data.map((row: any) => {
            let obj: getSecurityWithLatestPrice = {
                securityId: row.security_id,
                symbol: row.symbol,
                time: DateTime.fromJSDate(row.time),
                price: row.price,
                high: row.high,
                low: row.low,
                open: row.open,
                priceSource: row.price_source,
                enableUtp: row.enable_utp
            }
            return obj
        })
    }

    getUSExchangeListedSecurities = async (): Promise<getSecurityBySymbol[]> => {
        const data = await this.db.query(`
            SELECT s.id,
                   s.symbol,
                   s.company_name,
                   s.exchange,
                   s.industry,
                   s.website,
                   s.description,
                   s.ceo,
                   s.security_name,
                   s.issue_type,
                   s.sector,
                   s.primary_sic_code,
                   s.employees,
                   s.tags,
                   s.address,
                   s.address2,
                   s.state,
                   s.zip,
                   s.country,
                   s.phone,
                   s.logo_url,
                   s.last_updated,
                   s.created_at,
                   s.enable_utp,
                   s.price_source
            FROM SECURITY s
                     INNER JOIN iex_security iexs ON iexs.symbol = s.symbol;`)
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
                logoUrl: row.logo_url,
                lastUpdated: row.last_updated,
                createdAt: row.created_at,
                priceSource: row.price_source,
                enableUtp: row.enble_utp
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
                   created_at,
                   enable_utp,
                   price_source
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
                createdAt: row.createdAt,
                enableUtp: row.enable_utp,
                priceSource: row.price_source
            }
            return obj;
        })
    }

    addSecurities = async (securities: addSecurity[]) => {
        if (securities.length <= 0) return;
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
            {name: 'logo_url', prop: 'logoUrl'},
            {name: 'enable_utp', prop: 'enableUtp'},
            {name: 'price_source', prop: 'priceSource'}
        ], {table: 'security'});
        const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
        await this.db.none(query);
    }

    updateSecurityUtp = async (securityId: number, enableUtp: boolean) => {
        const query = `UPDATE security
                       SET enable_utp = $1
                       WHERE id = $2;`
        await this.db.none(query, [enableUtp, securityId]);
    }

    updateSecurities = async (securities: updateSecurity[]) => {
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
            {name: 'logo_url', prop: 'logoUrl'},
            {name: 'enable_utp', prop: 'enableUtp'},
            {name: 'price_source', prop: 'price_source'}
        ], {table: 'security'});
        const query = this.pgp.helpers.update(securities, cs);
        await this.db.none(query);
    }

    addIexSecurities = async (securities: addIexSecurity[]) => {
        if (securities.length <= 0) return;
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
            {name: 'logo_url', prop: 'logoUrl'},
            {name: 'validated', prop: 'validated'},
        ], {table: 'iex_security'});
        const query = upsertReplaceQuery(securities, cs, this.pgp, "symbol")
        await this.db.none(query);
    }

    updateIexSecurities = async (securities: updateIexSecurity[]) => {
        if (securities.length <= 0) return;
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
            {name: 'logo_url', prop: 'logoUrl'},
            {name: 'validated', prop: 'validated'},
        ], {table: 'iex_security'});
        const query = upsertReplaceQuery(securities, cs, this.pgp, "symbol")
        await this.db.none(query)
    }

    getIexSecuritiesAndSecurityCompanyNameAndLogo = async (): Promise<iexSecurityWithSecurityCompanyLogoAndName[]> => {
        const data = await this.db.query(`
            SELECT iexs.id,
                   iexs.symbol,
                   iexs.company_name,
                   iexs.exchange,
                   iexs.industry,
                   iexs.website,
                   iexs.description,
                   iexs.ceo,
                   iexs.security_name,
                   iexs.issue_type,
                   iexs.sector,
                   iexs.primary_sic_code,
                   iexs.employees,
                   iexs.tags,
                   iexs.address,
                   iexs.address2,
                   iexs.state,
                   iexs.zip,
                   iexs.country,
                   iexs.phone,
                   iexs.logo_url,
                   iexs.last_updated,
                   iexs.created_at,
                   iexs.validated,
                   s.company_name AS security_company_name,
                   s.logo_url     AS security_logo_url,
                   s.sector       AS security_sector,
                   s.tags         AS security_tags
            FROM iex_security iexs
                     LEFT JOIN
                 SECURITY s ON s.symbol = iexs.symbol;`)
        return data.map((row: any) => {
            let obj: iexSecurityWithSecurityCompanyLogoAndName = {
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
                logoUrl: row.logo_url,
                lastUpdated: DateTime.fromJSDate(row.last_updated),
                createdAt: DateTime.fromJSDate(row.created_at),
                validated: row.validated,
                securityCompanyName: row.security_company_name,
                securityLogoUrl: row.security_logo_url,
                securitySector: row.security_sector,
                securityTags: row.security_tags
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
                   created_at,
                   enable_utp,
                   price_source
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
                logoUrl: row.logo_url,
                lastUpdated: row.last_updated,
                createdAt: row.created_at,
                priceSource: row.price_source,
                enableUtp: row.enable_utp
            }
            return obj;
        });
    }

    upsertSecuritiesInformation = async (securitiesInformation: upsertSecuritiesInformation[]) => {
        if (securitiesInformation.length <= 0) {
            console.error("nothing..?")
            return;
        }

        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'avg_10_volume', prop: 'avg10Volume'},
            {name: 'avg_30_volume', prop: 'avg30Volume'},
            {name: 'avg_total_volume', prop: 'avgTotalVolume'},
            {name: 'beta', prop: 'beta'},
            {name: 'calculation_price', prop: 'calculationPrice'},
            {name: 'change', prop: 'change'},
            {name: 'change_percent', prop: 'changePercent'},
            {name: 'close', prop: 'close'},
            {name: 'currency', prop: 'currency'},
            {name: 'day_200_moving_avg', prop: 'day200MovingAvg'},
            {name: 'day_30_change_percent', prop: 'day30ChangePercent'},
            {name: 'day_50_moving_avg', prop: 'day50MovingAvg'},
            {name: 'day_5_change_percent', prop: 'day5ChangePercent'},
            {name: 'delayed_price', prop: 'delayedPrice'},
            {name: 'delayed_price_time', prop: 'delayedPriceTime'},
            {name: 'dividend_yield', prop: 'dividendYield'},
            {name: 'employees', prop: 'employees'},
            {name: 'ex_dividend_date', prop: 'exDividendDate'},
            {name: 'extended_change', prop: 'extendedChange'},
            {name: 'extended_change_percent', prop: 'extendedChangePercent'},
            {name: 'extended_price', prop: 'extendedPrice'},
            {name: 'extended_price_time', prop: 'extendedPriceTime'},
            {name: 'float', prop: 'float'},
            {name: 'fully_adjusted_close', prop: 'fullyAdjustedClose'},
            {name: 'fully_adjusted_low', prop: 'fullyAdjustedLow'},
            {name: 'fully_adjusted_open', prop: 'fullyAdjustedOpen'},
            {name: 'fully_adjusted_volume', prop: 'fullyAdjustedVolume'},
            {name: 'high', prop: 'high'},
            {name: 'label', prop: 'label'},
            {name: 'last_trade_time', prop: 'lastTradeTime'},
            {name: 'low', prop: 'low'},
            {name: 'market_cap', prop: 'marketCap'},
            {name: 'market_change_over_time', prop: 'marketChangeOverTime'},
            {name: 'max_change_percent', prop: 'maxChangePercent'},
            {name: 'month_1_change_percent', prop: 'month1ChangePercent'},
            {name: 'month_3_change_percent', prop: 'month3ChangePercent'},
            {name: 'month_6_change_percent', prop: 'month6ChangePercent'},
            {name: 'next_dividend_date', prop: 'nextDividendDate'},
            {name: 'next_earnings_date', prop: 'nextEarningsDate'},
            {name: 'odd_lot_delayed_price', prop: 'oddLotDelayedPrice'},
            {name: 'odd_lot_delayed_price_time', prop: 'oddLotDelayedPriceTime'},
            {name: 'open', prop: 'open'},
            {name: 'pe_ratio', prop: 'peRatio'},
            {name: 'previous_close', prop: 'previousClose'},
            {name: 'previous_volume', prop: 'previousVolume'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'shares_outstanding', prop: 'sharesOutstanding'},
            {name: 'ttm_dividend_rate', prop: 'ttmDividendRate'},
            {name: 'ttm_eps', prop: 'ttmEps'},
            {name: 'unadjusted_close', prop: 'unadjustedClose'},
            {name: 'unadjusted_low', prop: 'unadjustedLow'},
            {name: 'unadjusted_open', prop: 'unadjustedOpen'},
            {name: 'unadjusted_volume', prop: 'unadjustedVolume'},
            {name: 'volume', prop: 'volume'},
            {name: 'week_52_change', prop: 'week52Change'},
            {name: 'week_52_high', prop: 'week52High'},
            {name: 'week_52_high_split_adjust_only', prop: 'week52HighSplitAdjustOnly'},
            {name: 'week_52_low', prop: 'week52Low'},
            {name: 'week_52_low_split_adjust_only', prop: 'week52LowSplitAdjustOnly'},
            {name: 'year_1_change_percent', prop: 'year1ChangePercent'},
            {name: 'year_2_change_percent', prop: 'year2ChangePercent'},
            {name: 'year_5_change_percent', prop: 'year5ChangePercent'},
            {name: 'ytd_change', prop: 'ytdChange'},
            {name: 'ytd_change_percent', prop: 'ytdChangePercent'},
            {name: 'last_updated', def: 'now()'},
        ], {table: 'security_information'})
        const query = upsertReplaceQuery(securitiesInformation, cs, this.pgp, "(security_id)")
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

    getCurrentAndFutureExchangeHolidays = async (): Promise<getUSExchangeHoliday[]> => {
        const data = await this.db.query(`
            SELECT id, date, settlement_date, created_at
            FROM us_exchange_holiday;`)
        return data.map((row: any) => {
            let obj: getUSExchangeHoliday = {
                id: row.id,
                date: DateTime.fromJSDate(row.date).setZone("America/New_York"),
                settlementDate: DateTime.fromJSDate(row.settlement_date).setZone("America/New_York"),
                createdAt: DateTime.fromJSDate(row.created_at)
            }
            return obj;
        })
    }

    removeSecurityPricesAfter7Days = async (): Promise<any> => {
        return await this.db.query(`DELETE
                                    FROM security_price
                                    WHERE time < now() - INTERVAL '8 days'
                                      AND is_intraday is TRUE;`)
    }
}

function upsertReplaceQuery(data: any, cs: ColumnSet, pgp: IMain, conflict: string = "id", partialWhere?: string) {
    let pw = partialWhere ? partialWhere : ''
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) ${pw} DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`;
        }).join()
}