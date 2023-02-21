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
exports.PortfolioSummaryService = void 0;
const mathjs_1 = require("mathjs");
const luxon_1 = require("luxon");
class PortfolioSummaryService {
    constructor(repository) {
        this.computeAccountGroupHPRs = (holdings, trades) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let dailyAmounts = [];
            dailyAmounts = holdings.reduce((res, value) => {
                if (!res.some(el => el.date.valueOf() === value.date.valueOf())) {
                    res.push({ accountGroupId: value.accountGroupId, date: value.date, amount: value.value });
                }
                else {
                    let i = res.findIndex(el => el.date.valueOf() === value.date.valueOf());
                    res[i].amount += value.value;
                }
                return res;
            }, dailyAmounts);
            dailyAmounts.sort((a, b) => {
                return a.date.valueOf() - b.date.valueOf();
            });
            let returns = [];
            const cashTransactions = trades.filter(a => a.type === 'cash');
            for (let i = 1; i < dailyAmounts.length; i++) {
                const date = dailyAmounts[i].date;
                const cashTransaction = ((_a = cashTransactions.find((a) => a.date.valueOf() === date.valueOf())) === null || _a === void 0 ? void 0 : _a.amount) || 0;
                if (!dailyAmounts[i].accountGroupId) {
                    dailyAmounts[i].accountGroupId = 0;
                }
                returns.push({
                    // @ts-ignore
                    accountGroupId: dailyAmounts[i].accountGroupId,
                    date: dailyAmounts[i].date,
                    return: ((dailyAmounts[i].amount + cashTransaction) - dailyAmounts[i - 1].amount) / dailyAmounts[i - 1].amount
                });
            }
            return returns;
        });
        this.addAccountGroupHPRs = (accountGroupHPRs) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.addAccountGroupReturns(accountGroupHPRs);
        });
        this.computeSecurityHPRs = (securityId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let securityPrices = yield this.repository.getDailySecurityPrices(securityId, startDate, endDate);
            if (!securityPrices || securityPrices.length <= 0)
                return [];
            let returns = [];
            for (let i = 1; i < securityPrices.length; i++) {
                returns.push({
                    securityId: securityPrices[i].securityId,
                    date: securityPrices[i].date,
                    return: (securityPrices[i].price - securityPrices[i - 1].price) / securityPrices[i - 1].price
                });
            }
            returns.sort((a, b) => {
                return a.date.valueOf() - b.date.valueOf();
            });
            return returns;
        });
        this.addBenchmarkHPRs = (benchmarkHPRs) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.addBenchmarkReturns(benchmarkHPRs);
        });
        this.computeSecurityBeta = (securityId, benchmarkId, daysPrior = 365 * 5) => __awaiter(this, void 0, void 0, function* () {
            let securityReturns = (yield this.computeSecurityHPRs(securityId, luxon_1.DateTime.now().minus(daysPrior * 8.64e+7)));
            let benchmarkReturns = (yield this.computeSecurityHPRs(benchmarkId, luxon_1.DateTime.now().minus(daysPrior * 8.64e+7)));
            function computeCovariance(arr1, arr2, n) {
                let sum = 0;
                let mean_arr1 = (0, mathjs_1.mean)(arr1);
                let mean_arr2 = (0, mathjs_1.mean)(arr2);
                for (let i = 0; i < n; i++) {
                    sum += (arr1[i] - mean_arr1) * (arr2[i] - mean_arr2);
                }
                return sum / (n - 1);
            }
            function checkDates(arr1, arr2) {
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i].date.toISODate() !== arr2[i].date.toISODate()) {
                        console.log('date mismatch, see the below:');
                        console.log(arr1[i]);
                        console.log(arr2[i]);
                        return 1;
                    }
                }
                return 0;
            }
            if (securityReturns.length > benchmarkReturns.length) {
                securityReturns = securityReturns.slice(securityReturns.length - benchmarkReturns.length);
                const dateCheck = checkDates(securityReturns, benchmarkReturns);
                if (dateCheck === 1) {
                    throw new Error(`Date mismatch, see the above detail for security: ${securityId}, benchmark: ${benchmarkId}`);
                }
                let securityHPRs = securityReturns.map(a => a.return);
                let benchmarkHPRs = benchmarkReturns.map(a => a.return);
                // @ts-ignore
                return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
            }
            else if (securityReturns.length < benchmarkReturns.length) {
                benchmarkReturns = benchmarkReturns.slice(benchmarkReturns.length - securityReturns.length);
                const dateCheck = checkDates(securityReturns, benchmarkReturns);
                if (dateCheck === 1) {
                    throw new Error(`Date mismatch, see the above detail for security: ${securityId}, benchmark: ${benchmarkId}`);
                }
                let securityHPRs = securityReturns.map(a => a.return);
                let benchmarkHPRs = benchmarkReturns.map(a => a.return);
                // @ts-ignore
                return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
            }
            else {
                for (let i = 0; i < benchmarkReturns.length; i++) {
                    const dateCheck = checkDates(securityReturns, benchmarkReturns);
                    if (dateCheck === 1) {
                        throw new Error(`Date mismatch, see the above detail for security: ${securityId}, benchmark: ${benchmarkId}`);
                    }
                }
            }
            let securityHPRs = securityReturns.map(a => a.return);
            let benchmarkHPRs = benchmarkReturns.map(a => a.return);
            // @ts-ignore
            return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
        });
        this.computeAccountGroupBeta = (holdings, benchmarkId, daysPrior = 365 * 5) => __awaiter(this, void 0, void 0, function* () {
            let beta = [];
            let sum = 0;
            for (let d of holdings) {
                if (d.securityType && ['equity', 'cashEquivalent'].includes(d.securityType)) {
                    sum += d.value;
                }
                if (d.securityType && d.securityType !== 'equity') {
                    continue;
                }
                beta.push([yield this.computeSecurityBeta(d.securityId, benchmarkId, daysPrior), d.value]);
            }
            let weighted_beta = 0;
            for (let d of beta) {
                weighted_beta += d[0] * (d[1] / sum);
            }
            return weighted_beta;
        });
        this.computeSharpe = (holdingsReturns) => {
            const returns = holdingsReturns.map(a => a.return);
            const meanReturn = (0, mathjs_1.mean)(returns);
            const stdReturn = (0, mathjs_1.std)(returns);
            // @ts-ignore
            return meanReturn / stdReturn;
        };
        this.computeSectorAllocations = (holdings) => __awaiter(this, void 0, void 0, function* () {
            let securityIds = holdings.map(a => a.securityId);
            let securities = yield this.repository.getSecurities(securityIds);
            let sectorAllocations = [];
            const portfolioSum = holdings.reduce((res, value) => {
                return res + value.value;
            }, 0);
            let industry;
            let i;
            for (let d of holdings) {
                let secInfo = securities.find(a => a.id === d.securityId);
                if (!secInfo) {
                    industry = 'n/a';
                }
                else {
                    industry = secInfo.industry;
                }
                i = sectorAllocations.findIndex(a => a.sector === industry);
                if (i === -1) {
                    sectorAllocations.push({
                        sector: industry,
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
                if (d.securityId === 26830) { // cash 
                    continue;
                }
                gross += (0, mathjs_1.abs)(d.value);
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
        this.computeAccountGroupSummary = (userId, startDate = luxon_1.DateTime.fromJSDate(new Date('1/1/2010')), endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            const account_group = yield this.getAccountGroupByName(userId, 'default');
            const currentHoldings = yield this.repository.getTradingPostCurrentHoldingsByAccountGroup(account_group.accountGroupId);
            const historicalHoldings = yield this.repository.getTradingPostHoldingsByAccountGroup(userId, account_group.accountGroupId, startDate, endDate);
            const trades = yield this.getTrades(userId, undefined, true);
            const returns = yield this.computeAccountGroupHPRs(historicalHoldings, trades);
            yield this.addAccountGroupHPRs(returns);
            let beta;
            try {
                beta = yield this.computeAccountGroupBeta(currentHoldings, account_group.defaultBenchmarkId);
            }
            catch (err) {
                console.log(err);
                beta = -99;
            }
            const sharpe = this.computeSharpe(returns);
            const allocations = yield this.computeSectorAllocations(currentHoldings);
            const exposure = this.computeExposure(currentHoldings);
            const summary = {
                accountGroupId: account_group.accountGroupId,
                beta: beta,
                sharpe: sharpe,
                industryAllocations: JSON.stringify(allocations),
                exposure: JSON.stringify(exposure),
                date: returns[returns.length - 1].date,
                benchmarkId: account_group.defaultBenchmarkId
            };
            yield this.addAccountGroupSummary(summary);
            return summary;
        });
        this.addAccountGroupSummary = (summary) => __awaiter(this, void 0, void 0, function* () {
            yield this.repository.addAccountGroupSummary(summary);
        });
        this.getCurrentHoldings = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const account_group = yield this.getAccountGroupByName(userId, 'default');
                return yield this.repository.getTradingPostCurrentHoldingsByAccountGroup(account_group.accountGroupId);
            }
            catch (err) {
                console.error(err);
                return [];
            }
        });
        this.getTrades = (userId, paging, cash) => __awaiter(this, void 0, void 0, function* () {
            try {
                const account_group = yield this.getAccountGroupByName(userId, 'default');
                return yield this.repository.getTradingPostTransactionsByAccountGroup(account_group.accountGroupId, paging, cash);
            }
            catch (err) {
                console.error(err);
                return [];
            }
        });
        this.getReturns = (userId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            try {
                const account_group = yield this.getAccountGroupByName(userId, 'default');
                return yield this.repository.getTradingPostAccountGroupReturns(account_group.accountGroupId, startDate, endDate);
            }
            catch (err) {
                console.error(err);
                return {};
            }
        });
        this.getSummary = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const account_group = yield this.getAccountGroupByName(userId, 'default');
                return yield this.repository.getAccountGroupSummary(account_group.accountGroupId);
            }
            catch (err) {
                console.error(err);
                return {};
            }
        });
        this.getAccountGroupByName = (userId, accountGroupName) => __awaiter(this, void 0, void 0, function* () {
            const account_group = (yield this.repository.getTradingPostAccountGroups(userId)).find(a => a.name === accountGroupName);
            if (!account_group) {
                throw new Error(`Couldn't find the default account group for userId: ${userId}`);
            }
            return account_group;
        });
        this.repository = repository;
    }
}
exports.PortfolioSummaryService = PortfolioSummaryService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGZvbGlvLXN1bW1hcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwb3J0Zm9saW8tc3VtbWFyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBZ0Q7QUFDaEQsaUNBQStCO0FBYy9CLE1BQWEsdUJBQXVCO0lBR2hDLFlBQVksVUFBOEI7UUFJMUMsNEJBQXVCLEdBQUcsQ0FBTyxRQUE4QixFQUFFLE1BQStDLEVBQStCLEVBQUU7O1lBQzdJLElBQUksWUFBWSxHQUFrRSxFQUFFLENBQUM7WUFFckYsWUFBWSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBRTFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7b0JBQzdELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7aUJBRTNGO3FCQUFNO29CQUNILElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDeEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUNoQztnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVqQixZQUFZLENBQUMsSUFBSSxDQUFDLENB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