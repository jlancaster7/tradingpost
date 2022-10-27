import IbkrTransformer, {TransformerRepository} from "./transformer";
import {
    BrokerageJobStatusTable,
    BrokerageJobStatusType,
    IbkrAccount, IbkrAccountCsv,
    IbkrAccountTable, IbkrActivity, IbkrCashReport, IbkrNav, IbkrPl, IbkrPosition,
    IbkrSecurity, IbkrSecurityCsv
} from "../interfaces";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {DateTime} from "luxon";
import csv from 'csv-parser';
import Repository from "../repository";
import {DefaultConfig} from "../../configuration";
import pgPromise from 'pg-promise';
import pg from 'pg';

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

type RepositoryInterface = {
    getPendingJobs(brokerage: string): Promise<BrokerageJobStatusTable[]>
    updateJobStatus(jobId: number, status: BrokerageJobStatusType): Promise<void>
    getIbkrAccount(accountId: string): Promise<IbkrAccountTable | null>
    getIbkrMasterAndSubAccounts(accountId: string): Promise<IbkrAccountTable[]>
    upsertIbkrAccounts(accounts: IbkrAccount[]): Promise<void>
    upsertIbkrSecurities(securities: IbkrSecurity[]): Promise<void>
    upsertIbkrActivity(activities: IbkrActivity[]): Promise<void>
    upsertIbkrCashReport(cashReports: IbkrCashReport[]): Promise<void>
    upsertIbkrNav(navs: IbkrNav[]): Promise<void>
    upsertIbkrPls(pls: IbkrPl[]): Promise<void>
    upsertIbkrPositions(positions: IbkrPosition[]): Promise<void>
} & TransformerRepository

export default class Ibkr {
    private _transformer: IbkrTransformer;
    private _repo: RepositoryInterface;
    private _s3Client: S3Client;

    constructor(repo: RepositoryInterface, s3Client: S3Client) {
        this._repo = repo;
        this._transformer = new IbkrTransformer(repo);
        this._s3Client = s3Client;
    }

    _getFileFromS3 = async <T>(key: string, mapFn?: (data: T) => T): Promise<T[]> => {
        const streamToString = async (stream: any): Promise<T[]> =>
            new Promise((resolve, reject) => {
                const chunks: T[] = [];
                stream.pipe(csv())
                    .on('data', (data: T) => {
                        if (mapFn) chunks.push(mapFn(data))
                        else chunks.push(data);
                    }).on("end", () => resolve(chunks))
            });

        const data = await this._s3Client.send(new GetObjectCommand({
            Bucket: "tradingpost-brokerage-files",
            Key: "ibkr/" + key
        }));

        return await streamToString(data.Body);
    }

    run = async () => {
        console.log("Fetching pending jobs")
        const pendingJobs = await this._repo.getPendingJobs("ibkr");
        if (pendingJobs.length <= 0) return;

        console.log("finding jobs with file length")
        const pendingJob = pendingJobs.find(j => j.data.filenames.length === 7);
        if (!pendingJob) return;

        console.log("Updating Job Status")
        // await this._repo.updateJobStatus(pendingJob.id, BrokerageJobStatusType.RUNNING);

        // const fileTypes = ['Activity', 'CashReport', 'NAV', 'PL', 'Position', 'Security']
        console.log("Importing From Account")
        const [tpUserId, newerDateAlreadyProcessed] = await this._importAccount(pendingJob);

        await this._importSecurity()

        // do not perform update if date > last ingested date for some tables(e.g., account)
        // run tradingpost brokerage transformer
    }

    _formatFileName = (brokerageUserId: string, fileType: string, date: DateTime): string => {
        return `${brokerageUserId}_Account_${date.toFormat("yyyyMMdd")}.csv`
    }

    _importAccount = async (pendingJob: BrokerageJobStatusTable): Promise<[string, boolean]> => {
        const currentAccounts = await this._repo.getIbkrMasterAndSubAccounts(pendingJob.brokerageUserId);
        const masterAccount = currentAccounts.find(acc => acc.masterAccountId === null)
        if (currentAccounts.length <= 0 || !masterAccount) throw new Error(`no ibkr account found for id ${pendingJob.brokerageUserId}`);

        let newerDateAlreadyProcessed = false;
        if (masterAccount.accountProcessDate.toUnixInteger() > pendingJob.dateToProcess.toUnixInteger()) newerDateAlreadyProcessed = true;

        const accounts = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "Account", pendingJob.dateToProcess), (data: IbkrAccountCsv) => {
            let x: IbkrAccountCsv = {
                AccountID: data.AccountID,
                AccountRepresentative: data.AccountRepresentative,
                AccountTitle: data.AccountTitle,
                AccountType: data.AccountType,
                Alias: data.Alias,
                BaseCurrency: data.BaseCurrency,
                DateFunded: data.DateFunded,
                Capabilities: data.Capabilities,
                City: data.City,
                Country: data.Country,
                CustomerType: data.CustomerType,
                DateClosed: data.DateClosed,
                MasterAccountID: data.MasterAccountID,
                DateOpened: data.DateOpened,
                PrimaryEmail: data.PrimaryEmail,
                State: data.State,
                Street: data.Street,
                Street2: data.Street2,
                Van: data.Van,
                Zip: data.Zip,
                Type: data.Type
            }
            return x;
        });
        const filteredAccounts = newerDateAlreadyProcessed ? accounts.filter(acc =>
            !currentAccounts.find(ca => ca.accountId === acc.AccountID)) : accounts;
        await this._repo.upsertIbkrAccounts(filteredAccounts.map((acc: IbkrAccountCsv) => {
            let n: IbkrAccount = {
                accountId: acc.AccountID,
                accountProcessDate: pendingJob.dateToProcess,
                accountRepresentative: acc.AccountRepresentative !== '' ? acc.AccountRepresentative : null,
                accountTitle: acc.AccountTitle !== '' ? acc.AccountTitle : null,
                accountType: acc.AccountType !== '' ? acc.AccountType : null,
                alias: acc.Alias !== '' ? acc.Alias : null,
                baseCurrency: acc.BaseCurrency !== '' ? acc.BaseCurrency : null,
                capabilities: acc.Capabilities !== '' ? acc.Capabilities : null,
                city: acc.City !== '' ? acc.City : null,
                country: acc.Country !== '' ? acc.Country : null,
                customerType: acc.CustomerType !== '' ? acc.CustomerType : null,
                dateClosed: acc.DateClosed !== '' ? DateTime.fromFormat(acc.DateClosed, "yyyyMMdd") : null,
                zip: acc.Zip !== '' ? acc.Zip : null,
                type: acc.Type !== '' ? acc.Type : null,
                dateFunded: acc.DateFunded !== '' ? DateTime.fromFormat(acc.DateFunded, "yyyyMMdd") : null,
                masterAccountId: acc.MasterAccountID !== '' ? acc.MasterAccountID : null,
                dateOpened: DateTime.fromFormat(acc.DateOpened, "yyyyMMdd"),
                state: acc.State !== '' ? acc.State : null,
                primaryEmail: acc.PrimaryEmail !== '' ? acc.PrimaryEmail : null,
                street: acc.Street !== '' ? acc.Street : null,
                street2: acc.Street2 !== '' ? acc.Street2 : null,
                userId: masterAccount.userId,
                van: acc.Van !== '' ? acc.Van : null
            }
            return n;
        }));

        return [masterAccount.userId, newerDateAlreadyProcessed];
    }

    _importActivity = async () => {

    }

    _importCashReport = async () => {

    }

    _importNav = async () => {

    }

    _importPl = async () => {

    }

    _importPosition = async () => {

    }

    _importSecurity = async (pendingJob: BrokerageJobStatusTable) => {
        const securities = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "Security", pendingJob.dateToProcess), (data: IbkrSecurityCsv) => {
            let x: IbkrSecurityCsv = {
                AssetType: data.AssetType,
                BBGlobalID: data.BBGlobalID,
                BBTicker: data.BBTicker,
                BBTickerAndExchangeCode: data.BBTickerAndExchangeCode,
                ConID: data.ConID,
                Currency: data.Currency,
                CUSIP: data.CUSIP,
                DeliveryMonth: data.DeliveryMonth,
                Description: data.Description,
                ExpirationDate: data.ExpirationDate,
                IssueDate: data.IssueDate,
                Issuer: data.Issuer,
                SecurityID: data.SecurityID,
                MaturityDate: data.MaturityDate,
                Multiplier: data.Multiplier,
                OptionStrike: data.OptionStrike,
                OptionType: data.OptionType,
                PrimaryExchange: data.PrimaryExchange,
                SubCategory: data.SubCategory,
                Symbol: data.Symbol,
                Type: data.Type,
                UnderlyingCategory: data.UnderlyingCategory,
                UnderlyingSecurityId: data.UnderlyingSecurityId,
                UnderlyingConID: data.UnderlyingConID,
                UnderlyingPrimaryExchange: data.UnderlyingPrimaryExchange,
                UnderlyingSymbol: data.UnderlyingSymbol,
            }
            return x;
        });
        await this._repo.upsertIbkrSecurities(securities.map((security: IbkrSecurityCsv) => {
            let x: IbkrSecurity = {
                
            }
            return x;
        }));
    }
}

(async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    const s3Client = new S3Client({region: "us-east-1"});

    await pgClient.connect()
    const repo = new Repository(pgClient, pgp);

    const ibkr = new Ibkr(repo, s3Client);
    console.log("Running")
    await ibkr.run();
})()