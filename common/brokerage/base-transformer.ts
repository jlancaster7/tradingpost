import {
    GetSecurityBySymbol,
    GetSecurityPrice,
    InvestmentTransactionType,
    OptionContract,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostCurrentHoldings,
    TradingPostCurrentHoldingsTableWithSecurity,
    TradingPostHistoricalHoldings,
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

type RuleSetFunction = (holdings: historicalAccount, tx: TradingPostTransactionsTable) => Promise<historicalAccount>

// We do not recompute value in the rulesets since we are using the latest EOD price avail for a security to calculate
// value at the end of each day
let ruleSet: Record<InvestmentTransactionType, RuleSetFunction> = {
    [InvestmentTransactionType.split]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        return holdings;
    },
    [InvestmentTransactionType.buy]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId == tx.optionId)
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
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * tx.price;
        h.price = tx.price
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.sell]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        holdings.cash = holdings.cash + tx.amount
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId == tx.optionId)
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
        h.value = h.quantity * tx.price;
        h.price = tx.price
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.short]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId == tx.optionId)
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
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * tx.price;
        h.price = tx.price
        holdings.holdings[hIdx] = h
        return holdings
    },
    [InvestmentTransactionType.cover]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId == tx.optionId)

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
            return holdings;
        }

        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * tx.price;
        h.price = tx.price
        holdings.holdings[hIdx] = h
        return holdings
    },
    [InvestmentTransactionType.cancel]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        if (tx.optionId === null) return holdings;

        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId == tx.optionId)
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
        h.value = h.quantity * tx.price;
        h.price = tx.price
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.fee]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        holdings.cash = holdings.cash + tx.amount;
        return holdings
    },
    [InvestmentTransactionType.cash]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings
    },
    [InvestmentTransactionType.transfer]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
        if (tx.securityType === 'cashEquivalent') {
            holdings.cash = holdings.cash - tx.amount;
            return holdings;
        }

        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId && h.optionId == tx.optionId);
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
        h.quantity = h.quantity + (-1 * tx.quantity)
        h.value = h.quantity * tx.price;
        h.price = tx.price
        holdings.holdings[hIdx] = h;
        return holdings
    },
    [InvestmentTransactionType.dividendOrInterest]: async (holdings: historicalAccount, tx: TradingPostTransactionsTable): Promise<historicalAccount> => {
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

    getStartDate = async (currentHoldings: TradingPostCurrentHoldings[], tradingDay: DateTime): Promise<DateTime> => {
        return currentHoldings.length > 0 ? currentHoldings[0].holdingDate : tradingDay
    }

    _filterHoldings = (holdings: TradingPostCurrentHoldingsTableWithSecurity[], excludeSecurityTypes: boolean) => {
        return holdings.filter(h => {
            if (excludeSecurityTypes && h.securityType === SecurityType.mutualFund) return
            if (excludeSecurityTypes && h.securityType === SecurityType.currency) return
        });
    }

    _filterTransactions = (transactions: TradingPostTransactions[], excludeSecurityTypes: boolean) => {
        return transactions.filter(t => {
            if (excludeSecurityTypes && t.securityType === SecurityType.mutualFund) return false
            return !(excludeSecurityTypes && t.securityType === SecurityType.currency);
        })
    }

    _groupTransactionsByDay = (transactions: TradingPostTransactionsTable[]) => {
        const transactionsPerDate: Map<number, TradingPostTransactionsTable[]> = new Map();
        transactions.forEach(tx => {
            const unixDay = tx.date.setZone("America/New_York").set({
                hour: 16,
                minute: 0,
                second: 0,
                millisecond: 0
            }).toUnixInteger();
            let txs = transactionsPerDate.get(unixDay);
            if (!txs) txs = [];

            transactionsPerDate.set(unixDay, [...txs, tx])
        });

        return transactionsPerDate
    }

    _getInitialHistoricalHolding = (tpAccountId: number, startDate: DateTime, currentHoldings: TradingPostCurrentHoldingsTableWithSecurity[]) => {
        const initialHistoricalHolding: historicalAccount = {
            date: startDate,
            cash: 0,
            holdings: []
        }

        for (const holding of currentHoldings) {
            if (holding.symbol === 'USD:CUR') {
                initialHistoricalHolding.cash = holding.quantity;
                continue;
            }

            initialHistoricalHolding.holdings.push({
                optionId: holding.optionId,
                price: holding.price,
                accountId: tpAccountId,
                costBasis: holding.costBasis,
                date: startDate,
                currency: "USD",
                priceAsOf: startDate,
                quantity: holding.quantity,
                priceSource: holding.priceSource,
                securityId: holding.securityId,
                value: holding.value,
                securityType: holding.securityType
            })
        }

        return initialHistoricalHolding
    }

    computeHoldingsHistory = async (tpAccountId: number, excludeSecurityTypes: boolean = false, end?: DateTime) => {
        const cashSecurity = await this._baseRepo.getCashSecurityId();
        const currentHoldings = await this._baseRepo.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);

        let transactions = await this._baseRepo.getTradingPostBrokerageAccountTransactions(tpAccountId);

        const filteredHoldings = this._filterHoldings(currentHoldings, excludeSecurityTypes);
        const filteredTransactions = this._filterTransactions(transactions, excludeSecurityTypes)
        const groupedTransactions = this._groupTransactionsByDay(transactions)

        const securityIds = new Set<number>();
        filteredHoldings.forEach(h => securityIds.add(h.securityId))
        filteredTransactions.forEach(h => securityIds.add(h.securityId));

        // StartDate = NOW, EndDate = Date going back towards
        let tradingDays = await this.getTradingDaysLast36Months()

        const startDate = await this.getStartDate(currentHoldings, tradingDays[0]);
        const oldestTxDate = transactions.length === 0 ? startDate.minus({month: 12}) : transactions[transactions.length - 1].date
        const endDate = end ? end : oldestTxDate;
        tradingDays = tradingDays.filter(t => t.toUnixInteger() <= startDate.toUnixInteger())

        const allSecurityPricesMap = await this.getSecurityPrices(Array.from(securityIds), startDate, endDate);

        let historicalHoldingsCollection: historicalAccount[] = [this._getInitialHistoricalHolding(tpAccountId, startDate, currentHoldings)];
        for (let i = 0; i < tradingDays.length; i++) {
            const tradingDay = tradingDays[i];
            if (tradingDay.toUnixInteger() < endDate.toUnixInteger()) break;
            let holdingsToday: historicalAccount = deepCopy(historicalHoldingsCollection[historicalHoldingsCollection.length - 1]);

            const transactions = groupedTransactions.get(tradingDay.toUnixInteger());
            if (transactions) holdingsToday = await this.undoTransactions(holdingsToday, transactions)

            const priorMarketDay = tradingDays[i + 1]
            let priorHoldings: historicalAccount = {
                date: priorMarketDay,
                holdings: holdingsToday.holdings.filter(h => h.quantity !== 0 && h.quantity).map(h => {
                    const closestPrice = this.getClosestPrice(allSecurityPricesMap, h.securityId, priorMarketDay)
                    const price = closestPrice ? closestPrice : h.price
                    return {
                        ...h,
                        price: price,
                        value: h.quantity * price,
                        date: priorMarketDay
                    };
                }),
                cash: holdingsToday.cash
            }
            historicalHoldingsCollection.push(priorHoldings)
        }

        // Removing initial holdings -- which we dont need
        historicalHoldingsCollection = historicalHoldingsCollection.slice(1);
        let historicalHoldingsInsert: TradingPostHistoricalHoldings[] = [];
        historicalHoldingsCollection.forEach(hc => {
            historicalHoldingsInsert.push({
                optionId: null,
                price: 1,
                securityType: SecurityType.cashEquivalent,
                value: hc.cash,
                securityId: cashSecurity.id,
                priceSource: hc.holdings.length ? hc.holdings[0].priceSource : '',
                quantity: hc.cash,
                priceAsOf: hc.date,
                currency: 'USD',
                date: hc.date,
                costBasis: 0,
                accountId: tpAccountId,
            });
            hc.holdings.forEach(h => {
                historicalHoldingsInsert.push({
                    optionId: h.optionId,
                    price: h.price,
                    securityType: h.securityType,
                    value: h.value,
                    securityId: h.securityId,
                    priceSource: h.priceSource,
                    quantity: h.quantity,
                    priceAsOf: h.date,
                    currency: 'USD',
                    date: h.date,
                    costBasis: h.costBasis,
                    accountId: h.accountId,
                });
            })
        })

        await this.upsertHistoricalHoldings(historicalHoldingsInsert);
    }

    undoTransactions = async (historicalAccount: historicalAccount, transactions: TradingPostTransactionsTable[]): Promise<historicalAccount> => {
        // TODO: ... should not be imputing data like this... fix it up.
        for (const tx of transactions) historicalAccount = await ruleSet[tx.type](historicalAccount, tx)
        return historicalAccount
    }

    getSecurityPrices = async (securityIds: number[], startDate: DateTime, endDate: DateTime): Promise<Map<number, GetSecurityPrice[]>> => {
        if (securityIds.length <= 0) return new Map();
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

        let securityPricesMap: Map<number, GetSecurityPrice[]> = new Map();
        for (const sp of securityPrices) {
            let sps = securityPricesMap.get(sp.securityId);
            if (!sps) sps = []
            securityPricesMap.set(sp.securityId, [...sps, sp])
        }
        return securityPricesMap
    }

    getTradingDaysLast36Months = async (): Promise<DateTime[]> => {
        let start = DateTime.now().setZone("America/New_York").set({hour: 16, minute: 0, second: 0, millisecond: 0});
        let end = start.minus({month: 36})
        const marketHolidays = await this._baseRepo.getMarketHolidays(start, end);

        let holidayMap: Map<number, boolean> = new Map();
        marketHolidays.forEach(r => holidayMap.set(r.date.set({
            hour: 16,
            minute: 0,
            second: 0,
            millisecond: 0
        }).toUnixInteger(), true));

        let tradingDays: DateTime[] = []
        for (; start.toUnixInteger() >= end.toUnixInteger(); start = start.minus({day: 1})) {
            if (start.weekday === 6 || start.weekday === 7) continue
            if (start.toUnixInteger() in holidayMap) continue
            tradingDays.push(start)
        }

        return tradingDays.sort((a, b) => {
            if (a.toUnixInteger() < b.toUnixInteger()) return 1;
            if (a.toUnixInteger() > b.toUnixInteger()) return -1;
            return 0;
        })
    }

    getClosestPrice = (securityPricesMap: Map<number, GetSecurityPrice[]>, securityId: number, postingDate: DateTime): number | null => {
        const securityPrices = securityPricesMap.get(securityId);
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

