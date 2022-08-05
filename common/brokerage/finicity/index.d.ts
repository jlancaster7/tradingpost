<<<<<<< HEAD
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
=======
import { FinicityUser, IBrokerageService, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostTransactions, IFinicityRepository, TradingPostUser } from "../interfaces";
>>>>>>> e5e89424657ca800da44b808fd90b16b6ade0be7
import Finicity from "../../finicity";
import FinicityTransformer from "./transformer";
export default class FinicityService implements IBrokerageService {
    private finicity;
    private repository;
    private transformer;
    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer);
<<<<<<< HEAD
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string) => Promise<string>;
=======
    getTradingPostUserAssociatedWithBrokerageUser: (brokerageUserId: string) => Promise<TradingPostUser>;
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string | undefined) => Promise<string>;
>>>>>>> e5e89424657ca800da44b808fd90b16b6ade0be7
    _createFinicityUser: (userId: string) => Promise<FinicityUser>;
    importInstitutions: () => Promise<void>;
    getAddInstitution: (finicityInstitutionId: number) => Promise<{
        tradingPostInstitutionId: number;
        finicityInstitutionId: number;
    }>;
    importAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
<<<<<<< HEAD
    importHoldings: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostCurrentHoldings[]>;
    importTransactions: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostTransactions[]>;
    exportAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    exportHoldings: (userId: string) => Promise<TradingPostCurrentHoldings[]>;
    exportTransactions: (userId: string) => Promise<TradingPostTransactions[]>;
}
>>>>>>> bb6d1a32694047823b9299de87e419c4c51c228c
=======
    importHoldings: (userId: string, brokerageIds?: string[] | number[] | undefined) => Promise<TradingPostCurrentHoldings[]>;
    importTransactions: (userId: string, brokerageIds?: string[] | number[] | undefined) => Promise<TradingPostTransactions[]>;
    exportAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    exportHoldings: (userId: string) => Promise<TradingPostCurrentHoldings[]>;
    exportTransactions: (userId: string) => Promise<TradingPostTransactions[]>;
    removeAccounts: (brokerageCustomerId: string, accountIds: string[]) => Promise<number[]>;
}
>>>>>>> e5e89424657ca800da44b808fd90b16b6ade0be7
