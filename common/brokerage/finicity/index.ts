import {
    DirectBrokeragesType,
    FinicityAccount,
    FinicityHolding,
    FinicityInstitution,
    FinicityTransaction,
    FinicityUser,
    IFinicityRepository, TradingPostBrokerageAccountsTable, TradingPostUser
} from "../interfaces";
import Finicity from "../../finicity";
import {AddCustomerResponse, AddCustomerResponseError, GetInstitutionsInstitution} from "../../finicity/interfaces";
import {DateTime} from "luxon";
import {Transformer as FinicityTransformer} from "./transformer";
import {PortfolioSummaryService} from "../portfolio-summary";

export class Service {
    private finicity: Finicity;
    private repository: IFinicityRepository;
    private transformer: FinicityTransformer;
    private readonly portSummarySrv: PortfolioSummaryService | undefined;

    constructor(finicity: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer, portfolioSummaryStats?: PortfolioSummaryService) {
        this.finicity = finicity;
        this.repository = repository;
        this.transformer = transformer;
        this.portSummarySrv = portfolioSummaryStats;
    }

    public calculatePortfolioStatistics = async (userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void> => {
        return
    }

    public update = async (userId: string, brokerageUserId: string, date: DateTime, data?: any) => {
        await this.importHoldings(userId, brokerageUserId, []);
        await this.importTransactions(userId, brokerageUserId, []);

        if (!this.portSummarySrv) return
        await this.portSummarySrv.computeAccountGroupSummary(userId);
    }

    public add = async (userId: string, brokerageUserId: string, date: DateTime, data?: any) => {
        const newFinicityAccounts = await this.importAccounts(brokerageUserId);
        const newTransformedAccountIds = await this.transformer.accounts(userId, newFinicityAccounts);

        await this.repository.addTradingPostAccountGroup(userId, 'default', newTransformedAccountIds, 10117);

        await this.importHoldings(userId, brokerageUserId, newFinicityAccounts.map(f => f.accountId));
        await this.importTransactions(userId, brokerageUserId, newFinicityAccounts.map(f => f.accountId));

        for (let i = 0; i < newTransformedAccountIds.length; i++) {
            const id = newTransformedAccountIds[i];
            await this.transformer.computeHoldingsHistory(id);
        }

        if (!this.portSummarySrv) return
        await this.portSummarySrv.computeAccountGroupSummary(userId);
    }

    getTradingPostUserAssociatedWithBrokerageUser = async (brokerageUserId: string): Promise<TradingPostUser> => {
        const tpUser = await this.repository.getTradingPostUserByFinicityCustomerId(brokerageUserId)
        if (!tpUser) throw new Error("finicity user does not exist")
        return tpUser
    }

    generateBrokerageAuthenticationLink = async (userId: string, brokerageAccount?: string, brokerageAccountId?: string): Promise<string> => {
        let finicityUser = await this.repository.getFinicityUser(userId);
        if (!finicityUser) finicityUser = await this._createFinicityUser(userId);

        if (brokerageAccountId) {
            // This is for the finicity generate connect fix process...
            const acc = await this.repository.getFinicityAccountByTradingpostBrokerageAccountId(parseInt(brokerageAccountId))
            if (acc === null) throw new Error(`could not fetch finicity trading post account for tradingpost brokerage account id ${brokerageAccountId}`);
            const link = await this.finicity.generateConnectFix({
                customerId: finicityUser.customerId,
                language: "en",
                institutionLoginId: acc.finicityInstitutionLoginId,
                webhook: "https://worker.tradingpostapp.com/finicity/webhook",
                webhookContentType: "application/json",
                webhookData: {},
                webhookHeaders: {},
                institutionSettings: {},
                singleUseUrl: true,
            });
            return link.link;
        }

        const authPortal = await this.finicity.generateConnectUrl(finicityUser.customerId,
            "https://worker.tradingpostapp.com/finicity/webhook")
        return authPortal.link
    }

    _createFinicityUser = async (userId: string): Promise<FinicityUser> => {
        let finCustomer = await this.finicity.addCustomer("trading-post", userId);

        // TODO: Update to include additional customers...
        // TODO: Why do we do this? Why cant we always reconcile? Assuming something with generate connect fix
        if ((finCustomer as AddCustomerResponseError).code !== undefined) {
            const customersResponse = await this.finicity.getCustomers(0, 25, userId);

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
            })

            await this.repository.upsertFinicityInstitutions(finStitutions)
            await this.transformer.institutions(finStitutions)
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
        const tpInstitutionId = await this.transformer.institution(ni)
        return {tradingPostInstitutionId: tpInstitutionId, finicityInstitutionId: finInternalInstitutionId}
    }

    importAccounts = async (finicityUserId: string): Promise<FinicityAccount[]> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(finicityUserId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${finicityUserId}`)
        await this.finicity.refreshCustomerAccounts(finicityUserId);

        const currentFinicityAccounts = await this.repository.getFinicityAccounts(finicityUser.id);
        const finicityAccounts = await this.finicity.getCustomerAccounts(finicityUserId)
        if (!finicityAccounts) throw new Error(`no finicity accounts returned for tradingpost user id ${finicityUserId}`)

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
                txPushId: "",
                txPushSigningKey: ""
            })
        }

        await this.repository.upsertFinicityAccounts(newFinicityAccounts);
        return newFinicityAccounts;
    }

    importHoldings = async (tpUserId: string, brokerageUserId: string, accountIds: string[]): Promise<void> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(brokerageUserId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${brokerageUserId} in holdings`);

        const finAccountsAndHoldings = await this.finicity.getCustomerAccounts(finicityUser.customerId);
        if (!finAccountsAndHoldings.accounts || finAccountsAndHoldings.accounts.length <= 0) return

        const internalAccounts = await this.repository.getFinicityAccounts(finicityUser.id);
        let accountMap: Record<string, number> = {}
        internalAccounts.forEach(acc => accountMap[acc.accountId] = acc.id);

        let tpAccountErrs: { accountId: number, error: boolean, errorCode: number }[] = [];
        for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
            let account = finAccountsAndHoldings.accounts[i];
            if (accountIds.length > 0 && !accountIds.includes(account.id)) continue;

            if (account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185) {
                const acc = await this.transformer.getFinicityToTradingPostAccount(finicityUser.tpUserId, account.id);
                if (acc === undefined || acc === null) continue;
                tpAccountErrs.push({
                    accountId: acc.id,
                    error: true,
                    errorCode: account.aggregationStatusCode
                })
                continue;
            }

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
                    optionExpiredate: pos.optionExpiredate,
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
            await this.transformer.holdings(finicityUser.tpUserId, account.id, finicityHoldings, account.currency, account.detail);
        }

        if (tpAccountErrs.length > 0) await this.updateTradingpostBrokerageAccountError(tpAccountErrs);
    }

    updateTradingpostBrokerageAccountError = async (accounts: { accountId: number, error: boolean, errorCode: number }[]): Promise<void> => {
        for (let i = 0; i < accounts.length; i++) {
            const acc = accounts[i];
            await this.repository.updateErrorStatusOfAccount(acc.accountId, acc.error, acc.errorCode);
        }
    }

    // TODO: we should also mix in the tradingpost account here to validate if we should pull transactions or not,
    //      since its.. you know... broken
    importTransactions = async (tpUserId: string, brokerageUserId: string, accountIds: string[]): Promise<void> => {
        const finicityUser = await this.repository.getFinicityUserByFinicityCustomerId(brokerageUserId);
        if (finicityUser === null) throw new Error(`no user accounts exist for user id ${brokerageUserId} in transactions`);
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
                if (!accountId) throw new Error(`could not find account id(${tx.accountId}) for user ${brokerageUserId}`)

                if (accountIds.length > 0 && !accountIds.includes(tx.accountId.toString())) return;

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
        await this.transformer.transactions(finicityUser.tpUserId, finTxs);
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

