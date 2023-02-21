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
            // Accounts
            const ibkrAccounts = yield this._importAccount(brokerageUserId, date);
            const newAccountIds = yield this._transformer.accounts(date, userId, ibkrAccounts);
            yield this._repo.addTradingPostAccountGroup(userId, 'default', newAccountIds, 10117);
            // Securities
            const securities = yield this._importSecurity(brokerageUserId, date);
            yield this._transformer.securities(date, userId, securities);
            // Activity
            const activity = yield this._importActivity(brokerageUserId, date);
            yield this._transformer.transactions(date, userId, activity);
            // Pull Positions & Insert
            const positions = yield this._importPosition(brokerageUserId, date);
            yield this._transformer.holdings(date, userId, positions);
            yield this._importCashReport(brokerageUserId, date);
            yield this._importNav(brokerageUserId, date);
            yield this._importPl(brokerageUserId, date);
            const brokerageAcc = yield this._repo.getTradingPostBrokerageAccountByUser(userId, interfaces_1.DirectBrokeragesType.Ibkr, brokerageUserId);
            if (!brokerageAcc)
                throw new Error("could not find brokerage");
            yield this._sqsClient.send(new client_sqs_1.SendMessageCommand({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnRUFBcUU7QUFDckUsOENBa0J1QjtBQUN2QixrREFBOEQ7QUFDOUQsaUNBQStCO0FBQy9CLDREQUE2QjtBQUU3QixvREFBa0U7QUFnQmxFLE1BQWEsT0FBTztJQU9oQixZQUFZLElBQXlCLEVBQUUsUUFBa0IsRUFBRSx1QkFBZ0QsRUFBRSxTQUFvQjtRQVExSCxXQUFNLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZUFBdUIsRUFBRSxJQUFjLEVBQUUsSUFBVSxFQUFpQixFQUFFO1FBRTdHLENBQUMsQ0FBQSxDQUFBO1FBRU0sUUFBRyxHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBRSxFQUFFO1lBQ3ZGLCtCQUErQjtZQUMvQixPQUFPO1FBQ1gsQ0FBQyxDQUFBLENBQUE7UUFFTSxpQ0FBNEIsR0FBRyxDQUFPLE1BQWMsRUFBRSxlQUF1QixFQUFFLElBQWMsRUFBRSxJQUFVLEVBQWlCLEVBQUU7WUFDL0gsTUFBTSxjQUFjLEdBQUksSUFBZ0MsQ0FBQyxXQUFXLENBQUM7WUFDckUsTUFBTSxXQUFXLEdBQUcsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtZQUNqRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsTUFBTSxFQUFFLGlDQUFvQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQTtZQUMzSCxJQUFJLENBQUMsU0FBUztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFFNUQsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEs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QUssRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUM1RCxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzFDLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDL0QsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUMvRCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3ZDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDaEQsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUMvRCxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzFGLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDcEMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFB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QyxDQUFDLENBQUMsSUFBSTtvQkFDbEQsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQixLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUMvRixZQUFZLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzNELFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDckQsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUMvQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDckUsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNsRCxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ2pFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDdEMsZUFBZSxFQUFFLENBQUMsQ0FBQyxlQUFlLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNwRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzlELFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDL0MsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN4RCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ25DLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDL0MsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN4RCxZQUFZLEVBQUUsQ0FBQyxDQUFDLFlBQVksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3ZFLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDcEUsZUFBZSxFQUFFLENBQUMsQ0FBQyxlQUFlLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNwRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLENB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Q0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3hELEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDbEQsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNuQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3RDLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNsSCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ2xELFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDakUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO2lCQUNyRCxDQUFBO2dCQUNELE9BQU8sQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLElBQUks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Q0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDM0QsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUMvQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3RDLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDOUQsZUFBZSxFQUFFLENBQUMsQ0FBQyxlQUFlLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUNoRixTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQzlELFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDL0MsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO29CQUN2RSxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVcsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3BFLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENB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