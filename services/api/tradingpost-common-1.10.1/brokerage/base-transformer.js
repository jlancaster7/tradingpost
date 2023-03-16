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
        if (tx.optionId === null)
            return holdings;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId === tx.optionId);
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
            return yield this._baseRepo.upsertTradingPostBrokerageAccounts(accounts);
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
        this.getStartDate = (currentHoldings) => __awaiter(this, void 0, void 0, function* () {
            if (currentHoldings.length > 0)
                return currentHoldings[0].holdingDate;
            // Get Last Trading Day
            return luxon_1.DateTime.now();
        });
        this.computeHoldingsHistory = (tpAccountId, excludeSecurityTypes = false) => __awaiter(this, void 0, void 0, function* () {
            const oldestTx = yield this._baseRepo.getOldestTransaction(tpAccountId);
            if (!oldestTx)
                throw new Error("no transactions for");
            const endDate = oldestTx.date;
            const cashSecurity = yield this._baseRepo.getCashSecurityId();
            let allSecurityIds = {};
            // Get Current Holdings
            const currentHoldings = yield this._baseRepo.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
            const startDate = yield this.getStartDate(currentHoldings);
            // TODO: We could recomptue old holdings history...
            if (currentHoldings.length <= 0)
                throw new Error("no holdings available for account " + tpAccountId);
            currentHoldings.forEach(h => {
                if (excludeSecurityTypes && h.securityType === interfaces_1.SecurityType.mutualFund)
                    return;
                if (excludeSecurityTypes && h.securityType === interfaces_1.SecurityType.currency)
                    return;
                allSecurityIds[h.securityId] = {};
            });
            // Get Current Transactions Sorted in DESC order
            let transactions = yield this._baseRepo.getTradingPostBrokerageAccountTransactions(tpAccountId);
            transactions = transactions.filter(t => {
                if (excludeSecurityTypes && t.securityType === interfaces_1.SecurityType.mutualFund)
                    return false;
                if (excludeSecurityTypes && t.securityType === interfaces_1.SecurityType.currency)
                    return false;
                return true;
            });
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
            const initialHistoricalHolding = {
                date: startDate,
                cash: 0,
                holdings: [],
            };
            for (const holding of currentHoldings) {
                if (holding.symbol === 'USD:CUR') {
                    initialHistoricalHolding.date = holding.holdingDate.setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    });
                    initialHistoricalHolding.cash = holding.quantity;
                    continue;
                }
                initialHistoricalHolding.date = holding.holdingDate.setZone("America/New_York").set({
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
                    date: holding.holdingDate.setZone("America/New_York").set({
                        hour: 16,
                        minute: 0,
                        second: 0,
                        millisecond: 0
                    }),
                    currency: "USD",
                    priceAsOf: holding.holdingDate.setZone("America/New_York").set({
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
    latest !== null ? roll.push(latest) : null;
    return roll;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS10cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UtdHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsNkNBYXNCO0FBQ3RCLGlDQUErQjtBQUUvQixtQ0FBMkI7QUFFcEIsTUFBTSw4QkFBOEIsR0FBRyxDQUFDLE1BQWlDLEVBQUUsV0FBb0MsRUFBMkIsRUFBRTtJQUMvSSxRQUFRLE1BQU0sRUFBRTtRQUNaLEtBQUssc0NBQXlCLENBQUMsR0FBRztZQUM5QixXQUFXLENBQUMsTUFBTSxHQUFHLElBQUEsWUFBRyxFQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxPQUFPLFdBQVcsQ0FBQTtRQUN0QixLQUFLLHNDQUF5QixDQUFDLElBQUk7WUFDL0IsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFBLFlBQUcsRUFBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsT0FBTyxXQUFXLENBQUE7UUFDdEIsS0FBSyxzQ0FBeUIsQ0FBQyxLQUFLO1lBQ2hDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBQSxZQUFHLEVBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELE9BQU8sV0FBVyxDQUFBO1FBQ3RCLEtBQUssc0NBQXlCLENBQUMsS0FBSztZQUNoQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUEsWUFBRyxFQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxPQUFPLFdBQVcsQ0FBQTtRQUN0QjtZQUNJLE9BQU8sV0FBVyxDQUFBO0tBQ3pCO0FBQ0wsQ0FBQyxDQUFBO0FBakJZLFFBQUEsOEJBQThCLGtDQWlCMUM7QUFRRCxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQVEsRUFBTyxFQUFFO0lBQy9CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcs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