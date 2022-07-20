import { FinicityUser, IBrokerageService, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostTransactions, IFinicityRepository } from "../interfaces";
import Finicity from "../../finicity";
import { FinicityTransformer } from "./transformer";
export declare class FinicityService implements IBrokerageService {
    private finicity;
    private repository;
    private transformer;
    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer);
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string | undefined) => Promise<string>;
    _createFinicityUser: (userId: string) => Promise<FinicityUser>;
    importInstitutions: () => Promise<void>;
    importAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    importHoldings: (userId: string, brokerageIds?: string[] | number[] | undefined) => Promise<TradingPostCurrentHoldings[]>;
    importTransactions: (userId: string, brokerageIds: string[] | number[]) => Promise<TradingPostTransactions[]>;
    exportAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    exportHoldings: (userId: string) => Promise<TradingPostCurrentHoldings[]>;
    exportTransactions: (userId: string) => Promise<TradingPostTransactions[]>;
}
