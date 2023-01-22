import { GetSecurityBySymbol, IbkrAccount, IbkrActivity, IbkrPosition, IbkrSecurity, OptionContract, OptionContractTable, TradingPostBrokerageAccountsTable, TradingPostCurrentHoldingsTableWithMostRecentHolding } from "../interfaces";
import { DateTime } from "luxon";
import { addSecurity } from "../../market-data/interfaces";
import BaseTransformer, { BaseRepository } from "../base-transformer";
export interface TransformerRepository extends BaseRepository {
    getTradingPostBrokerageAccountsByBrokerageAndIds(userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]>;
    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>;
    getSecuritiesBySymbol(symbols: string[]): Promise<GetSecurityBySymbol[]>;
    addSecurities(securities: addSecurity[]): Promise<void>;
    upsertOptionContracts(optionContracts: OptionContract[]): Promise<void>;
    getTradingPostBrokerageWithMostRecentHolding(tpUserId: string, brokerage: string): Promise<TradingPostCurrentHoldingsTableWithMostRecentHolding[]>;
    getOptionContractsByExternalIds(externalIds: string[]): Promise<OptionContractTable[]>;
}
export default class IbkrTransformer extends BaseTransformer {
    private _repository;
    constructor(repository: TransformerRepository);
    accounts: (processDate: DateTime, tpUserId: string, accounts: IbkrAccount[]) => Promise<void>;
    securities: (processDate: DateTime, tpUserId: string, securitiesAndOptions: IbkrSecurity[]) => Promise<void>;
    transactions: (processDate: DateTime, tpUserId: string, transactions: IbkrActivity[]) => Promise<void>;
    holdings: (processDate: DateTime, tpUserId: string, ibkrHoldings: IbkrPosition[]) => Promise<void>;
    _getAccounts: <T extends {
        accountId: string;
    }>(tpUserId: string, ibkrWithAccount: T[]) => Promise<Record<string, TradingPostBrokerageAccountsTable>>;
    _getSecurities: <T extends {
        symbol: string | null;
    }>(ibkrWithSymbols: T[]) => Promise<Record<string, GetSecurityBySymbol>>;
    _getOptions: <T extends {
        symbol: string | null;
        securityDescription: string | null;
    }>(ibkrOptions: T[]) => Promise<Record<string, OptionContractTable>>;
}
