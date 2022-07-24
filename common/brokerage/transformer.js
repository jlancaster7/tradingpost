"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHoldingsHistory = exports.transformTransactions = exports.transformHoldings = exports.transformAccounts = void 0;
const luxon_1 = require("luxon");
const interfaces_1 = require("./interfaces");
const transformerMap = {
    "": ""
};
const transformAccounts = (userId, finAccounts, institutionMap) => {
    return finAccounts.map((fa) => {
        let institution = institutionMap[fa.institutionId];
        let o = {
            userId: userId,
            accountNumber: fa.number,
            status: fa.status,
            name: fa.accountNickname,
            officialName: fa.name,
            mask: fa.accountNumberDisplay,
            type: fa.type,
            subtype: fa.marketSegment,
            brokerName: institution.name,
            institutionId: institution.id,
        };
        return o;
    });
};
exports.transformAccounts = transformAccounts;
const transformHoldings = (finHoldings) => {
    return finHoldings.map(fh => {
        return {
            currency: '',
            accountId: 0,
            securityId: 0,
            costBasis: null,
            price: 0,
            priceAsOf: luxon_1.DateTime.now(),
            value: 0,
            priceSource: '',
            quantity: 0,
            securityType: null
        };
    });
};
exports.transformHoldings = transformHoldings;
const transformTransactions = (finTransactions) => {
    return finTransactions.map(fh => {
        return {
            currency: '',
            securityId: 0,
            accountId: 0,
            date: luxon_1.DateTime.now(),
            price: 0,
            type: interfaces_1.InvestmentTransactionType.buy,
            amount: 0,
            quantity: 0,
            fees: 0,
            securityType: interfaces_1.SecurityType.unknown
        };
    });
};
exports.transformTransactions = transformTransactions;
const computeHoldingsHistory = () => {
};
exports.computeHoldingsHistory = computeHoldingsHistory;
