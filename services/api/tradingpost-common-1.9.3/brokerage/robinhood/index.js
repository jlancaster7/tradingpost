"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const RHApi = __importStar(require("./api"));
const luxon_1 = require("luxon");
const interfaces_1 = require("../interfaces");
class Service {
    constructor(clientId, scope, expiresIn, repo, transformer, portfolioSummarySrv) {
        this.remove = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
        });
        this.calculatePortfolioStatistics = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            return;
        });
        this.add = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            const institution = yield this._repo.getInstitutionByName("Robinhood");
            if (!institution)
                throw new Error("Robinhood institution is not defined");
            const newAccountIds = yield this.accounts(userId, institution.id);
            yield this.positions(userId);
            yield this.transactions(userId);
            yield this._repo.addTradingPostAccountGroup(userId, 'default', newAccountIds, 10117);
            for (let i = 0; i < newAccountIds.length; i++) {
                yield this._transformer.computeHoldingsHistory(newAccountIds[i]);
            }
            yield this._portfolioSummaryService.computeAccountGroupSummary(userId);
        });
        this.update = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            const institution = yield this._repo.getInstitutionByName(interfaces_1.DirectBrokeragesType.Robinhood);
            if (!institution)
                throw new Error("Robinhood institution is not defined");
            yield this.accounts(userId, institution.id);
            yield this.positions(userId);
            yield this.transactions(userId);
            yield this._portfolioSummaryService.computeAccountGroupSummary(userId);
        });
        this._apiAndUpdate = (user, fnCall, params, nextUrl, authUpdate) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield fnCall(user.accessToken, params, nextUrl);
            }
            catch (e) {
                if (e instanceof RHApi.AuthError) {
                    if (authUpdate)
                        throw new Error("could not update authentication robinhood for account");
                    // Do update and recall API
                    const res = yield RHApi.refreshToken(this._clientId, user.deviceToken, user.refreshToken);
                    user.accessToken = res.access_token;
                    user.refreshToken = res.refresh_token;
                    yield this._repo.updateRobinhoodUser(user);
                    return this._apiAndUpdate(user, fnCall, params, nextUrl, true);
                }
                throw e;
            }
        });
        this.accounts = (userId, institutionId) => __awaiter(this, void 0, void 0, function* () {
            const robinhoodUser = yield this._repo.getRobinhoodUser(userId);
            if (robinhoodUser === null)
                throw new Error("Robinhood User Id Doesnt Exist");
            let [accounts, nextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.accounts, {});
            let transformedAccounts = yield this._transformAccounts(accounts, robinhoodUser.id);
            yield this._repo.upsertRobinhoodAccounts(transformedAccounts);
            let allTransformedAccounts = [...transformedAccounts];
            while (nextUrl !== null) {
                [accounts, nextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.accounts, {}, nextUrl);
                if (accounts.length <= 0)
                    break;
                transformedAccounts = yield this._transformAccounts(accounts, robinhoodUser.id);
                yield this._repo.upsertRobinhoodAccounts(transformedAccounts);
                allTransformedAccounts = [...allTransformedAccounts, ...transformedAccounts];
            }
            return yield this._transformer.accounts(userId, institutionId, robinhoodUser, transformedAccounts);
        });
        this.positions = (userId) => __awaiter(this, void 0, void 0, function* () {
            const robinhoodUser = yield this._repo.getRobinhoodUser(userId);
            if (robinhoodUser === null)
                throw new Error("Robinhood User Id Doesnt Exist");
            let instrumentsMap = {};
            let optionsMap = {};
            let accountMap = {};
            let internalAccountIds = {};
            (yield this._repo.getRobinhoodAccountsByRobinhoodUserId(robinhoodUser.id)).forEach(a => {
                accountMap[a.accountNumber] = a;
                internalAccountIds[a.id] = true;
            });
            let allPositions = [];
            let positions = [];
            let positionsNextUrl = null;
            while (true) {
                [positions, positionsNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.positions, {}, positionsNextUrl !== null ? positionsNextUrl : undefined);
                (yield this._repo.getRobinhoodInstrumentsByExternalId(positions.filter(p => p.instrument_id !== null).map(p => p.instrument_id))).forEach(res => instrumentsMap[res.externalId] = res);
                let transformedPositions = yield this._transformPositions(robinhoodUser, positions, accountMap, instrumentsMap);
                allPositions = [...allPositions, ...transformedPositions];
                if (positionsNextUrl === null)
                    break;
            }
            // Cash Positions
            let cashPositions = [];
            let cashNextUrl = null;
            const cashInstrument = yield this._repo.getRobinhoodInstrumentBySymbol('USD:CUR');
            if (cashInstrument === null)
                throw new Error("no cash instrument found in robinhood table");
            while (true) {
                [cashPositions, cashNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.accounts, {}, cashNextUrl === null ? undefined : cashNextUrl);
                let transformedCashPositions = yield this._transformCashPosition(cashPositions, accountMap, cashInstrument);
                allPositions = [...allPositions, ...transformedCashPositions];
                if (cashNextUrl === null)
                    break;
            }
            // Options Positions
            let optionPositions = [];
            let optionNextUrl = null;
            while (true) {
                [optionPositions, optionNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.optionPositions, {}, optionNextUrl === null ? undefined : optionNextUrl);
                (yield this._repo.getRobinhoodOptionsByExternalIds(optionPositions.filter(p => p.option_id !== null).map(p => p.option_id))).forEach(res => {
                    optionsMap[res.externalId] = res;
                });
                let transformedPositions = yield this._transformOptionPositions(robinhoodUser, optionPositions, accountMap, optionsMap);
                allPositions = [...allPositions, ...transformedPositions];
                if (optionNextUrl === null)
                    break;
            }
            // Delete all current positions
            yield this._repo.deleteRobinhoodAccountsPositions(Object.keys(internalAccountIds).map(a => parseInt(a)));
            // Upsert positions
            yield this._repo.upsertRobinhoodPositions(allPositions);
            yield this._transformer.positions(userId, allPositions);
        });
        this.transactions = (userId) => __awaiter(this, void 0, void 0, function* () {
            // TODO: Set a date and if used, then stop filtering transactions if exceeds this date
            const robinhoodUser = yield this._repo.getRobinhoodUser(userId);
            if (robinhoodUser === null)
                throw new Error("Robinhood User Id Doesnt Exist");
            const cash = yield this._repo.getRobinhoodInstrumentBySymbol("USD:CUR");
            if (!cash)
                throw new Error("could not find cash instrument for robinhood transactions");
            let instrumentsMap = {};
            let accountMap = {};
            let optionsMap = {};
            (yield this._repo.getRobinhoodAccountsByRobinhoodUserId(robinhoodUser.id)).forEach(a => accountMap[a.accountNumber] = a);
            let allTransactions = [];
            let equityTxs = [];
            let equityNextUrl = null;
            while (true) {
                [equityTxs, equityNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.orders, {}, equityNextUrl === null ? undefined : equityNextUrl);
                (yield this._repo.getRobinhoodInstrumentsByExternalId(equityTxs.filter(p => p.instrument_id !== null).map(p => p.instrument_id))).forEach(res => instrumentsMap[res.externalId] = res);
                let transformedPositions = yield this._transformTransactions(robinhoodUser, equityTxs, accountMap, instrumentsMap);
                allTransactions = [...allTransactions, ...transformedPositions];
                if (equityNextUrl === null)
                    break;
            }
            let optionTxs = [];
            let optionNextUrl = null;
            while (true) {
                [optionTxs, optionNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.optionOrders, {}, optionNextUrl === null ? undefined : optionNextUrl);
                let optionIds = {};
                optionTxs.forEach(ot => {
                    if (!ot.legs || ot.legs.length <= 0)
                        return;
                    ot.legs.forEach(l => {
                        if (!l.option)
                            return;
                        const oS = l.option.split("/");
                        optionIds[oS[oS.length - 2]] = null;
                    });
                });
                (yield this._repo.getRobinhoodOptionsByExternalIds(Object.keys(optionIds))).forEach(res => optionsMap[res.externalId] = res);
                let transformedOptions = yield this._transformOptionOrders(robinhoodUser, optionTxs, accountMap, optionsMap);
                allTransactions = [...allTransactions, ...transformedOptions];
                if (optionNextUrl === null)
                    break;
            }
            let dividendsTxs = [];
            let dividendNextUrl = null;
            while (true) {
                [dividendsTxs, dividendNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.dividends, {}, dividendNextUrl === null ? undefined : dividendNextUrl);
                let transformedDividends = yield this._transformDividends(dividendsTxs, accountMap, cash);
                allTransactions = [...allTransactions, ...transformedDividends];
                if (dividendNextUrl === null)
                    break;
            }
            // Money Transfers
            let achTxs = [];
            let achNextUrl = null;
            while (true) {
                [achTxs, achNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.achTransfers, {}, achNextUrl === null ? undefined : achNextUrl);
                let transformedAch = yield this._transformAch(achTxs, accountMap, cash);
                allTransactions = [...allTransactions, ...transformedAch];
                if (achNextUrl === null)
                    break;
            }
            // Sweeps(Interest Payments)
            let sweepTxs = [];
            let sweepNextUrl = null;
            while (true) {
                [sweepTxs, sweepNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.sweeps, {}, sweepNextUrl === null ? undefined : sweepNextUrl);
                let transformedSweeps = yield this._transformSweeps(sweepTxs, accountMap, cash);
                allTransactions = [...allTransactions, ...transformedSweeps];
                if (sweepNextUrl === null)
                    break;
            }
            let optionEvents = [];
            let optionEventsNextUrl = null;
            while (true) {
                [optionEvents, optionEventsNextUrl] = yield this._apiAndUpdate(robinhoodUser, RHApi.optionEvents, {}, optionEventsNextUrl === null ? undefined : optionEventsNextUrl);
                let transformedOptionsEvents = yield this._transformOptionEvents(robinhoodUser, optionEvents, accountMap, optionsMap);
                allTransactions = [...allTransactions, ...transformedOptionsEvents];
                if (optionEventsNextUrl === null)
                    break;
            }
            yield this._repo.upsertRobinhoodTransactions(allTransactions);
            yield this._transformer.transactions(userId, allTransactions);
        });
        this._transformDividends = (dividendTxs, accountMap, cash) => __awaiter(this, void 0, void 0, function* () {
            let transformed = [];
            for (let i = 0; i < dividendTxs.length; i++) {
                let d = dividendTxs[i];
                if (d.account === null)
                    throw new Error("no account for dividends");
                const accountSplit = d.account.split('/');
                const accountNumber = accountSplit[accountSplit.length - 2];
                const internalAccount = accountMap[accountNumber];
                transformed.push({
                    url: d.url,
                    type: "dividend",
                    executionsTimestamp: luxon_1.DateTime.fromFormat(d.payable_date, 'y-m-d'),
                    extendedHours: null,
                    trigger: null,
                    externalCreatedAt: d.record_date,
                    internalOptionId: null,
                    rejectReason: null,
                    stopPrice: null,
                    side: null,
                    refId: null,
                    ratioQuantity: null,
                    quantity: d.amount,
                    externalId: d.id,
                    processedQuantity: null,
                    price: "1",
                    positionUrl: null,
                    positionEffect: null,
                    optionLegId: null,
                    pendingQuantity: null,
                    lastTransactionAt: null,
                    investmentScheduleId: null,
                    internalInstrumentId: cash.id,
                    internalAccountId: internalAccount.id,
                    instrumentId: cash.externalId,
                    fees: null,
                    externalUpdatedAt: null,
                    instrumentUrl: cash.url,
                    executionsQuantity: parseFloat(d.amount),
                    executionsSettlementDate: d.payable_date,
                    executionsPrice: 1,
                    executionsId: d.id,
                    dollarBasedAmount: null,
                    direction: null,
                    cumulativeQuantity: null,
                    chainSymbol: null,
                    cancelUrl: null,
                    canceledQuantity: null,
                    averagePrice: null,
                    state: d.state,
                    accountNumber: accountNumber,
                    chainId: null,
                    cancel: null,
                    accountUrl: internalAccount.url,
                    cashDividendId: d.cash_dividend_id,
                    achRelationship: null,
                    expectedLandingDate: null,
                    position: d.position,
                    withholding: d.withholding,
                    rate: d.rate,
                    expectedLandingDateTime: null,
                });
            }
            return transformed;
        });
        this._transformSweeps = (sweeps, accountMap, cash) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let transformedTxs = [];
            for (let i = 0; i < sweeps.length; i++) {
                const s = sweeps[i];
                if (s.account_number === null)
                    throw new Error("no account number found for sweep");
                const internalAccount = accountMap[s.account_number];
                transformedTxs.push({
                    url: '',
                    state: null,
                    accountUrl: internalAccount.url,
                    type: "interest",
                    cancel: null,
                    chainId: null,
                    accountNumber: s.account_number,
                    averagePrice: null,
                    canceledQuantity: null,
                    cancelUrl: null,
                    chainSymbol: null,
                    cumulativeQuantity: null,
                    direction: s.direction,
                    dollarBasedAmount: null,
                    executionsId: s.id,
                    executionsPrice: 1,
                    executionsSettlementDate: s.pay_date,
                    executionsQuantity: parseFloat((_a = s.amount) === null || _a === void 0 ? void 0 : _a.amount),
                    instrumentUrl: cash.url,
                    fees: null,
                    externalUpdatedAt: null,
                    instrumentId: cash.externalId,
                    internalAccountId: internalAccount.id,
                    internalInstrumentId: cash.id,
                    investmentScheduleId: null,
                    lastTransactionAt: null,
                    pendingQuantity: null,
                    optionLegId: null,
                    positionEffect: null,
                    positionUrl: null,
                    price: "1",
                    processedQuantity: null,
                    externalId: s.id,
                    quantity: s.amount ? s.amount.amount : null,
                    ratioQuantity: null,
                    refId: null,
                    side: null,
                    stopPrice: null,
                    rejectReason: null,
                    trigger: null,
                    internalOptionId: null,
                    externalCreatedAt: null,
                    extendedHours: null,
                    executionsTimestamp: luxon_1.DateTime.fromISO(s.pay_date),
                    expectedLandingDateTime: null,
                    rate: null,
                    withholding: null,
                    position: null,
                    expectedLandingDate: null,
                    achRelationship: null,
                    cashDividendId: null,
                });
            }
            return transformedTxs;
        });
        this._transformAch = (achTxs, accountMap, cash) => __awaiter(this, void 0, void 0, function* () {
            let transformed = [];
            for (let i = 0; i < achTxs.length; i++) {
                const ach = achTxs[i];
                const accountUrl = ach.account;
                if (!accountUrl)
                    throw new Error("no account number found for account for ach");
                const accountUrlSplit = accountUrl.split("/");
                const accountNumber = accountUrlSplit[accountUrlSplit.length - 2];
                const internalAccount = accountMap[accountNumber];
                transformed.push({
                    url: ach.url,
                    type: "cash",
                    accountUrl: ach.account,
                    cancel: ach.cancel,
                    state: ach.state,
                    accountNumber: accountNumber,
                    chainId: null,
                    averagePrice: null,
                    canceledQuantity: null,
                    cancelUrl: ach.cancel,
                    chainSymbol: null,
                    cumulativeQuantity: null,
                    direction: ach.direction,
                    dollarBasedAmount: null,
                    executionsId: ach.id,
                    executionsPrice: 1,
                    executionsQuantity: parseFloat(ach.amount),
                    executionsTimestamp: luxon_1.DateTime.fromISO(ach.expected_landing_datetime),
                    executionsSettlementDate: ach.expected_landing_date,
                    fees: ach.fees,
                    extendedHours: null,
                    externalId: ach.id,
                    instrumentUrl: cash.url,
                    externalCreatedAt: ach.created_at,
                    externalUpdatedAt: ach.updated_at,
                    instrumentId: cash.externalId,
                    internalAccountId: internalAccount.id,
                    internalInstrumentId: cash.id,
                    internalOptionId: null,
                    investmentScheduleId: ach.investment_schedule_id,
                    lastTransactionAt: null,
                    optionLegId: null,
                    pendingQuantity: null,
                    positionEffect: null,
                    positionUrl: null,
                    price: "1",
                    processedQuantity: null,
                    quantity: ach.amount,
                    ratioQuantity: null,
                    refId: ach.ref_id,
                    side: null,
                    rejectReason: null,
                    stopPrice: null,
                    trigger: null,
                    cashDividendId: null,
                    achRelationship: ach.ach_relationship,
                    expectedLandingDate: ach.expected_landing_date,
                    position: null,
                    withholding: null,
                    rate: null,
                    expectedLandingDateTime: ach.expected_landing_datetime
                });
            }
            return transformed;
        });
        this._addOption = (robinhoodUser, externalOptionId) => __awaiter(this, void 0, void 0, function* () {
            const option = yield this._apiAndUpdate(robinhoodUser, RHApi.option, { optionId: externalOptionId });
            const transformedOption = yield this._transformOption(robinhoodUser, option);
            if (transformedOption === null) {
                console.warn("could not transform option");
                return null;
            }
            const optionId = yield this._repo.upsertRobinhoodOption(transformedOption);
            if (optionId === null) {
                console.warn("could not add option to database");
                return null;
            }
            return Object.assign(Object.assign({}, transformedOption), { id: optionId, createdAt: luxon_1.DateTime.now(), updatedAt: luxon_1.DateTime.now() });
        });
        this._transformOption = (robinhoodUser, option) => __awaiter(this, void 0, void 0, function* () {
            if (option.chain_symbol === null) {
                console.warn("no chain symbol");
                return null;
            }
            let security = yield this._repo.getRobinhoodInstrumentBySymbol(option.chain_symbol);
            if (security === null) {
                const newSecurity = yield this._apiAndUpdate(robinhoodUser, RHApi.instruments, { symbol: option.chain_symbol });
                if (newSecurity === null) {
                    console.warn("could not find new security for option chain symbol");
                    return null;
                }
                const [newInstrument] = yield this._transformInstrument([newSecurity]);
                const instrumentId = yield this._repo.addRobinhoodInstrument(newInstrument);
                security = Object.assign(Object.assign({}, newInstrument), { id: instrumentId, createdAt: luxon_1.DateTime.now(), updatedAt: luxon_1.DateTime.now() });
            }
            if (option.strike_price === null)
                throw new Error("no strike price set");
            if (option.expiration_date === null)
                throw new Error("no expiration date on option");
            if (option.type === null)
                throw new Error("no option type");
            return {
                url: option.url,
                type: option.type,
                chainId: option.chain_id,
                chainSymbol: option.chain_symbol,
                expirationDate: luxon_1.DateTime.fromFormat(option.expiration_date, "y-m-d"),
                externalCreatedAt: option.created_at,
                externalUpdatedAt: option.updated_at,
                externalId: option.id,
                internalInstrumentId: security.id,
                issueDate: option.issue_date,
                longStrategyCode: option.long_strategy_code,
                minTicksAboveTick: option.min_ticks ? option.min_ticks.above_tick : null,
                state: option.state,
                minTicksBelowTick: option.min_ticks ? option.min_ticks.below_tick : null,
                minTicksCutoffPrice: option.min_ticks ? option.min_ticks.cutoff_price : null,
                rhsTradability: option.rhs_tradability,
                selloutDateTime: option.sellout_datetime,
                shortStrategyCode: option.short_strategy_code,
                strikePrice: parseFloat(option.strike_price),
                tradability: option.tradability,
            };
        });
        this._addInstrument = (robinhoodUser, externalInstrumentId) => __awaiter(this, void 0, void 0, function* () {
            const instrument = yield this._apiAndUpdate(robinhoodUser, RHApi.instrument, { instrumentId: externalInstrumentId });
            const [transformedInstrument] = yield this._transformInstrument([instrument]);
            const instrumentId = yield this._repo.addRobinhoodInstrument(transformedInstrument);
            return Object.assign(Object.assign({}, transformedInstrument), { id: instrumentId, createdAt: luxon_1.DateTime.now(), updatedAt: luxon_1.DateTime.now() });
        });
        this._transformAccounts = (accs, userId) => __awaiter(this, void 0, void 0, function* () {
            return accs.map(a => {
                let x = {
                    url: a.url,
                    withdrawlHalted: a.withdrawal_halted,
                    userUrl: a.user,
                    unsettledFunds: a.unsettled_funds,
                    unsettledDebit: a.unsettled_debit,
                    unclearedDeposits: a.uncleared_deposits,
                    smaHeldForOrders: a.sma_held_for_orders,
                    portfolioCash: a.portfolio_cash,
                    sma: a.sma,
                    onbp: a.onbp,
                    onlyPositionClosingTrades: a.only_position_closing_trades,
                    maxAchEarlyAccessAmount: a.max_ach_early_access_amount,
                    externalUpdatedAt: a.updated_at,
                    externalCreatedAt: a.created_at,
                    depositHalted: a.deposit_halted,
                    type: a.type,
                    deactivated: a.deactivated,
                    cryptoBuyingPower: a.crypto_buying_power,
                    cashHeldForOrders: a.cash_held_for_orders,
                    cashBalances: a.cash_balances,
                    cash: a.cash,
                    cashAvailableForWithdrawl: a.cash_available_for_withdrawal,
                    canDowngradeToCashUrl: a.can_downgrade_to_cash,
                    buyingPower: a.buying_power,
                    brokerageAccountType: a.brokerage_account_type,
                    userId: userId,
                    accountNumber: a.account_number,
                    amountEligibleForDepositCancellation: a.amount_eligible_for_deposit_cancellation,
                };
                return x;
            });
        });
        this._transformInstrument = (is) => __awaiter(this, void 0, void 0, function* () {
            return is.map(i => {
                let x = {
                    externalId: i.id,
                    allDayTradability: i.all_day_tradability,
                    internalHaltSource: i.internal_halt_source,
                    internalHaltEndTime: i.internal_halt_end_time,
                    internalHaltStartTime: i.internal_halt_start_time,
                    internalHaltSessions: i.internal_halt_sessions,
                    internalHaltDetails: i.internal_halt_details,
                    internalHaltReason: i.internal_halt_reason,
                    isTest: i.is_test,
                    isSpac: i.is_spac,
                    type: i.type,
                    extendedHoursFractionalTradability: i.extended_hours_fractional_tradability,
                    ipoAccessSupportsDsp: i.ipo_access_supports_dsp,
                    ipoRoadshowUrl: i.ipo_roadshow_url,
                    ipoS1Url: i.ipo_s1_url,
                    ipoAccessCobDeadline: i.ipo_access_cob_deadline,
                    ipoAccessStatus: i.ipo_access_status,
                    defaultCollarFraction: i.default_collar_fraction,
                    fractionalTradability: i.fractional_tradability,
                    rhsTradability: i.rhs_tradability,
                    tradeableChainId: i.tradeable_chain_id,
                    minTickSize: i.min_tick_size,
                    listDate: i.list_date,
                    dayTradeRatio: i.day_trade_ratio,
                    country: i.country,
                    maintenanceRatio: i.maintenance_ratio,
                    marginInitialRatio: i.margin_initial_ratio,
                    bloombergUnique: i.bloomberg_unique,
                    tradability: i.tradability,
                    tradeable: i.tradeable,
                    name: i.name,
                    marketUrl: i.market,
                    state: i.state,
                    splitsUrl: i.splits,
                    symbol: i.symbol,
                    fundamentalsUrl: i.fundamentals,
                    quoteUrl: i.quote,
                    url: i.url,
                };
                return x;
            });
        });
        this._transformCashPosition = (cashPositions, accountMap, cashInstrument) => __awaiter(this, void 0, void 0, function* () {
            let transformedPositions = [];
            for (let i = 0; i < cashPositions.length; i++) {
                const cp = cashPositions[i];
                if (cp.account_number === null) {
                    console.warn("account number for cash is null");
                    continue;
                }
                let internalAccount = accountMap[cp.account_number];
                if (internalAccount === null) {
                    console.warn("could not find internal account for cash position");
                    continue;
                }
                transformedPositions.push({
                    quantity: cp.cash,
                    url: cashInstrument.url,
                    type: 'cash',
                    externalId: null,
                    externalOptionId: null,
                    chainSymbol: null,
                    internalOptionId: null,
                    chainId: null,
                    averagePrice: "1",
                    intradayAverageOpenPrice: null,
                    pendingAssignmentQuantity: null,
                    pendingBuyQuantity: null,
                    pendingExcerciseQuantity: null,
                    pendingExpirationQuantity: null,
                    pendingExpiredQuantity: null,
                    pendingSellQuantity: null,
                    tradeValueMultiplier: null,
                    accountNumber: cp.account_number,
                    accountUrl: cp.url,
                    averageBuyPrice: null,
                    avgCostAffected: null,
                    avgCostAffectedReason: null,
                    externalCreatedAt: null,
                    externalUpdatedAt: null,
                    instrumentId: null,
                    instrumentUrl: null,
                    internalAccountId: internalAccount.id,
                    internalInstrumentId: cashInstrument.id,
                    intradayAverageBuyPrice: null,
                    intradayQuantity: null,
                    ipoAllocatedQuantity: null,
                    ipoDspAllocatedQuantity: null,
                    isPrimaryAccount: cp.is_pinnacle_account !== null,
                    pendingAverageBuyPrice: null,
                    sharesAvailableForExercise: null,
                    sharesHeldForBuys: null,
                    sharesHeldForSells: null,
                    sharesHeldForStockGrants: null
                });
            }
            return transformedPositions;
        });
        this._transformOptionPositions = (robinhoodUser, optionPosition, accountMap, optionMap) => __awaiter(this, void 0, void 0, function* () {
            let transformedOptions = [];
            for (let i = 0; i < optionPosition.length; i++) {
                const op = optionPosition[i];
                if (op.quantity === null || parseFloat(op.quantity) === 0) {
                    continue;
                }
                if (op.account_number === null) {
                    console.warn("account number is null");
                    continue;
                }
                if (op.option_id === null) {
                    console.warn("option id is null");
                    continue;
                }
                let internalAccount = accountMap[op.account_number];
                if (internalAccount === null) {
                    console.warn("account number not found");
                    continue;
                }
                if (parseFloat(op.quantity) === 0)
                    continue;
                if (!(op.option_id in optionMap)) {
                    const newOption = yield this._addOption(robinhoodUser, op.option_id);
                    if (newOption === null) {
                        console.warn("could not add option");
                        continue;
                    }
                    optionMap[newOption.externalId] = newOption;
                }
                let internalOption = optionMap[op.option_id];
                transformedOptions.push({
                    url: internalOption.url,
                    sharesHeldForStockGrants: null,
                    sharesHeldForSells: null,
                    sharesHeldForBuys: null,
                    quantity: op.quantity,
                    externalId: op.id,
                    externalOptionId: op.option_id,
                    sharesAvailableForExercise: null,
                    pendingAverageBuyPrice: null,
                    isPrimaryAccount: null,
                    ipoDspAllocatedQuantity: null,
                    ipoAllocatedQuantity: null,
                    intradayQuantity: op.intraday_quantity,
                    intradayAverageBuyPrice: op.intraday_average_open_price,
                    internalInstrumentId: internalOption.internalInstrumentId,
                    type: op.type,
                    internalAccountId: internalAccount.id,
                    instrumentUrl: null,
                    instrumentId: null,
                    externalUpdatedAt: op.updated_at,
                    externalCreatedAt: op.created_at,
                    avgCostAffectedReason: null,
                    chainId: op.chain_id,
                    chainSymbol: op.chain_symbol,
                    avgCostAffected: null,
                    averageBuyPrice: null,
                    accountUrl: op.account,
                    internalOptionId: internalOption.id,
                    accountNumber: op.account_number,
                    averagePrice: op.average_price || "1",
                    intradayAverageOpenPrice: op.intraday_average_open_price,
                    pendingAssignmentQuantity: op.pending_assignment_quantity,
                    pendingBuyQuantity: op.pending_buy_quantity,
                    pendingExcerciseQuantity: op.pending_excercise_quantity,
                    pendingExpirationQuantity: op.pending_expiration_quantity,
                    pendingExpiredQuantity: op.pending_expired_quantity,
                    pendingSellQuantity: op.pending_sell_quantity,
                    tradeValueMultiplier: op.trade_value_multiplier,
                });
            }
            return transformedOptions;
        });
        this._transformOptionEvents = (robinhoodUser, optionEvents, accountMap, optionMap) => __awaiter(this, void 0, void 0, function* () {
            let transformedTxs = [];
            for (let i = 0; i < optionEvents.length; i++) {
                let oe = optionEvents[i];
                if (oe.account_number === null) {
                    console.warn("no account number for option");
                    continue;
                }
                const internalAccount = accountMap[oe.account_number];
                const optionSplit = oe.option.split("/");
                const optionNumber = optionSplit[optionSplit.length - 2];
                if (!(optionNumber in optionMap)) {
                    const newOption = yield this._addOption(robinhoodUser, optionNumber);
                    if (newOption === null) {
                        console.warn("could not add option");
                        continue;
                    }
                    optionMap[newOption.externalId] = newOption;
                }
                const internalOption = optionMap[optionNumber];
                const expiredTimestamp = luxon_1.DateTime.fromISO(oe.created_at);
                transformedTxs.push({
                    url: oe.option,
                    executionsTimestamp: expiredTimestamp,
                    extendedHours: null,
                    externalCreatedAt: oe.created_at,
                    trigger: null,
                    internalOptionId: internalOption.id,
                    rejectReason: null,
                    stopPrice: null,
                    side: oe.direction,
                    refId: oe.source_ref_id,
                    ratioQuantity: null,
                    quantity: oe.quantity,
                    externalId: oe.id,
                    processedQuantity: null,
                    price: oe.underlying_price,
                    positionUrl: oe.position,
                    positionEffect: null,
                    optionLegId: null,
                    pendingQuantity: null,
                    lastTransactionAt: null,
                    investmentScheduleId: null,
                    internalInstrumentId: internalOption.internalInstrumentId,
                    type: oe.type,
                    internalAccountId: internalAccount.id,
                    instrumentId: null,
                    fees: null,
                    externalUpdatedAt: oe.updated_at,
                    instrumentUrl: null,
                    executionsSettlementDate: oe.event_date,
                    executionsQuantity: parseFloat(oe.quantity),
                    executionsPrice: parseFloat(oe.underlying_price),
                    executionsId: oe.id,
                    dollarBasedAmount: null,
                    direction: oe.direction,
                    cumulativeQuantity: oe.quantity,
                    chainSymbol: internalOption.chainSymbol,
                    cancelUrl: null,
                    canceledQuantity: null,
                    averagePrice: null,
                    chainId: internalOption.chainId,
                    accountNumber: oe.account_number,
                    state: oe.state,
                    cancel: null,
                    accountUrl: internalAccount.url,
                    rate: null,
                    cashDividendId: null,
                    expectedLandingDateTime: null,
                    achRelationship: null,
                    expectedLandingDate: null,
                    position: oe.position,
                    withholding: null,
                });
            }
            return transformedTxs;
        });
        this._transformOptionOrders = (robinhoodUser, optionOrders, accountMap, optionMap) => __awaiter(this, void 0, void 0, function* () {
            let transformedTxs = [];
            for (let i = 0; i < optionOrders.length; i++) {
                let oo = optionOrders[i];
                if (oo.account_number === null) {
                    console.warn("no account number for option");
                    continue;
                }
                if (oo.legs === null || oo.legs.length === 0) {
                    console.warn("no legs for option");
                    continue;
                }
                if (oo.quantity === null || parseFloat(oo.quantity) === 0)
                    continue;
                const internalAccount = accountMap[oo.account_number];
                for (let j = 0; j < oo.legs.length; j++) {
                    const leg = oo.legs[j];
                    if (leg.option === null) {
                        console.warn("could not find option");
                        continue;
                    }
                    if (leg.executions === null || leg.executions.length <= 0)
                        continue;
                    const optionSplit = leg.option.split("/");
                    const optionNumber = optionSplit[optionSplit.length - 2];
                    if (!(optionNumber in optionMap)) {
                        const newOption = yield this._addOption(robinhoodUser, optionNumber);
                        if (newOption === null) {
                            console.warn("could not add option");
                            continue;
                        }
                        optionMap[newOption.externalId] = newOption;
                    }
                    const internalOption = optionMap[optionNumber];
                    for (let k = 0; k < leg.executions.length; k++) {
                        const execution = leg.executions[k];
                        if (execution.timestamp === null)
                            throw new Error("execution timestamp missing");
                        const executionTimestamp = luxon_1.DateTime.fromISO(execution.timestamp);
                        transformedTxs.push({
                            url: leg.option,
                            executionsTimestamp: executionTimestamp,
                            extendedHours: null,
                            externalCreatedAt: '',
                            trigger: oo.trigger,
                            internalOptionId: internalOption.id,
                            rejectReason: null,
                            stopPrice: oo.stop_price,
                            side: leg.side,
                            refId: oo.ref_id,
                            ratioQuantity: leg.ratio_quantity,
                            quantity: oo.quantity,
                            externalId: oo.id,
                            processedQuantity: oo.processed_quantity,
                            price: oo.price,
                            positionUrl: null,
                            positionEffect: leg.position_effect,
                            optionLegId: leg.id,
                            pendingQuantity: oo.pending_quantity,
                            lastTransactionAt: null,
                            investmentScheduleId: null,
                            internalInstrumentId: internalOption.internalInstrumentId,
                            type: oo.type,
                            internalAccountId: internalAccount.id,
                            instrumentId: null,
                            fees: null,
                            externalUpdatedAt: oo.updated_at,
                            instrumentUrl: null,
                            executionsSettlementDate: execution.settlement_date,
                            executionsQuantity: parseFloat(execution.quantity),
                            executionsPrice: parseFloat(execution.price),
                            executionsId: execution.id,
                            dollarBasedAmount: null,
                            direction: oo.direction,
                            cumulativeQuantity: null,
                            chainSymbol: oo.chain_symbol,
                            cancelUrl: oo.cancel_url,
                            canceledQuantity: oo.canceled_quantity,
                            averagePrice: null,
                            chainId: oo.chain_id,
                            accountNumber: oo.account_number,
                            state: oo.state,
                            cancel: oo.cancel_url,
                            accountUrl: internalAccount.url,
                            rate: null,
                            cashDividendId: null,
                            expectedLandingDateTime: null,
                            achRelationship: null,
                            expectedLandingDate: null,
                            position: null,
                            withholding: null,
                        });
                    }
                }
            }
            return transformedTxs;
        });
        this._transformPositions = (robinhoodUser, positions, accountMap, instrumentMap) => __awaiter(this, void 0, void 0, function* () {
            let transformedPositions = [];
            for (let i = 0; i < positions.length; i++) {
                const p = positions[i];
                if (p.account_number === null) {
                    console.warn("account number is null");
                    continue;
                }
                if (p.instrument_id === null) {
                    console.warn("instrument id is null");
                    continue;
                }
                if (p.quantity === null || parseFloat(p.quantity) === 0)
                    continue;
                let internalAccount = accountMap[p.account_number];
                if (!(p.instrument_id in instrumentMap)) {
                    const instrument = yield this._addInstrument(robinhoodUser, p.instrument_id);
                    instrumentMap[instrument.externalId] = instrument;
                }
                let internalInstrument = instrumentMap[p.instrument_id];
                transformedPositions.push({
                    internalAccountId: internalAccount.id,
                    internalInstrumentId: internalInstrument.id,
                    url: p.url ? p.url : '',
                    accountNumber: p.account_number,
                    accountUrl: p.account,
                    averageBuyPrice: p.average_buy_price,
                    avgCostAffected: p.avg_cost_affected,
                    avgCostAffectedReason: p.avg_cost_affected_reason,
                    externalCreatedAt: p.created_at,
                    externalUpdatedAt: p.updated_at,
                    instrumentId: p.instrument_id,
                    instrumentUrl: p.instrument,
                    intradayAverageBuyPrice: p.intraday_average_buy_price,
                    intradayQuantity: p.intraday_quantity,
                    ipoAllocatedQuantity: p.ipo_allocated_quantity,
                    ipoDspAllocatedQuantity: p.ipo_dsp_allocated_quantity,
                    isPrimaryAccount: p.is_primary_account,
                    pendingAverageBuyPrice: p.pending_average_buy_price,
                    quantity: p.quantity || "0",
                    sharesAvailableForExercise: p.shares_available_for_exercise,
                    sharesHeldForBuys: p.shares_held_for_buys,
                    sharesHeldForSells: p.shares_held_for_sells,
                    sharesHeldForStockGrants: p.shares_held_for_stock_grants,
                    tradeValueMultiplier: null,
                    pendingSellQuantity: null,
                    pendingExpiredQuantity: null,
                    pendingExpirationQuantity: null,
                    pendingExcerciseQuantity: null,
                    pendingBuyQuantity: null,
                    pendingAssignmentQuantity: null,
                    intradayAverageOpenPrice: null,
                    chainId: null,
                    averagePrice: p.average_buy_price || "1",
                    internalOptionId: null,
                    chainSymbol: null,
                    type: null,
                    externalOptionId: null,
                    externalId: null,
                });
            }
            return transformedPositions;
        });
        this._transformTransactions = (robinhoodUser, transactions, accountMap, instrumentMap) => __awaiter(this, void 0, void 0, function* () {
            let transformedTxs = [];
            for (let i = 0; i < transactions.length; i++) {
                const tx = transactions[i];
                if (tx.account === null) {
                    console.warn("no account url");
                    continue;
                }
                if (tx.instrument_id === null) {
                    console.warn("no instrument id");
                    continue;
                }
                if (tx.quantity === null || parseFloat(tx.quantity) === 0)
                    continue;
                const accountUrlSplit = tx.account.split("/");
                const accountNumber = accountUrlSplit[accountUrlSplit.length - 2];
                let internalAccount = accountMap[accountNumber];
                if (!internalAccount)
                    throw new Error("no internal account for account id: " + tx.account);
                if (!(tx.instrument_id in instrumentMap)) {
                    const instrument = yield this._addInstrument(robinhoodUser, tx.instrument_id);
                    instrumentMap[instrument.externalId] = instrument;
                }
                let internalInstrument = instrumentMap[tx.instrument_id];
                if (tx.executions === null)
                    continue;
                for (let j = 0; j < tx.executions.length; j++) {
                    const ex = tx.executions[j];
                    if (ex.timestamp === null)
                        throw new Error("no timestamp for execution");
                    const executionsTimestamp = luxon_1.DateTime.fromISO(ex.timestamp);
                    transformedTxs.push({
                        instrumentId: tx.instrument,
                        accountUrl: tx.account,
                        url: tx.url,
                        type: tx.type,
                        averagePrice: tx.average_price,
                        cancel: tx.cancel,
                        state: tx.state,
                        cumulativeQuantity: tx.cumulative_quantity,
                        dollarBasedAmount: tx.dollar_based_amount,
                        internalInstrumentId: internalInstrument.id,
                        executionsId: ex.id,
                        executionsPrice: parseFloat(ex.price),
                        executionsQuantity: parseFloat(ex.quantity),
                        externalId: tx.id,
                        executionsSettlementDate: ex.settlement_date,
                        executionsTimestamp: executionsTimestamp,
                        extendedHours: tx.extended_hours,
                        externalCreatedAt: tx.created_at,
                        externalUpdatedAt: tx.updated_at,
                        fees: tx.fees ? (parseFloat(tx.fees) / tx.executions.length).toString() : null,
                        instrumentUrl: tx.instrument,
                        internalAccountId: internalAccount.id,
                        rejectReason: tx.reject_reason,
                        investmentScheduleId: tx.investment_schedule_id,
                        lastTransactionAt: tx.last_transaction_at,
                        price: tx.price,
                        quantity: tx.quantity,
                        positionUrl: tx.position,
                        refId: tx.ref_id,
                        side: tx.side,
                        stopPrice: tx.stop_price,
                        trigger: tx.trigger,
                        internalOptionId: null,
                        accountNumber: accountNumber,
                        chainId: null,
                        canceledQuantity: null,
                        cancelUrl: null,
                        chainSymbol: null,
                        direction: null,
                        optionLegId: null,
                        pendingQuantity: null,
                        positionEffect: null,
                        processedQuantity: null,
                        ratioQuantity: null,
                        rate: null,
                        expectedLandingDateTime: null,
                        withholding: null,
                        position: tx.position,
                        expectedLandingDate: null,
                        achRelationship: null,
                        cashDividendId: null,
                    });
                }
            }
            return transformedTxs;
        });
        this._clientId = clientId;
        this._scope = scope;
        this._expiresIn = expiresIn;
        this._transformer = transformer;
        this._repo = repo;
        this._portfolioSummaryService = portfolioSummarySrv;
    }
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVlBLDZDQUErQjtBQUMvQixpQ0FBK0I7QUFDL0IsOENBQWdGO0FBZ0NoRixNQUFhLE9BQU87SUFRaEIsWUFBWSxRQUFnQixFQUFFLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQWdCLEVBQUUsV0FBaUMsRUFBRSxtQkFBNEM7UUFTMUosV0FBTSxHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBaUIsRUFBRTtRQUU3RyxDQUFDLENBQUEsQ0FBQTtRQUVNLGlDQUE0QixHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBaUIsRUFBRTtZQUMvSCxPQUFNO1FBQ1YsQ0FBQyxDQUFBLENBQUE7UUFFTSxRQUFHLEdBQUcsQ0FBTyxNQUFjLEVBQUUsZUFBdUIsRUFBRSxJQUFjLEVBQUUsSUFBVSxFQUFFLEVBQUU7WUFDdkYsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxXQUFXO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUUxRSxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxLQUFLLENB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