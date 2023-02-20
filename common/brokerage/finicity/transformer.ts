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
    TradingPostCashSecurity,
    TradingPostCurrentHoldings,
    TradingPostHistoricalHoldings,
    TradingPostInstitution,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
} from "../interfaces";
import {CustomerAccountsDetail, GetInstitution} from '../../finicity/interfaces'
import {DateTime} from "luxon";
import {addSecurity, PriceSourceType} from "../../market-data/interfaces";
import BaseTransformer, {BaseRepository, transformTransactionTypeAmount} from "../base-transformer";

export interface TransformerRepository extends BaseRepository {
    getTradingPostAccountsWithFinicityNumber(userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]>

    getSecuritiesWithIssue(): Promise<SecurityIssue[]>

    getTradingpostCashSecurity(): Promise<TradingPostCashSecurity[]>

    getTradingPostInstitutionByFinicityId(finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null>

    addSecurity(sec: addSecurity): Promise<number>

    addOptionContract(option: OptionContract): Promise<number>

    getOptionContract(securityId: number, expirationDate: DateTime, strikePrice: number, optionType: string): Promise<OptionContractTable | null>

    getAccountOptionsContractsByTransactions(accountId: number, securityId: number, strikePrice: number): Promise<OptionContractTable[]>

    upsertInstitutions(institutions: TradingPostInstitution[]): Promise<void>

    upsertInstitution(institution: TradingPostInstitution): Promise<number>
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
            throw new Error(`unknown investment transaction type ${txType}`)
    }
}

export class Transformer extends BaseTransformer {
    private repository: TransformerRepository;

    constructor(repository: TransformerRepository) {
        super(repository);
        this.repository = repository
    }

    accounts = async (userId: string, finAccounts: FinicityAccount[]): Promise<number[]> => {
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
                accountNumber: account.accountId,
                mask: account.accountNumberDisplay,
                name: account.name,
                officialName: account.number,
                type: account.type,
                subtype: null,
                error: account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185,
                errorCode: account.aggregationStatusCode,
                hiddenForDeletion: false,
                accountStatus: TradingPostBrokerageAccountStatus.PROCESSING,
                authenticationService: DirectBrokeragesType.Finicity
            });
        }

        return await this.upsertAccounts(tpAccounts);
    }

    holdings = async (userId: string, accountId: string, finHoldings: FinicityHolding[], currency: string | null, accountDetails: CustomerAccountsDetail | null): Promise<void> => {
        let internalAccount = await this.getFinicityToTradingPostAccount(userId, accountId);
        if (internalAccount === undefined || internalAccount === null) throw new Error(`account id(${accountId}) does not exist for holding`)

        const securities = await this.repository.getSecuritiesWithIssue();
        const cashSecurities = await this.repository.getTradingpostCashSecurity();

        const securitiesMap: Record<string, SecurityIssue> = {};
        const cashSecuritiesMap: Record<string, number> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);
        cashSecurities.forEach(sec => cashSecuritiesMap[sec.fromSymbol] = sec.toSecurityId);

        let tpHoldings: TradingPostCurrentHoldings[] = [];
        let hasCashSecurity = false;
        const holdingDate = DateTime.now().setZone("America/New_York").set({
            hour: 16,
            minute: 0,
            second: 0,
            millisecond: 0
        }).minus({day: 1});

        // TODO: revisit this ... do we want to completely botch the holdings / etc when a holding fails?
        //  at the end of the day, how do we want to present the state of holdings itself to users? In an incomplete,
        //  but correct form, -- meaning not all their holdings are added, but the ones that are, are valid. Or,
        //  not at all until all holdings can be verified, or all holdings even if they are incorrect(assuming its
        //  not the latter).
        for (let i = 0; i < finHoldings.length; i++) {
            try {
                let holding = finHoldings[i];

                const security = await this._resolveSecurity(holding, securitiesMap, cashSecuritiesMap);
                if (security.issueType.toLowerCase() === 'cash') hasCashSecurity = true;

                // TODO: ... Do we want to keep this... Finicity seems to be all over he map with pricing and
                //  we might not be able to rely on them...?
                let priceAsOf = holdingDate;
                if (holding.currentPriceDate) priceAsOf = DateTime.fromSeconds(holding.currentPriceDate)
                if (priceAsOf === undefined || priceAsOf === null) {
                    console.error(`no price date set for holding=${holding.id}`)
                    continue
                }

                let cur = currency
                if (holding.securityCurrency) cur = holding.securityCurrency

                if (holding.securityType.toLowerCase() === 'option') {
                    // We are making the assumption that the option already exists within our system since we run
                    // transactions first and an option will be created there...(since they have more meta-data
                    // then we do)
                    const optionExpireDateTime = DateTime.fromSeconds(holding.optionExpiredate);
                    const optionId = await this.resolveHoldingOptionId(internalAccount.tpBrokerageAccId, security.id,
                        holding.optionStrikePrice, optionExpireDateTime, holding.optionType);
                    if (!optionId) {
                        console.error(`could not resolve option id for security=${security.symbol} strikePrice=${holding.optionStrikePrice} expirationDate=${holding.optionExpiredate}`)
                        continue
                    }

                    tpHoldings.push({
                        accountId: internalAccount.tpBrokerageAccId, // TradingPost Brokerage Account ID
                        securityId: security.id,
                        securityType: SecurityType.option,
                        price: holding.currentPrice,
                        priceAsOf: priceAsOf,
                        priceSource: '',
                        value: parseFloat(holding.marketValue),
                        costBasis: holding.costBasis,
                        quantity: holding.units,
                        currency: cur,
                        optionId: optionId,
                        holdingDate: holdingDate
                    })
                    continue
                }

                tpHoldings.push({
                    accountId: internalAccount.tpBrokerageAccId, // TradingPost Brokerage Account ID
                    securityId: security.id,
                    securityType: security.issueType === 'Cash' ? SecurityType.cashEquivalent : SecurityType.equity,
                    price: holding.currentPrice,
                    priceAsOf: priceAsOf,
                    priceSource: 'Finicity',
                    value: parseFloat(holding.marketValue),
                    costBasis: holding.costBasis,
                    quantity: holding.units,
                    currency: cur,
                    optionId: null,
                    holdingDate: holdingDate
                })
            } catch (err) {
                console.error(err)
            }
        }

        // Add a cash security is the broker doesn't display it this way
        if (accountDetails && accountDetails.availableCashBalance && !hasCashSecurity) {
            let cashSecurityId = cashSecurities.find(a => a.currency === 'USD')?.toSecurityId;
            if (!cashSecurityId) throw new Error("could not find cash security")
            tpHoldings.push({
                accountId: internalAccount.tpBrokerageAccId, // TradingPost Brokerage Account ID
                securityId: cashSecurityId,
                securityType: SecurityType.cashEquivalent,
                price: 1,
                priceAsOf: DateTime.fromSeconds(accountDetails.dateAsOf),
                priceSource: "Finicity",
                value: accountDetails.availableCashBalance,
                costBasis: null,
                quantity: accountDetails.availableCashBalance,
                currency: 'USD',
                optionId: null,
                holdingDate: holdingDate
            })
        }

        await this.upsertPositions(tpHoldings, [internalAccount.tpBrokerageAccId])
        await this.historicalHoldings(tpHoldings)
    }

    transactions = async (userId: string, finTransactions: FinicityTransaction[]): Promise<void> => {
        const securities = await this.repository.getSecuritiesWithIssue();
        const cashSecurities = await this.repository.getTradingpostCashSecurity();

        const cashSecuritiesMap: Record<string, number> = {};
        const securitiesMap: Record<string, SecurityIssue> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);
        cashSecurities.forEach(sec => cashSecuritiesMap[sec.fromSymbol] = sec.toSecurityId);

        const tpAccountsWithFinicityId = await this.repository.getTradingPostAccountsWithFinicityNumber(userId);
        const finicityIdToTpAccountMap: Record<string, number> = {};
        tpAccountsWithFinicityId.forEach(tpa => finicityIdToTpAccountMap[tpa.externalFinicityAccountId] = tpa.tpBrokerageAccId);

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
                    case "dividend":
                        transaction.ticker = "USD:CUR"
                        break
                    default:
                        throw new Error(`no symbol available for transaction type ${transaction.investmentTransactionType}`)
                }
            }

            let security = securitiesMap[transaction.ticker]
            if (!security) throw new Error(`could not find symbol(${transaction.ticker} for holding`)

            const optionId = await this.isTransactionAnOption(transaction, security.id);

            // TODO: We should check if its just a general "cash" security...
            if (!transaction.unitQuantity && transaction.ticker !== "USD:CUR") {
                console.error("not unit quantity for non-cash security")
                continue
            }

            if (!transaction.unitQuantity) transaction.unitQuantity = transaction.amount;

            let price = transaction.unitPrice ? transaction.unitPrice : (transaction.amount / transaction.unitQuantity)

            let securityType: SecurityType = SecurityType.equity;
            if (transaction.ticker === 'USD:CUR') securityType = SecurityType.cashEquivalent
            if (optionId) securityType = SecurityType.option

            let transactionType = transformTransactionType(transaction.investmentTransactionType);
            let newTpTx: TradingPostTransactions = {
                optionId: optionId,
                accountId: internalTpAccountId,
                securityId: security.id,
                securityType: securityType,
                date: DateTime.fromSeconds(transaction.postedDate),
                quantity: transaction.unitQuantity,
                price: price,
                amount: transaction.amount,
                fees: transaction.feeAmount,
                type: transactionType,
                currency: null,
            };

            newTpTx = transformTransactionTypeAmount(transactionType, newTpTx);
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
        });
        await this.upsertHistoricalHoldings(hh);
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

    _resolveSecurity = async (holding: FinicityHolding, securitiesMap: Record<string, SecurityIssue>, cashSecuritiesMap: Record<string, number>) => {
        let security = securitiesMap[holding.symbol]
        let cashSecurity = cashSecuritiesMap[holding.symbol];

        if (!security && !cashSecurity) {
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
                sector: null,
                enableUtp: false,
                priceSource: PriceSourceType.FINICITY
            };

            const securityId = await this.repository.addSecurity(sec)
            security = {
                id: securityId,
                symbol: sec.symbol,
                name: sec.securityName ? sec.securityName : '',
                issueType: sec.issueType ? sec.issueType : ''
            }
        } else if (!security && cashSecurity) {
            security = {
                id: cashSecurity,
                symbol: holding.symbol,
                name: 'Cash',
                issueType: 'Cash'
            }
        }

        return security;
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