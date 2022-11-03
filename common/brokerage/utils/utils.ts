import {abs} from "mathjs";
import {InvestmentTransactionType, TradingPostTransactions} from "../interfaces";

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