import { DateTime } from "luxon";
import {
    FinicityAccount, FinicityHolding, FinicityTransaction,
    InvestmentTransactionType,
    SecurityType,
    TradingPostBrokerageAccounts, TradingPostCurrentHoldings,
    TradingPostInstitutionWithFinicityInstitutionId, TradingPostTransactions
} from "./interfaces";

const transformerMap = {
    "": ""
};

export const transformAccounts = (userId: string, finAccounts: FinicityAccount[], institutionMap: Record<string, TradingPostInstitutionWithFinicityInstitutionId>): TradingPostBrokerageAccounts[] => {
    return finAccounts.map((fa: FinicityAccount) => {
        let institution = institutionMap[fa.institutionId]
        let o: TradingPostBrokerageAccounts = {
            userId: userId,
            accountNumber: fa.number,
            status: fa.status,
            name: fa.accountNickname,
            officialName: fa.name,
            mask: fa.accountNumberDisplay,
            type: fa.type,
            subtype: fa.marketSegment,
            brokerName: institution.name,
            institutionId: institution.id,
        }
        return o;
    })
}

export const transformHoldings = (finHoldings: FinicityHolding[]): TradingPostCurrentHoldings[] => {
    return finHoldings.map(fh => {
        return {
            currency: '',
            accountId: 0,
            securityId: 0,
            costBasis: null,
            price: 0,
            priceAsOf: DateTime.now(),
            value: 0,
            priceSource: '',
            quantity: 0,
            securityType: null
        }
    });
}

export const transformTransactions = (finTransactions: FinicityTransaction[]): TradingPostTransactions[] => {
    return finTransactions.map(fh => {
        return {
            currency: '',
            securityId: 0,
            accountId: 0,
            date: DateTime.now(),
            price: 0,
            type: InvestmentTransactionType.buy,
            amount: 0,
            quantity: 0,
            fees: 0,
            securityType: SecurityType.unknown
        }
    });
}

export const computeHoldingsHistory = () => {

}