CREATE TABLE iex_security
(
    id               BIGSERIAL   NOT NULL,
    symbol           TEXT        NOT NULL UNIQUE,
    company_name     TEXT        NOT NULL,
    exchange         TEXT,
    industry         TEXT,
    website          TEXT,
    description      TEXT,
    ceo              TEXT,
    security_name    TEXT,
    issue_type       TEXT,
    sector           TEXT,
    primary_sic_code TEXT,
    employees        TEXT,
    tags             TEXT[],
    address          TEXT,
    address2         TEXT,
    state            TEXT,
    zip              TEXT,
    country          TEXT,
    phone            TEXT,
    logo_url         TEXT,
    last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated        BOOLEAN              DEFAULT FALSE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE security
(
    id               BIGSERIAL   NOT NULL,
    symbol           TEXT        NOT NULL UNIQUE,
    company_name     TEXT        NOT NULL,
    exchange         TEXT,
    industry         TEXT,
    website          TEXT,
    description      TEXT,
    ceo              TEXT,
    security_name    TEXT,
    issue_type       TEXT,
    sector           TEXT,
    primary_sic_code TEXT,
    employees        TEXT,
    tags             TEXT[],
    address          TEXT,
    address2         TEXT,
    state            TEXT,
    zip              TEXT,
    country          TEXT,
    phone            TEXT,
    logo_url         TEXT,
    last_updated     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE security_price
(
    id          BIGSERIAL                       NOT NULL,
    security_id BIGINT REFERENCES security (id) NOT NULL,
    price       DECIMAL(24, 4)                  NOT NULL,
    time        TIMESTAMPTZ                     NOT NULL,
    created_at  TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX security_price_idx ON security_price (security_id, time);

CREATE INDEX security_price_time_brin_idx ON security_price USING brin (time);

CREATE TABLE security_information
(
    id                             BIGSERIAL                       NOT NULL,
    security_id                    BIGINT REFERENCES security (id) NOT NULL UNIQUE,
    calculation_price              TEXT,
    delayed_price                  DECIMAL(24, 4),
    delayed_price_time             BIGINT,
    odd_lot_delayed_price          DECIMAL(24, 4),
    odd_lot_delayed_price_time     BIGINT,
    extended_price                 DECIMAL(24, 4),
    extended_change                DECIMAL(24, 4),
    extended_change_percent        DECIMAL(24, 4),
    extended_price_time            INT,
    previous_close                 DECIMAL(24, 4),
    previous_volume                DECIMAL(24, 4),
    avg_total_volume               DECIMAL(24, 4),
    market_cap                     DECIMAL(24, 4),
    pe_ratio                       DECIMAL(24, 4),
    week_52_high                   DECIMAL(24, 4),
    week_52_low                    DECIMAL(24, 4),
    ytd_change                     DECIMAL(24, 4),
    last_trade_time                INT,
    currency                       TEXT,
    close                          DECIMAL(24, 4),
    high                           DECIMAL(24, 4),
    low                            DECIMAL(24, 4),
    open                           DECIMAL(24, 4),
    volume                         DECIMAL(24, 4),
    market_change_over_time        DECIMAL(24, 4),
    unadjusted_open                DECIMAL(24, 4),
    unadjusted_close               DECIMAL(24, 4),
    unadjusted_low                 DECIMAL(24, 4),
    unadjusted_volume              DECIMAL(24, 4),
    fully_adjusted_open            DECIMAL(24, 4),
    fully_adjusted_close           DECIMAL(24, 4),
    fully_adjusted_high            DECIMAL(24, 4),
    fully_adjusted_low             DECIMAL(24, 4),
    fully_adjusted_volume          DECIMAL(24, 4),
    label                          TEXT,
    change                         DECIMAL(24, 4),
    change_percent                 DECIMAL(24, 4),
    week_52_high_split_adjust_only DECIMAL(24, 4),
    week_52_low_split_adjust_only  DECIMAL(24, 4),
    week_52_change                 DECIMAL(24, 4),
    shares_outstanding             DECIMAL(24, 4),
    float                          DECIMAL(24, 4),
    avg_10_volume                  DECIMAL(24, 4),
    avg_30_volume                  DECIMAL(24, 4),
    day_200_moving_avg             DECIMAL(24, 4),
    day_50_moving_avg              DECIMAL(24, 4),
    employees                      DECIMAL(24, 4),
    ttm_eps                        DECIMAL(24, 4),
    ttm_dividend_rate              DECIMAL(24, 4),
    dividend_yield                 DECIMAL(24, 4),
    next_dividend_date             TEXT,
    ex_dividend_date               TEXT,
    next_earnings_date             TEXT,
    beta                           DECIMAL(24, 4),
    max_change_percent             DECIMAL(24, 4),
    year_5_change_percent          DECIMAL(24, 4),
    year_2_change_percent          DECIMAL(24, 4),
    year_1_change_percent          DECIMAL(24, 4),
    ytd_change_percent             DECIMAL(24, 4),
    month_6_change_percent         DECIMAL(24, 4),
    month_3_change_percent         DECIMAL(24, 4),
    month_1_change_percent         DECIMAL(24, 4),
    day_30_change_percent          DECIMAL(24, 4),
    day_5_change_percent           DECIMAL(24, 4),
    last_updated                   TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    created_at                     TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE exchanges
(
    id                  BIGSERIAL   NOT NULL,
    name                TEXT,
    long_name           TEXT,
    mic                 TEXT        NOT NULL UNIQUE,
    tape_id             TEXT,
    oats_id             TEXT,
    ref_id              TEXT,
    type                TEXT,
    region              TEXT,
    description         TEXT,
    segment             TEXT,
    segment_description TEXT,
    suffix              TEXT,
    exchange_suffix     TEXT,
    last_updated        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE us_exchange_holiday
(
    id              BIGSERIAL   NOT NULL,
    date            TIMESTAMPTZ NOT NULL UNIQUE,
    settlement_date TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE realizefi_users
(
    id           BIGSERIAL NOT NULL PRIMARY KEY,
--    user_id uuid REFERENCES users(id) not null,
    realizefi_id TEXT      NOT NULL UNIQUE
);

-- Should have an enum type for health_status
CREATE TABLE realizefi_accounts
(
    id                       BIGSERIAL                              NOT NULL PRIMARY KEY,
    account_id               BIGINT REFERENCES realizefi_users (id) NOT NULL,
    realizefi_institution_id TEXT UNIQUE                            NOT NULL,
    institution              TEXT                                   NOT NULL,
    account_number           TEXT                                   NOT NULL,
    health_status            TEXT                                   NOT NULL,
    permission_scopes        JSON,
    buying_power             DECIMAL(24, 4)                         NOT NULL,
    cash                     DECIMAL(24, 4)                         NOT NULL,
    account_value            DECIMAL(24, 4)                         NOT NULL,
    margin                   DECIMAL(24, 4)                         NOT NULL
);

CREATE UNIQUE INDEX realizefi_accounts_idx ON realizefi_accounts (account_id, institution, account_number);

CREATE TABLE realizefi_account_transactions
(
    id                       BIGSERIAL                                 NOT NULL PRIMARY KEY,
    account_id               BIGINT REFERENCES realizefi_accounts (id) NOT NULL,
    realizefi_transaction_id TEXT UNIQUE                               NOT NULL,
    transaction_date         timestamptz                               NOT NULL,
    settlement_date          timestamptz                               NOT NULL,
    -- top level transaction type(dont know if any different than detail transaction type within response)
    transaction_type         TEXT                                      NOT NULL,
    net_amount               DECIMAL(24, 4),
    transaction_type_detail  TEXT,
    transaction_sub_type     TEXT,
    side                     TEXT,
    -- TODO: How granular should we support(e.g., fractional shares)
    quantity                 DECIMAL(24, 4),
    price                    DECIMAL(24, 4),
    adjustment_ratio         DECIMAL(24, 4),
    instrument               JSON,
    symbol                   TEXT,
    fees                     DECIMAL(24, 4)
);

-- Do we need this, and maybe we should report conflicts if doing bulk operations....
CREATE UNIQUE INDEX realizefi_account_transactions_idx ON realizefi_account_transactions (account_id, transaction_date, transaction_type, symbol);

CREATE TABLE realizefi_account_positions
(
    id                                 BIGSERIAL                                 NOT NULL PRIMARY KEY,
    account_id                         BIGINT REFERENCES realizefi_accounts (id) NOT NULL,
    symbol                             TEXT                                      NOT NULL,
    average_price                      DECIMAL(24, 4)                            NOT NULL,
    cost_basis                         DECIMAL(24, 4)                            NOT NULL,
    long_quantity                      DECIMAL(24, 4)                            NOT NULL,
    short_quantity                     DECIMAL(24, 4)                            NOT NULL,
    market_value                       DECIMAL(24, 4)                            NOT NULL,
    current_day_profit_loss            DECIMAL(24, 4)                            NOT NULL,
    current_day_profit_loss_percentage DECIMAL(24, 4)                            NOT NULL,
    security_type                      TEXT                                      NOT NULL,
    security_id                        TEXT                                      NOT NULL,
    security_symbol                    TEXT                                      NOT NULL,
    security_share_class_figi          TEXT                                      NOT NULL,
    security_composite_figi            TEXT                                      NOT NULL,
    security_strike_price              DECIMAL(24, 4),
    security_expiration                TIMESTAMPTZ,
    security_contract_type             TEXT,
    security_primary_exchange          TEXT                                      NOT NULL
);

-- Does this hold true? Or, should it be over the symbol type? Want to investigate more...
CREATE UNIQUE INDEX realizefi_account_positions_idx ON realizefi_account_positions (account_id, symbol);

-- We could utilize user devices for web & mobile
CREATE TABLE user_device
(
    id         BIGSERIAL                             NOT NULL PRIMARY KEY,
    user_id    UUID REFERENCES data_user (id)        NOT NULL,
    provider   TEXT                                  NOT NULL, -- Apple / Android / etc....
    device_id  TEXT                                  NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX user_devices_user_id_device_id_idx ON user_device (user_id, device_id);