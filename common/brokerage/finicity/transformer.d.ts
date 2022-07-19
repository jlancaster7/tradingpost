import { FinicityAccount, FinicityHolding, FinicityTransaction, TradingPostBrokerageAccounts, TradingPostCurrentHoldings, TradingPostInstitutionWithFinicityInstitutionId, TradingPostTransactions } from "./interfaces";
export declare const transformAccounts: (userId: string, finAccounts: FinicityAccount[], institutionMap: Record<string, TradingPostInstitutionWithFinicityInstitutionId>) => TradingPostBrokerageAccounts[];
export declare const transformHoldings: (userId: string, finHoldings: FinicityHolding[]) => TradingPostCurrentHoldings[];
export declare const transformTransactions: (finTransactions: FinicityTransaction[]) => TradingPostTransactions[];
export declare const computeHoldingsHistory: () => void;
