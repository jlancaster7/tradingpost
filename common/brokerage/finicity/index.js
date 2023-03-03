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
        this.update = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            yield this.repository.execTx((r) => __awaiter(this, void 0, void 0, function* () {
                const finTransformer = new transformer_1.Transformer(r);
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
                    const finTransformer = new transformer_1.Transformer(r);
                    const portStats = new portfolio_summary_1.PortfolioSummaryService(r);
                    const finService = new Service(this.finicityApi, r, finTransformer, portStats);
                    console.log("Holdings");
                    yield finService.importHoldings(userId, finicityUser);
                    console.log("Transactions");
                    yield finService.importTransactions(userId, finicityUser);
                    console.log("COMPUTING !!!!");
                    // let hardCoded = [666, 667, 668]
                    // for (let i = 0; i < hardCoded.length; i++) {
                    //     const newAccountId = hardCoded[i];
                    //     // Don't compute some security types for historical holdings since we do not have pricing at the moment
                    //     console.log(newAccountId);
                    //     await finService.transformer.computeHoldingsHistory(newAccountId, true);
                    // }
                    console.log("FIN!");
                    //
                    // if (!finService.portSummarySrv) return
                    // await finService.portSummarySrv.computeAccountGroupSummary(userId);
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
                yield this.transformer.holdings(finicityUser.tpUserId, finicityUser.customerId, externalFinAccount.id, finicityHoldings, externalFinAccount.currency, externalFinAccount.detail);
            }
        });
        this.importTransactions = (tpUserId, finicityUser) => __awaiter(this, void 0, void 0, function* () {
            const externalFinAccToInternalAccMap = yield this._createExternalFinAccountToInternalFinAccountMap(finicityUser.id);
            const finicityTransactions = yield this._iterateTransactions(tpUserId, finicityUser, externalFinAccToInternalAccMap);
            yield this.repository.upsertFinicityTransactions(finicityTransactions);
            let txByAccountId = new Map();
            finicityTransactions.forEach(tx => {
                let accs = txByAccountId.get(tx.accountId.toString());
                if (!accs)
                    accs = [];
                accs.push(tx);
                txByAccountId.set(tx.accountId.toString(), accs);
            });
            for (const [accountId, txs] of txByAccountId) {
                yield this.transformer.transactions(finicityUser.tpUserId, finicityUser.customerId, txs, accountId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSw4Q0FRdUI7QUFRdkIsaUNBQStCO0FBQy9CLCtDQUFpRTtBQUNqRSw0REFBNkQ7QUFDN0Qsc0NBQXVHO0FBRXZHLE1BQWEsT0FBTztJQU1oQixZQUFZLFdBQXFCLEVBQUUsVUFBK0IsRUFBRSxXQUFnQyxFQUFFLHFCQUErQztRQU9ySixpQkFBaUI7UUFDakIsY0FBYztRQUNkLGlCQUFpQjtRQUNqQixhQUFhO1FBRU4saUNBQTRCLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZUFBdUIsRUFBRSxJQUFjLEVBQUUsSUFBVSxFQUFpQixFQUFFO1lBQy9ILE9BQU07UUFDVixDQUFDLENBQUEsQ0FBQTtRQUVNLFdBQU0sR0FBRyxDQUFPLE1BQWMsRUFBRSxlQUF1QixFQUFFLElBQWMsRUFBRSxJQUFVLEVBQWlCLEVBQUU7WUFDekcsTUFBTSxFQUFDLFFBQVEsRUFBQyxHQUFHLElBQW9GLENBQUM7WUFFeEcsSUFBSSxhQUFhLEdBQWEsRUFBRSxDQUFDO1lBQ2pDLElBQUksa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1lBRXRDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pCLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3hDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywrREFBK0QsQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsaUNBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEssSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO1lBQ2hDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFD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