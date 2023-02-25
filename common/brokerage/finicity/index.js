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
                const finicityUser = yield this.repository.getFinicityUser(userId);
                if (!finicityUser)
                    throw new Error("how do we not have a finicity user?");
                const finicityAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
                yield finService.importHoldings(userId, brokerageUserId, finicityAccounts.map(f => f.accountId));
                yield finService.importTransactions(userId, brokerageUserId, finicityAccounts.map(f => f.accountId));
                for (let i = 0; i < newTransformedAccountIds.length; i++) {
                    const id = newTransformedAccountIds[i];
                    // Don't compute some security types for historical holdings since we do not have pricing at the moment
                    yield finService.transformer.computeHoldingsHistory(id, true);
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
            console.log(brokerageUserId);
            console.log();
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
                if (account.position)
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