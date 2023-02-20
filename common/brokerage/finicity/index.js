"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const interfaces_1 = require("../interfaces");
const luxon_1 = require("luxon");
const transformer_1 = require("./transformer");
const portfolio_summary_1 = require("../portfolio-summary");
class Service {
    constructor(finicity, repository, transformer, portfolioSummaryStats) {
        this.calculatePortfolioStatistics = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            return;
        });
        this.remove = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            const { accounts } = data;
            let finAccountIds = [];
            let finAccountsNumbers = [];
            accounts.forEach(a => {
                finAccountIds.push(a.finicityAccountId);
                finAccountsNumbers.push(a.finicityAccountNumber);
            });
            const tpAccounts = yield this.repository.getTradingPostBrokerageAccountsByBrokerageNumbersAndAuthService(userId, finAccountsNumbers, interfaces_1.DirectBrokeragesType.Finicity);
            let tpAccountIds = [];
            tpAccounts.forEach(tp => tpAccountIds.push(tp.id));
            // Remove TP first since user should be reflected right away, though we have that deletion status
            yield this.repository.deleteTradingPostBrokerageAccounts(tpAccountIds);
            // Remove Finicity Stuff for the account number
            yield this.repository.deleteFinicityHoldings(finAccountIds);
            yield this.repository.deleteFinicityTransactions(finAccountIds);
            yield this.repository.deleteFinicityAccounts(finAccountIds);
        });
        this.update = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            yield this.repository.execTx((r) => __awaiter(this, void 0, void 0, function* () {
                const finTransformer = new transformer_1.Transformer(r);
                const portStats = new portfolio_summary_1.PortfolioSummaryService(r);
                const finService = new Service(this.finicity, r, finTransformer, portStats);
                yield finService.importHoldings(userId, brokerageUserId, []);
                yield finService.importTransactions(userId, brokerageUserId, []);
                if (!finService.portSummarySrv)
                    return;
                yield finService.portSummarySrv.computeAccountGroupSummary(userId);
            }));
        });
        this.add = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            const newFinicityAccounts = yield this.importAccounts(brokerageUserId);
            const newTransformedAccountIds = yield this.transformer.accounts(userId, newFinicityAccounts);
            yield this.repository.addTradingPostAccountGroup(userId, 'default', newTransformedAccountIds, 10117);
            yield this.repository.execTx((r) => __awaiter(this, void 0, void 0, function* () {
                const finTransformer = new transformer_1.Transformer(r);
                const portStats = new portfolio_summary_1.PortfolioSummaryService(r);
                const finService = new Service(this.finicity, r, finTransformer, portStats);
                yield finService.importHoldings(userId, brokerageUserId, newFinicityAccounts.map(f => f.accountId));
                yield finService.importTransactions(userId, brokerageUserId, newFinicityAccounts.map(f => f.accountId));
                for (let i = 0; i < newTransformedAccountIds.length; i++) {
                    const id = newTransformedAccountIds[i];
                    yield finService.transformer.computeHoldingsHistory(id);
                }
                if (!finService.portSummarySrv)
                    return;
                yield finService.portSummarySrv.computeAccountGroupSummary(userId);
            }));
        });
        this.getTradingPostUserAssociatedWithBrokerageUser = (brokerageUserId) => __awaiter(this, void 0, void 0, function* () {
            const tpUser = yield this.repository.getTradingPostUserByFinicityCustomerId(brokerageUserId);
            if (!tpUser)
                throw new Error("finicity user does not exist");
            return tpUser;
        });
        this.generateBrokerageAuthenticationLink = (userId, brokerageAccount, brokerageAccountId) => __awaiter(this, void 0, void 0, function* () {
            let finicityUser = yield this.repository.getFinicityUser(userId);
            if (!finicityUser)
                finicityUser = yield this._createFinicityUser(userId);
            if (brokerageAccountId) {
                // This is for the finicity generate connect fix process...
                const acc = yield this.repository.getFinicityAccountByTradingpostBrokerageAccountId(parseInt(brokerageAccountId));
                if (acc === null)
                    throw new Error(`could not fetch finicity trading post account for tradingpost brokerage account id ${brokerageAccountId}`);
                const link = yield this.finicity.generateConnectFix({
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
            const authPortal = yield this.finicity.generateConnectUrl(finicityUser.customerId, "https://worker.tradingpostapp.com/finicity/webhook");
            return authPortal.link;
        });
        this._createFinicityUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            let finCustomer = yield this.finicity.addCustomer("trading-post", userId);
            // TODO: Update to include additional customers...
            // TODO: Why do we do this? Why cant we always reconcile? Assuming something with generate connect fix
            if (finCustomer.code !== undefined) {
                const customersResponse = yield this.finicity.getCustomers(0, 25, userId);
                customersResponse.customers.forEach(customer => {
                    if (customer.username === userId) {
                        finCustomer = {
                            id: customer.id,
                            createdDate: customer.createdDate,
                            username: customer.username
                        };
                    }
                });
            }
            if (finCustomer.code !== undefined)
                throw new Error("customer exists but could not be found");
            return yield this.repository.addFinicityUser(userId, finCustomer.id, "active");
        });
        this.importInstitutions = () => __awaiter(this, void 0, void 0, function* () {
            let moreAvailable = true;
            let start = 1;
            let limit = 100;
            let institutionIds = {};
            while (moreAvailable) {
                const institutions = yield this.finicity.getInstitutions(start, limit);
                start++;
                moreAvailable = institutions.moreAvailable;
                if (institutions.institutions.length <= 0)
                    continue;
                let finStitutions = [];
                institutions.institutions.forEach((ins) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    if (ins.id in institutionIds) {
                        institutionIds[ins.id] += 1;
                    }
                    else {
                        institutionIds[ins.id] = 1;
                    }
                    if (institutionIds[ins.id] > 1) {
                        console.log("Found duplicate id: ", ins.id);
                        return;
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
                        addressCity: (_a = ins.address) === null || _a === void 0 ? void 0 : _a.city,
                        addressState: (_b = ins.address) === null || _b === void 0 ? void 0 : _b.state,
                        addressCountry: (_c = ins.address) === null || _c === void 0 ? void 0 : _c.country,
                        addressPostalCode: (_d = ins.address) === null || _d === void 0 ? void 0 : _d.postalCode,
                        addressLine1: (_e = ins.address) === null || _e === void 0 ? void 0 : _e.addressLine1,
                        addressLine2: (_f = ins.address) === null || _f === void 0 ? void 0 : _f.addressLine2,
                        currency: ins.currency,
                        email: ins.email,
                        status: ins.status,
                        newInstitutionId: ins.newInstitutionId,
                        brandingLogo: (_g = ins.branding) === null || _g === void 0 ? void 0 : _g.logo,
                        brandingAlternateLogo: (_h = ins.branding) === null || _h === void 0 ? void 0 : _h.alternateLogo,
                        brandingIcon: (_j = ins.branding) === null || _j === void 0 ? void 0 : _j.icon,
                        brandingPrimaryColor: (_k = ins.branding) === null || _k === void 0 ? void 0 : _k.primaryColor,
                        brandingTitle: (_l = ins.branding) === null || _l === void 0 ? void 0 : _l.title,
                        oauthInstitutionId: ins.oauthInstitutionId,
                        productionStatusOverall: ins.productionStatus.overallStatus,
                        productionStatusTransAgg: ins.productionStatus.transAgg,
                        productionStatusVoa: ins.productionStatus.voa,
                        productionStatusStateAgg: ins.productionStatus.stateAgg,
                        productionStatusAch: ins.productionStatus.ach,
                        productionStatusAha: ins.productionStatus.aha,
                        createdAt: luxon_1.DateTime.now(),
                        updatedAt: luxon_1.DateTime.now(),
                    });
                });
                yield this.repository.upsertFinicityInstitutions(finStitutions);
                yield this.transformer.institutions(finStitutions);
            }
        });
        this.getAddInstitution = (finicityInstitutionId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const institution = yield this.repository.getTradingPostInstitutionByFinicityId(finicityInstitutionId);
            if (institution !== null)
                return {
                    tradingPostInstitutionId: institution.id,
                    finicityInstitutionId: institution.internalFinicityId
                };
            const ni = yield this.finicity.getInstitution(finicityInstitutionId);
            if (!('institution' in ni))
                throw new Error(`no institution exists for institution id ${finicityInstitutionId}`);
            const { institution: ins } = ni;
            const finInternalInstitutionId = yield this.repository.upsertFinicityInstitution({
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
                addressCity: (_a = ins.address) === null || _a === void 0 ? void 0 : _a.city,
                addressState: (_b = ins.address) === null || _b === void 0 ? void 0 : _b.state,
                addressCountry: (_c = ins.address) === null || _c === void 0 ? void 0 : _c.country,
                addressPostalCode: (_d = ins.address) === null || _d === void 0 ? void 0 : _d.postalCode,
                addressLine1: (_e = ins.address) === null || _e === void 0 ? void 0 : _e.addressLine1,
                addressLine2: (_f = ins.address) === null || _f === void 0 ? void 0 : _f.addressLine2,
                currency: ins.currency,
                email: ins.email,
                status: ins.status,
                newInstitutionId: ins.newInstitutionId === null ? "0" : ins.newInstitutionId.toString(),
                brandingLogo: (_g = ins.branding) === null || _g === void 0 ? void 0 : _g.logo,
                brandingAlternateLogo: (_h = ins.branding) === null || _h === void 0 ? void 0 : _h.alternateLogo,
                brandingIcon: (_j = ins.branding) === null || _j === void 0 ? void 0 : _j.icon,
                brandingPrimaryColor: (_k = ins.branding) === null || _k === void 0 ? void 0 : _k.primaryColor,
                brandingTitle: (_l = ins.branding) === null || _l === void 0 ? void 0 : _l.title,
                oauthInstitutionId: ins.oauthInstitutionId,
                productionStatusOverall: ins.productionStatus.overallStatus,
                productionStatusTransAgg: ins.productionStatus.transAgg,
                productionStatusVoa: ins.productionStatus.voa,
                productionStatusStateAgg: ins.productionStatus.stateAgg,
                productionStatusAch: ins.productionStatus.ach,
                productionStatusAha: ins.productionStatus.aha,
                createdAt: luxon_1.DateTime.now(),
                updatedAt: luxon_1.DateTime.now(),
            });
            const tpInstitutionId = yield this.transformer.institution(ni);
            return { tradingPostInstitutionId: tpInstitutionId, finicityInstitutionId: finInternalInstitutionId };
        });
        this.importAccounts = (finicityUserId) => __awaiter(this, void 0, void 0, function* () {
            var _m, _o, _p, _q, _r, _s, _t, _u, _v;
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(finicityUserId);
            if (finicityUser === null)
                throw new Error(`no user accounts exist for user id ${finicityUserId}`);
            yield this.finicity.refreshCustomerAccounts(finicityUserId);
            const currentFinicityAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            const finicityAccounts = yield this.finicity.getCustomerAccounts(finicityUserId);
            if (!finicityAccounts)
                throw new Error(`no finicity accounts returned for tradingpost user id ${finicityUserId}`);
            const newFinicityAccounts = [];
            for (let i = 0; i < finicityAccounts.accounts.length; i++) {
                const fa = finicityAccounts.accounts[i];
                const { finicityInstitutionId, tradingPostInstitutionId } = yield this.getAddInstitution(parseInt(fa.institutionId));
                let isIn = false;
                currentFinicityAccounts.forEach(ca => {
                    if (isIn)
                        return;
                    if (ca.finicityInstitutionId == tradingPostInstitutionId && ca.number == fa.number)
                        isIn = true;
                });
                if (isIn)
                    continue;
                newFinicityAccounts.push({
                    id: 0,
                    finicityUserId: finicityUser.id,
                    finicityInstitutionId: finicityInstitutionId,
                    accountId: fa.id,
                    number: fa.number,
                    accountNickname: fa.accountNickname,
                    detailMargin: (_m = fa.detail) === null || _m === void 0 ? void 0 : _m.margin,
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
                    detailMarginAllowed: (_o = fa.detail) === null || _o === void 0 ? void 0 : _o.marginAllowed,
                    detailCashAccountAllowed: (_p = fa.detail) === null || _p === void 0 ? void 0 : _p.cashAccountAllowed,
                    detailDescription: (_q = fa.detail) === null || _q === void 0 ? void 0 : _q.description,
                    detailMarginBalance: (_r = fa.detail) === null || _r === void 0 ? void 0 : _r.marginBalance,
                    detailShortBalance: (_s = fa.detail) === null || _s === void 0 ? void 0 : _s.shortBalance,
                    detailAvailableCashBalance: (_t = fa.detail) === null || _t === void 0 ? void 0 : _t.availableCashBalance,
                    detailCurrentBalance: (_u = fa.detail) === null || _u === void 0 ? void 0 : _u.currentBalance,
                    detailDateAsOf: (_v = fa.detail) === null || _v === void 0 ? void 0 : _v.dateAsOf,
                    displayPosition: fa.displayPosition,
                    parentAccount: fa.parentAccount,
                    updatedAt: luxon_1.DateTime.now(),
                    createdAt: luxon_1.DateTime.now(),
                    txPushId: "",
                    txPushSigningKey: ""
                });
            }
            yield this.repository.upsertFinicityAccounts(newFinicityAccounts);
            return newFinicityAccounts;
        });
        this.importHoldings = (tpUserId, brokerageUserId, accountIds) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(brokerageUserId);
            if (finicityUser === null)
                throw new Error(`no user accounts exist for user id ${brokerageUserId} in holdings`);
            const finAccountsAndHoldings = yield this.finicity.getCustomerAccounts(finicityUser.customerId);
            if (!finAccountsAndHoldings.accounts || finAccountsAndHoldings.accounts.length <= 0)
                return;
            const internalAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            let accountMap = {};
            internalAccounts.forEach(acc => accountMap[acc.accountId] = acc.id);
            let tpAccountErrs = [];
            for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
                let account = finAccountsAndHoldings.accounts[i];
                if (accountIds.length > 0 && !accountIds.includes(account.id))
                    continue;
                if (account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185) {
                    const acc = yield this.transformer.getFinicityToTradingPostAccount(finicityUser.tpUserId, account.id);
                    if (acc === undefined || acc === null)
                        continue;
                    tpAccountErrs.push({
                        accountId: acc.tpBrokerageAccId,
                        error: true,
                        errorCode: account.aggregationStatusCode
                    });
                    continue;
                }
                let finicityHoldings = [];
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
                        updatedAt: luxon_1.DateTime.now(),
                        createdAt: luxon_1.DateTime.now()
                    });
                });
                yield this.repository.upsertFinicityHoldings(finicityHoldings);
                yield this.transformer.holdings(finicityUser.tpUserId, account.id, finicityHoldings, account.currency, account.detail);
            }
            if (tpAccountErrs.length > 0)
                yield this.updateTradingpostBrokerageAccountError(tpAccountErrs);
        });
        this.updateTradingpostBrokerageAccountError = (accounts) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < accounts.length; i++) {
                const acc = accounts[i];
                yield this.repository.updateErrorStatusOfAccount(acc.accountId, acc.error, acc.errorCode);
            }
        });
        // TODO: we should also mix in the tradingpost account here to validate if we should pull transactions or not,
        //      since its.. you know... broken
        this.importTransactions = (tpUserId, brokerageUserId, accountIds) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(brokerageUserId);
            if (finicityUser === null)
                throw new Error(`no user accounts exist for user id ${brokerageUserId} in transactions`);
            const accounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            const externalAccountIdToInternalMap = {};
            for (let i = 0; i < accounts.length; i++) {
                const account = accounts[i];
                externalAccountIdToInternalMap[account.accountId] = account.id;
                yield this.finicity.loadHistoricTransactionsForCustomerAccount(finicityUser.customerId, account.accountId);
            }
            let finTxs = [];
            let start = luxon_1.DateTime.now().minus({ month: 24 });
            let end = luxon_1.DateTime.now();
            let startPos = 1;
            let moreAvailable = true;
            while (moreAvailable) {
                const transactions = yield this.finicity.getAllCustomerTransactions(finicityUser.customerId, {
                    fromDate: start.toUnixInteger(),
                    toDate: end.toUnixInteger(),
                    start: startPos,
                    limit: 1000,
                    includePending: false
                });
                moreAvailable = transactions.moreAvailable === 'true';
                startPos = startPos + 1000;
                if (transactions.transactions === null || transactions.transactions.length <= 0)
                    break;
                transactions.transactions.forEach(tx => {
                    var _a, _b, _c, _d;
                    const accountId = externalAccountIdToInternalMap[tx.accountId];
                    if (!accountId)
                        throw new Error(`could not find account id(${tx.accountId}) for user ${brokerageUserId}`);
                    if (accountIds.length > 0 && !accountIds.includes(tx.accountId.toString()))
                        return;
                    finTxs.push({
                        id: 0,
                        internalFinicityAccountId: accountId,
                        transactionId: tx.id,
                        ticker: tx.ticker,
                        type: tx.type,
                        investmentTransactionType: tx.investmentTransactionType,
                        unitPrice: tx.unitPrice,
                        transactionDate: tx.transactionDate,
                        categorizationNormalizedPayeeName: (_a = tx.categorization) === null || _a === void 0 ? void 0 : _a.normalizedPayeeName,
                        categorizationCountry: (_b = tx.categorization) === null || _b === void 0 ? void 0 : _b.country,
                        memo: tx.memo,
                        postedDate: tx.postedDate,
                        feeAmount: tx.feeAmount,
                        description: tx.description,
                        createdDate: tx.createdDate,
                        commissionAmount: tx.commissionAmount,
                        status: tx.status,
                        categorizationCategory: (_c = tx.categorization) === null || _c === void 0 ? void 0 : _c.category,
                        customerId: tx.customerId,
                        amount: tx.amount,
                        categorizationBestRepresentation: (_d = tx.categorization) === null || _d === void 0 ? void 0 : _d.bestRepresentation,
                        accountId: tx.accountId,
                        cusipNo: tx.cusipNo,
                        unitQuantity: tx.unitQuantity,
                        updatedAt: luxon_1.DateTime.now(),
                        createdAt: luxon_1.DateTime.now()
                    });
                });
            }
            yield this.repository.upsertFinicityTransactions(finTxs);
            yield this.transformer.transactions(finicityUser.tpUserId, finTxs);
        });
        this.removeAccounts = (brokerageCustomerId, accountIds) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(brokerageCustomerId);
            if (!finicityUser)
                return [];
            const finicityAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            const removalAccounts = [];
            for (let i = 0; i < finicityAccounts.length; i++) {
                const fa = finicityAccounts[i];
                for (let j = 0; j < accountIds.length; j++) {
                    const aid = accountIds[j];
                    if (fa.accountId === aid)
                        removalAccounts.push(fa);
                }
            }
            if (removalAccounts.length > 0) {
                for (let i = 0; i < removalAccounts.length; i++) {
                    try {
                        const acc = removalAccounts[i];
                        yield this.finicity.deleteTxPushSubscription(finicityUser.customerId, acc.txPushId);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                const ids = removalAccounts.map(ra => ra.id);
                yield this.repository.deleteFinicityHoldings(ids);
                yield this.repository.deleteFinicityTransactions(ids);
                yield this.repository.deleteFinicityAccounts(ids);
            }
            const tradingpostAccounts = yield this.repository.getTradingPostBrokerageAccounts(finicityUser.tpUserId);
            let tpAccountIds = [];
            for (let i = 0; i < finicityAccounts.length; i++) {
                const fa = finicityAccounts[i];
                for (let j = 0; j < tradingpostAccounts.length; j++) {
                    const aid = tradingpostAccounts[j];
                    if (aid.accountNumber === fa.number)
                        tpAccountIds.push(aid.id);
                }
            }
            return tpAccountIds;
        });
        this.finicity = finicity;
        this.repository = repository;
        this.transformer = transformer;
        this.portSummarySrv = portfolioSummaryStats;
    }
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw4Q0FRdUI7QUFHdkIsaUNBQStCO0FBQy9CLCtDQUFpRTtBQUNqRSw0REFBNkQ7QUFFN0QsTUFBYSxPQUFPO0lBTWhCLFlBQVksUUFBa0IsRUFBRSxVQUErQixFQUFFLFdBQWdDLEVBQUUscUJBQStDO1FBTzNJLGlDQUE0QixHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBaUIsRUFBRTtZQUMvSCxPQUFNO1FBQ1YsQ0FBQyxDQUFBLENBQUE7UUFFTSxXQUFNLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZUFBdUIsRUFBRSxJQUFjLEVBQUUsSUFBVSxFQUFpQixFQUFFO1lBQ3pHLE1BQU0sRUFBQyxRQUFRLEVBQUMsR0FBRyxJQUFvRixDQUFDO1lBRXhHLElBQUksYUFBYSxHQUFhLEVBQUUsQ0FBQztZQUNqQyxJQUFJLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztZQUV0QyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNqQixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUN4QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsK0RBQStELENBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLGlDQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBLLElBQUksWUFBWSxHQUFhLEVBQUUsQ0FBQztZQUNoQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FB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