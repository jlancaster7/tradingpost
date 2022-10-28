import IbkrTransformer, {TransformerRepository} from "./transformer";
import {
    BrokerageJobStatusTable,
    BrokerageJobStatusType,
    IbkrAccount,
    IbkrAccountCsv,
    IbkrAccountTable,
    IbkrActivity,
    IbkrActivityCsv,
    IbkrCashReport,
    IbkrCashReportCsv,
    IbkrNav,
    IbkrNavCsv,
    IbkrPl,
    IbkrPlCsv,
    IbkrPosition,
    IbkrPositionCsv,
    IbkrSecurity,
    IbkrSecurityCsv
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
        if (pendingJobs.length <= 0) return false;

        console.log("finding jobs with file length")
        const pendingJob = pendingJobs.find(j => j.data.filenames.length === 7);
        if (!pendingJob) return false;

        try {
            console.log("Updating Job Status")
            await this._repo.updateJobStatus(pendingJob.id, BrokerageJobStatusType.RUNNING);

            console.log("Importing From Account")
            const [tpUserId, newerDateAlreadyProcessed, newAccountIds] = await this._importAccount(pendingJob);

            console.log("Import Securities")
            await this._importSecurity(pendingJob);

            console.log("Importing Activity")
            await this._importActivity(pendingJob);

            console.log("Importing Cash Reports")
            await this._importCashReport(pendingJob);

            console.log("Importing Nav")
            await this._importNav(pendingJob);

            console.log("Importing PLs")
            await this._importPl(pendingJob);

            console.log("Importing Positions")
            await this._importPosition(pendingJob);

            await this._repo.updateJobStatus(pendingJob.id, BrokerageJobStatusType.SUCCESSFUL)
        } catch (e) {
            await this._repo.updateJobStatus(pendingJob.id, BrokerageJobStatusType.FAILED)
            console.error(e)
            console.error("pending job date: ", pendingJob.dateToProcess.toString());
        }

        return true
    }

    _formatFileName = (brokerageUserId: string, fileType: string, date: DateTime): string => {
        return `${brokerageUserId}_${fileType}_${date.toFormat("yyyyMMdd")}.csv`
    }

    _importAccount = async (pendingJob: BrokerageJobStatusTable): Promise<[string, boolean, string[]]> => {
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

        return [masterAccount.userId, newerDateAlreadyProcessed, currentAccounts.map(ca => ca.accountId)];
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
        await this._repo.upsertIbkrSecurities(securities.map((s: IbkrSecurityCsv) => {
            let x: IbkrSecurity = {
                assetType: s.AssetType,
                bbGlobalId: s.BBGlobalID !== '' ? s.BBGlobalID : null,
                bbTicker: s.BBTicker !== '' ? s.BBTicker : null,
                securityId: s.SecurityID,
                bbTickerAndExchangeCode: s.BBTickerAndExchangeCode !== '' ? s.BBTickerAndExchangeCode : null,
                conId: s.ConID,
                currency: s.Currency !== '' ? s.Currency : null,
                cusip: s.CUSIP,
                deliveryMonth: s.DeliveryMonth !== '' ? s.DeliveryMonth : null,
                description: s.Description !== '' ? s.Description : null,
                expirationDate: s.ExpirationDate !== '' ? DateTime.fromFormat(s.ExpirationDate, "yyyyMMdd") : null,
                issueDate: s.IssueDate !== '' ? DateTime.fromFormat(s.IssueDate, "yyyyMMdd") : null,
                issuer: s.Issuer !== '' ? s.Issuer : null,
                maturityDate: s.MaturityDate !== '' ? DateTime.fromFormat(s.MaturityDate, "yyyyMMdd") : null,
                multiplier: s.Multiplier !== '' ? parseFloat(s.Multiplier) : null,
                type: s.Type,
                optionStrike: s.OptionStrike !== '' ? parseFloat(s.OptionStrike) : null,
                optionType: s.OptionType !== '' ? s.OptionType : null,
                primaryExchange: s.PrimaryExchange !== '' ? s.PrimaryExchange : null,
                subCategory: s.SubCategory !== '' ? s.SubCategory : null,
                symbol: s.Symbol,
                underlyingCategory: s.UnderlyingCategory !== '' ? s.UnderlyingCategory : null,
                underlyingSecurityId: s.UnderlyingSecurityId !== '' ? s.UnderlyingSecurityId : null,
                underlyingConId: s.UnderlyingConID !== '' ? s.UnderlyingConID : null,
                underlyingPrimaryExchange: s.UnderlyingPrimaryExchange !== '' ? s.UnderlyingPrimaryExchange : null,
                underlyingSymbol: s.UnderlyingSymbol !== '' ? s.UnderlyingSymbol : null,
            }
            return x;
        }));
    }

    _importActivity = async (pendingJob: BrokerageJobStatusTable) => {
        const activities = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "Activity", pendingJob.dateToProcess), (s: IbkrActivityCsv) => {
            let x: IbkrActivityCsv = {
                UnitPrice: s.UnitPrice,
                TransactionType: s.TransactionType,
                Van: s.Van,
                TransactionID: s.TransactionID,
                TradeTime: s.TradeTime,
                TradeID: s.TradeID,
                TradeDate: s.TradeDate,
                Tax: s.Tax,
                Symbol: s.Symbol,
                Type: s.Type,
                TaxBasisElection: s.TaxBasisElection,
                SettleDate: s.SettleDate,
                SecurityID: s.SecurityID,
                SecurityDescription: s.SecurityDescription,
                Quantity: s.Quantity,
                SECFee: s.SECFee,
                OrderTime: s.OrderTime,
                OrderID: s.OrderID,
                Net: s.Net,
                NetInBase: s.NetInBase,
                MasterAccountID: s.MasterAccountID,
                GrossAmount: s.GrossAmount,
                FxRateToBase: s.FxRateToBase,
                ExecutionID: s.ExecutionID,
                Exchange: s.Exchange,
                Flag: s.Flag,
                Description: s.Description,
                Currency: s.Currency,
                CostBasis: s.CostBasis,
                ContraPartyName: s.ContraPartyName,
                ConID: s.ConID,
                Commission: s.Commission,
                ClrFirmID: s.ClrFirmID,
                ClientReference: s.ClientReference,
                BBTicker: s.BBTicker,
                BBGlobalID: s.BBGlobalID,
                BaseCurrency: s.BaseCurrency,
                AssetType: s.AssetType,
                AwayBrokerCommission: s.AwayBrokerCommission,
                AccountID: s.AccountID
            }
            return x;
        });

        await this._repo.upsertIbkrActivity(activities.map((s: IbkrActivityCsv) => {
            let orderTime: DateTime | null = DateTime.fromFormat(s.OrderTime, "yyyyMMdd;hh:mm:ss");
            if (!orderTime.isValid) orderTime = null;

            let settleDate: DateTime | null = DateTime.fromFormat(s.SettleDate, "yyyyMMdd")
            if (!settleDate.isValid) settleDate = null;

            let tradeDate: DateTime | null = DateTime.fromFormat(s.TradeDate, "yyyyMMdd");
            if (!tradeDate.isValid) tradeDate = null;

            let tradeTimeDt: DateTime = DateTime.fromFormat(s.TradeTime, "hh:mm:ss")
            let tradeTime: string | null = tradeTimeDt.isValid ? tradeTimeDt.toSQLTime() : null;

            let x: IbkrActivity = {
                accountId: s.AccountID,
                assetType: s.AssetType !== '' ? s.AssetType : null,
                awayBrokerCommission: s.AwayBrokerCommission !== '' ? parseFloat(s.AwayBrokerCommission) : null,
                baseCurrency: s.BaseCurrency !== '' ? s.BaseCurrency : null,
                bbGlobalId: s.BBGlobalID !== '' ? s.BBGlobalID : null,
                bbTicker: s.BBTicker !== '' ? s.BBTicker : null,
                clientReferences: s.ClientReference !== '' ? s.ClientReference : null,
                clrFirmId: s.ClrFirmID !== '' ? s.ClrFirmID : null,
                commission: s.Commission !== '' ? parseFloat(s.Commission) : null,
                conId: s.ConID !== '' ? s.ConID : null,
                contraPartyName: s.ContraPartyName !== '' ? s.ContraPartyName : null,
                costBasis: s.CostBasis !== '' ? parseFloat(s.CostBasis) : null,
                currency: s.Currency !== '' ? s.Currency : null,
                description: s.Description !== '' ? s.Description : null,
                flag: s.Flag !== '' ? s.Flag : null,
                exchange: s.Exchange !== '' ? s.Exchange : null,
                executionId: s.ExecutionID !== '' ? s.ExecutionID : null,
                fxRateToBase: s.FxRateToBase !== '' ? parseFloat(s.FxRateToBase) : null,
                grossAmount: s.GrossAmount !== '' ? parseFloat(s.GrossAmount) : null,
                masterAccountId: s.MasterAccountID !== '' ? s.MasterAccountID : null,
                net: s.Net !== '' ? parseFloat(s.Net) : null,
                netInBase: s.NetInBase !== '' ? parseFloat(s.NetInBase) : null,
                orderId: s.OrderID !== '' ? s.OrderID : null,
                orderTime: orderTime,
                secFee: s.SECFee !== '' ? parseFloat(s.SECFee) : null,
                type: s.Type !== '' ? s.Type : null,
                quantity: s.Quantity !== '' ? parseFloat(s.Quantity) : null,
                securityDescription: s.SecurityDescription !== '' ? s.SecurityDescription : null,
                securityId: s.SecurityID !== '' ? s.SecurityID : null,
                tax: s.Tax !== '' ? parseFloat(s.Tax) : null,
                settleDate: settleDate,
                symbol: s.Symbol !== '' ? s.Symbol : null,
                taxBasisElection: s.TaxBasisElection !== '' ? s.TaxBasisElection : null,
                tradeDate: null,
                tradeId: s.TradeID !== '' ? s.TradeID : null,
                tradeTime: tradeTime,
                van: s.Van !== '' ? s.Van : null,
                transactionId: s.TransactionID !== '' ? s.TransactionID : null,
                transactionType: s.TransactionType !== '' ? s.TransactionType : null,
                unitPrice: s.UnitPrice !== '' ? parseFloat(s.UnitPrice) : null
            }
            return x;
        }));
    }

    _importCashReport = async (pendingJob: BrokerageJobStatusTable) => {
        const cashReports = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "CashReport", pendingJob.dateToProcess), (s: IbkrCashReportCsv) => {
            let x: IbkrCashReportCsv = {
                AccountID: s.AccountID,
                Currency: s.Currency,
                Type: s.Type,
                BaseSummary: s.BaseSummary,
                Futures: s.Futures,
                IBUKL: s.IBUKL,
                Label: s.Label,
                ReportDate: s.ReportDate,
                PAXOS: s.PAXOS,
                Securities: s.Securities,
                Total: s.Total
            }
            return x;
        });

        await this._repo.upsertIbkrCashReport(cashReports.map((s: IbkrCashReportCsv) => {
            let x: IbkrCashReport = {
                accountId: s.AccountID,
                currency: s.Currency !== '' ? s.Currency : null,
                baseSummary: s.BaseSummary === 'Y',
                futures: s.Futures !== '' ? parseFloat(s.Futures) : null,
                ibukl: s.IBUKL !== '' ? parseFloat(s.IBUKL) : null,
                type: s.Type !== '' ? s.Type : null,
                label: s.Label !== '' ? s.Label : null,
                reportDate: s.ReportDate !== '' ? DateTime.fromFormat(s.ReportDate, "yyyyMMdd") : null,
                paxos: s.PAXOS !== '' ? parseFloat(s.PAXOS) : null,
                securities: s.Securities !== '' ? parseFloat(s.Securities) : null,
                total: s.Total !== '' ? parseFloat(s.Total) : null
            }
            return x;
        }));
    }

    _importNav = async (pendingJob: BrokerageJobStatusTable) => {
        const navs = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "NAV", pendingJob.dateToProcess), (s: IbkrNavCsv) => {
            let x: IbkrNavCsv = {
                AccountID: s.AccountID,
                Options: s.Options,
                CFDUnrealizedPL: s.CFDUnrealizedPL,
                Cash: s.Cash,
                Type: s.Type,
                Accruals: s.Accruals,
                BaseCurrency: s.BaseCurrency,
                Bonds: s.Bonds,
                CashCollateral: s.CashCollateral,
                Commodities: s.Commodities,
                Crypto: s.Crypto,
                DividendAccruals: s.DividendAccruals,
                ForexCFDUnrealizedPL: s.ForexCFDUnrealizedPL,
                Funds: s.Funds,
                IPOSubscription: s.IPOSubscription,
                Notes: s.Notes,
                SecuritiesBorrowed: s.SecuritiesBorrowed,
                SecuritiesLent: s.SecuritiesLent,
                SoftDollars: s.SoftDollars,
                Stocks: s.Stocks,
                TWR: s.TWR,
                Totals: s.Totals
            }
            return x;
        });
        await this._repo.upsertIbkrNav(navs.map((s: IbkrNavCsv) => {
            let x: IbkrNav = {
                accountId: s.AccountID,
                baseCurrency: s.BaseCurrency,
                bonds: s.Bonds !== '' ? parseFloat(s.Bonds) : null,
                cash: s.Cash !== '' ? parseFloat(s.Cash) : null,
                type: s.Type !== '' ? s.Type : null,
                cashCollateral: s.CashCollateral !== '' ? parseFloat(s.CashCollateral) : null,
                cfdUnrealizedPl: s.CFDUnrealizedPL !== '' ? parseFloat(s.CFDUnrealizedPL) : null,
                commodities: s.Commodities !== '' ? parseFloat(s.Commodities) : null,
                crypto: s.Crypto !== '' ? parseFloat(s.Crypto) : null,
                dividendAccruals: s.DividendAccruals !== '' ? parseFloat(s.DividendAccruals) : null,
                forexCfdUnrealizedPl: s.ForexCFDUnrealizedPL !== '' ? parseFloat(s.ForexCFDUnrealizedPL) : null,
                funds: s.Funds !== '' ? parseFloat(s.Funds) : null,
                ipoSubscription: s.IPOSubscription !== '' ? parseFloat(s.IPOSubscription) : null,
                notes: s.Notes !== '' ? parseFloat(s.Notes) : null,
                options: s.Options !== '' ? parseFloat(s.Options) : null,
                securitiesBorrowed: s.SecuritiesBorrowed !== '' ? parseFloat(s.SecuritiesBorrowed) : null,
                securitiesLent: s.SecuritiesLent !== '' ? parseFloat(s.SecuritiesLent) : null,
                softDollars: s.SoftDollars !== '' ? parseFloat(s.SoftDollars) : null,
                stocks: s.Stocks !== '' ? parseFloat(s.Stocks) : null,
                twr: s.TWR !== '' ? parseFloat(s.TWR) : null,
                totals: s.Totals !== '' ? parseFloat(s.Totals) : null,
                processedDate: pendingJob.dateToProcess,
                accruals: s.Accruals !== '' ? parseFloat(s.Accruals) : null
            }
            return x;
        }));
    }

    _importPl = async (pendingJob: BrokerageJobStatusTable) => {
        const pls = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "PL", pendingJob.dateToProcess), (s: IbkrPlCsv) => {
            let x: IbkrPlCsv = {
                AccountID: s.AccountID,
                AssetType: s.AssetType,
                BBGlobalID: s.BBGlobalID,
                BBTicker: s.BBTicker,
                Currency: s.Currency,
                InternalAssetID: s.InternalAssetID,
                PositionMTM: s.PositionMTM,
                PositionMTMInBase: s.PositionMTMInBase,
                RealizedLT: s.RealizedLT,
                RealizedLTInBase: s.RealizedLTInBase,
                ReportDate: s.ReportDate,
                RealizedST: s.RealizedST,
                SecurityDescription: s.SecurityDescription,
                RealizedSTInBase: s.RealizedSTInBase,
                SecurityID: s.SecurityID,
                Symbol: s.Symbol,
                TransactionMTM: s.TransactionMTM,
                TransactionMTMInBase: s.TransactionMTMInBase,
                UnrealizedLT: s.UnrealizedLT,
                UnrealizedLTInBase: s.UnrealizedLTInBase,
                UnrealizedST: s.UnrealizedST,
                UnrealizedSTInBase: s.UnrealizedSTInBase
            }
            return x;
        });
        await this._repo.upsertIbkrPls(pls.map((s: IbkrPlCsv) => {
            if (s.ReportDate === '') throw new Error("no report date available for pls");
            const reportDate = DateTime.fromFormat(s.ReportDate, 'yyyyMMdd');
            let x: IbkrPl = {
                accountId: s.AccountID,
                assetType: s.AssetType !== '' ? s.AssetType : null,
                bbGlobalId: s.BBGlobalID !== '' ? s.BBGlobalID : null,
                bbTicker: s.BBTicker !== '' ? s.BBTicker : null,
                currency: s.Currency !== '' ? s.Currency : null,
                internalAssetId: s.InternalAssetID,
                positionMtm: s.PositionMTM !== '' ? parseFloat(s.PositionMTM) : null,
                positionMtmInBase: s.PositionMTMInBase !== '' ? parseFloat(s.PositionMTMInBase) : null,
                realizedLt: s.RealizedLT !== '' ? parseFloat(s.RealizedLT) : null,
                realizedLtInBase: s.RealizedLTInBase !== '' ? parseFloat(s.RealizedLTInBase) : null,
                realizedSt: s.RealizedST !== '' ? parseFloat(s.RealizedST) : null,
                reportDate: reportDate,
                securityDescription: s.SecurityDescription !== '' ? s.SecurityDescription : null,
                symbol: s.Symbol !== '' ? s.Symbol : null,
                realizedStInBase: s.RealizedSTInBase !== '' ? parseFloat(s.RealizedSTInBase) : null,
                securityId: s.SecurityID !== '' ? s.SecurityID : null,
                transactionMtm: s.TransactionMTM !== '' ? parseFloat(s.TransactionMTM) : null,
                transactionMtmInBase: s.TransactionMTMInBase !== '' ? parseFloat(s.TransactionMTMInBase) : null,
                unrealizedLt: s.UnrealizedLT !== '' ? parseFloat(s.UnrealizedLT) : null,
                unrealizedLtInBase: s.UnrealizedLTInBase !== '' ? parseFloat(s.UnrealizedLTInBase) : null,
                unrealizedSt: s.UnrealizedST !== '' ? parseFloat(s.UnrealizedST) : null,
                unrealizedStInBase: s.UnrealizedSTInBase !== '' ? parseFloat(s.UnrealizedSTInBase) : null
            }
            return x;
        }));
    }

    _importPosition = async (pendingJob: BrokerageJobStatusTable) => {
        const positions = await this._getFileFromS3(this._formatFileName(pendingJob.brokerageUserId, "Position", pendingJob.dateToProcess), (s: IbkrPositionCsv) => {
            let x: IbkrPositionCsv = {
                AccountID: s.AccountID,
                AssetType: s.AssetType,
                BBGlobalID: s.BBGlobalID,
                BBTicker: s.BBTicker,
                AccruedInt: s.AccruedInt,
                CostBasis: s.CostBasis,
                BaseCurrency: s.BaseCurrency,
                ConID: s.ConID,
                Currency: s.Currency,
                Type: s.Type,
                FxRateToBase: s.FxRateToBase,
                CostBasisInBase: s.CostBasisInBase,
                CostPrice: s.CostPrice,
                MarketPrice: s.MarketPrice,
                MarketValue: s.MarketValue,
                MarketValueInBase: s.MarketValueInBase,
                MasterAccountID: s.MasterAccountID,
                Multiplier: s.Multiplier,
                Quantity: s.Quantity,
                OpenDateTime: s.OpenDateTime,
                ReportDate: s.ReportDate,
                SecurityDescription: s.SecurityDescription,
                OriginatingOrderID: s.OriginatingOrderID,
                QuantityInBase: s.QuantityInBase,
                SecurityID: s.SecurityID,
                Van: s.Van,
                Symbol: s.Symbol,
                SettledQuantity: s.SettledQuantity,
                SettledQuantityInBase: s.SettledQuantityInBase
            }
            return x;
        });
        await this._repo.upsertIbkrPositions(positions.map((s: IbkrPositionCsv) => {
            if (s.ReportDate === '') throw new Error("no report date available for pls");
            const reportDate = DateTime.fromFormat(s.ReportDate, 'yyyyMMdd');
            let x: IbkrPosition = {
                accountId: s.AccountID,
                accruedInt: s.AccruedInt !== '' ? parseFloat(s.AccruedInt) : null,
                assetType: s.AssetType !== '' ? s.AssetType : null,
                bbGlobalId: s.BBGlobalID !== '' ? s.BBGlobalID : null,
                baseCurrency: s.BaseCurrency !== '' ? s.BaseCurrency : null,
                bbTicker: s.BBTicker !== '' ? s.BBTicker : null,
                conId: s.ConID !== '' ? s.ConID : null,
                costBasis: s.CostBasis !== '' ? parseFloat(s.CostBasis) : null,
                costBasisInBase: s.CostBasisInBase !== '' ? parseFloat(s.CostBasisInBase) : null,
                costPrice: s.CostPrice !== '' ? parseFloat(s.CostPrice) : null,
                currency: s.Currency !== '' ? s.Currency : null,
                fxRateToBase: s.FxRateToBase !== '' ? parseFloat(s.FxRateToBase) : null,
                marketPrice: s.MarketPrice !== '' ? parseFloat(s.MarketPrice) : null,
                marketValue: s.MarketValue !== '' ? parseFloat(s.MarketValue) : null,
                marketValueInBase: s.MarketValueInBase !== '' ? parseFloat(s.MarketValueInBase) : null,
                masterAccountId: s.MasterAccountID !== '' ? s.MasterAccountID : null,
                multiplier: s.Multiplier !== '' ? parseFloat(s.Multiplier) : null,
                openDateTime: s.OpenDateTime !== '' ? DateTime.fromFormat(s.OpenDateTime, "yyyyMMdd;hh:mm:ss") : null,
                quantity: s.Quantity !== '' ? parseFloat(s.Quantity) : null,
                securityDescription: s.SecurityDescription !== '' ? s.SecurityDescription : null,
                originatingOrderId: s.OriginatingOrderID !== '' ? s.OriginatingOrderID : null,
                securityId: s.SecurityID !== '' ? s.SecurityID : null,
                quantityInBase: s.QuantityInBase !== '' ? parseFloat(s.QuantityInBase) : null,
                symbol: s.Symbol !== '' ? s.Symbol : null,
                settledQuantity: s.SettledQuantity !== '' ? parseFloat(s.SettledQuantity) : null,
                type: s.Type !== '' ? s.Type : null,
                van: s.Van !== '' ? s.Van : null,
                settledQuantityInBase: s.SettledQuantityInBase !== '' ? parseFloat(s.SettledQuantityInBase) : null,
                reportDate: reportDate
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

    let keepProcessing = true;
    while (keepProcessing) {
        keepProcessing = await ibkr.run();
    }
})()