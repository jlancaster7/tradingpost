import {
    DirectBrokeragesType,
    FinicityAccount,
    FinicityHolding,
    FinicityInstitution,
    FinicityTransaction,
    InvestmentTransactionType,
    OptionContract,
    OptionContractTable,
    SecurityIssue,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountStatus,
    TradingPostBrokerageAccountWithFinicity,
    TradingPostCurrentHoldings,
    TradingPostHistoricalHoldings,
    TradingPostInstitution,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostSecurityTranslation,
    TradingPostTransactions,
} from "../interfaces";
import {CustomerAccountsDetail, GetInstitution} from '../../finicity/interfaces'
import {DateTime} from "luxon";
import {addSecurity, PriceSourceType} from "../../market-data/interfaces";
import BaseTransformer, {BaseRepository} from "../base-transformer";
import {BrokerageAccountDataError, BrokerageAccountError} from "../errors";
import Holidays from "../../market-data/holidays";

const isNullOrUndefined = (t: any): boolean => {
    if (t === null) return true;
    if (t === undefined) return true;
    return false;
}

export interface TransformerRepository extends BaseRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>

    getSecuritiesWithIssue(): Promise<SecurityIssue[]>

    getTradingPostTranslationTable(tpInstitutionId: number): Promise<TradingPostSecurityTranslation[]>

    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>

    addSecurity(sec: addSecurity): Promise<number>

    addOptionContract(option: OptionContract): Promise<number>

    getOptionContract(securityId: number, expirationDate: DateTime, strikePrice: number, optionType: string): Promise<OptionContractTable | null>

    getAccountOptionsContractsByTransactions(accountId: number, securityId: number, strikePrice: number): Promise<OptionContractTable[]>

    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>

    upsertInstitution(institution: TradingPostInstitution): Promise<number>

    updateErrorStatusOfAccount(tpAccountId: number, error: boolean, errorCode: number): Promise<void>

    addTradingPostAccountGroup(userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number>
}

// Finicity Types Found Here: https://api-reference.finicity.com/#/rest/models/enumerations/investment-transaction-types
const transformTransactionType = (txType: string): InvestmentTransactionType => {
    switch (txType) {
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
            return InvestmentTransactionType.split
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
            throw new Error(`unknown investment transaction type ${txType}`)
    }
}

const transformSecurityType = (secType: string): SecurityType => {
    switch (secType) {
        case "Fixed Income":
            return SecurityType.fixedIncome;
        case "Mutual Fund":
            return SecurityType.mutualFund;
        case "Option":
            return SecurityType.option;
        case "Core":
            return SecurityType.cashEquivalent;
        case "Exchange Traded":
            return SecurityType.index;
        case "Equity":
            return SecurityType.equity;
        case "Currency":
            return SecurityType.currency
        case "EQUITY":
            return SecurityType.equity;
        default:
            console.error(`unknown security type ${secType}`)
            return SecurityType.unknown
    }
}

const transformIexSecurityType = (secType: string): SecurityType => {
    switch (secType) {
        case "ad": // ADR
            return SecurityType.equity
        case "cs": // Common Stock
            return SecurityType.equity;
        case "cef": // Closed End Fund
            return SecurityType.mutualFund
        case "et": // ETF
            return SecurityType.index
        case "oef": // Open Ended Fund
            return SecurityType.mutualFund
        case "ps": // Preferred Stock
            return SecurityType.equity
        case "rt": // Right
            return SecurityType.unknown
        case "struct": // Structured Product
            return SecurityType.unknown
        case "ut": // Unit
            return SecurityType.unknown
        case "wi": // When Issued
            return SecurityType.unknown
        case "wt": // Warrant
            return SecurityType.unknown
        default:
            return SecurityType.unknown
    }
}

export class Transformer extends BaseTransformer {
    private repository: TransformerRepository;
    private marketHolidays: Holidays;

    constructor(repository: TransformerRepository, marketHolidays: Holidays) {
        super(repository);
        this.repository = repository
        this.marketHolidays = marketHolidays;
    }

    getMarketHolidays = (): Holidays => {
        return this.marketHolidays
    }

    accounts = async (userId: string, finAccounts: FinicityAccount[]): Promise<number[]> => {
        let tpAccounts: TradingPostBrokerageAccounts[] = [];
        for (let i = 0; i < finAccounts.length; i++) {
            const account = finAccounts[i];
            const institution = await this.repository.getTradingPostInstitutionByFinicityId(parseInt(account.institutionId))
            if (!institution) throw new BrokerageAccountDataError(userId, account.customerId, undefined, account.id.toString(), `no institution found for external finicity institution id: ${account.institutionId}`);

            let hasError = account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185;
            tpAccounts.push({
                userId: userId,
                institutionId: institution.id,
                brokerName: institution.name,
                status: '',
                accountNumber: account.accountId,
                mask: account.accountNumberDisplay,
                name: account.name,
                officialName: account.name ? account.name : account.number,
                type: account.type,
                subtype: null,
                error: hasError,
                errorCode: account.aggregationStatusCode,
                hiddenForDeletion: false,
                accountStatus: hasError ? TradingPostBrokerageAccountStatus.ERROR : TradingPostBrokerageAccountStatus.PROCESSING,
                authenticationService: DirectBrokeragesType.Finicity
            });
        }

        const newAccountIds = await this.upsertAccounts(tpAccounts);
        await this.repository.addTradingPostAccountGroup(userId, 'default', newAccountIds, 10117);

        return newAccountIds;
    }

    _getSecuritiesMap = async () => {
        const securities = await this.repository.getSecuritiesWithIssue();
        const securitiesMap: Map<string, SecurityIssue> = new Map();
        securities.forEach(sec => securitiesMap.set(sec.symbol, sec));
        return securitiesMap;
    }

    _getSecuritiesTranslationMap = async (tpInstitutionId: number) => {
        const securitiesTranslation = await this.repository.getTradingPostTranslationTable(tpInstitutionId);
        const securitiesTranslationMap: Map<string, TradingPostSecurityTranslation> = new Map();
        securitiesTranslation.forEach(sec => securitiesTranslationMap.set(sec.fromSymbol, sec));
        return securitiesTranslationMap
    }

    holdings = async (userId: string, customerId: string, finicityExternalAccountId: string, finHoldings: FinicityHolding[], currency: string | null, accountDetails: CustomerAccountsDetail | null, aggregationSuccessDate: DateTime): Promise<void> => {
        let internalAccount = await this.getFinicityToTradingPostAccount(userId, finicityExternalAccountId);
        if (internalAccount === undefined || internalAccount === null) throw new BrokerageAccountError(userId, customerId, undefined, finicityExternalAccountId, "could not find finicity account in tradingpost brokerage accounts");

        const securitiesMap = await this._getSecuritiesMap();
        const securitiesTranslationMap = await this._getSecuritiesTranslationMap(internalAccount.tpInstitutionId);
        const cashSecurity = await this.repository.getCashSecurityId();

        let holdingDate = aggregationSuccessDate.setZone("America/New_York").set({
            hour: 16,
            minute: 0,
            second: 0,
            millisecond: 0
        });

        while (!await this.marketHolidays.isTradingDay(holdingDate)) holdingDate = holdingDate.minus({day: 1})

        let tpHoldings: TradingPostCurrentHoldings[] = [];
        for (let i = 0; i < finHoldings.length; i++) {
            let holding = finHoldings[i];
            let symbol = holding.symbol;
            if (!symbol) throw new BrokerageAccountDataError(userId, customerId, undefined, finicityExternalAccountId, `no symbol set for holding ${holding.id}`)

            // @ts-ignore
            if (securitiesTranslationMap.has(symbol)) symbol = securitiesTranslationMap.get(symbol).toSymbol

            const security = securitiesMap.get(symbol);
            if (!security) throw new BrokerageAccountDataError(userId, customerId, undefined, finicityExternalAccountId, `no security available for symbol ${symbol}`);

            let securityType = transformSecurityType(holding.securityType);
            if (securityType === SecurityType.unknown) {
                securityType = transformIexSecurityType(security.issueType);
            }

            let tpHolding: TradingPostCurrentHoldings = {
                accountId: internalAccount.tpBrokerageAccountId,
                securityId: security.id,
                securityType: securityType,
                holdingDate: holdingDate,
                costBasis: holding.costBasis,
                quantity: holding.units,
                currency: holding.securityCurrency ? holding.securityCurrency : currency,
                optionId: null,
                price: holding.currentPrice,
                priceAsOf: holdingDate,
                value: parseFloat(holding.marketValue),
                priceSource: PriceSourceType.FINICITY,
            }

            if (holding.securityType.toLowerCase() === 'option') {
                const optionExpireDateTime = DateTime.fromSeconds(holding.optionExpiredate);
                const optionId = await this.resolveHoldingOptionId(internalAccount.tpBrokerageAccountId, security.id,
                    holding.optionStrikePrice, optionExpireDateTime, holding.optionType);
                if (!optionId) throw new BrokerageAccountDataError(userId, customerId, undefined, finicityExternalAccountId, `could not resolve option id for security=${security.symbol} strikePrice=${holding.optionStrikePrice} expirationDate=${holding.optionExpiredate}`)

                tpHolding.securityType = SecurityType.option;
                tpHolding.optionId = optionId;
            }

            tpHoldings.push(tpHolding)
        }

        if (accountDetails && accountDetails.availableCashBalance && !tpHoldings.find(h => h.securityId === cashSecurity.id)) {
            tpHoldings.push({
                accountId: internalAccount.tpBrokerageAccountId,
                securityId: cashSecurity.id,
                securityType: SecurityType.cashEquivalent,
                price: 1,
                priceAsOf: holdingDate,
                priceSource: PriceSourceType.FINICITY,
                value: accountDetails.availableCashBalance,
                costBasis: null,
                quantity: accountDetails.availableCashBalance,
                currency: 'USD',
                optionId: null,
                holdingDate: holdingDate
            });
        }

        await this.upsertPositions(tpHoldings, [internalAccount.tpBrokerageAccountId])
        await this.historicalHoldings(tpHoldings)
    }

    _isCashInvestmentType = (it: InvestmentTransactionType): boolean => {
        switch (it) {
            case InvestmentTransactionType.cash:
                return true
            case InvestmentTransactionType.dividendOrInterest:
                return true
            case InvestmentTransactionType.transfer:
                return true
            case InvestmentTransactionType.fee:
                return true
            default:
                return false
        }
    }

    transactions = async (userId: string, customerId: string, finTransactions: FinicityTransaction[], finicityExternalAccountId: string): Promise<void> => {
        let internalAccount = await this.getFinicityToTradingPostAccount(userId, finicityExternalAccountId);
        if (!internalAccount) throw new BrokerageAccountError(userId, customerId, undefined, finicityExternalAccountId, "could not find finicity account in in tradingpost brokerage accounts");

        const securitiesMap = await this._getSecuritiesMap();
        const securitiesTranslationMap = await this._getSecuritiesTranslationMap(internalAccount.tpInstitutionId);

        let tpTransactions: TradingPostTransactions[] = [];
        for (let i = 0; i < finTransactions.length; i++) {
            const finTransaction = finTransactions[i];

            const transactionType = transformTransactionType(finTransaction.investmentTransactionType);
            const isCashTransaction = this._isCashInvestmentType(transactionType);
            if (isCashTransaction) finTransaction.ticker = "USD:CUR"

            if (!finTransaction.ticker) throw new BrokerageAccountDataError(userId, customerId, undefined, finicityExternalAccountId, `no ticker attribute available for transaction id: ${finTransaction.transactionId}`);
            if (isNullOrUndefined(finTransaction.unitQuantity) && !isCashTransaction) throw new BrokerageAccountDataError(userId, customerId, undefined, finicityExternalAccountId, `no unit quantity attribute for non-cash security symbol: ${finTransaction.ticker} transaction id: ${finTransaction.id}`)
            else if (isCashTransaction && isNullOrUndefined(finTransaction.unitQuantity)) finTransaction.unitQuantity = finTransaction.amount;

            // @ts-ignore
            if (securitiesTranslationMap.has(finTransaction.ticker)) finTransaction.ticker = securitiesTranslationMap.get(finTransaction.ticker).toSymbol

            let security = securitiesMap.get(finTransaction.ticker);
            if (!security) throw new BrokerageAccountDataError(userId, customerId, undefined, finicityExternalAccountId, `could not find trading post security for transaction ${finTransaction.ticker}`);

            let securityType = isCashTransaction ? SecurityType.cashEquivalent : transformIexSecurityType(security.issueType);

            const optionId = await this.isTransactionAnOption(finTransaction, security.id);
            if (optionId) securityType = SecurityType.option

            let quantity = (finTransaction.unitQuantity as number);
            let amount = (finTransaction.amount as number);

            if (transactionType === InvestmentTransactionType.short) {
                quantity > 0 ? quantity = quantity * -1 : null
                amount > 0 ? amount = amount * -1 : null
            }

            if (transactionType === InvestmentTransactionType.sell) {
                quantity > 0 ? quantity = quantity * -1 : null
                amount > 0 ? amount = amount * -1 : null
            }

            if (transactionType === InvestmentTransactionType.buy) {
                quantity < 0 ? quantity = quantity * -1 : null
                amount < 0 ? amount = amount * -1 : null
            }

            if (transactionType === InvestmentTransactionType.cover) {
                quantity < 0 ? quantity = quantity * -1 : null
                amount < 0 ? amount = amount * -1 : null
            }

            let price = finTransaction.unitPrice
            if (!price) {
                if (isCashTransaction) price = 1
                else if (isNullOrUndefined(finTransaction.unitQuantity) || finTransaction.unitQuantity === 0) {
                    price = finTransaction.amount
                    finTransaction.unitQuantity = 1
                } else price = finTransaction.amount / (finTransaction.unitQuantity as number)
            }

            let newTpTx: TradingPostTransactions = {
                optionId: optionId,
                accountId: internalAccount.tpBrokerageAccountId,
                securityId: security.id,
                securityType: securityType,
                date: DateTime.fromSeconds(finTransaction.transactionDate).setZone("America/New_York").set({
                    hour: 16,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                }),
                quantity: quantity,
                price: price,
                amount: amount,
                fees: finTransaction.feeAmount,
                type: transactionType,
                currency: 'USD',
            };

            tpTransactions.push(newTpTx)
        }
        await this.upsertTransactions(tpTransactions)
    }

    historicalHoldings = async (tpHoldings: TradingPostCurrentHoldings[]): Promise<void> => {
        const hh = tpHoldings.map(h => {
            let x: TradingPostHistoricalHoldings = {
                costBasis: h.costBasis,
                quantity: h.quantity,
                date: h.holdingDate,
                value: h.value,
                optionId: h.optionId,
                currency: h.currency,
                priceSource: h.priceSource,
                priceAsOf: h.priceAsOf,
                securityType: h.securityType,
                securityId: h.securityId,
                price: h.price,
                accountId: h.accountId,
            }
            return x
        }).filter(h => {
            if (h.securityType === SecurityType.mutualFund) return false
            if (h.securityType === SecurityType.currency) return false
            return true
        });

        await this.upsertHistoricalHoldings(hh);
    }

    transitionTradingPostAccountToError = async (userId: string, finicityExternalAccountId: string, errorCode: number) => {
        const tpAccount = await this.getFinicityToTradingPostAccount(userId, finicityExternalAccountId);
        if (!tpAccount) throw new Error(`could not find a tradingpost account for finicity external account id: ${finicityExternalAccountId}`);
        await this.repository.updateErrorStatusOfAccount(tpAccount.tpBrokerageAccountId, true, errorCode);
    }

    getFinicityToTradingPostAccount = async (userId: string, accountId: string) => {
        const finicityAccounts = await this.repository.getTradingPostAccountsWithFinicityNumber(userId)
        return finicityAccounts.find(fa => fa.externalFinicityAccountId === accountId);
    }

    resolveHoldingOptionId = async (accountId: number, securityId: number, strikePrice: number, expirationDate: DateTime,
                                    optionType: string
    ): Promise<number | null> => {
        const option = await this.repository.getOptionContract(securityId, expirationDate, strikePrice, optionType)
        if (!option) {
            return await this.repository.addOptionContract({
                strikePrice: strikePrice,
                securityId: securityId,
                type: optionType,
                expiration: expirationDate,
                externalId: null
            });
        }
        return option.id;
    }

    isTransactionAnOption = async (transaction: FinicityTransaction, securityId: number): Promise<number | null> => {
        // Parse out the expiration date, strike price and option type(put/call)
        // Check our DB to see if it exists, if it does, then push into structure
        // Thinking for each institution we are going ot have to create our own parser for options and validate the memo
        // and description like finicity does, but rather than defaulting to finicity, we just use our own representation...

        if (!transaction.description.toLowerCase().includes("call") && !transaction.description.toLowerCase().includes("put")) {
            return null;
        }

        // Lazy man's way of pulling out terms / dates / etc... rather than writing regular expression
        // Example: Sold 1 OPEN Oct 28 2022 3.0 Call @ 0.43 Sold=Action, 1=Qty, OPEN=symbol, Oct=Month, 28=Day,
        // 2022=Year 3.0=StrikePrice, Call = type of option, @=_(Not needed) 0.43 = price
        const [action, qty, symbol, month, day, year, strikePriceStr, optionType, _, price] = transaction.description.split(" ");

        const dtStr = `${month} ${day}, ${year}` // Oct 6, 2014
        const expirationDate = DateTime.fromFormat(dtStr, "DD");
        if (!expirationDate.isValid) {
            console.warn(`could not parse expiration date=${dtStr}`)
        }

        const strikePrice = parseFloat(strikePriceStr);

        const option = await this.repository.getOptionContract(securityId, expirationDate, strikePrice, optionType)
        if (!option) {
            return await this.repository.addOptionContract({
                strikePrice: strikePrice,
                securityId: securityId,
                type: optionType,
                expiration: expirationDate,
                externalId: null
            });
        }

        return option.id
    }

    institutions = async (institutions: FinicityInstitution[]): Promise<void> => {
        const tformInstitutions = institutions.map(ins => {
            let x: TradingPostInstitution = {
                externalId: `fin_${ins.id}`,
                name: ins.name,
                accountTypeDescription: ins.accountTypeDescription,
                phone: ins.phone,
                urlHomeApp: ins.urlHomeApp,
                urlLogonApp: ins.urlLogonApp,
                oauthEnabled: ins.oauthEnabled,
                urlForgotPassword: ins.urlForgotPassword,
                urlOnlineRegistration: ins.urlOnlineRegistration,
                class: ins.class,
                status: ins.status,
                addressAddressLine1: ins.addressLine1,
                addressAddressLine2: ins.addressLine2,
                addressCity: ins.addressCity,
                addressState: ins.addressState,
                addressCountry: ins.addressCountry,
                addressPostalCode: ins.addressPostalCode,
                email: ins.email
            }
            return x;
        })
        await this.repository.upsertInstitutions(tformInstitutions)
    }

    institution = async (institution: GetInstitution): Promise<number> => {
        const {institution: ins} = institution;
        const tpInId = await this.repository.upsertInstitution({
            externalId: `fin_${ins.id}`,
            name: ins.name,
            accountTypeDescription: ins.accountTypeDescription,
            phone: ins.phone,
            urlHomeApp: ins.urlHomeApp,
            urlLogonApp: ins.urlLogonApp,
            oauthEnabled: ins.oauthEnabled,
            urlForgotPassword: ins.urlForgotPassword,
            urlOnlineRegistration: ins.urlOnlineRegistration,
            class: ins.class,
            status: ins.status,
            addressAddressLine1: ins.address?.addressLine1,
            addressAddressLine2: ins.address?.addressLine2,
            addressCity: ins.address?.city,
            addressState: ins.address?.state,
            addressCountry: ins.address?.country,
            addressPostalCode: ins.address?.postalCode,
            email: ins.email
        });
        return tpInId
    }
}