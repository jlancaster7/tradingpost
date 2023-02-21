"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollUpCurrentHoldings = exports.rollUpHistoricalHoldings = exports.rollUpTransactions = exports.transformTransactionTypeAmount = void 0;
const mathjs_1 = require("mathjs");
const interfaces_1 = require("../interfaces");
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
const rollUpTransactions = (txs) => {
    return [];
};
exports.rollUpTransactions = rollUpTransactions;
const rollUpHistoricalHoldings = (holdings) => {
    return [];
};
exports.rollUpHistoricalHoldings = rollUpHistoricalHoldings;
const rollUpCurrentHoldings = (holdings) => {
    return [];
};
exports.rollUpCurrentHoldings = rollUpCurrentHoldings;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBMkI7QUFDM0IsOENBS3VCO0FBRWhCLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxNQUFpQyxFQUFFLFdBQW9DLEVBQTJCLEVBQUU7SUFDL0ksUUFBUSxNQUFNLEVBQUU7UUFDWixLQUFLLHNDQUF5QixDQUFDLEdBQUc7WUFDOUIsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFBLFlBQUcsRUFBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0MsT0FBTyxXQUFXLENBQUE7UUFDdEIsS0FBSyxzQ0FBeUIsQ0FBQyxJQUFJO1lBQy9CLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBQSxZQUFHLEVBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELE9BQU8sV0FBVyxDQUFBO1FBQ3RCLEtBQUssc0NBQXlCLENBQUMsS0FBSztZQUNoQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUEsWUFBRyxFQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxPQUFPLFdBQVcsQ0FBQTtRQUN0QixLQUFLLHNDQUF5QixDQUFDLEtBQUs7WUFDaEMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFBLFlBQUcsRUFBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0MsT0FBTyxXQUFXLENBQUE7UUFDdEI7WUFDSSxPQUFPLFdBQVcsQ0FBQTtLQUN6QjtBQUNMLENBQUMsQ0FBQTtBQWpCWSxRQUFBLDhCQUE4QixrQ0FpQjFDO0FBRU0sTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEdBQThCLEVBQTZCLEVBQUU7SUFDNUYsT0FBTyxFQUFFLENBQUM7QUFDZCxDQUFDLENBQUE7QUFGWSxRQUFBLGtCQUFrQixzQkFFOUI7QUFFTSxNQUFNLHdCQUF3QixHQUFHLENBQUMsUUFBeUMsRUFBbUMsRUFBRTtJQUNuSCxPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUMsQ0FBQTtBQUZZLFFBQUEsd0JBQXdCLDRCQUVwQztBQUVNLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxRQUFzQyxFQUFnQyxFQUFFO0lBQzFHLE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQyxDQUFBO0FBRlksUUFBQSxxQkFBcUIseUJBRWpDIn0=