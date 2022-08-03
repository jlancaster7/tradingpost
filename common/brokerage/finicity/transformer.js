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
            throw new Error("unknown investment transaction type 'contribution'");
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
            throw new Error("unknown investment transaction type 'tax'");
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
                if (security === undefined || security === null)
                    throw new Error(`could not find symbol(${holding.symbol} for holding`);
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
                if (!transaction.ticker)
                    throw new Error(`no ticker for transaction id ${transaction.id} on user ${userId}`);
                let security = securitiesMap[transaction.ticker];
                if (security === undefined || security === null)
                    throw new Error(`could not find symbol(${transaction.ticker} for holding`);
                if (!transaction.unitQuantity)
                    throw new Error(`no quantity on transaction id ${transaction.id} on user ${userId}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLDhDQVl1QjtBQUN2QixpQ0FBK0I7QUFZL0Isd0hBQXdIO0FBQ3hILE1BQU0sd0JBQXdCLEdBQUcsQ0FBQyxjQUFzQixFQUE2QixFQUFFO0lBQ25GLFFBQVEsY0FBYyxFQUFFO1FBQ3BCLEtBQUssUUFBUTtZQUNULE9BQU8sc0NBQXlCLENBQUMsTUFBTSxDQUFBO1FBQzNDLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sc0NBQXlCLENBQUMsR0FBRyxDQUFBO1FBQ3hDLEtBQUssaUJBQWlCO1lBQ2xCLE9BQU8sc0NBQXlCLENBQUMsS0FBSyxDQUFBO1FBQzFDLEtBQUssY0FBYztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtRQUN6RSxLQUFLLGdCQUFnQjtZQUNqQixPQUFPLHNDQUF5QixDQUFDLEdBQUcsQ0FBQTtRQUN4QyxLQUFLLGtCQUFrQjtZQUNuQixPQUFPLHNDQUF5QixDQUFDLE1BQU0sQ0FBQTtRQUMzQyxLQUFLLEtBQUs7WUFDTixPQUFPLHNDQUF5QixDQUFDLEdBQUcsQ0FBQTtRQUN4QyxLQUFLLGFBQWE7WUFDZCxPQUFPLHNDQUF5QixDQUFDLElBQUksQ0FBQTtRQUN6QyxLQUFLLFlBQVk7WUFDYixPQUFPLHNDQUF5QixDQUFDLEtBQUssQ0FBQTtRQUMxQyxLQUFLLE9BQU87WUFDUixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUE7UUFDbEUsS0FBSyxVQUFVO1lBQ1gsT0FBTyxzQ0FBeUIsQ0FBQyxRQUFRLENBQUE7UUFDN0MsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxzQ0FBeUIsQ0FBQyxrQkFBa0IsQ0FBQTtRQUN2RCxLQUFLLFFBQVE7WUFDVCxPQUFPLHNDQUF5QixDQUFDLGtCQUFrQixDQUFBO1FBQ3ZELEtBQUssV0FBVztZ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