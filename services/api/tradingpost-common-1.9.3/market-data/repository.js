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
const luxon_1 = require("luxon");
class Repository {
    constructor(db, pgp) {
        this.insertSecuritiesPrices = (securitiesPrices) => __awaiter(this, void 0, void 0, function* () {
            if (securitiesPrices.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'high', prop: 'high' },
                { name: 'low', prop: 'low' },
                { name: 'open', prop: 'open' },
                { name: 'price', prop: 'price' },
                { name: 'time', prop: 'time' },
                { name: 'is_eod', prop: 'isEod' },
                { name: 'is_intraday', prop: 'isIntraday' }
            ], { table: 'security_price' });
            const query = this.pgp.helpers.insert(securitiesPrices, cs);
            yield this.db.none(query);
        });
        this.upsertSecuritiesPrices = (securityPrices) => __awaiter(this, void 0, void 0, function* () {
            if (securityPrices.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'high', prop: 'high' },
                { name: 'low', prop: 'low' },
                { name: 'open', prop: 'open' },
                { name: 'price', prop: 'price' },
                { name: 'time', prop: 'time' },
                { name: 'is_eod', prop: 'isEod' },
                { name: 'is_intraday', prop: 'isIntraday' }
            ], { table: 'security_price' });
            const query = upsertReplaceQuery(securityPrices, cs, this.pgp, "security_id,time,is_intraday");
            yield this.db.none(query);
        });
        this.upsertEodPrices = (securityPrices) => __awaiter(this, void 0, void 0, function* () {
            if (securityPrices.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'high', prop: 'high' },
                { name: 'low', prop: 'low' },
                { name: 'open', prop: 'open' },
                { name: 'price', prop: 'price' },
                { name: 'time', prop: 'time' },
                { name: 'is_eod', prop: 'isEod' },
                { name: 'is_intraday', prop: 'isIntraday' }
            ], { table: 'security_price' });
            const query = upsertReplaceQuery(securityPrices, cs, this.pgp, `security_id, ((("time" AT TIME ZONE 'America/New_York'::text))::date)`, `where (is_eod = true)`);
            yield this.db.none(query);
        });
        this.updatePricesById = (securityPrices) => __awaiter(this, void 0, void 0, function* () {
            if (securityPrices.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'id', prop: 'id', cast: 'bigint' },
                { name: 'security_id', prop: 'securityId', cast: 'bigint' },
                { name: 'high', prop: 'high', cast: 'decimal' },
                { name: 'low', prop: 'low', cast: 'decimal' },
                { name: 'open', prop: 'open', cast: 'decimal' },
                { name: 'price', prop: 'price', cast: 'decimal' },
                { name: 'time', prop: 'time', cast: 'timestamptz' },
                { name: 'is_eod', prop: 'isEod', cast: 'boolean' },
                { name: 'is_intraday', prop: 'isIntraday', cast: 'boolean' }
            ], { table: 'security_price' });
            const query = this.pgp.helpers.update(securityPrices, cs) + ` WHERE v.id = t.id`;
            yield this.db.none(query);
        });
        this.getUsExchangeListedSecuritiesWithPricing = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
            WITH latest_pricing AS (SELECT sp.id,
                                           sp.security_id,
                                           sp.time,
                                           sp.price,
                                           sp."open",
                                           sp.low,
                                           sp.high
                                    FROM security_price sp
                                             INNER JOIN (SELECT security_id,
                                                                max(time) time
                                                         FROM security_price security_price
                                                         WHERE time > NOW() - INTERVAL '5 Days'
                                                           AND is_eod = TRUE
                                                         GROUP BY security_id) AS max_prices
                                                        ON
                                                                    max_prices.security_id = sp.security_id
                                                                AND max_prices.time = sp.time
                                    WHERE is_eod = TRUE)
            SELECT s.id           AS security_id,
                   s.symbol,
                   lp.time        AS time,
                   lp.price       AS price,
                   lp.high        AS high,
                   lp.low         AS low,
                   lp.open        AS open,
                   lp.id          AS eod_id,
                   s.price_source AS price_source
            FROM SECURITY s
                     LEFT JOIN
                 latest_pricing lp ON
                     s.id = lp.security_id
            WHERE exchange IN ('CBOE BZX U.S. EQUITIES EXCHANGE', 'NASDAQ', 'New York Stock Exchange',
                               'NEW YORK STOCK EXCHANGE INC.', 'NYSE Arca', 'NYSE ARCA', 'NYSE MKT LLC')
              AND enable_utp = FALSE;`);
            return data.map((row) => {
                let obj = {
                    securityId: row.security_id,
                    symbol: row.symbol,
                    time: luxon_1.DateTime.fromJSDate(row.time),
                    price: row.price,
                    high: row.high,
                    low: row.low,
                    open: row.open,
                    eodId: row.eod_id,
                    priceSource: row.price_source
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
                   created_at,
                   enable_utp,
                   price_source
            FROM security
            WHERE exchange IN ('CBOE BZX U.S. EQUITIES EXCHANGE', 'NASDAQ', 'New York Stock Exchange',
                               'NEW YORK STOCK EXCHANGE INC.', 'NYSE Arca', 'NYSE ARCA', 'NYSE MKT LLC')
              AND enable_utp = FALSE;`);
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
                    logoUrl: row.logo_url,
                    lastUpdated: row.last_updated,
                    createdAt: row.created_at,
                    priceSource: row.price_source,
                    enableUtp: row.enble_utp
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
                   created_at,
                   enable_utp,
                   price_source
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
                    createdAt: row.createdAt,
                    enableUtp: row.enable_utp,
                    priceSource: row.price_source
                };
                return obj;
            });
        });
        this.addSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            if (securities.length <= 0)
                return;
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
                { name: 'logo_url', prop: 'logoUrl' },
                { name: 'enable_utp', prop: 'enableUtp' },
                { name: 'price_source', prop: 'priceSource' }
            ], { table: 'security' });
            const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
            yield this.db.none(query);
        });
        this.updateSecurityUtp = (securityId, enableUtp) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE security
                       SET enable_utp = $1
                       WHERE id = $2;`;
            yield this.db.none(query, [enableUtp, securityId]);
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
                { name: 'logo_url', prop: 'logoUrl' },
                { name: 'enable_utp', prop: 'enableUtp' },
                { name: 'price_source', prop: 'price_source' }
            ], { table: 'security' });
            const query = this.pgp.helpers.update(securities, cs);
            yield this.db.none(query);
        });
        this.addIexSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            if (securities.length <= 0)
                return;
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
                { name: 'logo_url', prop: 'logoUrl' },
                { name: 'validated', prop: 'validated' },
            ], { table: 'iex_security' });
            const query = this.pgp.helpers.insert(securities, cs) + ` ON CONFLICT DO NOTHING;`;
            yield this.db.none(query);
        });
        this.updateIexSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            if (securities.length <= 0)
                return;
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
                { name: 'logo_url', prop: 'logoUrl' },
                { name: 'validated', prop: 'validated' },
            ], { table: 'iex_security' });
            const query = upsertReplaceQuery(securities, cs, this.pgp, "symbol");
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
                    validated: row.validated,
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
                   created_at,
                   enable_utp,
                   price_source
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
                    logoUrl: row.logo_url,
                    lastUpdated: row.last_updated,
                    createdAt: row.created_at,
                    priceSource: row.price_source,
                    enableUtp: row.enable_utp
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
                   created_at,
                   enable_utp,
                   price_source
            FROM security
            WHERE symbol IN ($1:list);`, [symbols]);
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
                    logoUrl: row.logo_url,
                    lastUpdated: row.last_updated,
                    createdAt: row.created_at,
                    enableUtp: row.enable_utp,
                    priceSource: row.price_source
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
            const query = upsertReplaceQuery(securitiesInformation, cs, this.pgp, "(security_id)");
            yield this.db.none(query);
        });
        this.addUsExchangeHolidays = (holidays) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'date', prop: 'date' },
                { name: 'settlement_date', prop: 'settlementDate' },
            ], { table: 'us_exchange_holiday' });
            const query = this.pgp.helpers.insert(holidays, cs) + ` ON CONFLICT DO NOTHING`;
            yield this.db.none(query);
        });
        this.getUsExchangeHolidays = () => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db.query(`
            SELECT id,
                   date,
                   settlement_date,
                   created_at
            FROM us_exchange_holiday;`);
            return data.map((row) => {
                let obj = {
                    id: row.id,
                    date: row.date,
                    settlementDate: row.settlement_date,
                    createdAt: row.created_at
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
            FROM us_exchange_holiday;`);
            return data.map((row) => {
                let obj = {
                    id: row.id,
                    date: luxon_1.DateTime.fromJSDate(row.date).setZone("America/New_York"),
                    settlementDate: luxon_1.DateTime.fromJSDate(row.settlement_date).setZone("America/New_York"),
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at)
                };
                return obj;
            });
        });
        this.removeSecurityPricesAfter7Days = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.db.query(`DELETE
                                    FROM security_price
                                    WHERE time < now() - INTERVAL '8 days'
                                      AND is_intraday is TRUE;`);
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.default = Repository;
function upsertReplaceQuery(data, cs, pgp, conflict = "id", partialWhere) {
    let pw = partialWhere ? partialWhere : '';
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) ${pw} DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`;
        }).join();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBK0I7QUFtQi9CLE1BQXFCLFVBQVU7SUFJM0IsWUFBWSxFQUFrQixFQUFFLEdBQVU7UUFLMUMsMkJBQXNCLEdBQUcsQ0FBTyxnQkFBb0MsRUFBRSxFQUFFO1lBQ3BFLElBQUksZ0JBQWdCLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTTtZQUN4QyxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztnQkFDMUIsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQy9CLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2FBQzVDLEVBQUUsRUFBQyxLQUFLLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFBO1lBQzdCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1RCxNQUFNLElBQUksQ0FBQyxF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