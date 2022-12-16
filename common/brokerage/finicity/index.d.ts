import { FinicityUser, IFinicityRepository, TradingPostUser } from "../interfaces";
import Finicity from "../../finicity";
import { DateTime } from "luxon";
import { Transformer as FinicityTransformer } from "./transformer";
import { PortfolioSummaryService } from "../portfolio-summary";
export declare class Service {
    private finicity;
    private repository;
    private transformer;
    private readonly portSummarySrv;
    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer, portfolioSummaryStats?: PortfolioSummaryService);
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
    importAccounts: (userId: string) => Promise<void>;
    importHoldings: (userId: string, brokerageIds?: string[] | number[]) => Promise<void>;
    updateTradingpostBrokerageAccountError: (accounts: {
        accountId: number;
        error: boolean;
        errorCode: number;
    }[]) => Promise<void>;
    importTransactions: (userId: string, brokerageIds?: string[] | number[]) => Promise<void>;
    removeAccounts: (brokerageCustomerId: string, accountIds: string[]) => Promise<number[]>;
}
