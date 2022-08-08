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

    getUserHoldings = async (tpUserId: string): Promise<HistoricalHoldings[]> => {
        return await this.portfolioSummaryService.getCurrentHoldings(tpUserId);
    }

    getUserAccountGroupSummary = async (tpUserId: string): Promise<TradingPostAccountGroupStats> => {
        return await this.portfolioSummaryService.getSummary(tpUserId);
    }

    getUserReturns = async (tpUserId: string, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<AccountGroupHPRsTable[]> => {
        return await this.portfolioSummaryService.getReturns(tpUserId, startDate, endDate);
    }

    addNewAccounts = async (brokerageUserId: string, brokerageId: string, accountIds?: string[]) => {
        const brokerage = this.brokerageMap[brokerageId];
        const tradingPostUser = await brokerage.getTradingPostUserAssociatedWithBrokerageUser(brokerageUserId);

        const accounts = await brokerage.importAccounts(brokerageUserId);
        await this.repository.upsertTradingPostBrokerageAccounts(accounts)

        const holdings = await brokerage.importHoldings(brokerageUserId);
        await this.repository.upsertTradingPostCurrentHoldings(holdings);

        const transactions = await brokerage.importTransactions(brokerageUserId);
        await this.repository.upsertTradingPostTransactions(transactions);

        const start = DateTime.now().setZone("America/New_York");
        const end = start.minus({month: 24})

        const tpAccounts = await this.repository.getTradingPostBrokerageAccounts(tradingPostUser.id);
        for (let i = 0; i < tpAccounts.length; i++) {
            const account = tpAccounts[i];
            const holdingHistory = await this.computeHoldingsHistory(account.id, start, end);
            await this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
        }

        const tpAccountIds = tpAccounts.map(tp => tp.id)
        await this.repository.addTradingPostAccountGroup(tradingPostUser.id, 'default', tpAccountIds, 10117)
        await this.portfolioSummaryService.computeAccountGroupSummary(tradingPostUser.id)
    }

    addNewTransactions = async (userId: string, brokerageId: string, accountIds?: string[]) => {
    }

    removeAccounts = async (brokerageCustomerId: string, accountIds: string[], brokerageId: string) => {
        const brokerage = this.brokerageMap[brokerageId];
        const tpAccountIds = await brokerage.removeAccounts(brokerageCustomerId, accountIds)
        await this.repository.deleteTradingPostBrokerageTransactions(tpAccountIds)
        await this.repository.deleteTradingPostBrokerageHoldings(tpAccountIds)
        await this.repository.deleteTradingPostBrokerageAccounts(tpAccountIds)
        await this.repository.deleteTradingPostBrokerageHistoricalHoldings(tpAccountIds)
    }

    generateBrokerageAuthenticationLink = async (userId: string, brokerageId: string): Promise<string> => {
        const brokerage = this.brokerageMap[brokerageId];
        return await brokerage.generateBrokerageAuthenticationLink(userId);
    }
}