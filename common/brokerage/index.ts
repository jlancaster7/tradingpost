import {IDatabase, IMain} from "pg-promise";
import {DateTime} from "luxon";
import Repository from "./repository";
import BrokerageService from "./service";
import FinicityService from "./finicity"
import Finicity from "../finicity";
import FinicityTransformer from "./finicity/transformer";
import {PortfolioSummaryService} from "./portfolio-summary";
import {
    HistoricalHoldings, 
    TradingPostAccountGroupStats,
    AccountGroupHPRsTable
} from './interfaces';

export default class Brokerage extends BrokerageService {
    constructor(pgClient: IDatabase<any>, pgp: IMain, finicity: Finicity) {
        const repo = new Repository(pgClient, pgp)
        const portSummary = new PortfolioSummaryService(repo);
        const brokerageMap = {
            "finicity": new FinicityService(finicity, repo, new FinicityTransformer(repo))
        }
        super(brokerageMap, repo, portSummary)
    }
}

export async function getUserHoldings(userId: string, pgClient: IDatabase<any>, pgp: IMain): Promise<HistoricalHoldings[]> {
    const repo = new Repository(pgClient, pgp);
    const portSummary = new PortfolioSummaryService(repo);
    const holdings = await portSummary.getCurrentHoldings(userId);
    return holdings;
}

export async function getUserAccountGroupSummary(userId: string, pgClient: IDatabase<any>, pgp: IMain): Promise<TradingPostAccountGroupStats> {
    const repo = new Repository(pgClient, pgp);
    const portSummary = new PortfolioSummaryService(repo);
    const summary = await portSummary.getSummary(userId);
    return summary;
}
export async function getUserReturns (userId: string, startDate: DateTime, endDate: DateTime = DateTime.now(), pgClient: IDatabase<any>, pgp: IMain): Promise<AccountGroupHPRsTable[]> {
    const repo = new Repository(pgClient, pgp);
    const portSummary = new PortfolioSummaryService(repo);
    const returns = await portSummary.getReturns(userId, startDate, endDate);
    return returns;
}