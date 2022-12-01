import Transformer from "./transformer";
import {PortfolioSummaryService} from "../portfolio-summary";
import {
    Account,
    Instrument, Option, OptionPosition,
    Order,
    Position,
    RobinhoodAccount,
    RobinhoodAccountTable, RobinhoodInstrument, RobinhoodInstrumentTable, RobinhoodOption, RobinhoodOptionTable,
    RobinhoodPosition,
    RobinhoodTransaction, RobinhoodUserTable
} from "./interfaces";
import Api from "./api";
import {DateTime} from "luxon";

interface Repository {
    getRobinhoodUser(userId: string): Promise<RobinhoodUserTable | null>

    upsertRobinhoodAccounts(accs: RobinhoodAccount[]): Promise<void>

    upsertRobinhoodPositions(positions: RobinhoodPosition[]): void

    addRobinhoodInstrument(instrument: RobinhoodInstrument): Promise<number>

    getRobinhoodInstrumentsByExternalId(instrumentIds: string[]): Promise<RobinhoodInstrumentTable[]>

    getRobinhoodInstrumentBySymbol(symbol: string): Promise<RobinhoodInstrumentTable | null>

    getRobinhoodAccountsByRobinhoodUserId(userId: number): Promise<RobinhoodAccountTable[]>

    deleteRobinhoodAccountsPositions(accountIds: number[]): Promise<void>

    upsertRobinhoodTransactions(txs: RobinhoodTransaction[]): Promise<void>

    upsertRobinhoodOptions(options: RobinhoodOption[]): Promise<void>

    upsertRobinhoodOption(option: RobinhoodOption): Promise<number | null>

    getRobinhoodOptionsByExternalIds(externalIds: string[]): Promise<RobinhoodOptionTable[]>
}

export default class Service {
    private _transformer: Transformer;
    private _repo: Repository;
    private _api: Api;
    private _portfolioSummaryService: PortfolioSummaryService;

    constructor(api: Api, repo: Repository, transformer: Transformer, portfolioSummarySrv: PortfolioSummaryService) {
        this._api = api;
        this._transformer = transformer;
        this._repo = repo;
        this._portfolioSummaryService = portfolioSummarySrv;
    }

    firstIngestion = () => {
        // Run all the below limiting to today and update accordingly
        // If a request fails because of an error on HTTP, fetch token, update, and retry
        // We should create a basic Brokerage class that lets us update the respective tables
        //  though this should be within the Transformer(basic transformer) since all of our update logic
        //  should exist within there...?
    }

    intradayIngestion = () => {
        // Run all the below limiting to today and update accordingly
        // If a request fails because of an error on HTTP, fetch token, update, and retry
    }

    accounts = async (userId: string, institutionId: number) => {
        const robinhoodUser = await this._repo.getRobinhoodUser(userId);
        if (robinhoodUser === null) throw new Error("Robinhood User Id Doesnt Exist")

        let [accounts, nextUrl] = await this._api.accounts({});
        let transformedAccounts = await this._transformAccounts(accounts, robinhoodUser.id);
        await this._repo.upsertRobinhoodAccounts(transformedAccounts);

        let allTransformedAccounts: RobinhoodAccount[] = [...transformedAccounts];
        while (nextUrl !== null) {
            [accounts, nextUrl] = await this._api.accounts(nextUrl);
            if (accounts.length <= 0) break;

            transformedAccounts = await this._transformAccounts(accounts, robinhoodUser.id);
            await this._repo.upsertRobinhoodAccounts(transformedAccounts);
            allTransformedAccounts = [...allTransformedAccounts, ...transformedAccounts];
        }

        await this._transformer.accounts(userId, institutionId, robinhoodUser, transformedAccounts);
    }

    positions = async (userId: string) => {
        const robinhoodUser = await this._repo.getRobinhoodUser(userId);
        if (robinhoodUser === null) throw new Error("Robinhood User Id Doesnt Exist")

        let instrumentsMap: Record<string, RobinhoodInstrumentTable> = {};
        let optionsMap: Record<string, RobinhoodOptionTable> = {};
        let accountMap: Record<string, RobinhoodAccountTable> = {};
        let internalAccountIds: Record<number, boolean> = {};

        (await this._repo.getRobinhoodAccountsByRobinhoodUserId(robinhoodUser.id)).forEach(a => {
            accountMap[a.accountNumber] = a
            internalAccountIds[a.id] = true;
        });

        let allPositions: RobinhoodPosition[] = [];
        let positions = [];
        let positionsNextUrl = null;
        while (true) {
            [positions, positionsNextUrl] = await this._api.positions({}, positionsNextUrl !== null ? positionsNextUrl : undefined);
            (await this._repo.getRobinhoodInstrumentsByExternalId(positions.filter(p => p.instrument_id !== null).map(p => p.instrument_id as string))).forEach(res => instrumentsMap[res.externalId] = res);
            let transformedPositions = await this._transformPositions(positions, accountMap, instrumentsMap);
            allPositions = [...allPositions, ...transformedPositions];
            if (positionsNextUrl === null) break;
        }

        // Cash Positions
        let cashPositions = [];
        let cashNextUrl = null;
        const cashInstrument = await this._repo.getRobinhoodInstrumentBySymbol('CUR:USD');
        if (cashInstrument === null) throw new Error("no cash instrument found in robinhood table");

        while (true) {
            [cashPositions, cashNextUrl] = await this._api.accounts({}, cashNextUrl === null ? undefined : cashNextUrl);
            let transformedCashPositions = await this._transformCashPosition(cashPositions, accountMap, cashInstrument);
            allPositions = [...allPositions, ...transformedCashPositions];
            if (cashNextUrl === null) break;
        }

        // Options Positions
        let optionPositions = [];
        let optionNextUrl = null;
        while (true) {
            [optionPositions, optionNextUrl] = await this._api.optionPositions({}, optionNextUrl === null ? undefined : optionNextUrl);
            (await this._repo.getRobinhoodOptionsByExternalIds(optionPositions.filter(p => p.option_id !== null).map(p => p.option_id as string))).forEach(res => {
                optionsMap[res.externalId] = res;
            });
            let transformedPositions = await this._transformOptionPositions(optionPositions, accountMap, optionsMap);
            allPositions = [...allPositions, ...transformedPositions];
            if (optionNextUrl === null) break;
        }

        // Delete all current positions
        await this._repo.deleteRobinhoodAccountsPositions(Object.keys(internalAccountIds).map(a => parseInt(a)));

        // Upsert positions
        await this._repo.upsertRobinhoodPositions(allPositions);

        await this._transformer.positions(userId, allPositions);
    }

    transactions = async (userId: string) => {
        const robinhoodUser = await this._repo.getRobinhoodUser(userId);
        if (robinhoodUser === null) throw new Error("Robinhood User Id Doesnt Exist")

        let instrumentsMap: Record<string, RobinhoodInstrumentTable> = {};
        let accountMap: Record<string, RobinhoodAccountTable> = {};

        let [transactions, nextUrl] = await this._api.orders({});

        (await this._repo.getRobinhoodInstrumentsByExternalId(transactions.filter(p => p.instrument_id !== null).map(p => p.instrument_id as string))).forEach(res => instrumentsMap[res.externalId] = res);
        (await this._repo.getRobinhoodAccountsByRobinhoodUserId(robinhoodUser.id)).forEach(a => accountMap[a.accountNumber] = a)

        let transformedTransactions = await this._transformTransactions(transactions, accountMap, instrumentsMap);
        await this._repo.upsertRobinhoodTransactions(transformedTransactions)


        let allTransformedTransactions: RobinhoodTransaction[] = [...transformedTransactions];
        while (nextUrl !== null) {
            [transactions, nextUrl] = await this._api.orders({}, nextUrl);
            (await this._repo.getRobinhoodInstrumentsByExternalId(transactions.filter(p => p.instrument_id !== null).map(p => p.instrument_id as string))).forEach(res => instrumentsMap[res.externalId] = res);

            transformedTransactions = await this._transformTransactions(transactions, accountMap, instrumentsMap);
            await this._repo.upsertRobinhoodTransactions(transformedTransactions);
            allTransformedTransactions = [...allTransformedTransactions, ...transformedTransactions];
        }

        // Transformer for Transactions
    }

    _addOption = async (externalOptionId: string): Promise<RobinhoodOptionTable | null> => {
        const option = await this._api.option(externalOptionId);
        const transformedOption = await this._transformOption(option);
        if (transformedOption === null) {
            console.warn("could not transform option")
            return null;
        }

        const optionId = await this._repo.upsertRobinhoodOption(transformedOption);
        if (optionId === null) {
            console.warn("could not add option to database")
            return null
        }

        return {
            ...transformedOption,
            id: optionId,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()
        }
    }

    _transformOption = async (option: Option): Promise<RobinhoodOption | null> => {
        if (option.chain_symbol === null) {
            console.warn("no chain symbol");
            return null;
        }

        let security = await this._repo.getRobinhoodInstrumentBySymbol(option.chain_symbol)
        if (security === null) {
            const newSecurity = await this._api.instruments({symbol: option.chain_symbol});
            if (newSecurity === null) {
                console.warn("could not find new security for option chain symbol")
                return null;
            }

            const [newInstrument] = await this._transformInstrument([newSecurity]);
            const instrumentId = await this._repo.addRobinhoodInstrument(newInstrument);
            security = {
                ...newInstrument,
                id: instrumentId,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now()
            }
        }

        if (option.strike_price === null) throw new Error("no strike price set");
        if (option.expiration_date === null) throw new Error("no expiration date on option");
        if (option.type === null) throw new Error("no option type")

        return {
            url: option.url,
            type: option.type,
            chainId: option.chain_id,
            chainSymbol: option.chain_symbol,
            expirationDate: DateTime.fromFormat(option.expiration_date, "y-m-d"),
            externalCreatedAt: option.created_at,
            externalUpdatedAt: option.updated_at,
            externalId: option.id as string,
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
        }
    }

    _addInstrument = async (externalInstrumentId: string): Promise<RobinhoodInstrumentTable> => {
        const instrument = await this._api.instrument(externalInstrumentId);
        const [transformedInstrument] = await this._transformInstrument([instrument]);

        const instrumentId = await this._repo.addRobinhoodInstrument(transformedInstrument);
        return {
            ...transformedInstrument,
            id: instrumentId,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now()
        }
    }

    _transformAccounts = async (accs: Account[], userId: number): Promise<RobinhoodAccount[]> => {
        return accs.map(a => {
            let x: RobinhoodAccount = {
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
                accountNumber: a.account_number as string,
                amountEligibleForDepositCancellation: a.amount_eligible_for_deposit_cancellation,
            }
            return x;
        })
    }

    _transformInstrument = async (is: Instrument[]): Promise<RobinhoodInstrument[]> => {
        return is.map(i => {
            let x: RobinhoodInstrument = {
                externalId: i.id as string,
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
                symbol: i.symbol as string,
                fundamentalsUrl: i.fundamentals,
                quoteUrl: i.quote,
                url: i.url,
            }
            return x;
        });
    }

    _transformCashPosition = async (cashPositions: Account[], accountMap: Record<string, RobinhoodAccountTable>, cashInstrument: RobinhoodInstrumentTable): Promise<RobinhoodPosition[]> => {
        let transformedPositions: RobinhoodPosition[] = [];
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
                quantity: cp.cash as string,
                url: cashInstrument.url as string,
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
            })
        }

        return transformedPositions;
    }

    _transformOptionPositions = async (optionPosition: OptionPosition[], accountMap: Record<string, RobinhoodAccountTable>, optionMap: Record<string, RobinhoodOptionTable>): Promise<RobinhoodPosition[]> => {
        let transformedOptions: RobinhoodPosition[] = [];
        for (let i = 0; i < optionPosition.length; i++) {
            const op = optionPosition[i];

            if (op.quantity === null || parseFloat(op.quantity) === 0) {
                continue
            }

            if (op.account_number === null) {
                console.warn("account number is null");
                continue
            }

            if (op.option_id === null) {
                console.warn("option id is null")
                continue
            }

            let internalAccount = accountMap[op.account_number]
            if (internalAccount === null) {
                console.warn("account number not found")
                continue;
            }

            if (!(op.option_id in optionMap)) {
                const newOption = await this._addOption(op.option_id);
                if (newOption === null) {
                    console.warn("could not add option")
                    continue;
                }

                optionMap[newOption.externalId] = newOption;
            }

            let internalOption = optionMap[op.option_id];
            transformedOptions.push({
                url: internalOption.url as string,
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
            })
        }

        return transformedOptions;
    }

    _transformPositions = async (positions: Position[], accountMap: Record<string, RobinhoodAccountTable>, instrumentMap: Record<string, RobinhoodInstrumentTable>): Promise<RobinhoodPosition[]> => {
        let transformedPositions: RobinhoodPosition[] = [];
        for (let i = 0; i < positions.length; i++) {
            const p = positions[i];
            if (p.account_number === null) {
                console.warn("account number is null")
                continue
            }

            if (p.instrument_id === null) {
                console.warn("instrument id is null")
                continue
            }

            let internalAccount = accountMap[p.account_number];

            if (!(p.instrument_id in instrumentMap)) {
                const instrument = await this._addInstrument(p.instrument_id);
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

        return transformedPositions
    }

    _transformTransactions = async (transactions: Order[], accountMap: Record<string, RobinhoodAccountTable>, instrumentMap: Record<string, RobinhoodInstrumentTable>): Promise<RobinhoodTransaction[]> => {
        let transformedTxs: RobinhoodTransaction[] = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.account === null) {
                console.warn("no account url");
                continue
            }

            if (tx.instrument_id === null) {
                console.warn("no instrument id");
                continue
            }

            const accountUrlSplit = tx.account.split("/");
            const accountNumber = accountUrlSplit[accountUrlSplit.length - 2];
            let internalAccount = accountMap[accountNumber];

            if (!(tx.instrument_id in instrumentMap)) {
                const instrument = await this._addInstrument(tx.instrument_id);
                instrumentMap[instrument.externalId] = instrument;
            }

            let internalInstrument = instrumentMap[tx.instrument_id];
            if (tx.executions === null) continue;

            for (let j = 0; j < tx.executions.length; j++) {
                const ex = tx.executions[j];
                if (ex.timestamp === null) throw new Error("no timestamp for execution");
                const executionsTimestamp = DateTime.fromISO(ex.timestamp);
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
                    executedNotionalAmount: tx.executed_notional ? tx.executed_notional.amount : null,
                    executedNotionalCurrencyCode: tx.executed_notional ? tx.executed_notional.currency_code : null,
                    executedNotionalCurrencyId: tx.executed_notional ? tx.executed_notional.currency_id : null,
                    executionsId: ex.id,
                    executionsIpoAccessExecutionRank: ex.ipo_access_execution_rank,
                    executionsPrice: ex.price,
                    executionsQuantity: ex.quantity,
                    externalId: tx.id,
                    executionsRoundedNotional: ex.rounded_notional,
                    executionsSettlementDate: ex.settlement_date,
                    executionsTimestamp: executionsTimestamp,
                    extendedHours: tx.extended_hours,
                    externalCreatedAt: tx.created_at,
                    externalUpdatedAt: tx.updated_at,
                    fees: tx.fees,
                    hasIpoAccessCustomPriceLimit: tx.has_ipo_access_custom_price_limit,
                    instrumentUrl: tx.instrument,
                    internalAccountId: internalAccount.id,
                    rejectReason: tx.reject_reason,
                    investmentScheduleId: tx.investment_schedule_id,
                    ipoAccessCancellationReason: tx.ipo_access_cancellation_reason,
                    ipoAccessLowerCollaredPrice: tx.ipo_access_lower_collared_price,
                    ipoAccessLowerPrice: tx.ipo_access_lower_price,
                    ipoAccessUpperCollaredPrice: tx.ipo_access_upper_collared_price,
                    ipoAccessUpperPrice: tx.ipo_access_upper_price,
                    isIpoAccessOrder: tx.is_ipo_access_order,
                    isIpoAccessPriceFinalized: tx.is_ipo_access_price_finalized,
                    isPrimaryAccount: tx.is_primary_account,
                    isVisibleToUser: tx.is_visible_to_user,
                    lastTrailPrice: tx.last_trail_price,
                    lastTransactionAt: tx.last_transaction_at,
                    lastTrailPriceSource: tx.last_trail_price_source,
                    lastTrailPriceUpdatedAt: tx.last_trail_price_updated_at,
                    marketHours: tx.market_hours,
                    orderFormType: tx.order_form_type,
                    orderFormVersion: tx.order_form_version,
                    price: tx.price,
                    overrideDayTradeChecks: tx.override_day_trade_checks,
                    overrideDtbpChecks: tx.override_dtbp_checks,
                    quantity: tx.quantity,
                    pendingCancelOpenAgent: tx.pending_cancel_open_agent,
                    positionUrl: tx.position,
                    presetPercentLimit: tx.preset_percent_limit,
                    refId: tx.ref_id,
                    side: tx.side,
                    responseCategory: tx.response_category,
                    stopPrice: tx.stop_price,
                    stopTriggeredAt: tx.stop_triggered_at,
                    timeInForce: tx.time_in_force,
                    totalNotionalAmount: tx.total_notional ? tx.total_notional.amount : null,
                    totalNotionalCurrencyCode: tx.total_notional ? tx.total_notional.currency_code : null,
                    trigger: tx.trigger,
                    totalNotionalCurrencyId: tx.total_notional ? tx.total_notional.currency_id : null,
                    internalOptionId: null,
                })
            }
        }
        return transformedTxs;
    }
}