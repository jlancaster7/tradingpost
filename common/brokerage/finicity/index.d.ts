import { FinicityUser, IBrokerageService, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostTransactions, IFinicityRepository, TradingPostUser } from "../interfaces";
import Finicity from "../../finicity";
import { DateTime } from "luxon";
import FinicityTransformer from "./transformer";
export declare class Service implements IBrokerageService {
    private finicity;
    private repository;
    private transformer;
    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer);
    update: (userId: string, brokerageUserId: string, date: DateTime, data?: any) => Promise<void>;
    add: (userId: string, brokerageUserId: string, date: DateTime, data?: any) => Promise<void>;
    getTradingPostUserAssociatedWithBrokerageUser: (brokerageUserId: string) => Promise<TradingPostUser>;
    generateBrokerageAuthenticationLink: (userId: string, brokerageAccount?: string, brokerageAccountId?: string) => Promise<string>;
    _createFinicityUser: (userId: string) => Promise<FinicityUser>;
    importInstitutions: () => Promise<void>;
    getAddInstitution: (finicityInstitutionId: number) => Promise<{
        tradingPostInstitutionId: number;
        finicityInstitutionId: number;
    }>;
    importAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    importHoldings: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostCurrentHoldings[]>;
    updateTradingpostBrokerageAccountError: (accounts: {
        accountId: number;
        error: boolean;
        errorCode: number;
    }[]) => Promise<void>;
    importTransactions: (userId: string, brokerageIds?: string[] | number[]) => Promise<TradingPostTransactions[]>;
    exportAccounts: (userId: string) => Promise<TradingPostBrokerageAccounts[]>;
    exportHoldings: (userId: string) => Promise<TradingPostCurrentHoldings[]>;
    exportTransactions: (userId: string) => Promise<TradingPostTransactions[]>;
    removeAccounts: (brokerageCustomerId: string, accountIds: string[]) => Promise<number[]>;
}
