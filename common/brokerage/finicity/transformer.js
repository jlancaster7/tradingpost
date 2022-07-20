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
exports.FinicityTransformer = void 0;
const interfaces_1 = require("../interfaces");
const luxon_1 = require("luxon");
class FinicityTransformer {
    constructor(repository) {
        this.accounts = (userId, finAccounts) => __awaiter(this, void 0, void 0, function* () {
            const finicityAccounts = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            const finAccountMap = {};
            finicityAccounts.forEach((fam) => finAccountMap[fam.externalFinicityAccountId] = fam);
            const institutions = yield this.repository.getFinicityInstitutions();
            let institutionMap = {};
            institutions.forEach(inst => institutionMap[inst.externalFinicityId] = inst);
            let tpAccounts = [];
            for (let i = 0; i < finAccounts.length; i++) {
                const account = finAccounts[i];
                let institution = institutionMap[account.institutionId];
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
            const finicityAccounts = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            const finAccountMap = {};
            finicityAccounts.forEach((fam) => finAccountMap[fam.externalFinicityAccountId] = fam);
            const securities = yield this.repository.getSecuritiesWithIssue();
            const securitiesMap = {};
            securities.forEach(sec => securitiesMap[sec.symbol] = sec);
            let tpTransactions = [];
            for (let i = 0; i < finTransactions.length; i++) {
                const transaction = finTransactions[i];
                let internalAccount = finAccountMap[transaction.accountId];
                if (internalAccount === undefined || internalAccount === null)
                    throw new Error(`account id(${transaction.accountId}) does not exist for holding`);
                let security = securitiesMap[transaction.ticker];
                if (security === undefined || security === null)
                    throw new Error(`could not find symbol(${transaction.ticker} for holding`);
                let transactionType = transformInvestmentTransactionType(transaction);
                let securityType = transformSecurityType(security.issueType);
                let price = transaction.unitPrice;
                let amount = transformTransactionAmount(transaction.amount, transactionType);
                let fees = transformFees(transaction.feeAmount);
                let txType = null;
                if (transaction.type)
                    txType = transaction.type;
                if (transaction.buyType)
                    txType = transaction.buyType;
                tpTransactions.push({
                    accountId: internalAccount.id,
                    securityId: security.id,
                    securityType: securityType,
                    date: luxon_1.DateTime.fromSeconds(transaction.postedDate),
                    quantity: transaction.unitQuantity,
                    price: price,
                    amount: amount,
                    fees: fees,
                    type: transactionType,
                    currency: transaction.currencySymbol
                });
            }
            return tpTransactions;
        });
        this.repository = repository;
    }
}
exports.FinicityTransformer = FinicityTransformer;
const transformTransactionAmount = (amount, type) => {
    if (type === interfaces_1.InvestmentTransactionType.buy)
        return amount > 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.cover)
        return amount > 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.sell)
        return amount < 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.short)
        return amount < 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.cancel)
        return amount < 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.fee)
        return amount > 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.cash)
        return amount < 0 ? amount : amount * -1;
    if (type === interfaces_1.InvestmentTransactionType.dividendOrInterest)
        return amount < 0 ? amount : amount * -1;
    throw new Error(`investment transaction type :::: ${type} :::: has not be declared yet`);
};
const transformFees = (fee) => {
    if (fee > 0)
        return fee;
    return (fee * -1);
};
// TODO: Custom logic for Finicity here...
const transformInvestmentTransactionType = (tx) => {
    return interfaces_1.InvestmentTransactionType.buy;
};
// TODO: Custom Logic for Finicity here...
const transformSecurityType = (type) => {
    return interfaces_1.SecurityType.equity;
};
