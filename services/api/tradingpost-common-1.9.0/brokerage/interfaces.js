"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerageTaskStatusType = exports.BrokerageTaskType = exports.DirectBrokeragesType = exports.TradingPostBrokerageAccountStatus = exports.InvestmentTransactionType = exports.SecurityType = void 0;
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
    InvestmentTransactionType["dividendOrInterest"] = "dividendOrInterest";
})(InvestmentTransactionType = exports.InvestmentTransactionType || (exports.InvestmentTransactionType = {}));
var TradingPostBrokerageAccountStatus;
(function (TradingPostBrokerageAccountStatus) {
    TradingPostBrokerageAccountStatus["ACTIVE"] = "ACTIVE";
    TradingPostBrokerageAccountStatus["INACTIVE"] = "INACTIVE";
    TradingPostBrokerageAccountStatus["REMOVED"] = "REMOVED";
    TradingPostBrokerageAccountStatus["ERROR"] = "ERROR";
    TradingPostBrokerageAccountStatus["PROCESSING"] = "PROCESSING";
})(TradingPostBrokerageAccountStatus = exports.TradingPostBrokerageAccountStatus || (exports.TradingPostBrokerageAccountStatus = {}));
var DirectBrokeragesType;
(function (DirectBrokeragesType) {
    DirectBrokeragesType["Robinhood"] = "Robinhood";
    DirectBrokeragesType["Ibkr"] = "Ibkr";
    DirectBrokeragesType["Finicity"] = "Finicity";
})(DirectBrokeragesType = exports.DirectBrokeragesType || (exports.DirectBrokeragesType = {}));
var BrokerageTaskType;
(function (BrokerageTaskType) {
    BrokerageTaskType["NewAccount"] = "NEW_ACCOUNT";
    BrokerageTaskType["NewData"] = "NEW_DATA";
    BrokerageTaskType["DeleteAccount"] = "DELETE_ACCOUNT";
    BrokerageTaskType["UpdateAccount"] = "UPDATE_ACCOUNT";
    BrokerageTaskType["ToDo"] = "TODO";
})(BrokerageTaskType = exports.BrokerageTaskType || (exports.BrokerageTaskType = {}));
var BrokerageTaskStatusType;
(function (BrokerageTaskStatusType) {
    BrokerageTaskStatusType["Partial"] = "PARTIAL";
    BrokerageTaskStatusType["Pending"] = "PENDING";
    BrokerageTaskStatusType["Running"] = "RUNNING";
    BrokerageTaskStatusType["Failed"] = "FAILED";
    BrokerageTaskStatusType["Successful"] = "SUCCESSFUL";
})(BrokerageTaskStatusType = exports.BrokerageTaskStatusType || (exports.BrokerageTaskStatusType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImludGVyZmFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBNmtCQSxJQUFZLFlBU1g7QUFURCxXQUFZLFlBQVk7SUFDcEIsaUNBQWlCLENBQUE7SUFDakIsaUNBQWlCLENBQUE7SUFDakIsK0JBQWUsQ0FBQTtJQUNmLHlDQUF5QixDQUFBO0lBQ3pCLGlEQUFpQyxDQUFBO0lBQ2pDLDJDQUEyQixDQUFBO0lBQzNCLHFDQUFxQixDQUFBO0lBQ3JCLG1DQUFtQixDQUFBO0FBQ3ZCLENBQUMsRUFUVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQVN2QjtBQUVELElBQVkseUJBVVg7QUFWRCxXQUFZLHlCQUF5QjtJQUNqQyx3Q0FBVyxDQUFBO0lBQ1gsMENBQWEsQ0FBQTtJQUNiLDRDQUFlLENBQUE7SUFDZiw0Q0FBZSxDQUFBO0lBQ2YsOENBQWlCLENBQUE7SUFDakIsd0NBQVcsQ0FBQTtJQUNYLDBDQUFhLENBQUE7SUFDYixrREFBcUIsQ0FBQTtJQUNyQixzRUFBeUMsQ0FBQTtBQUM3QyxDQUFDLEVBVlcseUJBQXlCLEdBQXpCLGlDQUF5QixLQUF6QixpQ0FBeUIsUUFVcEM7QUFrQ0QsSUFBWSxpQ0FNWDtBQU5ELFdBQVksaUNBQWlDO0lBQ3pDLHNEQUFpQixDQUFBO0lBQ2pCLDBEQUFxQixDQUFBO0lBQ3JCLHdEQUFtQixDQUFBO0lBQ25CLG9EQUFlLENBQUE7SUFDZiw4REFBeUIsQ0FBQTtBQUM3QixDQUFDLEVBTlcsaUNBQWlDLEdBQWpDLHlDQUFpQyxLQUFqQyx5Q0FBaUMsUUFNNUM7QUF3R0QsSUFBWSxvQkFJWDtBQUpELFdBQVksb0JBQW9CO0lBQzVCLCtDQUF1QixDQUFBO0lBQ3ZCLHFDQUFhLENBQUE7SUFDYiw2Q0FBcUIsQ0FBQTtBQUN6QixDQUFDLEVBSlcsb0JBQW9CLEdBQXBCLDRCQUFvQixLQUFwQiw0QkFBb0IsUUFJL0I7QUFFRCxJQUFZLGlCQU1YO0FBTkQsV0FBWSxpQkFBaUI7SUFDekIsK0NBQTBCLENBQUE7SUFDMUIseUNBQW9CLENBQUE7SUFDcEIscURBQWdDLENBQUE7SUFDaEMscURBQWdDLENBQUE7SUFDaEMsa0NBQWEsQ0FBQTtBQUNqQixDQUFDLEVBTlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFNNUI7QUFFRCxJQUFZLHVCQU1YO0FBTkQsV0FBWSx1QkFBdUI7SUFDL0IsOENBQW1CLENBQUE7SUFDbkIsOENBQW1CLENBQUE7SUFDbkIsOENBQW1CLENBQUE7SUFDbkIsNENBQWlCLENBQUE7SUFDakIsb0RBQXlCLENBQUE7QUFDN0IsQ0FBQyxFQU5XLHVCQUF1QixHQUF2QiwrQkFBdUIsS0FBdkIsK0JBQXVCLFFBTWxDIn0=