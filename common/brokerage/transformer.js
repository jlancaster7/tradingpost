"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHoldingsHistory = exports.transformTransactions = exports.transformHoldings = exports.transformAccounts = void 0;
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
            accountId: '',
            securityId: '',
            costBasis: '',
            price: '',
            priceAsOf: '',
            value: '',
            priceSource: '',
            quantity: '',
            securityType: ''
        };
    });
};
exports.transformHoldings = transformHoldings;
const transformTransactions = (finTransactions) => {
    return finTransactions.map(fh => {
        return {
            currency: '',
            securityId: '',
            accountId: '',
            date: '',
            price: '',
            type: '',
            amount: '',
            quantity: '',
            fees: '',
            securityType: ''
        };
    });
};
exports.transformTransactions = transformTransactions;
const computeHoldingsHistory = () => {
};
exports.computeHoldingsHistory = computeHoldingsHistory;
