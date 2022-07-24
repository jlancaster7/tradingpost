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
        this.computeAccountGroupHPRs = (holdings) => __awaiter(this, void 0, void 0, function* () {
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
            // will need some logic here to account for cash transfers from transactions
            dailyAmounts.sort((a, b) => {
                return a.date.valueOf() - b.date.valueOf();
            });
            let returns = [];
            for (let i = 1; i < dailyAmounts.length; i++) {
                if (!dailyAmounts[i].accountGroupId) {
                    dailyAmounts[i].accountGroupId = 0;
                }
                returns.push({
                    // @ts-ignore
                    accountGroupId: dailyAmounts[i].accountGroupId,
                    date: dailyAmounts[i].date,
                    return: (dailyAmounts[i].amount - dailyAmounts[i - 1].amount) / dailyAmounts[i - 1].amount
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
                return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
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
                return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
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
            return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / (0, mathjs_1.variance)(benchmarkHPRs);
        });
        this.computeAccountGroupBeta = (holdings, benchmarkId, daysPrior = 365 * 5) => __awaiter(this, void 0, void 0, function* () {
            let beta = [];
            let sum = 0;
            for (let d of holdings) {
                beta.push([yield this.computeSecurityBeta(d.securityId, benchmarkId, daysPrior), d.value]);
                sum += d.value;
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
            let sector;
            let i;
            for (let d of holdings) {
                let secInfo = securities.find(a => a.id === d.securityId);
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
        this.computeAccountGroupSummary = (userId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            const account_group = (yield this.repository.getTradingPostAccountGroups(userId)).find(a => a.name === 'default');
            if (!account_group) {
                return null;
            }
            const currentHoldings = yield this.repository.getTradingPostCurrentHoldingsByAccountGroup(account_group.accountGroupId);
            const returns = yield this.repository.getTradingPostAccountGroupReturns(account_group.accountGroupId, startDate, endDate);
            const beta = yield this.computeAccountGroupBeta(currentHoldings, account_group.defaultBenchmarkId);
            const sharpe = this.computeSharpe(returns);
            const allocations = yield this.computeSectorAllocations(currentHoldings);
            const exposure = this.computeExposure(currentHoldings);
            return {
                accountGroupId: account_group.accountGroupId,
                beta: beta,
                sharpe: sharpe,
                industryAllocations: allocations,
                exposure: exposure,
                date: returns[returns.length - 1].date,
                benchmarkId: account_group.defaultBenchmarkId
            };
        });
        this.repository = repository;
    }
}
exports.PortfolioSummaryService = PortfolioSummaryService;
