import { GetSecurityPrice, IBrokerageRepository, IBrokerageService, TradingPostHistoricalHoldings, TradingPostTransactionsTable } from "./interfaces";
import { PortfolioSummaryService } from "./portfolio-summary";
import { DateTime } from 'luxon';
declare type historicalAccount = {
    date: DateTime;
    cash: number;
    holdings: TradingPostHistoricalHoldings[];
};
export default class BrokerageService {
    brokerageMap: Record<string, IBrokerageService>;
    portfolioSummaryService: PortfolioSummaryService;
    repository: IBrokerageRepository;
    constructor(brokerageMap: Record<string, IBrokerageService>, repository: IBrokerageRepository, portfolioSummaryService: PortfolioSummaryService);
    generateBrokerageAuthenticationLink: (userId: string, brokerageId: string) => Promise<string>;
    removeAccounts: (brokerageCustomerId: string, accountIds: string[], brokerageId: string) => Promise<void>;
    newlyAuthenticatedBrokerage: (userId: string, brokerageId: string) => Promise<void>;
    pullNewData: (userId: string, brokerageId: string) => Promise<void>;
    computeHoldingsHistory: (tpAccountId: number, startDate: DateTime, endDate: DateTime) => Promise<TradingPostHistoricalHoldings[]>;
    undoTransactions: (historicalAccount: historicalAccount, transactions: TradingPostTransactionsTable[]) => historicalAccount;
    getSecurityPrices: (securityIds: number[], startDate: DateTime, endDate: DateTime) => Promise<Record<number, GetSecurityPrice[]>>;
    getTradingDays: (start: DateTime, end: DateTime) => Promise<DateTime[]>;
    getClosestPrice: (securityPricesMap: Record<number, GetSecurityPrice[]>, securityId: number, postingDate: DateTime) => number | null;
}
export {};
