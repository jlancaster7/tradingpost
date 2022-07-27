import { IBrokerageRepository, IBrokerageService, TradingPostHistoricalHoldings } from "./interfaces";
import { PortfolioSummaryService } from "./portfolio-summary";
export default class BrokerageService {
    brokerageMap: Record<string, IBrokerageService>;
    portfolioSummaryService: PortfolioSummaryService;
    repository: IBrokerageRepository;
    constructor(brokerageMap: Record<string, IBrokerageService>, repository: IBrokerageRepository, portfolioSummaryService: PortfolioSummaryService);
    generateBrokerageAuthenticationLink: (userId: string, brokerageId: string) => Promise<string>;
    newlyAuthenticatedBrokerage: (userId: string, brokerageId: string) => Promise<void>;
    pullNewData: (userId: string, brokerageId: string) => Promise<void>;
    computeHoldingsHistory: (userId: string) => Promise<TradingPostHistoricalHoldings[]>;
}
