import {
    FinicityAccount, FinicityHolding, FinicityTransaction,
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
            accountId: '',
            securityId: '',
            costBasis: '',
            price: '',
            priceAsOf: '',
            value: '',
            priceSource: '',
            quantity: '',
            securityType: ''
        }
    });
}

export const transformTransactions = (finTransactions: FinicityTransaction[]): TradingPostTransactions[] => {
    return finTransactions.map(fh => {
        return {
            currency: '',
            securityId: '',
            accountId: '',
            date: '',
            price: '',
            type: '',
            amount: '',
            quantity: '',
            fees: '',
            securityType: ''
        }
    });
}

export const computeHoldingsHistory = () => {

}