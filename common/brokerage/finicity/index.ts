import {
    FinicityAccount,
    FinicityHolding,
    FinicityInstitution,
    FinicityTransaction,
    FinicityUser,
    IBrokerageService,
    TradingPostBrokerageAccounts,
    TradingPostCurrentHoldings,
    TradingPostInstitution,
    TradingPostTransactions,
    IFinicityRepository, TradingPostBrokerageAccountsTable, TradingPostUser,
} from "../interfaces";
import Finicity from "../../finicity";
import {AddCustomerResponse, AddCustomerResponseError, GetInstitutionsInstitution} from "../../finicity/interfaces";
import {DateTime} from "luxon";
import FinicityTransformer from "./transformer";


export default class FinicityService implements IBrokerageService {
    private finicity: Finicity;
    private repository: IFinicityRepository;
    private transformer: FinicityTransformer;

    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer) {
        this.finicity = finicity;
        this.repository = repository;
        this.transformer = transformer;
    }

    getTradingPostUserAssociatedWithBrokerageUser = async (brokerageUserId: string): Promise<TradingPostUser> => {
        const tpUser = await this.repository.getTradingPostUserByFinicityCustomerId(brokerageUserId)
        if (!tpUser) throw new Error("finicity user does not exist")
        return tpUser
    }

    generateBrokerageAuthenticationLink = async (userId: string, brokerageAccount?: string): Promise<string> => {
        let finicityUser = await this.repository.getFinicityUser(userId);
        if (!finicityUser) finicityUser = await this._createFinicityUser(userId);
        const authPortal = await this.finicity.generateConnectUrl(finicityUser.customerId,
            "https://worker.tradingpostapp.com/finicity/webhook")
        return authPortal.link
    }

    _createFinicityUser = async (userId: string): Promise<FinicityUser> => {
        let finCustomer = await this.finicity.addCustomer("trading-post", userId);

        // TODO: Update to include additional customers...
        if ((finCustomer as AddCustomerResponseError).code !== undefined) {
            const customersResponse = await this.finicity.getCustomers(0, 25, userId);
            console.log(customersResponse)
            customersResponse.customers.forEach(customer => {
                if (customer.username === userId) {
                    finCustomer = {
                        id: customer.id,
                        createdDate: customer.createdDate,
                        username: customer.username
                    } as AddCustomerResponse
                }
            })
        }

        if ((finCustomer as AddCustomerResponseError).code !== undefined) throw new Error("customer exists but could not be found")
        return await this.repository.addFinicityUser(userId, (finCustomer as AddCustomerResponse).id, "active");
    }

    importInstitutions = async (): Promise<void> => {
        let moreAvailable = true
        let start = 1
        let limit = 100
        let institutionIds: Record<number, number> = {}
        while (moreAvailable) {
            const institutions = await this.finicity.getInstitutions(start, limit)
            start++
            moreAvailable = institutions.moreAvailable;
            if (institutions.institutions.length <= 0) continue
            let finStitutions: FinicityInstitution[] = []
            let tpInstitutions: TradingPostInstitution[] = []
            institutions.institutions.forEach((ins: GetInstitutionsInstitution) => {
                if (ins.id in institutionIds) {
                    institutionIds[ins.id] += 1
                } else {
                    institutionIds[ins.id] = 1
                }

                if (institutionIds[ins.id] > 1) {
                    console.log("Found duplicate id: ", ins.id)
                    return
                }

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
                    addressCity: ins.address?.city,
                    addressState: ins.address?.state,
                    addressCountry: ins.address?.country,
                    addressPostalCode: ins.address?.postalCode,
                    addressLine1: ins.address?.addressLine1,
                    addressLine2: ins.address?.addressLine2,
                    currency: ins.currency,
                    email: ins.email,
                    status: ins.status,
                    newInstitutionId: ins.newInstitutionId,
                    brandingLogo: ins.branding?.logo,
                    brandingAlternateLogo: ins.branding?.alternateLogo,
                    brandingIcon: ins.branding?.icon,
                    brandingPrimaryColor: ins.branding?.primaryColor,
                    brandingTitle: ins.branding?.title,
                    oauthInstitutionId: ins.oauthInstitutionId,
                    productionStatusOverall: ins.productionStatus.overallStatus,
                    productionStatusTransAgg: ins.productionStatus.transAgg,
                    productionStatusVoa: ins.productionStatus.voa,
                    productionStatusStateAgg: ins.productionStatus.stateAgg,
                    productionStatusAch: ins.productionStatus.ach,
                    productionStatusAha: ins.productionStatus.aha,
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                });

                tpInstitutions.push({
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
                })
            })

            await this.repository.upsertFinicityInstitutions(finStitutions)
            await this.repository.upsertInstitutions(tpInstitutions)
        }
    }

    getAddInstitution = async (finicityInstitutionId: number): Promise<{ tradingPostInstitutionId: number, finicityInstitutionId: number }> => {
        const institution = await this.repository.getTradingPostInstitutionByFinicityId(finicityInstitutionId)
        if (institution !== null) return {
            tradingPostInstitutionId: institution.id,
            finicityInstitutionId: institution.internalFinicityId
        };

        const ni = await this.finicity.getInstitution(finicityInstitutionId)
        if (!('institution' in ni)) throw new Error(`no institution exists for institution id ${finicityInstitutionId}`)

        const {institution: ins} = ni;

        const finInternalInstitutionId = await this.repository.upsertFinicityInstitution({
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
            addressCity: ins.address?.city,
            addressState: ins.address?.state,
            addressCountry: ins.address?.country,
            addressPostalCode: ins.address?.postalCode,
            addressLine1: ins.address?.addressLine1,
            addressLine2: ins.address?.addressLine2,
            currency: ins.currency,
            email: ins.email,
            status: ins.status,
            newInstitutionId: ins.newInstitutionId === null ? "0" : ins.newInstitutionId.toString(),
            brandingLogo: ins.branding?.logo,
            brandingAlternateLogo: ins.branding?.alternateLogo,
            brandingIcon: ins.branding?.icon,
            brandingPrimaryColor: ins.branding?.primaryColor,
            brandingTitle: ins.branding?.title,
            oauthInstitutionId: ins.oauthInstitutionId,
            productionStatusOverall: ins.productionStatus.overallStatus,
            productionStatusTransAgg: ins.productionStatus.transAgg,
            productionStatusVoa: ins.productionStatus.voa,
            productionStatusStateAgg: ins.productionStatus.stateAgg,
            productionStatusAch: ins.productionStatus.ach,
            productionStatusAha: ins.productionStatus.aha,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
        });
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

        return {tradingPostInstitutionId: tpInId, finicityInstitutionId: finInternalInstitutionId}
    }

    importAccounts = async (userId: string): Promise<TradingPostBrokerageAccounts[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(userId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${userId}`)
        await this.finicity.refreshCustomerAccounts(userId);

        const currentFinicityAccounts = await this.repository.getFinicityAccounts(finicityUser.id);

        const finicityAccounts = await this.finicity.getCustomerAccounts(userId)
        if (!finicityAccounts) throw new Error("NO ACCOUNTS AVAIL...")

        const newFinicityAccounts: FinicityAccount[] = [];
        for (let i = 0; i < finicityAccounts.accounts.length; i++) {
            const fa = finicityAccounts.accounts[i];

            const {
                finicityInstitutionId,
                tradingPostInstitutionId
            } = await this.getAddInstitution(parseInt(fa.institutionId));

            let isIn = false;
            currentFinicityAccounts.forEach(ca => {
                if (isIn) return
                if (ca.finicityInstitutionId == tradingPostInstitutionId && ca.number == fa.number) isIn = true
            });

            if (isIn) continue

            let txPushId = "",
                txSigningKey = "";

            // This will push transactions to our table
            const subscription = await this.finicity.registerTxPush(finicityUser.customerId, fa.id,
                "https://worker.tradingpostapp.com/finicity/webhook");

            if (subscription.subscriptions)
                subscription.subscriptions.forEach(s => {
                    if (s.id !== "" && s.id !== null) {
                        txPushId = s.id;
                        txSigningKey = s.signingKey;
                    }
                })

            newFinicityAccounts.push({
                id: 0,
                finicityUserId: finicityUser.id,
                finicityInstitutionId: finicityInstitutionId,
                accountId: fa.id,
                number: fa.number,
                accountNickname: fa.accountNickname,
                detailMargin: fa.detail?.margin,
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
                detailMarginAllowed: fa.detail?.marginAllowed,
                detailCashAccountAllowed: fa.detail?.cashAccountAllowed,
                detailDescription: fa.detail?.description,
                detailMarginBalance: fa.detail?.marginBalance,
                detailShortBalance: fa.detail?.shortBalance,
                detailAvailableCashBalance: fa.detail?.availableCashBalance,
                detailCurrentBalance: fa.detail?.currentBalance,
                detailDateAsOf: fa.detail?.dateAsOf,
                displayPosition: fa.displayPosition,
                parentAccount: fa.parentAccount,
                updatedAt: DateTime.now(),
                createdAt: DateTime.now(),
                txPushId: txPushId,
                txPushSigningKey: txSigningKey
            })
        }

        await this.repository.upsertFinicityAccounts(newFinicityAccounts);
        const accountsWithIds = await this.repository.getFinicityAccounts(finicityUser.id);
        return this.transformer.accounts(finicityUser.tpUserId, accountsWithIds);
    }

    importHoldings = async (userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostCurrentHoldings[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(userId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${userId} in holdings`);

        const finAccountsAndHoldings = await this.finicity.getCustomerAccounts(finicityUser.customerId);
        if (!finAccountsAndHoldings.accounts || finAccountsAndHoldings.accounts.length <= 0) return [];

        const internalAccounts = await this.repository.getFinicityAccounts(finicityUser.id);
        let accountMap: Record<string, number> = {}
        internalAccounts.forEach(acc => accountMap[acc.accountId] = acc.id);

        let tpHoldings: TradingPostCurrentHoldings[] = [];
        for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
            let account = finAccountsAndHoldings.accounts[i];
            let finicityHoldings: FinicityHolding[] = [];
            console.log(account)
            console.log(finicityUser.customerId)
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

            const transformedHoldings = await this.transformer.holdings(finicityUser.tpUserId, account.id, finicityHoldings,
                DateTime.fromSeconds(account.detail.dateAsOf), account.currency, account.detail);
            tpHoldings.push(...transformedHoldings)
        }

        return tpHoldings;
    }

    importTransactions = async (userId: string, brokerageIds?: string[] | number[]): Promise<TradingPostTransactions[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(userId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${userId} in transactions`);
        const accounts = await this.repository.getFinicityAccounts(finicityUser.id);
        const externalAccountIdToInternalMap: Record<string, number> = {}
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            externalAccountIdToInternalMap[account.accountId] = account.id
            await this.finicity.loadHistoricTransactionsForCustomerAccount(finicityUser.customerId, account.accountId);
        }

        let finTxs: FinicityTransaction[] = []
        let start = DateTime.now().minus({month: 24});
        let end = DateTime.now();
        let startPos = 1;
        let moreAvailable = true;
        while (moreAvailable) {
            const transactions = await this.finicity.getAllCustomerTransactions(finicityUser.customerId, {
                fromDate: start.toUnixInteger(),
                toDate: end.toUnixInteger(),
                start: startPos,
                limit: 1000,
                includePending: false
            });

            moreAvailable = transactions.moreAvailable === 'true'
            startPos = startPos + 1000
            if (transactions.transactions === null || transactions.transactions.length <= 0) break

            transactions.transactions.forEach(tx => {
                const accountId = externalAccountIdToInternalMap[tx.accountId]
                if (!accountId) throw new Error(`could not find account id(${tx.accountId}) for user ${userId}`)
                finTxs.push({
                    id: 0,
                    internalFinicityAccountId: accountId,
                    transactionId: tx.id,
                    ticker: tx.ticker,
                    type: tx.type,
                    investmentTransactionType: tx.investmentTransactionType,
                    unitPrice: tx.unitPrice,
                    transactionDate: tx.transactionDate,
                    categorizationNormalizedPayeeName: tx.categorization?.normalizedPayeeName,
                    categorizationCountry: tx.categorization?.country,
                    memo: tx.memo,
                    postedDate: tx.postedDate,
                    feeAmount: tx.feeAmount,
                    description: tx.description,
                    createdDate: tx.createdDate,
                    commissionAmount: tx.commissionAmount,
                    status: tx.status,
                    categorizationCategory: tx.categorization?.category,
                    customerId: tx.customerId,
                    amount: tx.amount,
                    categorizationBestRepresentation: tx.categorization?.bestRepresentation,
                    accountId: tx.accountId,
                    cusipNo: tx.cusipNo,
                    unitQuantity: tx.unitQuantity,
                    updatedAt: DateTime.now(),
                    createdAt: DateTime.now()
                })
            })
        }

        await this.repository.upsertFinicityTransactions(finTxs);
        return await this.transformer.transactions(finicityUser.tpUserId, finTxs);
    }

    exportAccounts = async (userId: string): Promise<TradingPostBrokerageAccounts[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityUserId(userId);
        if (finicityUser === undefined || finicityUser === null) throw new Error(`no finicity account exists for user id ${userId}`);
        const accounts = await this.repository.getFinicityAccounts(finicityUser.id)
        return await this.transformer.accounts(userId, accounts);
    }

    exportHoldings = async (userId: string): Promise<TradingPostCurrentHoldings[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityUserId(userId);
        if (finicityUser === undefined || finicityUser === null) throw new Error(`no finicity account exists for user id ${userId}`);
        const holdings = await this.repository.getFinicityHoldings(finicityUser.id);
        const finicityAccount = await this.repository.getFinicityAccounts(finicityUser.id);
        let tpHoldings: TradingPostCurrentHoldings[] = []
        for (let i = 0; i < finicityAccount.length; i++) {
            const hold = holdings.filter(a => a.finicityAccountId === finicityAccount[i].id)
            const accountDetail = {
                margin: finicityAccount[i].detailMargin,
                marginAllowed: finicityAccount[i].detailMarginAllowed,
                cashAccountAllowed: finicityAccount[i].detailCashAccountAllowed,
                description: finicityAccount[i].detailDescription,
                marginBalance: finicityAccount[i].detailMarginBalance,
                shortBalance: finicityAccount[i].detailShortBalance,
                availableCashBalance: finicityAccount[i].detailAvailableCashBalance,
                currentBalance: finicityAccount[i].detailCurrentBalance,
                dateAsOf: finicityAccount[i].detailDateAsOf
            }
            let h = await this.transformer.holdings(userId, finicityAccount[i].accountId, hold, null, null, accountDetail)
            tpHoldings.push(...h)
        }
        return tpHoldings
    }

    exportTransactions = async (userId: string): Promise<TradingPostTransactions[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityUserId(userId);
        if (finicityUser === undefined || finicityUser === null) throw new Error(`no finicity account exists for user id ${userId}`);
        const transactions = await this.repository.getFinicityTransactions(finicityUser.id)
        return this.transformer.transactions(userId, transactions);
    }

    removeAccounts = async (brokerageCustomerId: string, accountIds: string[]): Promise<number[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(brokerageCustomerId);
        if (!finicityUser) return [];

        const finicityAccounts = await this.repository.getFinicityAccounts(finicityUser.id)

        const removalAccounts = [];
        for (let i = 0; i < finicityAccounts.length; i++) {
            const fa = finicityAccounts[i];
            for (let j = 0; j < accountIds.length; j++) {
                const aid = accountIds[j];
                if (fa.accountId === aid) removalAccounts.push(fa);
            }
        }

        if (removalAccounts.length > 0) {
            for (let i = 0; i < removalAccounts.length; i++) {
                try {
                    const acc = removalAccounts[i];
                    await this.finicity.deleteTxPushSubscription(finicityUser.customerId, acc.txPushId);
                } catch (e) {
                    console.error(e)
                }
            }

            const ids = removalAccounts.map(ra => ra.id);
            await this.repository.deleteFinicityHoldings(ids);
            await this.repository.deleteFinicityTransactions(ids);
            await this.repository.deleteFinicityAccounts(ids)
        }

        const tradingpostAccounts = await this.repository.getTradingPostBrokerageAccounts(finicityUser.tpUserId);
        let tpAccountIds: number[] = [];
        for (let i = 0; i < finicityAccounts.length; i++) {
            const fa = finicityAccounts[i];
            for (let j = 0; j < tradingpostAccounts.length; j++) {
                const aid: TradingPostBrokerageAccountsTable = tradingpostAccounts[j];
                if (aid.accountNumber === fa.number)
                    tpAccountIds.push(aid.id)
            }
        }
        return tpAccountIds
    }
}

