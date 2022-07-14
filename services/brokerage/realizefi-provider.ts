import {ImportOpts, IProvider, TradingPostAccount, TradingPostHolding, TradingPostTransaction} from "./interfaces";
import Realizefi from '@tradingpost/common/realizefi';
import {
    IRepository,
    RealizefiAccount,
    RealizefiAccountPosition,
    RealizefiAccountTransaction,
    RealizefiUser
} from "./interfaces";
import {DateTime} from "luxon";

export default class RealizefiProvider implements IProvider {
    private realizefi: Realizefi;
    private repository: IRepository;

    constructor(realizefi: Realizefi, repository: IRepository) {
        this.realizefi = realizefi
        this.repository = repository;
    }

    auth = async (tpUserId: string, successRedirect: string, failureRedirect: string): Promise<string> => {
        try {
            let realizeFiAccount = await this.repository.getRealizefiUser({tpUserId})
            if (realizeFiAccount === null) realizeFiAccount = await this._createRealizefiUser();
            const authPortalResponse = await this.realizefi.createAuthPortal(
                realizeFiAccount.realizefiId, successRedirect, failureRedirect)
            return authPortalResponse.url
        } catch (e) {
            throw e;
        }
    }

    _createRealizefiUser = async (): Promise<RealizefiUser> => {
        const realizeUser = await this.realizefi.createUser();
        return await this.repository.addRealizefiUser(realizeUser.id)
    }

    importAccounts = async (realizefiUserId: string, opts: ImportOpts = {returnUpdates: false}): Promise<TradingPostAccount[] | void> => {
        const realizefiUser = await this.realizefi.getUser(realizefiUserId);
        const userAccount = await this.repository.getRealizefiUser({realizefiUserId})
        if (userAccount === null || userAccount.id === null) throw new Error(`no user account associated with realize user id ${realizefiUserId}`);

        let newAccounts: RealizefiAccount[] = []
        for (const institution of realizefiUser.institutionLinks) {
            const balance = await this.realizefi.getBalances(institution.id);
            newAccounts.push({
                id: null,
                accountId: userAccount.id,
                realizefiInstitutionId: institution.id,
                institution: institution.institution,
                accountNumber: institution.accountNumber,
                accountValue: parseFloat(balance.accountValue),
                buyingPower: parseFloat(balance.buyingPower),
                cash: parseFloat(balance.cash),
                healthStatus: institution.healthStatus,
                margin: parseFloat(balance.margin),
                permissionScopes: JSON.stringify(institution.permissionScopes)
            })
        }

        await this.repository.addRealizefiAccounts(newAccounts);
    }

    importTransactions = async (realizefiUserId: string, institutionID: string | null = null, opts: ImportOpts = {returnUpdates: false}): Promise<TradingPostTransaction[] | void> => {
        let realizefiAccounts = await this.repository.getRealizefiAccounts(realizefiUserId);
        if (institutionID) realizefiAccounts = realizefiAccounts.filter(a => a.realizefiInstitutionId === institutionID);

        let newTransactions: RealizefiAccountTransaction[] = [];
        for (const account of realizefiAccounts) {
            // TODO: Implement paging
            if (account.id === null) throw new Error("account id is null");
            const transactions = await this.realizefi.listTransactions(account.realizefiInstitutionId)
            for (const tx of transactions.data) {
                newTransactions.push({
                    id: null,
                    accountId: account.id,
                    adjustmentRatio: tx.details && tx.details.adjustmentRatio,
                    fees: tx.details && parseFloat(tx.details.fees),
                    instrument: tx.details && tx.details.instrument,
                    netAmount: parseFloat(tx.netAmount),
                    price: tx.details && parseFloat(tx.details.price),
                    quantity: tx.details && parseFloat(tx.details.quantity),
                    realizefiTransactionId: tx.id,
                    transactionSubTypeDetail: tx.details && tx.details.transactionSubType || null,
                    settlementDate: tx.settlementDate !== null ? DateTime.fromISO(tx.settlementDate) : null,
                    side: tx.details && tx.details.side,
                    transactionDate: tx.transactionDate !== null ? DateTime.fromISO(tx.transactionDate) : null,
                    transactionType: tx.type,
                    transactionTypeDetail: tx.details && tx.details.transactionType,
                    symbol: tx.details && tx.details.instrument && tx.details.instrument.symbol || null
                })
            }
        }
        await this.repository.addRealizefiAccountTransactions(newTransactions)
    }

    importPositions = async (realizefiUserID: string, institutionID: string | null = null, opts: ImportOpts = {returnUpdates: true}): Promise<TradingPostHolding[] | void> => {
        let realizefiAccounts = await this.repository.getRealizefiAccounts(realizefiUserID);
        if (institutionID) realizefiAccounts = realizefiAccounts.filter(a => a.realizefiInstitutionId === institutionID)
        let newPositions: RealizefiAccountPosition[] = [];
        for (const account of realizefiAccounts) {
            // TODO: Implement Paging
            if (account.id === null) throw new Error("account id is null");

            const positions = await this.realizefi.listPositions(account.realizefiInstitutionId);
            for (const position of positions.data) {
                newPositions.push({
                    id: null,
                    accountId: account.id,
                    averagePrice: parseFloat(position.averagePrice),
                    costBasis: parseFloat(position.costBasis),
                    currentDayProfitLoss: parseFloat(position.currentDayProfitLoss),
                    currentDayProfitLossPercentage: parseFloat(position.currentDayProfitLossPercentage),
                    longQuantity: parseFloat(position.longQuantity),
                    marketValue: parseFloat(position.marketValue),
                    securityCompositeFigi: position.security.compositeFigi,
                    securityContractType: position.security.contractType,
                    securityExpiration: DateTime.fromISO(position.security.expiration),
                    securityId: position.security.id,
                    securityPrimaryExchange: position.security.primaryExchange,
                    securityShareClassFigi: position.security.shareClassFigi,
                    securityStrikePrice: parseFloat(position.security.strikePrice),
                    securitySymbol: position.security.symbol,
                    securityType: position.security.type,
                    shortQuantity: parseFloat(position.shortQuantity),
                    symbol: position.symbol
                })
            }
        }
        await this.repository.addRealizefiAccountPositions(newPositions)
    }

    /**
     * exportAccounts reads from the factual realizefi tables and transposes it to our tradingpost account
     */
    exportAccounts = async (): Promise<TradingPostAccount> => {
        return [];
    }

    /**
     * exportTransactions reads from the factual realizefi transaction table and transposes it to our tradingpost transactions
     */
    exportTransactions = async (): Promise<TradingPostTransaction> => {
        return []
    }

    /**
     * exportHoldings reads from the factual realizefi holdings table and transposes it to our tradingpost holding
     */
    exportHoldings = async (): Promise<TradingPostHolding[]> => {
        return [];
    }
}

/**
 * So mapping / translation layer is contained with RealizefiProvider -- which will be exposed via the import/export
 * We should be able to pass a flag to import which will return any results that are new/performed an update
 */
// Trade => Buy To Cover
// Trade => Short Sale
// DIVIDEND_OR_INTEREST => UNKNOWN
type TransactionTypes = {
    TRADE: 'TRADE',
    OPTION_TRADE: 'OPTION_TRADE',
    CRYPTO_TRADE: 'CRYPTO_TRADE',
    SMA_ADJUSTMENT: 'SMA_ADJUSTMENT',
    ACH_RECEIPT: 'ACH_RECEIPT',
    ACH_DISBURSEMENT: 'ACH_DISBURSEMENT',
    CASH_RECEIPT: 'CASH_RECEIPT',
    CASH_DISBURSEMENT: 'CASH_DISBURSEMENT',
    ELECTRONIC_FUND: 'ELECTRONIC_FUND',
    WIRE_OUT: 'WIRE_OUT',
    WIRE_IN: 'WIRE_IN',
    JOURNAL: 'JOURNAL',
    MEMORANDUM: 'MEMORANDUM',
    MARGIN_CALL: 'MARGIN_CALL',
    MONEY_MARKET: 'MONEY_MARKET',
    DIVIDEND_OR_INTEREST: 'DIVIDEND_OR_INTEREST',
    RECEIVE_AND_DELIVER: 'RECEIVE_AND_DELIVER',
    ASSIGNMENT: 'ASSIGNMENT'
    EXERCISE: 'EXERCISE',
    UNKNOWN: 'UNKNOWN',
    EXPIRATION: 'EXPIRATION'
}

type TransactionSubTypes = {
    BUY_TO_COVER: 'BUY_TO_COVER',
    SHORT_SALE: 'SHORT_SALE',
    UNKNOWN: 'UNKNOWN', // transactionType, instrument, amount

    // THESE ARE ON DIRECTION WHICH IS MILDLY ANNOYING...
    // DEPOSIT: 'DEPOSIT', // transactionType, amount, direction, fees,
    // WITHDRAW: 'WITHDRAW', // transactionType, amount, direction, fees,

    // THESE ARE ON DIRECTION
    // CREDIT: 'CREDIT',// transactionType, direction, amount, quantity, instrument
    // DEBIT: 'DEBIT', // transactionType, direction, amount, quantity, instrument
    // UNKNOWN: 'UNKNOWN' // transactionType, direction, amount, quantity, instrument

    // underyling instrument type:
}