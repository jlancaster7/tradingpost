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
const luxon_1 = require("luxon");
class Service {
    constructor(finicity, repository, transformer) {
        this.update = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
        });
        this.add = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            return;
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
                let tpInstitutions = [];
                institutions.institutions.forEach((ins) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
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
                        addressAddressLine1: (_m = ins.address) === null || _m === void 0 ? void 0 : _m.addressLine1,
                        addressAddressLine2: (_o = ins.address) === null || _o === void 0 ? void 0 : _o.addressLine2,
                        addressCity: (_p = ins.address) === null || _p === void 0 ? void 0 : _p.city,
                        addressState: (_q = ins.address) === null || _q === void 0 ? void 0 : _q.state,
                        addressCountry: (_r = ins.address) === null || _r === void 0 ? void 0 : _r.country,
                        addressPostalCode: (_s = ins.address) === null || _s === void 0 ? void 0 : _s.postalCode,
                        email: ins.email
                    });
                });
                yield this.repository.upsertFinicityInstitutions(finStitutions);
                yield this.repository.upsertInstitutions(tpInstitutions);
            }
        });
        this.getAddInstitution = (finicityInstitutionId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
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
            const tpInId = yield this.repository.upsertInstitution({
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
                addressAddressLine1: (_m = ins.address) === null || _m === void 0 ? void 0 : _m.addressLine1,
                addressAddressLine2: (_o = ins.address) === null || _o === void 0 ? void 0 : _o.addressLine2,
                addressCity: (_p = ins.address) === null || _p === void 0 ? void 0 : _p.city,
                addressState: (_q = ins.address) === null || _q === void 0 ? void 0 : _q.state,
                addressCountry: (_r = ins.address) === null || _r === void 0 ? void 0 : _r.country,
                addressPostalCode: (_s = ins.address) === null || _s === void 0 ? void 0 : _s.postalCode,
                email: ins.email
            });
            return { tradingPostInstitutionId: tpInId, finicityInstitutionId: finInternalInstitutionId };
        });
        this.importAccounts = (userId) => __awaiter(this, void 0, void 0, function* () {
            var _t, _u, _v, _w, _x, _y, _z, _0, _1;
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(userId);
            if (finicityUser === null)
                throw new Error(`no user accounts exist for user id ${userId}`);
            yield this.finicity.refreshCustomerAccounts(userId);
            const currentFinicityAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            const finicityAccounts = yield this.finicity.getCustomerAccounts(userId);
            if (!finicityAccounts)
                throw new Error(`no finicity accounts returned for tradingpost user id ${userId}`);
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
                let txPushId = "", txSigningKey = "";
                // This will push transactions to our table
                const subscription = yield this.finicity.registerTxPush(finicityUser.customerId, fa.id, "https://worker.tradingpostapp.com/finicity/webhook");
                if (subscription.subscriptions)
                    subscription.subscriptions.forEach(s => {
                        if (s.id !== "" && s.id !== null) {
                            txPushId = s.id;
                            txSigningKey = s.signingKey;
                        }
                    });
                newFinicityAccounts.push({
                    id: 0,
                    finicityUserId: finicityUser.id,
                    finicityInstitutionId: finicityInstitutionId,
                    accountId: fa.id,
                    number: fa.number,
                    accountNickname: fa.accountNickname,
                    detailMargin: (_t = fa.detail) === null || _t === void 0 ? void 0 : _t.margin,
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
                    detailMarginAllowed: (_u = fa.detail) === null || _u === void 0 ? void 0 : _u.marginAllowed,
                    detailCashAccountAllowed: (_v = fa.detail) === null || _v === void 0 ? void 0 : _v.cashAccountAllowed,
                    detailDescription: (_w = fa.detail) === null || _w === void 0 ? void 0 : _w.description,
                    detailMarginBalance: (_x = fa.detail) === null || _x === void 0 ? void 0 : _x.marginBalance,
                    detailShortBalance: (_y = fa.detail) === null || _y === void 0 ? void 0 : _y.shortBalance,
                    detailAvailableCashBalance: (_z = fa.detail) === null || _z === void 0 ? void 0 : _z.availableCashBalance,
                    detailCurrentBalance: (_0 = fa.detail) === null || _0 === void 0 ? void 0 : _0.currentBalance,
                    detailDateAsOf: (_1 = fa.detail) === null || _1 === void 0 ? void 0 : _1.dateAsOf,
                    displayPosition: fa.displayPosition,
                    parentAccount: fa.parentAccount,
                    updatedAt: luxon_1.DateTime.now(),
                    createdAt: luxon_1.DateTime.now(),
                    txPushId: txPushId,
                    txPushSigningKey: txSigningKey
                });
            }
            yield this.repository.upsertFinicityAccounts(newFinicityAccounts);
            const allAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            return this.transformer.accounts(finicityUser.tpUserId, allAccounts);
        });
        this.importHoldings = (userId, brokerageIds) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(userId);
            if (finicityUser === null)
                throw new Error(`no user accounts exist for user id ${userId} in holdings`);
            const finAccountsAndHoldings = yield this.finicity.getCustomerAccounts(finicityUser.customerId);
            if (!finAccountsAndHoldings.accounts || finAccountsAndHoldings.accounts.length <= 0)
                return [];
            const internalAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            let accountMap = {};
            internalAccounts.forEach(acc => accountMap[acc.accountId] = acc.id);
            let tpAccountErrs = [];
            let tpHoldings = [];
            for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
                let account = finAccountsAndHoldings.accounts[i];
                if (account.aggregationStatusCode === 103 || account.aggregationStatusCode === 185) {
                    const acc = yield this.transformer.getFinicityToTradingPostAccount(finicityUser.tpUserId, account.id);
                    if (acc === undefined || acc === null)
                        continue;
                    tpAccountErrs.push({
                        accountId: acc.id,
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
                const transformedHoldings = yield this.transformer.holdings(finicityUser.tpUserId, account.id, finicityHoldings, luxon_1.DateTime.fromSeconds(account.detail.dateAsOf), account.currency, account.detail);
                tpHoldings.push(...transformedHoldings);
            }
            if (tpAccountErrs.length > 0)
                yield this.updateTradingpostBrokerageAccountError(tpAccountErrs);
            return tpHoldings;
        });
        this.updateTradingpostBrokerageAccountError = (accounts) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < accounts.length; i++) {
                const acc = accounts[i];
                yield this.repository.updateErrorStatusOfAccount(acc.accountId, acc.error, acc.errorCode);
            }
        });
        // TODO: we should also mix in the tradingpost account here to validate if we should pull transactions or not,
        //      since its.. you know... broken
        this.importTransactions = (userId, brokerageIds) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(userId);
            if (finicityUser === null)
                throw new Error(`no user accounts exist for user id ${userId} in transactions`);
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
                        throw new Error(`could not find account id(${tx.accountId}) for user ${userId}`);
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
            return yield this.transformer.transactions(finicityUser.tpUserId, finTxs);
        });
        this.exportAccounts = (userId) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityUserId(userId);
            if (finicityUser === undefined || finicityUser === null)
                throw new Error(`no finicity account exists for user id ${userId}`);
            const accounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            return yield this.transformer.accounts(userId, accounts);
        });
        this.exportHoldings = (userId) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityUserId(userId);
            if (finicityUser === undefined || finicityUser === null)
                throw new Error(`no finicity account exists for user id ${userId}`);
            const holdings = yield this.repository.getFinicityHoldings(finicityUser.id);
            const finicityAccount = yield this.repository.getFinicityAccounts(finicityUser.id);
            let tpHoldings = [];
            for (let i = 0; i < finicityAccount.length; i++) {
                const hold = holdings.filter(a => a.finicityAccountId === finicityAccount[i].id);
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
                };
                let h = yield this.transformer.holdings(userId, finicityAccount[i].accountId, hold, null, null, accountDetail);
                tpHoldings.push(...h);
            }
            return tpHoldings;
        });
        this.exportTransactions = (userId) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityUserId(userId);
            if (finicityUser === undefined || finicityUser === null)
                throw new Error(`no finicity account exists for user id ${userId}`);
            const transactions = yield this.repository.getFinicityTransactions(finicityUser.id);
            return this.transformer.transactions(userId, transactions);
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
    }
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFlQSxpQ0FBK0I7QUFHL0IsTUFBYSxPQUFPO0lBS2hCLFlBQVksUUFBa0IsRUFBRSxVQUErQixFQUFFLFdBQWdDO1FBTTFGLFdBQU0sR0FBRyxDQUFPLE1BQWMsRUFBRSxlQUF1QixFQUFFLElBQWMsRUFBRSxJQUFVLEVBQUUsRUFBRTtRQUU5RixDQUFDLENBQUEsQ0FBQTtRQUVNLFFBQUcsR0FBRyxDQUFPLE1BQWMsRUFBRSxlQUF1QixFQUFFLElBQWMsRUFBRSxJQUFVLEVBQUUsRUFBRTtZQUN2RixPQUFPO1FBQ1gsQ0FBQyxDQUFBLENBQUE7UUFFRCxrREFBNkMsR0FBRyxDQUFPLGVBQXVCLEVBQTRCLEVBQUU7WUFDeEcsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHNDQUFzQyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1lBQzVGLElBQUksQ0FBQyxNQUFNO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQTtZQUM1RCxPQUFPLE1BQU0sQ0FBQTtRQUNqQixDQUFDLENBQUEsQ0FBQTtRQUVELHdDQUFtQyxHQUFHLENBQU8sTUFBYyxFQUFFLGdCQUF5QixFQUFFLGtCQUEyQixFQUFtQixFQUFFO1lBQ3BJLElBQUksWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXpFLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3BCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpREFBaUQsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFB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