import {
    GetSecurityBySymbol,
    GetSecurityPrice, InvestmentTransactionType,
    OptionContract,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostCurrentHoldings,
    TradingPostCurrentHoldingsTableWithSecurity,
    TradingPostHistoricalHoldings,
    TradingPostHistoricalHoldingsTable,
    TradingPostTransactions,
    TradingPostTransactionsTable
} from "./interfaces";
import {DateTime} from "luxon";
import {getUSExchangeHoliday} from "../market-data/interfaces";
import {abs} from "mathjs";

export const transformTransactionTypeAmount = (txType: InvestmentTransactionType, transaction: TradingPostTransactions): TradingPostTransactions => {
    switch (txType) {
        case InvestmentTransactionType.buy:
            transaction.amount = abs(transaction.amount);
            return transaction
        case InvestmentTransactionType.sell:
            transaction.amount = -1 * abs(transaction.amount);
            return transaction
        case InvestmentTransactionType.short:
            transaction.amount = -1 * abs(transaction.amount);
            return transaction
        case InvestmentTransactionType.cover:
            transaction.amount = abs(transaction.amount);
            return transaction
        default:
            return transaction
    }
}

type historicalAccount = {
    date: DateTime
    cash: number
    holdings: TradingPostHistoricalHoldings[]
}

const deepCopy = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj))
}

type RuleSetFunction = (holdings: historicalAccount, tx: TradingPostTransactionsTable) => historicalAccount

// We do not recompute value in the rulesets since we are using the latest EOD price avail for a security to calculate
// value at the end of each day
let ruleSet: Record<InvestmentTransactionType, RuleSetFunction> = {
    [InvestmentTransactionType.buy]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        // Roll back buy,
        // get transaction from holding
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for buy transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.sell]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        // sell amount is going to be negative, hence why we can "add" it back
        holdings.cash = holdings.cash + tx.amount
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)
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
            })
            return holdings
        }

        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity);
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.short]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)

        // TODO: .... this is possible for a short?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for short transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h
        return holdings
    },
    [InvestmentTransactionType.cover]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)

        // TODO:.... I think this is possible in a cover...?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for cover transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h
        return holdings
    },
    [InvestmentTransactionType.cancel]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        // TODO: ... should investigate but we werent processing "pending" transactions to begin with
        //  so, in theory, this shouldnt happen
        return holdings;
    },
    [InvestmentTransactionType.fee]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        return holdings
    },
    [InvestmentTransactionType.cash]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings
    },
    [InvestmentTransactionType.transfer]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        // TODO: Assuming this is a transfer from another brokerage... we should just allocate holding in history...
        //  or de-allocate if it was transferred to another institution
        if (tx.securityType === 'cashEquivalent') {
            holdings.cash = holdings.cash - tx.amount;
            return holdings;
        }
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for buy transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * h.price;
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.dividendOrInterest]: (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings
    },
};

export interface BaseRepository {
    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<number[]>

    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    deleteTradingPostAccountCurrentHoldings(accountIds: number[]): Promise<void>

    upsertOptionContract(oc: OptionContract): Promise<number | null>

    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>

    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>

    getOldestTransaction(accountId: number): Promise<TradingPostTransactions | null>

    getCashSecurityId(): Promise<GetSecurityBySymbol>

    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]>

    getTradingPostBrokerageAccountTransactions(accountId: number): Promise<TradingPostTransactionsTable[]>

    getMarketHolidays(start: DateTime, end: DateTime): Promise<getUSExchangeHoliday[]>

    getSecurityPricesWithEndDateBySecurityIds(startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]>
}

export default class BaseTransformer {
    private _baseRepo: BaseRepository;

    constructor(repo: BaseRepository) {
        this._baseRepo = repo;
    }

    upsertAccounts = async (accounts: TradingPostBrokerageAccounts[]) => {
        return await this._baseRepo.upsertTradingPostBrokerageAccounts(accounts);
    }

    upsertPositions = async (positions: TradingPostCurrentHoldings[], accountIds: number[]) => {
        await this._baseRepo.deleteTradingPostAccountCurrentHoldings(accountIds);
        const rollup = await rollupPositions(positions);
        await this._baseRepo.upsertTradingPostCurrentHoldings(rollup);
    }

    upsertTransactions = async (transactions: TradingPostTransactions[]) => {
        const rollup = await rollupTransactions(transactions);
        const filtered = rollup.filter(f => f.securityType !== SecurityType.mutualFund);
        await this._baseRepo.upsertTradingPostTransactions(filtered)
    }

    upsertHistoricalHoldings = async (historicalHoldings: TradingPostHistoricalHoldings[]) => {
        const rollup = await rollupHistoricalHoldings(historicalHoldings);
        await this._baseRepo.upsertTradingPostHistoricalHoldings(rollup);
    }

    getStartDate = async (currentHoldings: TradingPostCurrentHoldings[]): Promise<DateTime> => {
        if (currentHoldings.length > 0) return currentHoldings[0].holdingDate;

        // Get Last Trading Day
        return DateTime.now()
    }

    computeHoldingsHistory = async (tpAccountId: number) => {
        const oldestTx = await this._baseRepo.getOldestTransaction(tpAccountId);
        if (!oldestTx) throw new Error("no transactions for");

        const endDate = oldestTx.date;

        const cashSecurity = await this._baseRepo.getCashSecurityId();

        let allSecurityIds: Record<number, unknown> = {}

        // Get Current Holdings
        const currentHoldings = await this._baseRepo.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
        const startDate = await this.getStartDate(currentHoldings);

        // TODO: We could recomptue old holdings history...
        if (currentHoldings.length <= 0) throw new Error("no holdings available for account " + tpAccountId);
        currentHoldings.forEach(h => allSecurityIds[h.securityId] = {});

        // Get Current Transactions Sorted in DESC order
        const transactions = await this._baseRepo.getTradingPostBrokerageAccountTransactions(tpAccountId);
        if (transactions.length <= 0) throw new Error("no transactions available for account " + tpAccountId);

        const transactionsPerDate: Record<number, TradingPostTransactionsTable[]> = {}
        transactions.forEach(tx => {
            allSecurityIds[tx.securityId] = {}
            const txDateUnix = tx.date.startOf('day').toUnixInteger();
            let txs = transactionsPerDate[txDateUnix];
            if (!txs) txs = [tx]
            else txs.push(tx)
            transactionsPerDate[txDateUnix] = txs
        });

        // Get Trading Days we will compute history for
        // In our db we will have a single row for each security on each day, so with 2 securities we'll have two rows for today

        const initialHistoricalHolding: historicalAccount = {
            date: startDate,
            cash: 0,
            holdings: [],
        }

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
                securityType: SecurityType.equity
            })
        }

        const allSecurityPricesMap: Record<number, GetSecurityPrice[]> = await this.getSecurityPrices(Object.keys(allSecurityIds).map(id => parseInt(id)), startDate, endDate);
        let tradingDays = await this.getTradingDays(startDate, endDate)
        let historicalHoldingCollection = [initialHistoricalHolding]

        for (let i = 0; i < tradingDays.length - 1; i++) {
            // Each Trading Day, we are computing for the prior historical day
            const tradingDay = tradingDays[i];
            const curHold = historicalHoldingCollection[historicalHoldingCollection.length - 1];
            let holdingsToday = deepCopy(curHold);

            if (tradingDay.startOf('day').toUnixInteger() in transactionsPerDate) {
                let txs = transactionsPerDate[tradingDay.startOf('day').toUnixInteger()];
                holdingsToday = this.undoTransactions(holdingsToday, txs)
            }

            let priorMarketDay = tradingDays[i + 1]
            let priorHoldings: historicalAccount = {
                date: priorMarketDay,
                holdings: [],
                cash: holdingsToday.cash
            }

            for (const holdingToday of holdingsToday.holdings) {
                let price = holdingToday.price
                const closestPrice = this.getClosestPrice(allSecurityPricesMap, holdingToday.securityId, priorMarketDay)
                if (closestPrice !== null) price = closestPrice
                holdingToday.price = price
                holdingToday.value = price * holdingToday.quantity
                holdingToday.date = priorMarketDay
                if (!holdingToday.quantity) {
                    continue;
                }
                priorHoldings.holdings.push(holdingToday)
            }

            historicalHoldingCollection.push(priorHoldings)
        }

        let historicalHoldings: TradingPostHistoricalHoldingsTable[] = [];
        for (const h of historicalHoldingCollection) {
            // Cash Position
            historicalHoldings.push({
                id: 0,
                optionId: null,
                updated_at: DateTime.now(),
                created_at: DateTime.now(),
                price: 1,
                securityType: SecurityType.cashEquivalent,
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
                    updated_at: DateTime.now(),
                    created_at: DateTime.now(),
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

        await this.upsertHistoricalHoldings(historicalHoldings);
    }

    undoTransactions = (historicalAccount: historicalAccount, transactions: TradingPostTransactionsTable[]): historicalAccount => {
        // TODO: ... should not be imputing data like this... fix it up.
        for (const tx of transactions) historicalAccount = ruleSet[tx.type](historicalAccount, tx)
        return historicalAccount
    }

    getSecurityPrices = async (securityIds: number[], startDate: DateTime, endDate: DateTime): Promise<Record<number, GetSecurityPrice[]>> => {
        const securityPrices = await this._baseRepo.getSecurityPricesWithEndDateBySecurityIds(
            endDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0
            }), startDate.set({
                minute: 0,
                second: 0,
                hour: 0,
                millisecond: 0,
            }), securityIds)
        let securityPricesMap: Record<number, GetSecurityPrice[]> = {}
        for (const sp of securityPrices) {
            let sps = securityPricesMap[sp.securityId];
            if (!sps) sps = [sp]
            else sps.push(sp)
            securityPricesMap[sp.securityId] = sps
        }

        return securityPricesMap
    }

    getTradingDays = async (start: DateTime, end: DateTime): Promise<DateTime[]> => {
        const marketHolidays = await this._baseRepo.getMarketHolidays(start, end);

        let holidayMap: Record<string, unknown> = {};
        marketHolidays.forEach((row: getUSExchangeHoliday) => {
            const dt = row.date.set({hour: 16, minute: 0, second: 0, millisecond: 0})
            holidayMap[dt.toUnixInteger()] = {}
        });

        let startDate = start.set({hour: 16, minute: 0, second: 0, millisecond: 0});
        let endDate = end.set({hour: 16, minute: 0, second: 0, millisecond: 0}).minus({day: 1});
        let tradingDays: DateTime[] = []
        for (; startDate.toUnixInteger() >= endDate.toUnixInteger(); startDate = startDate.minus({day: 1})) {
            if (startDate.weekday === 6 || startDate.weekday === 7) continue
            if (startDate.toUnixInteger() in holidayMap) continue
            tradingDays.push(startDate)
        }

        return tradingDays.sort((a, b) => {
            if (a.toUnixInteger() < b.toUnixInteger()) return 1;
            if (a.toUnixInteger() > b.toUnixInteger()) return -1;
            return 0;
        })
    }

    getClosestPrice = (securityPricesMap: Record<number, GetSecurityPrice[]>, securityId: number, postingDate: DateTime): number | null => {
        const securityPrices = securityPricesMap[securityId];
        if (!securityPrices) return null

        const postingDateUnix = postingDate.startOf('day').toUnixInteger()
        for (let sp of securityPrices) {
            const spUnix = sp.time.startOf('day').toUnixInteger()
            if (spUnix <= postingDateUnix) return sp.price
        }

        return null;
    }
}

const rollupPositions = async (positions: TradingPostCurrentHoldings[]): Promise<TradingPostCurrentHoldings[]> => {
    positions.sort((a, b) =>
        a.accountId - b.accountId ||
        a.securityId - b.securityId ||
        (a.optionId || 0) - (b.optionId || 0)
    );

    let roll: TradingPostCurrentHoldings[] = [];
    let latest: TradingPostCurrentHoldings | null = null;
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
}

const rollupTransactions = async (transactions: TradingPostTransactions[]): Promise<TradingPostTransactions[]> => {
    transactions.sort((a, b) =>
        a.accountId - b.accountId ||
        a.securityId - b.securityId ||
        (a.optionId || 0) - (b.optionId || 0) ||
        a.type.localeCompare(b.type) ||
        a.date.toUnixInteger() - b.date.toUnixInteger() ||
        a.price - b.price
    )

    let roll: TradingPostTransactions[] = [];
    let latest: TradingPostTransactions | null = null;
    transactions.forEach(tx => {
        if (!latest) {
            latest = tx;
            return;
        }

        if (latest.accountId === tx.accountId && latest.securityId === tx.securityId && latest.optionId === tx.optionId
            && latest.type === tx.type && latest.date.toUnixInteger() === tx.date.toUnixInteger() && latest.price === tx.price) {
            let fees: number | null = null
            if (latest.fees !== null) fees = latest.fees;
            if (tx.fees !== null) fees = tx.fees + (latest.fees || 0)

            latest.quantity = latest.quantity + tx.quantity;
            latest.amount = latest.amount + tx.amount;
            latest.fees = fees;
            return
        }

        roll.push(latest);
        latest = tx;
    });

    latest !== null ? roll.push(latest) : null
    return roll;
}

const rollupHistoricalHoldings = async (historicalHoldings: TradingPostHistoricalHoldings[]): Promise<TradingPostHistoricalHoldings[]> => {
    historicalHoldings.sort((a, b) =>
        a.accountId - b.accountId ||
        a.securityId - b.securityId ||
        (a.optionId || 0) - (b.optionId || 0) ||
        a.date.toUnixInteger() - b.date.toUnixInteger() ||
        a.price - b.price
    )

    let roll: TradingPostHistoricalHoldings[] = [];
    let latest: TradingPostHistoricalHoldings | null = null;
    historicalHoldings.forEach(hh => {
        if (!latest) {
            latest = hh;
            return;
        }

        if (latest.accountId === hh.accountId && latest.securityId === hh.securityId && latest.optionId === hh.optionId
            && latest.date.toUnixInteger() === hh.date.toUnixInteger() && latest.price === hh.price) {

            latest.quantity = latest.quantity + hh.quantity
            latest.value = latest.value + hh.value
            let costBasis = null;
            if (latest.costBasis) costBasis = (costBasis || 0) + latest.costBasis
            if (hh.costBasis) costBasis = (costBasis || 0) + hh.costBasis
            latest.costBasis = costBasis
            return
        }

        roll.push(latest);
        latest = hh;
    });

    latest !== null ? roll.push(latest) : null
    return roll;
}

