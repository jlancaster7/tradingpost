import {
    FinicityAccount,
    FinicityHolding,
    FinicityInstitution,
    FinicityTransaction,
    FinicityUser,
    IBrokerageService,
    IBrokerageRepository,
    TradingPostBrokerageAccounts,
    TradingPostCurrentHoldings,
    TradingPostInstitution,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
    IFinicityRepository, TradingPostHistoricalHoldings, TradingPostBrokerageAccountsTable
} from "../interfaces";
import Finicity from "../../finicity";
import {GetInstitutionsInstitution} from "../../finicity/interfaces";
import {DateTime} from "luxon";
import {FinicityTransformer} from "./transformer";


export class FinicityService implements IBrokerageService {
    private finicity: Finicity;
    private repository: IFinicityRepository;
    private transformer: FinicityTransformer;

    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer) {
        this.finicity = finicity;
        this.repository = repository;
        this.transformer = transformer;
    }

    generateBrokerageAuthenticationLink = async (userId: string, brokerageAccount?: string): Promise<string> => {
        let finicityUser = await this.repository.getFinicityUser(userId);
        if (!finicityUser) finicityUser = await this._createFinicityUser(userId);
        const authPortal = await this.finicity.generateConnectUrl(finicityUser.customerId,
            "https://webhook.tradingpost.life/brokerage/finicity")
        return authPortal.link
    }

    _createFinicityUser = async (userId: string): Promise<FinicityUser> => {
        const finCustomer = await this.finicity.addCustomer("trading-post", userId);
        return this.repository.addFinicityUser(userId, finCustomer.id, "active");
    }

    importInstitutions = async (): Promise<void> => {
        let moreAvailable = true
        let start = 1
        let limit = 100
        while (moreAvailable) {
            const institutions = await this.finicity.getInstitutions(start, limit)
            start++
            moreAvailable = institutions.moreAvailable;
            if (institutions.institutions.length <= 0) continue
            let finStitutions: FinicityInstitution[] = []
            let tpInstitutions: TradingPostInstitution[] = []
            institutions.institutions.forEach((ins: GetInstitutionsInstitution) => {
                finStitutions.push({
                    id: 0,
                    institutionId: ins.id,
                    name: ins.name,
                    voa: ins.voa,
                    voi: ins.voi,
                    stateAgg: ins.stateAgg,
                    ach: ins.ach,
                    transAgg: ins.transAgg,
                    aha: ins.aha,
                    availBalance: ins.availBalance,
                    accountOwner: ins.accountOwner,
                    loanPaymentDetails: ins.loanPaymentDetails,
                    studentLoanData: ins.studentLoanData,
                    accountTypeDescription: ins.accountTypeDescription,
                    phone: ins.phone,
                    urlHomeApp: ins.urlHomeApp,
                    urlLogonApp: ins.urlLogonApp,
                    oauthEnabled: ins.oauthEnabled,
                    urlForgotPassword: ins.urlForgotPassword,
                    urlOnlineRegistration: ins.urlOnlineRegistration,
                    class: ins.class,
                    specialText: ins.specialText,
                    timeZone: ins.timeZone,
                    specialInstructions: ins.specialInstructions,
                    specialInstructionsTitle: ins.specialInstructionsTitle,
                    addressCity: ins.address.city,
                    addressState: ins.address.state,
                    addressCountry: ins.address.country,
                    addressPostalCode: ins.address.postalCode,
                    addressLine1: ins.address.addressLine1,
                    addressLine2: ins.address.addressLine2,
                    currency: ins.currency,
                    email: ins.email,
                    status: ins.status,
                    newInstitutionId: ins.newInstitutionId,
                    brandingLogo: ins.branding.logo,
                    brandingAlternateLogo: ins.branding.alternateLogo,
                    brandingIcon: ins.branding.icon,
                    brandingPrimaryColor: ins.branding.primaryColor,
                    brandingTitle: ins.branding.title,
                    oauthInstitutionId: ins.oauthInstitutionId,
                    productionStatusOverall: ins.productionStatus.overallStatus,
                    productionStatusTransAgg: ins.productionStatus.transAgg,
                    productionStatusVoa: ins.productionStatus.voa,
                    productionStatusStateAgg: ins.productionStatus.stateAgg,
                    productionStatusAch: ins.productionStatus.ach,
                    productionStatusAha: ins.productionStatus.aha,
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                })
                tpInstitutions.push({
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
                    addressAddressLine1: ins.address.addressLine1,
                    addressAddressLine2: ins.address.addressLine2,
                    addressCity: ins.address.city,
                    addressState: ins.address.state,
                    addressCountry: ins.address.country,
                    addressPostalCode: ins.address.postalCode,
                    email: ins.email
                })
            })
            await this.repository.upsertFinicityInstitutions(finStitutions)
            await this.repository.upsertInstitutions(tpInstitutions)
        }
    }

    importAccounts = async (userId: string): Promise<TradingPostBrokerageAccounts[]> => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        const finicityInstitutions = await this.repository.getTradingPostInstitutionsWithFinicityInstitutionId();
        let finicityInstitutionMap: Record<string, TradingPostInstitutionWithFinicityInstitutionId> = {};
        finicityInstitutions.forEach(fi => finicityInstitutionMap[fi.externalFinicityId] = fi)

        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${userId}`)
        await this.finicity.refreshCustomerAccounts(finicityUser.customerId);
        const finicityAccounts = await this.finicity.getCustomerAccounts(finicityUser.customerId)
        await this.repository.addFinicityAccounts(finicityAccounts.accounts.map((fa) => {
            let institutionId = finicityInstitutionMap[fa.institutionId].internalFinicityId;
            let o: FinicityAccount = {
                id: 0,
                finicityUserId: finicityUser.id,
                finicityInstitutionId: institutionId,
                accountId: fa.id,
                number: fa.number,
                accountNickname: fa.accountNickname,
                detailMargin: fa.detail.margin,
                lastUpdatedDate: fa.lastUpdatedDate,
                marketSegment: fa.marketSegment,
                accountNumberDisplay: fa.accountNumberDisplay,
                realAccountNumberLast4: fa.realAccountNumberLast4,
                name: fa.name,
                balance: fa.balance,
                type: fa.type,
                aggregationStatusCode: fa.aggregationStatusCode,
                status: fa.status,
                customerId: fa.customerId,
                institutionId: fa.institutionId,
                balanceDate: fa.balanceDate,
                aggregationSuccessDate: fa.aggregationSuccessDate,
                aggregationAttemptDate: fa.aggregationAttemptDate,
                createdDate: fa.createdDate,
                currency: fa.currency,
                lastTransactionDate: fa.lastTransactionDate,
                oldestTransactionDate: fa.oldestTransactionDate,
                institutionLoginId: fa.institutionLoginId,
                detailMarginAllowed: fa.detail.marginAllowed,
                detailCashAccountAllowed: fa.detail.cashAccountAllowed,
                detailDescription: fa.detail.description,
                detailMarginBalance: fa.detail.marginBalance,
                detailShortBalance: fa.detail.shortBalance,
                detailAvailableCashBalance: fa.detail.availableCashBalance,
                detailCurrentBalance: fa.detail.currentBalance,
                detailDateAsOf: fa.detail.dateAsOf,
                displayPosition: fa.displayPosition,
                parentAccount: fa.parentAccount,
                updatedAt: DateTime.now(),
                createdAt: DateTime.now(),
            }
            return o;
        }));

        const accountsWithIds = await this.repository.getFinicityAccounts(finicityUser.id);
        return this.transformer.accounts(userId, accountsWithIds);
    }

    importHoldings = async (userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostCurrentHoldings[]> => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${userId}`);
        const finAccountsAndHoldings = await this.finicity.getCustomerAccounts(finicityUser.customerId);

        const internalAccounts = await this.repository.getFinicityAccounts(finicityUser.id);
        let accountMap: Record<string, number> = {}
        internalAccounts.forEach(acc => accountMap[acc.accountId] = acc.id);

        let tpHoldings: TradingPostCurrentHoldings[] = [];
        for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
            let account = finAccountsAndHoldings.accounts[i];
            let finicityHoldings: FinicityHolding[] = [];
            account.position.forEach(pos => {
                finicityHoldings.push({
                    id: 0,
                    finicityAccountId: accountMap[account.id],
                    holdingId: pos.id,
                    securityIdType: pos.securityIdType,
                    posType: pos.posType,
                    subAccountType: pos.subAccountType,
                    description: pos.description,
                    symbol: pos.symbol,
                    cusipNo: pos.cusipNo,
                    currentPrice: pos.currentPrice,
                    transactionType: pos.transactionType,
                    marketValue: pos.marketValue,
                    securityUnitPrice: pos.securityUnitPrice,
                    units: pos.units,
                    costBasis: pos.costBasis,
                    status: pos.status,
                    securityType: pos.securityType,
                    securityName: pos.securityName,
                    securityCurrency: pos.securityCurrency,
                    currentPriceDate: pos.currentPriceDate,
                    optionStrikePrice: pos.optionStrikePrice,
                    optionType: pos.optionType,
                    optionSharesPerContract: pos.optionSharesPerContract,
                    optionsExpireDate: pos.optionExpireDate,
                    fiAssetClass: pos.fiAssetClass,
                    assetClass: pos.assetClass,
                    currencyRate: pos.currencyRate,
                    costBasisPerShare: pos.costBasisPerShare,
                    mfType: pos.mfType,
                    totalGlDollar: pos.totalGLDollar,
                    totalGlPercent: pos.totalGLPercent,
                    todayGlDollar: pos.todayGLDollar,
                    todayGlPercent: pos.todayGLPercent,
                    updatedAt: DateTime.now(),
                    createdAt: DateTime.now()
                });
            });
            await this.repository.upsertFinicityHoldings(finicityHoldings);
            const transformedHoldings = await this.transformer.holdings(userId, account.id, finicityHoldings,
                DateTime.fromSeconds(account.detail.dateAsOf), account.currency);
            tpHoldings.push(...transformedHoldings)
        }

        return tpHoldings;
    }

    importTransactions = async (userId: string, brokerageIds: string[] | number[]): Promise<TradingPostTransactions[]> => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${userId}`);
        const accounts = await this.repository.getFinicityAccounts(finicityUser.id);
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            await this.finicity.loadHistoricTransactionsForCustomerAccount(finicityUser.customerId, account.accountId);
        }

        let transactions: FinicityTransaction[] = []
        let stillAvailable = true;
        let start = 1;
        let limit = 100;
        // TODO: Iterate over transactions, add them to array, pass back...

        return [];
    }

    exportAccounts = async (userId: string): Promise<TradingPostBrokerageAccounts[]> => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        if (finicityUser === undefined || finicityUser === null) throw new Error(`no finicity account exists for user id ${userId}`);
        const accounts = await this.repository.getFinicityAccounts(finicityUser.id)
        return await this.transformer.accounts(userId, accounts);
    }

    exportHoldings = async (userId: string): Promise<TradingPostCurrentHoldings[]> => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        if (finicityUser === undefined || finicityUser === null) throw new Error(`no finicity account exists for user id ${userId}`);
        const holdings = await this.repository.getFinicityHoldings(finicityUser.id);
        let tpHoldings: TradingPostCurrentHoldings[] = []
        for (let i = 0; i < holdings.length; i++) {
            let h = await this.transformer.holdings(userId, holdings[i].finicityAccountId.toString(), holdings, null, null)
            tpHoldings.push(...h)
        }
        return tpHoldings
    }

    exportTransactions = async (userId: string): Promise<TradingPostTransactions[]> => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        if (finicityUser === undefined || finicityUser === null) throw new Error(`no finicity account exists for user id ${userId}`);
        const transactions = await this.repository.getFinicityTransactions(finicityUser.id)
        return this.transformer.transactions(userId, transactions);
    }
}