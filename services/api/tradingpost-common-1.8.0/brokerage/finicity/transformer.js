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
                    accountNumber: account.number,
                    mask: account.accountNumberDisplay,
                    name: account.name,
                    officialName: account.number,
                    type: account.type,
                    subtype: null,
                    error: account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185,
                    errorCode: account.aggregationStatusCode,
                    hiddenForDeletion: false,
                    accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING
                });
            }
            yield this.upsertAccounts(tpAccounts);
        });
        this.holdings = (userId, accountId, finHoldings, holdingDate, currency, accountDetails) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let internalAccount = yield this.getFinicityToTradingPostAccount(userId, accountId);
            if (internalAccount === undefined || internalAccount === null)
                throw new Error(`account id(${accountId}) does not exist for holding`);
            const securities = yield this.repository.getSecuritiesWithIssue();
            const cashSecurities = yield this.repository.getTradingpostCashSecurity();
            const securitiesMap = {};
            const cashSecuritiesMap = {};
            securities.forEach(sec => securitiesMap[sec.symbol] = sec);
            cashSecurities.forEach(sec => cashSecuritiesMap[sec.fromSymbol] = sec.toSecurityId);
            let tpHoldings = [];
            let isCashSecurity = false;
            // TODO: revisit this ... do we want to completely botch the holdings / etc when a holding fails?
            //  at the end of the day, how do we want to present the state of holdings itself to users? In an incomplete,
            //  but correct form, -- meaning not all their holdings are added, but the ones that are, are valid. Or,
            //  not at all until all holdings can be verified, or all holdings even if they are incorrect(assuming its
            //  not the latter).
            for (let i = 0; i < finHoldings.length; i++) {
                try {
                    let holding = finHoldings[i];
                    const security = yield this._resolveSecurity(holding, securitiesMap, cashSecuritiesMap);
                    if (security.issueType.toLowerCase() === 'cash')
                        isCashSecurity = true;
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
                    if (holding.securityType.toLowerCase() === 'option') {
                        // We are making the assumption that the option already exists within our system since we run
                        // transactions first and an option will be created there...(since they have more meta-data
                        // then we do)
                        const optionExpireDateTime = luxon_1.DateTime.fromSeconds(holding.optionExpiredate);
                        const optionId = yield this.resolveHoldingOptionId(internalAccount.id, security.id, holding.optionStrikePrice, optionExpireDateTime, holding.optionType);
                        if (!optionId) {
                            console.error(`could not resolve option id for security=${security.symbol} strikePrice=${holding.optionStrikePrice} expirationDate=${holding.optionExpiredate}`);
                            continue;
                        }
                        tpHoldings.push({
                            accountId: internalAccount.id,
                            securityId: security.id,
                            securityType: interfaces_1.SecurityType.option,
                            price: holding.currentPrice,
                            priceAsOf: priceAsOf,
                            priceSource: '',
                            value: parseFloat(holding.marketValue),
                            costBasis: holding.costBasis,
                            quantity: holding.units,
                            currency: cur,
                            optionId: optionId,
                            holdingDate: luxon_1.DateTime.now()
                        });
                        continue;
                    }
                    tpHoldings.push({
                        accountId: internalAccount.id,
                        securityId: security.id,
                        securityType: security.issueType === 'Cash' ? interfaces_1.SecurityType.cashEquivalent : interfaces_1.SecurityType.equity,
                        price: holding.currentPrice,
                        priceAsOf: priceAsOf,
                        priceSource: '',
                        value: parseFloat(holding.marketValue),
                        costBasis: holding.costBasis,
                        quantity: holding.units,
                        currency: cur,
                        optionId: null,
                        holdingDate: luxon_1.DateTime.now()
                    });
                }
                catch (err) {
                    console.error(err);
                }
            }
            // Add a cash security is the broker doesn't display it this way
            if (accountDetails && accountDetails.availableCashBalance && !isCashSecurity) {
                let cashSecurityId = (_a = cashSecurities.find(a => a.currency === 'USD')) === null || _a === void 0 ? void 0 : _a.toSecurityId;
                tpHoldings.push({
                    accountId: internalAccount.id,
                    // @ts-ignore
                    securityId: cashSecurityId,
                    securityType: interfaces_1.SecurityType.cashEquivalent,
                    price: 1,
                    priceAsOf: luxon_1.DateTime.fromSeconds(accountDetails.dateAsOf),
                    priceSource: '',
                    value: accountDetails.availableCashBalance,
                    costBasis: null,
                    quantity: accountDetails.availableCashBalance,
                    currency: 'USD',
                    optionId: null,
                });
            }
            yield this.upsertPositions(tpHoldings, [internalAccount.id]);
            yield this.historicalHoldings(tpHoldings);
        });
        this.transactions = (userId, finTransactions) => __awaiter(this, void 0, void 0, function* () {
            const securities = yield this.repository.getSecuritiesWithIssue();
            const cashSecurities = yield this.repository.getTradingpostCashSecurity();
            const cashSecuritiesMap = {};
            const securitiesMap = {};
            securities.forEach(sec => securitiesMap[sec.symbol] = sec);
            cashSecurities.forEach(sec => cashSecuritiesMap[sec.fromSymbol] = sec.toSecurityId);
            const tpAccountsWithFinicityId = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            const finicityIdToTpAccountMap = {};
            tpAccountsWithFinicityId.forEach(tpa => finicityIdToTpAccountMap[tpa.externalFinicityAccountId] = tpa.id);
            let tpTransactions = [];
            for (let i = 0; i < finTransactions.length; i++) {
                const transaction = finTransactions[i];
                const internalTpAccountId = finicityIdToTpAccountMap[transaction.accountId];
                if (!internalTpAccountId)
                    throw new Error(`could not get internal account id for transaction with id ${transaction.id} for user ${userId}`);
                if (!transaction.ticker || Object.keys(cashSecuritiesMap).includes(transaction.ticker)) {
                    switch (transaction.investmentTransactionType) {
                        case "fee":
                        case "interest":
                        case "deposit":
                        case "transfer":
                        case "other":
                        case "contribution":
                            transaction.ticker = "USD:CUR";
                            break;
                        default:
                            throw new Error(`no symbol available for transaction type ${transaction.investmentTransactionType}`);
                    }
                }
                let security = securitiesMap[transaction.ticker];
                if (!security)
                    throw new Error(`could not find symbol(${transaction.ticker} for holding`);
                const optionId = yield this.isTransactionAnOption(transaction, security.id);
                // TODO: We should check if its just a general "cash" security...
                if (!transaction.unitQuantity && transaction.ticker !== "USD:CUR") {
                    console.error("not unit quantity for non-cash security");
                    continue;
                }
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
                    date: h.holdingDate.setZone("America/New_York").set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                    value: h.value,
                    optionId: h.optionId,
                    currency: h.currency,
                    priceSource: h.priceSource,
                    priceAsOf: h.priceAsOf,
                    securityType: h.securityType,
                    securityId: h.securityId,
                    price: h.price,
                    accountId: h.accountId
                };
                return x;
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
            let security = securitiesMap[holding.symbol];
            let cashSecurity = cashSecuritiesMap[holding.symbol];
            if (!security && !cashSecurity) {
                const sec = {
                    companyName: holding.securityName,
                    securityName: holding.securityName,
                    issueType: holding.securityType,
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
                const securityId = yield this.repository.addSecurity(sec);
                security = {
                    id: securityId,
                    symbol: sec.symbol,
                    name: sec.securityName ? sec.securityName : '',
                    issueType: sec.issueType ? sec.issueType : ''
                };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQW1CdUI7QUFFdkIsaUNBQStCO0FBQy9CLDZEQUEwRTtBQUMxRSx3RUFBb0c7QUF3QnBHLHdIQUF3SDtBQUN4SCxNQUFNLHdCQUF3QixHQUFHLENBQUMsTUFBYyxFQUE2QixFQUFFO0lBQzNFLFFBQVEsTUFBTSxFQUFFO1FBQ1osS0FBSyxRQUFRO1lBQ1QsT0FBTyxzQ0FBeUIsQ0FBQyxNQUFNLENBQUE7UUFDM0MsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxzQ0FBeUIsQ0FBQyxLQUFLLENBQUE7UUFDMUMsS0FBSyxjQUFjO1lBQ2YsT0FBTyxzQ0FBeUIsQ0FBQyxJQUFJLENBQUE7UUFDekMsS0FBSyxnQkFBZ0I7WUFDakIsT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxrQkFBa0I7WUFDbkIsT0FBTyxzQ0FBeUIsQ0FBQyxNQUFNLENBQUE7UUFDM0MsS0FBSyxLQUFLO1lBQ04sT0FBTyxzQ0FBeUIsQ0FBQyxHQUFHLENBQUE7UUFDeEMsS0FBSyxhQUFhO1lBQ2QsT0FBTyxzQ0FBeUIsQ0FBQyxJQUFJLENBQUE7UUFDekMsS0FBSyxZQUFZO1lBQ2IsT0FBTyxzQ0FBeUIsQ0FBQyxLQUFLLENBQUE7UUFDMUMsS0FBSyxPQUFPO1lBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFBO1FBQ2xFLEtBQUssVUFBVTtZQUNYLE9BQU8sc0NBQXlCLENBQUMsUUFBUSxDQUFBO1FBQzdDLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sc0NBQXlCLENBQUMsa0JBQWtCLENBQUE7UUFDdkQsS0FBSyxRQUFRO1lBQ1QsT0FBTyxz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