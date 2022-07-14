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
/**
 * BrokerageService is where we will perform all of derived computations
 * It wraps our factual table jobs and based on the responses from those factual import jobs, will
 *  re-compute, or append to our new transactions, accounts, & holdings/positions tables
 * We will also update our Portfolio table here
 *
 *
 */
class BrokerageService {
    constructor(realizefi, repository) {
        this.newRealizefiAccounts = (realizeUserId) => __awaiter(this, void 0, void 0, function* () {
            const newAccountsAndUpdates = this.realizefi.importAccounts(realizeUserId, { returnUpdates: true });
            // Business Logic Here to Update Accounts Table
        });
        this.newRealizefiTransactions = (realizeUserId) => __awaiter(this, void 0, void 0, function* () {
            const newTransactions = this.realizefi.importTransactions(realizeUserId, null, { returnUpdates: true });
            // Business Logic Here to Update Transactions Table
        });
        this.newRealizefiPositions = (realizeUserId) => __awaiter(this, void 0, void 0, function* () {
            const newPositions = this.realizefi.importPositions(realizeUserId, null, { returnUpdates: true });
            // Business Logic Here to Update Holdings Table
        });
        this.realizefi = realizefi;
        this.repository = repository;
    }
}
exports.default = BrokerageService;
