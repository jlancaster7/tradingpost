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
exports.computeHoldingsHistory = exports.transformTransactions = exports.transformHoldings = exports.transformAccounts = void 0;
const interfaces_1 = require("./interfaces");
const luxon_1 = require("luxon");
const transformerMap = {
    "": ""
};
class Transformer {
    constructor(repository) {
        this.accounts = (userId, finAccounts, institutionMap) => {
            const finicityAccounts = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
        };
        this.holdings = (userId, finHoldings, holdingDate) => {
            const finicityAccounts = yield this.repository.getTradingPostAccountsWithFinicityNumber(userId);
            const finAccountMap = {};
            finicityAccounts.forEach((fam) => finAccountMap[fam.externalFinicityAccountId] = fam);
            const securities = yield this.repository.getSecurities();
            const securitiesMap = {};
            securities.forEach(sec => securitiesMap[sec.symbol] = sec);
            let tpHoldings = [];
            for (let i = 0; i < finHoldings.length; i++) {
                let holding = finHoldings[i];
                let internalAccount = finAccountMap[holding.finicityAccountId];
                if (internalAccount === undefined || internalAccount === null)
                    throw new Error(`account id(${holding.finicityAccountId}) does not exist for holding`);
                let security = securitiesMap[holding.symbol];
                if (security === undefined || security === null)
                    throw new Error(`could not find symbol(${holding.symbol} for holding`);
                let priceAsOf = holding.currentPriceDate;
                tpHoldings = [...tpHoldings, {
                        accountId: internalAccount.id,
                        securityId: security.id,
                        securityType: holding.securityType,
                        price: holding.currentPrice,
                        priceAsOf: luxon_1.DateTime.fromSeconds(holding.currentPriceDate),
                        priceSource: string,
                        value: number,
                        costBasis: number | null,
                        quantity: number,
                        currency: string | null
                    }];
            }
        };
        this.getAccountId = (accountId, finMap) => __awaiter(this, void 0, void 0, function* () {
        });
        this.repository = repository;
    }
}
const transformAccounts = (userId, finAccounts, institutionMap) => {
    // TODO: Create & Manage Account within Finicity/Brokerage if it doesnt already exist
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
const transformHoldings = (userId, finHoldings) => {
    return finHoldings.map(fh => {
        return {
            accountId: fh.securityId
        };
    });
};
exports.transformHoldings = transformHoldings;
number;
securityType: interfaces_1.SecurityType | null;
price: number;
priceAsOf: luxon_1.DateTime;
priceSource: string;
value: number;
costBasis: number | null;
quantity: number;
currency: string | null;
;
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
