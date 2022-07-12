"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioSummaryService = exports.SummaryRepository = void 0;
const mathjs_1 = __importStar(require("mathjs"));
const luxon_1 = require("luxon");
const pg_format_1 = __importDefault(require("pg-format"));
class SummaryRepository {
    constructor(db, pgp) {
        this.getAccounts = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              broker_name,
                              mask,
                              name,
                              official_name,
                              type,
                              subtype,
                              created_at,
                              updated_at
                       FROM tradingpost_accounts
                       WHERE user_id = $1
                       `;
            const response = yield this.db.any(query, [userId]);
            if (!response || response.length <= 0)
                return [];
            let accounts = [];
            for (let d of response) {
                accounts.push({
                    id: parseInt(d.id),
                    user_id: d.user_id,
                    broker_name: d.broker_name,
                    mask: d.mask,
                    name: d.name,
                    official_name: d.official_name,
                    type: d.type,
                    subtype: d.subtype,
                    created_at: d.created_at,
                    updated_at: d.updated_at
                });
            }
            return accounts;
        });
        this.getAccountGroups = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT atg.id,
                              atg.account_group_id,
                              ag.user_id,
                              ag.name,
                              atg.account_id,
                              ag.default_benchmark_id,
                              ag.created_at,
                              ag.updated_at
                       FROM tradingpost_account_groups ag
                       RIGHT JOIN _tradingpost_account_to_group atg
                       ON atg.account_group_id = ag.id
                       WHERE user_id = $1
                       `;
            const response = yield this.db.any(query, [userId]);
            if (!response || response.length <= 0)
                return [];
            let accountGroups = [];
            for (let d of response) {
                accountGroups.push({
                    account_group_id: parseInt(d.account_group_id),
                    account_id: parseInt(d.account_id),
                    user_id: d.user_id,
                    name: d.name,
                    default_benchmark_id: parseInt(d.default_benchmark_id),
                });
            }
            return accountGroups;
        });
        this.getTradingPostHoldingsByAccount = (userId, account_id, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT account_id,
                            security_id,
                            price,
                            value,
                            cost_basis,
                            quantity,
                            date
                     FROM tradingpost_historical_holdings
                     WHERE account_id = $1 AND date BETWEEN $2 AND $3
                     `;
            const response = yield this.db.any(query, [account_id, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    account_id: d.account_id,
                    security_id: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    quantity: parseFloat(d.quantity),
                    date: d.date
                });
            }
            return holdings;
        });
        this.getTradingPostHoldingsByAccountGroup = (userId, account_group_id, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id AS account_group_id,
                            ht.security_id AS security_id,
                            AVG(ht.price) AS price,
                            SUM(ht.value) AS value,
                            SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity) AS cost_basis,
                            SUM(ht.quantity) AS quantity,
                            ht.date AS date
                     FROM tradingpost_historical_holdings ht
                     LEFT JOIN _tradingpost_account_to_group atg
                     ON ht.account_id = atg.account_id
                     WHERE atg.account_group_id = $1 AND ht.date BETWEEN $2 AND $3
                     GROUP BY atg.account_group_id, ht.security_id, ht.date
                     `;
            const response = yield this.db.any(query, [account_group_id, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    account_group_id: parseInt(d.account_group_id),
                    security_id: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    quantity: parseFloat(d.quantity),
                    date: d.date
                });
            }
            return holdings;
        });
        this.getTradingPostCurrnetHoldingsByAccountGroup = (account_group_id) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id AS account_group_id,
                            ch.security_id AS security_id,
                            AVG(ch.price) AS price,
                            SUM(ch.value) AS value,
                            SUM(ch.cost_basis * ch.quantity) / SUM(ch.quantity) AS cost_basis,
                            SUM(ch.quantity) AS quantity,
                            ch.updated_at AS updated_at
                     FROM tradingpost_current_holdings ch
                     LEFT JOIN _tradingpost_account_to_group atg
                     ON ch.account_id = atg.account_id
                     WHERE atg.account_group_id = $1
                     GROUP BY atg.account_group_id, ch.security_id, ch.updated_at
                     `;
            const response = yield this.db.any(query, [account_group_id]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    account_group_id: parseInt(d.account_group_id),
                    security_id: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    quantity: parseFloat(d.quantity),
                    date: d.updated_at
                });
            }
            return holdings;
        });
        this.getTradingPostAcountGroupReturns = (userId, account_group_id, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            acccount_group_id,
                            date,
                            return,
                            created_at,
                            updated_at
                     FROM account_group_hprs 
                     WHERE account_group_id = $1 
                     AND date BETWEEN $2 AND $3
                     `;
            const response = yield this.db.any(query, [account_group_id, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdingPeriodReturns = [];
            for (let d of response) {
                holdingPeriodReturns.push({
                    id: parseInt(d.id),
                    account_group_id: parseInt(d.account_group_id),
                    date: d.date,
                    return: parseFloat(d.return),
                    created_at: d.created_at,
                    updated_at: d.updated_at
                });
            }
            return holdingPeriodReturns;
        });
        this.getDailySecurityPrices = (security_id, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            security_id,
                            price,
                            time,
                            created_at
                     FROM security_prices
                     WHERE security_id = $1
                     AND time BETWEEN $2 AND $3 AND (time at time zone 'America/New_York')::time = '16:00:00'
                     `;
            const response = yield this.db.any(query, [security_id, startDate, endDate]);
            if (!response || response.length <= 0) {
                return [];
            }
            let prices = [];
            for (let d of response) {
                prices.push({
                    security_id: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    date: d.time
                });
            }
            return prices;
        });
        this.getSecurities = (security_ids) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
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
                     FROM securities
                     WHERE id IN (%L)
                     `;
            const response = yield this.db.any((0, pg_format_1.default)(query, security_ids))
                .catch((error) => {
                console.log(error);
                return '';
            });
            if (!response || response.length <= 0) {
                return [];
            }
            let sec = [];
            for (let d of response) {
                sec.push({
                    id: parseInt(d.id),
                    symbol: d.symbol,
                    companyName: d.company_name,
                    exchange: d.exchange,
                    industry: d.industry,
                    website: d.website,
                    description: d.description,
                    ceo: d.ceo,
                    securityName: d.security_name,
                    issueType: d.issueType,
                    sector: d.sector,
                    primarySicCode: d.primary_sic_code,
                    employees: d.employees,
                    tags: d.tags,
                    address: d.address,
                    address2: d.address2,
                    state: d.state,
                    zip: d.zip,
                    country: d.country,
                    phone: d.phone,
                    logoUrl: d.logo_url,
                    lastUpdated: d.last_updated,
                    createdAt: d.created_at
                });
            }
            return sec;
        });
        this.addNewAccountGroup = (userId, name, account_ids, default_benchmark_id) => __awaiter(this, void 0, void 0, function* () {
            let query = `INSERT INTO tradingpost_account_groups(user_id, name, default_benchmark_id)
                     VALUES ($1, $2, $3)
                     RETURNING id;
                     `;
            let account_group_id = yield this.db.any(query, [userId, name, default_benchmark_id])
                .catch(error => {
                console.log(error);
                return null;
            });
            if (!account_group_id) {
                return 0;
            }
            else {
                account_group_id = account_group_id[0].id;
            }
            ;
            query = `INSERT INTO _tradingpost_account_to_group(account_id, account_group_id)
                 VALUES %L
                 `;
            let values = [];
            for (let d of account_ids) {
                values.push([d, account_group_id]);
            }
            let result = yield this.db.any((0, pg_format_1.default)(query, values))
                .catch(error => {
                console.log(error);
                return null;
            });
            if (!result)
                return 0;
            return 1;
        });
        this.addTradingPostReturns = (accountGroupReturns) => __awaiter(this, void 0, void 0, function* () {
            let values = [];
            for (let i = 0; i < accountGroupReturns.length; i++) {
                let x = accountGroupReturns[i];
                x.date = x.date.toString();
                values.push(Object.values(x));
            }
            let query = `INSERT INTO account_group_hprs (account_group_id, date, return)
                     VALUES %L
                     `; // need to add an 'on conflict statement when account_group_id and date, update return
            let result = 2;
            yield this.db.any((0, pg_format_1.default)(query, values))
                .then(() => {
                result = 1;
            })
                .catch(error => {
                console.log(error);
                result = 0;
            });
            return result;
        });
        this.addBenchmarkReturns = (benchmarkReturns) => __awaiter(this, void 0, void 0, function* () {
            let values = [];
            for (let d of benchmarkReturns) {
                values.push(Object.values(d));
            }
            let query = `INSERT INTO  benchmark_hprs(security_id, date, return)
                     VALUES %L
                     `;
            let result = 2;
            yield this.db.any((0, pg_format_1.default)(query, values))
                .then(() => {
                result = 1;
            })
                .catch(error => {
                console.log(error);
                result = 0;
            });
            return result;
        });
        this.addTradingPostPortfolioSummary = (userId, account_group_id, accountGroupSummary) => __awaiter(this, void 0, void 0, function* () {
            let query = `INSERT INTO tradingpost_account_group_stats 
                     VALUES $1
                     `;
            let result = 2;
            const response = yield this.db.any(query, [accountGroupSummary])
                .then(() => {
                result = 1;
            })
                .catch(error => {
                console.log(error);
                result = 0;
            });
            return result;
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.SummaryRepository = SummaryRepository;
class PortfolioSummaryService {
    constructor(repository) {
        this.computeAccountGroupHPRs = (account_group_id, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let holdings = yield this.repository.getTradingPostHoldingsByAccountGroup('', account_group_id, startDate, endDate);
            let dailyAmounts = [];
            dailyAmounts = holdings.reduce((res, value) => {
                if (!res.some(el => el.date.valueOf() === value.date.valueOf())) {
                    res.push({ account_group_id: value.account_group_id, date: value.date, amount: value.value });
                }
                else {
                    let i = res.findIndex(el => el.date.valueOf() === value.date.valueOf());
                    res[i].amount += value.value;
                }
                return res;
            }, dailyAmounts);
            // will need some logic here to account for cash transfers from transactions
            dailyAmounts.sort((a, b) => { return a.date.valueOf() - b.date.valueOf(); });
            let returns = [];
            for (let i = 1; i < dailyAmounts.length; i++) {
                if (!dailyAmounts[i].account_group_id) {
                    dailyAmounts[i].account_group_id = 0;
                }
                returns.push({
                    // @ts-ignore
                    account_group_id: dailyAmounts[i].account_group_id,
                    date: dailyAmounts[i].date,
                    return: (dailyAmounts[i].amount - dailyAmounts[i - 1].amount) / dailyAmounts[i - 1].amount
                });
            }
            return returns;
        });
        this.addAccountGroupHPRs = (accountGroupHPRs) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.repository.addTradingPostReturns(accountGroupHPRs);
            return response;
        });
        this.computeSecurityHPRs = (security_id, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let securityPrices = yield this.repository.getDailySecurityPrices(security_id, startDate, endDate);
            if (!securityPrices || securityPrices.length <= 0)
                return [];
            let returns = [];
            for (let i = 1; i < securityPrices.length; i++) {
                returns.push({
                    security_id: securityPrices[i].security_id,
                    date: securityPrices[i].date,
                    return: (securityPrices[i].price - securityPrices[i - 1].price) / securityPrices[i - 1].price
                });
            }
            returns.sort((a, b) => { return a.date.valueOf() - b.date.valueOf(); });
            return returns;
        });
        this.addBenchmarkHPRs = (benchmarkHPRs) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.repository.addBenchmarkReturns(benchmarkHPRs);
            return response;
        });
        this.computeSecurityBeta = (security_id, benchmark_id, daysPrior = 365 * 5) => __awaiter(this, void 0, void 0, function* () {
            let securityReturns = (yield this.computeSecurityHPRs(security_id, luxon_1.DateTime.now().minus(daysPrior * 8.64e+7)));
            let benchmarkReturns = (yield this.computeSecurityHPRs(benchmark_id, luxon_1.DateTime.now().minus(daysPrior * 8.64e+7)));
            function checkDates(arr1, arr2) {
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i].date.valueOf() !== arr2[i].date.valueOf()) {
                        console.log('date mismatch, see the below:');
                        console.log(arr1[i]);
                        console.log(arr2[i]);
                        return 1;
                    }
                }
                return 0;
            }
            if (securityReturns.length > benchmarkReturns.length) {
                securityReturns = securityReturns.slice(securityReturns.length - benchmarkReturns.length, securityReturns.length);
                const dateCheck = checkDates(securityReturns, benchmarkReturns);
                if (dateCheck === 1) {
                    return 0;
                }
                let securityHPRs = securityReturns.map(a => a.return);
                let benchmarkHPRs = benchmarkReturns.map(a => a.return);
                // @ts-ignore
                return this.computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
            }
            else if (securityReturns.length < benchmarkReturns.length) {
                benchmarkReturns = benchmarkReturns.slice(benchmarkReturns.length - securityReturns.length, benchmarkReturns.length);
                const dateCheck = checkDates(securityReturns, benchmarkReturns);
                if (dateCheck === 1) {
                    return 0;
                }
                let securityHPRs = securityReturns.map(a => a.return);
                let benchmarkHPRs = benchmarkReturns.map(a => a.return);
                // @ts-ignore
                return this.computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
            }
            else {
                for (let i = 0; i < benchmarkReturns.length; i++) {
                    const dateCheck = checkDates(securityReturns, benchmarkReturns);
                    if (dateCheck === 1) {
                        return 0;
                    }
                }
            }
            let securityHPRs = securityReturns.map(a => a.return);
            let benchmarkHPRs = benchmarkReturns.map(a => a.return);
            // @ts-ignore
            return this.computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
        });
        this.computeAccountGroupBeta = (account_group_id, benchmark_id, daysPrior = 365 * 5) => __awaiter(this, void 0, void 0, function* () {
            const holdings = yield this.repository.getTradingPostCurrnetHoldingsByAccountGroup(account_group_id);
            let beta = [];
            let sum = 0;
            for (let d of holdings) {
                beta.push([yield this.computeSecurityBeta(d.security_id, benchmark_id, daysPrior), d.value]);
                sum += d.value;
            }
            let weighted_beta = 0;
            for (let d of beta) {
                weighted_beta += d[0] * (d[1] / sum);
            }
            return weighted_beta;
        });
        this.computeCovariance = (arr1, arr2, n) => {
            let sum = 0;
            let mean_arr1 = (0, mathjs_1.mean)(arr1);
            let mean_arr2 = (0, mathjs_1.mean)(arr2);
            for (let i = 0; i < n; i++) {
                sum += (arr1[i] - mean_arr1) * (arr2[i] - mean_arr2);
            }
            return sum / (n - 1);
        };
        this.computeSharpe = (stockHPRs) => {
            return 0;
        };
        this.computeSectorAllocations = (holdings) => __awaiter(this, void 0, void 0, function* () {
            let security_ids = holdings.map(a => a.security_id);
            let securities = yield this.repository.getSecurities(security_ids);
            let sectorAllocations = [];
            const portfolioSum = holdings.reduce((res, value) => {
                return res + value.value;
            }, 0);
            let sector;
            let i;
            for (let d of holdings) {
                let secInfo = securities.find(a => a.id === d.security_id);
                if (!secInfo) {
                    sector = 'n/a';
                }
                else {
                    sector = secInfo.sector;
                }
                i = sectorAllocations.findIndex(a => a.sector === sector);
                if (i === -1) {
                    sectorAllocations.push({
                        sector: sector,
                        value: d.value / portfolioSum
                    });
                }
                else {
                    sectorAllocations[i].value += d.value / portfolioSum;
                }
            }
            return sectorAllocations;
        });
        this.computeExposure = (holdings) => {
            let long = 0;
            let short = 0;
            let gross = 0;
            let net = 0;
            let total = 0;
            for (let d of holdings) {
                total += d.value;
                if (d.security_id === 26830) { // cash 
                    continue;
                }
                gross += mathjs_1.default.abs(d.value);
                net += d.value;
                if (d.value > 0) {
                    long += d.value;
                }
                if (d.value < 0) {
                    short += d.value;
                }
            }
            return { long: long / total, short: short / total, gross: gross / total, net: net / total };
        };
        this.computeAccountGroupSummary = (userId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            const account_group = (yield this.repository.getAccountGroups(userId)).find(a => a.name === 'default');
            if (!account_group) {
                return null;
            }
            const holdings = yield this.repository.getTradingPostCurrnetHoldingsByAccountGroup(account_group.account_group_id);
            const beta = yield this.computeAccountGroupBeta(account_group.account_group_id, account_group.default_benchmark_id);
            const allocations = yield this.computeSectorAllocations(holdings);
            const exposure = this.computeExposure(holdings);
            let stats = {
                account_group_id: account_group.account_group_id,
                beta: beta,
                sharpe: 0,
                industry_allocation: allocations,
                exposure: exposure,
                date: luxon_1.DateTime.now(),
                benchmark_id: account_group.default_benchmark_id
            };
            return stats;
        });
        this.repository = repository;
    }
}
exports.PortfolioSummaryService = PortfolioSummaryService;
