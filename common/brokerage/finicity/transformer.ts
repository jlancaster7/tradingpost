import {
    FinicityAccount,
    FinicityHolding,
    FinicityTransaction,
    InvestmentTransactionType,
    SecurityIssue,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountWithFinicity,
    TradingPostCurrentHoldings,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
} from "../interfaces";
import {DateTime} from "luxon";
import {addSecurity} from "../../market-data/interfaces";

interface TransformerRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>

    getSecuritiesWithIssue(): Promise<SecurityIssue[]>

    getTradingPostInstitutionsWithFinicityId(): Promise<TradingPostInstitutionWithFinicityInstitutionId[]>

    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>

    addSecurity(sec: addSecurity): Promise<number>
}

// Finicity Types Found Here: https://api-reference.finicity.com/#/rest/models/enumerations/investment-transaction-types
const transformTransactionType = (finicityTxType: string): InvestmentTransactionType => {
    switch (finicityTxType) {
        case "cancel":
            return InvestmentTransactionType.cancel
        case "purchaseToClose":
            return InvestmentTransactionType.buy
        case "purchaseToCover":
            return InvestmentTransactionType.cover
        case "contribution":
            return InvestmentTransactionType.cash
        case "optionExercise":
            return InvestmentTransactionType.buy
        case "optionExpiration":
            return InvestmentTransactionType.cancel
        case "fee":
            return InvestmentTransactionType.fee
        case "soldToClose":
            return InvestmentTransactionType.sell
        case "soldToOpen":
            return InvestmentTransactionType.short
        case "split":
            throw new Error("unknown investment transaction type 'split'")
        case "transfer":
            return InvestmentTransactionType.transfer
        case "returnOfCapital":
            return InvestmentTransactionType.dividendOrInterest
        case "income":
            return InvestmentTransactionType.dividendOrInterest
        case "purchased":
            return InvestmentTransactionType.buy
        case "sold":
            return InvestmentTransactionType.sell
        case "dividendReinvest":
            return InvestmentTransactionType.dividendOrInterest
        case "tax":
            return InvestmentTransactionType.cash
        case "dividend":
            return InvestmentTransactionType.dividendOrInterest
        case "reinvestOfIncome":
            return InvestmentTransactionType.dividendOrInterest
        case "interest":
            return InvestmentTransactionType.dividendOrInterest
        case "deposit":
            return InvestmentTransactionType.cash
        case "otherInfo":
            throw new Error("transaction action could not be translated")
        default:
            throw new Error(`unknown investment transaction type ${finicityTxType}`)
    }
}

const transformSecurityType = (finSecType: string): SecurityType => {
    return SecurityType.equity
}

export default class FinicityTransformer {
    private repository: TransformerRepository;

    constructor(repository: TransformerRepository) {
        this.repository = repository
    }

    accounts = async (userId: string, finAccounts: FinicityAccount[]): Promise<TradingPostBrokerageAccounts[]> => {
        let tpAccounts: TradingPostBrokerageAccounts[] = [];
        for (let i = 0; i < finAccounts.length; i++) {
            const account = finAccounts[i];
            const institution = await this.repository.getTradingPostInstitutionByFinicityId(parseInt(account.institutionId))
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
            if (security === undefined || security === null) {
                const sec: addSecurity = {
                    companyName: holding.securityName,
                    securityName: holding.securityName,
                    issueType: holding.securityType,
                    description: holding.description,
                    symbol: holding.symbol,
                    logoUrl: null,
                    phone: null,
                    country: null,
                    state: null,
                    address2: null,
                    tags: [],
                    employees: null,
                    industry: null,
                    exchange: null,
                    primarySicCode: null,
                    ceo: null,
                    zip: null,
                    address: null,
                    website: null,
                    sector: null
                };

                const securityId = await this.repository.addSecurity(sec)
                security = {
                    id: securityId,
                    symbol: sec.symbol,
                    name: sec.securityName ? sec.securityName : '',
                    issueType: sec.issueType ? sec.issueType : ''
                }
            }

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
        const securities = await this.repository.getSecuritiesWithIssue();
        const securitiesMap: Record<string, SecurityIssue> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);

        const tpAccountsWithFinicityId = await this.repository.getTradingPostAccountsWithFinicityNumber(userId);
        const finicityIdToTpAccountMap: Record<string, number> = {};
        tpAccountsWithFinicityId.forEach(tpa => finicityIdToTpAccountMap[tpa.externalFinicityAccountId] = tpa.id);

        let tpTransactions: TradingPostTransactions[] = [];
        for (let i = 0; i < finTransactions.length; i++) {
            const transaction = finTransactions[i];

            const internalTpAccountId = finicityIdToTpAccountMap[transaction.accountId];
            if (!internalTpAccountId) throw new Error(`could not get internal account id for transaction with id ${transaction.id} for user ${userId}`);

            if (!transaction.ticker) {
                switch (transaction.investmentTransactionType) {
                    case "fee":
                    case "interest":
                    case "deposit":
                    case "transfer":
                    case "contribution":
                        transaction.ticker = "USD:CUR"
                        break
                    default:
                        throw new Error(`no symbol available for transaction type ${transaction.investmentTransactionType}`)
                }
            }
            let security = securitiesMap[transaction.ticker]
            if (security === undefined || security === null) throw new Error(`could not find symbol(${transaction.ticker} for holding`)

            if (!transaction.unitQuantity) transaction.unitQuantity = 1
            // TODO: Can we be sure that they didnt factor in fees, or if they did that we have an attribute that includes fees?
            let price = 0
            if (!transaction.unitPrice) price = transaction.amount / transaction.unitQuantity
            else price = transaction.unitPrice

            let securityType = transformSecurityType(transaction.investmentTransactionType)
            let transactionType = transformTransactionType(transaction.investmentTransactionType);

            tpTransactions.push({
                accountId: internalTpAccountId,
                securityId: security.id,
                securityType: securityType,
                date: DateTime.fromSeconds(transaction.postedDate),
                quantity: transaction.unitQuantity,
                price: price,
                amount: transaction.amount,
                fees: transaction.feeAmount,
                type: transactionType,
                currency: null
            })
        }

        return tpTransactions
    }
}