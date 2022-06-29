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
const luxon_1 = require("luxon");
class RealizefiProvider {
    constructor(realizefi, repository) {
        this.auth = (tpUserId, successRedirect, failureRedirect) => __awaiter(this, void 0, void 0, function* () {
            try {
                let realizeFiAccount = yield this.repository.getRealizefiUser({ tpUserId });
                if (realizeFiAccount === null)
                    realizeFiAccount = yield this._createRealizefiUser();
                const authPortalResponse = yield this.realizefi.createAuthPortal(realizeFiAccount.realizefiId, successRedirect, failureRedirect);
                return authPortalResponse.url;
            }
            catch (e) {
                throw e;
            }
        });
        this._createRealizefiUser = () => __awaiter(this, void 0, void 0, function* () {
            const realizeUser = yield this.realizefi.createUser();
            return yield this.repository.addRealizefiUser(realizeUser.id);
        });
        this.importAccounts = (realizefiUserId, opts = { returnUpdates: false }) => __awaiter(this, void 0, void 0, function* () {
            const realizefiUser = yield this.realizefi.getUser(realizefiUserId);
            const userAccount = yield this.repository.getRealizefiUser({ realizefiUserId });
            if (userAccount === null || userAccount.id === null)
                throw new Error(`no user account associated with realize user id ${realizefiUserId}`);
            let newAccounts = [];
            for (const institution of realizefiUser.institutionLinks) {
                const balance = yield this.realizefi.getBalances(institution.id);
                newAccounts.push({
                    id: null,
                    accountId: userAccount.id,
                    realizefiInstitutionId: institution.id,
                    institution: institution.institution,
                    accountNumber: institution.accountNumber,
                    accountValue: parseFloat(balance.accountValue),
                    buyingPower: parseFloat(balance.buyingPower),
                    cash: parseFloat(balance.cash),
                    healthStatus: institution.healthStatus,
                    margin: parseFloat(balance.margin),
                    permissionScopes: JSON.stringify(institution.permissionScopes)
                });
            }
            yield this.repository.addRealizefiAccounts(newAccounts);
        });
        this.importTransactions = (realizefiUserId, institutionID = null, opts = { returnUpdates: false }) => __awaiter(this, void 0, void 0, function* () {
            let realizefiAccounts = yield this.repository.getRealizefiAccounts(realizefiUserId);
            if (institutionID)
                realizefiAccounts = realizefiAccounts.filter(a => a.realizefiInstitutionId === institutionID);
            let newTransactions = [];
            for (const account of realizefiAccounts) {
                // TODO: Implement paging
                if (account.id === null)
                    throw new Error("account id is null");
                const transactions = yield this.realizefi.listTransactions(account.realizefiInstitutionId);
                for (const tx of transactions.data) {
                    newTransactions.push({
                        id: null,
                        accountId: account.id,
                        adjustmentRatio: tx.details && tx.details.adjustmentRatio,
                        fees: tx.details && parseFloat(tx.details.fees),
                        instrument: tx.details && tx.details.instrument,
                        netAmount: parseFloat(tx.netAmount),
                        price: tx.details && parseFloat(tx.details.price),
                        quantity: tx.details && parseFloat(tx.details.quantity),
                        realizefiTransactionId: tx.id,
                        transactionSubTypeDetail: tx.details && tx.details.transactionSubType || null,
                        settlementDate: tx.settlementDate !== null ? luxon_1.DateTime.fromISO(tx.settlementDate) : null,
                        side: tx.details && tx.details.side,
                        transactionDate: tx.transactionDate !== null ? luxon_1.DateTime.fromISO(tx.transactionDate) : null,
                        transactionType: tx.type,
                        transactionTypeDetail: tx.details && tx.details.transactionType,
                        symbol: tx.details && tx.details.instrument && tx.details.instrument.symbol || null
                    });
                }
            }
            yield this.repository.addRealizefiAccountTransactions(newTransactions);
        });
        this.importPositions = (realizefiUserID, institutionID = null, opts = { returnUpdates: true }) => __awaiter(this, void 0, void 0, function* () {
            let realizefiAccounts = yield this.repository.getRealizefiAccounts(realizefiUserID);
            if (institutionID)
                realizefiAccounts = realizefiAccounts.filter(a => a.realizefiInstitutionId === institutionID);
            let newPositions = [];
            for (const account of realizefiAccounts) {
                // TODO: Implement Paging
                if (account.id === null)
                    throw new Error("account id is null");
                const positions = yield this.realizefi.listPositions(account.realizefiInstitutionId);
                for (const position of positions.data) {
                    newPositions.push({
                        id: null,
                        accountId: account.id,
                        averagePrice: parseFloat(position.averagePrice),
                        costBasis: parseFloat(position.costBasis),
                        currentDayProfitLoss: parseFloat(position.currentDayProfitLoss),
                        currentDayProfitLossPercentage: parseFloat(position.currentDayProfitLossPercentage),
                        longQuantity: parseFloat(position.longQuantity),
                        marketValue: parseFloat(position.marketValue),
                        securityCompositeFigi: position.security.compositeFigi,
                        securityContractType: position.security.contractType,
                        securityExpiration: luxon_1.DateTime.fromISO(position.security.expiration),
                        securityId: position.security.id,
                        securityPrimaryExchange: position.security.primaryExchange,
                        securityShareClassFigi: position.security.shareClassFigi,
                        securityStrikePrice: parseFloat(position.security.strikePrice),
                        securitySymbol: position.security.symbol,
                        securityType: position.security.type,
                        shortQuantity: parseFloat(position.shortQuantity),
                        symbol: position.symbol
                    });
                }
            }
            yield this.repository.addRealizefiAccountPositions(newPositions);
        });
        /**
         * exportAccounts reads from the factual realizefi tables and transposes it to our tradingpost account
         */
        this.exportAccounts = () => __awaiter(this, void 0, void 0, function* () {
            return [];
        });
        /**
         * exportTransactions reads from the factual realizefi transaction table and transposes it to our tradingpost transactions
         */
        this.exportTransactions = () => __awaiter(this, void 0, void 0, function* () {
            return [];
        });
        /**
         * exportHoldings reads from the factual realizefi holdings table and transposes it to our tradingpost holding
         */
        this.exportHoldings = () => __awaiter(this, void 0, void 0, function* () {
            return [];
        });
        this.realizefi = realizefi;
        this.repository = repository;
    }
}
exports.default = RealizefiProvider;
