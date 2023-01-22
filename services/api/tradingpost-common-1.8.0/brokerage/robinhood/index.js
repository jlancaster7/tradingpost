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
        this.add = (userId, brokerageUserId, date, data) => __awaiter(this, void 0, void 0, function* () {
            const institution = yield this._repo.getInstitutionByName("Robinhood");
            if (!institution)
                throw new Error("Robinhood institution is not defined");
            yield this.accounts(userId, institution.id);
            yield this.positions(userId);
            yield this.transactions(userId);
            const tpAccounts = yield this._repo.getTradingPostBrokerageAccountsByBrokerage(userId, interfaces_1.DirectBrokeragesType.Robinhood);
            for (let i = 0; i < tpAccounts.length; i++) {
                const tpAccount = tpAccounts[i];
                yield this._transformer.computeHoldingsHistory(tpAccount.id);
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
            yield this._transformer.accounts(userId, institutionId, robinhoodUser, transformedAccounts);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVlBLDZDQUErQjtBQUMvQixpQ0FBK0I7QUFDL0IsOENBQW1IO0FBa0NuSCxNQUFhLE9BQU87SUFRaEIsWUFBWSxRQUFnQixFQUFFLEtBQWEsRUFBRSxTQUFpQixFQUFFLElBQWdCLEVBQUUsV0FBaUMsRUFBRSxtQkFBNEM7UUFTMUosUUFBRyxHQUFHLENBQU8sTUFBYyxFQUFFLGVBQXVCLEVBQUUsSUFBYyxFQUFFLElBQVUsRUFBRSxFQUFFO1lBQ3ZGLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsV0FBVztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFFMUUsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoQyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsTUFBTSxFQUFFLGlDQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsRUFBRSxD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