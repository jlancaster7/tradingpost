"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentTransactionType = exports.SecurityType = void 0;
var SecurityType;
(function (SecurityType) {
    SecurityType["equity"] = "equity";
    SecurityType["option"] = "option";
    SecurityType["index"] = "index";
    SecurityType["mutualFund"] = "mutualFund";
    SecurityType["cashEquivalent"] = "cashEquivalent";
    SecurityType["fixedIncome"] = "fixedIncome";
    SecurityType["currency"] = "currency";
    SecurityType["unknown"] = "unknown";
})(SecurityType = exports.SecurityType || (exports.SecurityType = {}));
var InvestmentTransactionType;
(function (InvestmentTransactionType) {
    InvestmentTransactionType["buy"] = "buy";
    InvestmentTransactionType["sell"] = "sell";
    InvestmentTransactionType["short"] = "short";
    InvestmentTransactionType["cover"] = "cover";
    InvestmentTransactionType["cancel"] = "cancel";
    InvestmentTransactionType["fee"] = "fee";
    InvestmentTransactionType["cash"] = "cash";
    InvestmentTransactionType["transfer"] = "transfer";
    InvestmentTransactionType["dividendOrInerest"] = "dividendOrInterest";
})(InvestmentTransactionType = exports.InvestmentTransactionType || (exports.InvestmentTransactionType = {}));
// Could conditional type
// Need to do nested ternary operator
// type guards functions that you write that ensure that a value is something
const ensureT = (data) => {
    return true;
};
const X = "hello";
if (ensureT(X)) {
    X;
}
