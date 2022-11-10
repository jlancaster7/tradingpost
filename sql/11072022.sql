CREATE TYPE brokerage_to_process_status AS ENUM ('PENDING', 'FAILED', 'RUNNING', 'SUCCESSFUL');

CREATE TABLE brokerage_to_process
(
    id                BIGSERIAL                   NOT NULL,
    brokerage         TEXT                        NOT NULL,
    brokerage_user_id TEXT                        NOT NULL,
    date_to_process   TIMESTAMPTZ                 NOT NULL,
    status            brokerage_to_process_status NOT NULL DEFAULT 'PENDING',
    data              JSONB,
    updated_at        TIMESTAMPTZ                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at        TIMESTAMPTZ                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX brokerage_to_process_user_id_brokerage ON brokerage_to_process (brokerage, brokerage_user_id, date_to_process);

CREATE TABLE ibkr_account
(
    id                     BIGSERIAL                      NOT NULL,
    user_id                UUID REFERENCES data_user (id) NOT NULL,
    account_id             TEXT UNIQUE                    NOT NULL,
    account_process_date   DATE                           NOT NULL,
    type                   TEXT,
    account_title          TEXT,
    street                 TEXT,
    street2                TEXT,
    city                   TEXT,
    state                  TEXT,
    zip                    TEXT,
    country                TEXT,
    account_type           TEXT,
    customer_type          TEXT,
    base_currency          TEXT,
    master_account_id      TEXT,
    van                    TEXT,
    capabilities           TEXT,
    alias                  TEXT,
    primary_email          TEXT,
    date_opened            DATE,
    date_closed            DATE,
    date_funded            DATE,
    account_representative TEXT,
    updated_at             TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at             TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE ibkr_security
(
    id                          BIGSERIAL   NOT NULL,
    type                        TEXT        NOT NULL,
    con_id                      TEXT        NOT NULL,
    asset_type                  TEXT        NOT NULL,
    security_id                 TEXT        NOT NULL UNIQUE,
    cusip                       TEXT        NOT NULL,
    symbol                      TEXT        NOT NULL,
    bb_ticker                   TEXT,
    bb_ticker_and_exchange_code TEXT,
    bb_global_id                TEXT,
    description                 TEXT,
    underlying_symbol           TEXT,
    underlying_category         TEXT,
    underlying_security_id      TEXT,
    underlying_primary_exchange TEXT,
    underlying_con_id           TEXT,
    multiplier                  BIGINT,
    expiration_date             TEXT,
    option_type                 TEXT,
    option_strike               DECIMAL(24, 4),
    maturity_date               DATE,
    issue_date                  DATE,
    primary_exchange            TEXT,
    currency                    TEXT        NOT NULL,
    sub_category                TEXT,
    issuer                      TEXT,
    delivery_month              TEXT,
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE ibkr_activity
(
    id                     BIGSERIAL   NOT NULL,
    type                   TEXT,
    account_id             TEXT REFERENCES ibkr_account (account_id),
    con_id                 TEXT,
    security_id            TEXT REFERENCES ibkr_security (security_id),
    symbol                 TEXT,
    bb_ticker              TEXT,
    bb_global_id           TEXT,
    security_description   TEXT,
    asset_type             TEXT,
    currency               TEXT,
    base_currency          TEXT,
    trade_date             DATE,
    trade_time             TIME,
    settle_date            DATE,
    order_time             TIMESTAMPTZ,
    transaction_type       TEXT,
    quantity               DECIMAL(24, 4),
    unit_price             DECIMAL(24, 4),
    gross_amount           DECIMAL(24, 4),
    sec_fee                DECIMAL(24, 4),
    commission             DECIMAL(24, 4),
    tax                    DECIMAL(24, 4),
    net                    DECIMAL(24, 4),
    net_in_base            DECIMAL(24, 4),
    trade_id               TEXT,
    tax_basis_election     TEXT,
    description            TEXT,
    fx_rate_to_base        DECIMAL(24, 4),
    contra_party_name      TEXT,
    clr_firm_id            TEXT,
    exchange               TEXT,
    master_account_id      TEXT REFERENCES ibkr_account (account_id),
    van                    TEXT,
    away_broker_commission DECIMAL(24, 4),
    order_id               TEXT,
    client_references      TEXT,
    transaction_id         TEXT,
    execution_id           TEXT,
    cost_basis             DECIMAL(24, 4),
    flag                   TEXT,
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ibkr_activity_unique_idx ON ibkr_activity (account_id, security_id, trade_date, transaction_type, quantity);

CREATE TABLE ibkr_cash_report
(
    id           BIGSERIAL   NOT NULL,
    type         TEXT,
    account_id   TEXT REFERENCES ibkr_account (account_id),
    report_date  DATE,
    currency     TEXT,
    base_summary BOOLEAN,
    label        TEXT,
    total        DECIMAL(24, 4),
    securities   DECIMAL(24, 4),
    futures      DECIMAL(24, 4),
    ibukl        DECIMAL(24, 4),
    paxos        DECIMAL(24, 4),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ibkr_cash_report_unique_idx ON ibkr_cash_report (account_id, report_date, base_summary, label);

CREATE TABLE ibkr_nav
(
    id                      BIGSERIAL   NOT NULL,
    type                    TEXT,
    account_id              TEXT REFERENCES ibkr_account (account_id),
    base_currency           TEXT        NOT NULL,
    cash                    DECIMAL(24, 4),
    cash_collateral         DECIMAL(24, 4),
    stocks                  DECIMAL(24, 4),
    ipo_subscription        DECIMAL(24, 4),
    securities_borrowed     DECIMAL(24, 4),
    securities_lent         DECIMAL(24, 4),
    options                 DECIMAL(24, 4),
    bonds                   DECIMAL(24, 4),
    commodities             DECIMAL(24, 4),
    funds                   DECIMAL(24, 4),
    notes                   DECIMAL(24, 4),
    accruals                DECIMAL(24, 4),
    dividend_accruals       DECIMAL(24, 4),
    soft_dollars            DECIMAL(24, 4),
    crypto                  DECIMAL(24, 4),
    totals                  DECIMAL(24, 4),
    twr                     DECIMAL(24, 4),
    cfd_unrealized_pl       DECIMAL(24, 4),
    forex_cfd_unrealized_pl DECIMAL(24, 4),
    processed_date          TIMESTAMPTZ NOT NULL,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ibkr_nav_unique_idx ON ibkr_nav (account_id, processed_date);

CREATE TABLE ibkr_pl
(
    id                      BIGSERIAL                                 NOT NULL,
    account_id              TEXT REFERENCES ibkr_account (account_id) NOT NULL,
    internal_asset_id       TEXT                                      NOT NULL,
    security_id             TEXT REFERENCES ibkr_security (security_id),
    symbol                  TEXT,
    bb_ticker               TEXT,
    bb_global_id            TEXT,
    security_description    TEXT,
    asset_type              TEXT,
    currency                TEXT,
    report_date             DATE                                      NOT NULL,
    position_mtm            DECIMAL(24, 4),
    position_mtm_in_base    DECIMAL(24, 4),
    transaction_mtm         DECIMAL(24, 4),
    transaction_mtm_in_base DECIMAL(24, 4),
    realized_st             DECIMAL(24, 4),
    realized_st_in_base     DECIMAL(24, 4),
    realized_lt             DECIMAL(24, 4),
    realized_lt_in_base     DECIMAL(24, 4),
    unrealized_st           DECIMAL(24, 4),
    unrealized_st_in_base   DECIMAL(24, 4),
    unrealized_lt           DECIMAL(24, 4),
    unrealized_lt_in_base   DECIMAL(24, 4),
    updated_at              TIMESTAMPTZ                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at              TIMESTAMPTZ                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ibkr_pl_unique_idx ON ibkr_pl (account_id, internal_asset_id, report_date);

CREATE TABLE ibkr_position
(
    id                       BIGSERIAL                                 NOT NULL,
    type                     TEXT                                      NOT NULL,
    account_id               TEXT REFERENCES ibkr_account (account_id) NOT NULL,
    con_id                   TEXT,
    security_id              TEXT REFERENCES ibkr_security (security_id),
    symbol                   TEXT,
    bb_ticker                TEXT,
    bb_global_id             TEXT,
    security_description     TEXT,
    asset_type               TEXT,
    currency                 TEXT                                      NOT NULL,
    base_currency            TEXT                                      NOT NULL,
    quantity                 DECIMAL(24, 4),
    quantity_in_base         DECIMAL(24, 4),
    cost_price               DECIMAL(24, 4),
    cost_basis               DECIMAL(24, 4),
    cost_basis_in_base       DECIMAL(24, 4),
    market_price             DECIMAL(24, 4),
    market_value             DECIMAL(24, 4),
    market_value_in_base     DECIMAL(24, 4),
    open_date_time           TIMESTAMPTZ,
    fx_rate_to_base          DECIMAL(24, 4),
    report_date              DATE,
    settled_quantity         DECIMAL(24, 4),
    settled_quantity_in_base DECIMAL(24, 4),
    master_account_id        TEXT REFERENCES ibkr_account (account_id),
    van                      TEXT,
    accrued_int              DECIMAL(24, 4),
    originating_order_id     TEXT,
    multiplier               DECIMAL(24, 4),
    updated_at               TIMESTAMPTZ                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at               TIMESTAMPTZ                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ibkr_position_unique_idx ON ibkr_position (account_id, security_id, asset_type, report_date);

CREATE UNIQUE INDEX security_option_unique_idx ON security_option (security_id, TYPE, strike_price, expiration);

ALTER TABLE SECURITY_OPTION
    ADD COLUMN external_id TEXT;
CREATE INDEX security_option_external_id_idx ON security_option (external_id);

ALTER TABLE tradingpost_current_holding
    ADD COLUMN holding_date TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX tradingpost_transaction_unique_idx ON public.tradingpost_transaction USING btree (account_id, security_id, security_type, type, date, quantity, price);
DROP INDEX tradingpost_transaction_idx;

CREATE UNIQUE INDEX tradingpost_current_holding_unique_idx ON public.tradingpost_current_holding USING btree (account_id, security_id, option_id, security_type);
DROP INDEX tradingpost_current_holding_idx;

-- TODO: Run In Production
UPDATE NOTIFICATION n
SET DATA = (SELECT DATA || '{"approved": true}')
WHERE TYPE = 'NEW_SUBSCRIPTION';