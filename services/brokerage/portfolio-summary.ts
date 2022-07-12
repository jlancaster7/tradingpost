import { IDatabase, IMain } from 'pg-promise';
import math, { variance, mean} from 'mathjs';
import { DateTime } from "luxon";
import format from 'pg-format';
import { TradingPostExposure, TradingPostSectorAllocations, SecurityPrices, TradingPostAccountGroupStats, TradingPostAccountGroups, TradingPostAccountGroupsTable, TradingPostAccounts, TradingPostAccountsTable, AccountGroupHPRs,AccountGroupHPRsTable, SecurityHPRs, HistoricalHoldings } from './interfaces';
import { getSecurityBySymbol } from '../market-data/interfaces';

export class SummaryRepository implements IRepository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    getAccounts = async (userId: string): Promise<TradingPostAccountsTable[]> => {
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
        const response = await this.db.any(query,[userId]);
        if (!response || response.length <= 0) return [];
        let accounts: TradingPostAccountsTable[] = [];
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
            })
        }
        return accounts;
    }
    
    getAccountGroups = async (userId: string): Promise<TradingPostAccountGroups[]> => {
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
        const response = await this.db.any(query, [userId]);
        if (!response || response.length <=0) return [];

        let accountGroups: TradingPostAccountGroups[] = []; 

        for (let d of response) {
            accountGroups.push({
                account_group_id: parseInt(d.account_group_id),
                account_id: parseInt(d.account_id),
                user_id: d.user_id,
                name: d.name,
                default_benchmark_id: parseInt(d.default_benchmark_id),

            })
        }
        return accountGroups;
    }

    getTradingPostHoldingsByAccount = async (userId: string, account_id: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]> => {
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

        const response = await this.db.any(query, [account_id, startDate, endDate]);
        if (!response || response.length <=0) return [];
        let holdings: HistoricalHoldings[] = [];
        
        for (let d of response) {
            holdings.push({
                account_id: d.account_id,
                security_id: parseInt(d.security_id),
                price: parseFloat(d.price),
                value: parseFloat(d.value),
                costBasis: parseFloat(d.cost_basis),
                quantity: parseFloat(d.quantity),
                date: d.date
            })
        }

        return holdings;
    }

    getTradingPostHoldingsByAccountGroup = async (userId: string, account_group_id: number, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<HistoricalHoldings[]> => {
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
        const response = await this.db.any(query, [account_group_id, startDate, endDate]);
        
        if (!response || response.length <=0 ) return [];
        let holdings: HistoricalHoldings[] = [];
        
        for (let d of response) {
            holdings.push({
                account_group_id: parseInt(d.account_group_id),
                security_id: parseInt(d.security_id),
                price: parseFloat(d.price),
                value: parseFloat(d.value),
                costBasis: parseFloat(d.cost_basis),
                quantity: parseFloat(d.quantity),
                date: d.date
            })
        }

        return holdings;
    }

    getTradingPostCurrnetHoldingsByAccountGroup = async (account_group_id: number): Promise<HistoricalHoldings[]> => {
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
        const response = await this.db.any(query, [account_group_id]);

        if(!response || response.length <= 0) return [];

        let holdings: HistoricalHoldings[]= [];

        for (let d of response) {
            holdings.push({
                account_group_id: parseInt(d.account_group_id),
                security_id: parseInt(d.security_id),
                price: parseFloat(d.price),
                value: parseFloat(d.value),
                costBasis: parseFloat(d.cost_basis),
                quantity: parseFloat(d.quantity),
                date: d.updated_at
            })
        }

        return holdings;
        
    }

    getTradingPostAcountGroupReturns = async (userId: string, account_group_id: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]> => {
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
        const response = await this.db.any(query, [account_group_id, startDate, endDate]);

        if (!response || response.length <= 0) return [];
        let holdingPeriodReturns: AccountGroupHPRsTable[] = []
        for (let d of response) {
            holdingPeriodReturns.push({
                id: parseInt(d.id),
                account_group_id: parseInt(d.account_group_id),
                date: d.date,
                return: parseFloat(d.return),
                created_at: d.created_at,
                updated_at: d.updated_at
            })
        }
        return holdingPeriodReturns;
    }
    getDailySecurityPrices = async (security_id: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]> => {

        let query = `SELECT id,
                            security_id,
                            price,
                            time,
                            created_at
                     FROM security_prices
                     WHERE security_id = $1
                     AND time BETWEEN $2 AND $3 AND (time at time zone 'America/New_York')::time = '16:00:00'
                     `;
        const response = await this.db.any(query, [security_id, startDate, endDate]);

        if (!response || response.length <= 0) { return [];}
        let prices: SecurityPrices[] = [];
        
        for (let d of response) {
            prices.push({
                security_id: parseInt(d.security_id),
                price: parseFloat(d.price),
                date: d.time
            });
        }
        return prices;
    }

    getSecurities = async (security_ids: number[]): Promise<getSecurityBySymbol[]> => {
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
        const response = await this.db.any(format(query, security_ids))
            .catch((error) => {
                console.log(error);
                return '';
            });
        if (!response || response.length <= 0) {return []; }
        let sec: getSecurityBySymbol[] = []
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
            })
        }
        return sec;
    }

    addNewAccountGroup = async (userId: string, name: string, account_ids: number[], default_benchmark_id: number): Promise<number> => {
        
        let query = `INSERT INTO tradingpost_account_groups(user_id, name, default_benchmark_id)
                     VALUES ($1, $2, $3)
                     RETURNING id;
                     `;
        let account_group_id = await this.db.any(query, [userId, name, default_benchmark_id])
            .catch(error =>{
                console.log(error);
                return null;
            });

        if (!account_group_id) { return 0; } else { account_group_id = account_group_id[0].id };
        
        
        query = `INSERT INTO _tradingpost_account_to_group(account_id, account_group_id)
                 VALUES %L
                 `;
        let values = [];
        for (let d of account_ids) {
            values.push([d, account_group_id]);
        }
        
        let result = await this.db.any(format(query,values))
            .catch(error => {
                console.log(error);
                return null;
            });
        if (!result) return 0;
        
        return 1;
    }

    addTradingPostReturns = async (accountGroupReturns: AccountGroupHPRs[]): Promise<number> => {
            
        let values = [];
        for (let i = 0; i < accountGroupReturns.length; i++) {
            let x: any = accountGroupReturns[i]
            x.date = x.date.toString();
            values.push(Object.values(x));
        }
        
        let query = `INSERT INTO account_group_hprs (account_group_id, date, return)
                     VALUES %L
                     `; // need to add an 'on conflict statement when account_group_id and date, update return
        let result = 2;
        await this.db.any(format(query, values))
            .then(() => {
                result = 1;
            })
            .catch(error => {
                console.log(error);
                result = 0;
            })
        return result;
    }

    addBenchmarkReturns = async (benchmarkReturns: SecurityHPRs[]): Promise<number> => {
        let values = [];
        for (let d of benchmarkReturns) {
            values.push(Object.values(d));
        }
        let query = `INSERT INTO  benchmark_hprs(security_id, date, return)
                     VALUES %L
                     `;
        let result = 2;
        await this.db.any(format(query, values))
            .then(() => {
                result = 1;
            })
            .catch(error => {
                console.log(error);
                result = 0;
            })
        return result;
}

    addTradingPostPortfolioSummary = async (userId: string, account_group_id: number, accountGroupSummary: TradingPostAccountGroupStats): Promise<number> => {
        let query = `INSERT INTO tradingpost_account_group_stats 
                     VALUES $1
                     `;
        let result = 2;
        const response = await this.db.any(query, [accountGroupSummary])
            .then(() => {
                result = 1;
            })
            .catch(error => {
                console.log(error);
                result = 0;
            })
        return result;
    }
}

export class PortfolioSummaryService implements ISummaryService {
    private repository: IRepository

    constructor (repository: IRepository) {
        this.repository = repository;
    }

    computeAccountGroupHPRs = async (account_group_id: number, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<AccountGroupHPRs[]> => {

        let holdings: HistoricalHoldings[] = await this.repository.getTradingPostHoldingsByAccountGroup('', account_group_id, startDate, endDate);

        let dailyAmounts: {account_group_id?: number, date: DateTime, amount: number}[] = [];
        
        dailyAmounts = holdings.reduce((res, value) => {
            
            if (!res.some(el => el.date.valueOf() === value.date.valueOf())) {
                res.push({account_group_id: value.account_group_id, date: value.date, amount: value.value});
                
            } else {
                let i = res.findIndex(el => el.date.valueOf() === value.date.valueOf());
                res[i].amount += value.value;
            }
            return res;
        }, dailyAmounts);
        
        // will need some logic here to account for cash transfers from transactions

        dailyAmounts.sort((a, b) => { return a.date.valueOf() - b.date.valueOf(); });
        
        let returns: AccountGroupHPRs[] = [];
        
        
        for (let i = 1; i < dailyAmounts.length; i++) {
            if (!dailyAmounts[i].account_group_id) { dailyAmounts[i].account_group_id = 0} 
            returns.push({
                // @ts-ignore
                account_group_id: dailyAmounts[i].account_group_id,
                date: dailyAmounts[i].date,  
                return: (dailyAmounts[i].amount - dailyAmounts[i - 1].amount) / dailyAmounts[i - 1].amount})
        }
        
        return returns;
    }

    addAccountGroupHPRs = async (accountGroupHPRs: AccountGroupHPRs[]): Promise<number> => {
        const response = await this.repository.addTradingPostReturns(accountGroupHPRs);
        return response;
    }

    computeSecurityHPRs = async (security_id: number, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<SecurityHPRs[]> => {
        let securityPrices = await this.repository.getDailySecurityPrices(security_id, startDate, endDate);
        if (!securityPrices || securityPrices.length <= 0) return [];

        let returns: SecurityHPRs[] = []
        for (let i = 1; i < securityPrices.length; i++) {
            returns.push({
                security_id: securityPrices[i].security_id,
                date: securityPrices[i].date,
                return: (securityPrices[i].price - securityPrices[i - 1].price) / securityPrices[i - 1].price
            });
         }
        returns.sort((a, b) => { return a.date.valueOf() - b.date.valueOf(); });
        
        return returns;
    }
    
    addBenchmarkHPRs = async (benchmarkHPRs: SecurityHPRs[]): Promise <number> => {
        const response = await this.repository.addBenchmarkReturns(benchmarkHPRs);
        return response; 
    }

    computeSecurityBeta = async (security_id: number, benchmark_id: number, daysPrior: number = 365 * 5): Promise<number> => {
        let securityReturns = (await this.computeSecurityHPRs(security_id, DateTime.now().minus(daysPrior * 8.64e+7)));
        let benchmarkReturns = (await this.computeSecurityHPRs(benchmark_id, DateTime.now().minus(daysPrior * 8.64e+7)));
        
        function checkDates(arr1: SecurityHPRs[], arr2: SecurityHPRs[]) {
            for (let i = 0; i < arr1.length; i++) {
                if(arr1[i].date.valueOf() !== arr2[i].date.valueOf()) {
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
            let securityHPRs = securityReturns.map(a =>a.return);
            let benchmarkHPRs = benchmarkReturns.map(a => a.return);

            // @ts-ignore
            return this.computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / variance(benchmarkHPRs);
        } else if (securityReturns.length < benchmarkReturns.length) {

            benchmarkReturns = benchmarkReturns.slice(benchmarkReturns.length - securityReturns.length, benchmarkReturns.length);
            const dateCheck = checkDates(securityReturns, benchmarkReturns); 
            if (dateCheck === 1) {
                return 0;
            }
            let securityHPRs = securityReturns.map(a =>a.return);
            let benchmarkHPRs = benchmarkReturns.map(a => a.return);

            // @ts-ignore
            return this.computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / variance(benchmarkHPRs);

        } else {
            for (let i = 0; i < benchmarkReturns.length; i++) {
                const dateCheck = checkDates(securityReturns, benchmarkReturns); 
                if (dateCheck === 1) {
                    return 0;
                } }
            }
            let securityHPRs = securityReturns.map(a =>a.return);
            let benchmarkHPRs = benchmarkReturns.map(a => a.return);
            // @ts-ignore
            return this.computeCovariance(securityHPRs, benchmarkHPRs, benchmarkHPRs.length) / variance(benchmarkHPRs);
        }
    

    computeAccountGroupBeta = async (account_group_id: number, benchmark_id: number, daysPrior: number = 365 * 5): Promise<number> => {
        
        const holdings: HistoricalHoldings[] = await this.repository.getTradingPostCurrnetHoldingsByAccountGroup(account_group_id);
        
        let beta = [];
        let sum = 0;
        for (let d of holdings) {
            beta.push([await this.computeSecurityBeta(d.security_id, benchmark_id, daysPrior), d.value]);
            sum += d.value;
        }
        let weighted_beta = 0;
        for (let d of beta) {
            weighted_beta += d[0] * (d[1] / sum);
        }
        
        return weighted_beta;
    }
    
    computeCovariance = (arr1: number[], arr2: number[], n: number): number => {
        let sum = 0;
        let mean_arr1 = mean(arr1);
        let mean_arr2 = mean(arr2);

        for (let i = 0; i < n; i++) {
            sum += (arr1[i] - mean_arr1) * (arr2[i] - mean_arr2);
            
        }
        return sum / (n - 1);
    }

    computeSharpe = (stockHPRs: SecurityHPRs): number => {
        
        return 0;
    }
    
    computeSectorAllocations = async (holdings: HistoricalHoldings[]): Promise<TradingPostSectorAllocations[]> => {
        
        let security_ids: number[] = holdings.map(a => a.security_id); 
        let securities = await this.repository.getSecurities(security_ids);
        let sectorAllocations: TradingPostSectorAllocations[] = [];

        const portfolioSum = holdings.reduce((res, value) => {
            return res + value.value;
        }, 0)

        let sector: string; let i: number;
        for (let d of holdings) {
            let secInfo = securities.find(a => a.id === d.security_id);
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
                })
            } else {
                sectorAllocations[i].value += d.value / portfolioSum;
            }
        }

        return sectorAllocations;
    }

    computeExposure = (holdings: HistoricalHoldings[]): TradingPostExposure => {
        let long = 0; let short = 0;
        let gross = 0; let net = 0;
        let total = 0;
        for (let d of holdings) {
            total += d.value;
            if (d.security_id === 26830) { // cash 
                continue;
            }
            gross += math.abs(d.value);
            net += d.value;
            if (d.value > 0) { long += d.value; }
            if (d.value < 0) { short += d.value; }   
        }
        return {long: long / total, short: short / total, gross: gross / total, net: net / total};
    }

    computeAccountGroupSummary = async (userId: string, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<TradingPostAccountGroupStats | null> => {
        
        const account_group = (await this.repository.getAccountGroups(userId)).find(a => a.name === 'default');
        if (!account_group) {return null;}
    
        const holdings = await this.repository.getTradingPostCurrnetHoldingsByAccountGroup(account_group.account_group_id);
        
        const beta = await this.computeAccountGroupBeta(account_group.account_group_id, account_group.default_benchmark_id);

        const allocations = await this.computeSectorAllocations(holdings);

        const exposure = this.computeExposure(holdings);

        let stats: TradingPostAccountGroupStats = {
            account_group_id: account_group.account_group_id,
            beta: beta,
            sharpe: 0,
            industry_allocation: allocations,
            exposure: exposure,
            date: DateTime.now(),
            benchmark_id: account_group.default_benchmark_id
        }

        return stats;
    }
}

export interface IRepository {
    getAccounts(userId: string): Promise<TradingPostAccountsTable[]>

    getAccountGroups(userId: string): Promise<TradingPostAccountGroups[]>

    getTradingPostHoldingsByAccount (userId: string, account_id: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>
    
    getTradingPostHoldingsByAccountGroup (userId: string, account_group_id: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>

    getTradingPostCurrnetHoldingsByAccountGroup (account_group_id: number): Promise<HistoricalHoldings[]>

    getTradingPostAcountGroupReturns (userId: string, account_group_id: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]>

    getDailySecurityPrices (security_id: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]>

    getSecurities (security_ids: number[]): Promise<getSecurityBySymbol[]>

    addNewAccountGroup (userId: string, name: string, account_ids: number[], default_benchmark_id: number): Promise<number>

    addTradingPostReturns (accountGroupReturns: AccountGroupHPRs[]): Promise<number>

    addBenchmarkReturns (benchmarkReturns: SecurityHPRs[]): Promise<number>

    addTradingPostPortfolioSummary (userId: string, account_group_id: number, accountGroupSummary: TradingPostAccountGroupStats): Promise<number>
}

export interface ISummaryService {
    computeAccountGroupHPRs (account_group_id: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRs[]>

    updateAccountGroupHPRs (account_group_id: number): Promise<number>

    addAccountGroupHPRs  (accountGroupHPRs: AccountGroupHPRs[]): Promise<number>

    computeSecurityHPRs (security_id: number, startDate: DateTime, endDate: DateTime): Promise<SecurityHPRs[]>

    addBenchmarkHPRs (benchmarkHPRs: SecurityHPRs[]): Promise <number>

    computeSecurityBeta (security_id: number, benchmark_id: number, daysPrior: number): Promise<number>

    computeAccountGroupBeta (account_group_id: number, daysPrior: number): Promise<number>

    computeCovariance (arr1: number[], arr2: number[], n: number): number

    computeSharpe (stockHPRs: SecurityHPRs): number

    computeSectorAllocations (holdings: HistoricalHoldings[]): Promise<TradingPostSectorAllocations[]>

    computeAccountGroupSummary (account_group_id: string, startDate: DateTime, endDate: DateTime): Promise<TradingPostAccountGroupStats | null>

    addUsersAccountGroupSummaries (userId: string): Promise<number>
}
