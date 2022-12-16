INSERT INTO tradingpost_institution (external_id, name, account_type_description, phone, url_home_app, url_logon_app,
                                     oauth_enabled, url_forgot_password, url_online_registration, class, address_city,
                                     address_state, address_country, address_postal_code, address_address_line_1, email,
                                     status)
VALUES ('', 'Robinhood', 'Brokerage', '', 'https://robinhood.com/', 'https://robinhood.com/', true,
        'https://robinhood.com/forgot_password', 'https://robinhood.com/signup', 'Brokerage', 'Menlo Park',
        'California', 'United States', '94025', '85 Willow Road Menlo Park', '', 'online');

CREATE TABLE robinhood_user
(
    id            BIGSERIAL                      NOT NULL,
    user_id       uuid REFERENCES data_user (id) NOT NULL,
    username      text                           NOT NULL UNIQUE,
    device_token  text                           NOT NULL,
    status        text                           NOT NULL,
    uses_mfa      boolean                        NOT NULL,
    access_token  text,
    refresh_token text,
    updated_at    TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at    TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- TODO: Finish allocating additional fields for robinhood account
CREATE TABLE robinhood_account
(
    id                                       BIGSERIAL                             NOT NULL,
    user_id                                  BIGINT REFERENCES robinhood_user (id) NOT NULL,
    account_number                           TEXT                                  NOT NULL UNIQUE,
    url                                      TEXT,
    portfolio_cash                           TEXT,
    can_downgrade_to_cash_url                TEXT,
    user_url                                 TEXT,
    type                                     TEXT,
    brokerage_account_type                   TEXT,
    external_created_at                      TEXT,
    external_updated_at                      TEXT,
    deactivated                              BOOLEAN,
    deposit_halted                           BOOLEAN,
    withdrawl_halted                         BOOLEAN,
    only_position_closing_trades             BOOLEAN,
    buying_power                             TEXT,
    onbp                                     TEXT,
    cash_available_for_withdrawl             TEXT,
    cash                                     TEXT,
    amount_eligible_for_deposit_cancellation TEXT,
    cash_held_for_orders                     TEXT,
    uncleared_deposits                       TEXT,
    sma                                      TEXT,
    sma_held_for_orders                      TEXT,
    unsettled_funds                          TEXT,
    unsettled_debit                          TEXT,
    crypto_buying_power                      TEXT,
    max_ach_early_access_amount              TEXT,
    cash_balances                            TEXT,
    updated_at                               TIMESTAMPTZ                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at                               TIMESTAMPTZ                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE robinhood_instrument
(
    id                                    BIGSERIAL   NOT NULL,
    external_id                           TEXT        NOT NULL,
    url                                   TEXT        NOT NULL,
    symbol                                TEXT        NOT NULL UNIQUE,
    quote_url                             TEXT,
    fundamentals_url                      TEXT,
    splits_url                            TEXT,
    state                                 TEXT,
    market_url                            TEXT,
    name                                  TEXT,
    tradeable                             BOOLEAN,
    tradability                           TEXT,
    bloomberg_unique                      TEXT,
    margin_initial_ratio                  TEXT,
    maintenance_ratio                     TEXT,
    country                               TEXT,
    day_trade_ratio                       TEXT,
    list_date                             TEXT,
    min_tick_size                         TEXT,
    type                                  TEXT,
    tradeable_chain_id                    TEXT,
    rhs_tradability                       TEXT,
    fractional_tradability                TEXT,
    default_collar_fraction               TEXT,
    ipo_access_status                     TEXT,
    ipo_access_cob_deadline               TEXT,
    ipo_s1_url                            TEXT,
    ipo_roadshow_url                      TEXT,
    is_spac                               BOOLEAN,
    is_test                               BOOLEAN,
    ipo_access_supports_dsp               BOOLEAN,
    extended_hours_fractional_tradability BOOLEAN,
    internal_halt_reason                  TEXT,
    internal_halt_details                 TEXT,
    internal_halt_sessions                TEXT,
    internal_halt_start_time              TEXT,
    internal_halt_end_time                TEXT,
    internal_halt_source                  TEXT,
    all_day_tradability                   TEXT,
    updated_at                            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at                            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE robinhood_option
(
    id                     BIGSERIAL                                   NOT NULL,
    internal_instrument_id BIGINT REFERENCES robinhood_instrument (id) NOT NULL,
    external_id            TEXT                                        NOT NULL UNIQUE,
    chain_id               TEXT,
    chain_symbol           TEXT,
    external_created_at    TEXT,
    expiration_date        TIMESTAMPTZ                                 NOT NULL,
    issue_date             TEXT,
    min_ticks_above_tick   TEXT,
    min_ticks_below_tick   TEXT,
    min_ticks_cutoff_price TEXT,
    rhs_tradability        TEXT,
    state                  TEXT,
    strike_price           DECIMAL(24, 4)                              NOT NULL,
    tradability            TEXT,
    type                   TEXT                                        NOT NULL,
    external_updated_at    TEXT,
    url                    TEXT,
    sellout_date_time      TEXT,
    long_strategy_code     TEXT,
    short_strategy_code    TEXT,
    updated_at             TIMESTAMPTZ                                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at             TIMESTAMPTZ                                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX robinhood_option_uniq_idx ON robinhood_option (expiration_date, strike_price, type);

CREATE TABLE robinhood_position
(
    id                            BIGSERIAL                                   NOT NULL,
    internal_account_id           BIGINT REFERENCES robinhood_account (id)    NOT NULL,
    internal_instrument_id        BIGINT REFERENCES robinhood_instrument (id) NOT NULL,
    internal_option_id            BIGINT REFERENCES robinhood_option (id),
    url                           TEXT                                        NOT NULL,
    instrument_url                TEXT,
    instrument_id                 TEXT,
    account_url                   TEXT,
    account_number                TEXT,
    average_buy_price             TEXT,
    pending_average_buy_price     TEXT,
    quantity                      TEXT,
    intraday_average_buy_price    TEXT,
    intraday_quantity             TEXT,
    shares_available_for_exercise TEXT,
    shares_held_for_buys          TEXT,
    shares_held_for_sells         TEXT,
    shares_held_for_stock_grants  TEXT,
    ipo_allocated_quantity        TEXT,
    ipo_dsp_allocated_quantity    TEXT,
    avg_cost_affected             BOOLEAN,
    avg_cost_affected_reason      TEXT,
    is_primary_account            BOOLEAN,
    external_updated_at           TEXT,
    external_created_at           TEXT,
    average_price                 TEXT,
    chain_id                      TEXT,
    chain_symbol                  TEXT,
    external_id                   TEXT,
    type                          TEXT,
    pending_buy_quantity          TEXT,
    pending_expired_quantity      TEXT,
    pending_excercise_quantity    TEXT,
    pending_assignment_quantity   TEXT,
    pending_sell_quantity         TEXT,
    intraday_average_open_price   TEXT,
    trade_value_multiplier        TEXT,
    external_option_id            TEXT,
    updated_at                    TIMESTAMPTZ                                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at                    TIMESTAMPTZ                                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX robinhood_position_unique_idx ON robinhood_position (internal_account_id, internal_instrument_id, internal_option_id);

CREATE TABLE robinhood_transaction
(
    id                         BIGSERIAL                                   NOT NULL,
    internal_account_id        BIGINT REFERENCES robinhood_account (id)    NOT NULL,
    internal_instrument_id     BIGINT REFERENCES robinhood_instrument (id) NOT NULL,
    executions_price           DECIMAL(24, 4)                              NOT NULL,
    executions_quantity        DECIMAL(24, 4)                              NOT NULL,
    internal_option_id         BIGINT,
    external_id                TEXT,
    ref_id                     TEXT,
    url                        TEXT,
    account_url                TEXT,
    position_url               TEXT,
    cancel                     TEXT,
    instrument_url             TEXT,
    instrument_id              TEXT,
    cumulative_quantity        TEXT,
    average_price              TEXT,
    fees                       TEXT,
    rate                       TEXT,
    position                   TEXT,
    withholding                TEXT,
    cash_dividend_id           TEXT,
    state                      TEXT,
    type                       TEXT,
    side                       TEXT,
    trigger                    TEXT,
    price                      TEXT,
    stop_price                 TEXT,
    quantity                   TEXT,
    reject_reason              TEXT,
    external_created_at        TEXT,
    external_updated_at        TEXT,
    last_transaction_at        TEXT,
    executions_settlement_date TEXT,
    executions_timestamp       TIMESTAMPTZ,
    executions_id              TEXT,
    extended_hours             TEXT,
    dollar_based_amount        TEXT,
    investment_schedule_id     TEXT,
    account_number             TEXT,
    cancel_url                 TEXT,
    canceled_quantity          TEXT,
    direction                  TEXT,
    option_leg_id              TEXT,
    position_effect            TEXT,
    ratio_quantity             FLOAT,
    pending_quantity           TEXT,
    processed_quantity         TEXT,
    chain_id                   TEXT,
    chain_symbol               TEXT,
    ach_relationship           TEXT,
    expected_landing_date      TEXT,
    expected_landing_datetime  TEXT,
    updated_at                 TIMESTAMP                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at                 TIMESTAMP                                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX robinhood_transaction_unique_idx ON robinhood_transaction (internal_account_id,
                                                                               internal_instrument_id,
                                                                               coalesce(internal_option_id,-1),
                                                                               executions_timestamp,
                                                                               executions_quantity);

INSERT INTO robinhood_instrument(url, external_id, symbol, name, country)
VALUES ('', 'external-cash', 'USD:CUR', 'Cash', 'United States');

-- TradingPost Transaction Update
ALTER TABLE tradingpost_transaction DROP CONSTRAINT tradingpost_transaction_option_id_fkey;
DROP INDEX tradingpost_transaction_unique_idx;
CREATE UNIQUE INDEX tradingpost_transaction_unique_idx ON tradingpost_transaction USING btree (account_id, security_id, coalesce (option_id, -1), type, date, price);

-- TradingPost Current Holding Update
ALTER TABLE tradingpost_current_holding DROP CONSTRAINT tradingpost_current_holding_option_id_fkey;
DROP INDEX tradingpost_current_holding_unique_idx;
CREATE UNIQUE INDEX tradingpost_current_holding_unique_idx ON tradingpost_current_holding USING btree (account_id, security_id, coalesce (option_id, -1));

-- TradingPost Historical Holding Update
ALTER TABLE tradingpost_historical_holding DROP CONSTRAINT tradingpost_historical_holding_option_id_fkey;
DROP INDEX historical_holding_acc_sec_date_quantity;
CREATE UNIQUE INDEX historical_holding_unqi ON tradingpost_historical_holding (account_id, security_id, coalesce(option_id,-1), date, price);

CREATE TYPE direct_brokerages_type AS ENUM('Robinhood', 'Ibkr', 'Finicity');

CREATE TYPE brokerage_task_type AS enum('NEW_ACCOUNT', 'NEW_DATA', 'TODO');

CREATE TYPE brokerage_task_status_type AS ENUM ('PENDING', 'FAILED', 'RUNNING', 'SUCCESSFUL');

-- partial type is used when the task is not ready just quite yet and might have other dependents but is initialized
ALTER TYPE brokerage_task_status_type ADD VALUE 'PARTIAL';

ALTER TYPE brokerage_task_type ADD VALUE 'DELETE_ACCOUNT';

ALTER TYPE brokerage_task_type ADD VALUE 'UPDATE_ACCOUNT';

CREATE TABLE brokerage_task
(
    id                BIGSERIAL                      NOT NULL,
    user_id           UUID REFERENCES data_user (id) NOT NULL,
    brokerage         direct_brokerages_type         NOT NULL,
    status            brokerage_task_status_type     NOT NULL DEFAULT 'PENDING',
    type              brokerage_task_type            NOT NULL DEFAULT 'TODO',
    date              TIMESTAMPTZ                    NOT NULL, -- Used for when to process in ASCENDING order
    brokerage_user_id TEXT                           NOT NULL,
    started           TIMESTAMPTZ,
    finished          TIMESTAMPTZ,
    data              JSONB,
    error             JSONB,
    updated_at        TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at        TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX brokerage_task_uniq ON brokerage_task (brokerage, status, type, date, user_id);

DROP TABLE brokerage_to_process;
DROP TYPE direct_brokerages;
DROP TYPE brokerage_to_process_status;

ALTER TABLE ibkr_security
    ADD COLUMN file_date TIMESTAMPTZ NOT NULL;
ALTER TABLE ibkr_activity
    ADD COLUMN file_date TIMESTAMPTZ NOT NULL;
ALTER TABLE ibkr_cash_report
    ADD COLUMN file_date TIMESTAMPTZ NOT NULL;
ALTER TABLE ibkr_nav
    ADD COLUMN file_date TIMESTAMPTZ NOT NULL;
ALTER TABLE ibkr_pl
    ADD COLUMN file_date TIMESTAMPTZ NOT NULL;
ALTER TABLE ibkr_position
    ADD COLUMN file_date TIMESTAMPTZ NOT NULL;
ALTER TABLE tradingpost_brokerage_account
    ADD COLUMN hidden_for_deletion BOOLEAN NOT NULL DEFAULT FALSE;

DROP FUNCTION api_brokerage_account;
CREATE
OR REPLACE FUNCTION public.api_brokerage_account(request jsonb)
 RETURNS TABLE(id bigint, broker_name text, account_number text, type text, user_id uuid, hidden_for_deletion boolean)
 LANGUAGE plpgsql
AS $function$
BEGIN
return query SELECT v."id", v."broker_name",v."account_number",v."type", v."user_id", v.hidden_for_deletion FROM public.tradingpost_brokerage_account as v WHERE v.user_id = (request->>'user_id')::UUID;
END;
$function$;


ALTER TABLE public.ibkr_activity DROP CONSTRAINT ibkr_activity_security_id_fkey;
ALTER TABLE public.ibkr_activity
    ADD CONSTRAINT ibkr_activity_con_id_fkey FOREIGN KEY (con_id) REFERENCES ibkr_security (con_id);
DROP INDEX ibkr_activity_unique_idx;
CREATE UNIQUE INDEX ibkr_activity_unique_idx ON public.ibkr_activity USING btree (account_id, con_id, trade_date, transaction_type, quantity);

ALTER TABLE public.ibkr_pl DROP CONSTRAINT ibkr_pl_security_id_fkey;
ALTER TABLE public.ibkr_position DROP CONSTRAINT ibkr_position_security_id_fkey;
ALTER TABLE public.ibkr_position
    ADD CONSTRAINT ibkr_position_con_id_fkey FOREIGN KEY (con_id) REFERENCES ibkr_security (con_id);

DROP INDEX ibkr_position_unique_idx;
CREATE UNIQUE INDEX ibkr_position_unique_idx ON public.ibkr_position USING btree (account_id, con_id, asset_type, report_date)

ALTER TABLE public.ibkr_security DROP CONSTRAINT ibkr_security_security_id_key;
ALTER TABLE public.ibkr_security
    ADD CONSTRAINT ibkr_security_con_id_key UNIQUE (con_id);
DROP INDEX ibkr_security_security_id_key;
CREATE UNIQUE INDEX ibkr_security_con_id_key ON public.ibkr_security USING btree (con_id);

CREATE TYPE tradingpost_brokerage_account_status AS ENUM('ACTIVE', 'INACTIVE', 'REMOVED', 'ERROR', 'PROCESSING');

ALTER TABLE tradingpost_brokerage_account
    ADD COLUMN account_status tradingpost_brokerage_account_status DEFAULT 'PROCESSING';

