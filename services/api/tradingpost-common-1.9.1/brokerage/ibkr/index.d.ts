import { TransformerRepository } from "./transformer";
import { BrokerageTaskStatusType, BrokerageTaskTable, IbkrAccount, IbkrAccountTable, IbkrActivity, IbkrCashReport, IbkrNav, IbkrPl, IbkrPosition, IbkrSecurity, TradingPostBrokerageAccountsTable } from "../interfaces";
import { S3Client } from "@aws-sdk/client-s3";
import { DateTime } from "luxon";
import { PortfolioSummaryService } from "../portfolio-summary";
type RepositoryInterface = {
    getBrokerageTasks(params: {
        brokerage?: string;
        userId?: string;
        status?: BrokerageTaskStatusType;
    }): Promise<BrokerageTaskTable[]>;
    getTradingPostBrokerageAccountsByBrokerage(userId: string, brokerageName: string): Promise<TradingPostBrokerageAccountsTable[]>;
    getIbkrAccount(accountId: string): Promise<IbkrAccountTable | null>;
    getIbkrMasterAndSubAccounts(accountId: string): Promise<IbkrAccountTable[]>;
    upsertIbkrAccounts(accounts: IbkrAccount[]): Promise<void>;
    upsertIbkrSecurities(securities: IbkrSecurity[]): Promise<void>;
    upsertIbkrActivity(activities: IbkrActivity[]): Promise<void>;
    upsertIbkrCashReport(cashReports: IbkrCashReport[]): Promise<void>;
    upsertIbkrNav(navs: IbkrNav[]): Promise<void>;
    upsertIbkrPls(pls: IbkrPl[]): Promise<void>;
    upsertIbkrPositions(positions: IbkrPosition[]): Promise<void>;
    addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number>;
} & TransformerRepository;
export declare class Service {
    private _transformer;
    private _repo;
    private _s3Client;
    private _portfolioSummaryService;
    constructor(repo: RepositoryInterface, s3Client: S3Client, portfolioSummaryService: PortfolioSummaryService);
    add: (userId: string, brokerageUserId: string, date: DateTime, data?: any) => Promise<void>;
    update: (userId: string, brokerageUserId: string, date: DateTime, data?: any) => Promise<void>;
    _getFileFromS3: <T>(key: string, mapFn?: ((data: T) => T) | undefined) => Promise<T[]>;
    _formatFileName: (brokerageUserId: string, fileType: string, date: DateTime) => string;
    _importAccount: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrAccount[]>;
    _importSecurity: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrSecurity[]>;
    _importActivity: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrActivity[]>;
    _importCashReport: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrCashReport[]>;
    _importNav: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrNav[]>;
    _importPl: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrPl[]>;
    _importPosition: (brokerageUserId: string, dateToProcess: DateTime) => Promise<IbkrPosition[]>;
}
export {};
