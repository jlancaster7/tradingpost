import { FinicityAccount, FinicityHolding, FinicityTransaction, SecurityIssue, TradingPostBrokerageAccounts, TradingPostBrokerageAccountWithFinicity, TradingPostCurrentHoldings, TradingPostInstitutionWithFinicityInstitutionId, TradingPostTransactions } from "../interfaces";
import { DateTime } from "luxon";
interface TransformerRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>;
    getSecuritiesWithIssue(): Promise<SecurityIssue[]>;
    getTradingPostInstitutionsWithFinicityId(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>;
    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>;
}
export default class FinicityTransformer {
    private repository;
    constructor(repository: TransformerRepository);
    accounts: (userId: string, finAccounts: FinicityAccount[]) => Promise<TradingPostBrokerageAccounts[]>;
    holdings: (userId: string, accountId: string, finHoldings: FinicityHolding[], holdingDate: DateTime | null, currency: string | null) => Promise<TradingPostCurrentHoldings[]>;
    transactions: (userId: string, finTransactions: FinicityTransaction[]) => Promise<TradingPostTransactions[]>;
}
export {};
