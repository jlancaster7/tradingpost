import {
    FinicityAccount,
    FinicityHolding,
    FinicityTransaction,
    InvestmentTransactionType, SecurityIssue,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountWithFinicity,
    TradingPostCurrentHoldings,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
} from "../interfaces";
import {DateTime} from "luxon";

interface TransformerRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>

    getSecuritiesWithIssue(): Promise<SecurityIssue[]>

    getFinicityInstitutions(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>
}

export class FinicityTransformer {
    private repository: TransformerRepository;

    constructor(repository: TransformerRepository) {
        this.repository = repository
    }

    accounts = async (userId: string, finAccounts: FinicityAccount[]): Promise<TradingPostBrokerageAccounts[]> => {
        const finicityAccounts = await this.repository.getTradingPostAccountsWithFinicityNumber(userId);
        const finAccountMap: Record<string, TradingPostBrokerageAccountWithFinicity> = {};
        finicityAccounts.forEach((fam: TradingPostBrokerageAccountWithFinicity) => finAccountMap[fam.externalFinicityAccountId] = fam)

        const institutions = await this.repository.getFinicityInstitutions();
        let institutionMap: Record<string, TradingPostInstitutionWithFinicityInstitutionId> = {};
        institutions.forEach(inst => institutionMap[inst.externalFinicityId] = inst)

        let tpAccounts: TradingPostBrokerageAccounts[] = [];
        for (let i = 0; i < finAccounts.length; i++) {
            const account = finAccounts[i];

            let institution = institutionMap[account.institutionId];
            if (institution === undefined || institution === null) throw new Error(`no institution found for external finicity institution id: ${account.institutionId}`);

            tpAccounts.push({
                userId: userId,
                institutionId: institution.id,
                brokerName: institution.name,
                status: account.status,
                accountNumber: account.number,
                mask: account.accountNumberDisplay,
                name: account.name,
                officialName: account.number,
                type: account.type,
                subtype: null
            });
        }

        return tpAccounts;
    }

    holdings = async (userId: string, accountId: string, finHoldings: FinicityHolding[], holdingDate: DateTime | null, currency: string | null): Promise<TradingPostCurrentHoldings[]> => {
        const finicityAccounts = await this.repository.getTradingPostAccountsWithFinicityNumber(userId)
        let internalAccount: TradingPostBrokerageAccountWithFinicity | null = null;
        for (let i = 0; i < finicityAccounts.length; i++) {
            const finAcc = finicityAccounts[i];
            if (finAcc.externalFinicityAccountId === accountId) internalAccount = finAcc;
        }

        if (internalAccount === undefined || internalAccount === null) throw new Error(`account id(${accountId}) does not exist for holding`)

        const securities = await this.repository.getSecuritiesWithIssue();
        const securitiesMap: Record<string, SecurityIssue> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);

        let tpHoldings: TradingPostCurrentHoldings[] = [];
        for (let i = 0; i < finHoldings.length; i++) {
            let holding = finHoldings[i];

            let security = securitiesMap[holding.symbol]
            if (security === undefined || security === null) throw new Error(`could not find symbol(${holding.symbol} for holding`)

            let priceAsOf = holdingDate;
            if (holding.currentPriceDate) priceAsOf = DateTime.fromSeconds(holding.currentPriceDate)
            if (priceAsOf === undefined || priceAsOf === null) throw new Error(`no price date set for holding ${holding.id}`)

            let cur = currency
            if (holding.securityCurrency) cur = holding.securityCurrency

            tpHoldings.push({
                accountId: internalAccount.id, // TradingPost Brokerage Account ID
                securityId: security.id,
                securityType: null,
                price: holding.currentPrice,
                priceAsOf: priceAsOf,
                priceSource: '',
                value: parseFloat(holding.marketValue),
                costBasis: holding.costBasis,
                quantity: holding.units,
                currency: cur
            })
        }

        return tpHoldings;
    }

    transactions = async (userId: string, finTransactions: FinicityTransaction[]): Promise<TradingPostTransactions[]> => {
        const finicityAccounts = await this.repository.getTradingPostAccountsWithFinicityNumber(userId)
        const finAccountMap: Record<string, TradingPostBrokerageAccountWithFinicity> = {};
        finicityAccounts.forEach((fam: TradingPostBrokerageAccountWithFinicity) => finAccountMap[fam.externalFinicityAccountId] = fam)

        const securities = await this.repository.getSecuritiesWithIssue();
        const securitiesMap: Record<string, SecurityIssue> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);

        let tpTransactions: TradingPostTransactions[] = [];
        for (let i = 0; i < finTransactions.length; i++) {
            const transaction = finTransactions[i];

            let internalAccount = finAccountMap[transaction.accountId]
            if (internalAccount === undefined || internalAccount === null) throw new Error(`account id(${transaction.accountId}) does not exist for holding`)

            let security = securitiesMap[transaction.ticker]
            if (security === undefined || security === null) throw new Error(`could not find symbol(${transaction.ticker} for holding`)

            let transactionType: InvestmentTransactionType = transformInvestmentTransactionType(transaction);
            let securityType: SecurityType = transformSecurityType(security.issueType);
            let price: number = transaction.unitPrice;
            let amount: number | null = transformTransactionAmount(transaction.amount, transactionType);
            let fees: number | null = transformFees(transaction.feeAmount);

            let txType: string | null = null;
            if (transaction.type) txType = transaction.type
            if (transaction.buyType) txType = transaction.buyType

            tpTransactions.push({
                accountId: internalAccount.id,
                securityId: security.id,
                securityType: securityType,
                date: DateTime.fromSeconds(transaction.postedDate),
                quantity: transaction.unitQuantity,
                price: price,
                amount: amount,
                fees: fees,
                type: transactionType,
                currency: transaction.currencySymbol
            })
        }
        return tpTransactions
    }
}

const transformTransactionAmount = (amount: number, type: InvestmentTransactionType): number => {
    if (type === InvestmentTransactionType.buy) return amount > 0 ? amount : amount * -1
    if (type === InvestmentTransactionType.cover) return amount > 0 ? amount : amount * -1

    if (type === InvestmentTransactionType.sell) return amount < 0 ? amount : amount * -1
    if (type === InvestmentTransactionType.short) return amount < 0 ? amount : amount * -1

    if (type === InvestmentTransactionType.cancel) return amount < 0 ? amount : amount * -1

    if (type === InvestmentTransactionType.fee) return amount > 0 ? amount : amount * -1

    if (type === InvestmentTransactionType.cash) return amount < 0 ? amount : amount * -1

    if (type === InvestmentTransactionType.dividendOrInterest) return amount < 0 ? amount : amount * -1

    throw new Error(`investment transaction type :::: ${type} :::: has not be declared yet`);
}

const transformFees = (fee: number): number => {
    if (fee > 0) return fee;
    return (fee * -1)
}

// TODO: Custom logic for Finicity here...
const transformInvestmentTransactionType = (tx: FinicityTransaction): InvestmentTransactionType => {
    return InvestmentTransactionType.buy
}

// TODO: Custom Logic for Finicity here...
const transformSecurityType = (type: string): SecurityType => {
    return SecurityType.equity
}