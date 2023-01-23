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
exports.transformTransactionTypeAmount = void 0;
const interfaces_1 = require("./interfaces");
const luxon_1 = require("luxon");
const mathjs_1 = require("mathjs");
const transformTransactionTypeAmount = (txType, transaction) => {
    switch (txType) {
        case interfaces_1.InvestmentTransactionType.buy:
            transaction.amount = (0, mathjs_1.abs)(transaction.amount);
            return transaction;
        case interfaces_1.InvestmentTransactionType.sell:
            transaction.amount = -1 * (0, mathjs_1.abs)(transaction.amount);
            return transaction;
        case interfaces_1.InvestmentTransactionType.short:
            transaction.amount = -1 * (0, mathjs_1.abs)(transaction.amount);
            return transaction;
        case interfaces_1.InvestmentTransactionType.cover:
            transaction.amount = (0, mathjs_1.abs)(transaction.amount);
            return transaction;
        default:
            return transaction;
    }
};
exports.transformTransactionTypeAmount = transformTransactionTypeAmount;
const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
// We do not recompute value in the rulesets since we are using the latest EOD price avail for a security to calculate
// value at the end of each day
let ruleSet = {
    [interfaces_1.InvestmentTransactionType.buy]: (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        // Roll back buy,
        // get transaction from holding
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for buy transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.sell]: (holdings, tx) => {
        // sell amount is going to be negative, hence why we can "add" it back
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (hIdx === -1) {
            holdings.holdings.push({
                optionId: tx.optionId,
                priceAsOf: tx.date,
                price: tx.price,
                securityId: tx.securityId,
                quantity: (-1 * tx.quantity),
                accountId: tx.accountId || 0,
                date: tx.date,
                costBasis: 0,
                priceSource: '',
                securityType: tx.securityType,
                value: tx.price * (-1 * tx.quantity),
                currency: 'USD'
            });
            return holdings;
        }
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.short]: (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        // TODO: .... this is possible for a short?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for short transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.cover]: (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        // TODO:.... I think this is possible in a cover...?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for cover transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.cancel]: (holdings, tx) => {
        // TODO: ... should investigate but we werent processing "pending" transactions to begin with
        //  so, in theory, this shouldnt happen
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.fee]: (holdings, tx) => {
        holdings.cash = holdings.cash + tx.amount;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.cash]: (holdings, tx) => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.transfer]: (holdings, tx) => {
        // TODO: Assuming this is a transfer from another brokerage... we should just allocate holding in history...
        //  or de-allocate if it was transferred to another institution
        if (tx.securityType === 'cashEquivalent') {
            holdings.cash = holdings.cash - tx.amount;
            return holdings;
        }
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId);
        if (hIdx === -1)
            throw new Error(`no prior holding found for security id ${tx.securityId} for buy transaction`);
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings;
    },
    [interfaces_1.InvestmentTransactionType.dividendOrInterest]: (holdings, tx) => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings;
    },
};
class BaseTransformer {
    constructor(repo) {
        this.upsertAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
            yield this._baseRepo.upsertTradingPostBrokerageAccounts(accounts);
        });
        this.upsertPositions = (positions, accountIds) => __awaiter(this, void 0, void 0, function* () {
            yield this._baseRepo.deleteTradingPostAccountCurrentHoldings(accountIds);
            const rollup = yield rollupPositions(positions);
            yield this._baseRepo.upsertTradingPostCurrentHoldings(rollup);
        });
        this.upsertTransactions = (transactions) => __awaiter(this, void 0, void 0, function* () {
            const rollup = yield rollupTransactions(transactions);
            const filtered = rollup.filter(f => f.securityType !== interfaces_1.SecurityType.mutualFund);
            yield this._baseRepo.upsertTradingPostTransactions(filtered);
        });
        this.upsertHistoricalHoldings = (historicalHoldings) => __awaiter(this, void 0, void 0, function* () {
            const rollup = yield rollupHistoricalHoldings(historicalHoldings);
            yield this._baseRepo.upsertTradingPostHistoricalHoldings(rollup);
        });
        this.computeHoldingsHistory = (tpAccountId) => __awaiter(this, void 0, void 0, function* () {
            const oldestTx = yield this._baseRepo.getOldestTransaction(tpAccountId);
            if (!oldestTx)
                throw new Error("no transactions for");
            const endDate = oldestTx.date;
            const cashSecurity = yield this._baseRepo.getCashSecurityId();
            let allSecurityIds = {};
            // Get Current Holdings
            const currentHoldings = yield this._baseRepo.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
            // TODO: We could recomptue old holdings history...
            if (currentHoldings.length <= 0)
                throw new Error("no holdings available for account " + tpAccountId);
            currentHoldings.forEach(h => allSecurityIds[h.securityId] = {});
            // Get Current Transactions Sorted in DESC order
            const transactions = yield this._baseRepo.getTradingPostBrokerageAccountTransactions(tpAccountId);
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
            // Get Trading Days we will compute history for
            // In our db we will have a single row for each security on each day, so with 2 securities we'll have two rows for today
            let startDate = luxon_1.DateTime.now().setZone("America/New_York");
            const initialHistoricalHolding = {
                date: startDate,
                cash: 0,
                holdings: [],
            };
            for (const holding of currentHoldings) {
                if (holding.symbol === 'USD:CUR') {
                    startDate = holding.priceAsOf.setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    });
                    initialHistoricalHolding.date = holding.priceAsOf.setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    });
                    initialHistoricalHolding.cash = holding.quantity;
                    continue;
                }
                initialHistoricalHolding.date = holding.priceAsOf.setZone("America/New_York").set({
                    hour: 16,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                });
                initialHistoricalHolding.holdings.push({
                    optionId: holding.optionId,
                    price: holding.price,
                    accountId: tpAccountId,
                    costBasis: holding.costBasis,
                    date: holding.priceAsOf.setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    }),
                    currency: "USD",
                    priceAsOf: holding.priceAsOf.setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    }),
                    quantity: holding.quantity,
                    priceSource: holding.priceSource,
                    securityId: holding.securityId,
                    value: holding.value,
                    securityType: interfaces_1.SecurityType.equity
                });
            }
            const allSecurityPricesMap = yield this.getSecurityPrices(Object.keys(allSecurityIds).map(id => parseInt(id)), startDate, endDate);
            let tradingDays = yield this.getTradingDays(startDate, endDate);
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
                    holdingToday.value = price * holdingToday.quantity;
                    holdingToday.date = priorMarketDay;
                    if (!holdingToday.quantity) {
                        continue;
                    }
                    priorHoldings.holdings.push(holdingToday);
                }
                historicalHoldingCollection.push(priorHoldings);
            }
            let historicalHoldings = [];
            for (const h of historicalHoldingCollection) {
                // Cash Position
                historicalHoldings.push({
                    id: 0,
                    optionId: null,
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
                        optionId: holding.optionId,
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
            yield this.upsertHistoricalHoldings(historicalHoldings);
        });
        this.undoTransactions = (historicalAccount, transactions) => {
            // TODO: ... should not be imputing data like this... fix it up.
            for (const tx of transactions)
                historicalAccount = ruleSet[tx.type](historicalAccount, tx);
            return historicalAccount;
        };
        this.getSecurityPrices = (securityIds, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            const securityPrices = yield this._baseRepo.getSecurityPricesWithEndDateBySecurityIds(endDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0
            }), startDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0,
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
            const marketHolidays = yield this._baseRepo.getMarketHolidays(start, end);
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
            const securityPrices = securityPricesMap[securityId];
            if (!securityPrices)
                return null;
            const postingDateUnix = postingDate.startOf('day').toUnixInteger();
            for (let sp of securityPrices) {
                const spUnix = sp.time.startOf('day').toUnixInteger();
                if (spUnix <= postingDateUnix)
                    return sp.price;
            }
            return null;
        };
        this._baseRepo = repo;
    }
}
exports.default = BaseTransformer;
const rollupPositions = (positions) => __awaiter(void 0, void 0, void 0, function* () {
    positions.sort((a, b) => a.accountId - b.accountId ||
        a.securityId - b.securityId ||
        (a.optionId || 0) - (b.optionId || 0));
    let roll = [];
    let latest = null;
    positions.forEach(p => {
        if (!latest) {
            latest = p;
            return;
        }
        if (latest.accountId === p.accountId && latest.securityId === p.securityId && latest.optionId === p.optionId) {
            latest.quantity = latest.quantity + p.quantity;
            return;
        }
        roll.push(latest);
        latest = p;
    });
    latest !== null ? roll.push(latest) : null;
    return roll;
});
const rollupTransactions = (transactions) => __awaiter(void 0, void 0, void 0, function* () {
    transactions.sort((a, b) => a.accountId - b.accountId ||
        a.securityId - b.securityId ||
        (a.optionId || 0) - (b.optionId || 0) ||
        a.type.localeCompare(b.type) ||
        a.date.toUnixInteger() - b.date.toUnixInteger() ||
        a.price - b.price);
    let roll = [];
    let latest = null;
    transactions.forEach(tx => {
        if (!latest) {
            latest = tx;
            return;
        }
        if (latest.accountId === tx.accountId && latest.securityId === tx.securityId && latest.optionId === tx.optionId
            && latest.type === tx.type && latest.date.toUnixInteger() === tx.date.toUnixInteger() && latest.price === tx.price) {
            let fees = null;
            if (latest.fees !== null)
                fees = latest.fees;
            if (tx.fees !== null)
                fees = tx.fees + (latest.fees || 0);
            latest.quantity = latest.quantity + tx.quantity;
            latest.amount = latest.amount + tx.amount;
            latest.fees = fees;
            return;
        }
        roll.push(latest);
        latest = tx;
    });
    latest !== null ? roll.push(latest) : null;
    return roll;
});
const rollupHistoricalHoldings = (historicalHoldings) => __awaiter(void 0, void 0, void 0, function* () {
    historicalHoldings.sort((a, b) => a.accountId - b.accountId ||
        a.securityId - b.securityId ||
        (a.optionId || 0) - (b.optionId || 0) ||
        a.date.toUnixInteger() - b.date.toUnixInteger() ||
        a.price - b.price);
    let roll = [];
    let latest = null;
    historicalHoldings.forEach(hh => {
        if (!latest) {
            latest = hh;
            return;
        }
        if (latest.accountId === hh.accountId && latest.securityId === hh.securityId && latest.optionId === hh.optionId
            && latest.date.toUnixInteger() === hh.date.toUnixInteger() && latest.price === hh.price) {
            latest.quantity = latest.quantity + hh.quantity;
            latest.value = latest.value + hh.value;
            let costBasis = null;
            if (latest.costBasis)
                costBasis = (costBasis || 0) + latest.costBasis;
            if (hh.costBasis)
                costBasis = (costBasis || 0) + hh.costBasis;
            latest.costBasis = costBasis;
            return;
        }
        roll.push(latest);
        latest = hh;
    });
    return roll;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS10cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UtdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsNkNBWXNCO0FBQ3RCLGlDQUErQjtBQUUvQixtQ0FBMkI7QUFFcEIsTUFBTSw4QkFBOEIsR0FBRyxDQUFDLE1BQWlDLEVBQUUsV0FBb0MsRUFBMkIsRUFBRTtJQUMvSSxRQUFRLE1BQU0sRUFBRTtRQUNaLEtBQUssc0NBQXlCLENBQUMsR0FBRztZQUM5QixXQUFXLENBQUMsTUFBTSxHQUFHLElBQUEsWUFBRyxFQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxPQUFPLFdBQVcsQ0FBQTtRQUN0QixLQUFLLHNDQUF5QixDQUFDLElBQUk7WUFDL0IsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFBLFlBQUcsRUFBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsT0FBTyxXQUFXLENBQUE7UUFDdEIsS0FBSyxzQ0FBeUIsQ0FBQyxLQUFLO1lBQ2hDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBQSxZQUFHLEVBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELE9BQU8sV0FBVyxDQUFBO1FBQ3RCLEtBQUssc0NBQXlCLENBQUMsS0FBSztZQUNoQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUEsWUFBRyxFQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxPQUFPLFdBQVcsQ0FBQTtRQUN0QjtZQUNJLE9BQU8sV0FBVyxDQUFBO0tBQ3pCO0FBQ0wsQ0FBQyxDQUFBO0FBakJZLFFBQUEsOEJBQThCLGtDQWlCMUM7QUFRRCxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVEsRUFBTyxFQUFFO0lBQy9CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcs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