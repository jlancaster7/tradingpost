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
exports.BrokerageService = void 0;
const luxon_1 = require("luxon");
class BrokerageService {
    constructor(brokerageMap, repository, portfolioSummaryService) {
        this.generateBrokerageAuthenticationLink = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            return yield brokerage.generateBrokerageAuthenticationLink(userId);
        });
        this.newlyAuthenticatedBrokerage = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const accounts = yield brokerage.importAccounts(userId);
            yield this.repository.addTradingPostBrokerageAccounts(accounts);
            const holdings = yield brokerage.importHoldings(userId);
            yield this.repository.addTradingPostBrokerageHoldings(holdings);
            const transactions = yield brokerage.importTransactions(userId);
            yield this.repository.addTradingPostBrokerageTransactions(transactions);
            const holdingHistory = yield this.computeHoldingsHistory(userId);
            yield this.repository.addTradingPostBrokerageHoldingsHistory(holdingHistory);
        });
        this.pullNewData = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const holdings = yield brokerage.importHoldings(userId);
            yield this.repository.addTradingPostBrokerageHoldings(holdings);
            let holdingHistory = holdings.map(holding => ({
                accountId: holding.accountId,
                securityId: holding.securityId,
                securityType: holding.securityType,
                price: holding.price,
                priceAsOf: holding.priceAsOf,
                priceSource: holding.priceSource,
                value: holding.value,
                costBasis: holding.costBasis,
                quantity: holding.quantity,
                currency: holding.currency,
                date: luxon_1.DateTime.now()
            }));
            yield this.repository.addTradingPostBrokerageHoldingsHistory(holdingHistory);
            const transactions = yield brokerage.importTransactions(userId);
            yield this.repository.addTradingPostBrokerageTransactions(transactions);
        });
        this.computeHoldingsHistory = (userId) => __awaiter(this, void 0, void 0, function* () {
            return [];
        });
        this.brokerageMap = brokerageMap;
        this.repository = repository;
        this.portfolioSummaryService = portfolioSummaryService;
    }
}
exports.BrokerageService = BrokerageService;
