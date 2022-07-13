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
    constructor(db) {
        this.upsertSecuritiesPrices = (securityPrices) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query('SELECT upsert_securities_prices($1)', [JSON.stringify(securityPrices)]);
        });
        this.getUSExchangeListedSecurities = () => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db.query(`
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
            return (yield this.db.query(`
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
            return (yield this.db.query('SELECT new_id as id, new_symbol as symbol FROM add_securities($1)', [JSON.stringify(securities)])).rows.map(row => {
                let obj = {
                    id: row.id,
                    symbol: row.symbol
                };
                return obj;
            });
        });
        this.getSecurityBySymbol = (symbol) => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db.query(`SELECT id,
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
            return (yield this.db.query(`SELECT id,
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
            yield this.db.query('SELECT add_exchanges($1)', [JSON.stringify(exchanges)]);
        });
        this.getExchanges = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.db.query('SELECT id, name, long_name, mic, tape_id, oats_id, ref_id, type, region, description, segment, segment_description, suffix, exchange_suffix, last_updated, created_at FROM get_exchanges()');
                return response.rows.map(row => {
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
            }
            catch (e) {
                throw e;
            }
        });
        this.addSecuritiesPrices = (securitiesPrices) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query('SELECT add_securities_prices($1)', [JSON.stringify(securitiesPrices)]);
        });
        this.upsertSecuritiesInformation = (securitiesInformation) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query('SELECT upsert_company_information($1)', [JSON.stringify(securitiesInformation)]);
        });
        this.addUsExchangeHolidays = (holidays) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.query('SELECT add_us_exchange_holidays($1)', [JSON.stringify(holidays)]);
        });
        this.getUsExchangeHolidays = () => __awaiter(this, void 0, void 0, function* () {
            return (yield this.db.query('SELECT id, date, settlement_date, created_at FROM get_us_exchange_holidays();')).rows.map(row => {
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
            return (yield this.db.query('SELECT id, date, settlement_date, created_at FROM get_current_and_future_us_exchange_holidays();')).rows.map(row => {
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
                                    FROM security_prices
                                    WHERE time < now() - INTERVAL '8 days'
                                      AND (time AT TIME ZONE 'America/New_York')::TIME != '16:00:00';`);
        });
        this.db = db;
    }
}
exports.Repository = Repository;
