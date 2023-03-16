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
exports.Transformer = void 0;
const interfaces_1 = require("../interfaces");
const luxon_1 = require("luxon");
const interfaces_2 = require("../../market-data/interfaces");
const base_transformer_1 = __importStar(require("../base-transformer"));
// Finicity Types Found Here: https://api-reference.finicity.com/#/rest/models/enumerations/investment-transaction-types
const transformTransactionType = (txType) => {
    switch (txType) {
        case "cancel":
            return interfaces_1.InvestmentTransactionType.cancel;
        case "purchaseToClose":
            return interfaces_1.InvestmentTransactionType.buy;
        case "purchaseToCover":
            return interfaces_1.InvestmentTransactionType.cover;
        case "contribution":
            return interfaces_1.InvestmentTransactionType.cash;
        case "optionExercise":
            return interfaces_1.InvestmentTransactionType.buy;
        case "optionExpiration":
            return interfaces_1.InvestmentTransactionType.cancel;
        case "fee":
            return interfaces_1.InvestmentTransactionType.fee;
        case "soldToClose":
            return interfaces_1.InvestmentTransactionType.sell;
        case "soldToOpen":
            return interfaces_1.InvestmentTransactionType.short;
        case "split":
            throw new Error("unknown investment transaction type 'split'");
        case "transfer":
            return interfaces_1.InvestmentTransactionType.transfer;
        case "returnOfCapital":
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "income":
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "purchased":
            return interfaces_1.InvestmentTransactionType.buy;
        case "sold":
            return interfaces_1.InvestmentTransactionType.sell;
        case "dividendReinvest":
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "tax":
            return interfaces_1.InvestmentTransactionType.cash;
        case "dividend":
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "reinvestOfIncome":
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "interest":
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case "deposit":
            return interfaces_1.InvestmentTransactionType.cash;
        case "otherInfo":
            throw new Error("transaction action could not be translated");
        case "other":
            return interfaces_1.InvestmentTransactionType.cash;
        default:
            throw new Error(`unknown investment transaction type ${txType}`);
    }
};
const transformSecurityType = (secType) => {
    switch (secType) {
        case "Fixed Income":
            return interfaces_1.SecurityType.fixedIncome;
        case "Mutual Fund":
            return interfaces_1.SecurityType.mutualFund;
        case "Option":
            return interfaces_1.SecurityType.option;
        case "Core":
            return interfaces_1.SecurityType.cashEquivalent;
        case "Exchange Traded":
            return interfaces_1.SecurityType.index;
        case "Equity":
            return interfaces_1.SecurityType.equity;
        case "currency":
            return interfaces_1.SecurityType.currency;
        default:
            console.error(`unknown security type ${secType}`);
            return interfaces_1.SecurityType.unknown;
    }
};
class Transformer extends base_transformer_1.default {
    constructor(repository) {
        super(repository);
        this.accounts = (userId, finAccounts) => __awaiter(this, void 0, void 0, function* () {
            let tpAccounts = [];
            for (let i = 0; i < finAccounts.length; i++) {
                const account = finAccounts[i];
                const institution = yield this.repository.getTradingPostInstitutionByFinicityId(parseInt(account.institutionId));
                if (institution === undefined || institution === null)
                    throw new Error(`no institution found for external finicity institution id: ${account.institutionId}`);
                tpAccounts.push({
                    userId: userId,
                    institutionId: institution.id,
                    brokerName: institution.name,
                    status: account.status,
                    accountNumber: account.accountId,
                    mask: account.accountNumberDisplay,
                    name: account.name,
                    officialName: account.number,
                    type: account.type,
                    subtype: null,
                    error: account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185,
                    errorCode: account.aggregationStatusCode,
                    hiddenForDeletion: false,
                    accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING,
                    authenticationService: interfaces_1.DirectBrokeragesType.Finicity
                });
            }
            return yield this.upsertAccounts(tpAccounts);
        });
        this.holdings = (userId, accountId, finHoldings, currency, accountDetails) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let internalAccount = yield this.getFinicityToTradingPostAccount(userId, accountId);
            if (internalAccount === undefined || internalAccount === null)
                throw new Error(`account id(${accountId}) does not exist for holding`);
            const securities = yield this.repository.getSecuritiesWithIssue();
            const cashSecurities = yield this.repository.getTradingpostCashSecurity();
            const securitiesMap = new Map();
            const cashSecuritiesMap = new Map();
            securities.forEach(sec => securitiesMap.set(sec.symbol, sec));
            cashSecurities.forEach(sec => cashSecuritiesMap.set(sec.fromSymbol, sec.toSecurityId));
            let tpHoldings = [];
            let hasCashSecurity = false;
            const holdingDate = luxon_1.DateTime.now().setZone("America/New_York").set({
                hour: 16,
                minute: 0,
                second: 0,
                millisecond: 0
            }).minus({ day: 1 });
            for (let i = 0; i < finHoldings.length; i++) {
                try {
                    let holding = finHoldings[i];
                    const security = yield this._resolveSecurity(holding, securitiesMap, cashSecuritiesMap);
                    if (!security)
                        throw new Error("could not resolve security for holding");
                    if (security.issueType.toLowerCase() === 'cash')
                        hasCashSecurity = true;
                    let priceAsOf = holdingDate;
                    if (holding.currentPriceDate)
                        priceAsOf = luxon_1.DateTime.fromSeconds(holding.currentPriceDate);
                    if (priceAsOf === undefined || priceAsOf === null) {
                        console.error(`no price date set for holding=${holding.id}`);
                        continue;
                    }
                    let cur = currency;
                    if (holding.securityCurrency)
                        cur = holding.securityCurrency;
                    let tpHolding = {
                        accountId: internalAccount.tpBrokerageAccId,
                        securityId: security.id,
                        securityType: security.issueType === 'Cash' ? interfaces_1.SecurityType.cashEquivalent : interfaces_1.SecurityType.equity,
                        price: holding.currentPrice,
                        priceAsOf: priceAsOf,
                        priceSource: 'Finicity',
                        value: parseFloat(holding.marketValue),
                        costBasis: holding.costBasis,
                        quantity: holding.units,
                        currency: cur,
                        optionId: null,
                        holdingDate: holdingDate
                    };
                    if (holding.securityType.toLowerCase() === 'option') {
                        // We are making the assumption that the option already exists within our system since we run
                        // transactions first and an option will be created there...(since they have more meta-data
                        // then we do)
                        const optionExpireDateTime = luxon_1.DateTime.fromSeconds(holding.optionExpiredate);
                        const optionId = yield this.resolveHoldingOptionId(internalAccount.tpBrokerageAccId, security.id, holding.optionStrikePrice, optionExpireDateTime, holding.optionType);
                        if (!optionId) {
                            console.error(`could not resolve option id for security=${security.symbol} strikePrice=${holding.optionStrikePrice} expirationDate=${holding.optionExpiredate}`);
                            continue;
                        }
                        tpHolding.securityType = interfaces_1.SecurityType.option;
                        tpHolding.optionId = optionId;
                    }
                    tpHoldings.push(tpHolding);
                }
                catch (err) {
                    console.error(err);
                }
            }
            // Add a cash security is the broker doesn't display it this way
            if (accountDetails && accountDetails.availableCashBalance && !hasCashSecurity) {
                let cashSecurityId = (_a = cashSecurities.find(a => a.currency === 'USD')) === null || _a === void 0 ? void 0 : _a.toSecurityId;
                if (!cashSecurityId)
                    throw new Error("could not find cash security");
                tpHoldings.push({
                    accountId: internalAccount.tpBrokerageAccId,
                    securityId: cashSecurityId,
                    securityType: interfaces_1.SecurityType.cashEquivalent,
                    price: 1,
                    priceAsOf: luxon_1.DateTime.fromSeconds(accountDetails.dateAsOf),
                    priceSource: "Finicity",
                    value: accountDetails.availableCashBalance,
                    costBasis: null,
                    quantity: accountDetails.availableCashBalance,
                    currency: 'USD',
                    optionId: null,
                    holdingDate: holdingDate
                });
            }
            yield this.upsertPositions(tpHoldings, [internalAccount.tpBrokerageAccId]);
            yield this.historicalHoldings(tpHoldings);
        });
        this.transactions = (userId, finTransactions) => __awaiter(this, void 0, void 0, function* () {
            const securities = yield this.repository.getSecuritiesWithIssue();
            const cashSecurities = yield this.repository.getTradingpostCashSecurity();
            const cashSecuritiesMap = new Map();
            const securitiesMap = new Map();
            securities.forEach(sec => securitiesMap.set(sec.symbol, sec));
            cashSecurities.forEach(sec => cashSecuritiesMap.set(sec.fromSymbol, sec.toSecurityId));
            const tpAccountsWithFinicityId = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            const finicityIdToTpAccountMap = new Map();
            tpAccountsWithFinicityId.forEach(tpa => finicityIdToTpAccountMap.set(tpa.externalFinicityAccountId, tpa.tpBrokerageAccId));
            let tpTransactions = [];
            for (let i = 0; i < finTransactions.length; i++) {
                const transaction = finTransactions[i];
                const internalTpAccountId = finicityIdToTpAccountMap.get(transaction.accountId.toString());
                if (!internalTpAccountId)
                    throw new Error(`could not get tradingpost account for finicity account id: ${transaction.accountId} transaction id: ${transaction.id} user id: ${userId}`);
                switch (transaction.investmentTransactionType) {
                    case "fee":
                    case "interest":
                    case "deposit":
                    case "transfer":
                    case "other":
                    case "contribution":
                    case "dividend":
                        transaction.ticker = "USD:CUR";
                }
                if (transaction.ticker && cashSecuritiesMap.has(transaction.ticker)) { // @ts-ignore
                    transaction.ticker = cashSecuritiesMap.get(transaction.ticker);
                }
                if (!transaction.ticker)
                    throw new Error(`no symbol (${transaction.id}) available for transaction type ${transaction.investmentTransactionType}`);
                let security = securitiesMap.get(transaction.ticker);
                if (!security)
                    throw new Error(`could not find symbol(${transaction.ticker} for holding`);
                const optionId = yield this.isTransactionAnOption(transaction, security.id);
                // TODO: We should check if its just a general "cash" security...
                if (!transaction.unitQuantity && transaction.ticker !== "USD:CUR")
                    throw new Error(`not unit quantity for non-cash security symbol: ${transaction.ticker} ${transaction.transactionId}`);
                if (!transaction.unitQuantity)
                    transaction.unitQuantity = transaction.amount;
                let price = transaction.unitPrice ? transaction.unitPrice : (transaction.amount / transaction.unitQuantity);
                let securityType = interfaces_1.SecurityType.equity;
                if (transaction.ticker === 'USD:CUR')
                    securityType = interfaces_1.SecurityType.cashEquivalent;
                if (optionId)
                    securityType = interfaces_1.SecurityType.option;
                let transactionType = transformTransactionType(transaction.investmentTransactionType);
                let newTpTx = {
                    optionId: optionId,
                    accountId: internalTpAccountId,
                    securityId: security.id,
                    securityType: securityType,
                    date: luxon_1.DateTime.fromSeconds(transaction.postedDate),
                    quantity: transaction.unitQuantity,
                    price: price,
                    amount: transaction.amount,
                    fees: transaction.feeAmount,
                    type: transactionType,
                    currency: null,
                };
                newTpTx = (0, base_transformer_1.transformTransactionTypeAmount)(transactionType, newTpTx);
                tpTransactions.push(newTpTx);
            }
            yield this.upsertTransactions(tpTransactions);
        });
        this.historicalHoldings = (tpHoldings) => __awaiter(this, void 0, void 0, function* () {
            const hh = tpHoldings.map(h => {
                let x = {
                    costBasis: h.costBasis,
                    quantity: h.quantity,
                    date: h.holdingDate,
                    value: h.value,
                    optionId: h.optionId,
                    currency: h.currency,
                    priceSource: h.priceSource,
                    priceAsOf: h.priceAsOf,
                    securityType: h.securityType,
                    securityId: h.securityId,
                    price: h.price,
                    accountId: h.accountId,
                };
                return x;
            }).filter(h => {
                if (h.securityType === interfaces_1.SecurityType.mutualFund)
                    return false;
                if (h.securityType === interfaces_1.SecurityType.currency)
                    return false;
                return true;
            });
            yield this.upsertHistoricalHoldings(hh);
        });
        this.getFinicityToTradingPostAccount = (userId, accountId) => __awaiter(this, void 0, void 0, function* () {
            const finicityAccounts = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            let internalAccount = null;
            for (let i = 0; i < finicityAccounts.length; i++) {
                const finAcc = finicityAccounts[i];
                if (finAcc.externalFinicityAccountId === accountId)
                    internalAccount = finAcc;
            }
            return internalAccount;
        });
        this._resolveSecurity = (holding, securitiesMap, cashSecuritiesMap) => __awaiter(this, void 0, void 0, function* () {
            let security = securitiesMap.get(holding.symbol);
            let cashSecurity = cashSecuritiesMap.get(holding.symbol);
            if (!security && !cashSecurity) {
                const secType = transformSecurityType(holding.securityType);
                const sec = {
                    companyName: holding.securityName,
                    securityName: holding.securityName,
                    issueType: secType,
                    description: holding.description,
                    symbol: holding.symbol,
                    logoUrl: null,
                    phone: null,
                    country: null,
                    state: null,
                    address2: null,
                    tags: [],
                    employees: null,
                    industry: null,
                    exchange: null,
                    primarySicCode: null,
                    ceo: null,
                    zip: null,
                    address: null,
                    website: null,
                    sector: null,
                    enableUtp: false,
                    priceSource: interfaces_2.PriceSourceType.FINICITY
                };
                console.log("ADDING SECURITY ", sec.symbol);
                const securityId = yield this.repository.addSecurity(sec);
                security = {
                    id: securityId,
                    symbol: sec.symbol,
                    name: sec.securityName ? sec.securityName : '',
                    issueType: secType
                };
                securitiesMap.set(holding.symbol, security);
            }
            else if (!security && cashSecurity) {
                security = {
                    id: cashSecurity,
                    symbol: holding.symbol,
                    name: 'Cash',
                    issueType: 'Cash'
                };
            }
            return security;
        });
        this.resolveHoldingOptionId = (accountId, securityId, strikePrice, expirationDate, optionType) => __awaiter(this, void 0, void 0, function* () {
            const option = yield this.repository.getOptionContract(securityId, expirationDate, strikePrice, optionType);
            if (!option) {
                return yield this.repository.addOptionContract({
                    strikePrice: strikePrice,
                    securityId: securityId,
                    type: optionType,
                    expiration: expirationDate,
                    externalId: null
                });
            }
            return option.id;
        });
        this.isTransactionAnOption = (transaction, securityId) => __awaiter(this, void 0, void 0, function* () {
            // Parse out the expiration date, strike price and option type(put/call)
            // Check our DB to see if it exists, if it does, then push into structure
            // Thinking for each institution we are going ot have to create our own parser for options and validate the memo
            // and description like finicity does, but rather than defaulting to finicity, we just use our own representation...
            if (!transaction.description.toLowerCase().includes("call") && !transaction.description.toLowerCase().includes("put")) {
                return null;
            }
            // Lazy man's way of pulling out terms / dates / etc... rather than writing regular expression
            // Example: Sold 1 OPEN Oct 28 2022 3.0 Call @ 0.43 Sold=Action, 1=Qty, OPEN=symbol, Oct=Month, 28=Day,
            // 2022=Year 3.0=StrikePrice, Call = type of option, @=_(Not needed) 0.43 = price
            const [action, qty, symbol, month, day, year, strikePriceStr, optionType, _, price] = transaction.description.split(" ");
            const dtStr = `${month} ${day}, ${year}`; // Oct 6, 2014
            const expirationDate = luxon_1.DateTime.fromFormat(dtStr, "DD");
            if (!expirationDate.isValid) {
                console.warn(`could not parse expiration date=${dtStr}`);
            }
            const strikePrice = parseFloat(strikePriceStr);
            const option = yield this.repository.getOptionContract(securityId, expirationDate, strikePrice, optionType);
            if (!option) {
                return yield this.repository.addOptionContract({
                    strikePrice: strikePrice,
                    securityId: securityId,
                    type: optionType,
                    expiration: expirationDate,
                    externalId: null
                });
            }
            return option.id;
        });
        this.institutions = (institutions) => __awaiter(this, void 0, void 0, function* () {
            const tformInstitutions = institutions.map(ins => {
                let x = {
                    externalId: `fin_${ins.id}`,
                    name: ins.name,
                    accountTypeDescription: ins.accountTypeDescription,
                    phone: ins.phone,
                    urlHomeApp: ins.urlHomeApp,
                    urlLogonApp: ins.urlLogonApp,
                    oauthEnabled: ins.oauthEnabled,
                    urlForgotPassword: ins.urlForgotPassword,
                    urlOnlineRegistration: ins.urlOnlineRegistration,
                    class: ins.class,
                    status: ins.status,
                    addressAddressLine1: ins.addressLine1,
                    addressAddressLine2: ins.addressLine2,
                    addressCity: ins.addressCity,
                    addressState: ins.addressState,
                    addressCountry: ins.addressCountry,
                    addressPostalCode: ins.addressPostalCode,
                    email: ins.email
                };
                return x;
            });
            yield this.repository.upsertInstitutions(tformInstitutions);
        });
        this.institution = (institution) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c, _d, _e, _f, _g;
            const { institution: ins } = institution;
            const tpInId = yield this.repository.upsertInstitution({
                externalId: `fin_${ins.id}`,
                name: ins.name,
                accountTypeDescription: ins.accountTypeDescription,
                phone: ins.phone,
                urlHomeApp: ins.urlHomeApp,
                urlLogonApp: ins.urlLogonApp,
                oauthEnabled: ins.oauthEnabled,
                urlForgotPassword: ins.urlForgotPassword,
                urlOnlineRegistration: ins.urlOnlineRegistration,
                class: ins.class,
                status: ins.status,
                addressAddressLine1: (_b = ins.address) === null || _b === void 0 ? void 0 : _b.addressLine1,
                addressAddressLine2: (_c = ins.address) === null || _c === void 0 ? void 0 : _c.addressLine2,
                addressCity: (_d = ins.address) === null || _d === void 0 ? void 0 : _d.city,
                addressState: (_e = ins.address) === null || _e === void 0 ? void 0 : _e.state,
                addressCountry: (_f = ins.address) === null || _f === void 0 ? void 0 : _f.country,
                addressPostalCode: (_g = ins.address) === null || _g === void 0 ? void 0 : _g.postalCode,
                email: ins.email
            });
            return tpInId;
        });
        this.repository = repository;
    }
}
exports.Transformer = Transformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQW9CdUI7QUFFdkIsaUNBQStCO0FBQy9CLDZEQUEwRTtBQUMxRSx3RUFBb0c7QUF3QnBHLHdIQUF3SDtBQUN4SCxNQUFNLHdCQUF3QixHQUFHLENBQUMsTUFBYyxFQUE2QixFQUFFO0lBQzNFLFFBQVEsTUFBTSxFQUFFO1FBQ1osS0FBSyxRQUFRO1lBQ1QsT0FBTyxzQ0FBeUIsQ0FBQyxNQUFNLENBQUE7UUFDM0MsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxzQ0FBeUIsQ0FBQyxLQUFLLENBQUE7UUFDMUMsS0FBSyxjQUFjO1lBQ2YsT0FBTyxzQ0FBeUIsQ0FBQyxJQUFJLENBQUE7UUFDekMsS0FBSyxnQkFBZ0I7WUFDakIsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxrQkFBa0I7WUFDbkIsT0FBTyxzQ0FBeUIsQ0FBQyxNQUFNLENBQUE7UUFDM0MsS0FBSyxLQUFLO1lBQ04sT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxhQUFhO1lBQ2QsT0FBTyxzQ0FBeUIsQ0FBQyxJQUFJLENBQUE7UUFDekMsS0FBSyxZQUFZO1lBQ2IsT0FBTyxzQ0FBeUIsQ0FBQyxLQUFLLENBQUE7UUFDMUMsS0FBSyxPQUFPO1lBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFBO1FBQ2xFLEtBQUssVUFBVTtZQUNYLE9BQU8sc0NBQXlCLENBQUMsUUFBUSxDQUFBO1FBQzdDLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sc0NBQXlCLENBQUMsa0JBQWtCLENBQUE7UUFDdkQsS0FBSyxRQUFRO1lBQ1QsT0FBTyxz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