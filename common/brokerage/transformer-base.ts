import {
    OptionContract,
    TradingPostBrokerageAccounts,
    TradingPostCurrentHoldings,
    TradingPostTransactions
} from "./interfaces";
import {RobinhoodTransaction} from "./robinhood/interfaces";

export interface BaseRepository {
    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<number[]>

    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    deleteTradingPostAccountCurrentHoldings(accountIds: number[]): Promise<void>

    upsertOptionContract(oc: OptionContract): Promise<number | null>

    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>
}

export default class TransformerBase {
    private _baseRepo: BaseRepository;

    constructor(repo: BaseRepository) {
        this._baseRepo = repo;
    }

    upsertAccounts = async (accounts: TradingPostBrokerageAccounts[]) => {
        // Perform Roll-up??
        await this._baseRepo.upsertTradingPostBrokerageAccounts(accounts);
    }

    upsertPositions = async (positions: TradingPostCurrentHoldings[], accountIds: number[]) => {
        await this._baseRepo.deleteTradingPostAccountCurrentHoldings(accountIds);
        const rolledupPositions = await rollupPositions(positions);
        await this._baseRepo.upsertTradingPostCurrentHoldings(rolledupPositions);
    }

    upsertTransactions = async (transactions: TradingPostTransactions[]) => {
        const rolledupTxs = await rollupTransactions(transactions);
        await this._baseRepo.upsertTradingPostTransactions(rolledupTxs)
    }
}

const rollupPositions = async (positions: TradingPostCurrentHoldings[]): Promise<TradingPostCurrentHoldings[]> => {
    return positions;
}

const rollupTransactions = async (transactions: TradingPostTransactions[]): Promise<TradingPostTransactions[]> => {
    return transactions;
}

