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
        this.generateBrokerageAuthenticationLink = (userId, brokerageAccount) => __awaiter(this, void 0, void 0, function* () {
            let finicityUser = yield this.repository.getFinicityUser(userId);
            if (!finicityUser)
                finicityUser = yield this._createFinicityUser(userId);
            const authPortal = yield this.finicity.generateConnectUrl(finicityUser.customerId, "https://worker.tradingpostapp.com/finicity/webhook");
            return authPortal.link;
        });
        this._createFinicityUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            let finCustomer = yield this.finicity.addCustomer("trading-post", userId);
            // TODO: Update to include additional customers...
            if (finCustomer.code !== undefined) {
                const customersResponse = yield this.finicity.getCustomers(0, 25, userId);
                console.log(customersResponse);
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
                throw new Error("NO ACCOUNTS AVAIL...");
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
            const accountsWithIds = yield this.repository.getFinicityAccounts(finicityUser.id);
            return this.transformer.accounts(finicityUser.tpUserId, accountsWithIds);
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
            let tpHoldings = [];
            for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
                let account = finAccountsAndHoldings.accounts[i];
                let finicityHoldings = [];
                console.log(account);
                console.log(finicityUser.customerId);
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
            return tpHoldings;
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWVBLGlDQUErQjtBQUkvQixNQUFxQixlQUFlO0lBS2hDLFlBQVksUUFBa0IsRUFBRSxVQUErQixFQUFFLFdBQWdDO1FBTWpHLGtEQUE2QyxHQUFHLENBQU8sZUFBdUIsRUFBNEIsRUFBRTtZQUN4RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsc0NBQXNDLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDNUYsSUFBSSxDQUFDLE1BQU07Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1lBQzVELE9BQU8sTUFBTSxDQUFBO1FBQ2pCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0NBQW1DLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZ0JBQXlCLEVBQW1CLEVBQUU7WUFDdkcsSUFBSSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsWUFBWTtnQkFBRSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekUsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQzdFLG9EQUFvRCxDQUFDLENBQUE7WUFDekQsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFBO1FBQzFCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBTyxNQUFjLEVBQXlCLEVBQUU7WUFDbEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFMUUsa0RBQWtEO1lBQ2xELElBQUssV0FBd0MsQ0FBQyxJQUFJLEtB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