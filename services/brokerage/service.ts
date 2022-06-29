import RealizefiProvider from "./realizefi-provider";
import {IRepository} from "./interfaces";

/**
 * BrokerageService is where we will perform all of derived computations
 * It wraps our factual table jobs and based on the responses from those factual import jobs, will
 *  re-compute, or append to our new transactions, accounts, & holdings/positions tables
 * We will also update our Portfolio table here
 *
 *
 */
export default class BrokerageService {
    private realizefi: RealizefiProvider;
    private repository: IRepository;

    constructor(realizefi: RealizefiProvider, repository: IRepository) {
        this.realizefi = realizefi
        this.repository = repository
    }

    newRealizefiAccounts = async (realizeUserId: string) => {
        const newAccountsAndUpdates = this.realizefi.importAccounts(realizeUserId, {returnUpdates: true});

        // Business Logic Here to Update Accounts Table
    }

    newRealizefiTransactions = async (realizeUserId: string) => {
        const newTransactions = this.realizefi.importTransactions(realizeUserId, null, {returnUpdates: true})

        // Business Logic Here to Update Transactions Table
    }

    newRealizefiPositions = async (realizeUserId: string) => {
        const newPositions = this.realizefi.importPositions(realizeUserId, null, {returnUpdates: true});

        // Business Logic Here to Update Holdings Table
    }
}