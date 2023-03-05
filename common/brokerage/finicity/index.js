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
const errors_1 = require("../errors");
class Service {
    constructor(finicityApi, repository, transformer, portfolioSummaryStats) {
        // addNewAccounts
        // fixAccounts
        // removeAccounts
        // getNewData
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
        this.update = (userId, brokerageUserId, date, data, isDev = false) => __awaiter(this, void 0, void 0, function* () {
            yield this.repository.execTx((r) => __awaiter(this, void 0, void 0, function* () {
                const finTransformer = new transformer_1.Transformer(r, this.transformer.getMarketHolidays());
                const portStats = new portfolio_summary_1.PortfolioSummaryService(r);
                const finService = new Service(this.finicityApi, r, finTransformer, portStats);
                const finicityUser = yield r.getFinicityUser(userId);
                if (!finicityUser)
                    throw new Error("how do we not have a finicity user?");
                yield finService.importHoldings(userId, finicityUser);
                yield finService.importTransactions(userId, finicityUser);
                if (!finService.portSummarySrv)
                    return;
                yield finService.portSummarySrv.computeAccountGroupSummary(userId);
            }));
        });
        this.add = (userId, brokerageUserId, date, data, isDev = false) => __awaiter(this, void 0, void 0, function* () {
            const finicityUser = yield this.repository.getFinicityUser(userId);
            if (!finicityUser)
                throw new Error("how do we not have a finicity user?");
            // TODO: Swap this out with the institution id if it exists within the data object
            if (!isDev)
                yield this.finicityApi.refreshCustomerAccounts(finicityUser.customerId);
            const newAccountIds = yield this.importAccounts(finicityUser);
            try {
                yield this.repository.execTx((r) => __awaiter(this, void 0, void 0, function* () {
                    const finTransformer = new transformer_1.Transformer(r, this.transformer.getMarketHolidays());
                    const portStats = new portfolio_summary_1.PortfolioSummaryService(r);
                    const finService = new Service(this.finicityApi, r, finTransformer, portStats);
                    console.log("Holdings");
                    yield finService.importHoldings(userId, finicityUser);
                    console.log("Transactions");
                    yield finService.importTransactions(userId, finicityUser);
                    for (let i = 0; i < newAccountIds.length; i++) {
                        const newAccountId = newAccountIds[i];
                        yield finService.transformer.computeHoldingsHistory(newAccountId, true);
                    }
                    if (!finService.portSummarySrv)
                        return;
                    yield finService.portSummarySrv.computeAccountGroupSummary(userId);
                }));
            }
            catch (e) {
                throw e;
                // if (e instanceof BrokerageAccountError) {
                // }
                //
                // if (e instanceof RetryBrokerageAccountError) {
                //
                // }
            }
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
                const link = yield this.finicityApi.generateConnectFix({
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
            const authPortal = yield this.finicityApi.generateConnectUrl(finicityUser.customerId, "https://worker.tradingpostapp.com/finicity/webhook");
            return authPortal.link;
        });
        this._createFinicityUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            let finCustomer = yield this.finicityApi.addCustomer("trading-post", userId);
            // TODO: Update to include additional customers...
            // TODO: Why do we do this? Why cant we always reconcile? Assuming something with generate connect fix
            if (finCustomer.code !== undefined) {
                const customersResponse = yield this.finicityApi.getCustomers(0, 25, userId);
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
                const institutions = yield this.finicityApi.getInstitutions(start, limit);
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
            if (institution)
                return {
                    tradingPostInstitutionId: institution.id,
                    finicityInstitutionId: institution.internalFinicityId
                };
            const ni = yield this.finicityApi.getInstitution(finicityInstitutionId);
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
        this._getNewFinicityAccounts = (finicityUserId, currentFinicityAccounts, finicityAccounts) => __awaiter(this, void 0, void 0, function* () {
            const newFinicityAccounts = finicityAccounts.accounts.filter(acc => !currentFinicityAccounts.find(cfa => cfa.accountId === acc.id && cfa.institutionId == acc.institutionId));
            let newAccs = [];
            for (let i = 0; i < newFinicityAccounts.length; i++) {
                const fa = newFinicityAccounts[i];
                const { finicityInstitutionId } = yield this.getAddInstitution(parseInt(fa.institutionId));
                newAccs.push(this._mapFinicityAccount(fa, finicityUserId, finicityInstitutionId));
            }
            return newAccs;
        });
        this.importAccounts = (finicityUser) => __awaiter(this, void 0, void 0, function* () {
            const currentFinicityAccounts = yield this.repository.getFinicityAccounts(finicityUser.id);
            const finicityAccounts = yield this.finicityApi.getCustomerAccounts(finicityUser.customerId);
            if (!finicityAccounts || !finicityAccounts.accounts)
                throw new errors_1.BrokerageAccountDataError(finicityUser.tpUserId, finicityUser.customerId, undefined, undefined, `no finicity accounts found`);
            const newFinicityAccounts = yield this._getNewFinicityAccounts(finicityUser.id, currentFinicityAccounts, finicityAccounts);
            yield this.repository.upsertFinicityAccounts(newFinicityAccounts);
            const newAccountIds = yield this.transformer.accounts(finicityUser.tpUserId, newFinicityAccounts);
            for (let i = 0; i < newFinicityAccounts.length; i++) {
                const newAcc = newFinicityAccounts[i];
                if (newAcc.aggregationStatusCode !== 0)
                    continue;
                yield this.finicityApi.loadHistoricTransactionsForCustomerAccount(finicityUser.customerId, newAcc.accountId);
            }
            return newAccountIds;
        });
        this._createExternalFinAccountToInternalFinAccountMap = (finUserInternalId) => __awaiter(this, void 0, void 0, function* () {
            const internalFinicityAccts = yield this.repository.getFinicityAccounts(finUserInternalId);
            let externalFinAccToInternalAccMap = new Map();
            internalFinicityAccts.forEach(acc => externalFinAccToInternalAccMap.set(acc.accountId, acc));
            return externalFinAccToInternalAccMap;
        });
        this._mapFinicityAccount = (fa, finicityUserId, finicityInstitutionId) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return {
                id: 0,
                finicityUserId: finicityUserId,
                finicityInstitutionId: finicityInstitutionId,
                accountId: fa.id,
                number: fa.number,
                accountNickname: fa.accountNickname,
                detailMargin: (_a = fa.detail) === null || _a === void 0 ? void 0 : _a.margin,
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
                detailMarginAllowed: (_b = fa.detail) === null || _b === void 0 ? void 0 : _b.marginAllowed,
                detailCashAccountAllowed: (_c = fa.detail) === null || _c === void 0 ? void 0 : _c.cashAccountAllowed,
                detailDescription: (_d = fa.detail) === null || _d === void 0 ? void 0 : _d.description,
                detailMarginBalance: (_e = fa.detail) === null || _e === void 0 ? void 0 : _e.marginBalance,
                detailShortBalance: (_f = fa.detail) === null || _f === void 0 ? void 0 : _f.shortBalance,
                detailAvailableCashBalance: (_g = fa.detail) === null || _g === void 0 ? void 0 : _g.availableCashBalance,
                detailCurrentBalance: (_h = fa.detail) === null || _h === void 0 ? void 0 : _h.currentBalance,
                detailDateAsOf: (_j = fa.detail) === null || _j === void 0 ? void 0 : _j.dateAsOf,
                displayPosition: fa.displayPosition,
                parentAccount: fa.parentAccount,
                updatedAt: luxon_1.DateTime.now(),
                createdAt: luxon_1.DateTime.now(),
                txPushId: "",
                txPushSigningKey: ""
            };
        };
        this._mapFinicityHolding = (pos, internalFinAccountId) => {
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
                updatedAt: luxon_1.DateTime.now(),
                createdAt: luxon_1.DateTime.now()
            };
        };
        this._mapFinicityTransaction = (tx, internalFinAccountId) => {
            var _a, _b, _c, _d;
            return {
                id: 0,
                internalFinicityAccountId: internalFinAccountId,
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
            };
        };
        this.importHoldings = (tpUserId, finicityUser) => __awaiter(this, void 0, void 0, function* () {
            const finicityBrokerageCustomer = yield this.finicityApi.getCustomerAccounts(finicityUser.customerId);
            if (!finicityBrokerageCustomer.accounts || finicityBrokerageCustomer.accounts.length <= 0)
                return;
            const externalFinAccToInternalAccMap = yield this._createExternalFinAccountToInternalFinAccountMap(finicityUser.id);
            for (let i = 0; i < finicityBrokerageCustomer.accounts.length; i++) {
                const externalFinAccount = finicityBrokerageCustomer.accounts[i];
                const internalFinAccount = externalFinAccToInternalAccMap.get(externalFinAccount.id);
                if (!internalFinAccount)
                    throw new Error(`could not find internal finicity brokerage account id for account id: ${externalFinAccount.id}`);
                // Aggregation Status Code from Finicity indicates there was an issue aggregating data from institution
                // TODO: Check that ALL accounts dont have errors and update all accounts
                if (externalFinAccount.aggregationStatusCode !== 0) {
                    if (externalFinAccount.aggregationStatusCode === 103 || externalFinAccount.aggregationStatusCode === 185)
                        throw new errors_1.BrokerageAccountError(tpUserId, finicityUser.customerId, externalFinAccount.aggregationStatusCode, externalFinAccount.id);
                    // If we need to keep retrying the account, should investigate behind the scenes
                    throw new errors_1.RetryBrokerageAccountError(tpUserId, finicityUser.customerId, externalFinAccount.aggregationStatusCode, externalFinAccount.id);
                }
                if (externalFinAccount.position === null || externalFinAccount.position === undefined)
                    throw new errors_1.BrokerageAccountDataError(tpUserId, finicityUser.customerId, undefined, externalFinAccount.id, `no position attribute for external finicity account id: ${externalFinAccount.id}`);
                if (externalFinAccount.position.length <= 0)
                    return;
                const finicityHoldings = externalFinAccount.position.map(p => this._mapFinicityHolding(p, internalFinAccount.id));
                yield this.repository.upsertFinicityHoldings(finicityHoldings);
                yield this.transformer.holdings(finicityUser.tpUserId, finicityUser.customerId, externalFinAccount.id, finicityHoldings, externalFinAccount.currency, externalFinAccount.detail, luxon_1.DateTime.fromSeconds(externalFinAccount.aggregationSuccessDate));
            }
        });
        this.importTransactions = (tpUserId, finicityUser) => __awaiter(this, void 0, void 0, function* () {
            const externalFinAccToInternalAccMap = yield this._createExternalFinAccountToInternalFinAccountMap(finicityUser.id);
            const finicityTransactions = yield this._iterateTransactions(tpUserId, finicityUser, externalFinAccToInternalAccMap);
            let txByAccountId = new Map();
            const sortedFinicityTransactions = finicityTransactions.sort((a, b) => a.transactionDate - b.transactionDate);
            sortedFinicityTransactions.forEach(tx => {
                let accs = txByAccountId.get(tx.accountId.toString());
                if (!accs)
                    accs = [];
                accs.push(tx);
                txByAccountId.set(tx.accountId.toString(), accs);
            });
            const accountIdToNewestTxMap = new Map();
            for (const [accountId, txs] of txByAccountId) {
                const newestTransaction = yield this.repository.getNewestFinicityTransaction(accountId);
                if (!newestTransaction)
                    accountIdToNewestTxMap.set(accountId, null);
                else
                    accountIdToNewestTxMap.set(accountId, newestTransaction.transactionDate);
            }
            yield this.repository.upsertFinicityTransactions(finicityTransactions);
            for (const [accountId, txs] of txByAccountId) {
                const txDateTime = accountIdToNewestTxMap.get(accountId);
                let filteredTxs = txs.filter(t => {
                    if (!txDateTime)
                        return true;
                    const tDateTime = luxon_1.DateTime.fromSeconds(t.transactionDate);
                    if (tDateTime.toUnixInteger() > txDateTime.toUnixInteger())
                        return true;
                    return false;
                });
                if (filteredTxs.length <= 0)
                    continue;
                yield this.transformer.transactions(finicityUser.tpUserId, finicityUser.customerId, filteredTxs, accountId);
            }
        });
        this._iterateTransactions = (tpUserId, finicityUser, externalFinAccToInternalAccMap) => __awaiter(this, void 0, void 0, function* () {
            let finTxs = [];
            let start = luxon_1.DateTime.now().minus({ month: 24 });
            let end = luxon_1.DateTime.now();
            let startPos = 1;
            let moreAvailable = true;
            while (moreAvailable) {
                const transactions = yield this.finicityApi.getAllCustomerTransactions(finicityUser.customerId, {
                    fromDate: start.toUnixInteger(),
                    toDate: end.toUnixInteger(),
                    start: startPos,
                    limit: 1000,
                    includePending: false
                });
                moreAvailable = transactions.moreAvailable === 'true';
                startPos = startPos + 1000;
                if (!transactions.transactions || transactions.transactions.length <= 0)
                    break;
                transactions.transactions.forEach(tx => {
                    if (!tx.accountId)
                        throw new errors_1.BrokerageAccountDataError(tpUserId, finicityUser.customerId, undefined, tx.accountId, `no account id set for transaction ${tx.id}`);
                    const finAccount = externalFinAccToInternalAccMap.get(tx.accountId.toString());
                    if (!finAccount)
                        throw new errors_1.BrokerageAccountDataError(tpUserId, finicityUser.customerId, undefined, tx.accountId, "could not find transaction account id within finicity account id map");
                    finTxs.push(this._mapFinicityTransaction(tx, finAccount.id));
                });
            }
            return finTxs;
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
                        yield this.finicityApi.deleteTxPushSubscription(finicityUser.customerId, acc.txPushId);
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
        this.finicityApi = finicityApi;
        this.repository = repository;
        this.transformer = transformer;
        this.portSummarySrv = portfolioSummaryStats;
    }
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw4Q0FRdUI7QUFRdkIsaUNBQStCO0FBQy9CLCtDQUFpRTtBQUNqRSw0REFBNkQ7QUFDN0Qsc0NBQXVHO0FBRXZHLE1BQWEsT0FBTztJQU1oQixZQUFZLFdBQXFCLEVBQUUsVUFBK0IsRUFBRSxXQUFnQyxFQUFFLHFCQUErQztRQU9ySixpQkFBaUI7UUFDakIsY0FBYztRQUNkLGlCQUFpQjtRQUNqQixhQUFhO1FBRU4saUNBQTRCLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZUFBdUIsRUFBRSxJQUFjLEVBQUUsSUFBVSxFQUFpQixFQUFFO1lBQy9ILE9BQU07UUFDVixDQUFDLENBQUEsQ0FBQTtRQUVNLFdBQU0sR0FBRyxDQUFPLE1BQWMsRUFBRSxlQUF1QixFQUFFLElBQWMsRUFBRSxJQUFVLEVBQWlCLEVBQUU7WUFDekcsTUFBTSxFQUFDLFFBQVEsRUFBQyxHQUFHLElBQW9GLENBQUM7WUFFeEcsSUFBSSxhQUFhLEdBQWEsRUFBRSxDQUFDO1lBQ2pDLElBQUksa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1lBRXRDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pCLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3hDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywrREFBK0QsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsaUNBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEssSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO1lBQ2hDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRW5ELGlHQUFpRztZQUNqRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsa0NBQWtDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdkUsK0NBQStDO1lBQy9DLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM1RCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsMEJBQTBCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDaEUsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQSxDQUFBO1FBRU0sV0FBTSxHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBRSxRQUFpQixLQUFLLEVBQUUsRUFBRTtZQUNsSCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JDLE1BQU0sY0FBYyxHQUFHLElBQUkseUJBQW1CLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RixNQUFNLFNBQVMsR0FBRyxJQUFJLDJDQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQy9FLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLFlBQVk7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO2dCQUV6RSxNQUFNLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBRTFELElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYztvQkFBRSxPQUFNO2dCQUN0QyxNQUFNLFVBQVUsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFBO1FBRU0sUUFBRyxHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBRSxRQUFpQixLQUFLLEVBQUUsRUFBRTtZQUMvRyxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxZQUFZO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQTtZQUV6RSxrRkFBa0Y7WUFDbEYsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVwRixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFOUQsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQU8sQ0FBQyxFQUFFLEVBQUU7b0JBQ3JDLE1BQU0sY0FBYyxHQUFHLElBQUkseUJBQW1CLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO29CQUN4RixNQUFNLFNBQVMsR0FBRyxJQUFJLDJDQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBRS9FLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7b0JBQ3ZCLE1BQU0sVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBRXRELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7b0JBQzNCLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFFMUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzNDLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEMsTUFBTSxVQUFVLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDM0U7b0JBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjO3dCQUFFLE9BQU07b0JBQ3RDLE1BQU0sVUFBVSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkUsQ0FBQyxDQUFBLENBQUMsQ0FBQzthQUNOO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxDQUFDLENBQUE7Z0JBQ1AsNENBQTRDO2dCQUM1QyxJQUFJO2dCQUNKLEVBQUU7Z0JBQ0YsaURBQWlEO2dCQUNqRCxFQUFFO2dCQUNGLElBQUk7YUFDUDtRQUNMLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0RBQTZDLEdBQUcsQ0FBTyxlQUF1QixFQUE0QixFQUFFO1lBQ3hHLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQ0FBc0MsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUM1RixJQUFJLENBQUMsTUFBTTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUE7WUFDNUQsT0FBTyxNQUFNLENBQUE7UUFDakIsQ0FBQyxDQUFBLENBQUE7UUFFRCx3Q0FBbUMsR0FBRyxDQUFPLE1BQWMsRUFBRSxnQkFBeUIsRUFBRSxrQkFBMkIsRUFBbUIsRUFBRTtZQUNwSSxJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxZQUFZO2dCQUFFLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV6RSxJQUFJLGtCQUFrQixFQUFFO2dCQUNwQiwyREFBMkQ7Z0JBQzNELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxpREFBaUQsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFBO2dCQUNqSCxJQUFJLEdBQUcsS0FBSyxJQUFJO29CQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0ZBQXNGLGtCQUFrQixFQUFFLENBQUMsQ0FBQztnQkFDOUksTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDO29CQUNuRCxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7b0JBQ25DLFFBQVEsRUFBRSxJQUFJO29CQUNkLGtCQUFrQixFQUFFLEdBQUcsQ0FBQywwQkFBMEI7b0JBQ2xELE9BQU8sRUFBRSxvREFBb0Q7b0JBQzdELGtCQUFrQixFQUFFLGtCQUFrQjtvQkFDdEMsV0FBVyxFQUFFLEVBQUU7b0JBQ2YsY0FBYyxFQUFFLEVBQUU7b0JBQ2xCLG1CQUFtQixFQUFFLEVBQUU7b0JBQ3ZCLFlBQVksRUFBRSxJQUFJO2lCQUNyQixDQUFDLENBQUM7Z0JBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3BCO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQ2hGLG9EQUFvRCxDQUFDLENBQUE7WUFDekQsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFBO1FBQzFCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBTyxNQUFjLEVBQXlCLEVBQUU7WUFDbEUsSUFBSSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFN0Usa0RBQWtEO1lBQ2xELHNHQUFzRztZQUN0RyxJQUFLLFdBQXdDLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDOUQsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRTdFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQzNDLElBQUksUUFBUSxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUU7d0JBQzlCLFdBQVcsR0FBRzs0QkFDVixFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUU7NEJBQ2YsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXOzRCQUNqQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7eUJBQ1AsQ0FBQTtxQkFDM0I7Z0JBQ0wsQ0FBQyxDQUFDLENBQUE7YUFDTDtZQUVELElBQUssV0FBd0MsQ0FBQyxJQUFJLEtBQUssU0FBUztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUE7WUFDM0gsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRyxXQUFtQyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1RyxDQUFDLENBQUEsQ0FBQTtRQUVELHVCQUFrQixHQUFHLEdBQXdCLEVBQUU7WUFDM0MsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFBO1lBQ3hCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtZQUNiLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQTtZQUNmLElBQUksY0FBYyxHQUEyQixFQUFFLENBQUE7WUFDL0MsT0FBTyxhQUFhLEVBQUU7Z0JBQ2xCLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUN6RSxLQUFLLEVBQUUsQ0FBQTtnQkFDUCxhQUFhLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQztnQkFDM0MsSUFBSSxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUFFLFNBQVE7Z0JBQ25ELElBQUksYUFBYSxHQUEwQixFQUFFLENBQUE7Z0JBQzdDLFlBQVksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBK0IsRUFBRSxFQUFFOztvQkFDbEUsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLGNBQWMsRUFBRTt3QkFDMUIsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQzlCO3lCQUFNO3dCQUNILGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO3FCQUM3QjtvQkFFRCxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTt3QkFDM0MsT0FBTTtxQkFDVDtvQkFFRCxhQUFhLENBQUMsSUFBSSxDQUFDO3dCQUNmLEVBQUUsRUFBRSxDQUFDO3dCQUNMLGFBQWEsRUFBRSxHQUFHLENBQUMsRUFBRTt3QkFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO3dCQUNkLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRzt3QkFDWixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7d0JBQ1osUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO3dCQUN0QixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7d0JBQ1osUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO3dCQUN0QixHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7d0JBQ1osWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO3dCQUM5QixZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVk7d0JBQzlCLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxrQkFBa0I7d0JBQzFDLGVBQWUsRUFBRSxHQUFHLENBQUMsZUFBZTt3QkFDcEMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLHNCQUFzQjt3QkFDbEQsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO3dCQUNoQixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVU7d0JBQzFCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVzt3QkFDNUIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO3dCQUM5QixpQkFBaUIsRUFBRSxHQUFHLENBQUMsaUJBQWlCO3dCQUN4QyxxQkFBcUIsRUFBRSxHQUFHLENBQUMscUJBQXFCO3dCQUNoRCxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7d0JBQ2hCLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVzt3QkFDNUIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO3dCQUN0QixtQkFBbUIsRUFBRSxHQUFHLENBQUMsbUJBQW1CO3dCQUM1Qyx3QkFBd0IsRUFBRSxHQUFHLENBQUMsd0JBQXdCO3dCQUN0RCxXQUFXLEVBQUUsTUFBQSxHQUFHLENBQUMsT0FBTywwQ0FBRSxJQUFJO3dCQUM5QixZQUFZLEVBQUUsTUFBQSxHQUFHLENBQUMsT0FBTywwQ0FBRSxLQUFLO3dCQUNoQyxjQUFjLEVBQUUsTUFBQSxHQUFHLENBQUMsT0FBTywwQ0FBRSxPQUFPO3dCQUNwQyxpQkFBaUIsRUFBRSxNQUFBLEdBQUcsQ0FBQyxPQUFPLDBDQUFFLFVBQVU7d0JBQzFDLFlBQVksRUFBRSxNQUFBLEdBQUcsQ0FBQyxPQUFPLDBDQUFFLFlBQVk7d0JBQ3ZDLFlBQVksRUFBRSxNQUFBLEdBQUcsQ0FBQyxPQUFPLDBDQUFFLFlBQVk7d0JBQ3ZDLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTt3QkFDdEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO3dCQUNoQixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07d0JBQ2xCLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0I7d0JBQ3RDLFlBQVksRUFBRSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLElBQUk7d0JBQ2hDLHFCQUFxQixFQUFFLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsYUFBYTt3QkFDbEQsWUFBWSxFQUFFLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsSUFBSTt3QkFDaEMsb0JBQW9CLEVBQUUsTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxZQUFZO3dCQUNoRCxhQUFhLEVBQUUsTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxLQUFLO3dCQUNsQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsa0JBQWtCO3dCQUMxQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYTt3QkFDM0Qsd0JBQXdCLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFFBQVE7d0JBQ3ZELG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO3dCQUM3Qyx3QkFBd0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsUUFBUTt3QkFDdkQsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUc7d0JBQzdDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO3dCQUM3QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUU7d0JBQ3pCLFNBQVMsRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTtxQkFDNUIsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFBO2dCQUVGLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtnQkFDL0QsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQTthQUNyRDtRQUNMLENBQUMsQ0FBQSxDQUFBO1FBRUQsc0JBQWlCLEdBQUcsQ0FBTyxxQkFBNkIsRUFBZ0YsRUFBRTs7WUFDdEksTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHFDQUFxQyxDQUFDLHFCQUFxQixDQUFDLENBQUE7WUFDdEcsSUFBSSxXQUFXO2dCQUFFLE9BQU87b0JBQ3BCLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxFQUFFO29CQUN4QyxxQkFBcUIsRUFBRSxXQUFXLENBQUMsa0JBQWtCO2lCQUN4RCxDQUFDO1lBRUYsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1lBQ3ZFLElBQUksQ0FBQyxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUM7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMscUJBQXFCLEVBQUUsQ0FBQyxDQUFBO1lBRWhILE1BQU0sRUFBQyxXQUFXLEVBQUUsR0FBRyxFQUFDLEdBQUcsRUFBRSxDQUFDO1lBRTlCLE1BQU0sd0JBQXdCLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDO2dCQUM3RSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxhQUFhLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtnQkFDZCxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7Z0JBQ1osR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO2dCQUNaLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtnQkFDdEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO2dCQUNaLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtnQkFDdEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO2dCQUNaLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWTtnQkFDOUIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO2dCQUM5QixrQkFBa0IsRUFBRSxHQUFHLENBQUMsa0JBQWtCO2dCQUMxQyxlQUFlLEVBQUUsR0FBRyxDQUFDLGVBQWU7Z0JBQ3BDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxzQkFBc0I7Z0JBQ2xELEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztnQkFDaEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVO2dCQUMxQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7Z0JBQzVCLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWTtnQkFDOUIsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLGlCQUFpQjtnQkFDeEMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLHFCQUFxQjtnQkFDaEQsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO2dCQUNoQixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVc7Z0JBQzVCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtnQkFDdEIsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLG1CQUFtQjtnQkFDNUMsd0JBQXdCLEVBQUUsR0FBRyxDQUFDLHdCQUF3QjtnQkFDdEQsV0FBVyxFQUFFLE1BQUEsR0FBRyxDQUFDLE9BQU8sMENBQUUsSUFBSTtnQkFDOUIsWUFBWSxFQUFFLE1BQUEsR0FBRyxDQUFDLE9BQU8sMENBQUUsS0FBSztnQkFDaEMsY0FBYyxFQUFFLE1BQUEsR0FBRyxDQUFDLE9BQU8sMENBQUUsT0FBTztnQkFDcEMsaUJBQWlCLEVBQUUsTUFBQSxHQUFHLENBQUMsT0FBTywwQ0FBRSxVQUFVO2dCQUMxQyxZQUFZLEVBQUUsTUFBQSxHQUFHLENBQUMsT0FBTywwQ0FBRSxZQUFZO2dCQUN2QyxZQUFZLEVBQUUsTUFBQSxHQUFHLENBQUMsT0FBTywwQ0FBRSxZQUFZO2dCQUN2QyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7Z0JBQ3RCLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztnQkFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO2dCQUNsQixnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZGLFlBQVksRUFBRSxNQUFBLEdBQUcsQ0FBQyxRQUFRLDBDQUFFLElBQUk7Z0JBQ2hDLHFCQUFxQixFQUFFLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsYUFBYTtnQkFDbEQsWUFBWSxFQUFFLE1BQUEsR0FBRyxDQUFDLFFBQVEsMENBQUUsSUFBSTtnQkFDaEMsb0JBQW9CLEVBQUUsTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxZQUFZO2dCQUNoRCxhQUFhLEVBQUUsTUFBQSxHQUFHLENBQUMsUUFBUSwwQ0FBRSxLQUFLO2dCQUNsQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsa0JBQWtCO2dCQUMxQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYTtnQkFDM0Qsd0JBQXdCLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFFBQVE7Z0JBQ3ZELG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO2dCQUM3Qyx3QkFBd0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsUUFBUTtnQkFDdkQsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUc7Z0JBQzdDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO2dCQUM3QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pCLFNBQVMsRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTthQUM1QixDQUFDLENBQUM7WUFDSCxNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzlELE9BQU8sRUFBQyx3QkFBd0IsRUFBRSxlQUFlLEVBQUUscUJBQXFCLEVBQUUsd0JBQXdCLEVBQUMsQ0FBQTtRQUN2RyxDQUFDLENBQUEsQ0FBQTtRQUVELDRCQUF1QixHQUFHLENBQU8sY0FBc0IsRUFBRSx1QkFBMEMsRUFBRSxnQkFBNkMsRUFBRSxFQUFFO1lBQ2xKLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxhQUFhLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUE7WUFDN0ssSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pELE1BQU0sRUFBRSxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLEVBQUMscUJBQXFCLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO2FBQ3JGO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFBLENBQUE7UUFFRCxtQkFBYyxHQUFHLENBQU8sWUFBMEIsRUFBcUIsRUFBRTtZQUNyRSxNQUFNLHVCQUF1QixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDM0YsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQzVGLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVE7Z0JBQUUsTUFBTSxJQUFJLGtDQUF5QixDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFFN0wsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLHVCQUF1QixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFM0gsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDbEUsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFFbEcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakQsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLElBQUksTUFBTSxDQUFDLHFCQUFxQixLQUFLLENBQUM7b0JBQUUsU0FBUztnQkFFakQsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLDBDQUEwQyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO2FBQy9HO1lBRUQsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQyxDQUFBLENBQUE7UUFFRCxxREFBZ0QsR0FBRyxDQUFPLGlCQUF5QixFQUFFLEVBQUU7WUFDbkYsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzRixJQUFJLDhCQUE4QixHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzdFLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDN0YsT0FBTyw4QkFBOEIsQ0FBQztRQUMxQyxDQUFDLENBQUEsQ0FBQTtRQUVELHdCQUFtQixHQUFHLENBQUMsRUFBTyxFQUFFLGNBQXNCLEVBQUUscUJBQTZCLEVBQUUsRUFBRTs7WUFDckYsT0FBTztnQkFDSCxFQUFFLEVBQUUsQ0FBQztnQkFDTCxjQUFjLEVBQUUsY0FBYztnQkFDOUIscUJBQXFCLEVBQUUscUJBQXFCO2dCQUM1QyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hCLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtnQkFDakIsZUFBZSxFQUFFLEVBQUUsQ0FBQyxlQUFlO2dCQUNuQyxZQUFZLEVBQUUsTUFBQSxFQUFFLENBQUMsTUFBTSwwQ0FBRSxNQUFNO2dCQUMvQixlQUFlLEVBQUUsRUFBRSxDQUFDLGVBQWU7Z0JBQ25DLGFBQWEsRUFBRSxFQUFFLENBQUMsYUFBYTtnQkFDL0Isb0JBQW9CLEVBQUUsRUFBRSxDQUFDLG9CQUFvQjtnQkFDN0Msc0JBQXNCLEVBQUUsRUFBRSxDQUFDLHNCQUFzQjtnQkFDakQsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO2dCQUNiLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTztnQkFDbkIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO2dCQUNiLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxxQkFBcUI7Z0JBQy9DLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtnQkFDakIsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVO2dCQUN6QixhQUFhLEVBQUUsRUFBRSxDQUFDLGFBQWE7Z0JBQy9CLFdBQVcsRUFBRSxFQUFFLENBQUMsV0FBVztnQkFDM0Isc0JBQXNCLEVBQUUsRUFBRSxDQUFDLHNCQUFzQjtnQkFDakQsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLHNCQUFzQjtnQkFDakQsV0FBVyxFQUFFLEVBQUUsQ0FBQyxXQUFXO2dCQUMzQixRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVE7Z0JBQ3JCLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxtQkFBbUI7Z0JBQzNDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxxQkFBcUI7Z0JBQy9DLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxrQkFBa0I7Z0JBQ3pDLG1CQUFtQixFQUFFLE1BQUEsRUFBRSxDQUFDLE1BQU0sMENBQUUsYUFBYTtnQkFDN0Msd0JBQXdCLEVBQUUsTUFBQSxFQUFFLENBQUMsTUFBTSwwQ0FBRSxrQkFBa0I7Z0JBQ3ZELGlCQUFpQixFQUFFLE1BQUEsRUFBRSxDQUFDLE1BQU0sMENBQUUsV0FBVztnQkFDekMsbUJBQW1CLEVBQUUsTUFBQSxFQUFFLENBQUMsTUFBTSwwQ0FBRSxhQUFhO2dCQUM3QyxrQkFBa0IsRUFBRSxNQUFBLEVBQUUsQ0FBQyxNQUFNLDBDQUFFLFlBQVk7Z0JBQzNDLDBCQUEwQixFQUFFLE1BQUEsRUFBRSxDQUFDLE1BQU0sMENBQUUsb0JBQW9CO2dCQUMzRCxvQkFBb0IsRUFBRSxNQUFBLEVBQUUsQ0FBQyxNQUFNLDBDQUFFLGNBQWM7Z0JBQy9DLGNBQWMsRUFBRSxNQUFBLEVBQUUsQ0FBQyxNQUFNLDBDQUFFLFFBQVE7Z0JBQ25DLGVBQWUsRUFBRSxFQUFFLENBQUMsZUFBZTtnQkFDbkMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxhQUFhO2dCQUMvQixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pCLFNBQVMsRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDekIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osZ0JBQWdCLEVBQUUsRUFBRTthQUN2QixDQUFBO1FBQ0wsQ0FBQyxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBQyxHQUFRLEVBQUUsb0JBQTRCLEVBQW1CLEVBQUU7WUFDOUUsT0FBTztnQkFDSCxFQUFFLEVBQUUsQ0FBQztnQkFDTCxpQkFBaUIsRUFBRSxvQkFBb0I7Z0JBQ3ZDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDakIsY0FBYyxFQUFFLEdBQUcsQ0FBQyxjQUFjO2dCQUNsQyxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87Z0JBQ3BCLGNBQWMsRUFBRSxHQUFHLENBQUMsY0FBYztnQkFDbEMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXO2dCQUM1QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07Z0JBQ2xCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztnQkFDcEIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO2dCQUM5QixlQUFlLEVBQUUsR0FBRyxDQUFDLGVBQWU7Z0JBQ3BDLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVztnQkFDNUIsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLGlCQUFpQjtnQkFDeEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO2dCQUNoQixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7Z0JBQ3hCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtnQkFDbEIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO2dCQUM5QixZQUFZLEVBQUUsR0FBRyxDQUFDLFlBQVk7Z0JBQzlCLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0I7Z0JBQ3RDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxnQkFBZ0I7Z0JBQ3RDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxpQkFBaUI7Z0JBQ3hDLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTtnQkFDMUIsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLHVCQUF1QjtnQkFDcEQsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLGdCQUFnQjtnQkFDdEMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxZQUFZO2dCQUM5QixVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVU7Z0JBQzFCLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWTtnQkFDOUIsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLGlCQUFpQjtnQkFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO2dCQUNsQixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWE7Z0JBQ2hDLGNBQWMsRUFBRSxHQUFHLENBQUMsY0FBYztnQkFDbEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhO2dCQUNoQyxjQUFjLEVBQUUsR0FBRyxDQUFDLGNBQWM7Z0JBQ2xDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDekIsU0FBUyxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFO2FBQzVCLENBQUE7UUFDTCxDQUFDLENBQUE7UUFFRCw0QkFBdUIsR0FBRyxDQUFDLEVBQU8sRUFBRSxvQkFBNEIsRUFBdUIsRUFBRTs7WUFDckYsT0FBTztnQkFDSCxFQUFFLEVBQUUsQ0FBQztnQkFDTCx5QkFBeUIsRUFBRSxvQkFBb0I7Z0JBQy9DLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNO2dCQUNqQixJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUk7Z0JBQ2IseUJBQXlCLEVBQUUsRUFBRSxDQUFDLHlCQUF5QjtnQkFDdkQsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTO2dCQUN2QixlQUFlLEVBQUUsRUFBRSxDQUFDLGVBQWU7Z0JBQ25DLGlDQUFpQyxFQUFFLE1BQUEsRUFBRSxDQUFDLGNBQWMsMENBQUUsbUJBQW1CO2dCQUN6RSxxQkFBcUIsRUFBRSxNQUFBLEVBQUUsQ0FBQyxjQUFjLDBDQUFFLE9BQU87Z0JBQ2pELElBQUksRUFBRSxFQUFFLENBQUMsSUFBSTtnQkFDYixVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVU7Z0JBQ3pCLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztnQkFDdkIsV0FBVyxFQUFFLEVBQUUsQ0FBQyxXQUFXO2dCQUMzQixXQUFXLEVBQUUsRUFBRSxDQUFDLFdBQVc7Z0JBQzNCLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxnQkFBZ0I7Z0JBQ3JDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtnQkFDakIsc0JBQXNCLEVBQUUsTUFBQSxFQUFFLENBQUMsY0FBYywwQ0FBRSxRQUFRO2dCQUNuRCxVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVU7Z0JBQ3pCLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtnQkFDakIsZ0NBQWdDLEVBQUUsTUFBQSxFQUFFLENBQUMsY0FBYywwQ0FBRSxrQkFBa0I7Z0JBQ3ZFLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztnQkFDdkIsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPO2dCQUNuQixZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVk7Z0JBQzdCLFNBQVMsRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDekIsU0FBUyxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFO2FBQzVCLENBQUE7UUFDTCxDQUFDLENBQUE7UUFFRCxtQkFBYyxHQUFHLENBQU8sUUFBZ0IsRUFBRSxZQUEwQixFQUFpQixFQUFFO1lBQ25GLE1BQU0seUJBQXlCLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0RyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxJQUFJLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFBRSxPQUFNO1lBRWpHLE1BQU0sOEJBQThCLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0RBQWdELENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXBILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoRSxNQUFNLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakUsTUFBTSxrQkFBa0IsR0FBRyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ3BGLElBQUksQ0FBQyxrQkFBa0I7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5RUFBeUUsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFFMUksdUdBQXVHO2dCQUN2Ryx5RUFBeUU7Z0JBQ3pFLElBQUksa0JBQWtCLENBQUMscUJBQXFCLEtBQUssQ0FBQyxFQUFFO29CQUNoRCxJQUFJLGtCQUFrQixDQUFDLHFCQUFxQixLQUFLLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxxQkFBcUIsS0FBSyxHQUFHO3dCQUFFLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxxQkFBcUIsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFFOU8sZ0ZBQWdGO29CQUNoRixNQUFNLElBQUksbUNBQTBCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMscUJBQXFCLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUE7aUJBQzNJO2dCQUVELElBQUksa0JBQWtCLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLEtBQUssU0FBUztvQkFBRSxNQUFNLElBQUksa0NBQXlCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLEVBQUUsRUFBRSwyREFBMkQsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFcFIsSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQUUsT0FBTztnQkFFcEQsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNsSCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDL0QsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO2FBQ3JQO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUFFRCx1QkFBa0IsR0FBRyxDQUFPLFFBQWdCLEVBQUUsWUFBMEIsRUFBaUIsRUFBRTtZQUN2RixNQUFNLDhCQUE4QixHQUFHLE1BQU0sSUFBSSxDQUFDLGdEQUFnRCxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVwSCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsOEJBQThCLENBQUMsQ0FBQztZQUNySCxJQUFJLGFBQWEsR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsRSxNQUFNLDBCQUEwQixHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRTlHLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDcEMsSUFBSSxJQUFJLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7Z0JBQ3JELElBQUksQ0FBQyxJQUFJO29CQUFFLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2QsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxzQkFBc0IsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUN2RSxLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksYUFBYSxFQUFFO2dCQUMxQyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDeEYsSUFBSSxDQUFDLGlCQUFpQjtvQkFBRSxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBOztvQkFDOUQsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQTthQUNoRjtZQUVELE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3ZFLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxhQUFhLEVBQUU7Z0JBQzFDLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDeEQsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLFVBQVU7d0JBQUUsT0FBTyxJQUFJLENBQUM7b0JBQzdCLE1BQU0sU0FBUyxHQUFHLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxTQUFTLENBQUMsYUFBYSxFQUFFLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRTt3QkFBRSxPQUFPLElBQUksQ0FBQztvQkFDeEUsT0FBTyxLQUFLLENBQUM7Z0JBQ2pCLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUFFLFNBQVM7Z0JBQ3RDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUMvRztRQUNMLENBQUMsQ0FBQSxDQUFBO1FBRUQseUJBQW9CLEdBQUcsQ0FBTyxRQUFnQixFQUFFLFlBQTBCLEVBQUUsOEJBQTRELEVBQUUsRUFBRTtZQUN4SSxJQUFJLE1BQU0sR0FBMEIsRUFBRSxDQUFBO1lBQ3RDLElBQUksS0FBSyxHQUFHLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxHQUFHLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN6QixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE9BQU8sYUFBYSxFQUFFO2dCQUNsQixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsMEJBQTBCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRTtvQkFDNUYsUUFBUSxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUU7b0JBQy9CLE1BQU0sRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFO29CQUMzQixLQUFLLEVBQUUsUUFBUTtvQkFDZixLQUFLLEVBQUUsSUFBSTtvQkFDWCxjQUFjLEVBQUUsS0FBSztpQkFDeEIsQ0FBQyxDQUFDO2dCQUVILGFBQWEsR0FBRyxZQUFZLENBQUMsYUFBYSxLQUFLLE1BQU0sQ0FBQTtnQkFDckQsUUFBUSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUE7Z0JBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQUUsTUFBSztnQkFFOUUsWUFBWSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ25DLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUzt3QkFBRSxNQUFNLElBQUksa0NBQXlCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUscUNBQXFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUVqSyxNQUFNLFVBQVUsR0FBRyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO29CQUM5RSxJQUFJLENBQUMsVUFBVTt3QkFBRSxNQUFNLElBQUksa0NBQXlCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsc0VBQXNFLENBQUMsQ0FBQztvQkFFekwsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO2dCQUNoRSxDQUFDLENBQUMsQ0FBQTthQUNMO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFBLENBQUE7UUFFRCxtQkFBYyxHQUFHLENBQU8sbUJBQTJCLEVBQUUsVUFBb0IsRUFBcUIsRUFBRTtZQUM1RixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsbUNBQW1DLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsWUFBWTtnQkFBRSxPQUFPLEVBQUUsQ0FBQztZQUU3QixNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUE7WUFFbkYsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEMsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQixJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssR0FBRzt3QkFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUN0RDthQUNKO1lBRUQsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdDLElBQUk7d0JBQ0EsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvQixNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzFGO29CQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQ25CO2lCQUNKO2dCQUVELE1BQU0sR0FBRyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDcEQ7WUFFRCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywrQkFBK0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekcsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO1lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNqRCxNQUFNLEdBQUcsR0FBc0MsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RFLElBQUksR0FBRyxDQUFDLGFBQWEsS0FBSyxFQUFFLENBQUMsTUFBTTt3QkFDL0IsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7aUJBQ2hDO2FBQ0o7WUFDRCxPQUFPLFlBQVksQ0FBQTtRQUN2QixDQUFDLENBQUEsQ0FBQTtRQWxsQkcsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQztJQUNoRCxDQUFDO0NBK2tCSjtBQTFsQkQsMEJBMGxCQyJ9