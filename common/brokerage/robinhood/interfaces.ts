import {DateTime} from "luxon";


// Table Definitions

export type RobinhoodUser = {
    userId: string
    username: string
    deviceToken: string
    status: string
    usesMfa: boolean,
    accessToken: string | null
    refreshToken: string | null
}

export type RobinhoodUserTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodUser

export type RobinhoodAccount = {
    userId: number
    accountNumber: string
    url: string | null
    portfolioCash: string | null
    canDowngradeToCashUrl: string | null
    userUrl: string | null
    type: string | null
    brokerageAccountType: string | null
    externalCreatedAt: string | null
    externalUpdatedAt: string | null
    deactivated: boolean | null
    depositHalted: boolean | null
    withdrawlHalted: boolean | null
    onlyPositionClosingTrades: boolean | null
    buyingPower: string | null
    onbp: string | null
    cashAvailableForWithdrawl: string | null
    cash: string | null
    amountEligibleForDepositCancellation: string | null
    cashHeldForOrders: string | null
    unclearedDeposits: string | null
    sma: string | null
    smaHeldForOrders: string | null
    unsettledFunds: string | null
    unsettledDebit: string | null
    cryptoBuyingPower: string | null
    maxAchEarlyAccessAmount: string | null
    cashBalances: string | null
}

export type RobinhoodAccountTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodAccount

export type RobinhoodInstrument = {
    externalId: string
    url: string | null
    symbol: string
    quoteUrl: string | null
    fundamentalsUrl: string | null
    splitsUrl: string | null
    state: string | null
    marketUrl: string | null
    name: string | null
    tradeable: boolean | null
    tradability: string | null
    bloombergUnique: string | null
    marginInitialRatio: string | null
    maintenanceRatio: string | null
    country: string | null
    dayTradeRatio: string | null
    listDate: string | null
    minTickSize: string | null
    type: string | null
    tradeableChainId: string | null
    rhsTradability: string | null
    fractionalTradability: string | null
    defaultCollarFraction: string | null
    ipoAccessStatus: string | null
    ipoAccessCobDeadline: string | null
    ipoS1Url: string | null
    ipoRoadshowUrl: string | null
    isSpac: boolean | null
    isTest: boolean | null
    ipoAccessSupportsDsp: boolean | null
    extendedHoursFractionalTradability: boolean | null
    internalHaltReason: string | null
    internalHaltDetails: string | null
    internalHaltSessions: string | null
    internalHaltStartTime: string | null
    internalHaltEndTime: string | null
    internalHaltSource: string | null
    allDayTradability: string | null
}

export type RobinhoodInstrumentTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodInstrument

export type RobinhoodOption = {
    internalInstrumentId: number
    externalId: string
    strikePrice: number
    expirationDate: DateTime
    type: string
    chainId: string | null
    chainSymbol: string | null
    externalCreatedAt: string | null
    issueDate: string | null
    minTicksAboveTick: string | null
    minTicksBelowTick: string | null
    minTicksCutoffPrice: string | null
    rhsTradability: string | null
    state: string | null
    tradability: string | null
    externalUpdatedAt: string | null
    url: string | null
    selloutDateTime: string | null
    longStrategyCode: string | null
    shortStrategyCode: string | null
}

export type RobinhoodOptionTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodOption

export type OptionContractTableWithRobinhoodId = {
    internalRobinhoodOptionId: number
    id: number
    securityId: number
    type: string
    strikePrice: number
    expiration: DateTime
    updatedAt: DateTime
    createdAt: DateTime
    externalId: string | null
}

export type RobinhoodPosition = {
    internalAccountId: number
    internalInstrumentId: number
    averagePrice: string
    quantity: string

    internalOptionId: number | null
    url: string
    instrumentUrl: string | null
    instrumentId: string | null
    accountUrl: string | null
    accountNumber: string | null
    averageBuyPrice: string | null
    pendingAverageBuyPrice: string | null
    intradayAverageBuyPrice: string | null
    intradayQuantity: string | null
    sharesAvailableForExercise: string | null
    sharesHeldForBuys: string | null
    sharesHeldForSells: string | null
    sharesHeldForStockGrants: string | null
    ipoAllocatedQuantity: string | null
    ipoDspAllocatedQuantity: string | null
    avgCostAffected: boolean | null
    avgCostAffectedReason: boolean | null
    isPrimaryAccount: boolean | null
    externalUpdatedAt: string | null
    externalCreatedAt: string | null
    chainId: string | null
    chainSymbol: string | null
    externalId: string | null
    type: string | null
    pendingBuyQuantity: string | null
    pendingExpiredQuantity: string | null
    pendingExpirationQuantity: string | null
    pendingExcerciseQuantity: string | null
    pendingAssignmentQuantity: string | null
    pendingSellQuantity: string | null
    intradayAverageOpenPrice: string | null
    tradeValueMultiplier: string | null
    externalOptionId: string | null
}

export type RobinhoodPositionTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodPosition

export type RobinhoodTransaction = {
    internalAccountId: number
    internalInstrumentId: number
    internalOptionId: number | null
    externalId: string | null
    refId: string | null
    url: string | null
    accountUrl: string | null
    positionUrl: string | null
    cancel: string | null
    instrumentUrl: string | null
    instrumentId: string | null
    cumulativeQuantity: string | null
    averagePrice: string | null
    fees: string | null
    state: string | null
    pendingCancelOpenAgent: string | null
    type: string | null
    side: string | null
    timeInForce: string | null
    trigger: string | null
    price: string | null
    stopPrice: string | null
    quantity: string | null
    rejectReason: string | null
    externalCreatedAt: string | null
    externalUpdatedAt: string | null
    lastTransactionAt: string | null
    executionsPrice: string | null
    executionsQuantity: string | null
    executionsRoundedNotional: string | null
    executionsSettlementDate: string | null
    executionsTimestamp: DateTime
    executionsId: string | null
    executionsIpoAccessExecutionRank: string | null
    extendedHours: boolean | null
    marketHours: string | null
    overrideDtbpChecks: boolean | null
    overrideDayTradeChecks: boolean | null
    responseCategory: string | null
    stopTriggeredAt: string | null
    lastTrailPrice: string | null
    lastTrailPriceUpdatedAt: string | null
    lastTrailPriceSource: string | null
    dollarBasedAmount: string | null
    totalNotionalAmount: string | null
    totalNotionalCurrencyCode: string | null
    totalNotionalCurrencyId: string | null
    executedNotionalAmount: string | null
    executedNotionalCurrencyCode: string | null
    executedNotionalCurrencyId: string | null
    investmentScheduleId: string | null
    isIpoAccessOrder: boolean | null
    ipoAccessCancellationReason: string | null
    ipoAccessLowerCollaredPrice: string | null
    ipoAccessUpperCollaredPrice: string | null
    ipoAccessUpperPrice: string | null
    ipoAccessLowerPrice: string | null
    isIpoAccessPriceFinalized: boolean | null
    isVisibleToUser: boolean | null
    hasIpoAccessCustomPriceLimit: boolean | null
    isPrimaryAccount: boolean | null
    orderFormVersion: number | null
    presetPercentLimit: string | null
    orderFormType: string | null
    accountNumber: string | null
    cancelUrl: string | null
    canceledQuantity: string | null
    direction: string | null
    optionUrl: string | null
    optionLegId: string | null
    positionEffect: string | null
    ratioQuantity: string | null
    expirationDate: DateTime | null
    strikePrice: string | null
    optionType: string | null
    longStrategyCode: string | null
    shortStrategyCode: string | null
    pendingQuantity: string | null
    premium: string | null
    processedPremium: string | null
    processedQuantity: string | null
    chainId: string | null
    chainSymbol: string | null
    openingStrategy: string | null
    closingStrategy: string | null
    formSource: string | null
    clientBidAtSubmission: string | null
    clientAskAtSubmission: string | null
    clientTimeAtSubmission: string | null
}

export type RobinhoodTransactionTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodTransaction


// API Responses

export type Sweep = {
    amount: {
        amount: string | null
        currency_code: string | null
        currency_id: string | null
    } | null
    direction: string | null
    id: string | null
    account_number: string | null
    pay_date: string | null
    pay_period_start: string | null
    pay_period_end: string | null
    payout_type: string | null
    reason: string | null
}

export type AchTransfer = {
    id: string | null
    ref_id: string | null
    url: string | null
    cancel: string | null
    ach_relationship: string | null
    account: string | null
    amount: string | null
    direction: string | null
    state: string | null
    fees: string | null
    status_description: string | null
    scheduled: boolean | null
    expected_landing_date: string | null
    early_access_amount: string | null
    created_at: string | null
    updated_at: string | null
    rhs_state: string | null
    expected_sweep_at_null: string | null
    expected_landing_datetime: string | null
    investment_schedule_id: string | null
    managed_by_ph: boolean | null
}

export type Dividend = {}

export type OptionPosition = {
    account: string | null
    account_number: string | null
    average_price: string | null
    chain_id: string | null
    chain_symbol: string | null
    id: string | null
    option: string | null
    type: string | null
    pending_buy_quantity: string | null
    pending_expired_quantity: string | null
    pending_expiration_quantity: string | null
    pending_excercise_quantity: string | null
    pending_assignment_quantity: string | null
    pending_sell_quantity: string | null
    quantity: string | null
    intraday_quantity: string | null
    intraday_average_open_price: string | null
    created_at: string | null
    trade_value_multiplier: string | null
    updated_at: string | null
    url: string | null
    option_id: string | null
}


export type OptionOrder = {
    account_number: string | null
    cancel_url: string | null
    canceled_quantity: string | null
    created_at: string | null
    direction: string | null
    id: string | null
    legs: {
        executions: {
            id: string | null
            price: string | null
            quantity: string | null
            settlement_date: string | null
            timestamp: string | null
        }[] | null
        id: string | null
        option: string | null
        position_effect: string | null
        ratio_quantity: number | null
        side: string | null
        expiration_date: string | null
        strike_price: string | null
        option_type: string | null
        long_strategy_code: string | null
        short_strategy_code: string | null
    }[] | null
    pending_quantity: string | null
    premium: string | null
    processed_premium: string | null
    price: string | null
    processed_quantity: string | null
    quantity: string | null
    ref_id: string | null
    state: string | null
    time_in_force: string | null
    trigger: string | null
    type: string | null
    updated_at: string | null
    chain_id: string | null
    chain_symbol: string | null
    response_category: string | null
    opening_strategy: string | null
    closing_strategy: string | null
    stop_price: string | null
    form_source: string | null
    client_bid_at_submission: string | null
    client_ask_at_submission: string | null
    client_time_at_submission: string | null
}

export type Position = {
    url: string | null
    instrument: string | null
    instrument_id: string | null
    account: string | null
    account_number: string | null
    average_buy_price: string | null
    quantity: string | null
    pending_average_buy_price: string | null
    intraday_average_buy_price: string | null
    intraday_quantity: string | null
    shares_available_for_exercise: string | null
    shares_held_for_buys: string | null
    shares_held_for_sells: string | null
    shares_held_for_stock_grants: string | null
    shares_held_for_options_collateral: string | null
    shares_held_for_options_events: string | null
    shares_pending_from_options_events: string | null
    shares_available_for_closing_short_position: string | null
    ipo_allocated_quantity: string | null
    ipo_dsp_allocated_quantity: string | null
    avg_cost_affected: boolean | null
    avg_cost_affected_reason: boolean | null
    is_primary_account: boolean | null
    updated_at: string | null
    created_at: string | null
}

export type PhoenixAccount = {
    account_buying_power: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_available_from_instant_deposits: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_held_for_currency_orders: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_held_for_dividends: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_held_for_equity_orders: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_held_for_options_collateral: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_held_for_orders: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    cash_held_for_restrictions: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    crypto: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    crypto_buying_power: {
        currency_code: string
        currency_id: string
        amount: string
    } | null,
    equities: {
        active_subscription_id: string | null,
        apex_account_number: string | null,
        available_margin: string | null,
        equity: {
            currency_code: string,
            currency_id: string
            amount: string
        } | null,
        margin_maintenance: {
            currency_code: string,
            currency_id: string
            amount: string
        } | null,
        market_value: {
            currency_code: string,
            currency_id: string
            amount: string
        } | null,
        opened_at: string | null,
        rhs_account_number: string | null
        total_margin: {
            currency_code: string,
            currency_id: string
            amount: string
        } | null
    },
    extended_hours_portfolio_equity: string | null,
    instant_allocated: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    levered_amount: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    near_margin_call: boolean,
    options_buying_power: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    portfolio_equity: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    portfolio_previous_close: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    previous_close: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    regular_hours_portfolio_equity: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    total_equity: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    total_extended_hours_equity: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    total_extended_hours_market_value: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    total_market_value: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    total_regular_hours_equity: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    total_regular_hours_market_value: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    uninvested_cash: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null,
    withdrawable_cash: {
        currency_code: string,
        currency_id: string
        amount: string
    } | null
}

export type Account = {
    url: string | null
    portfolio_cash: string | null
    can_downgrade_to_cash: string | null
    user: string | null
    account_number: string | null
    type: string | null
    brokerage_account_type: string | null
    created_at: string | null
    updated_at: string | null
    deactivated: boolean | null
    deposit_halted: boolean | null
    withdrawal_halted: boolean | null
    only_position_closing_trades: boolean | null
    buying_power: string | null
    onbp: string | null
    cash_available_for_withdrawal: string | null
    cash: string | null
    amount_eligible_for_deposit_cancellation: string | null
    cash_held_for_orders: string | null
    uncleared_deposits: string | null
    sma: string | null
    sma_held_for_orders: string | null
    unsettled_funds: string | null
    unsettled_debit: string | null
    crypto_buying_power: string | null
    max_ach_early_access_amount: string | null
    cash_balances: string | null
    margin_balances: {
        uncleared_deposits: string | null
        cash: string | null
        cash_held_for_dividends: string | null
        cash_held_for_restrictions: string | null
        cash_held_for_crypto_orders: string | null
        cash_held_for_nummus_restrictions: string | null
        cash_held_for_orders: string | null
        cash_available_for_withdrawal: string | null
        unsettled_funds: string | null
        unsettled_debit: string | null
        outstanding_interest: string | null
        unallocated_margin_cash: string | null
        margin_limit: string | null
        crypto_buying_power: string | null
        day_trade_buying_power: string | null
        sma: string | null
        day_trades_protection: boolean | null
        start_of_day_overnight_buying_power: string | null
        overnight_buying_power: string | null
        overnight_buying_power_held_for_orders: string | null
        day_trade_buying_power_held_for_orders: string | null
        overnight_ratio: string | null
        day_trade_ratio: string | null
        marked_pattern_day_trader_date: string | null
        pattern_day_trader_expiry_date: string | null
        created_at: string | null
        updated_at: string | null
        start_of_day_dtbp: string | null
        portfolio_cash: string | null
        cash_held_for_options_collateral: string | null
        gold_equity_requirement: string | null
        uncleared_nummus_deposits: string | null
        cash_pending_from_options_events: string | null
        settled_amount_borrowed: string | null
        pending_deposit: string | null
        funding_hold_balance: string | null
        pending_debit_card_debits: string | null
        net_moving_cash: string | null
        margin_withdrawal_limit: string | null
        instant_used: string | null
        instant_allocated: string | null
        eligible_deposit_as_instant: string | null
        leverage_enabled: boolean | null
        is_primary_account: boolean | null
    } | null
    sweep_enabled: boolean | null
    sweep_enrolled: boolean | null
    instant_eligibility: {
        reason: string | null
        reinstatement_date: string | null
        reversal: string | null
        state: string | null
        updated_at: string | null
        additional_deposit_needed: string | null
        compliance_user_major_oak_email: string | null
        created_at: string | null
        created_by: string | null
    } | null
    option_level: string | null
    is_pinnacle_account: string | null
    rhs_account_number: number | null
    state: string | null
    active_subscription_id: string | null
    locked: boolean | null
    permanently_deactivated: boolean | null
    ipo_access_restricted: boolean | null
    ipo_access_restricted_reason: boolean | null
    received_ach_debit_locked: boolean | null
    drip_enabled: boolean | null
    eligible_for_fractionals: boolean | null
    eligible_for_drip: boolean | null
    eligible_for_cash_management: boolean | null
    cash_management_enabled: boolean | null
    option_trading_on_expiration_enabled: boolean | null
    cash_held_for_options_collateral: string | null
    fractional_position_closing_only: boolean | null
    user_id: string | null
    equity_trading_lock: string | null
    option_trading_lock: string | null
    disable_adt: boolean | null
}

export type RefreshResponse = {
    access_token: string
    expires_in: number
    token_type: string
    scope: string
    refresh_token: string
    mfa_code: string | null
    backup_code: string | null
}

export type Order = {
    id: string | null
    ref_id: string | null
    url: string | null
    account: string | null
    position: string | null
    cancel: string | null
    instrument: string | null
    instrument_id: string | null
    cumulative_quantity: string | null
    average_price: string | null
    fees: string | null
    state: string | null
    pending_cancel_open_agent: string | null
    type: string | null
    side: string | null
    time_in_force: string | null
    trigger: string | null
    price: string | null
    stop_price: string | null
    quantity: string | null
    reject_reason: string | null
    created_at: string | null
    updated_at: string | null
    last_transaction_at: string | null
    executions: {
        price: string | null
        quantity: string | null
        rounded_notional: string | null
        settlement_date: string | null
        timestamp: string | null
        id: string | null
        ipo_access_execution_rank: string | null
    }[] | null
    extended_hours: boolean | null
    market_hours: string | null
    override_dtbp_checks: boolean | null
    override_day_trade_checks: boolean | null
    response_category: string | null
    stop_triggered_at: string | null
    last_trail_price: string | null
    last_trail_price_updated_at: string | null
    last_trail_price_source: string | null
    dollar_based_amount: string | null
    total_notional: {
        amount: string | null
        currency_code: string | null
        currency_id: string | null
    } | null
    executed_notional: {
        amount: string | null
        currency_code: string | null
        currency_id: string | null
    } | null
    investment_schedule_id: string | null
    is_ipo_access_order: boolean | null
    ipo_access_cancellation_reason: string | null
    ipo_access_lower_collared_price: string | null
    ipo_access_upper_collared_price: string | null
    ipo_access_upper_price: string | null
    ipo_access_lower_price: string | null
    is_ipo_access_price_finalized: boolean | null
    is_visible_to_user: boolean | null
    has_ipo_access_custom_price_limit: boolean | null
    is_primary_account: boolean | null
    order_form_version: number | null
    preset_percent_limit: string | null
    order_form_type: string | null
}

export type Portfolio = {
    url: string
    account: string
    start_date: string
    market_value: string
    equity: string
    extended_hours_market_value: string
    extended_hours_equity: string
    extended_hours_portfolio_equity: string
    last_core_market_value: string
    last_core_equity: string
    last_core_portfolio_equity: string
    excess_margin: string
    excess_maintenance: string
    excess_margin_with_uncleared_deposits: string
    excess_maintenance_with_uncleared_deposits: string
    equity_previous_close: string
    portfolio_equity_previous_close: string
    adjusted_equity_previous_close: string
    adjusted_portfolio_equity_previous_close: string
    withdrawable_amount: string
    unwithdrawable_deposits: string
    unwithdrawable_grants: string
    is_primary_account: boolean
}

export type Option = {
    chain_id: string | null
    chain_symbol: string | null
    created_at: string | null
    expiration_date: string | null
    id: string | null
    issue_date: string | null
    min_ticks: {
        above_tick: string | null
        below_tick: string | null
        cutoff_price: string | null
    } | null
    rhs_tradability: string | null
    state: string | null
    strike_price: string | null
    tradability: string | null
    type: string | null
    updated_at: string | null
    url: string | null
    sellout_datetime: string | null
    long_strategy_code: string | null
    short_strategy_code: string | null
}

export type Instruments = {}

export type Instrument = {
    id: string | null
    url: string | null
    quote: string | null
    fundamentals: string | null
    splits: string | null
    state: string | null
    market: string | null
    simple_name: string | null
    name: string | null
    tradeable: boolean | null
    tradability: string | null
    symbol: string | null
    bloomberg_unique: string | null
    margin_initial_ratio: string | null
    maintenance_ratio: string | null
    country: string | null
    day_trade_ratio: string | null
    list_date: string | null
    min_tick_size: string | null
    type: string | null
    tradeable_chain_id: string | null
    rhs_tradability: string | null
    fractional_tradability: string | null
    default_collar_fraction: string | null
    ipo_access_status: string | null
    ipo_access_cob_deadline: string | null
    ipo_s1_url: string | null
    ipo_roadshow_url: string | null
    is_spac: boolean | null
    is_test: boolean | null
    ipo_access_supports_dsp: boolean | null
    extended_hours_fractional_tradability: boolean | null
    internal_halt_reason: string | null
    internal_halt_details: string | null
    internal_halt_sessions: string | null
    internal_halt_start_time: string | null
    internal_halt_end_time: string | null
    internal_halt_source: string | null
    all_day_tradability: string | null
}

export type RecentDayTrade = {
    account_number: string
    equity_day_trades: []
    option_day_trades: []
}