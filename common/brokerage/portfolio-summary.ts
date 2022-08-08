import {abs, mean, std, variance} from 'mathjs';
import {DateTime} from "luxon";
import {
    AccountGroupHPRs,
    HistoricalHoldings, ISummaryRepository, ISummaryService,
    SecurityHPRs,
    TradingPostAccountGroupStats,
    TradingPostExposure,
    TradingPostSectorAllocations,
    TradingPostAccountGroups,
    AccountGroupHPRsTable
} from './interfaces';

export class PortfolioSummaryService implements ISummaryService {
    private repository: ISummaryRepository

    constructor(repository: ISummaryRepository) {
        this.repository = repository;
    }

    computeAccountGroupHPRs = async (holdings: HistoricalHoldings[]): Promise<AccountGroupHPRs[]> => {
        let dailyAmounts: { accountGroupId?: number, date: DateTime, amount: number }[] = [];

        dailyAmounts = holdings.reduce((res, value) => {

            if (!res.some(el => el.date.valueOf() === value.date.valueOf())) {
                res.push({accountGroupId: value.accountGroupId, date: value.date, amount: value.value});

            } else {
                let i = res.findIndex(el => el.date.valueOf() === value.date.valueOf());
                res[i].amount += value.value;
            }
            return res;
        }, dailyAmounts);

        // will need some logic here to account for cash transfers from transactions

        dailyAmounts.sort((a, b) => {
            return a.date.valueOf() - b.date.valueOf();
        });

        let returns: AccountGroupHPRs[] = [];

        for (let i = 1; i < dailyAmounts.length; i++) {
            if (!dailyAmounts[i].accountGroupId) {
                dailyAmounts[i].accountGroupId = 0
            }
            returns.push({
                // @ts-ignore
                accountGroupId: dailyAmounts[i].accountGroupId,
                date: dailyAmounts[i].date,
                return: (dailyAmounts[i].amount - dailyAmounts[i - 1].amount) / dailyAmounts[i - 1].amount
            })
        }
        return returns;
    }

    addAccountGroupHPRs = async (accountGroupHPRs: AccountGroupHPRs[]): Promise<number> => {
        return await this.repository.addAccountGroupReturns(accountGroupHPRs);
    }

    computeSecurityHPRs = async (securityId: number, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<SecurityHPRs[]> => {
        let securityPrices = await this.repository.getDailySecurityPrices(securityId, startDate, endDate);
        if (!securityPrices || securityPrices.length <= 0) return [];

        let returns: SecurityHPRs[] = []
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
    }

    addBenchmarkHPRs = async (benchmarkHPRs: SecurityHPRs[]): Promise<number> => {
        return await this.repository.addBenchmarkReturns(benchmarkHPRs);
    }

    computeSecurityBeta = async (securityId: number, benchmarkId: number, daysPrior: number = 365 * 5): Promise<number> => {
        let securityReturns = (await this.computeSecurityHPRs(securityId, DateTime.now().minus(daysPrior * 8.64e+7)));
        let benchmarkReturns = (await this.computeSecurityHPRs(benchmarkId, DateTime.now().minus(daysPrior * 8.64e+7)));

        function computeCovariance(arr1: number[], arr2: number[], n: number): number {
            let sum = 0;
            let mean_arr1 = mean(arr1);
            let mean_arr2 = mean(arr2);

            for (let i = 0; i < n; i++) {
                sum += (arr1[i] - mean_arr1) * (arr2[i] - mean_arr2);

            }
            return sum / (n - 1);
        }

        function checkDates(arr1: SecurityHPRs[], arr2: SecurityHPRs[]) {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i].date.valueOf() !== arr2[i].date.valueOf()) {
                    console.log('date mismatch, see the below:')
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
            return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / variance(benchmarkHPRs);
        } else if (securityReturns.length < benchmarkReturns.length) {

            benchmarkReturns = benchmarkReturns.slice(benchmarkReturns.length - securityReturns.length, benchmarkReturns.length);
            const dateCheck = checkDates(securityReturns, benchmarkReturns);
            if (dateCheck === 1) {
                return 0;
            }
            let securityHPRs = securityReturns.map(a => a.return);
            let benchmarkHPRs = benchmarkReturns.map(a => a.return);
            // @ts-ignore
            return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / variance(benchmarkHPRs);

        } else {
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
        return computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / variance(benchmarkHPRs);
    }

    computeAccountGroupBeta = async (holdings: HistoricalHoldings[], benchmarkId: number, daysPrior: number = 365 * 5): Promise<number> => {
        let beta = [];
        let sum = 0;
        for (let d of holdings) {
            beta.push([await this.computeSecurityBeta(d.securityId, benchmarkId, daysPrior), d.value]);
            sum += d.value;
        }
        let weighted_beta = 0;
        for (let d of beta) {
            weighted_beta += d[0] * (d[1] / sum);
        }

        return weighted_beta;
    }

    computeSharpe = (holdingsReturns: AccountGroupHPRs[]): number => {
        const returns = holdingsReturns.map(a => a.return);
        const meanReturn = mean(returns);
        const stdReturn = std(returns);
        // @ts-ignore
        return meanReturn / stdReturn;
    }

    computeSectorAllocations = async (holdings: HistoricalHoldings[]): Promise<TradingPostSectorAllocations[]> => {
        let securityIds: number[] = holdings.map(a => a.securityId);
        let securities = await this.repository.getSecurities(securityIds);
        let sectorAllocations: TradingPostSectorAllocations[] = [];

        const portfolioSum = holdings.reduce((res, value) => {
            return res + value.value;
        }, 0)

        let sector: string;
        let i: number;
        for (let d of holdings) {
            let secInfo = securities.find(a => a.id === d.securityId);
            if (!secInfo) {
                sector = 'n/a';
            } else {
                sector = secInfo.sector;
            }
            i = sectorAllocations.findIndex(a => a.sector === sector);
            if (i === -1) {
                sectorAllocations.push({
                    sector: sector,
                    value: d.value / portfolioSum
                });
            } else {
                sectorAllocations[i].value += d.value / portfolioSum;
            }
        }
        return sectorAllocations;
    }

    computeExposure = (holdings: HistoricalHoldings[]): TradingPostExposure => {
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
            gross += abs(d.value);
            net += d.value;
            if (d.value > 0) {
                long += d.value;
            }
            if (d.value < 0) {
                short += d.value;
            }
        }
        return {long: long / total, short: short / total, gross: gross / total, net: net / total};
    }

    computeAccountGroupSummary = async (userId: string, startDate: DateTime = DateTime.fromJSDate(new Date('1/1/2010')), endDate: DateTime = DateTime.now()): Promise<TradingPostAccountGroupStats> => {
        const account_group = await this.getAccountGroupByName(userId, 'default');

        const currentHoldings = await this.repository.getTradingPostCurrentHoldingsByAccountGroup(account_group.accountGroupId);

        const historicalHoldings = await this.repository.getTradingPostHoldingsByAccountGroup(userId, account_group.accountGroupId, startDate, endDate);

        const returns = await this.computeAccountGroupHPRs(historicalHoldings);

        await this.addAccountGroupHPRs(returns);

        const beta = await this.computeAccountGroupBeta(currentHoldings, account_group.defaultBenchmarkId);

        const sharpe = this.computeSharpe(returns);

        const allocations = await this.computeSectorAllocations(currentHoldings);

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
    }

    getCurrentHoldings = async (userId: string): Promise<HistoricalHoldings[]> => {
        const account_group = await this.getAccountGroupByName(userId, 'default');
        return await this.repository.getTradingPostCurrentHoldingsByAccountGroup(account_group.accountGroupId)
    }

    getReturns = async (userId: string, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]> => {
        const account_group = await this.getAccountGroupByName(userId, 'default');
        return await this.repository.getTradingPostAccountGroupReturns(account_group.accountGroupId, startDate, endDate)
    }

    getSummary = async (userId: string): Promise<TradingPostAccountGroupStats> => {
        const account_group = await this.getAccountGroupByName(userId, 'default');
        return await this.repository.getAccountGroupSummary(account_group.accountGroupId)
    }

    getAccountGroupByName = async (userId: string, accountGroupName: string): Promise<TradingPostAccountGroups> => {
        const account_group = (await this.repository.getTradingPostAccountGroups(userId)).find(a => a.name === accountGroupName);
        if (!account_group) {
            throw new Error(`Couldn't find the default account group for userId: ${userId}`);
        }
        return account_group;
    }
}
