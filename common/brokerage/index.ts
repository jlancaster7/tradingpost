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
    AccountGroupHPRsTable,
    TradingPostBrokerageAccountsTable,
    TradingPostHistoricalHoldings,
    IBrokerageService,
    IBrokerageRepository, TradingPostBrokerageAccounts
} from './interfaces';

const Default = (pgClient: IDatabase<any>, pgp: IMain, finicity: Finicity): [Record<string, IBrokerageService>, IBrokerageRepository, PortfolioSummaryService] => {
    const repo = new Repository(pgClient, pgp)
    const portSummary = new PortfolioSummaryService(repo);
    const brokerageMap = {
        "finicity": new FinicityService(finicity, repo, new FinicityTransformer(repo))
    }
    return [brokerageMap, repo, portSummary]
}

export default class Brokerage extends BrokerageService {
    constructor(pgClient: IDatabase<any>, pgp: IMain, finicity: Finicity) {
        super(...(Default(pgClient, pgp, finicity)))
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
        const currentAccounts = await this.repository.getTradingPostBrokerageAccounts(tradingPostUser.id)

        const accounts = await brokerage.importAccounts(brokerageUserId);
        await this.repository.upsertTradingPostBrokerageAccounts(accounts)

        const holdings = await brokerage.importHoldings(brokerageUserId);
        await this.repository.upsertTradingPostCurrentHoldings(holdings);

        const transactions = await brokerage.importTransactions(brokerageUserId);
        await this.repository.upsertTradingPostTransactions(transactions);

        // Takes old accounts avail
        // takes new accounts avail
        // Sees where missing and adds to array
        const newAccounts = await this.repository.getTradingPostBrokerageAccounts(tradingPostUser.id);
        let accountsToProcess: TradingPostBrokerageAccountsTable[] = [];

        newAccounts.forEach(newAcc => {
            let hasAccount = false
            currentAccounts.forEach((curAcc => {
                if (curAcc.institutionId === newAcc.institutionId && curAcc.accountNumber === newAcc.accountNumber) {
                    hasAccount = true
                    return
                }
            }));
            if (hasAccount) return
            accountsToProcess.push(newAcc)
        });

        for (let i = 0; i < accountsToProcess.length; i++) {
            const account = accountsToProcess[i];
            const oldestTransaction = await this.repository.getOldestTransaction(account.id);
            if (!oldestTransaction) continue
            const holdingHistory = await this.computeHoldingsHistory(account.id, oldestTransaction.date);
            await this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
        }

        const tpAccountIds = accountsToProcess.map(tp => tp.id)
        await this.repository.addTradingPostAccountGroup(tradingPostUser.id, 'default', tpAccountIds, 10117)
        await this.portfolioSummaryService.computeAccountGroupSummary(tradingPostUser.id)
    }

    pullNewTransactionsAndHoldings = async (brokerageId: string, brokerageUserId: string) => {
        const brokerage = this.brokerageMap[brokerageId];
        if (!brokerage) throw new Error("no brokerage found")

        const tradingPostUser = await brokerage.getTradingPostUserAssociatedWithBrokerageUser(brokerageUserId);
        // TODO: Instead of adding error codes at the holding level, we could write a function to pull accoutns
        //  and then return error response for those accounts there... this way we avoid throwing exceptions as well
        //  return accounts in multiple states and validate if its in an error state, according to the service...

        const holdings = await brokerage.importHoldings(brokerageUserId);

        await this.repository.upsertTradingPostCurrentHoldings(holdings);

        let holdingHistory: TradingPostHistoricalHoldings[] = holdings.map(holding => ({
            accountId: holding.accountId,
            securityId: holding.securityId,
            securityType: holding.securityType,
            price: holding.price,
            priceAsOf: holding.priceAsOf,
            priceSource: holding.priceSource,
            value: holding.value,
            costBasis: holding.costBasis,
            quantity: holding.quantity,
            currency: holding.currency,
            date: DateTime.now().setZone("America/New_York").set({hour: 16, minute: 0, second: 0, millisecond: 0})
        }));

        await this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);

        const transactions = await brokerage.importTransactions(brokerageUserId);

        await this.repository.upsertTradingPostTransactions(transactions);

        await this.portfolioSummaryService.computeAccountGroupSummary(tradingPostUser.id)
    }

    addNewTransactions = async (brokerageUserId: string, brokerageId: string, accountIds?: string[]) => {
        const brokerage = this.brokerageMap[brokerageId];

        const holdings = await brokerage.importHoldings(brokerageUserId);
        await this.repository.upsertTradingPostCurrentHoldings(holdings);

        const transactions = await brokerage.importTransactions(brokerageUserId);
        await this.repository.upsertTradingPostTransactions(transactions);

        let historicalHoldings: TradingPostHistoricalHoldings[] = [];
        holdings.forEach(h => {
            historicalHoldings.push({
                accountId: h.accountId,
                price: h.price,
                securityId: h.securityId,
                value: h.value,
                costBasis: h.costBasis,
                quantity: h.quantity,
                date: DateTime.now(),
                currency: "USD",
                securityType: h.securityType,
                priceAsOf: h.priceAsOf,
                priceSource: h.priceSource
            });
        });

        await this.repository.upsertTradingPostHistoricalHoldings(historicalHoldings)
    }

    removeAccounts = async (brokerageCustomerId: string, accountIds: string[], brokerageId: string) => {
        const brokerage = this.brokerageMap[brokerageId];
        const tpAccountIds = await brokerage.removeAccounts(brokerageCustomerId, accountIds)
        await this.repository.deleteTradingPostBrokerageAccounts(tpAccountIds)
    }

    generateBrokerageAuthenticationLink = async (userId: string, brokerageId: string, brokerageAccountId?: string): Promise<string> => {
        const brokerage = this.brokerageMap[brokerageId];
        return await brokerage.generateBrokerageAuthenticationLink(userId, undefined, brokerageAccountId);
    }
}