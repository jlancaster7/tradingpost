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
                    date: luxon_1.DateTime.fromISO(row.date).setZone("America/New_York"),
                    settlementDate: luxon_1.DateTime.fromISO(row.settlement_date).setZone("America/New_York"),
                    CreatedAt: luxon_1.DateTime.fromISO(row.created_at)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsaUNBQStCO0FBYS9CLE1BQWEsVUFBVTtJQUduQixZQUFZLEVBQVU7UUFJdEIsMkJBQXNCLEdBQUcsQ0FBTyxjQUFrQyxFQUFFLEVBQUU7WUFDbEUsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0NBQTZCLEdBQUcsR0FBeUMsRUFBRTtZQUN2RSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FEQXdCaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDM0QsSUFBSSxHQUFHLEdBQXdCO29CQUMzQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVk7b0JBQzdCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87b0JBQ3BCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDNUIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLFlBQVksRUFBRSxHQUFHLENBQUMsYUFBYTtvQkFDL0IsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVO29CQUN6QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLGNBQWMsRUFBRSxHQUFHLENBQUMsZ0JBQWdCO29CQUNwQyxTQUFT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