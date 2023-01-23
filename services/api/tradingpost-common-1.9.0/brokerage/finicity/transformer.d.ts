import { FinicityAccount, FinicityHolding, FinicityInstitution, FinicityTransaction, OptionContract, OptionContractTable, SecurityIssue, TradingPostBrokerageAccountWithFinicity, TradingPostCashSecurity, TradingPostCurrentHoldings, TradingPostInstitution, TradingPostInstitutionWithFinicityInstitutionId } from "../interfaces";
import { CustomerAccountsDetail, GetInstitution } from '../../finicity/interfaces';
import { DateTime } from "luxon";
import { addSecurity } from "../../market-data/interfaces";
import BaseTransformer, { BaseRepository } from "../base-transformer";
interface TransformerRepository extends BaseRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>;
    getSecuritiesWithIssue(): Promise<SecurityIssue[]>;
    getTradingpostCashSecurity(): Promise<TradingPostCashSecurity[]>;
    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>;
    addSecurity(sec: addSecurity): Promise<number>;
    addOptionContract(option: OptionContract): Promise<number>;
    getOptionContract(securityId: number, expirationDate: DateTime, strikePrice: number, optionType: string): Promise<OptionContractTable | null>;
    getAccountOptionsContractsByTransactions(accountId: number, securityId: number, strikePrice: number): Promise<OptionContractTable[]>;
    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>;
    upsertInstitution(institution: TradingPostInstitution): Promise<number>;
}
export declare class Transformer extends BaseTransformer {
    private repository;
    constructor(repository: TransformerRepository);
    accounts: (userId: string, finAccounts: FinicityAccount[]) => Promise<void>;
    holdings: (userId: string, accountId: string, finHoldings: FinicityHolding[], holdingDate: DateTime | null, currency: string | null, accountDetails: CustomerAccountsDetail | null) => Promise<void>;
    transactions: (userId: string, finTransactions: FinicityTransaction[]) => Promise<void>;
    historicalHoldings: (tpHoldings: TradingPostCurrentHoldings[]) => Promise<void>;
    getFinicityToTradingPostAccount: (userId: string, accountId: string) => Promise<TradingPostBrokerageAccountWithFinicity | null>;
    _resolveSecurity: (holding: FinicityHolding, securitiesMap: Record<string, SecurityIssue>, cashSecuritiesMap: Record<string, number>) => Promise<SecurityIssue>;
    resolveHoldingOptionId: (accountId: number, securityId: number, strikePrice: number, expirationDate: DateTime, optionType: string) => Promise<number | null>;
    isTransactionAnOption: (transaction: FinicityTransaction, securityId: number) => Promise<number | null>;
    institutions: (institutions: FinicityInstitution[]) => Promise<void>;
    institution: (institution: GetInstitution) => Promise<number>;
}
export {};
