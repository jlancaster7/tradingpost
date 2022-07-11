import { IDatabase, IMain } from 'pg-promise';
import { DateTime } from "luxon";
import format from 'pg-format';
import { SecurityPrices, TradingPostAccountGroupStats, TradingPostAccountGroups, TradingPostAccountGroupsTable, TradingPostAccounts, TradingPostAccountsTable, AccountGroupHPRs,AccountGroupHPRsTable, SecurityHPRs, HistoricalHoldings } from './interfaces';


export class SummaryRepository implements SRepository {
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
    
    getAccountGroups = async (userId: string): Promise<TradingPostAccountGroupsTable[]> => {
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
        const response = await this.db.any(query, [userId]);
        if (!response || response.length <=0) return [];

        let accountGroups: TradingPostAccountGroupsTable[] = []; 

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
                account_group_id: null,
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

    getTradingPostHoldingsByAccountGroup = async (userId: string, account_group_id: string, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]> => {
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
        const response = await this.db.any(query, [account_group_id, startDate, endDate]);

        if (!response || response.length <=0) return [];
        let holdings: HistoricalHoldings[] = [];
        
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
            })
        }

        return holdings;
    }

    getTradingPostReturns = async (userId: string, account_group_id: string, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]> => {
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
                account_group_id: d.account_group_id,
                date: d.date,
                return: parseFloat(d.return),
                created_at: d.created_at,
                updated_at: d.updated_at
            })
        }
        return holdingPeriodReturns;
    }
    getSecurityPrices = async (security_id: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]> => {

        let query = `SELECT id,
                            security_id,
                            price,
                            time,
                            created_at
                     FROM security_prices
                     WHERE security_id = $1
                     AND time BETWEEN $2 AND $3
                     `;
        const response = await this.db.any(query, [security_id, startDate, endDate]);

        if (!response || response.length <= 0) { return [];}
        let prices: SecurityPrices[] = [];

        for (let d of response) {
            prices.push({
                security_id: d.security_id,
                price: d.price,
                date: d.time
            });
        }
        return prices;
    }

    addAccountGroup = async (userId: string, name: string, account_ids: number[], default_benchmark_id: number): Promise<number> => {
        let values = [];
        for (let i = 0; i < account_ids.length; i++) {
            values.push([userId, name, '1', account_ids[i], default_benchmark_id])
        }
        let query = `INSERT INTO tradingpost_account_groups(user_id, name, account_group_id, account_id, default_benchmark_id)
                     VALUES %L
                    `;
        let result = 2;
        await this.db.any(format(query, values))
            .then(() => {
                result = 1;
            })
            .catch(error =>{
                console.log(error);
                result = 0;
            });
        return result;
        
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

    addTradingPostPortfolioSummary = async (userId: string, account_group_id: string, portfolioSummary: PortfolioSummary): Promise<number> => {
        let query = `INSERT INTO tradingpost_account_group_stats 
                     VALUES $1
                    
                     `;

        const response = await this.db.any(query, [portfolioSummary]);

        console.log(response);

        return 0;
    }
}

export class PortfolioSummaryService {
    private repository: SRepository

    constructor (repository: SRepository) {
        this.repository = repository;
    }

    computeAccountGroupHPRs = (holdings: HistoricalHoldings[]): AccountGroupHPRs[] => {

        let dailyAmounts: {account_group_id: string, date: DateTime, amount: number}[] = [];
        
        dailyAmounts = holdings.reduce((res, value) => {
            if (!res.some(el => el.date === value.date)) {
                res.push({account_group_id: value.account_group_id, date: value.date, amount: 0});
                // dailyAmounts.push({date: value.date, amount: 0});
            } else {
                let i = res.findIndex(el => el.date === value.date);
                res[i].amount += value.value;

            }
            return res;
        }, dailyAmounts);

        // will need some logic here to account for cash transfers from transactions

        dailyAmounts.sort((a, b) => { return a.date.valueOf() - b.date.valueOf(); })
        let returns: AccountGroupHPRs[] = [];
        
        for (let i = 1; i < dailyAmounts.length; i++) {
            returns.push({
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
        
        let securityPrices = await this.repository.getSecurityPrices(security_id, startDate, endDate);
        let returns: SecurityHPRs[] = []

        for (let i = 1; securityPrices.length; i++) {
            returns.push({
                security_id: securityPrices[i].security_id,
                date: securityPrices[i].date,
                return: (securityPrices[i].price - securityPrices[i - 1].price) / securityPrices[i - 1].price
            });
         }
        return returns;
    }
    // computeReturns have a default where it computes returns for all available account groups for a user
    // but then give the option to only compute returns for a single account group and return those. 

    computeBeta = (stockHPRs: SecurityHPRs, benchmarkHPRs: SecurityHPRs): number => {
        
        return 0;
    }
    
    computeSharpe = (stockHPRs: SecurityHPRs): number => {
        
        return 0;
    }
    
    computeAllocationExposure = (): {[key: string]: number} => {
        
        return {};
    }

    computeAccountGroupSummary = async (userId: string, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<TradingPostAccountGroupStats> => {
        
        let stats: TradingPostAccountGroupStats = {
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
            date: DateTime.now(),
            benchmark_id: 0
        }

        return stats;
    }
}

export interface SRepository {
    getAccounts(userId: string): Promise<TradingPostAccountsTable[]>

    getAccountGroups(userId: string): Promise<TradingPostAccountGroupsTable[]>

    getTradingPostHoldingsByAccount (userId: string, account_id: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>
    
    getTradingPostHoldingsByAccountGroup (userId: string, account_group_id: string, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]>

    getTradingPostReturns (userId: string, account_group_id: string, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]>

    getSecurityPrices (security_id: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]>

    addAccountGroup(userId: string, name: string, account_ids: number[], default_benchmark_id: number): Promise<number>

    addTradingPostReturns (accountGroupReturns: AccountGroupHPRs[]): Promise<number>

    addTradingPostPortfolioSummary (userId: string, account_group_id: string, portfolioSummary: PortfolioSummary): Promise<number>
}


export interface PortfolioSummary { 
    account_group_id: string,
    beta: number,
    sharpe: number,
    industryAllocation: {[key: string]: number},
    exposure: {
        long: number,
        short: number,
        net: number,
        gross: number
    },
    date: DateTime,
    benchmark_id: number
}