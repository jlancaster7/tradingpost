<<<<<<< HEAD
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
const interfaces_1 = require("./interfaces");
const luxon_1 = require("luxon");
const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
// We do not recompute value in the rulesets since we are using the latest EOD price avail for a security to calculate
// value at the end of each day
let ruleSet = {
    "buy": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        // Roll back buy,
        // get transaction from holding
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for buy transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    "sell": (holdings, tx) => {
        // sell amount is going to be negative, hence why we can "add" it back
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (hIdx === -1) {
            holdings.holdings.push({
                priceAsOf: tx.date,
                price: tx.price,
                securityId: tx.securityId,
                quantity: (-1 * tx.quantity),
                accountId: tx.accountId,
                date: tx.date,
                costBasis: 0,
                priceSource: '',
                securityType: tx.securityType,
                value: tx.price * (-1 * tx.quantity),
                currency: 'USD'
            });
            return holdings;
        }
        const holding = holdings.holdings[hIdx];
        holding.quantity = holding.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = holding;
        return holdings;
    },
    "short": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        // TODO: .... this is possible for a short?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for short transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    "cover": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        // TODO:.... I think this is possible in a cover...?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for cover transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    "cancel": (holdings, tx) => {
        // TODO: ... should investigate but we werent processing "pending" transactions to begin with
        //  so, in theory, this shouldnt happen
        return holdings;
    },
    "fee": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        return holdings;
    },
    "cash": (holdings, tx) => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings;
    },
    "transfer": (holdings, tx) => {
        // TODO: Assuming this is a transfer from another brokerage... we should just allocate holding in history...
        //  or de-allocate if it was transferred to another institution
        return holdings;
    },
    "dividendOrInterest": (holdings, tx) => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings;
    },
};
class BrokerageService {
    constructor(brokerageMap, repository, portfolioSummaryService) {
        this.generateBrokerageAuthenticationLink = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            return yield brokerage.generateBrokerageAuthenticationLink(userId);
        });
        this.newlyAuthenticatedBrokerage = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const accounts = yield brokerage.importAccounts(userId);
            yield this.repository.upsertTradingPostBrokerageAccounts(accounts);
            const holdings = yield brokerage.importHoldings(userId);
            yield this.repository.upsertTradingPostCurrentHoldings(holdings);
            const transactions = yield brokerage.importTransactions(userId);
            yield this.repository.upsertTradingPostTransactions(transactions);
            const start = luxon_1.DateTime.now().setZone("America/New_York");
            const end = start.minus({ month: 24 });
            const tpAccounts = yield this.repository.getTradingPostBrokerageAccounts(userId);
            for (let i = 0; i < tpAccounts.length; i++) {
                const account = tpAccounts[i];
                const holdingHistory = yield this.computeHoldingsHistory(account.id, start, end);
                yield this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
            }
        });
        this.pullNewData = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            if (!brokerage)
                throw new Error("no brokerage found");
            const holdings = yield brokerage.importHoldings(userId);
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
                date: luxon_1.DateTime.now()
            }));
            yield this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
            const transactions = yield brokerage.importTransactions(userId);
            yield this.repository.upsertTradingPostTransactions(transactions);
        });
        this.computeHoldingsHistory = (tpAccountId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            const cashSecurity = yield this.repository.getCashSecurityId();
            let allSecurityIds = {};
            // Get Current Holdings
            const currentHoldings = yield this.repository.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
            if (currentHoldings.length <= 0)
                throw new Error("no holdings available for account " + tpAccountId);
            currentHoldings.forEach(h => allSecurityIds[h.securityId] = {});
            // Get Current Transactions Sorted in DESC order
            const transactions = yield this.repository.getTradingPostBrokerageAccountTransactions(tpAccountId);
            if (transactions.length <= 0)
                throw new Error("no transactions available for account " + tpAccountId);
            const transactionsPerDate = {};
            transactions.forEach(tx => {
                allSecurityIds[tx.securityId] = {};
                const txDateUnix = tx.date.startOf('day').toUnixInteger();
                let txs = transactionsPerDate[txDateUnix];
                if (!txs)
                    txs = [tx];
                else
                    txs.push(tx);
                transactionsPerDate[txDateUnix] = txs;
            });
            const allSecurityPricesMap = yield this.getSecurityPrices(Object.keys(allSecurityIds).map(id => parseInt(id)), startDate, endDate);
            // Get Trading Days we will compute history for
            // In our db we will have a single row for each security on each day, so with 2 securities we'll have two rows for today
            let tradingDays = yield this.getTradingDays(startDate, endDate);
            const initialHistoricalHolding = {
                date: startDate,
                cash: 0,
                holdings: [],
            };
            for (const holding of currentHoldings) {
                if (holding.symbol === 'USD:CUR') {
                    initialHistoricalHolding.cash = holding.quantity;
                    continue;
                }
                initialHistoricalHolding.date = holding.priceAsOf;
                initialHistoricalHolding.holdings.push({
                    price: holding.price,
                    accountId: tpAccountId,
                    costBasis: holding.costBasis,
                    date: holding.priceAsOf,
                    currency: "USD",
                    priceAsOf: holding.priceAsOf,
                    quantity: holding.quantity,
                    priceSource: holding.priceSource,
                    securityId: holding.securityId,
                    value: holding.value,
                    securityType: interfaces_1.SecurityType.equity
                });
            }
            let historicalHoldingCollection = [initialHistoricalHolding];
            for (let i = 0; i < tradingDays.length - 1; i++) {
                // Each Trading Day, we are computing for the prior historical day
                const tradingDay = tradingDays[i];
                const curHold = historicalHoldingCollection[historicalHoldingCollection.length - 1];
                let holdingsToday = deepCopy(curHold);
                if (tradingDay.startOf('day').toUnixInteger() in transactionsPerDate) {
                    let txs = transactionsPerDate[tradingDay.startOf('day').toUnixInteger()];
                    holdingsToday = this.undoTransactions(holdingsToday, txs);
                }
                let priorMarketDay = tradingDays[i + 1];
                let priorHoldings = {
                    date: priorMarketDay,
                    holdings: [],
                    cash: holdingsToday.cash
                };
                for (const holdingToday of holdingsToday.holdings) {
                    let price = holdingToday.price;
                    const closestPrice = this.getClosestPrice(allSecurityPricesMap, holdingToday.securityId, priorMarketDay);
                    if (closestPrice !== null)
                        price = closestPrice;
                    holdingToday.price = price;
                    holdingToday.date = priorMarketDay;
                    priorHoldings.holdings.push(holdingToday);
                }
                historicalHoldingCollection.push(priorHoldings);
            }
            let historicalHoldings = [];
            for (const h of historicalHoldingCollection) {
                // Cash Position
                historicalHoldings.push({
                    id: 0,
                    updated_at: luxon_1.DateTime.now(),
                    created_at: luxon_1.DateTime.now(),
                    price: 1,
                    securityType: interfaces_1.SecurityType.cashEquivalent,
                    value: h.cash,
                    securityId: cashSecurity.id,
                    priceSource: '',
                    quantity: h.cash,
                    priceAsOf: h.date,
                    currency: 'USD',
                    date: h.date,
                    costBasis: 0,
                    accountId: tpAccountId,
                });
                for (const holding of h.holdings) {
                    historicalHoldings.push({
                        id: 0,
                        updated_at: luxon_1.DateTime.now(),
                        created_at: luxon_1.DateTime.now(),
                        price: holding.price,
                        securityType: holding.securityType,
                        value: holding.value,
                        securityId: holding.securityId,
                        priceSource: holding.priceSource,
                        quantity: holding.quantity,
                        priceAsOf: holding.date,
                        currency: 'USD',
                        date: holding.date,
                        costBasis: holding.costBasis,
                        accountId: holding.accountId,
                    });
                }
            }
            return historicalHoldings;
        });
        this.undoTransactions = (historicalAccount, transactions) => {
            // TODO: ... should not be imputing data like this... fix it up.
            for (const tx of transactions)
                historicalAccount = ruleSet[tx.type](historicalAccount, tx);
            return historicalAccount;
        };
        this.getSecurityPrices = (securityIds, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            const securityPrices = yield this.repository.getSecurityPricesWithEndDateBySecurityIds(startDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0,
            }), endDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0
            }), securityIds);
            let securityPricesMap = {};
            for (const sp of securityPrices) {
                let sps = securityPricesMap[sp.securityId];
                if (!sps)
                    sps = [sp];
                else
                    sps.push(sp);
                securityPricesMap[sp.securityId] = sps;
            }
            return securityPricesMap;
        });
        this.getTradingDays = (start, end) => __awaiter(this, void 0, void 0, function* () {
            const marketHolidays = yield this.repository.getMarketHolidays(start, end);
            let holidayMap = {};
            marketHolidays.forEach((row) => {
                const dt = row.date.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
                holidayMap[dt.toUnixInteger()] = {};
            });
            let startDate = start.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
            let endDate = end.set({ hour: 16, minute: 0, second: 0, millisecond: 0 }).minus({ day: 1 });
            let tradingDays = [];
            for (; startDate.toUnixInteger() >= endDate.toUnixInteger(); startDate = startDate.minus({ day: 1 })) {
                if (startDate.weekday === 6 || startDate.weekday === 7)
                    continue;
                if (startDate.toUnixInteger() in holidayMap)
                    continue;
                tradingDays.push(startDate);
            }
            return tradingDays.sort((a, b) => {
                if (a.toUnixInteger() < b.toUnixInteger())
                    return 1;
                if (a.toUnixInteger() > b.toUnixInteger())
                    return -1;
                return 0;
            });
        });
        this.getClosestPrice = (securityPricesMap, securityId, postingDate) => {
            // TODO: How should we handle private security?
            const securityPrices = securityPricesMap[securityId];
            if (!securityPricesMap)
                throw new Error("no prices found for security");
            const postingDateUnix = postingDate.startOf('day').toUnixInteger();
            for (let sp of securityPrices) {
                const spUnix = sp.time.startOf('day').toUnixInteger();
                if (spUnix <= postingDateUnix)
                    return sp.price;
            }
            return null;
        };
        this.brokerageMap = brokerageMap;
        this.repository = repository;
        this.portfolioSummaryService = portfolioSummaryService;
    }
}
exports.default = BrokerageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2Q0FRc0I7QUFFdEIsaUNBQStCO0FBUy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBUSxFQUFPLEVBQUU7SUFDL0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUMxQyxDQUFDLENBQUE7QUFJRCxzSEFBc0g7QUFDdEgsK0JBQStCO0FBQy9CLElBQUksT0FBTyxHQUF1RDtJQUM5RCxLQUFLLEVBQUUsQ0FBQyxRQUEyQixFQUFFLEVBQWdDLEVBQXFCLEVBQUU7UUFDeEYsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDMUMsaUJBQWlCO1FBQ2pCLCtCQUErQjtRQUMvQixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzdFLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLEVBQUUsQ0FBQyxVQUFVLHNCQUFzQixDQUFDLENBQUE7UUFDL0csTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDM0IsT0FBTyxRQUFRLENBQUE7SUFDbkIsQ0FBQztJQUNELE1BQU0s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
=======
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
const interfaces_1 = require("./interfaces");
const luxon_1 = require("luxon");
const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
// We do not recompute value in the rulesets since we are using the latest EOD price avail for a security to calculate
// value at the end of each day
let ruleSet = {
    "buy": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        // Roll back buy,
        // get transaction from holding
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (!hIdx)
            throw new Error("no prior holding found for a buy :::: position should exist");
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    "sell": (holdings, tx) => {
        // sell amount is going to be negative, hence why we can "add" it back
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (!hIdx) {
            holdings.holdings.push({
                priceAsOf: tx.date,
                price: tx.price,
                securityId: tx.securityId,
                quantity: tx.quantity,
                accountId: tx.accountId,
                date: tx.date,
                costBasis: 0,
                priceSource: '',
                securityType: tx.securityType,
                value: tx.price * (-1 * tx.quantity),
                currency: 'USD'
            });
            return holdings;
        }
        const holding = holdings.holdings[hIdx];
        holding.quantity = holding.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = holding;
        return holdings;
    },
    "short": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        // TODO: .... this is possible for a short?
        // TODO: Discuss pricing with short/cover
        if (!hIdx)
            throw new Error("no prior holding found for a short :::: position should exist");
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    "cover": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        // TODO:.... I think this is possible in a cover...?
        // TODO: Discuss pricing with short/cover
        if (!hIdx)
            throw new Error("no prior holding found for a cover :::: position should exist");
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    "cancel": (holdings, tx) => {
        // TODO: ... should investigate but we werent processing "pending" transactions to begin with
        //  so, in theory, this shouldnt happen
        return holdings;
    },
    "fee": (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        return holdings;
    },
    "cash": (holdings, tx) => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings;
    },
    "transfer": (holdings, tx) => {
        // TODO: Assuming this is a transfer from another brokerage... we should just allocate holding in history...
        //  or de-allocate if it was transferred to another institution
        return holdings;
    },
    "dividendOrInterest": (holdings, tx) => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings;
    },
};
class BrokerageService {
    constructor(brokerageMap, repository, portfolioSummaryService) {
        this.generateBrokerageAuthenticationLink = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            return yield brokerage.generateBrokerageAuthenticationLink(userId);
        });
        this.newlyAuthenticatedBrokerage = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            const accounts = yield brokerage.importAccounts(userId);
            yield this.repository.upsertTradingPostBrokerageAccounts(accounts);
            const holdings = yield brokerage.importHoldings(userId);
            yield this.repository.upsertTradingPostCurrentHoldings(holdings);
            const transactions = yield brokerage.importTransactions(userId);
            yield this.repository.upsertTradingPostTransactions(transactions);
            const tpAccounts = yield this.repository.getTradingPostBrokerageAccounts(userId);
            for (let i = 0; i < tpAccounts.length; i++) {
                const account = tpAccounts[i];
                const holdingHistory = yield this.computeHoldingsHistory(account.id);
                yield this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
            }
        });
        this.pullNewData = (userId, brokerageId) => __awaiter(this, void 0, void 0, function* () {
            const brokerage = this.brokerageMap[brokerageId];
            if (!brokerage)
                throw new Error("no brokerage found");
            const holdings = yield brokerage.importHoldings(userId);
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
                date: luxon_1.DateTime.now()
            }));
            yield this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);
            const transactions = yield brokerage.importTransactions(userId);
            yield this.repository.upsertTradingPostTransactions(transactions);
        });
        this.computeHoldingsHistory = (tpAccountId) => __awaiter(this, void 0, void 0, function* () {
            // Get Trading Post Account
            const tpAccount = yield this.repository.getTradingPostBrokerageAccount(tpAccountId);
            let allSecurityIds = {};
            // Get Current Holdings
            const currentHoldings = yield this.repository.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
            if (currentHoldings.length <= 0)
                throw new Error("no holdings available for account " + tpAccountId);
            currentHoldings.forEach(h => allSecurityIds[h.securityId] = {});
            // Get Current Transactions Sorted in DESC order
            const transactions = yield this.repository.getTradingPostBrokerageAccountTransactions(tpAccountId);
            if (transactions.length <= 0)
                throw new Error("no transactions available for account " + tpAccountId);
            const transactionsPerDate = {};
            transactions.forEach(tx => {
                allSecurityIds[tx.securityId] = {};
                const txDateUnix = tx.date.startOf('day').toUnixInteger();
                let txs = transactionsPerDate[txDateUnix];
                if (!txs)
                    txs = [tx];
                else
                    txs.push(tx);
                transactionsPerDate[txDateUnix] = txs;
            });
            const endDate = luxon_1.DateTime.now().minus({ year: 5 }).setZone("America/New_York").set({
                hour: 16,
                second: 0,
                millisecond: 0,
                minute: 0
            });
            const allSecurityPricesMap = yield this.getSecurityPrices(Object.keys(allSecurityIds).map(id => parseInt(id)), endDate.set({ hour: 0 }));
            // Get Trading Days we will compute history for
            // In our db we will have a single row for each security on each day, so with 2 securities we'll have two rows for today
            let tradingDays = yield this.getTradingDays(endDate.set({ hour: 0 }));
            const initialHistoricalHolding = {
                date: luxon_1.DateTime.now(),
                cash: 0,
                holdings: [],
            };
            for (const holding of currentHoldings) {
                if (holding.symbol === 'USD:CUR') {
                    initialHistoricalHolding.cash = holding.quantity;
                    continue;
                }
                initialHistoricalHolding.date = holding.priceAsOf;
                initialHistoricalHolding.holdings.push({
                    price: holding.price,
                    accountId: tpAccountId,
                    costBasis: holding.costBasis,
                    date: holding.priceAsOf,
                    currency: "USD",
                    priceAsOf: holding.priceAsOf,
                    quantity: holding.quantity,
                    priceSource: holding.priceSource,
                    securityId: holding.securityId,
                    value: holding.value,
                    securityType: interfaces_1.SecurityType.equity
                });
            }
            let historicalHoldingCollection = [initialHistoricalHolding];
            for (let i = 0; i < tradingDays.length - 1; i++) {
                const tradingDay = tradingDays[i];
                let holdingsToday = deepCopy(historicalHoldingCollection[historicalHoldingCollection.length - 1]);
                if (tradingDay.startOf('day').toUnixInteger() in transactionsPerDate) {
                    let txs = transactionsPerDate[tradingDay.startOf('day').toUnixInteger()];
                    holdingsToday = this.undoTransactions(holdingsToday, transactions);
                }
                let priorMarketDay = tradingDays[i + 1];
                let priorHoldings = {
                    date: priorMarketDay,
                    holdings: [],
                    cash: holdingsToday.cash
                };
                for (const holdingToday of holdingsToday.holdings) {
                    let price = holdingToday.price;
                    const closestPrice = this.getClosestPrice(allSecurityPricesMap, holdingToday.securityId, priorMarketDay);
                    if (closestPrice !== null)
                        price = closestPrice;
                    holdingToday.price = price;
                    holdingToday.date = priorMarketDay;
                    priorHoldings.holdings.push(holdingsToday);
                }
                historicalHoldingCollection.push(priorHoldings);
            }
            let historicalHoldings = [];
            for (const h of historicalHoldingCollection) {
                // Cash Position
                historicalHoldings.push({
                    id: 0,
                    updated_at: luxon_1.DateTime.now(),
                    created_at: luxon_1.DateTime.now(),
                    price: 1,
                    securityType: interfaces_1.SecurityType.cashEquivalent,
                    value: h.cash,
                    securityId: 0,
                    priceSource: '',
                    quantity: h.cash,
                    priceAsOf: h.date,
                    currency: 'USD',
                    date: h.date,
                    costBasis: 0,
                    accountId: tpAccountId,
                });
                for (const holding of h.holdings) {
                    historicalHoldings.push({
                        id: 0,
                        updated_at: luxon_1.DateTime.now(),
                        created_at: luxon_1.DateTime.now(),
                        price: holding.price,
                        securityType: holding.securityType,
                        value: holding.value,
                        securityId: holding.securityId,
                        priceSource: holding.priceSource,
                        quantity: holding.quantity,
                        priceAsOf: holding.date,
                        currency: 'USD',
                        date: holding.date,
                        costBasis: holding.costBasis,
                        accountId: holding.accountId,
                    });
                }
            }
            return historicalHoldings;
        });
        this.undoTransactions = (historicalAccount, transactions) => {
            // TODO: ... should not be imputing data like this... fix it up.
            for (const tx of transactions)
                historicalAccount = ruleSet[tx.type](historicalAccount, tx);
            return historicalAccount;
        };
        this.getSecurityPrices = (securityIds, endDate) => __awaiter(this, void 0, void 0, function* () {
            const securityPrices = yield this.repository.getSecurityPricesWithEndDateBySecurityIds(endDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0
            }), securityIds);
            let securityPricesMap = {};
            for (const sp of securityPrices) {
                let sps = securityPricesMap[sp.securityId];
                if (!sps)
                    sps = [sp];
                else
                    sps.push(sp);
                securityPricesMap[sp.securityId] = sps;
            }
            return securityPricesMap;
        });
        this.getTradingDays = (end) => __awaiter(this, void 0, void 0, function* () {
            const marketHolidays = yield this.repository.getMarketHolidays(end);
            let holidayMap = {};
            marketHolidays.forEach((row) => {
                const dt = row.date.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
                holidayMap[dt.toUnixInteger()] = {};
            });
            let startDate = luxon_1.DateTime.now().setZone("America/New_York").set({
                hour: 16,
                minute: 0,
                second: 0,
                millisecond: 0
            });
            let endDate = end.set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
            let tradingDays = [];
            for (; startDate.toUnixInteger() <= endDate.toUnixInteger(); startDate = startDate.minus({ day: 1 })) {
                if (startDate.weekday === 6 || startDate.weekday === 7)
                    continue;
                if (startDate.toUnixInteger() in holidayMap)
                    continue;
                tradingDays.push(startDate);
            }
            return tradingDays;
        });
        this.getClosestPrice = (securityPricesMap, securityId, postingDate) => {
            // TODO: How should we handle private security?
            const securityPrices = securityPricesMap[securityId];
            if (!securityPricesMap)
                throw new Error("no prices found for security");
            const postingDateUnix = postingDate.startOf('day').toUnixInteger();
            for (let sp of securityPrices) {
                const spUnix = sp.time.startOf('day').toUnixInteger();
                if (spUnix <= postingDateUnix)
                    return sp.price;
            }
            return null;
        };
        this.brokerageMap = brokerageMap;
        this.repository = repository;
        this.portfolioSummaryService = portfolioSummaryService;
    }
}
exports.default = BrokerageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2Q0FRc0I7QUFFdEIsaUNBQStCO0FBUy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBUSxFQUFPLEVBQUU7SUFDL0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUMxQyxDQUFDLENBQUE7QUFJRCxzSEFBc0g7QUFDdEgsK0JBQStCO0FBQy9CLElBQUksT0FBTyxHQUF1RDtJQUM5RCxLQUFLLEVBQUUsQ0FBQyxRQUEyQixFQUFFLEVBQWdDLEVBQXFCLEVBQUU7UUFDeEYsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDMUMsaUJBQWlCO1FBQ2pCLCtCQUErQjtRQUMvQixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzdFLElBQUksQ0FBQyxJQUFJO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFBO1FBQ3pGLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNCLE9BQU8sUUFBUSxDQUFBO0lBQ25CLENBQUM7SUFDRCxNQUFNLEVBQUUsQ0FBQyxRQUEyQixFQUFFLEVBQWdDLEVBQXFC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
>>>>>>> 316cfbb83a9338125b56c7e1330be3d41cb710b7
