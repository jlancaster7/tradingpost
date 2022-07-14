"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const luxon_1 = require("luxon");
class Repository {
    constructor(db, pgp) {
        this.upsertSecuritiesPrices = (securityPrices) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'price', prop: 'price' },
                { name: 'time', prop: 'time' }
            ], { table: 'security_price' });
            const query = upsertReplaceQuery(securityPrices, cs, this.pgp, "security_id,time");
            yield this.db.none(query);
        });
        this.getUsExchangedListSecuritiesWithPricing = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
            WITH latest_pricing AS (SELECT sp.security_id,
                                           sp.time,
                                           sp.price
                                    FROM security_price sp
                                             INNER JOIN (SELECT security_id,
                                                                max(time) time
                                                         FROM security_price
                                                         GROUP BY security_id) AS max_prices
                                                        ON
                                                                    max_prices.security_id =
                                                                    sp.security_id
                                                                AND max_prices.time =
                                                                    sp.time)
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
                   lp.time  latest_time,
                   lp.price latest_price
            FROM security s
                     LEFT JOIN
                 latest_pricing lp ON
                     lp.security_id = s.id
            WHERE exchange NOT LIKE '%OTC%';`);
            return data.map((row) => {
                let obj = {
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
                    lastUpdated: luxon_1.DateTime.fromJSDate(row.last_updated),
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                    latestTime: luxon_1.DateTime.fromJSDate(row.latest_time),
                    latestPrice: row.latest_price
                };
                return obj;
            });
        });
        this.getUSExchangeListedSecurities = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
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
            WHERE exchange NOT LIKE '%OTC%';`);
            return data.map((row) => {
                let obj = {
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
                };
                return obj;
            });
        });
        this.getSecurities = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
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
            FROM security;`);
            return data.map((row) => {
                let obj = {
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
                };
                return obj;
            });
        });
        this.addSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'symbol', prop: 'symbol' },
                { name: 'company_name', prop: 'companyName' },
                { name: 'exchange', prop: 'exchange' },
                { name: 'industry', prop: 'industry' },
                { name: 'website', prop: 'website' },
                { name: 'description', prop: 'description' },
                { name: 'ceo', prop: 'ceo' },
                { name: 'security_name', prop: 'securityName' },
                { name: 'issue_type', prop: 'issueType' },
                { name: 'sector', prop: 'sector' },
                { name: 'primary_sic_code', prop: 'primarySicCode' },
                { name: 'employees', prop: 'employees' },
                { name: 'tags', prop: 'tags' },
                { name: 'address', prop: 'address' },
                { name: 'address2', prop: 'address2' },
                { name: 'state', prop: 'state' },
                { name: 'zip', prop: 'zip' },
                { name: 'country', prop: 'country' },
                { name: 'phone', prop: 'phone' },
                { name: 'logoUrl', prop: 'logoUrl' },
            ], { table: 'security' });
            const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
            yield this.db.none(query);
        });
        this.updateSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'symbol', prop: 'symbol' },
                { name: 'company_name', prop: 'companyName' },
                { name: 'exchange', prop: 'exchange' },
                { name: 'industry', prop: 'industry' },
                { name: 'website', prop: 'website' },
                { name: 'description', prop: 'description' },
                { name: 'ceo', prop: 'ceo' },
                { name: 'security_name', prop: 'securityName' },
                { name: 'issue_type', prop: 'issueType' },
                { name: 'sector', prop: 'sector' },
                { name: 'primary_sic_code', prop: 'primarySicCode' },
                { name: 'employees', prop: 'employees' },
                { name: 'tags', prop: 'tags' },
                { name: 'address', prop: 'address' },
                { name: 'address2', prop: 'address2' },
                { name: 'state', prop: 'state' },
                { name: 'zip', prop: 'zip' },
                { name: 'country', prop: 'country' },
                { name: 'phone', prop: 'phone' },
                { name: 'logoUrl', prop: 'logoUrl' },
            ], { table: 'security' });
            const query = this.pgp.helpers.update(securities, cs);
            yield this.db.none(query);
        });
        this.addIexSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'symbol', prop: 'symbol' },
                { name: 'company_name', prop: 'companyName' },
                { name: 'exchange', prop: 'exchange' },
                { name: 'industry', prop: 'industry' },
                { name: 'website', prop: 'website' },
                { name: 'description', prop: 'description' },
                { name: 'ceo', prop: 'ceo' },
                { name: 'security_name', prop: 'securityName' },
                { name: 'issue_type', prop: 'issueType' },
                { name: 'sector', prop: 'sector' },
                { name: 'primary_sic_code', prop: 'primarySicCode' },
                { name: 'employees', prop: 'employees' },
                { name: 'tags', prop: 'tags' },
                { name: 'address', prop: 'address' },
                { name: 'address2', prop: 'address2' },
                { name: 'state', prop: 'state' },
                { name: 'zip', prop: 'zip' },
                { name: 'country', prop: 'country' },
                { name: 'phone', prop: 'phone' },
                { name: 'logoUrl', prop: 'logoUrl' },
                { name: 'validated', prop: 'validated' },
            ], { table: 'iex_security' });
            const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
            yield this.db.none(query);
        });
        this.updateIexSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'symbol', prop: 'symbol' },
                { name: 'company_name', prop: 'companyName' },
                { name: 'exchange', prop: 'exchange' },
                { name: 'industry', prop: 'industry' },
                { name: 'website', prop: 'website' },
                { name: 'description', prop: 'description' },
                { name: 'ceo', prop: 'ceo' },
                { name: 'security_name', prop: 'securityName' },
                { name: 'issue_type', prop: 'issueType' },
                { name: 'sector', prop: 'sector' },
                { name: 'primary_sic_code', prop: 'primarySicCode' },
                { name: 'employees', prop: 'employees' },
                { name: 'tags', prop: 'tags' },
                { name: 'address', prop: 'address' },
                { name: 'address2', prop: 'address2' },
                { name: 'state', prop: 'state' },
                { name: 'zip', prop: 'zip' },
                { name: 'country', prop: 'country' },
                { name: 'phone', prop: 'phone' },
                { name: 'logoUrl', prop: 'logoUrl' },
                { name: 'validated', prop: 'validated' },
            ], { table: 'iex_security' });
            const query = this.pgp.helpers.update(securities, cs);
            yield this.db.none(query);
        });
        this.getIexSecurities = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
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
            FROM iex_security;`);
            return data.map((row) => {
                let obj = {
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
                };
                return obj;
            });
        });
        this.getSecurityBySymbol = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
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
            where symbol = $1;`, [symbol]);
            return data.map((row) => {
                let obj = {
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
                };
                return obj;
            });
        });
        this.getSecuritiesBySymbols = (symbols) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
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
            WHERE symbol IN ($1);`, [symbols]);
            return data.map((row) => {
                let obj = {
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
                };
                return obj;
            });
        });
        this.addExchanges = (exchanges) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'name', prop: 'name' },
                { name: 'long_name', prop: 'longName' },
                { name: 'mic', prop: 'mic' },
                { name: 'tape_id', prop: 'tapeId' },
                { name: 'oats_id', prop: 'oatsId' },
                { name: 'ref_id', prop: 'refId' },
                { name: 'type', prop: 'type' },
                { name: 'region', prop: 'region' },
                { name: 'description', prop: 'description' },
                { name: 'segment', prop: 'segment' },
                { name: 'segment_description', prop: 'segmentDescription' },
                { name: 'suffix', prop: 'suffix' },
                { name: 'exchange_suffix', prop: 'exchangeSuffix' },
            ], { table: 'exchanges' });
            const query = this.pgp.helpers.insert(exchanges, cs) + ` ON CONFLICT DO NOTHING`;
            yield this.db.none(query);
        });
        this.getExchanges = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
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
            return data.map((row) => {
                let obj = {
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
                };
                return obj;
            });
        });
        this.addSecuritiesPrices = (securitiesPrices) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'price', prop: 'price' },
                { name: 'time', prop: 'time' },
            ], { table: 'security_price' });
            const query = this.pgp.helpers.insert(securitiesPrices, cs) + ` ON CONFLICT DO NOTHING;`;
            yield this.db.none(query);
        });
        this.upsertSecuritiesInformation = (securitiesInformation) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'calculation_price', prop: 'calculationPrice' },
                { name: 'delayed_price', prop: 'delayedPrice' },
                { name: 'delayed_price_time', prop: 'delayedPriceTime' },
                { name: 'odd_lot_delayed_price', prop: 'oddLotDelayedPrice' },
                { name: 'odd_lot_delayed_price_time', prop: 'oddLotDelayedPriceTime' },
                { name: 'extended_price', prop: 'extendedPrice' },
                { name: 'extended_change', prop: 'extendedChange' },
                { name: 'extended_change_percent', prop: 'extendedChangePercent' },
                { name: 'extended_price_time', prop: 'extendedPriceTime' },
                { name: 'previous_close', prop: 'previousClose' },
                { name: 'previous_volume', prop: 'previousVolume' },
                { name: 'avg_total_volume', prop: 'avgTotalVolume' },
                { name: 'market_cap', prop: 'marketCap' },
                { name: 'pe_ratio', prop: 'peRatio' },
                { name: 'week_52_high', prop: 'week52High' },
                { name: 'week_52_low', prop: 'week52Low' },
                { name: 'ytd_change', prop: 'ytdChange' },
                { name: 'last_trade_time', prop: 'lastTradeTime' },
                { name: 'currency', prop: 'currency' },
                { name: 'close', prop: 'close' },
                { name: 'high', prop: 'high' },
                { name: 'low', prop: 'low' },
                { name: 'open', prop: 'open' },
                { name: 'volume', prop: 'volume' },
                { name: 'market_change_over_time', prop: 'marketChangeOverTime' },
                { name: 'unadjusted_open', prop: 'unadjustedOpen' },
                { name: 'unadjusted_close', prop: 'unadjustedClose' },
                { name: 'unadjusted_low', prop: 'unadjustedLow' },
                { name: 'unadjusted_volume', prop: 'unadjustedVolume' },
                { name: 'fully_adjusted_open', prop: 'fullyAdjustedOpen' },
                { name: 'fully_adjusted_close', prop: 'fullyAdjustedClose' },
                { name: 'fully_adjusted_high', prop: 'fullyAdjustedHigh' },
                { name: 'fully_adjusted_low', prop: 'fullyAdjustedLow' },
                { name: 'fully_adjusted_volume', prop: 'fullyAdjustedVolume' },
                { name: 'label', prop: 'label' },
                { name: 'change', prop: 'change' },
                { name: 'change_percent', prop: 'changePercent' },
                { name: 'week_52_high_split_adjust_only', prop: 'week52HighSplitAdjustOnly' },
                { name: 'week_52_low_split_adjust_only', prop: 'week52LowSplitAdjustOnly' },
                { name: 'week_52_change', prop: 'week52Change' },
                { name: 'shares_outstanding', prop: 'sharesOutstanding' },
                { name: 'float', prop: 'float' },
                { name: 'avg_10_volume', prop: 'avg10Volume' },
                { name: 'avg_30_volume', prop: 'avg30Volume' },
                { name: 'day_200_moving_avg', prop: 'day200MovingAvg' },
                { name: 'day_50_moving_avg', prop: 'day50MovingAvg' },
                { name: 'employees', prop: 'employees' },
                { name: 'ttm_eps', prop: 'ttmEps' },
                { name: 'ttm_dividend_rate', prop: 'ttmDividendRate' },
                { name: 'dividend_yield', prop: 'dividendYield' },
                { name: 'next_dividend_date', prop: 'nextDividendDate' },
                { name: 'ex_dividend_date', prop: 'exDividendDate' },
                { name: 'next_earnings_date', prop: 'nextEarningsDate' },
                { name: 'beta', prop: 'beta' },
                { name: 'max_change_percent', prop: 'maxChangePercent' },
                { name: 'year_5_change_percent', prop: 'year5ChangePercent' },
                { name: 'year_2_change_percent', prop: 'year2ChangePercent' },
                { name: 'year_1_change_percent', prop: 'year1ChangePercent' },
                { name: 'ytd_change_percent', prop: 'ytdChangePercent' },
                { name: 'month_6_change_percent', prop: 'month6ChangePercent' },
                { name: 'month_3_change_percent', prop: 'month3ChangePercent' },
                { name: 'month_1_change_percent', prop: 'month1ChangePercent' },
                { name: 'day_30_change_percent', prop: 'day30ChangePercent' },
                { name: 'day_5_change_percent', prop: 'day5ChangePercent' },
                { name: 'last_updated', prop: 'now()' },
            ], { table: 'security_information' });
            const query = upsertReplaceQuery(securitiesInformation, cs, this.pgp, "security_id");
            yield this.db.none(query);
        });
        this.addUsExchangeHolidays = (holidays) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'date', prop: 'date' },
                { name: 'settlement_date', prop: 'settlementDate' },
            ], { table: 'us_exchange_holidays' });
            const query = this.pgp.helpers.insert(holidays, cs) + ` ON CONFLICT DO NOTHING`;
            yield this.db.none(query);
        });
        this.getUsExchangeHolidays = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
            SELECT id,
                   date,
                   settlement_date,
                   created_at
            FROM us_exchange_holidays;`);
            return data.map((row) => {
                let obj = {
                    id: row.id,
                    date: row.date,
                    settlementDate: row.settlement_date,
                    CreatedAt: row.created_at
                };
                return obj;
            });
        });
        this.getCurrentAndFutureExchangeHolidays = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
            SELECT id,
                   date,
                   settlement_date,
                   created_at
            FROM us_exchange_holidays;`);
            return data.map((row) => {
                let obj = {
                    id: row.id,
                    date: luxon_1.DateTime.fromJSDate(row.date).setZone("America/New_York"),
                    settlementDate: luxon_1.DateTime.fromJSDate(row.settlement_date).setZone("America/New_York"),
                    CreatedAt: luxon_1.DateTime.fromJSDate(row.created_at)
                };
                return obj;
            });
        });
        this.removeSecurityPricesAfter7Days = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.db.query(`DELETE
                                    FROM security_price
                                    WHERE time < now() - INTERVAL '8 days'
                                      AND (time AT TIME ZONE 'America/New_York')::TIME != '16:00:00';`);
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.Repository = Repository;
function upsertReplaceQuery(data, cs, pgp, conflict = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`;
        }).join();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQStCO0FBbUIvQixNQUFhLFVBQVU7SUFJbkIsWUFBWSxFQUFrQixFQUFFLEdBQVU7UUFLMUMsMkJBQXNCLEdBQUcsQ0FBTyxjQUFrQyxFQUFFLEVBQUU7WUFDbEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUN6QyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7YUFDL0IsRUFBRSxFQUFDLEtBQUssRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLENBQUE7WUFDN0IsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUE7WUFDbEYsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUEsQ0FBQTtRQUVELDRDQUF1QyxHQUFHLEdBQWdELEVBQUU7WUFDeEYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2Q0EyQ0ksQ0FBQyxDQUFBO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUN6QixJQUFJLEdBQUcsR0FBK0I7b0JBQ2xDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLFdBQVcsRUFBRSxHQUFHLENBQUMsWUFBWTtvQkFDN0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7b0JBQ1osWUFBWSxFQUFFLEdBQUcsQ0FBQyxhQUFhO29CQUMvQixTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQ3pCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtvQkFDbEIsY0FBYyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0I7b0JBQ3BDLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztvQkFDeEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO29CQUNkLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztvQkFDWixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztvQkFDaEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixXQUFXLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztvQkFDbEQsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7b0JBQzlDLFVBQVUsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO29CQUNoRCxXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVk7aUJBQ2hDLENBQUE7Z0JBQ0QsT0FBTyxHQUFHLENBQUE7WUFDZCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0NBQTZCLEdBQUcsR0FBeUMsRUFBRTtZQUN2RSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZDQXlCSSxDQUFDLENBQUE7WUFDdEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksR0FBRyxHQUF3QjtvQkFDM0IsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUNWLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtvQkFDbEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzVCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztvQkFDWixZQUFZLEVBQUUsR0FBRyxDQUFDLGFBQWE7b0JBQy9CLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVTtvQkFDekIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixjQUFjLEVBQUUsR0FBRyxDQUFDLGdCQUFnQjtvQkFDcEMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO29CQUN4QixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7b0JBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztvQkFDaEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUNoQixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO2lCQUMzQixDQUFBO2dCQUNELE9BQU8sR0FBRyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUEsQ0FBQTtRQUVELGtCQUFhLEdBQUcsR0FBeUMsRUFBRTtZQUN2RCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBd0JkLENBQUMsQ0FBQTtZQUNwQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxHQUFHLEdBQXdCO29CQUMzQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVk7b0JBQzdCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLFlBQVksRUFBRSxHQUFHLENBQUMsYUFBYTtvQkFDL0IsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVO29CQUN6QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLGNBQWMsRUFBRSxHQUFHLENBQUMsZ0JBQWdCO29CQUNwQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7b0JBQ3hCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtvQkFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUNoQixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7b0JBQ1osT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7aUJBQzNCLENBQUE7Z0JBQ0QsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0JBQWEsR0FBRyxDQUFPLFVBQXlCLEVBQUUsRUFBRTtZQUNoRCxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2dCQUNsQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDMUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7Z0JBQzFCLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDbEQsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztnQkFDbEMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztnQkFDMUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ2xDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQzthQUNyQyxFQUFFLEVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsR0FBRywwQkFBMEIsQ0FBQztZQUNuRixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQscUJBQWdCLEdBQUcsQ0FBTyxVQUE0QixFQUFFLEVBQUU7WUFDdEQsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztnQkFDbEMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzFDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2xELEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ2xDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7Z0JBQzFCLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2dCQUNsQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7YUFDckMsRUFBRSxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEQsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUEsQ0FBQTtRQUVELHFCQUFnQixHQUFHLENBQU8sVUFBNEIsRUFBRSxFQUFFO1lBQ3RELE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzNDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ2xDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMxQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztnQkFDMUIsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNsRCxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2dCQUNsQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztnQkFDbEMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2dCQUNsQyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQzthQUN6QyxFQUFFLEVBQUMsS0FBSyxFQUFFLGNBQWMsRUFBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsR0FBRywwQkFBMEIsQ0FBQztZQUNuRixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBTyxVQUErQixFQUFFLEVBQUU7WUFDNUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztnQkFDbEMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzFDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2xELEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ2xDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7Z0JBQzFCLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2dCQUNsQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ2xDLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2FBQ3pDLEVBQUUsRUFBQyxLQUFLLEVBQUUsY0FBYyxFQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRCxxQkFBZ0IsR0FBRyxHQUE0QyxFQUFFO1lBQzdELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JBeUJWLENBQUMsQ0FBQTtZQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxHQUFHLEdBQTJCO29CQUM5QixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVk7b0JBQzdCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLFlBQVksRUFBRSxHQUFHLENBQUMsYUFBYTtvQkFDL0IsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVO29CQUN6QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLGNBQWMsRUFBRSxHQUFHLENBQUMsZ0JBQWdCO29CQUNwQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7b0JBQ3hCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtvQkFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUNoQixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7b0JBQ1osT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7b0JBQ3hCLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztpQkFDM0IsQ0FBQTtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCx3QkFBbUIsR0FBRyxDQUFPLE1BQWMsRUFBa0MsRUFBRTtZQUMzRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OytCQXlCVixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUNsQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxHQUFHLEdBQXdCO29CQUMzQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVk7b0JBQzdCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLFlBQVksRUFBRSxHQUFHLENBQUMsYUFBYTtvQkFDL0IsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVO29CQUN6QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLGNBQWMsRUFBRSxHQUFHLENBQUMsZ0JBQWdCO29CQUNwQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7b0JBQ3hCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtvQkFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUNoQixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7b0JBQ1osT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7aUJBQzNCLENBQUE7Z0JBQ0QsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FBTyxPQUFpQixFQUFrQyxFQUFFO1lBQ2pGLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0NBeUJQLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUN6QixJQUFJLEdBQUcsR0FBd0I7b0JBQzNCLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLFdBQVcsRUFBRSxHQUFHLENBQUMsWUFBWTtvQkFDN0IsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7b0JBQ1osWUFBWSxFQUFFLEdBQUcsQ0FBQyxhQUFhO29CQUMvQixTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQ3pCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtvQkFDbEIsY0FBYyxFQUFFLEdBQUcsQ0FBQyxnQkFBZ0I7b0JBQ3BDLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztvQkFDeEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO29CQUNkLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDcEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztvQkFDWixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztvQkFDaEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzVCLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztpQkFDM0IsQ0FBQTtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFBLENBQUE7UUFFRCxpQkFBWSxHQUFHLENBQU8sU0FBd0IsRUFBRSxFQUFFO1lBQzlDLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3JDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDakMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2pDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUMvQixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMxQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztnQkFDbEMsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFDO2dCQUN6RCxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2FBQ3BELEVBQUUsRUFBQyxLQUFLLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQTtZQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLHlCQUF5QixDQUFDO1lBQ2pGLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRCxpQkFBWSxHQUFHLEdBQWlDLEVBQUU7WUFDOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBaUJkLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxHQUFHLEdBQWdCO29CQUNuQixTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQ3pCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsY0FBYyxFQUFFLEdBQUcsQ0FBQyxlQUFlO29CQUNuQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixRQUFRLEVBQUUsR0FBRyxDQUFDLFNBQVM7b0JBQ3ZCLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztvQkFDWixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7b0JBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNuQixLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2pCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtvQkFDbEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO29CQUNwQixrQkFBa0IsRUFBRSxHQUFHLENBQUMsbUJBQW1CO29CQUMzQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTztvQkFDbkIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO2lCQUNqQixDQUFBO2dCQUNELE9BQU8sR0FBRyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUEsQ0FBQTtRQUVELHdCQUFtQixHQUFHLENBQU8sZ0JBQW9DLEVBQUUsRUFBRTtZQUNqRSxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQzthQUMvQixFQUFFLEVBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQTtZQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLEdBQUcsMEJBQTBCLENBQUE7WUFDeEYsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUEsQ0FBQTtRQUVELGdDQUEyQixHQUFHLENBQU8scUJBQW9ELEVBQUUsRUFBRTtZQUN6RixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBQztnQkFDckQsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBQztnQkFDdEQsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFDO2dCQUMzRCxFQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUM7Z0JBQ3BFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDakQsRUFBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFDO2dCQUNoRSxFQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7Z0JBQ3hELEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDakQsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNsRCxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ25DLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUMxQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDeEMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQ2hELEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBQztnQkFDL0QsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNqRCxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUM7Z0JBQ25ELEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBQztnQkFDckQsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN4RCxFQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQzFELEVBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDeEQsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFDO2dCQUN0RCxFQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUM7Z0JBQzVELEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDL0MsRUFBQyxJQUFJLEVBQUUsZ0NBQWdDLEVBQUUsSUFBSSxFQUFFLDJCQUEyQixFQUFDO2dCQUMzRSxFQUFDLElBQUksRUFBRSwrQkFBK0IsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUM7Z0JBQ3pFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzlDLEVBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDdkQsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUM1QyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDNUMsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFDO2dCQUNyRCxFQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ25ELEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDakMsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFDO2dCQUNwRCxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDO2dCQUMvQyxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUM7Z0JBQ3RELEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDbEQsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFDO2dCQUN0RCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFDO2dCQUN0RCxFQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQzNELEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBQztnQkFDM0QsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFDO2dCQUMzRCxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUM7Z0JBQ3RELEVBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDN0QsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUM3RCxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUM7Z0JBQzdELEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBQztnQkFDM0QsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN6RCxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQzthQUN4QyxFQUFFLEVBQUMsS0FBSyxFQUFFLHNCQUFzQixFQUFDLENBQUMsQ0FBQTtZQUNuQyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQTtZQUNwRixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQsMEJBQXFCLEdBQUcsQ0FBTyxRQUF3QixFQUFFLEVBQUU7WUFDdkQsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7YUFDcEQsRUFBRSxFQUFDLEtBQUssRUFBRSxzQkFBc0IsRUFBQyxDQUFDLENBQUE7WUFDbkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQztZQUNoRixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO1FBRUQsMEJBQXFCLEdBQUcsR0FBMEMsRUFBRTtZQUNoRSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDOzs7Ozt1Q0FLRixDQUFDLENBQUE7WUFDaEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksR0FBRyxHQUF5QjtvQkFDNUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUNWLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtvQkFDZCxjQUFjLEVBQUUsR0FBRyxDQUFDLGVBQWU7b0JBQ25DLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVTtpQkFDNUIsQ0FBQTtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCx3Q0FBbUMsR0FBRyxHQUEwQyxFQUFFO1lBQzlFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7Ozs7O3VDQUtGLENBQUMsQ0FBQTtZQUNoQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxHQUFHLEdBQXlCO29CQUM1QixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUM7b0JBQy9ELGNBQWMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDO29CQUNwRixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztpQkFDakQsQ0FBQTtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCxtQ0FBOEIsR0FBRyxHQUF1QixFQUFFO1lBQ3RELE9BQU8sTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7O3NHQUdtRSxDQUFDLENBQUE7UUFDbkcsQ0FBQyxDQUFBLENBQUE7UUF6cUJHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztDQXdxQko7QUEvcUJELGdDQStxQkM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLElBQVMsRUFBRSxFQUFhLEVBQUUsR0FBVSxFQUFFLFdBQW1CLElBQUk7SUFDckYsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQy9CLGdCQUFnQixRQUFRLGtCQUFrQjtRQUMxQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNmLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixPQUFPLEdBQUcsR0FBRyxhQUFhLEdBQUcsRUFBRSxDQUFBO1FBQ25DLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLENBQUMifQ==