import {IBrokerageRepository, IBrokerageService, TradingPostHistoricalHoldings} from "./interfaces";
import {PortfolioSummaryService} from "./portfolio-summary";
import {DateTime} from 'luxon';

export default class BrokerageService {
    brokerageMap: Record<string, IBrokerageService>;
    portfolioSummaryService: PortfolioSummaryService;
    repository: IBrokerageRepository;

    constructor(brokerageMap: Record<string, IBrokerageService>, repository: IBrokerageRepository, portfolioSummaryService: PortfolioSummaryService) {
        this.brokerageMap = brokerageMap
        this.repository = repository;
        this.portfolioSummaryService = portfolioSummaryService;
    }

    generateBrokerageAuthenticationLink = async (userId: string, brokerageId: string): Promise<string> => {
        const brokerage = this.brokerageMap[brokerageId];
        return await brokerage.generateBrokerageAuthenticationLink(userId);
    }

    newlyAuthenticatedBrokerage = async (userId: string, brokerageId: string) => {
        const brokerage = this.brokerageMap[brokerageId];

        const accounts = await brokerage.importAccounts(userId);
        await this.repository.addTradingPostBrokerageAccounts(accounts)

        const holdings = await brokerage.importHoldings(userId);
        await this.repository.addTradingPostBrokerageHoldings(holdings);

        const transactions = await brokerage.importTransactions(userId);
        await this.repository.addTradingPostBrokerageTransactions(transactions);

        const holdingHistory = await this.computeHoldingsHistory(userId);
        await this.repository.addTradingPostBrokerageHoldingsHistory(holdingHistory);
    }

    pullNewData = async (userId: string, brokerageId: string) => {
        const brokerage = this.brokerageMap[brokerageId];

        const holdings = await brokerage.importHoldings(userId);
        await this.repository.addTradingPostBrokerageHoldings(holdings);

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
            date: DateTime.now()
        }))
        await this.repository.addTradingPostBrokerageHoldingsHistory(holdingHistory);

        const transactions = await brokerage.importTransactions(userId);
        await this.repository.addTradingPostBrokerageTransactions(transactions);
    }

    computeHoldingsHistory = async (userId: string): Promise<TradingPostHistoricalHoldings[]> => {
        return []
    }
}