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
    getUserHoldings = async(userId: string, pgClient: IDatabase<any>, pgp: IMain): Promise<HistoricalHoldings[]> => {
        //const repo = new Repository(pgClient, pgp);
        //const portSummary = new PortfolioSummaryService(repo);
        const holdings = await this.portfolioSummaryService.getCurrentHoldings(userId);
        return holdings;
    }
    getUserAccountGroupSummary = async (userId: string, pgClient: IDatabase<any>, pgp: IMain): Promise<TradingPostAccountGroupStats> => {

        const summary = await this.portfolioSummaryService.getSummary(userId);
        return summary;
    }
    getUserReturns = async (userId: string, startDate: DateTime, endDate: DateTime = DateTime.now(), pgClient: IDatabase<any>, pgp: IMain): Promise<AccountGroupHPRsTable[]> => {
        const repo = new Repository(pgClient, pgp);
        const portSummary = new PortfolioSummaryService(repo);
        const returns = await this.portfolioSummaryService.getReturns(userId, startDate, endDate);
        return returns;
    }
}