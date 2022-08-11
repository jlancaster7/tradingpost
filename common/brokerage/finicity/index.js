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
            const finCustomer = yield this.finicity.addCustomer("trading-post", userId);
            return this.repository.addFinicityUser(userId, finCustomer.id, "active");
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
            const finicityAccounts = yield this.finicity.getCustomerAccounts(userId);
            if (!finicityAccounts)
                throw new Error("NO ACCOUNTS AVAIL...");
            const newFinicityAccounts = [];
            for (let i = 0; i < finicityAccounts.accounts.length; i++) {
                const fa = finicityAccounts.accounts[i];
                const { tradingPostInstitutionId, finicityInstitutionId } = yield this.getAddInstitution(parseInt(fa.institutionId));
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
            const internalAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            let accountMap = {};
            internalAccounts.forEach(acc => accountMap[acc.accountId] = acc.id);
            let tpHoldings = [];
            for (let i = 0; i < finAccountsAndHoldings.accounts.length; i++) {
                let account = finAccountsAndHoldings.accounts[i];
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
                const transformedHoldings = yield this.transformer.holdings(finicityUser.tpUserId, account.id, finicityHoldings, luxon_1.DateTime.fromSeconds(account.detail.dateAsOf), account.currency);
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
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(userId);
            if (finicityUser === undefined || finicityUser === null)
                throw new Error(`no finicity account exists for user id ${userId}`);
            const accounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            return yield this.transformer.accounts(userId, accounts);
        });
        this.exportHoldings = (userId) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(userId);
            if (finicityUser === undefined || finicityUser === null)
                throw new Error(`no finicity account exists for user id ${userId}`);
            const holdings = yield this.repository.getFinicityHoldings(finicityUser.id);
            let tpHoldings = [];
            for (let i = 0; i < holdings.length; i++) {
                let h = yield this.transformer.holdings(userId, holdings[i].finicityAccountId.toString(), holdings, null, null);
                tpHoldings.push(...h);
            }
            return tpHoldings;
        });
        this.exportTransactions = (userId) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUserByFinicityCustomerId(userId);
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
            const ids = removalAccounts.map(ra => ra.id);
            yield this.repository.deleteFinicityHoldings(ids);
            yield this.repository.deleteFinicityTransactions(ids);
            yield this.repository.deleteFinicityAccounts(ids);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQSxpQ0FBK0I7QUFJL0IsTUFBcUIsZUFBZTtJQUtoQyxZQUFZLFFBQWtCLEVBQUUsVUFBK0IsRUFBRSxXQUFnQztRQU1qRyxrREFBNkMsR0FBRyxDQUFPLGVBQXVCLEVBQTRCLEVBQUU7WUFDeEcsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHNDQUFzQyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1lBQzVGLElBQUksQ0FBQyxNQUFNO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQTtZQUM1RCxPQUFPLE1BQU0sQ0FBQTtRQUNqQixDQUFDLENBQUEsQ0FBQTtRQUVELHdDQUFtQyxHQUFHLENBQU8sTUFBYyxFQUFFLGdCQUF5QixFQUFtQixFQUFFO1lBQ3ZHLElBQUksWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUM3RSxvREFBb0QsQ0FBQyxDQUFBO1lBQ3pELE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQTtRQUMxQixDQUFDLENBQUEsQ0FBQTtRQUVELHdCQUFtQixHQUFHLENBQU8sTUFBYyxFQUF5QixFQUFFO1lBQ2xFLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVFLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMs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