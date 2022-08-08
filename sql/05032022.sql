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

CREATE INDEX security_exchange_idx ON security (exchange);

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

-- We could utilize user devices for web & mobile
CREATE TABLE user_device
(
    id         BIGSERIAL                             NOT NULL,
    user_id    UUID REFERENCES data_user (id)        NOT NULL,
    provider   TEXT                                  NOT NULL, -- Apple / Android / etc....
    device_id  TEXT                                  NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX user_devices_user_id_device_id_idx ON user_device (user_id, device_id);

CREATE TABLE tradingpost_institution
(
    id                       BIGSERIAL                 NOT NULL,
    external_id              TEXT UNIQUE               NOT NULL,
    name                     TEXT                      NOT NULL,
    account_type_description TEXT,
    phone                    TEXT,
    url_home_app             TEXT,
    url_logon_app            TEXT,
    oauth_enabled            BOOLEAN,
    url_forgot_password      TEXT,
    url_online_registration  TEXT,
    class                    TEXT,
    address_city             TEXT,
    address_state            TEXT,
    address_country          TEXT,
    address_postal_code      TEXT,
    address_address_line_1   TEXT,
    address_address_line_2   TEXT,
    email                    TEXT,
    status                   TEXT,
    updated_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE finicity_institution
(
    id                          BIGSERIAL                 NOT NULL,
    institution_id              BIGINT UNIQUE             NOT NULL,
    name                        TEXT,
    voa                         BOOLEAN,
    voi                         BOOLEAN,
    state_agg                   BOOLEAN,
    ach                         BOOLEAN,
    trans_agg                   BOOLEAN,
    aha                         BOOLEAN,
    available_balance           BOOLEAN,
    account_owner               BOOLEAN,
    loan_payment_details        BOOLEAN,
    student_loan_data           BOOLEAN,
    account_type_description    TEXT,
    phone                       TEXT,
    url_home_app                TEXT,
    url_logon_app               TEXT,
    oauth_enabled               BOOLEAN,
    url_forgot_password         TEXT,
    url_online_registration     TEXT,
    class                       TEXT,
    special_text                TEXT,
    time_zone                   TEXT,
    special_instructions        TEXT,
    special_instructions_title  TEXT,
    address_city                TEXT,
    address_state               TEXT,
    address_country             TEXT,
    address_postal_code         TEXT,
    address_line_1              TEXT,
    address_line_2              TEXT,
    currency                    TEXT,
    email                       TEXT,
    status                      TEXT,
    new_institution_id          TEXT,
    branding_logo               TEXT,
    branding_alternate_logo     TEXT,
    branding_icon               TEXT,
    branding_primary_color      TEXT,
    branding_title              TEXT,
    oauth_institution_id        TEXT,
    production_status_overall   TEXT,
    production_status_trans_agg TEXT,
    production_status_voa       TEXT,
    production_status_state_agg TEXT,
    production_status_ach       TEXT,
    production_status_aha       TEXT,
    updated_at                  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at                  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE finicity_user
(
    id          BIGSERIAL                             NOT NULL,
    tp_user_id  UUID REFERENCES data_user (id) UNIQUE NOT NULL,
    customer_id TEXT UNIQUE                           NOT NULL,
    type        TEXT                                  NOT NULL,
    updated_at  TIMESTAMPTZ                           NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ                           NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE finicity_account
(
    id                            BIGSERIAL                            NOT NULL,
    finicity_user_id              BIGINT REFERENCES finicity_user (id) NOT NULL,
    finicity_institution_id       BIGINT REFERENCES finicity_institution (id),
    account_id                    TEXT UNIQUE                          NOT NULL,
    number                        TEXT,
    real_account_number_last_4    TEXT,
    account_number_display        TEXT,
    name                          TEXT,
    balance                       DECIMAL(24, 4),
    type                          TEXT,
    aggregation_status_code       BIGINT,
    status                        TEXT,
    customer_id                   TEXT,
    institution_id                TEXT,
    balance_date                  BIGINT,
    aggregation_success_date      BIGINT,
    aggregation_attempt_date      BIGINT,
    created_date                  BIGINT,
    currency                      TEXT,
    last_transaction_date         BIGINT,
    oldest_transaction_date       BIGINT,
    institution_login_id          BIGINT,
    last_updated_date             BIGINT,
    detail_margin                 DECIMAL(24, 4),
    detail_margin_allowed         BOOLEAN,
    detail_cash_account_allowed   BOOLEAN,
    detail_description            TEXT,
    detail_margin_balance         DECIMAL(24, 4),
    detail_short_balance          DECIMAL(24, 4),
    detail_available_cash_balance DECIMAL(24, 4),
    detail_current_balance        DECIMAL(24, 4),
    detail_date_as_of             BIGINT,
    display_position              BIGINT,
    parent_account                BIGINT,
    account_nickname              TEXT,
    market_segment                TEXT,
    updated_at                    TIMESTAMPTZ DEFAULT NOW()            NOT NULL,
    created_at                    TIMESTAMPTZ DEFAULT NOW()            NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE finicity_holding
(
    id                         BIGSERIAL                               NOT NULL,
    finicity_account_id        BIGINT REFERENCES finicity_account (id) NOT NULL,
    holding_id                 BIGINT UNIQUE,
    security_id_type           TEXT,
    pos_type                   TEXT,
    sub_account_type           TEXT,
    description                TEXT,
    symbol                     TEXT,
    cusip_no                   TEXT,
    current_price              DECIMAL(24, 4),
    transaction_type           TEXT,
    market_value               TEXT,
    security_unit_price        DECIMAL(24, 4),
    units                      DECIMAL(24, 4),
    cost_basis                 DECIMAL(24, 4),
    status                     TEXT,
    security_type              TEXT,
    security_name              TEXT,
    security_currency          TEXT,
    current_price_date         BIGINT,
    option_strike_price        DECIMAL(24, 4),
    option_type                TEXT,
    option_shares_per_contract DECIMAL(24, 4),
    options_expire_date        BIGINT,
    fi_asset_class             TEXT,
    asset_class                TEXT,
    currency_rate              DECIMAL(24, 4),
    cost_basis_per_share       DECIMAL(24, 4),
    mf_type                    TEXT,
    total_gl_dollar            DECIMAL(24, 4),
    total_gl_percent           DECIMAL(24, 4),
    today_gl_dollar            DECIMAL(24, 4),
    today_gl_percent           DECIMAL(24, 4),
    updated_at                 TIMESTAMPTZ DEFAULT NOW()               NOT NULL,
    created_at                 TIMESTAMPTZ DEFAULT NOW()               NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE finicity_transaction
(
    id                                   BIGSERIAL                               NOT NULL,
    internal_finicity_account_id         BIGINT REFERENCES finicity_account (id) NOT NULL,
    transaction_id                       BIGINT                                  NOT NULL UNIQUE,
    amount                               DECIMAL(24, 4),
    account_id                           TEXT,
    customer_id                          TEXT,
    status                               TEXT,
    description                          TEXT,
    memo                                 TEXT,
    type                                 TEXT,
    unit_quantity                        DECIMAL(24, 4),
    fee_amount                           DECIMAL(24, 4),
    cusip_no                             TEXT,
    posted_date                          BIGINT,
    transaction_date                     BIGINT,
    created_date                         BIGINT,
    categorization_normalized_payee_name TEXT,
    categorization_category              TEXT,
    categorization_country               TEXT,
    categorization_best_representation   TEXT,
    commission_amount                    DECIMAL(24, 4),
    ticker                               TEXT,
    unit_price                           DECIMAL(24, 4),
    investment_transaction_type          TEXT                                    NOT NULL,
    updated_at                           TIMESTAMPTZ DEFAULT NOW()               NOT NULL,
    created_at                           TIMESTAMPTZ DEFAULT NOW()               NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tradingpost_brokerage_account
(
    id             BIGSERIAL UNIQUE                               NOT NULL,
    user_id        UUID REFERENCES data_user (id)                 NOT NULL,
    institution_id BIGINT REFERENCES tradingpost_institution (id) NOT NULL,
    broker_name    TEXT                                           NOT NULL,
    status         TEXT                                           NOT NULL,
    account_number TEXT                                           NOT NULL,
    mask           TEXT,
    name           TEXT                                           NOT NULL,
    official_name  TEXT,
    type           TEXT                                           NOT NULL,
    subtype        TEXT,
    updated_at     TIMESTAMPTZ DEFAULT now()                      NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT now()                      NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX tp_brokerage_account_user_id_institution_id_account_number_idx ON tradingpost_brokerage_account (user_id, institution_id, account_number);

CREATE TABLE tradingpost_account_group
(
    id                   BIGSERIAL UNIQUE                NOT NULL,
    user_id              UUID REFERENCES data_user (id)  NOT NULL,
    name                 TEXT                            NOT NULL,
    default_benchmark_id BIGINT REFERENCES security (id) NOT NULL,
    updated_at           TIMESTAMPTZ DEFAULT now()       NOT NULL,
    created_at           TIMESTAMPTZ DEFAULT now()       NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX tradingpost_account_group_user_id_name_idx ON tradingpost_account_group (user_id, name);

CREATE TABLE tradingpost_current_holding
(
    id            BIGSERIAL UNIQUE                                     NOT NULL,
    account_id    BIGINT REFERENCES tradingpost_brokerage_account (id) NOT NULL,
    security_id   BIGINT REFERENCES security (id)                      NOT NULL,
    security_type TEXT,
    price         DECIMAL(24, 4)                                       NOT NULL,
    price_as_of   TIMESTAMPTZ                                          NOT NULL,
    price_source  TEXT                                                 NOT NULL,
    value         DECIMAL(24, 4)                                       NOT NULL,
    cost_basis    DECIMAL(24, 4),
    quantity      DECIMAL(24, 4)                                       NOT NULL,
    currency      TEXT,
    updated_at    TIMESTAMPTZ                                          NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ                                          NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX tradingpost_current_holding_account_id_security_id_idx ON tradingpost_current_holding (account_id, security_id);

CREATE TABLE tradingpost_historical_holding
(
    id            BIGSERIAL UNIQUE                                     NOT NULL,
    account_id    BIGINT REFERENCES tradingpost_brokerage_account (id) NOT NULL,
    security_id   BIGINT REFERENCES security (id)                      NOT NULL,
    security_type TEXT,
    price         DECIMAL(24, 4)                                       NOT NULL,
    price_as_of   TIMESTAMPTZ                                          NOT NULL,
    price_source  TEXT                                                 NOT NULL,
    value         DECIMAL(24, 4)                                       NOT NULL,
    cost_basis    DECIMAL(24, 4),
    quantity      DECIMAL(24, 4)                                       NOT NULL,
    currency      TEXT,
    date          TIMESTAMPTZ                                          NOT NULL,
    updated_at    TIMESTAMPTZ DEFAULT now()                            NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()                            NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tradingpost_custom_industry
(
    id          BIGSERIAL UNIQUE                NOT NULL,
    user_id     UUID REFERENCES data_user (id)  NOT NULL,
    security_id BIGINT REFERENCES security (id) NOT NULL,
    industry    TEXT                            NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()       NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX tradingpost_custom_industry_user_security_industry ON tradingpost_custom_industry (user_id, security_id, industry);

CREATE TABLE tradingpost_transaction
(
    id            BIGSERIAL UNIQUE                                     NOT NULL,
    account_id    BIGINT REFERENCES tradingpost_brokerage_account (id) NOT NULL,
    security_id   BIGINT REFERENCES security (id)                      NOT NULL,
    security_type TEXT,
    date          TIMESTAMPTZ                                          NOT NULL,
    quantity      DECIMAL(24, 4)                                       NOT NULL,
    price         DECIMAL(24, 4)                                       NOT NULL,
    amount        DECIMAL(24, 4)                                       NOT NULL,
    fees          DECIMAL(24, 4),
    type          TEXT                                                 NOT NULL,
    currency      TEXT,
    updated_at    TIMESTAMPTZ DEFAULT now()                            NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()                            NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tradingpost_account_group_stat
(
    id                   BIGSERIAL UNIQUE                                 NOT NULL,
    account_group_id     BIGINT REFERENCES tradingpost_account_group (id) NOT NULL,
    beta                 DECIMAL(24, 4),
    sharpe               DECIMAL(20, 8),
    industry_allocations JSONB,
    exposure             JSONB,
    date                 TIMESTAMPTZ                                      NOT NULL,
    benchmark_id         BIGINT REFERENCES security (id),
    updated_at           TIMESTAMPTZ DEFAULT now()                        NOT NULL,
    created_at           TIMESTAMPTZ DEFAULT now()                        NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX tradingpost_account_group_stat_account_group_id_date_idx ON tradingpost_account_group_stat (account_group_id, date);

CREATE TABLE _tradingpost_account_to_group
(
    id               BIGSERIAL UNIQUE                                     NOT NULL,
    account_id       BIGINT REFERENCES tradingpost_brokerage_account (id) NOT NULL,
    account_group_id BIGINT REFERENCES tradingpost_account_group (id)     NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX _tradingpost_account_to_group_account_id_account_group_id_idx ON _tradingpost_account_to_group (account_id, account_group_id);

CREATE TABLE benchmark_hpr
(
    id          BIGSERIAL UNIQUE                NOT NULL,
    security_id BIGINT REFERENCES security (id) NOT NULL,
    date        TIMESTAMPTZ                     NOT NULL,
    return      DECIMAL(24, 4),
    updated_at  TIMESTAMPTZ DEFAULT now()       NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()       NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX benchmark_hpr_security_id_date_idx ON benchmark_hpr (security_id, date);

CREATE TABLE account_group_hpr
(
    id               BIGSERIAL UNIQUE                                 NOT NULL,
    account_group_id BIGINT REFERENCES tradingpost_account_group (id) NOT NULL,
    date             TIMESTAMPTZ                                      NOT NULL,
    return           DECIMAL(24, 4),
    updated_at       TIMESTAMPTZ DEFAULT now()                        NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT now()                        NOT NULL,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX account_group_hpr_account_group_id_date_idx ON account_group_hpr (account_group_id, date);

ALTER TABLE security_price
    ADD COLUMN open DECIMAL(24, 4);
ALTER TABLE security_price
    ADD COLUMN high DECIMAL(24, 4);
ALTER TABLE security_price
    ADD COLUMN low DECIMAL(24, 4);

DROP INDEX security_price_idx;

CREATE UNIQUE INDEX security_price_idx ON security_price (security_id, time DESC);
CREATE INDEX security_price_idx_time ON security_price (time DESC);
ALTER TABLE security
    ADD COLUMN enable_utp BOOLEAN DEFAULT FALSE;

ALTER TABLE tradingpost_account_group ADD CONSTRAINT name_userid_unique UNIQUE (name, user_id);