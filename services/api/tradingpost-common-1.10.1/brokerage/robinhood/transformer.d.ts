import { OptionContractTableWithRobinhoodId, RobinhoodAccount, RobinhoodInstrumentTable, RobinhoodOptionTable, RobinhoodPosition, RobinhoodTransaction, RobinhoodUserTable } from "./interfaces";
import { GetSecurityBySymbol, SecurityTableWithLatestPriceRobinhoodId, TradingPostBrokerageAccountsTable, TradingPostCurrentHoldings } from "../interfaces";
import TransformerBase, { BaseRepository } from "../base-transformer";
export interface Repository extends BaseRepository {
    getRobinhoodInstrumentBySymbol(symbol: string): Promise<RobinhoodInstrumentTable | null>;
    getCashSecurityId(): Promise<GetSecurityBySymbol>;
    getSecurityWithLatestPricingWithRobinhoodIds(rhIds: number[]): Promise<SecurityTableWithLatestPriceRobinhoodId[]>;
    getTradingPostOptionsWithRobinhoodOptionIds(rhOptionIds: number[]): Promise<OptionContractTableWithRobinhoodId[]>;
    getRobinhoodOption(internalOptionId: number): Promise<RobinhoodOptionTable | null>;
    getSecuritiesBySymbol(symbols: string[]): Promise<GetSecurityBySymbol[]>;
    getTradingPostBrokerageAccountsByBrokerageAndIds(userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]>;
}
export default class Transformer extends TransformerBase {
    private _repo;
    constructor(repo: Repository);
    _getSecurities: (rhInternalSecurityIds: number[]) => Promise<Record<number, SecurityTableWithLatestPriceRobinhoodId>>;
    _getOptions: (rhOptionIds: number[]) => Promise<Record<number, number>>;
    _getAccounts: (userId: string, accountNumbers: string[]) => Promise<Record<number, TradingPostBrokerageAccountsTable>>;
    accounts: (userId: string, institutionId: number, user: RobinhoodUserTable, accounts: RobinhoodAccount[]) => Promise<number[]>;
    positions: (userId: string, positions: RobinhoodPosition[]) => Promise<void>;
    transactions: (userId: string, transactions: RobinhoodTransaction[]) => Promise<void>;
    holdingsHistory: (userId: string, positions: TradingPostCurrentHoldings[]) => Promise<void>;
}
