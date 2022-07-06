import { IDatabase, IMain } from 'pg-promise';
import {DateTime} from "luxon";


export class SummaryRepository implements SRepository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }
    
    getAccountGroups = async (userId: string): Promise<AccountGroup[]> => {
        const query = `SELECT user_id
                              name
                              account_group_id
                       FROM TradingPostAccountGroupTable
                       WHERE user_id = $1`;
        
        const response = await this.db.any(query, [userId]);
        if (!response || response.length <=0) return [];

        let accountGroups: AccountGroup[] = []; 

        for (let d of response) {
            accountGroups.push({
                userId: d.user_id,
                name: d.name,
                accountGroupId: d.account_group_id
            })
        }

        return accountGroups;
    }

    getTradingPostHoldings = async (userId: string, accountGroupId: string, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<AccountGroupHistoricalHoldings> => {
        let query = `SELECT ag.account_group_id AS account_group_id
                            ht.security_id AS security_id
                            AVERAGE(ht.price) AS price
                            SUM(ht.value) AS value
                            SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity) AS cost_basis
                            SUM(ht.quantity) AS quantity
                            ht.date AS date
                     FROM TradingPostHistoricalHoldingsTable ht
                     INNER JOIN TradingPostAccountGroupTable ag
                     ON     ht.account_id = ag.account_id
                     WHERE ag.account_group_id = $1 AND ht.date BETWEEN $2 AND $3
                     GROUP BY ag.id, ht.security_id, ht.date`;
        
        const response = await this.db.any(query, [accountGroupId, startDate, endDate]);

        if (!response || response.length <=0) return {accountGroupId: '', historicalHoldings: []};
        let holdings: HistoricalHoldings[] = [];
        
        for (let d of response) {
            holdings.push({
                securityId: d.security_id,
                price: d.price,
                value: d.value,
                costBasis: d.cost_basis,
                quantity: d.quantity,
                date: d.date
            })
        }

        return {accountGroupId: accountGroupId, historicalHoldings: holdings};
    }

    addTradingPostReturns = async (userId: string, accountGroupId: string, returns: HoldingPeriodReturns): Promise<number> => {
        return 0;
    }

    getTradingPostReturns = async (userId: string, accountGroupId: string, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<AccountGroupHoldingPeriodReturns> => {
        let query = `SELECT account_group_id
                            date
                            return
                     FROM AccountGroupHoldingPeriodReturnTable 
                     WHERE account_group_id = $1 
                     AND date BETWEEN $2 AND $3`;
        const response = await this.db.any(query, [accountGroupId, startDate, endDate]);

        if (!response || response.length <= 0) return {accountGroupId: '', holdingPeriodReturns: []};
        let holdingPeriodReturns: HoldingPeriodReturns[] = []
        for (let d of response) {
            holdingPeriodReturns.push({
                date: d.date,
                return: d.return
            })
        }
        return {accountGroupId: accountGroupId, holdingPeriodReturns: holdingPeriodReturns};
    }

    addTradingPostPortfolioSummary = async (userId: string, accountGroupId: string, portfolioSummary: PortfolioSummary): Promise<number> => {
        return 0;
    }


}

export default class PortfolioSummaryService {
    private repository: SRepository

    constructor (repository: SRepository) {
        this.repository = repository;
    }

    // computeReturns have a default where it computes returns for all available account groups for a user
    // but then give the option to only compute returns for a single account group and return those. 

    // computeAccountGroupSummary
}

export interface SRepository {
    getAccountGroups(userId: string): Promise<AccountGroup[]>

    getTradingPostHoldings (userId: string, accountGroupId: string, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHistoricalHoldings>

    addTradingPostReturns (userId: string, accountGroupId: string, returns: HoldingPeriodReturns): Promise<number>

    getTradingPostReturns (userId: string, accountGroupId: string, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHoldingPeriodReturns>

    addTradingPostPortfolioSummary (userId: string, accountGroupId: string, portfolioSummary: PortfolioSummary): Promise<number>
}

export interface AccountGroupHistoricalHoldings {
    accountGroupId: string,
    historicalHoldings: HistoricalHoldings[]
}

export interface HistoricalHoldings {
    securityId: string
    price: number
    value: number
    costBasis: number
    quantity: number
    date: DateTime
}

export interface AccountGroup {
    userId: string
    name: string
    accountGroupId: string
}

export interface PortfolioSummary { 
    accountGroupId: string,
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

export interface HoldingPeriodReturns {
    date: DateTime,
    return: number
}

export interface AccountGroupHoldingPeriodReturns {
    accountGroupId: string,
    holdingPeriodReturns: HoldingPeriodReturns[]
}
export interface SecurityHoldingPeriodReturns {
    securityId: string,
    holdingPeriodReturns: HoldingPeriodReturns[]
}