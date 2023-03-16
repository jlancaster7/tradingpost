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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const repository_1 = __importDefault(require("./repository"));
const finicity_1 = require("./finicity");
const transformer_1 = require("./finicity/transformer");
const portfolio_summary_1 = require("./portfolio-summary");
const Default = (pgClient, pgp, finicity) => {
    const repo = new repository_1.default(pgClient, pgp);
    const portSummary = new portfolio_summary_1.PortfolioSummaryService(repo);
    const brokerageMap = {
        "finicity": new finicity_1.Service(finicity, repo, new transformer_1.Transformer(repo)),
    };
    return [brokerageMap, repo, portSummary];
};
class Brokerage {
    constructor(pgClient, pgp, finicity) {
        this.getUserHoldings = (tpUserId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.portfolioSummaryService.getCurrentHoldings(tpUserId);
        });
        this.getUserTrades = (tpUserId, paging) => __awaiter(this, void 0, void 0, function* () {
            return yield this.portfolioSummaryService.getTrades(tpUserId, paging);
        });
        this.getUserAccountGroupSummary = (tpUserId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.portfolioSummaryService.getSummary(tpUserId);
        });
        this.getUserReturns = (tpUserId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            return yield this.portfolioSummaryService.getReturns(tpUserId, startDate, endDate);
        });
        this.addNewAccounts = (brokerageUserId, brokerageId, accountIds) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const tradingPostUser = yield brokerage.getTradingPostUserAssociatedWithBrokerageUser(brokerageUserId);
            const currentAccounts = yield this.repository.getTradingPostBrokerageAccounts(tradingPostUser.id);
            //
            // const accounts = await brokerage.importAccounts(brokerageUserId);
            // await this.repository.upsertTradingPostBrokerageAccounts(accounts)
            //
            // const holdings = await brokerage.importHoldings(brokerageUserId);
            // await this.repository.upsertTradingPostCurrentHoldings(holdings);
            //
            // const transactions = await brokerage.importTransactions(brokerageUserId);
            // await this.repository.upsertTradingPostTransactions(transactions);
            //
            // // Takes old accounts avail
            // // takes new accounts avail
            // // Sees where missing and adds to array
            // const newAccounts = await this.repository.getTradingPostBrokerageAccounts(tradingPostUser.id);
            // let accountsToProcess: TradingPostBrokerageAccountsTable[] = [];
            //
            // newAccounts.forEach(newAcc => {
            //     let hasAccount = false
            //     currentAccounts.forEach((curAcc => {
            //         if (curAcc.institutionId === newAcc.institutionId && curAcc.accountNumber === newAcc.accountNumber) {
            //             hasAccount = true
            //             return
            //         }
            //     }));
            //     if (hasAccount) return
            //     accountsToProcess.push(newAcc)
            // });
            //
            // for (let i = 0; i < accountsToProcess.length; i++) {
            //     const account = accountsToProcess[i];
            //     const oldestTransaction = await this.repository.getOldestTransaction(account.id);
            //     if (!oldestTransaction) continue
            //     const holdingHistory = await this.computeHoldingsHistory(account.id, oldestTransaction.date);
            //     await this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
            // }
            //
            // const tpAccountIds = accountsToProcess.map(tp => tp.id)
            // await this.repository.addTradingPostAccountGroup(tradingPostUser.id, 'default', tpAccountIds, 10117)
            // await this.portfolioSummaryService.computeAccountGroupSummary(tradingPostUser.id)
        });
        this.pullNewTransactionsAndHoldings = (brokerageId, brokerageUserId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            if (!brokerage)
                throw new Error("no brokerage found");
            const tradingPostUser = yield brokerage.getTradingPostUserAssociatedWithBrokerageUser(brokerageUserId);
            const tpAccounts = yield this.repository.getTradingPostBrokerageAccounts(tradingPostUser.id);
            if (tpAccounts.length <= 0)
                return;
            // TODO: Instead of adding error codes at the holding level, we could write a function to pull accoutns
            //  and then return error response for those accounts there... this way we avoid throwing exceptions as well
            //  return accounts in multiple states and validate if its in an error state, according to the service...
            const holdings = yield brokerage.importHoldings(brokerageUserId);
            const accountIds = (() => {
                let idMap = {};
                holdings.forEach(h => idMap[h.accountId] = null);
                return Object.keys(idMap).map(id => parseInt(id));
            })();
            yield this.repository.deleteTradingPostAccountCurrentHoldings(accountIds);
            yield this.repository.upsertTradingPostCurrentHoldings(holdings);
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
                optionId: holding.optionId,
                date: luxon_1.DateTime.now().setZone("America/New_York").set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
            }));
            yield this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
            const transactions = yield brokerage.importTransactions(brokerageUserId);
            yield this.repository.upsertTradingPostTransactions(transactions);
            yield this.portfolioSummaryService.computeAccountGroupSummary(tradingPostUser.id);
        });
        this.addNewTransactions = (brokerageUserId, brokerageId, accountIds) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const transactions = yield brokerage.importTransactions(brokerageUserId);
            yield this.repository.upsertTradingPostTransactions(transactions);
            const holdings = yield brokerage.importHoldings(brokerageUserId);
            yield this.repository.upsertTradingPostCurrentHoldings(holdings);
            let historicalHoldings = [];
            holdings.forEach(h => {
                historicalHoldings.push({
                    optionId: h.optionId,
                    accountId: h.accountId,
                    price: h.price,
                    securityId: h.securityId,
                    value: h.value,
                    costBasis: h.costBasis,
                    quantity: h.quantity,
                    date: luxon_1.DateTime.now(),
                    currency: "USD",
                    securityType: h.securityType,
                    priceAsOf: h.priceAsOf,
                    priceSource: h.priceSource
                });
            });
            yield this.repository.upsertTradingPostHistoricalHoldings(historicalHoldings);
        });
        this.removeAccounts = (brokerageCustomerId, accountIds, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const tpAccountIds = yield brokerage.removeAccounts(brokerageCustomerId, accountIds);
            yield this.repository.deleteTradingPostBrokerageAccounts(tpAccountIds);
        });
        this.generateBrokerageAuthenticationLink = (userId, brokerageId, brokerageAccountId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            return yield brokerage.generateBrokerageAuthenticationLink(userId, undefined, brokerageAccountId);
        });
        const [brokerageMap, repo, portSummary] = Default(pgClient, pgp, finicity);
        this.brokerageMap = brokerageMap;
        this.repository = repo;
        this.portfolioSummaryService = portSummary;
    }
}
exports.default = Brokerage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLGlDQUErQjtBQUMvQiw4REFBc0M7QUFDdEMseUNBQXFEO0FBRXJELHdEQUEwRTtBQUMxRSwyREFBNEQ7QUFZNUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUF3QixFQUFFLEdBQVUsRUFBRSxRQUFrQixFQUFzRixFQUFFO0lBQzdKLE1BQU0sSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQ0FBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RCxNQUFNLFlBQVksR0FBRztRQUNqQixVQUFVLEVBQUUsSUFBSSxrQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSx5QkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNqRixDQUFBO0lBRUQsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDNUMsQ0FBQyxDQUFBO0FBRUQsTUFBcUIsU0FBUztJQUsxQixZQUFZLFFBQXdCLEVBQUUsR0FBVSxFQUFFLFFBQWtCO1FBT3BFLG9CQUFlLEdBQUcsQ0FBTyxRQUFnQixFQUFpQyxFQUFFO1lBQ3hFLE9BQU8sTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFBLENBQUE7UUFDRCxrQkFBYSxHQUFHLENBQU8sUUFBZ0IsRUFBRSxNQUEwQyxFQUFvRCxFQUFFO1lBQ3JJLE9BQU8sTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUEsQ0FBQTtRQUVELCtCQUEwQixHQUFHLENBQU8sUUFBZ0IsRUFBeUMsRUFBRTtZQUMzRixP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