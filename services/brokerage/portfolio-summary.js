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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioSummaryService = exports.SummaryRepository = void 0;
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
            const query = `SELECT id,
                              user_id
                              name,
                              account_group_id,
                              account_id,
                              default_benchmark_id,
                              created_at,
                              updated_at
                       FROM tradingpost_account_groups
                       WHERE user_id = $1
                       `;
            const response = yield this.db.any(query, [userId]);
            if (!response || response.length <= 0)
                return [];
            let accountGroups = [];
            for (let d of response) {
                accountGroups.push({
                    id: parseInt(d.id),
                    user_id: d.user_id,
                    name: d.name,
                    account_group_id: d.account_group_id,
                    account_id: parseInt(d.account_id),
                    default_benchmark_id: parseInt(d.default_benchmark_id),
                    created_at: d.created_at,
                    updated_at: d.updated_at
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
                    account_group_id: null,
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
        this.getTradingPostHoldingsByAccountGroup = (userId, account_group_id, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT ag.account_group_id AS account_group_id,
                            ht.security_id AS security_id,
                            AVG(ht.price) AS price,
                            SUM(ht.value) AS value,
                            SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity) AS cost_basis,
                            SUM(ht.quantity) AS quantity,
                            ht.date AS date
                     FROM tradingpost_historical_holdings ht
                     INNER JOIN tradingpost_account_groups ag
                     ON ht.account_id = ag.account_id
                     WHERE ag.account_group_id = $1 AND ht.date BETWEEN $2 AND $3
                     GROUP BY ag.account_group_id, ht.security_id, ht.date
                     `;
            const response = yield this.db.any(query, [account_group_id, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    account_id: null,
                    account_group_id: d.acccount_group_id,
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
        this.getTradingPostReturns = (userId, account_group_id, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
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
                    account_group_id: d.account_group_id,
                    date: d.date,
                    return: parseFloat(d.return),
                    created_at: d.created_at,
                    updated_at: d.updated_at
                });
            }
            return holdingPeriodReturns;
        });
        this.getSecurityPrices = (security_id, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            security_id,
                            price,
                            time,
                            created_at
                     FROM security_prices
                     WHERE security_id = $1
                     AND time BETWEEN $2 AND $3
                     `;
            const response = yield this.db.any(query, [security_id, startDate, endDate]);
            if (!response || response.length <= 0) {
                return [];
            }
            let prices = [];
            for (let d of response) {
                prices.push({
                    security_id: d.security_id,
                    price: d.price,
                    date: d.time
                });
            }
            return prices;
        });
        this.addAccountGroup = (userId, name, account_ids, default_benchmark_id) => __awaiter(this, void 0, void 0, function* () {
            let values = [];
            for (let i = 0; i < account_ids.length; i++) {
                values.push([userId, name, '1', account_ids[i], default_benchmark_id]);
            }
            let query = `INSERT INTO tradingpost_account_groups(user_id, name, account_group_id, account_id, default_benchmark_id)
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
        this.addTradingPostPortfolioSummary = (userId, account_group_id, portfolioSummary) => __awaiter(this, void 0, void 0, function* () {
            let query = `INSERT INTO tradingpost_account_group_stats 
                     VALUES $1
                    
                     `;
            const response = yield this.db.any(query, [portfolioSummary]);
            console.log(response);
            return 0;
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.SummaryRepository = SummaryRepository;
class PortfolioSummaryService {
    constructor(repository) {
        this.computeAccountGroupHPRs = (holdings) => {
            let dailyAmounts = [];
            dailyAmounts = holdings.reduce((res, value) => {
                if (!res.some(el => el.date === value.date)) {
                    res.push({ account_group_id: value.account_group_id, date: value.date, amount: 0 });
                    // dailyAmounts.push({date: value.date, amount: 0});
                }
                else {
                    let i = res.findIndex(el => el.date === value.date);
                    res[i].amount += value.value;
                }
                return res;
            }, dailyAmounts);
            // will need some logic here to account for cash transfers from transactions
            dailyAmounts.sort((a, b) => { return a.date.valueOf() - b.date.valueOf(); });
            let returns = [];
            for (let i = 1; i < dailyAmounts.length; i++) {
                returns.push({
                    account_group_id: dailyAmounts[i].account_group_id,
                    date: dailyAmounts[i].date,
                    return: (dailyAmounts[i].amount - dailyAmounts[i - 1].amount) / dailyAmounts[i - 1].amount
                });
            }
            return returns;
        };
        this.addAccountGroupHPRs = (accountGroupHPRs) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.repository.addTradingPostReturns(accountGroupHPRs);
            return response;
        });
        this.computeSecurityHPRs = (security_id, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let securityPrices = yield this.repository.getSecurityPrices(security_id, startDate, endDate);
            let returns = [];
            for (let i = 1; securityPrices.length; i++) {
                returns.push({
                    security_id: securityPrices[i].security_id,
                    date: securityPrices[i].date,
                    return: (securityPrices[i].price - securityPrices[i - 1].price) / securityPrices[i - 1].price
                });
            }
            return returns;
        });
        // computeReturns have a default where it computes returns for all available account groups for a user
        // but then give the option to only compute returns for a single account group and return those. 
        this.computeBeta = (stockHPRs, benchmarkHPRs) => {
            return 0;
        };
        this.computeSharpe = (stockHPRs) => {
            return 0;
        };
        this.computeAllocationExposure = () => {
            return {};
        };
        this.computeAccountGroupSummary = (userId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let stats = {
                account_group_id: '',
                beta: 0,
                sharpe: 0,
                industry_allocation: {},
                exposure: {
                    long: 0,
                    short: 0,
                    net: 0,
                    gross: 0
                },
                date: luxon_1.DateTime.now(),
                benchmark_id: 0
            };
            return stats;
        });
        this.repository = repository;
    }
}
exports.PortfolioSummaryService = PortfolioSummaryService;
