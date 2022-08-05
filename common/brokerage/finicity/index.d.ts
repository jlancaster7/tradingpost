<<<<<<< HEAD
import { FinicityUser, IBrokerageService, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostTransactions, IFinicityRepository } from "../interfaces";
import Finicity from "../../finicity";
import { FinicityTransformer } from "./transformer";
export default class FinicityService implements IBrokerageService {
    private finicity;
    private repository;
    private transformer;
    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer);
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string) => Promise<string>;
    _createFinicityUser: (userId: string) => Promise<FinicityUser>;
    importInstitutions: () => Promise<void>;
    importAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    importHoldings: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostCurrentHoldings[]>;
    importTransactions: (userId: string, brokerageIds: string[] | number[]) => Promise<TradingPostTransactions[]>;
    exportAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    exportHoldings: (userId: string) => Promise<TradingPostCurrentHoldings[]>;
    exportTransactions: (userId: string) => Promise<TradingPostTransactions[]>;
}
=======
import { FinicityUser, IBrokerageService, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostTransactions, IFinicityRepository } from "../interfaces";
import Finicity from "../../finicity";
import FinicityTransformer from "./transformer";
export default class FinicityService implements IBrokerageService {
    private finicity;
    private repository;
    private transformer;
    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer);
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string) => Promise<string>;
    _createFinicityUser: (userId: string) => Promise<FinicityUser>;
    importInstitutions: () => Promise<void>;
    getAddInstitution: (finicityInstitutionId: number) => Promise<{
        tradingPostInstitutionId: number;
        finicityInstitutionId: number;
    }>;
    importAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    importHoldings: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostCurrentHoldings[]>;
    importTransactions: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostTransactions[]>;
    exportAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    exportHoldings: (userId: string) => Promise<TradingPostCurrentHoldings[]>;
    exportTransactions: (userId: string) => Promise<TradingPostTransactions[]>;
}
>>>>>>> bb6d1a32694047823b9299de87e419c4c51c228c
