import {
    GetSecurityPrice,
    IBrokerageRepository,
    IBrokerageService, InvestmentTransactionType,
    SecurityType,
    TradingPostHistoricalHoldings,
    TradingPostHistoricalHoldingsTable,
    TradingPostTransactionsTable
} from "./interfaces";
import {PortfolioSummaryService} from "./portfolio-summary";
import {DateTime} from 'luxon';
import {getUSExchangeHoliday} from "../market-data/interfaces";

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
    "buy": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        // Roll back buy,
        // get transaction from holding
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for buy transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        holdings.holdings[hIdx] = h
        return holdings
    },
    "sell": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        // sell amount is going to be negative, hence why we can "add" it back
        holdings.cash = holdings.cash + tx.amount
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)
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
            })
            return holdings
        }

        const holding = holdings.holdings[hIdx];
        holding.quantity = holding.quantity + (-1 * tx.quantity)
        holdings.holdings[hIdx] = holding
        return holdings
    },
    "short": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)

        // TODO: .... this is possible for a short?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for short transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        holdings.holdings[hIdx] = h
        return holdings
    },
    "cover": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        const hIdx = holdings.holdings.findIndex(h => h.securityId === tx.securityId)

        // TODO:.... I think this is possible in a cover...?
        // TODO: Discuss pricing with short/cover
        if (hIdx === -1) throw new Error(`no prior holding found for security id ${tx.securityId} for cover transaction`)
        const h = holdings.holdings[hIdx];
        h.quantity = h.quantity + (-1 * tx.quantity)
        holdings.holdings[hIdx] = h
        return holdings
    },
    "cancel": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        // TODO: ... should investigate but we werent processing "pending" transactions to begin with
        //  so, in theory, this shouldnt happen
        return holdings;
    },
    "fee": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash + tx.amount;
        return holdings
    },
    "cash": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings
    },
    "transfer": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        // TODO: Assuming this is a transfer from another brokerage... we should just allocate holding in history...
        //  or de-allocate if it was transferred to another institution
        return holdings
    },
    "dividendOrInterest": (holdings: historicalAccount, tx: TradingPostTransactionsTable): historicalAccount => {
        holdings.cash = holdings.cash - tx.amount;
        return holdings
    },
};

export default class BrokerageService {
    brokerageMap: Record<string, IBrokerageService>;
    portfolioSummaryService: PortfolioSummaryService;
    repository: IBrokerageRepository;

    constructor(brokerageMap: Record<string, IBrokerageService>, repository: IBrokerageRepository, portfolioSummaryService: PortfolioSummaryService) {
        this.brokerageMap = brokerageMap
        this.repository = repository;
        this.portfolioSummaryService = portfolioSummaryService;
    }

    pullNewData = async (userId: string, brokerageId: string) => {
        const brokerage = this.brokerageMap[brokerageId];
        if (!brokerage) throw new Error("no brokerage found")

        const holdings = await brokerage.importHoldings(userId);
        await this.repository.upsertTradingPostCurrentHoldings(holdings);

        let holdingHistory: TradingPostHistoricalHoldings[] = holdings.map(holding => ({
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
            date: DateTime.now()
        }))
        await this.repository.upsertTradingPostHistoricalHoldings(holdingHistory);

        const transactions = await brokerage.importTransactions(userId);
        await this.repository.upsertTradingPostTransactions(transactions);
    }

    computeHoldingsHistory = async (tpAccountId: number, startDate: DateTime, endDate: DateTime): Promise<TradingPostHistoricalHoldings[]> => {
        const cashSecurity = await this.repository.getCashSecurityId();

        let allSecurityIds: Record<number, unknown> = {}

        // Get Current Holdings
        const currentHoldings = await this.repository.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity(tpAccountId);
        if (currentHoldings.length <= 0) throw new Error("no holdings available for account " + tpAccountId);
        currentHoldings.forEach(h => allSecurityIds[h.securityId] = {});

        // Get Current Transactions Sorted in DESC order
        const transactions = await this.repository.getTradingPostBrokerageAccountTransactions(tpAccountId);
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

        const allSecurityPricesMap: Record<number, GetSecurityPrice[]> = await this.getSecurityPrices(Object.keys(allSecurityIds).map(id => parseInt(id)), startDate, endDate);

        // Get Trading Days we will compute history for
        // In our db we will have a single row for each security on each day, so with 2 securities we'll have two rows for today
        let tradingDays = await this.getTradingDays(startDate, endDate)

        const initialHistoricalHolding: historicalAccount = {
            date: startDate,
            cash: 0,
            holdings: [],
        }

        for (const holding of currentHoldings) {
            if (holding.symbol === 'USD:CUR') {
                initialHistoricalHolding.cash = holding.quantity;
                continue
            }

            initialHistoricalHolding.date = holding.priceAsOf
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
                securityType: SecurityType.equity
            })
        }

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
                holdingToday.date = priorMarketDay
                priorHoldings.holdings.push(holdingToday)
            }

            historicalHoldingCollection.push(priorHoldings)
        }

        let historicalHoldings: TradingPostHistoricalHoldingsTable[] = [];
        for (const h of historicalHoldingCollection) {
            // Cash Position
            historicalHoldings.push({
                id: 0,
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
    }

    undoTransactions = (historicalAccount: historicalAccount, transactions: TradingPostTransactionsTable[]): historicalAccount => {
        // TODO: ... should not be imputing data like this... fix it up.
        for (const tx of transactions) historicalAccount = ruleSet[tx.type](historicalAccount, tx)
        return historicalAccount
    }

    getSecurityPrices = async (securityIds: number[], startDate: DateTime, endDate: DateTime): Promise<Record<number, GetSecurityPrice[]>> => {
        const securityPrices = await this.repository.getSecurityPricesWithEndDateBySecurityIds(
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
        const marketHolidays = await this.repository.getMarketHolidays(start, end);

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
