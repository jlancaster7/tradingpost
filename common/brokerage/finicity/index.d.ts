import { FinicityUser, IBrokerageService, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostTransactions, IFinicityRepository, TradingPostHistoricalHoldings } from "./interfaces";
import Finicity from "../finicity/index";
export declare class FinicityService implements IBrokerageService {
    private finicity;
    private repository;
    constructor(finicity: Finicity, repository: IFinicityRepository);
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string | undefined) => Promise<string>;
    _createFinicityUser: (userId: string) => Promise<FinicityUser>;
    importInstitutions: () => Promise<void>;
    importAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    importHoldings: (userId: string, brokerageIds?: string[] | number[] | undefined) => Promise<TradingPostCurrentHoldings[]>;
    importTransactions: (userId: string, brokerageIds: string[] | number[]) => Promise<TradingPostTransactions[]>;
    exportAccounts(userId: string): Promise<any>;
    exportHoldings(userId: string): Promise<any>;
    exportTransactions(userId: string): Promise<any>;
    computeHoldingsHistory(userId: string): Promise<TradingPostHistoricalHoldings[]>;
}
