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
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const luxon_1 = require("luxon");
// Finicity Types Found Here: https://api-reference.finicity.com/#/rest/models/enumerations/investment-transaction-types
const transformTransactionType = (finicityTxType) => {
    switch (finicityTxType) {
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
        default:
            throw new Error(`unknown investment transaction type ${finicityTxType}`);
    }
};
const transformSecurityType = (finSecType) => {
    return interfaces_1.SecurityType.equity;
};
class FinicityTransformer {
    constructor(repository) {
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
                    subtype: null
                });
            }
            return tpAccounts;
        });
        this.holdings = (userId, accountId, finHoldings, holdingDate, currency) => __awaiter(this, void 0, void 0, function* () {
            const finicityAccounts = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            let internalAccount = null;
            for (let i = 0; i < finicityAccounts.length; i++) {
                const finAcc = finicityAccounts[i];
                if (finAcc.externalFinicityAccountId === accountId)
                    internalAccount = finAcc;
            }
            if (internalAccount === undefined || internalAccount === null)
                throw new Error(`account id(${accountId}) does not exist for holding`);
            const securities = yield this.repository.getSecuritiesWithIssue();
            const securitiesMap = {};
            securities.forEach(sec => securitiesMap[sec.symbol] = sec);
            let tpHoldings = [];
            for (let i = 0; i < finHoldings.length; i++) {
                let holding = finHoldings[i];
                let security = securitiesMap[holding.symbol];
                if (security === undefined || security === null) {
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
                        sector: null
                    };
                    const securityId = yield this.repository.addSecurity(sec);
                    security = {
                        id: securityId,
                        symbol: sec.symbol,
                        name: sec.securityName ? sec.securityName : '',
                        issueType: sec.issueType ? sec.issueType : ''
                    };
                }
                let priceAsOf = holdingDate;
                if (holding.currentPriceDate)
                    priceAsOf = luxon_1.DateTime.fromSeconds(holding.currentPriceDate);
                if (priceAsOf === undefined || priceAsOf === null)
                    throw new Error(`no price date set for holding ${holding.id}`);
                let cur = currency;
                if (holding.securityCurrency)
                    cur = holding.securityCurrency;
                tpHoldings.push({
                    accountId: internalAccount.id,
                    securityId: security.id,
                    securityType: null,
                    price: holding.currentPrice,
                    priceAsOf: priceAsOf,
                    priceSource: '',
                    value: parseFloat(holding.marketValue),
                    costBasis: holding.costBasis,
                    quantity: holding.units,
                    currency: cur
                });
            }
            return tpHoldings;
        });
        this.transactions = (userId, finTransactions) => __awaiter(this, void 0, void 0, function* () {
            const securities = yield this.repository.getSecuritiesWithIssue();
            const securitiesMap = {};
            securities.forEach(sec => securitiesMap[sec.symbol] = sec);
            const tpAccountsWithFinicityId = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            const finicityIdToTpAccountMap = {};
            tpAccountsWithFinicityId.forEach(tpa => finicityIdToTpAccountMap[tpa.externalFinicityAccountId] = tpa.id);
            let tpTransactions = [];
            for (let i = 0; i < finTransactions.length; i++) {
                const transaction = finTransactions[i];
                const internalTpAccountId = finicityIdToTpAccountMap[transaction.accountId];
                if (!internalTpAccountId)
                    throw new Error(`could not get internal account id for transaction with id ${transaction.id} for user ${userId}`);
                if (!transaction.ticker) {
                    switch (transaction.investmentTransactionType) {
                        case "fee":
                        case "interest":
                        case "deposit":
                        case "transfer":
                        case "contribution":
                            transaction.ticker = "USD:CUR";
                            break;
                        default:
                            throw new Error(`no symbol available for transaction type ${transaction.investmentTransactionType}`);
                    }
                }
                let security = securitiesMap[transaction.ticker];
                if (security === undefined || security === null)
                    throw new Error(`could not find symbol(${transaction.ticker} for holding`);
                if (!transaction.unitQuantity)
                    transaction.unitQuantity = 1;
                // TODO: Can we be sure that they didnt factor in fees, or if they did that we have an attribute that includes fees?
                let price = 0;
                if (!transaction.unitPrice)
                    price = transaction.amount / transaction.unitQuantity;
                else
                    price = transaction.unitPrice;
                let securityType = transformSecurityType(transaction.investmentTransactionType);
                let transactionType = transformTransactionType(transaction.investmentTransactionType);
                tpTransactions.push({
                    accountId: internalTpAccountId,
                    securityId: security.id,
                    securityType: securityType,
                    date: luxon_1.DateTime.fromSeconds(transaction.postedDate),
                    quantity: transaction.unitQuantity,
                    price: price,
                    amount: transaction.amount,
                    fees: transaction.feeAmount,
                    type: transactionType,
                    currency: null
                });
            }
            return tpTransactions;
        });
        this.repository = repository;
    }
}
exports.default = FinicityTransformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLDhDQVl1QjtBQUN2QixpQ0FBK0I7QUFlL0Isd0hBQXdIO0FBQ3hILE1BQU0sd0JBQXdCLEdBQUcsQ0FBQyxjQUFzQixFQUE2QixFQUFFO0lBQ25GLFFBQVEsY0FBYyxFQUFFO1FBQ3BCLEtBQUssUUFBUTtZQUNULE9BQU8sc0NBQXlCLENBQUMsTUFBTSxDQUFBO1FBQzNDLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFBO1FBQ3hDLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sc0NBQXlCLENBQUMsS0FBSyxDQUFBO1FBQzFDLEtBQUssY0FBYztZQUNmLE9BQU8sc0NBQXlCLENBQUMsSUFBSSxDQUFBO1FBQ3pDLEtBQUssZ0JBQWdCO1lBQ2pCLE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFBO1FBQ3hDLEtBQUssa0JBQWtCO1lBQ25CLE9BQU8sc0NBQXlCLENBQUMsTUFBTSxDQUFBO1FBQzNDLEtBQUssS0FBSztZQUNOLE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFBO1FBQ3hDLEtBQUssYUFBYTtZQUNkLE9BQU8sc0NBQXlCLENBQUMsSUFBSSxDQUFBO1FBQ3pDLEtBQUssWUFBWTtZQUNiLE9BQU8sc0NBQXlCLENBQUMsS0FBSyxDQUFBO1FBQzFDLEtBQUssT0FBTztZQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQTtRQUNsRSxLQUFLLFVBQVU7WUFDWCxPQUFPLHNDQUF5QixDQUFDLFFBQVEsQ0FBQTtRQUM3QyxLQUFLLGlCQUFpQjtZQUNsQixPQUFPLHNDQUF5QixDQUFDLGtCQUFrQixDQUFBO1FBQ3ZELEtBQUssUUFBUTtZQUNULE9BQU8sc0NBQXlCLENBQUMsa0JBQWtCLENBQUE7UUFDdkQsS0FBSyxXQUFXO1lBQ1osT0FBTyxz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