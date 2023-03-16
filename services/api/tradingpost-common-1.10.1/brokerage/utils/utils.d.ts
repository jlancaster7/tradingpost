import { InvestmentTransactionType, TradingPostCurrentHoldings, TradingPostHistoricalHoldings, TradingPostTransactions } from "../interfaces";
export declare const transformTransactionTypeAmount: (txType: InvestmentTransactionType, transaction: TradingPostTransactions) => TradingPostTransactions;
export declare const rollUpTransactions: (txs: TradingPostTransactions[]) => TradingPostTransactions[];
export declare const rollUpHistoricalHoldings: (holdings: TradingPostHistoricalHoldings[]) => TradingPostHistoricalHoldings[];
export declare const rollUpCurrentHoldings: (holdings: TradingPostCurrentHoldings[]) => TradingPostCurrentHoldings[];
