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
            const tpAccounts = yield this._repository.getTradingPostBrokerageAccounts(tpUserId);
            let filteredAccounts = accounts.filter(acc => {
                if (acc.masterAccountId === null)
                    return false;
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
                    accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING
                };
                return x;
            });
            yield this.upsertAccounts(transformedAccounts);
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
                if (optionType === "C" || optionType === null)
                    optionType = "Call";
                else if (optionType === "P")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsOENBa0J1QjtBQUV2Qiw2REFBMEU7QUFDMUUsd0VBQW1HO0FBa0JuRyxNQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBWSxFQUFnQixFQUFFO0lBQ3pELFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxNQUFNLEVBQUUsaUJBQWlCO1lBQzFCLE9BQU8seUJBQVksQ0FBQyxXQUFXLENBQUM7UUFDcEMsS0FBSyxNQUFNLEVBQUcsMENBQTBDO1lBQ3BELE9BQU8seUJBQVksQ0FBQyxXQUFXLENBQUM7UUFDcEMsS0FBSyxNQUFNLEVBQUUsUUFBUTtZQUNqQixPQUFPLHlCQUFZLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLEtBQUssS0FBSyxFQUFFLDRCQUE0QjtZQUNwQyxPQUFPLHlCQUFZLENBQUMsT0FBTyxDQUFDO1FBQ2hDLEtBQUssT0FBTyxFQUFFLDBCQUEwQjtZQUNwQyxPQUFPLHlCQUFZLENBQUMsS0FBSyxDQUFDO1FBQzlCLEtBQUssUUFBUSxFQUFFLGlCQUFpQjtZQUM1QixPQUFPLHlCQUFZLENBQUMsUUFBUSxDQUFDO1FBQ2pDLEtBQUssUUFBUSxFQUFFLDJCQUEyQjtZQUN0QyxPQUFPLHlCQUFZLENBQUMsY0FBYyxDQUFDO1FBQ3ZDLEtBQUssS0FBSyxFQUFFLGlCQUFpQjtZQUN6QixPQUFPLHlCQUFZLENBQUMsTUFBTSxDQUFDO1FBQy9CLEtBQUssT0FBTyxFQUFFLHFDQUFxQztZQUMvQyxPQUFPLHlCQUFZLENBQUMsTUFBTSxDQUFDO1FBQy9CLEtBQUssT0FBTyxFQUFFLHlCQUF5QjtZQUNuQyxPQUFPLHlCQUFZLENBQUMsTUFBTSxDQUFDO1FBQy9CLEtBQUssTUFBTSxFQUFFLGVBQWU7WUFDeEIsT0FBTyx5QkFBWSxDQUFDLFVBQVUsQ0FBQztR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