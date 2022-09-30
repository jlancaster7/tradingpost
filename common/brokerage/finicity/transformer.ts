import {
    FinicityAccount,
    FinicityHolding,
    FinicityTransaction,
    InvestmentTransactionType,
    SecurityIssue,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountWithFinicity,
    TradingPostCashSecurity,
    TradingPostCurrentHoldings,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
} from "../interfaces";
import {CustomerAccountsDetail} from '../../finicity/interfaces'
import {DateTime} from "luxon";
import {addSecurity} from "../../market-data/interfaces";
import {abs} from "mathjs";

interface TransformerRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>

    getSecuritiesWithIssue(): Promise<SecurityIssue[]>

    getTradingpostCashSecurity(): Promise<TradingPostCashSecurity[]>

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
        case "other":
            return InvestmentTransactionType.cash
        default:
            throw new Error(`unknown investment transaction type ${finicityTxType}`)
    }
}

const transformSecurityType = (ticker: string): SecurityType => {
    if (ticker === 'USD:CUR') {
        return SecurityType.cashEquivalent;
    } else {
        return SecurityType.equity;
    }

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
                subtype: null,
                error: account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185,
                errorCode: account.aggregationStatusCode
            });
        }

        return tpAccounts;
    }

    getFinicityToTradingPostAccount = async (userId: string, accountId: string) => {
        const finicityAccounts = await this.repository.getTradingPostAccountsWithFinicityNumber(userId)
        let internalAccount: TradingPostBrokerageAccountWithFinicity | null = null;
        for (let i = 0; i < finicityAccounts.length; i++) {
            const finAcc = finicityAccounts[i];
            if (finAcc.externalFinicityAccountId === accountId) internalAccount = finAcc;
        }

        return internalAccount;
    }

    holdings = async (userId: string, accountId: string, finHoldings: FinicityHolding[], holdingDate: DateTime | null, currency: string | null, accountDetails: CustomerAccountsDetail | null): Promise<TradingPostCurrentHoldings[]> => {
        let internalAccount = await this.getFinicityToTradingPostAccount(userId, accountId);
        if (internalAccount === undefined || internalAccount === null) throw new Error(`account id(${accountId}) does not exist for holding`)
        const securities = await this.repository.getSecuritiesWithIssue();
        const cashSecurities = await this.repository.getTradingpostCashSecurity();
        const securitiesMap: Record<string, SecurityIssue> = {};
        const cashSecuritiesMap: Record<string, number> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);
        cashSecurities.forEach(sec => cashSecuritiesMap[sec.fromSymbol] = sec.toSecurityId);
        let tpHoldings: TradingPostCurrentHoldings[] = [];
        let isCashSecurity: boolean = false;
        for (let i = 0; i < finHoldings.length; i++) {
            let holding = finHoldings[i];

            let security = securitiesMap[holding.symbol]
            let cashSecurity = cashSecuritiesMap[holding.symbol];
            if (security === undefined || security === null) {
                if (cashSecurity === undefined || cashSecurity === null) {
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
                } else {
                    isCashSecurity = true;
                    security = {
                        id: cashSecurity,
                        symbol: holding.symbol,
                        name: 'Cash',
                        issueType: 'Cash'
                    }
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
                securityType: (security.issueType === 'Cash' ? SecurityType.cashEquivalent : SecurityType.equity),
                price: holding.currentPrice,
                priceAsOf: priceAsOf,
                priceSource: '',
                value: parseFloat(holding.marketValue),
                costBasis: holding.costBasis,
                quantity: holding.units,
                currency: cur
            })
        }
        // Add a cash security is the broker doesn't display it this way
        if (accountDetails && accountDetails.availableCashBalance && !isCashSecurity) {
            let cashSecurityId = cashSecurities.find(a => a.currency === 'USD')?.toSecurityId;
            tpHoldings.push({
                accountId: internalAccount.id, // TradingPost Brokerage Account ID
                // @ts-ignore
                securityId: cashSecurityId,
                securityType: SecurityType.cashEquivalent,
                price: 1,
                priceAsOf: DateTime.fromSeconds(accountDetails.dateAsOf),
                priceSource: '',
                value: accountDetails.availableCashBalance,
                costBasis: null,
                quantity: accountDetails.availableCashBalance,
                currency: 'USD'
            })
        }

        return tpHoldings;
    }

    transactions = async (userId: string, finTransactions: FinicityTransaction[]): Promise<TradingPostTransactions[]> => {
        const securities = await this.repository.getSecuritiesWithIssue();
        const cashSecurities = await this.repository.getTradingpostCashSecurity();
        const cashSecuritiesMap: Record<string, number> = {};
        const securitiesMap: Record<string, SecurityIssue> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);
        cashSecurities.forEach(sec => cashSecuritiesMap[sec.fromSymbol] = sec.toSecurityId);

        const tpAccountsWithFinicityId = await this.repository.getTradingPostAccountsWithFinicityNumber(userId);
        const finicityIdToTpAccountMap: Record<string, number> = {};
        tpAccountsWithFinicityId.forEach(tpa => finicityIdToTpAccountMap[tpa.externalFinicityAccountId] = tpa.id);

        let tpTransactions: TradingPostTransactions[] = [];
        for (let i = 0; i < finTransactions.length; i++) {
            const transaction = finTransactions[i];

            const internalTpAccountId = finicityIdToTpAccountMap[transaction.accountId];
            if (!internalTpAccountId) throw new Error(`could not get internal account id for transaction with id ${transaction.id} for user ${userId}`);

            if (!transaction.ticker || Object.keys(cashSecuritiesMap).includes(transaction.ticker)) {
                switch (transaction.investmentTransactionType) {
                    case "fee":
                    case "interest":
                    case "deposit":
                    case "transfer":
                    case "other":
                    case "contribution":
                        transaction.ticker = "USD:CUR"
                        break
                    default:
                        throw new Error(`no symbol available for transaction type ${transaction.investmentTransactionType}`)
                }
            }
            let security = securitiesMap[transaction.ticker]
            if (security === undefined || security === null) throw new Error(`could not find symbol(${transaction.ticker} for holding`)

            if (!transaction.unitQuantity) transaction.unitQuantity = transaction.amount;
            // TODO: Can we be sure that they didnt factor in fees, or if they did that we have an attribute that includes fees?
            let price = 1
            if (!transaction.unitPrice) price = transaction.amount / transaction.unitQuantity
            else price = transaction.unitPrice


            let securityType = transformSecurityType(transaction.ticker)
            let transactionType = transformTransactionType(transaction.investmentTransactionType);

            switch (transactionType) {
                case "buy":
                    transaction.amount = abs(transaction.amount);
                    break;
                case "sell":
                    transaction.amount = -1 * abs(transaction.amount);
                    break;
                case "short":
                    transaction.amount = -1 * abs(transaction.amount);
                    break;
                case "cover":
                    transaction.amount = abs(transaction.amount);
                    break;
            }
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