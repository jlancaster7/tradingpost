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
            const options = securitiesAndOptions.filter(sec => sec.underlyingSymbol !== null);
            const securities = securitiesAndOptions.filter(sec => sec.underlyingSymbol === null);
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
            const tpOptions = options.map(opt => {
                let optionType = "";
                if (opt.optionType === null || opt.optionType === '' || opt.optionType.toLowerCase() === "c")
                    optionType = "Call";
                else if (opt.optionType.toLowerCase() === "p")
                    optionType = "Put";
                if (opt.expirationDate === null)
                    throw new Error("no expiration date set for option");
                if (opt.optionStrike === null)
                    throw new Error("no option strike price");
                let x = {
                    securityId: tpOptionsMap[opt.underlyingSymbol],
                    type: optionType,
                    expiration: opt.expirationDate,
                    strikePrice: opt.optionStrike,
                    externalId: opt.symbol
                };
                return x;
            });
            yield this._repository.upsertOptionContracts(tpOptions);
        });
        this.transactions = (processDate, tpUserId, transactions) => __awaiter(this, void 0, void 0, function* () {
            const optionTransactions = transactions.filter(tx => {
                if (tx.transactionType === null)
                    throw new Error("transaction type is null");
                const transactionType = transformTransactionType(tx.transactionType);
                if (transactionType === interfaces_1.InvestmentTransactionType.dividendOrInterest ||
                    transactionType === interfaces_1.InvestmentTransactionType.cash ||
                    transactionType === interfaces_1.InvestmentTransactionType.fee) {
                    return false;
                }
                if (tx.assetType === null)
                    throw new Error("asset type is null");
                const secType = transformSecurityType(tx.assetType);
                return secType === interfaces_1.SecurityType.option;
            });
            const securitiesMap = yield this._getSecurities(transactions);
            const optionsMap = yield this._getOptions(optionTransactions);
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
                const internalAccount = tpAccountMap[tx.accountId];
                if (!internalAccount)
                    continue;
                const transactionType = transformTransactionType(tx.transactionType);
                let securityType = interfaces_1.SecurityType.cashEquivalent;
                if (tx.assetType !== null)
                    securityType = transformSecurityType(tx.assetType);
                let optionId = null;
                let symbol = tx.symbol;
                if (securityType === interfaces_1.SecurityType.option) {
                    optionId = optionsMap[symbol].id;
                    symbol = symbol.split(" ")[0].trim();
                }
                let date = tx.orderTime;
                if (date === null)
                    date = processDate;
                if (!symbol && (transactionType === interfaces_1.InvestmentTransactionType.fee ||
                    transactionType === interfaces_1.InvestmentTransactionType.dividendOrInterest ||
                    transactionType === interfaces_1.InvestmentTransactionType.cash))
                    symbol = 'USD:CUR';
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
                    securityId: securitiesMap[symbol].id,
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
                const internalAccount = tpAccountIdMap[h.accountId];
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
                    optionId = optionsMapping[symbol].id;
                    symbol = symbol.split(" ")[0];
                }
                let marketPrice = h.marketPrice;
                let value = h.marketValue;
                if (securityType === interfaces_1.SecurityType.cashEquivalent) {
                    marketPrice = 1;
                    value = h.quantity;
                }
                historicalHoldings.push({
                    accountId: internalAccount.id,
                    price: marketPrice,
                    costBasis: h.costBasis,
                    date: h.reportDate,
                    currency: h.currency,
                    optionId: optionId,
                    securityId: securitiesMapBySymbol[symbol].id,
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
                const internalAccount = tpAccountIdMap[h.accountId];
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
                    optionId = optionsMapping[symbol].id;
                    symbol = symbol.split(" ")[0];
                }
                let marketPrice = h.marketPrice;
                let value = h.marketValue;
                if (securityType === interfaces_1.SecurityType.cashEquivalent) {
                    marketPrice = 1;
                    value = h.quantity;
                }
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
                    securityId: securitiesMapBySymbol[symbol].id,
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
            let tpAccountIdMap = {};
            accounts.forEach(acc => tpAccountIdMap[acc.accountNumber] = acc);
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
            let securitiesMapBySymbol = {};
            securities.forEach(sec => securitiesMapBySymbol[sec.symbol] = sec);
            return securitiesMapBySymbol;
        });
        this._getOptions = (ibkrOptions) => __awaiter(this, void 0, void 0, function* () {
            const options = yield this._repository.getOptionContractsByExternalIds(ibkrOptions.map(s => s.symbol));
            let optionsMap = {};
            options.forEach(opt => optionsMap[opt.externalId] = opt);
            return optionsMap;
        });
        this._repository = repository;
    }
}
exports.default = IbkrTransformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOENBa0J1QjtBQUV2Qiw2REFBMEU7QUFDMUUsd0VBQW1HO0FBcUJuRyxNQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBWSxFQUFnQixFQUFFO0lBQ3pELFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxNQUFNLEVBQUUsaUJBQWlCO1lBQzFCLE9BQU8seUJBQVksQ0FBQyxXQUFXLENBQUM7UUFDcEMsS0FBSyxNQUFNLEVBQUcsMENBQTBDO1lBQ3BELE9BQU8seUJBQVksQ0FBQyxXQUFXLENBQUM7UUFDcEMsS0FBSyxNQUFNLEVBQUUsUUFBUTtZQUNqQixPQUFPLHlCQUFZLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLEtBQUssS0FBSyxFQUFFLDRCQUE0QjtZQUNwQyxPQUFPLHlCQUFZLENBQUMsT0FBTyxDQUFDO1FBQ2hDLEtBQUssT0FBTyxFQUFFLDBCQUEwQjtZQUNwQyxPQUFPLHlCQUFZLENBQUMsS0FBSyxDQUFDO1FBQzlCLEtBQUssUUFBUSxFQUFFLGlCQUFpQjtZQUM1QixPQUFPLHlCQUFZLENBQUMsUUFBUSxDQUFDO1FBQ2pDLEtBQUssUUFBUSxFQUFFLDJCQUEyQjtZQUN0QyxPQUFPLHlCQUFZLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLEtBQUssS0FBSyxFQUFFLGlCQUFpQjtZQUN6QixPQUFPLHlCQUFZLENBQUMsTUFBTSxDQUFDO1FBQy9CLEtBQUssT0FBTyxFQUFFLHFDQUFxQztZQUMvQyxPQUFPLHlCQUFZLENBQUMsTUFBTSxDQUFDO1FBQy9CLEtBQUssT0FBTyxFQUFFLHlCQUF5QjtZQUNuQyxPQUFPLHlCQUFZLENBQUMsTUFBTSxDQUFDO1FBQy9CLEtBQUssTUFBTSxFQUFFLGVBQWU7WUFDeEIsT0FBTyx5QkFBWSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxLQUFLLEtBQUssRUFBRSxVQUFVO1lBQ2xCLE9BQU8seUJBQVksQ0FBQyxNQUFNLENBQUM7UUFDL0IsS0FBSyxPQUFPLEVBQUUsbUNBQW1DO1lBQzdDLE9BQU8seUJBQVksQ0FBQyxRQUFRLENBQUM7UUFDakMsS0FBSyxPQUFPLEVBQUUsY0FBYztZQUN4QixPQUFPLHlCQUFZLENBQUMsUUFBUSxDQUFDO1FBQ2pDLEtBQUssU0FBUyxFQUFFLFdBQVc7WUFDdkIsT0FBTyx5QkFBWSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxLQUFLLFFBQVEsRUFBRSwyQkFBMkI7WUFDdEMsT0FBTyx5QkFBWSxDQUFDLGNBQWMsQ0FBQztRQUN2QyxLQUFLLE1BQU0sRUFBRSxzQkFBc0I7WUFDL0IsT0FBTyx5QkFBWSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxLQUFLLEtBQUssRUFBRSwyQkFBMkI7WUFDbkMsT0FBTyx5QkFBWSxDQUFDLE1BQU0sQ0FBQztRQUMvQixLQUFLLEtBQUssRUFBRyw0QkFBNEI7WUFDckMsT0FBTyx5QkFBWSxDQUFDLE1BQU0sQ0FBQztRQUMvQixLQUFLLEtBQUssRUFBRSxXQUFXO1lBQ25CLE9BQU8seUJBQVksQ0FBQyxNQUFNLENBQUM7UUFDL0I7WUFDSSxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQ3RFO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLGVBQXVCLEVBQTZCLEVBQUU7SUFDcEYsUUFBUSxlQUFlLEVBQUU7UUFDckIsS0FBSyxLQUFLLEVBQUUsb0ZBQW9GO1lBQzVGLE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFDO1FBQ3pDLEtBQUssUUFBUTtZQUNULE9BQU8sc0NBQXlCLENBQUMsUUFBUSxDQUFDO1FBQzlDLEtBQUssS0FBSyxFQUFFLE1BQU07WUFDZCxPQUFPLHNDQUF5QixDQUFDLEdBQUcsQ0FBQTtRQUN4QyxLQUFLLElBQUksRUFBRSxTQUFTO1lBQ2hCLE9BQU8sc0NBQXlCLENBQUMsTUFBTSxDQUFBO1FBQzNDLEtBQUssS0FBSyxFQUFFLHdCQUF3QjtZQUNoQyxPQUFPLHNDQUF5QixDQUFDLEdBQUcsQ0FBQztRQUN6QyxLQUFLLE1BQU0sRUFBRSxtQ0FBbUM7WUFDNUMsT0FBTyxzQ0FBeUIsQ0FBQyxrQkFBa0IsQ0FBQTtRQUN2RCxLQUFLLElBQUksRUFBRSxVQUFVO1lBQ2pCLE9BQU8sc0NBQXlCLENBQUMsUUFBUSxDQUFBO1FBQzdDLEtBQUssTUFBTSxFQUFFLHFEQUFxRDtZQUM5RCxPQUFPLHNDQUF5QixDQUFDLFFBQVEsQ0FBQTtRQUM3QyxLQUFLLE9BQU8sRUFBRSxjQUFjO1lBQ3hCLE9BQU8sc0NBQXlCLENBQUMsS0FBSyxDQUFBO1FBQzFDLEtBQUssT0FBTyxFQUFFLDhCQUE4QjtZQUN4QyxPQUFPLHNDQUF5QixDQUFDLElBQUksQ0FBQztRQUMxQyxLQUFLLEtBQUssRUFBRSxvQ0FBb0M7WUFDNUMsT0FBTyxzQ0FBeUIsQ0FBQyxRQUFRLENBQUM7UUFDOUMsS0FBSyxLQUFLLEVBQUUsa0RBQWtEO1lBQzFELE9BQU8sc0NBQXlCLENBQUMsSUFBSSxDQUFDO1FBQzFDLEtBQUssTUFBTSxFQUFFLDBEQUEwRDtZQUNuRSxPQUFPLHNDQUF5QixDQUFDLGtCQUFrQixDQUFBO1FBQ3ZELEtBQUssS0FBSyxFQUFFLFlBQVk7WUFDcEIsT0FBTyxzQ0FBeUIsQ0FBQyxrQkFBa0IsQ0FBQTtRQUN2RCxLQUFLLFFBQVEsRUFBRSw0QkFBNEI7WUFDdkMsT0FBTyxzQ0FBeUIsQ0FBQyxrQkFBa0IsQ0FBQTtRQUN2RCxLQUFLLE1BQU0sRUFBRSx3QkFBd0I7WUFDakMsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxPQUFPLEVBQUUsZ0JBQWdCO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUM3RCxLQUFLLE9BQU8sRUFBRSxlQUFlO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUM1RCxLQUFLLFFBQVEsRUFBRSxlQUFlO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUM1RCxLQUFLLEtBQUssRUFBRSxXQUFXO1lBQ1gsNENBQTRDO1lBQ3BELE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFBO1FBQ3hDLEtBQUssS0FBSyxFQUFFLFNBQVM7WUFDakIsT0FBTyxzQ0FBeUIsQ0FBQyxNQUFNLENBQUE7UUFDM0MsS0FBSyxPQUFPLEVBQUUsMEJBQTBCO1lBQ3BDLE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFBO1FBQ3hDLEtBQUssS0FBSyxFQUFFLCtEQUErRDtZQUN2RSxNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7UUFDeEUsS0FBSyxXQUFXLEVBQUUsMkJBQTJCO1lBQ3pDLE9BQU8sc0NBQXlCLENBQUMsSUFBSSxDQUFBO1FBQ3pDLEtBQUssUUFBUSxFQUFFLDRCQUE0QjtZQUN2QyxPQUFPLHNDQUF5QixDQUFDLGtCQUFrQixDQUFBO1FBQ3ZELEtBQUssTUFBTSxFQUFFLDJCQUEyQjtZQUNwQyxPQUFPLHNDQUF5QixDQUFDLGtCQUFrQixDQUFBO1FBQ3ZELEtBQUssTUFBTSxFQUFFLCtCQUErQjtZQUN4QyxPQUFPLHNDQUF5QixDQUFDLGtCQUFrQixDQUFBO1FBQ3ZELEtBQUssTUFBTSxFQUFFLGlCQUFpQjtZQUMxQixPQUFPLHNDQUF5QixDQUFDLEdBQUcsQ0FBQTtRQUN4QyxLQUFLLE1BQU0sRUFBRSw4REFBOEQ7WUFDdkUsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxLQUFLLEVBQUUsK0JBQStCO1lBQ3ZDLE9BQU8sc0NBQXlCLENBQUMsUUFBUSxDQUFBO1FBQzdDLEtBQUssS0FBSyxFQUFFLGtDQUFrQztZQUMxQyxPQUFPLHNDQUF5QixDQUFDLFFBQVEsQ0FBQztRQUM5QyxLQUFLLE1BQU0sRUFBRSxxQkFBcUI7WUFDOUIsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxNQUFNLEVBQUUsTUFBTTtZQUNmLE9BQU8sc0NBQXlCLENBQUMsSUFBSSxDQUFBO1FBQ3pDLEtBQUssT0FBTyxFQUFFLGFBQWE7WUFDdkIsT0FBTyxzQ0FBeUIsQ0FBQyxLQUFLLENBQUE7UUFDMUMsS0FBSyxNQUFNLEVBQUUsWUFBWTtZQUNyQixPQUFPLHNDQUF5QixDQUFDLEdBQUcsQ0FBQTtRQUN4QyxLQUFLLE1BQU0sRUFBRSxtRUFBbUU7WUFDNUUsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxNQUFNLEVBQUUscURBQXFEO1lBQzlELE9BQU8sc0NBQXlCLENBQUMsSUFBSSxDQUFBO1FBQ3pDO1lBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO0tBQ2hFO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBcUIsZUFBZ0IsU0FBUSwwQkFBZTtJQUd4RCxZQUFZLFVBQWlDO1FBQ3pDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUl0QixhQUFRLEdBQUcsQ0FBTyxXQUFxQixFQUFFLFFBQWdCLEVBQUUsUUFBdUIsRUFBcUIsRUFBRTtZQUNyRyxtR0FBbUc7WUFDbkcsc0JBQXNCO1lBQ3RCLDhFQUE4RTtZQUM5RSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsK0JBQStCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEYsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7WUFDakMsSUFBSSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFO29CQUM5QixxQkFBcUIsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDO29CQUN0QyxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLEtBQUssR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUN6RSxJQUFJLENBQUMsU0FBUztvQkFBRSxPQUFPLElBQUksQ0FBQTtnQkFDM0IsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxHQUFHLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM3RSxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNsRCxJQUFJLENBQUMsR0FBaUM7b0JBQ2xDLGFBQWEsRUFBRSxFQUFFLENBQUMsU0FBUztvQkFDM0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osTUFBTSxFQUFFLFFBQVE7b0JBQ2hCLFVBQVUsRUFBRSxpQ0FBb0IsQ0FBQyxJQUFJO29CQUNyQyxTQUFTLEVBQUUsQ0FBQztvQkFDWixJQUFJLEVBQUUsRUFBRTtvQkFDUixJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDNUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSTtvQkFDaEIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hDLGFBQWEsRUFBRSxJQUFJO29CQUNuQixZQUFZLEVBQUUscUJBQXFCO29CQUNuQyxpQkFBaUIsRUFBRSxLQUFLO29CQUN4QixhQUFhLEVBQUUsOENBQWlDLENBQUMsVUFBVTtvQkFDM0QscUJBQXFCLEVBQUUsTUFBTTtpQkFDaEMsQ0FBQTtnQkFDRCxPQUFPLENBQUMsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMscUJBQXFCO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztZQUN2RixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsNENBQTRDLENBQUMsUUFBUSxFQUFFLHFCQUFxQixFQUFFLGlDQUFvQixDQUFDLElBQUksQ0FBQyxDQUFBO1lBQy9ILE9BQU8saUJBQWlCLENBQUM7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRCxlQUFVLEdBQUcsQ0FBTyxXQUFxQixFQUFFLFFBQWdCLEVBQUUsb0JBQW9DLEVBQUUsRUFBRTtZQUNqRyxNQUFNLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLENBQUM7WUFDbEYsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLGdCQUFnQixLQUFLLElBQUksQ0FBQyxDQUFDO1lBQ3JGLE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RCxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUVyRixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUN4RyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pELElBQUksQ0FBQyxHQUFnQjtvQkFDakIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ25ELE9BQU8sRUFBRSxJQUFJO29CQUNiLEdBQUcsRUFBRSxJQUFJO29CQUNULEtBQUssRUFBRSxJQUFJO29CQUNYLE9BQU8sRUFBRSxJQUFJO29CQUNiLEdBQUcsRUFBRSxJQUFJO29CQUNULFFBQVEsRUFBRSxJQUFJO29CQUNkLFFBQVEsRUFBRSxHQUFHLENBQUMsZUFBZTtvQkFDN0IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUM1QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07b0JBQ2xCLE9BQU8sRUFBRSxJQUFJO29CQUNiLE1BQU0sRUFBRSxJQUFJO29CQUNaLFFBQVEsRUFBRSxJQUFJO29CQUNkLEtBQUssRUFBRSxJQUFJO29CQUNYLElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxJQUFJO29CQUNiLGNBQWMsRUFBRSxJQUFJO29CQUNwQixZQUFZLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzdCLFNBQVMsRUFBRSxJQUFJO29CQUNmLFNBQVMsRUFBRSxHQUFHLENBQUMsTUFBTTtvQkFDckIsV0FBVyxFQUFFLDRCQUFlLENBQUMsSUFBSTtvQkFDakMsU0FBUyxFQUFFLEtBQUs7aUJBQ25CLENBQUE7Z0JBQ0QsT0FBTyxDQUFDLENBQUE7WUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxnQkFBMEIsQ0FBQyxDQUFDO1lBQzFFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksWUFBWSxHQUEyQixFQUFFLENBQUM7WUFDOUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFbkUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRztvQkFBRSxVQUFVLEdBQUcsTUFBTSxDQUFDO3FCQUM3RyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRztvQkFBRSxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUVsRSxJQUFJLEdBQUcsQ0FBQyxjQUFjLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksR0FBRyxDQUFDLFlBQVksS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFFekUsSUFBSSxDQUFDLEdBQW1CO29CQUNwQixVQUFVLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxnQkFBMEIsQ0FBQztvQkFDeEQsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxHQUFHLENBQUMsY0FBYztvQkFDOUIsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixVQUFVLEVBQUUsR0FBRyxDQUFDLE1BQU07aUJBQ3pCLENBQUE7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQTtZQUVGLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUEsQ0FBQTtRQUVELGlCQUFZLEdBQUcsQ0FBTyxXQUFxQixFQUFFLFFBQWdCLEVBQUUsWUFBNEIsRUFBRSxFQUFFO1lBQzNGLE1BQU0sa0JBQWtCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxFQUFFLENBQUMsZUFBZSxLQUFLLElBQUk7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2dCQUM3RSxNQUFNLGVBQWUsR0FBRyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JFLElBQUksZUFBZSxLQUFLLHNDQUF5QixDQUFDLGtCQUFrQjtvQkFDaEUsZUFBZSxLQUFLLHNDQUF5QixDQUFDLElBQUk7b0JBQ2xELGVBQWUsS0FBSyxzQ0FBeUIsQ0FBQyxHQUFHLEVBQ25EO29CQUNFLE9BQU8sS0FBSyxDQUFDO2lCQUNoQjtnQkFFRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7Z0JBQ2hFLE1BQU0sT0FBTyxHQUFHLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEQsT0FBTyxPQUFPLEtBQUsseUJBQVksQ0FBQyxNQUFNLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDOUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDOUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVyRSxJQUFJLGNBQWMsR0FBOEIsRUFBRSxDQUFDO1lBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxNQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksRUFBRSxDQUFDLGVBQWUsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDN0UsSUFBSSxFQUFFLENBQUMsUUFBUSxLQUFLLElBQUk7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ2pFLElBQUksRUFBRSxDQUFDLFdBQVcsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFFckUsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLGVBQWU7b0JBQUUsU0FBUztnQkFFL0IsTUFBTSxlQUFlLEdBQUcsd0JBQXdCLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLFlBQVksR0FBRyx5QkFBWSxDQUFDLGNBQWMsQ0FBQztnQkFDL0MsSUFBSSxFQUFFLENBQUMsU0FBUyxLQUFLLElBQUk7b0JBQUUsWUFBWSxHQUFHLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFOUUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBZ0IsQ0FBQztnQkFDakMsSUFBSSxZQUFZLEtBQUsseUJBQVksQ0FBQyxNQUFNLEVBQUU7b0JBQ3RDLFFBQVEsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFBO29CQUNoQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDeEM7Z0JBRUQsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQTtnQkFDdkIsSUFBSSxJQUFJLEtBQUssSUFBSTtvQkFBRSxJQUFJLEdBQUcsV0FBVyxDQUFDO2dCQUV0QyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQ1gsZUFBZSxLQUFLLHNDQUF5QixDQUFDLEdBQUc7b0JBQ2pELGVBQWUsS0FBSyxzQ0FBeUIsQ0FBQyxrQkFBa0I7b0JBQ2hFLGVBQWUsS0FBSyxzQ0FBeUIsQ0FBQyxJQUFJLENBQUM7b0JBQ3JELE1BQU0sR0FBRyxTQUFTLENBQUE7Z0JBRXBCLE1BQU0sQ0FBQyxHQUE0QixJQUFBLGlEQUE4QixFQUFDLGVBQWUsRUFBRTtvQkFDL0UsU0FBUyxFQUFFLGVBQWUsQ0FBQyxFQUFFO29CQUM3QixRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVE7b0JBQ3JCLE1BQU0sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixJQUFJLEVBQUUsSUFBSTtvQkFDVixLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVM7b0JBQ25CLElBQUksRUFBRSxlQUFlO29CQUNyQixJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkUsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTtvQkFDckIsVUFBVSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO29CQUNwQyxZQUFZLEVBQUUsWUFBWTtpQkFDN0IsQ0FBQyxDQUFDO2dCQUNILGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7WUFFRCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsRCxDQUFDLENBQUEsQ0FBQTtRQUVELGFBQVEsR0FBRyxDQUFPLFdBQXFCLEVBQUUsUUFBZ0IsRUFBRSxZQUE0QixFQUFFLEVBQUU7WUFDdkYsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN2RSxNQUFNLHFCQUFxQixHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0RSxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFNUQsSUFBSSxrQkFBa0IsR0FBb0MsRUFBRSxDQUFDO1lBQzdELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLFNBQVMsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUk7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2dCQUNoRixJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFFekUsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGVBQWU7b0JBQUUsU0FBUztnQkFFL0IsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFBO2dCQUNyQixJQUFJLFlBQVksS0FBSyx5QkFBWSxDQUFDLGNBQWM7b0JBQUUsTUFBTSxHQUFHLFNBQVMsQ0FBQztnQkFDckUsSUFBSSxNQUFNLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBRW5FLElBQUksUUFBUSxHQUFrQixJQUFJLENBQUM7Z0JBQ25DLElBQUksWUFBWSxLQUFLLHlCQUFZLENBQUMsTUFBTSxFQUFFO29CQUN0QyxRQUFRLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQTtvQkFDcEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pDO2dCQUVELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUE7Z0JBQy9CLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUM7Z0JBQzFCLElBQUksWUFBWSxLQUFLLHlCQUFZLENBQUMsY0FBYyxFQUFFO29CQUM5QyxXQUFXLEdBQUcsQ0FBQyxDQUFBO29CQUNmLEtBQUssR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFBO2lCQUNyQjtnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLFNBQVMsRUFBRSxlQUFlLENBQUMsRUFBRTtvQkFDN0IsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztvQkFDdEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxVQUFVO29CQUNsQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ3BCLFFBQVEsRUFBRSxRQUFRO29CQUNsQixVQUFVLEVBQUUscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtvQkFDNUMsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVO29CQUN2QixXQUFXLEVBQUUsaUNBQW9CLENBQUMsSUFBSTtvQkFDdEMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO29CQUNwQixZQUFZLEVBQUUsWUFBWTtpQkFDN0IsQ0FBQyxDQUFBO2FBQ0w7WUFFRCxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXhELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLDRDQUE0QyxDQUFDLFFBQVEsRUFBRSxpQ0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuSSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sRUFBQyxpQkFBaUIsRUFBQyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLGlCQUFpQixLQUFLLElBQUksSUFBSSxpQkFBaUIsQ0FBQyxPQUFPLElBQUksaUJBQWlCLENBQUMsYUFBYSxFQUFFLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFBRSxFQUFFO29CQUM1SCxPQUFNO2lCQUNUO2FBQ0o7WUFFRCxJQUFJLGVBQWUsR0FBaUMsRUFBRSxDQUFDO1lBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLFNBQVMsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUk7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2dCQUNoRixJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztnQkFFekUsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGVBQWU7b0JBQUUsU0FBUztnQkFFL0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLFlBQVksS0FBSyx5QkFBWSxDQUFDLGNBQWM7b0JBQUUsTUFBTSxHQUFHLFNBQVMsQ0FBQztnQkFDckUsSUFBSSxNQUFNLEtBQUssSUFBSTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBRW5FLElBQUksUUFBUSxHQUFrQixJQUFJLENBQUM7Z0JBQ25DLElBQUksWUFBWSxLQUFLLHlCQUFZLENBQUMsTUFBTSxFQUFFO29CQUN0QyxRQUFRLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQTtvQkFDcEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pDO2dCQUVELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUE7Z0JBQy9CLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUM7Z0JBQzFCLElBQUksWUFBWSxLQUFLLHlCQUFZLENBQUMsY0FBYyxFQUFFO29CQUM5QyxXQUFXLEdBQUcsQ0FBQyxDQUFBO29CQUNmLEtBQUssR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFBO2lCQUNyQjtnQkFFRCxlQUFlLENBQUMsSUFBSSxDQUFDO29CQUNqQixTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUU7b0JBQzdCLFdBQVcsRUFBRSxpQ0FBb0IsQ0FBQyxJQUFJO29CQUN0QyxLQUFLLEVBQUUsS0FBSztvQkFDWixTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVU7b0JBQ3ZCLEtBQUssRUFBRSxXQUFXO29CQUNsQixRQUFRLEVBQUUsUUFBUTtvQkFDbEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO29CQUNwQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ3BCLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztvQkFDdEIsWUFBWSxFQUFFLFlBQVk7b0JBQzFCLFVBQVUsRUFBRSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO29CQUM1QyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFVBQVU7aUJBQzVCLENBQUMsQ0FBQzthQUNOO1lBRUQsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFDN0QsQ0FBQyxDQUFBLENBQUE7UUFFRCxpQkFBWSxHQUFHLENBQXdDLFFBQWdCLEVBQUUsZUFBb0IsRUFBOEQsRUFBRTtZQUN6SixJQUFJLGdCQUFnQixHQUF5QixFQUFFLENBQUE7WUFDL0MsZUFBZSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN2RSxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGdEQUFnRCxDQUFDLFFBQVEsRUFBRSxpQ0FBb0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDMUksSUFBSSxjQUFjLEdBQXNELEVBQUUsQ0FBQztZQUMzRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNqRSxPQUFPLGNBQWMsQ0FBQTtRQUN6QixDQUFDLENBQUEsQ0FBQTtRQUVELG1CQUFjLEdBQUcsQ0FBNEMsZUFBb0IsRUFBZ0QsRUFBRTtZQUMvSCxJQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBZ0IsQ0FBQyxDQUFDO1lBQzFGLE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksY0FBYyxHQUF5QixFQUFFLENBQUE7WUFDN0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEIsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDckIsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDN0M7WUFDTCxDQUFDLENBQUMsQ0FBQTtZQUVGLE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1lBQ3RELE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6RSxJQUFJLHFCQUFxQixHQUF3QyxFQUFFLENBQUM7WUFDcEUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNuRSxPQUFPLHFCQUFxQixDQUFDO1FBQ2pDLENBQUMsQ0FBQSxDQUFBO1FBRUQsZ0JBQVcsR0FBRyxDQUFnRixXQUFnQixFQUFnRCxFQUFFO1lBQzVKLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ2pILElBQUksVUFBVSxHQUF3QyxFQUFFLENBQUM7WUFDekQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBb0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ25FLE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUMsQ0FBQSxDQUFBO1FBaFVHLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLENBQUM7Q0FnVUo7QUF0VUQsa0NBc1VDIn0=