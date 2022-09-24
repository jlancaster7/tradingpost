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
const luxon_1 = require("luxon");
class FinicityService {
    constructor(finicity, repository, transformer) {
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
                console.log("DATA: ", acc);
                console.log("USER ID: ", userId);
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
exports.default = FinicityService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWVBLGlDQUErQjtBQUkvQixNQUFxQixlQUFlO0lBS2hDLFlBQVksUUFBa0IsRUFBRSxVQUErQixFQUFFLFdBQWdDO1FBTWpHLGtEQUE2QyxHQUFHLENBQU8sZUFBdUIsRUFBNEIsRUFBRTtZQUN4RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsc0NBQXNDLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDNUYsSUFBSSxDQUFDLE1BQU07Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1lBQzVELE9BQU8sTUFBTSxDQUFBO1FBQ2pCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0NBQW1DLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZ0JBQXlCLEVBQUUsa0JBQTJCLEVBQW1CLEVBQUU7WUFDcEksSUFBSSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsWUFBWTtnQkFBRSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFekUsSUFBSSxrQkFBa0IsRUFBRTtnQkFDcEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGlEQUFpRCxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7Z0JBQ2pILElBQUksR0FBRyxLQUFLLElBQUk7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxzRkFBc0Ysa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUM5SSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQTtnQkFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENB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