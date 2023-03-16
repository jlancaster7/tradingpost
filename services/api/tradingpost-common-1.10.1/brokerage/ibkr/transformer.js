"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const luxon_1 = require("luxon");
const interfaces_2 = require("../../market-data/interfaces");
const base_transformer_1 = __importStar(require("../base-transformer"));
const transformSecurityType = (type) => {
    switch (type) {
        case "BILL": // Treasury Bills
            return interfaces_1.SecurityType.fixedIncome;
        case "BOND": // Bonds(includes corporate and municipal)
            return interfaces_1.SecurityType.fixedIncome;
        case "CASH": // Forex
            return interfaces_1.SecurityType.cashEquivalent;
        case "CFD": // Contracts for Differences
            return interfaces_1.SecurityType.unknown;
        case "CMDTY": // Gold or Silver (Metals)
            return interfaces_1.SecurityType.index;
        case "CRYPTO": // Cryptocurrency
            return interfaces_1.SecurityType.currency;
        case "DIVACC": // Dividend Accrual Balance
            return interfaces_1.SecurityType.cashEquivalent;
        case "FOP": // Future Options
            return interfaces_1.SecurityType.option;
        case "FSFOP": // Options on Futures (Futures Style)
            return interfaces_1.SecurityType.option;
        case "FSOPT": // Options(Futures Style)
            return interfaces_1.SecurityType.option;
        case "FUND": // Mutual Funds
            return interfaces_1.SecurityType.mutualFund;
        case "FUT": // Futures
            return interfaces_1.SecurityType.option;
        case "FXCFD": // Contract for Difference on Forex
            return interfaces_1.SecurityType.currency;
        case "FXFWD": // FX Forwards
            return interfaces_1.SecurityType.currency;
        case "IBGNOTE": // IB Notes
            return interfaces_1.SecurityType.fixedIncome;
        case "INTACC": // Interest Accrual Balance
            return interfaces_1.SecurityType.cashEquivalent;
        case "IOPT": // Structured Products
            return interfaces_1.SecurityType.fixedIncome;
        case "OPT": // Equity and Index Options
            return interfaces_1.SecurityType.option;
        case "STK": // Stocks(includes ADR, ETF)
            return interfaces_1.SecurityType.equity;
        case "WAR": // Warrants
            return interfaces_1.SecurityType.option;
        default:
            throw new Error(`no security type found for ibkr item ${type}`);
    }
};
const transformTransactionType = (transactionType) => {
    switch (transactionType) {
        case "ADJ": // Adjustments(client fees/commission/option cash / position MTM/ price adjustments)
            return interfaces_1.InvestmentTransactionType.fee;
        case "ASSIGN":
            return interfaces_1.InvestmentTransactionType.transfer;
        case "BUY": // Buy
            return interfaces_1.InvestmentTransactionType.buy;
        case "CA": // cancel
            return interfaces_1.InvestmentTransactionType.cancel;
        case "CFD": // CFD interest and fees
            return interfaces_1.InvestmentTransactionType.fee;
        case "CINT": // credit interest on cash balances
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "CO": // Correct
            return interfaces_1.InvestmentTransactionType.transfer;
        case "CORP": // Corporate Actions(splits/mergers/acquisitions/etc.
            return interfaces_1.InvestmentTransactionType.transfer;
        case "COVER": // Cover short
            return interfaces_1.InvestmentTransactionType.cover;
        case "DCARD": // Debit/Prepaid Card Activity
            return interfaces_1.InvestmentTransactionType.cash;
        case "DEL": // Transfer for securities(outgoing)
            return interfaces_1.InvestmentTransactionType.transfer;
        case "DEP": // Deposit of Funds(including cash transferred in)
            return interfaces_1.InvestmentTransactionType.cash;
        case "DINT": // Debit interest on cash balances and hard to borrow fees
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "DIV": // Dividends
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "DIVACC": // Dividend Accrual Activity
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "DIVR": // Dividend Reinvestment
            return interfaces_1.InvestmentTransactionType.buy;
        case "DVPCA": // Cancelled DVP
            throw new Error("no transaction type for cancelled dvp");
        case "DVPIN": // Incoming DVP
            throw new Error("no transaction type for incoming dvp");
        case "DVPOUT": // Outgoing DVP
            throw new Error("no transaction type for outgoing dvp");
        case "EXE": // Exercise
            // TODO: Check if its a call or a put before
            return interfaces_1.InvestmentTransactionType.buy;
        case "EXP": // Expire
            return interfaces_1.InvestmentTransactionType.cancel;
        case "FRTAX": // Foreign Tax Withholding
            return interfaces_1.InvestmentTransactionType.fee;
        case "GEA": // Expiration or assignment resulting from offsetting positions
            throw new Error("no transaction type for expiration or assignment");
        case "INSDEPXFR": // Insured Deposit Transfer
            return interfaces_1.InvestmentTransactionType.cash;
        case "INTACC": // Interest Accrual Activity
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "INTP": // Investment Interest Paid
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "INTR": // Investment Interest Received
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "MFEE": // Management Fee
            return interfaces_1.InvestmentTransactionType.fee;
        case "OFEE": // Other fees including market data, order cancellations, etc.
            return interfaces_1.InvestmentTransactionType.fee;
        case "PIL": // Payment in Lieu of Dividends
            return interfaces_1.InvestmentTransactionType.transfer;
        case "REC": // Receipt of Securities(incoming)
            return interfaces_1.InvestmentTransactionType.transfer;
        case "SCOM": // Settled Commission
            return interfaces_1.InvestmentTransactionType.fee;
        case "SELL": //Sell
            return interfaces_1.InvestmentTransactionType.sell;
        case "SHORT": // Sell Short
            return interfaces_1.InvestmentTransactionType.short;
        case "STAX": // Sales Tax
            return interfaces_1.InvestmentTransactionType.fee;
        case "TTAX": // Transaction Tax records that are reported separately from trades
            return interfaces_1.InvestmentTransactionType.fee;
        case "WITH": // Withdrawl of Funds(including cash transferred out)
            return interfaces_1.InvestmentTransactionType.cash;
        default:
            throw new Error("unrecognized transaction type for ibkr");
    }
};
class IbkrTransformer extends base_transformer_1.default {
    constructor(repository) {
        super(repository);
        this.accounts = (processDate, tpUserId, accounts) => __awaiter(this, void 0, void 0, function* () {
            // Pull accounts, see if already exists, if so, then don't update(unless process_date is different)
            // upsert account then
            // We only want to update our master account with last_updated so that we know
            const tpAccounts = yield this._repository.getTradingPostBrokerageAccounts(tpUserId);
            let accountIdToLastUpdate = null;
            let filteredAccounts = accounts.filter(acc => {
                if (acc.masterAccountId === null) {
                    accountIdToLastUpdate = acc.accountId;
                    return false;
                }
                const tpAccount = tpAccounts.find(a => a.accountNumber === acc.accountId);
                if (!tpAccount)
                    return true;
                return tpAccount.updatedAt.toUnixInteger() < processDate.toUnixInteger();
            });
            const transformedAccounts = filteredAccounts.map(fa => {
                let x = {
                    accountNumber: fa.accountId,
                    error: false,
                    userId: tpUserId,
                    brokerName: interfaces_1.DirectBrokeragesType.Ibkr,
                    errorCode: 0,
                    mask: "",
                    name: fa.accountTitle ? fa.accountTitle : "",
                    type: fa.accountType ? fa.accountType : "",
                    subtype: fa.type,
                    status: fa.state ? fa.state : "",
                    institutionId: 6723,
                    officialName: "Interactive Brokers",
                    hiddenForDeletion: false,
                    accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING,
                    authenticationService: "Ibkr"
                };
                return x;
            });
            const newAccountNumbers = yield this.upsertAccounts(transformedAccounts);
            if (!accountIdToLastUpdate)
                throw new Error("could not get account id to last update");
            yield this._repository.updateTradingPostBrokerageAccountLastUpdated(tpUserId, accountIdToLastUpdate, interfaces_1.DirectBrokeragesType.Ibkr);
            return newAccountNumbers;
        });
        this.securities = (processDate, tpUserId, securitiesAndOptions) => __awaiter(this, void 0, void 0, function* () {
            const options = securitiesAndOptions.filter(sec => sec.assetType === 'OPT');
            const securities = securitiesAndOptions.filter(sec => sec.assetType !== 'OPT');
            const securitiesSymbols = securities.map(sec => sec.symbol);
            const tpSecurities = yield this._repository.getSecuritiesBySymbol(securitiesSymbols);
            const newSecurities = securities.filter(sec => !tpSecurities.find(tpSec => tpSec.symbol === sec.symbol));
            yield this._repository.addSecurities(newSecurities.map(sec => {
                let x = {
                    companyName: sec.description ? sec.description : "",
                    address: null,
                    ceo: null,
                    state: null,
                    country: null,
                    zip: null,
                    address2: null,
                    exchange: sec.primaryExchange,
                    description: sec.description,
                    symbol: sec.symbol,
                    logoUrl: null,
                    sector: null,
                    industry: null,
                    phone: null,
                    tags: null,
                    website: null,
                    primarySicCode: null,
                    securityName: sec.description,
                    employees: null,
                    issueType: sec.issuer,
                    priceSource: interfaces_2.PriceSourceType.IBKR,
                    enableUtp: false
                };
                return x;
            }));
            const optionsSymbols = options.map(opt => opt.underlyingSymbol);
            const tpOptionsSecurities = yield this._repository.getSecuritiesBySymbol(optionsSymbols);
            let tpOptionsMap = {};
            tpOptionsSecurities.forEach(tp => tpOptionsMap[tp.symbol] = tp.id);
            let tpOptions = [];
            for (let i = 0; i < options.length; i++) {
                const opt = options[i];
                let optionType = "";
                if (opt.optionType === null || opt.optionType === '' || opt.optionType.toLowerCase() === "c")
                    optionType = "Call";
                else if (opt.optionType.toLowerCase() === "p")
                    optionType = "Put";
                if (opt.expirationDate === null)
                    throw new Error("no expiration date set for option");
                if (opt.optionStrike === null)
                    throw new Error("no option strike price");
                let securityId = tpOptionsMap[opt.underlyingSymbol];
                if (!securityId)
                    securityId = yield this._repository.addSecurity({
                        address: null,
                        zip: null,
                        ceo: null,
                        address2: null,
                        tags: null,
                        country: null,
                        description: null,
                        symbol: opt.underlyingSymbol,
                        companyName: "",
                        employees: null,
                        exchange: null,
                        industry: null,
                        phone: null,
                        issueType: null,
                        securityName: null,
                        state: null,
                        sector: null,
                        enableUtp: false,
                        logoUrl: null,
                        priceSource: interfaces_2.PriceSourceType.IBKR,
                        website: null,
                        primarySicCode: null
                    });
                tpOptions.push({
                    securityId: securityId,
                    type: optionType,
                    expiration: opt.expirationDate,
                    strikePrice: opt.optionStrike,
                    externalId: opt.symbol
                });
            }
            yield this._repository.upsertOptionContracts(tpOptions);
        });
        this.transactions = (processDate, tpUserId, transactions) => __awaiter(this, void 0, void 0, function* () {
            const optionTransactions = transactions.filter(tx => {
                if (tx.assetType === null)
                    return false;
                const secType = transformSecurityType(tx.assetType);
                return secType === interfaces_1.SecurityType.option;
            });
            const securitiesMap = yield this._getSecurities(transactions);
            const optionsMap = yield this._getOptions(optionTransactions);
            for (const [key, val] of optionsMap) {
                if (securitiesMap.has(key))
                    continue;
                securitiesMap.set(val.securitySymbol, {
                    id: val.securityId,
                    address: "",
                    ceo: "",
                    address2: "",
                    employees: "",
                    companyName: "",
                    country: "",
                    zip: "",
                    createdAt: luxon_1.DateTime.now().toJSDate(),
                    state: "",
                    description: "",
                    exchange: "",
                    industry: "",
                    issueType: "",
                    logoUrl: "",
                    phone: "",
                    sector: "",
                    symbol: key,
                    tags: [],
                    lastUpdated: luxon_1.DateTime.now().toJSDate(),
                    website: "",
                    primarySicCode: "",
                    securityName: ""
                });
            }
            const tpAccountMap = yield this._getAccounts(tpUserId, transactions);
            let tpTransactions = [];
            for (let i = 0; i < transactions.length; i++) {
                const tx = transactions[i];
                if (tx.transactionType === null)
                    throw new Error("transaction type is null");
                if (tx.quantity === null)
                    throw new Error("quantity is null");
                if (tx.unitPrice === null)
                    throw new Error("unit price is null");
                if (tx.grossAmount === null)
                    throw new Error("gross amount is null");
                const internalAccount = tpAccountMap.get(tx.accountId);
                if (!internalAccount)
                    continue;
                const transactionType = transformTransactionType(tx.transactionType);
                let securityType = interfaces_1.SecurityType.cashEquivalent;
                if (tx.assetType !== null)
                    securityType = transformSecurityType(tx.assetType);
                let optionId = null;
                let symbol = tx.symbol;
                if (securityType === interfaces_1.SecurityType.option) {
                    const v = optionsMap.get(symbol);
                    if (!v)
                        throw new Error("could not get option symbol");
                    optionId = v.id;
                    symbol = v.securitySymbol;
                }
                let date = tx.orderTime;
                if (date === null)
                    date = processDate;
                if (!symbol && (transactionType === interfaces_1.InvestmentTransactionType.fee ||
                    transactionType === interfaces_1.InvestmentTransactionType.dividendOrInterest ||
                    transactionType === interfaces_1.InvestmentTransactionType.cash))
                    symbol = 'USD:CUR';
                const sec = securitiesMap.get(symbol);
                if (!sec)
                    throw new Error(`could not find symbol for security id ${symbol}`);
                const x = (0, base_transformer_1.transformTransactionTypeAmount)(transactionType, {
                    accountId: internalAccount.id,
                    currency: tx.currency,
                    amount: tx.net ? tx.net : 0,
                    date: date,
                    price: tx.unitPrice,
                    type: transactionType,
                    fees: (tx.secFee ? tx.secFee : 0) + (tx.commission ? tx.commission : 0),
                    optionId: optionId,
                    quantity: tx.quantity,
                    securityId: sec.id,
                    securityType: securityType,
                });
                tpTransactions.push(x);
            }
            yield this.upsertTransactions(tpTransactions);
        });
        this.holdings = (processDate, tpUserId, ibkrHoldings) => __awaiter(this, void 0, void 0, function* () {
            const tpAccountIdMap = yield this._getAccounts(tpUserId, ibkrHoldings);
            const securitiesMapBySymbol = yield this._getSecurities(ibkrHoldings);
            const optionsMapping = yield this._getOptions(ibkrHoldings);
            for (const [key, val] of optionsMapping) {
                if (securitiesMapBySymbol.has(key))
                    continue;
                securitiesMapBySymbol.set(val.securitySymbol, {
                    id: val.securityId,
                    address: "",
                    ceo: "",
                    address2: "",
                    employees: "",
                    companyName: "",
                    country: "",
                    zip: "",
                    createdAt: luxon_1.DateTime.now().toJSDate(),
                    state: "",
                    description: "",
                    exchange: "",
                    industry: "",
                    issueType: "",
                    logoUrl: "",
                    phone: "",
                    sector: "",
                    symbol: key,
                    tags: [],
                    lastUpdated: luxon_1.DateTime.now().toJSDate(),
                    website: "",
                    primarySicCode: "",
                    securityName: ""
                });
            }
            let historicalHoldings = [];
            for (let i = 0; i < ibkrHoldings.length; i++) {
                const h = ibkrHoldings[i];
                if (h.assetType === null)
                    throw new Error("no type for ibkr holding");
                if (h.marketPrice === null)
                    throw new Error("no market price for ibkr holding");
                if (h.marketValue === null)
                    throw new Error("no market value for ibkr holding");
                if (h.quantity === null)
                    throw new Error("no quantity for ibkr holding");
                const internalAccount = tpAccountIdMap.get(h.accountId);
                if (!internalAccount)
                    continue;
                const securityType = transformSecurityType(h.assetType);
                let symbol = h.symbol;
                if (securityType === interfaces_1.SecurityType.cashEquivalent)
                    symbol = "USD:CUR";
                if (symbol === null)
                    throw new Error("no symbol for ibkr holding");
                let optionId = null;
                if (securityType === interfaces_1.SecurityType.option) {
                    const v = optionsMapping.get(symbol);
                    if (!v)
                        throw new Error("no options mapping for symbol");
                    optionId = v.id;
                    symbol = v.securitySymbol;
                }
                let marketPrice = h.marketPrice;
                let value = h.marketValue;
                if (securityType === interfaces_1.SecurityType.cashEquivalent) {
                    marketPrice = 1;
                    value = h.quantity;
                }
                const sec = securitiesMapBySymbol.get(symbol);
                if (!sec)
                    throw new Error("could not find security in securities map by symbol");
                historicalHoldings.push({
                    accountId: internalAccount.id,
                    price: marketPrice,
                    costBasis: h.costBasis,
                    date: h.reportDate,
                    currency: h.currency,
                    optionId: optionId,
                    securityId: sec.id,
                    value: value,
                    priceAsOf: h.reportDate,
                    priceSource: interfaces_1.DirectBrokeragesType.Ibkr,
                    quantity: h.quantity,
                    securityType: securityType,
                });
            }
            yield this.upsertHistoricalHoldings(historicalHoldings);
            const currentTpHoldings = yield this._repository.getTradingPostBrokerageWithMostRecentHolding(tpUserId, interfaces_1.DirectBrokeragesType.Ibkr);
            if (currentTpHoldings.length > 0) {
                const { mostRecentHolding } = currentTpHoldings[0];
                if (mostRecentHolding !== null && mostRecentHolding.isValid && mostRecentHolding.toUnixInteger() > processDate.toUnixInteger()) {
                    return;
                }
            }
            let currentHoldings = [];
            for (let i = 0; i < ibkrHoldings.length; i++) {
                const h = ibkrHoldings[i];
                if (h.assetType === null)
                    throw new Error("no type for ibkr holding");
                if (h.marketPrice === null)
                    throw new Error("no market price for ibkr holding");
                if (h.marketValue === null)
                    throw new Error("no market value for ibkr holding");
                if (h.quantity === null)
                    throw new Error("no quantity for ibkr holding");
                const internalAccount = tpAccountIdMap.get(h.accountId);
                if (!internalAccount)
                    continue;
                let symbol = h.symbol;
                const securityType = transformSecurityType(h.assetType);
                if (securityType === interfaces_1.SecurityType.cashEquivalent)
                    symbol = "USD:CUR";
                if (symbol === null)
                    throw new Error("no symbol for ibkr holding");
                let optionId = null;
                if (securityType === interfaces_1.SecurityType.option) {
                    const v = optionsMapping.get(symbol);
                    if (!v)
                        throw new Error("could not get options mapping");
                    optionId = v.id;
                    symbol = v.securitySymbol;
                }
                let marketPrice = h.marketPrice;
                let value = h.marketValue;
                if (securityType === interfaces_1.SecurityType.cashEquivalent) {
                    marketPrice = 1;
                    value = h.quantity;
                }
                const sec = securitiesMapBySymbol.get(symbol);
                if (!sec)
                    throw new Error("could not find securities map by symbol");
                currentHoldings.push({
                    accountId: internalAccount.id,
                    priceSource: interfaces_1.DirectBrokeragesType.Ibkr,
                    value: value,
                    priceAsOf: h.reportDate,
                    price: marketPrice,
                    optionId: optionId,
                    currency: h.currency,
                    quantity: h.quantity,
                    costBasis: h.costBasis,
                    securityType: securityType,
                    securityId: sec.id,
                    holdingDate: h.reportDate
                });
            }
            const tpAccountIds = currentTpHoldings.map(tp => tp.id);
            yield this.upsertPositions(currentHoldings, tpAccountIds);
        });
        this._getAccounts = (tpUserId, ibkrWithAccount) => __awaiter(this, void 0, void 0, function* () {
            let ibkrAccountIdMap = {};
            ibkrWithAccount.forEach(acc => ibkrAccountIdMap[acc.accountId] = null);
            let accountIds = Object.keys(ibkrAccountIdMap);
            const accounts = yield this._repository.getTradingPostBrokerageAccountsByBrokerageAndIds(tpUserId, interfaces_1.DirectBrokeragesType.Ibkr, accountIds);
            let tpAccountIdMap = new Map();
            accounts.forEach(acc => tpAccountIdMap.set(acc.accountNumber, acc));
            return tpAccountIdMap;
        });
        this._getSecurities = (ibkrWithSymbols) => __awaiter(this, void 0, void 0, function* () {
            let symbols = ibkrWithSymbols.filter(i => i.symbol !== null).map(i => i.symbol);
            symbols = [...symbols, "USD:CUR"];
            let optionsSymbols = {};
            symbols.forEach(sym => {
                let splitSym = sym.split(" ");
                if (splitSym.length > 1) {
                    optionsSymbols[splitSym[0].trim()] = null;
                }
            });
            symbols = [...symbols, ...Object.keys(optionsSymbols)];
            const securities = yield this._repository.getSecuritiesBySymbol(symbols);
            let securitiesMapBySymbol = new Map();
            securities.forEach(sec => securitiesMapBySymbol.set(sec.symbol, sec));
            return securitiesMapBySymbol;
        });
        this._getOptions = (ibkrOptions) => __awaiter(this, void 0, void 0, function* () {
            const externalSymbols = ibkrOptions.map(s => s.symbol);
            const options = yield this._repository.getOptionContractsByExternalIds(externalSymbols);
            let optionsMap = new Map();
            options.forEach(opt => optionsMap.set(opt.externalId, opt));
            return optionsMap;
        });
        this._repository = repository;
    }
}
exports.default = IbkrTransformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOENBa0J1QjtBQUN2QixpQ0FBK0I7QUFDL0IsNkRBQTBFO0FBQzFFLHdFQUFtRztBQXNCbkcsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLElBQVksRUFBZ0IsRUFBRTtJQUN6RCxRQUFRLElBQUksRUFBRTtRQUNWLEtBQUssTUFBTSxFQUFFLGlCQUFpQjtZQUMxQixPQUFPLHlCQUFZLENBQUMsV0FBVyxDQUFDO1FBQ3BDLEtBQUssTUFBTSxFQUFHLDBDQUEwQztZQUNwRCxPQUFPLHlCQUFZLENBQUMsV0FBVyxDQUFDO1FBQ3BDLEtBQUssTUFBTSxFQUFFLFFBQVE7WUFDakIsT0FBTyx5QkFBWSxDQUFDLGNBQWMsQ0FBQztRQUN2QyxLQUFLLEtBQUssRUFBRSw0QkFBNEI7WUFDcEMsT0FBTyx5QkFBWSxDQUFDLE9BQU8sQ0FBQztRQUNoQyxLQUFLLE9BQU8sRUFBRSwwQkFBMEI7WUFDcEMsT0FBTyx5QkFBWSxDQUFDLEtBQUssQ0FBQztRQUM5QixLQUFLLFFBQVEsRUFBRSxpQkFBaUI7WUFDNUIsT0FBTyx5QkFBWSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxLQUFLLFFBQVEsRUFBRSwyQkFBMkI7WUFDdEMsT0FBTyx5QkFBWSxDQUFDLGNBQWMsQ0FBQztRQUN2QyxLQUFLLEtBQUssRUFBRSxpQkFBaUI7WUFDekIsT0FBTyx5QkFBWSxDQUFDLE1BQU0sQ0FBQztRQUMvQixLQUFLLE9BQU8sRUFBRSxxQ0FBcUM7WUFDL0MsT0FBTyx5QkFBWSxDQUFDLE1BQU0sQ0FBQztRQUMvQixLQUFLLE9BQU8sRUFBRSx5QkFBeUI7WUFDbkMsT0FBTyx5QkFBWSxDQUFDLE1BQU0sQ0FBQztRQUMvQixLQUFLLE1BQU0sRUFBRSxlQUFlO1lBQ3hCLE9BQU8seUJBQVksQ0FB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