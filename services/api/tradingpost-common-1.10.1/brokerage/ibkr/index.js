"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const transformer_1 = __importDefault(require("./transformer"));
const interfaces_1 = require("../interfaces");
const client_s3_1 = require("@aws-sdk/client-s3");
const luxon_1 = require("luxon");
const csv_parser_1 = __importDefault(require("csv-parser"));
const client_sqs_1 = require("@aws-sdk/client-sqs");
class Service {
    constructor(repo, s3Client, portfolioSummaryService, sqsClient) {
        this.remove = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
        });
        this.add = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            // Create email and ship it out
            return;
        });
        this.calculatePortfolioStatistics = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            const lastUpdatedIso = data.lastUpdated;
            const lastUpdated = luxon_1.DateTime.fromISO(lastUpdatedIso);
            if (!lastUpdated.isValid)
                throw new Error("incorrect timestamp!");
            const brokerage = yield this._repo.getTradingPostBrokerageAccountByUser(userId, interfaces_1.DirectBrokeragesType.Ibkr, brokerageUserId);
            if (!brokerage)
                throw new Error("could not find brokerage");
            if (brokerage.updatedAt.toUnixInteger() > lastUpdated.toUnixInteger())
                return;
            if (lastUpdated.toUnixInteger() > brokerage.updatedAt.toUnixInteger())
                throw new Error("how did this happen???");
            try {
                yield this._portfolioSummaryService.computeAccountGroupSummary(userId);
            }
            catch (e) {
                console.error(e);
            }
        });
        this.update = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            yield this._repo.execTx((r) => __awaiter(this, void 0, void 0, function* () {
                const ibkrService = new Service(r, this._s3Client, this._portfolioSummaryService, this._sqsClient);
                // Accounts
                const ibkrAccounts = yield ibkrService._importAccount(brokerageUserId, date);
                const newAccountIds = yield ibkrService._transformer.accounts(date, userId, ibkrAccounts);
                yield ibkrService._repo.addTradingPostAccountGroup(userId, 'default', newAccountIds, 10117);
                // Securities
                const securities = yield ibkrService._importSecurity(brokerageUserId, date);
                yield ibkrService._transformer.securities(date, userId, securities);
                // Activity
                const activity = yield ibkrService._importActivity(brokerageUserId, date);
                yield ibkrService._transformer.transactions(date, userId, activity);
                // Pull Positions & Insert
                const positions = yield ibkrService._importPosition(brokerageUserId, date);
                yield ibkrService._transformer.holdings(date, userId, positions);
                yield ibkrService._importCashReport(brokerageUserId, date);
                yield ibkrService._importNav(brokerageUserId, date);
                yield ibkrService._importPl(brokerageUserId, date);
                const brokerageAcc = yield ibkrService._repo.getTradingPostBrokerageAccountByUser(userId, interfaces_1.DirectBrokeragesType.Ibkr, brokerageUserId);
                if (!brokerageAcc)
                    throw new Error("could not find brokerage");
                yield ibkrService._sqsClient.send(new client_sqs_1.SendMessageCommand({
                    MessageBody: JSON.stringify({
                        type: interfaces_1.BrokerageTaskType.UpdatePortfolioStatistics,
                        userId: userId,
                        status: interfaces_1.BrokerageTaskStatusType.Pending,
                        data: { lastUpdated: brokerageAcc.updatedAt },
                        started: null,
                        finished: null,
                        brokerage: interfaces_1.DirectBrokeragesType.Ibkr,
                        date: luxon_1.DateTime.now().setZone("America/New_York"),
                        brokerageUserId: brokerageUserId,
                        error: null,
                        messageId: null
                    }),
                    DelaySeconds: 0,
                    QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
                }));
            }));
        });
        this._getFileFromS3 = (key, userId, mapFn) => __awaiter(this, void 0, void 0, function* () {
            const streamToString = (stream) => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    const chunks = [];
                    stream.pipe((0, csv_parser_1.default)())
                        .on('data', (data) => {
                        if (mapFn)
                            chunks.push(mapFn(data));
                        else
                            chunks.push(data);
                    }).on("end", () => resolve(chunks));
                });
            });
            const data = yield this._s3Client.send(new client_s3_1.GetObjectCommand({
                Bucket: "tradingpost-brokerage-files",
                Key: "ibkr/" + userId + "/" + key
            }));
            return yield streamToString(data.Body);
        });
        this._formatFileName = (brokerageUserId, fileType, date) => {
            return `${brokerageUserId}_${fileType}_${date.toFormat("yyyyMMdd")}.csv`;
        };
        this._importAccount = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const currentAccounts = yield this._repo.getIbkrMasterAndSubAccounts(brokerageUserId);
            const masterAccount = currentAccounts.find(acc => acc.masterAccountId === null);
            if (currentAccounts.length <= 0 || !masterAccount)
                throw new Error(`no ibkr account found for id ${brokerageUserId}`);
            const fileName = this._formatFileName(brokerageUserId, "Account", dateToProcess);
            const accounts = yield this._getFileFromS3(fileName, brokerageUserId, (data) => {
                let x = {
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
                    Type: data.Type,
                };
                return x;
            });
            const ibkrAccounts = accounts.map((acc) => {
                let n = {
                    accountId: acc.AccountID,
                    accountProcessDate: dateToProcess,
                    accountRepresentative: acc.AccountRepresentative !== '' ? acc.AccountRepresentative : null,
                    accountTitle: acc.AccountTitle !== '' ? acc.AccountTitle : null,
                    accountType: acc.AccountType !== '' ? acc.AccountType : null,
                    alias: acc.Alias !== '' ? acc.Alias : null,
                    baseCurrency: acc.BaseCurrency !== '' ? acc.BaseCurrency : null,
                    capabilities: acc.Capabilities !== '' ? acc.Capabilities : null,
                    city: acc.City !== '' ? acc.City : null,
                    country: acc.Country !== '' ? acc.Country : null,
                    customerType: acc.CustomerType !== '' ? acc.CustomerType : null,
                    dateClosed: acc.DateClosed !== '' ? luxon_1.DateTime.fromFormat(acc.DateClosed, "yyyyMMdd") : null,
                    zip: acc.Zip !== '' ? acc.Zip : null,
                    type: acc.Type !== '' ? acc.Type : null,
                    dateFunded: acc.DateFunded !== '' ? luxon_1.DateTime.fromFormat(acc.DateFunded, "yyyyMMdd") : null,
                    masterAccountId: acc.MasterAccountID !== '' ? acc.MasterAccountID : null,
                    dateOpened: luxon_1.DateTime.fromFormat(acc.DateOpened, "yyyyMMdd"),
                    state: acc.State !== '' ? acc.State : null,
                    primaryEmail: acc.PrimaryEmail !== '' ? acc.PrimaryEmail : null,
                    street: acc.Street !== '' ? acc.Street : null,
                    street2: acc.Street2 !== '' ? acc.Street2 : null,
                    userId: masterAccount.userId,
                    van: acc.Van !== '' ? acc.Van : null
                };
                return n;
            });
            yield this._repo.upsertIbkrAccounts(ibkrAccounts);
            return ibkrAccounts;
        });
        this._importSecurity = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const ibkrSecurities = yield this._getFileFromS3(this._formatFileName(brokerageUserId, "Security", dateToProcess), brokerageUserId, (data) => {
                let x = {
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
                };
                return x;
            });
            let transformedSecurities = [];
            for (let i = 0; i < ibkrSecurities.length; i++) {
                const s = ibkrSecurities[i];
                let x = {
                    fileDate: dateToProcess,
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
                    expirationDate: s.ExpirationDate !== '' ? luxon_1.DateTime.fromFormat(s.ExpirationDate, "yyyyMMdd", { zone: "America/New_York" }) : null,
                    issueDate: s.IssueDate !== '' ? luxon_1.DateTime.fromFormat(s.IssueDate, "yyyyMMdd", { zone: "America/New_York" }) : null,
                    issuer: s.Issuer !== '' ? s.Issuer : null,
                    maturityDate: s.MaturityDate !== '' ? luxon_1.DateTime.fromFormat(s.MaturityDate, "yyyyMMdd", { zone: "America/New_York" }) : null,
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
                };
                transformedSecurities.push(x);
            }
            yield this._repo.upsertIbkrSecurities(transformedSecurities);
            return transformedSecurities;
        });
        this._importActivity = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const activities = yield this._getFileFromS3(this._formatFileName(brokerageUserId, "Activity", dateToProcess), brokerageUserId, (s) => {
                let x = {
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
                };
                return x;
            });
            const activitiesMapped = activities.map((s) => {
                let orderTime = luxon_1.DateTime.fromFormat(s.OrderTime, "yyyyMMdd;hh:mm:ss", { zone: "America/New_York" });
                if (!orderTime.isValid)
                    orderTime = null;
                let settleDate = luxon_1.DateTime.fromFormat(s.SettleDate, "yyyyMMdd", { zone: "America/New_York" });
                if (!settleDate.isValid)
                    settleDate = null;
                let tradeDate = luxon_1.DateTime.fromFormat(s.TradeDate, "yyyyMMdd", { zone: "America/New_York" });
                if (!tradeDate.isValid)
                    tradeDate = null;
                let tradeTimeDt = luxon_1.DateTime.fromFormat(s.TradeTime, "hh:mm:ss", { zone: "America/New_York" });
                let tradeTime = tradeTimeDt.isValid ? tradeTimeDt.toSQLTime() : null;
                let x = {
                    fileDate: dateToProcess,
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
                };
                return x;
            });
            yield this._repo.upsertIbkrActivity(activitiesMapped);
            return activitiesMapped;
        });
        this._importCashReport = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const cashReports = yield this._getFileFromS3(this._formatFileName(brokerageUserId, "CashReport", dateToProcess), brokerageUserId, (s) => {
                let x = {
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
                };
                return x;
            });
            const cashReportsMapped = cashReports.map((s) => {
                let x = {
                    fileDate: dateToProcess,
                    accountId: s.AccountID,
                    currency: s.Currency !== '' ? s.Currency : null,
                    baseSummary: s.BaseSummary === 'Y',
                    futures: s.Futures !== '' ? parseFloat(s.Futures) : null,
                    ibukl: s.IBUKL !== '' ? parseFloat(s.IBUKL) : null,
                    type: s.Type !== '' ? s.Type : null,
                    label: s.Label !== '' ? s.Label : null,
                    reportDate: s.ReportDate !== '' ? luxon_1.DateTime.fromFormat(s.ReportDate, "yyyyMMdd", { zone: "America/New_York" }) : null,
                    paxos: s.PAXOS !== '' ? parseFloat(s.PAXOS) : null,
                    securities: s.Securities !== '' ? parseFloat(s.Securities) : null,
                    total: s.Total !== '' ? parseFloat(s.Total) : null
                };
                return x;
            });
            yield this._repo.upsertIbkrCashReport(cashReportsMapped);
            return cashReportsMapped;
        });
        this._importNav = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const navs = yield this._getFileFromS3(this._formatFileName(brokerageUserId, "NAV", dateToProcess), brokerageUserId, (s) => {
                let x = {
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
                };
                return x;
            });
            const navsMapped = navs.map((s) => {
                let x = {
                    fileDate: dateToProcess,
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
                    processedDate: dateToProcess,
                    accruals: s.Accruals !== '' ? parseFloat(s.Accruals) : null
                };
                return x;
            });
            yield this._repo.upsertIbkrNav(navsMapped);
            return navsMapped;
        });
        this._importPl = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const pls = yield this._getFileFromS3(this._formatFileName(brokerageUserId, "PL", dateToProcess), brokerageUserId, (s) => {
                let x = {
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
                };
                return x;
            });
            const plsMapped = pls.map((s) => {
                if (s.ReportDate === '')
                    throw new Error("no report date available for pls");
                const reportDate = luxon_1.DateTime.fromFormat(s.ReportDate, 'yyyyMMdd', { zone: "America/New_York" });
                let x = {
                    fileDate: dateToProcess,
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
                };
                return x;
            });
            yield this._repo.upsertIbkrPls(plsMapped);
            return plsMapped;
        });
        this._importPosition = (brokerageUserId, dateToProcess) => __awaiter(this, void 0, void 0, function* () {
            const positions = yield this._getFileFromS3(this._formatFileName(brokerageUserId, "Position", dateToProcess), brokerageUserId, (s) => {
                let x = {
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
                };
                return x;
            });
            const positionsMapped = positions.map((s) => {
                if (s.ReportDate === '')
                    throw new Error("no report date available for position");
                const reportDate = luxon_1.DateTime.fromFormat(s.ReportDate, 'yyyyMMdd', { zone: "America/New_York" }).set({
                    hour: 16, minute: 0, second: 0, millisecond: 0
                });
                let x = {
                    fileDate: dateToProcess,
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
                    openDateTime: s.OpenDateTime !== '' ? luxon_1.DateTime.fromFormat(s.OpenDateTime, "yyyyMMdd;hh:mm:ss", { zone: "America/New_York" }) : null,
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
                };
                return x;
            });
            yield this._repo.upsertIbkrPositions(positionsMapped);
            return positionsMapped;
        });
        this._repo = repo;
        this._transformer = new transformer_1.default(repo);
        this._s3Client = s3Client;
        this._portfolioSummaryService = portfolioSummaryService;
        this._sqsClient = sqsClient;
    }
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnRUFBcUU7QUFDckUsOENBa0J1QjtBQUN2QixrREFBOEQ7QUFDOUQsaUNBQStCO0FBQy9CLDREQUE2QjtBQUU3QixvREFBa0U7QUFpQmxFLE1BQWEsT0FBTztJQU9oQixZQUFZLElBQXlCLEVBQUUsUUFBa0IsRUFBRSx1QkFBZ0QsRUFBRSxTQUFvQjtRQVExSCxXQUFNLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZUFBdUIsRUFBRSxJQUFjLEVBQUUsSUFBVSxFQUFpQixFQUFFO1FBRTdHLENBQUMsQ0FBQSxDQUFBO1FBRU0sUUFBRyxHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBRSxFQUFFO1lBQ3ZGLCtCQUErQjtZQUMvQixPQUFPO1FBQ1gsQ0FBQyxDQUFBLENBQUE7UUFFTSxpQ0FBNEIsR0FBRyxDQUFPLE1BQWMsRUFBRSxlQUF1QixFQUFFLElBQWMsRUFBRSxJQUFVLEVBQWlCLEVBQUU7WUFDL0gsTUFBTSxjQUFjLEdBQUksSUFBZ0MsQ0FBQyxXQUFXLENBQUM7WUFDckUsTUFBTSxXQUFXLEdBQUcsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtZQUNqRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsTUFBTSxFQUFFLGlDQUFvQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQTtZQUMzSCxJQUFJLENBQUMsU0FBUztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFFNUQsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEs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QUFDLENBQUMsQ0FBQyxJQUFJO29CQUNqRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3RDLGVBQWUsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDcEUsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUM5RCxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQy9DLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDeEQsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNuQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQy9DLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDeEQsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN2RSxXQUFXLEVBQUUsQ0FBQyxD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LENBQUMsU0FBUyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDbEQsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNyRCxZQUFZLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzNELFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDL0MsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN0QyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzlELGVBQWUsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDaEYsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUM5RCxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQy9DLFlBQVksRUFBRSxDQUFDLENBQUMsWUFBWSxLQUFLLEVBQUUsQ0FBQyxD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