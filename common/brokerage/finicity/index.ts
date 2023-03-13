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
import {
    AddCustomerResponse,
    AddCustomerResponseError,
    GetCustomerAccountsResponse,
    GetInstitutionsInstitution
} from "../../finicity/interfaces";
import {DateTime} from "luxon";
import {Transformer as FinicityTransformer} from "./transformer";
import {PortfolioSummaryService} from "../portfolio-summary";
import {BrokerageAccountError, RetryBrokerageAccountError, BrokerageAccountDataError} from "../errors";

export class Service {
    private readonly finicityApi: Finicity;
    private repository: IFinicityRepository;
    private transformer: FinicityTransformer;
    private readonly portSummarySrv: PortfolioSummaryService | undefined;

    constructor(finicityApi: Finicity, repository: IFinicityRepository, transformer: FinicityTransformer, portfolioSummaryStats?: PortfolioSummaryService) {
        this.finicityApi = finicityApi;
        this.repository = repository;
        this.transformer = transformer;
        this.portSummarySrv = portfolioSummaryStats;
    }

    // addNewAccounts
    // fixAccounts
    // removeAccounts
    // getNewData

    public calculatePortfolioStatistics = async (userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void> => {
        return
    }

    public remove = async (userId: string, brokerageUserId: string, date: DateTime, data?: any): Promise<void> => {
        const {accounts} = data as { accounts: { finicityAccountId: number, finicityAccountNumber: string }[] };

        let finAccountIds: number[] = [];
        let finAccountsNumbers: string[] = [];

        accounts.forEach(a => {
            finAccountIds.push(a.finicityAccountId);
            finAccountsNumbers.push(a.finicityAccountNumber);
        });

        const tpAccounts = await this.repository.getTradingPostBrokerageAccountsByBrokerageNumbersAndAuthService(userId, finAccountsNumbers, DirectBrokeragesType.Finicity);

        let tpAccountIds: number[] = [];
        tpAccounts.forEach(tp => tpAccountIds.push(tp.id));

        // Remove TP first since user should be reflected right away, though we have that deletion status
        await this.repository.deleteTradingPostBrokerageAccounts(tpAccountIds);

        // Remove Finicity Stuff for the account number
        await this.repository.deleteFinicityHoldings(finAccountIds);
        await this.repository.deleteFinicityTransactions(finAccountIds);
        await this.repository.deleteFinicityAccounts(finAccountIds);
    }

    public update = async (userId: string, brokerageUserId: string, date: DateTime, data?: any, isDev: boolean = false) => {
        await this.repository.execTx(async (r) => {
            const finTransformer = new FinicityTransformer(r, this.transformer.getMarketHolidays());
            const portStats = new PortfolioSummaryService(r);
            const finService = new Service(this.finicityApi, r, finTransformer, portStats);
            const finicityUser = await r.getFinicityUser(userId);
            if (!finicityUser) throw new Error("how do we not have a finicity user?")

            await finService.importHoldings(userId, finicityUser);
            await finService.importTransactions(userId, finicityUser);

            if (!finService.portSummarySrv) return
            await finService.portSummarySrv.computeAccountGroupSummary(userId);
        });
    }

    public add = async (userId: string, brokerageUserId: string, date: DateTime, data?: any, isDev: boolean = false) => {
        const finicityUser = await this.repository.getFinicityUser(userId);
        if (!finicityUser) throw new Error("how do we not have a finicity user?")

        // TODO: Swap this out with the institution id if it exists within the data object
        if (!isDev) {
            console.log("Refreshing!")
            await this.finicityApi.refreshCustomerAccounts(finicityUser.customerId);
        }

        const newAccountIds = await this.importAccounts(finicityUser);

        try {
            await this.repository.execTx(async (r) => {
                const finTransformer = new FinicityTransformer(r, this.transformer.getMarketHolidays());
                const portStats = new PortfolioSummaryService(r);
                const finService = new Service(this.finicityApi, r, finTransformer, portStats);

                await finService.importHoldings(userId, finicityUser);

                await finService.importTransactions(userId, finicityUser);

                for (let i = 0; i < newAccountIds.length; i++) {
                    const newAccountId = newAccountIds[i];
                    await finService.transformer.computeHoldingsHistory(newAccountId, true);
                }

                if (!finService.portSummarySrv) return
                await finService.portSummarySrv.computeAccountGroupSummary(userId);
            });
        } catch (e) {
            throw e
            // if (e instanceof BrokerageAccountError) {
            // }
            //
            // if (e instanceof RetryBrokerageAccountError) {
            //
            // }
        }
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
            const link = await this.finicityApi.generateConnectFix({
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

        const authPortal = await this.finicityApi.generateConnectUrl(finicityUser.customerId,
            "https://worker.tradingpostapp.com/finicity/webhook")
        return authPortal.link
    }

    _createFinicityUser = async (userId: string): Promise<FinicityUser> => {
        let finCustomer = await this.finicityApi.addCustomer("trading-post", userId);

        // TODO: Update to include additional customers...
        // TODO: Why do we do this? Why cant we always reconcile? Assuming something with generate connect fix
        if ((finCustomer as AddCustomerResponseError).code !== undefined) {
            const customersResponse = await this.finicityApi.getCustomers(0, 25, userId);

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
            const institutions = await this.finicityApi.getInstitutions(start, limit)
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
        if (institution) return {
            tradingPostInstitutionId: institution.id,
            finicityInstitutionId: institution.internalFinicityId
        };

        const ni = await this.finicityApi.getInstitution(finicityInstitutionId)
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

    _getNewFinicityAccounts = async (finicityUserId: number, currentFinicityAccounts: FinicityAccount[], finicityAccounts: GetCustomerAccountsResponse) => {
        const newFinicityAccounts = finicityAccounts.accounts.filter(acc => {
            return currentFinicityAccounts.find(cfa => cfa.accountId === acc.id && cfa.institutionId == acc.institutionId) === undefined;
        });

        let newAccs = [];
        for (let i = 0; i < newFinicityAccounts.length; i++) {
            const fa = newFinicityAccounts[i];
            const {finicityInstitutionId} = await this.getAddInstitution(parseInt(fa.institutionId));
            newAccs.push(this._mapFinicityAccount(fa, finicityUserId, finicityInstitutionId));
        }
        return newAccs;
    }

    importAccounts = async (finicityUser: FinicityUser): Promise<number[]> => {
        const currentFinicityAccounts = await this.repository.getFinicityAccounts(finicityUser.id);
        const finicityAccounts = await this.finicityApi.getCustomerAccounts(finicityUser.customerId)
        if (!finicityAccounts || !finicityAccounts.accounts) throw new BrokerageAccountDataError(finicityUser.tpUserId, finicityUser.customerId, undefined, undefined, `no finicity accounts found`);

        const newFinicityAccounts = await this._getNewFinicityAccounts(finicityUser.id, currentFinicityAccounts, finicityAccounts);

        await this.repository.upsertFinicityAccounts(newFinicityAccounts);
        const newAccountIds = await this.transformer.accounts(finicityUser.tpUserId, newFinicityAccounts);

        for (let i = 0; i < newFinicityAccounts.length; i++) {
            const newAcc = newFinicityAccounts[i];
            if (newAcc.aggregationStatusCode !== 0) continue;

            await this.finicityApi.loadHistoricTransactionsForCustomerAccount(finicityUser.customerId, newAcc.accountId)
        }

        return newAccountIds;
    }

    _createExternalFinAccountToInternalFinAccountMap = async (finUserInternalId: number) => {
        const internalFinicityAccts = await this.repository.getFinicityAccounts(finUserInternalId);
        let externalFinAccToInternalAccMap: Map<string, FinicityAccount> = new Map();
        internalFinicityAccts.forEach(acc => externalFinAccToInternalAccMap.set(acc.accountId, acc));
        return externalFinAccToInternalAccMap;
    }

    _mapFinicityAccount = (fa: any, finicityUserId: number, finicityInstitutionId: number) => {
        return {
            id: 0,
            finicityUserId: finicityUserId,
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
        }
    }

    _mapFinicityHolding = (pos: any, internalFinAccountId: number): FinicityHolding => {
        return {
            id: 0,
            finicityAccountId: internalFinAccountId,
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
        }
    }

    _mapFinicityTransaction = (tx: any, internalFinAccountId: number): FinicityTransaction => {
        return {
            id: 0,
            internalFinicityAccountId: internalFinAccountId,
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
        }
    }

    importHoldings = async (tpUserId: string, finicityUser: FinicityUser): Promise<void> => {
        const finicityBrokerageCustomer = await this.finicityApi.getCustomerAccounts(finicityUser.customerId);
        if (!finicityBrokerageCustomer.accounts || finicityBrokerageCustomer.accounts.length <= 0) return

        const externalFinAccToInternalAccMap = await this._createExternalFinAccountToInternalFinAccountMap(finicityUser.id);

        for (let i = 0; i < finicityBrokerageCustomer.accounts.length; i++) {
            const externalFinAccount = finicityBrokerageCustomer.accounts[i];
            const internalFinAccount = externalFinAccToInternalAccMap.get(externalFinAccount.id)
            if (!internalFinAccount) throw new Error(`could not find internal finicity brokerage account id for account id: ${externalFinAccount.id}`)

            // Aggregation Status Code from Finicity indicates there was an issue aggregating data from institution
            // TODO: Check that ALL accounts dont have errors and update all accounts
            if (externalFinAccount.aggregationStatusCode !== 0) {
                if (externalFinAccount.aggregationStatusCode === 103 || externalFinAccount.aggregationStatusCode === 185) throw new BrokerageAccountError(tpUserId, finicityUser.customerId, externalFinAccount.aggregationStatusCode, externalFinAccount.id);

                // If we need to keep retrying the account, should investigate behind the scenes
                throw new RetryBrokerageAccountError(tpUserId, finicityUser.customerId, externalFinAccount.aggregationStatusCode, externalFinAccount.id)
            }

            if (externalFinAccount.position === null || externalFinAccount.position === undefined) throw new BrokerageAccountDataError(tpUserId, finicityUser.customerId, undefined, externalFinAccount.id, `no position attribute for external finicity account id: ${externalFinAccount.id}`);

            if (externalFinAccount.position.length <= 0) return;

            const finicityHoldings = externalFinAccount.position.map(p => this._mapFinicityHolding(p, internalFinAccount.id));
            await this.repository.upsertFinicityHoldings(finicityHoldings);
            await this.transformer.holdings(finicityUser.tpUserId, finicityUser.customerId, externalFinAccount.id, finicityHoldings, externalFinAccount.currency, externalFinAccount.detail, DateTime.fromSeconds(externalFinAccount.aggregationSuccessDate));
        }
    }

    importTransactions = async (tpUserId: string, finicityUser: FinicityUser): Promise<void> => {
        const finicityTransactions = await this._iterateTransactions(tpUserId, finicityUser);
        let txByAccountId: Map<string, FinicityTransaction[]> = new Map();

        finicityTransactions.forEach(tx => {
            let accs = txByAccountId.get(tx.accountId.toString())
            if (!accs) accs = [];
            accs.push(tx);
            txByAccountId.set(tx.accountId.toString(), accs);
        });

        for (const [accountId, txs] of txByAccountId) {
            if (txs.length <= 0) continue;

            const newestTransaction = await this.repository.getNewestFinicityTransaction(accountId);
            if (!newestTransaction) {
                // Add To Finicity Transactions
                await this.repository.upsertFinicityTransactions(txs);

                // Add To Transformer
                await this.transformer.transactions(finicityUser.tpUserId, finicityUser.customerId, txs, accountId);
                continue;
            }

            // Remove all the older ones and add the transactions
            const filteredTransactions = txs.filter(f => f.transactionDate > newestTransaction.transactionDate.toUnixInteger());
            if (filteredTransactions.length <= 0) continue;

            await this.repository.upsertFinicityTransactions(filteredTransactions);
            await this.transformer.transactions(finicityUser.tpUserId, finicityUser.customerId, filteredTransactions, accountId);
        }
    }

    _iterateTransactions = async (tpUserId: string, finicityUser: FinicityUser) => {
        const externalFinAccToInternalAccMap = await this._createExternalFinAccountToInternalFinAccountMap(finicityUser.id);

        let finTxs: FinicityTransaction[] = []
        let start = DateTime.now().minus({month: 24});
        let end = DateTime.now();
        let startPos = 1;
        let moreAvailable = true;
        while (moreAvailable) {
            const transactions = await this.finicityApi.getAllCustomerTransactions(finicityUser.customerId, {
                fromDate: start.toUnixInteger(),
                toDate: end.toUnixInteger(),
                start: startPos,
                limit: 1000,
                includePending: false
            });

            moreAvailable = transactions.moreAvailable === 'true'
            startPos = startPos + 1000
            if (!transactions.transactions || transactions.transactions.length <= 0) break

            transactions.transactions.forEach(tx => {
                if (!tx.accountId) throw new BrokerageAccountDataError(tpUserId, finicityUser.customerId, undefined, tx.accountId, `no account id set for transaction ${tx.id}`);

                const finAccount = externalFinAccToInternalAccMap.get(tx.accountId.toString())
                if (!finAccount) throw new BrokerageAccountDataError(tpUserId, finicityUser.customerId, undefined, tx.accountId, "could not find transaction account id within finicity account id map");

                finTxs.push(this._mapFinicityTransaction(tx, finAccount.id))
            })
        }

        return finTxs;
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
                    await this.finicityApi.deleteTxPushSubscription(finicityUser.customerId, acc.txPushId);
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