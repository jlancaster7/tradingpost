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
class BrokerageService {
    constructor(brokerageMap, repository, portfolioSummaryService) {
        this.computeHoldingsHistory = (tpAccountId, endDate) => __awaiter(this, void 0, void 0, function* () {
            const cashSecurity = yield this.repository.getCashSecurityId();
            let allSecurityIds = {};
            // Get Current Holdings
            const currentHoldings = yield this.repository.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
            // TODO: We could recomptue old holdings history...
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
            return historicalHoldings;
        });
        this.undoTransactions = (historicalAccount, transactions) => {
            // TODO: ... should not be imputing data like this... fix it up.
            for (const tx of transactions)
                historicalAccount = ruleSet[tx.type](historicalAccount, tx);
            return historicalAccount;
        };
        this.getSecurityPrices = (securityIds, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            const securityPrices = yield this.repository.getSecurityPricesWithEndDateBySecurityIds(endDate.set({
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
        this.brokerageMap = brokerageMap;
        this.repository = repository;
        this.portfolioSummaryService = portfolioSummaryService;
    }
}
exports.default = BrokerageService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2Q0FRc0I7QUFFdEIsaUNBQStCO0FBUy9CLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBUSxFQUFPLEVBQUU7SUFDL0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUMxQyxDQUFDLENBQUE7QUFJRCxzSEFBc0g7QUFDdEgsK0JBQStCO0FBQy9CLElBQUksT0FBTyxHQUF1RDtJQUM5RCxDQUFDLHNDQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBMkIsRUFBRSxFQUFnQyxFQUFxQixFQUFFO1FBQ2xILFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQzFDLGlCQUFpQjtRQUNqQiwrQkFBK0I7UUFDL0IsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUM3RSxJQUFJLElBQUksS0FBSyxDQUFDLENBQUM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxFQUFFLENBQUMsVUFBVSxzQkFBc0IsQ0FBQyxDQUFBO1FBQy9HLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQy9C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