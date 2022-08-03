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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGZvbGlvLXN1bW1hcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwb3J0Zm9saW8tc3VtbWFyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxtQ0FBZ0Q7QUFDaEQsaUNBQStCO0FBVS9CLE1BQWEsdUJBQXVCO0lBR2hDLFlBQVksVUFBOEI7UUFJMUMsNEJBQXVCLEdBQUcsQ0FBTyxRQUE4QixFQUErQixFQUFFO1lBQzVGLElBQUksWUFBWSxHQUFrRSxFQUFFLENBQUM7WUFFckYsWUFBWSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBRTFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7b0JBQzdELEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7aUJBRTNGO3FCQUFNO29CQUNILElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDeEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUNoQztnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVqQiw0RUFBNEU7WUFFNUUsWUFBWSxDQUFDLElBQUksQ0FBQyxD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