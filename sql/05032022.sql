-- Pull in OTC & normal equities
CREATE TABLE securities
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

CREATE TABLE security_prices
(
    id          BIGSERIAL                         NOT NULL,
    security_id BIGINT REFERENCES securities (id) NOT NULL,
    price       DECIMAL(24, 4)                    NOT NULL,
    time        TIMESTAMPTZ                       NOT NULL,
    created_at  TIMESTAMPTZ                       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX security_prices_idx ON security_prices (security_id, time);

CREATE TABLE security_information
(
    id                             BIGSERIAL                         NOT NULL,
    security_id                    BIGINT REFERENCES securities (id) NOT NULL UNIQUE,
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
    last_updated                   TIMESTAMPTZ                       NOT NULL DEFAULT NOW(),
    created_at                     TIMESTAMPTZ                       NOT NULL DEFAULT NOW(),
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

CREATE TABLE us_exchange_holidays
(
    id              BIGSERIAL   NOT NULL,
    date            DATE        NOT NULL UNIQUE,
    settlement_date DATE        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE FUNCTION add_us_exchange_holidays(data json) returns void
AS
$$
BEGIN
    INSERT INTO us_exchange_holidays(date, settlement_date)
    SELECT cast(d ->> 'date' as DATE)            as date,
           cast(d ->> 'settlement_date' as DATE) as settlement_date
    from json_array_elements(data) as d
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION add_exchanges(data json) returns void
AS
$$
BEGIN
    INSERT INTO exchanges(name, long_name, mic, tape_id, oats_id, ref_id, type, region, description, segment,
                          segment_description, suffix, exchange_suffix)
    SELECT d ->> 'name'               as name,
           d ->> 'longName'           as long_name,
           d ->> 'mic'                as mic,
           d ->> 'tapeId'             as tape_id,
           d ->> 'oatsId'             as oats_id,
           d ->> 'refId'              as ref_id,
           d ->> 'type'               as type,
           d ->> 'region'             as region,
           d ->> 'description'        as description,
           d ->> 'segment'            as segment,
           d ->> 'segmentDescription' as segment_description,
           d ->> 'suffix'             as suffix,
           d ->> 'exchangeSuffix'     as exchange_suffix
    from json_array_elements(data) as d
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION add_securities_prices(data json) RETURNS VOID
AS
$$
BEGIN
    INSERT INTO security_prices(security_id, price, time)
    SELECT CAST(d ->> 'securityId' AS BIGINT) as security_id,
           CAST(d ->> 'price' AS DECIMAL)     as price,
           CAST(d ->> 'time' AS TIMESTAMPTZ)  as time
    from JSON_ARRAY_ELEMENTS(data) as d
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION upsert_securities_prices(data json) returns void
AS
$$
BEGIN
    INSERT INTO security_prices(security_id, price, time)
    SELECT CAST(d ->> 'securityId' as BIGINT) as security_id,
           CAST(d ->> 'price' AS DECIMAL)     as price,
           CAST(d ->> 'time' AS TIMESTAMPTZ)  as time
    from json_array_elements(data) as d
    ON CONFLICT (security_id, time) DO UPDATE
        SET price=EXCLUDED.price;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION upsert_company_information(data json) returns void
AS
$$
BEGIN
    INSERT INTO security_information(security_id, calculation_price, delayed_price, delayed_price_time,
                                     odd_lot_delayed_price, odd_lot_delayed_price_time, extended_price, extended_change,
                                     extended_change_percent, extended_price_time, previous_close, previous_volume,
                                     avg_total_volume, market_cap, pe_ratio, week_52_high, week_52_low, ytd_change,
                                     last_trade_time, currency, close, high, low, open, volume, market_change_over_time,
                                     unadjusted_open, unadjusted_close, unadjusted_low, unadjusted_volume,
                                     fully_adjusted_open, fully_adjusted_close, fully_adjusted_high, fully_adjusted_low,
                                     fully_adjusted_volume, label, change, change_percent,
                                     week_52_high_split_adjust_only, week_52_low_split_adjust_only, week_52_change,
                                     shares_outstanding, float, avg_10_volume, avg_30_volume, day_200_moving_avg,
                                     day_50_moving_avg, employees, ttm_eps, ttm_dividend_rate, dividend_yield,
                                     next_dividend_date, ex_dividend_date, next_earnings_date, beta, max_change_percent,
                                     year_5_change_percent, year_2_change_percent, year_1_change_percent,
                                     ytd_change_percent, month_6_change_percent, month_3_change_percent,
                                     month_1_change_percent, day_30_change_percent, day_5_change_percent, last_updated)
    SELECT CAST(d ->> 'securityId' as BIGINT)                 as security_id,
           d ->> 'calculationPrice'                           as calculation_price,
           CAST(d ->> 'delayedPrice' AS DECIMAL)              as delayed_price,
           CAST(d ->> 'delayedPriceTime' AS BIGINT)           as delayed_price_time,
           CAST(d ->> 'oddLotDelayedPrice' AS DECIMAL)        as odd_lot_delayed_price,
           CAST(d ->> 'oddLotDelayedPriceTime' AS BIGINT)     as odd_lot_delayed_price_time,
           CAST(d ->> 'extendedPrice' AS DECIMAL)             as extended_price,
           CAST(d ->> 'extendedChange' AS DECIMAL)            as extended_change,
           CAST(d ->> 'extendedChangePercent' AS DECIMAL)     as extended_change_percent,
           CAST(d ->> 'extendedPriceTime' AS BIGINT)          as extended_price_time,
           CAST(d ->> 'previousClose' AS DECIMAL)             as previous_close,
           CAST(d ->> 'previousVolume' AS DECIMAL)            as previous_volume,
           CAST(d ->> 'avgTotalVolume' AS DECIMAL)            as avg_total_volume,
           CAST(d ->> 'marketCap' AS DECIMAL)                 as market_cap,
           CAST(d ->> 'peRatio' AS DECIMAL)                   as pe_ratio,
           CAST(d ->> 'week52High' AS DECIMAL)                as week_52_high,
           CAST(d ->> 'week52Low' AS DECIMAL)                 as week_52_low,
           CAST(d ->> 'ytdChange' AS DECIMAL)                 as ytd_change,
           CAST(d ->> 'lastTradeTime' AS BIGINT)              as last_trade_time,
           CAST(d ->> 'currency' AS TEXT)                     as currency,
           CAST(d ->> 'close' AS DECIMAL)                     as close,
           CAST(d ->> 'high' AS DECIMAL)                      as high,
           CAST(d ->> 'low' AS DECIMAL)                       as low,
           CAST(d ->> 'open' AS DECIMAL)                      as open,
           CAST(d ->> 'volume' AS DECIMAL)                    as volume,
           CAST(d ->> 'marketChangeOverTime' AS DECIMAL)      as market_change_over_time,
           CAST(d ->> 'unadjustedOpen' AS DECIMAL)            as unadjusted_open,
           CAST(d ->> 'unadjustedClose' AS DECIMAL)           as unadjusted_close,
           CAST(d ->> 'unadjustedLow' AS DECIMAL)             as unadjusted_low,
           CAST(d ->> 'unadjustedVolume' AS DECIMAL)          as unadjusted_volume,
           CAST(d ->> 'fullyAdjustedOpen' AS DECIMAL)         as fully_adjusted_open,
           CAST(d ->> 'fullyAdjustedClose' AS DECIMAL)        as fully_adjusted_close,
           CAST(d ->> 'fullyAdjustedHigh' AS DECIMAL)         as fully_adjusted_high,
           CAST(d ->> 'fullyAdjustedLow' AS DECIMAL)          as fully_adjusted_low,
           CAST(d ->> 'fullyAdjustedVolume' AS DECIMAL)       as fully_adjusted_volume,
           CAST(d ->> 'label' AS TEXT)                        as label,
           CAST(d ->> 'change' AS DECIMAL)                    as change,
           CAST(d ->> 'changePercent' AS DECIMAL)             as change_percent,
           CAST(d ->> 'week52HighSplitAdjustOnly' AS DECIMAL) as week_52_high_split_adjust_only,
           CAST(d ->> 'week52LowSplitAdjustOnly' AS DECIMAL)  as week_52_low_split_adjust_only,
           CAST(d ->> 'week52Change' AS DECIMAL)              as week_52_change,
           CAST(d ->> 'sharesOutstanding' AS DECIMAL)         as shares_outstanding,
           CAST(d ->> 'float' AS DECIMAL)                     as float,
           CAST(d ->> 'avg10Volume' AS DECIMAL)               as avg_10_volume,
           CAST(d ->> 'avg30Volume' AS DECIMAL)               as avg_30_volume,
           CAST(d ->> 'day200MovingAvg' AS DECIMAL)           as day_200_moving_avg,
           CAST(d ->> 'day50MovingAvg' AS DECIMAL)            as day_50_moving_avg,
           CAST(d ->> 'employees' AS DECIMAL)                 as employees,
           CAST(d ->> 'ttmEps' AS DECIMAL)                    as ttm_eps,
           CAST(d ->> 'ttmDividendRate' AS DECIMAL)           as ttm_dividend_rate,
           CAST(d ->> 'dividendYield' AS DECIMAL)             as dividend_yield,
           CAST(d ->> 'nextDividendDate' AS TEXT)             as next_dividend_date,
           CAST(d ->> 'exDividendDate' AS TEXT)               as ex_dividend_date,
           CAST(d ->> 'nextEarningsDate' AS TEXT)             as next_earnings_date,
           CAST(d ->> 'beta' AS DECIMAL)                      as beta,
           CAST(d ->> 'maxChangePercent' AS DECIMAL)          as max_change_percent,
           CAST(d ->> 'year5ChangePercent' AS DECIMAL)        as year_5_change_percent,
           CAST(d ->> 'year2ChangePercent' AS DECIMAL)        as year_2_change_percent,
           CAST(d ->> 'year1ChangePercent' AS DECIMAL)        as year_1_change_percent,
           CAST(d ->> 'ytdChangePercent' AS DECIMAL)          as ytd_change_percent,
           CAST(d ->> 'month6ChangePercent' AS DECIMAL)       as month_6_change_percent,
           CAST(d ->> 'month3ChangePercent' AS DECIMAL)       as month_3_change_percent,
           CAST(d ->> 'month1ChangePercent' AS DECIMAL)       as month_1_change_percent,
           CAST(d ->> 'day30ChangePercent' AS DECIMAL)        as day_30_change_percent,
           CAST(d ->> 'day5ChangePercent' AS DECIMAL)         as day_5_change_percent,
           now()                                              as last_updated
    from json_array_elements(data) as d
    ON CONFLICT (security_id)
        DO UPDATE
        SET calculation_price=EXCLUDED.calculation_price,
            delayed_price=EXCLUDED.delayed_price,
            delayed_price_time=EXCLUDED.delayed_price_time,
            odd_lot_delayed_price=EXCLUDED.odd_lot_delayed_price,
            odd_lot_delayed_price_time=EXCLUDED.odd_lot_delayed_price_time,
            extended_price=EXCLUDED.extended_price,
            extended_change=EXCLUDED.extended_change,
            extended_change_percent=EXCLUDED.extended_change_percent,
            extended_price_time=EXCLUDED.extended_price_time,
            previous_close=EXCLUDED.previous_close,
            previous_volume=EXCLUDED.previous_volume,
            avg_total_volume=EXCLUDED.avg_total_volume,
            market_cap=EXCLUDED.market_cap,
            pe_ratio=EXCLUDED.pe_ratio,
            week_52_high=EXCLUDED.week_52_high,
            week_52_low=EXCLUDED.week_52_low,
            ytd_change=EXCLUDED.ytd_change,
            last_trade_time=EXCLUDED.last_trade_time,
            currency=EXCLUDED.currency,
            close=EXCLUDED.close,
            high=EXCLUDED.high,
            low=EXCLUDED.low,
            open=EXCLUDED.open,
            volume=EXCLUDED.volume,
            market_change_over_time=EXCLUDED.market_change_over_time,
            unadjusted_open=EXCLUDED.unadjusted_open,
            unadjusted_close=EXCLUDED.unadjusted_close,
            unadjusted_low=EXCLUDED.unadjusted_low,
            unadjusted_volume=EXCLUDED.unadjusted_volume,
            fully_adjusted_open=EXCLUDED.fully_adjusted_open,
            fully_adjusted_close=EXCLUDED.fully_adjusted_close,
            fully_adjusted_high=EXCLUDED.fully_adjusted_high,
            fully_adjusted_low=EXCLUDED.fully_adjusted_low,
            fully_adjusted_volume=EXCLUDED.fully_adjusted_volume,
            label=EXCLUDED.label,
            change=EXCLUDED.change,
            change_percent=EXCLUDED.change_percent,
            week_52_high_split_adjust_only=EXCLUDED.week_52_high_split_adjust_only,
            week_52_low_split_adjust_only=EXCLUDED.week_52_low_split_adjust_only,
            week_52_change=EXCLUDED.week_52_change,
            shares_outstanding=EXCLUDED.shares_outstanding,
            float=EXCLUDED.float,
            avg_10_volume=EXCLUDED.avg_10_volume,
            avg_30_volume=EXCLUDED.avg_30_volume,
            day_200_moving_avg=EXCLUDED.day_200_moving_avg,
            day_50_moving_avg=EXCLUDED.day_50_moving_avg,
            employees=EXCLUDED.employees,
            ttm_eps=EXCLUDED.ttm_eps,
            ttm_dividend_rate=EXCLUDED.ttm_dividend_rate,
            dividend_yield=EXCLUDED.dividend_yield,
            next_dividend_date=EXCLUDED.next_dividend_date,
            ex_dividend_date=EXCLUDED.ex_dividend_date,
            next_earnings_date=EXCLUDED.next_earnings_date,
            beta=EXCLUDED.beta,
            max_change_percent=EXCLUDED.max_change_percent,
            year_5_change_percent=EXCLUDED.year_5_change_percent,
            year_2_change_percent=EXCLUDED.year_2_change_percent,
            year_1_change_percent=EXCLUDED.year_1_change_percent,
            ytd_change_percent=EXCLUDED.ytd_change_percent,
            month_6_change_percent=EXCLUDED.month_6_change_percent,
            month_3_change_percent=EXCLUDED.month_3_change_percent,
            month_1_change_percent=EXCLUDED.month_1_change_percent,
            day_30_change_percent=EXCLUDED.day_30_change_percent,
            day_5_change_percent=EXCLUDED.day_5_change_percent,
            last_updated=now();
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_exchanges()
    RETURNS TABLE
            (
                id                  BIGINT,
                name                TEXT,
                long_name           TEXT,
                mic                 TEXT,
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
                last_updated        TIMESTAMPTZ,
                created_at          TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT e.id                  as id
             , e.name                as name
             , e.long_name           as long_name
             , e.mic                 as mic
             , e.tape_id             as tape_id
             , e.oats_id             as oats_id
             , e.ref_id              as ref_id
             , e.type                as type
             , e.region              as region
             , e.description         as description
             , e.segment             as segment
             , e.segment_description as segment_description
             , e.suffix              as suffix
             , e.exchange_suffix     as exchange_suffix
             , e.last_updated        as last_updated
             , e.created_at          as created_at
        from exchanges as e;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_us_exchange_holidays()
    RETURNS TABLE
            (
                id              BIGINT,
                date            DATE,
                settlement_date DATE,
                created_at      TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT h.id              as id,
               h.date            as date,
               h.settlement_date as settlement_date,
               h.created_at      as created_at
        from us_exchange_holidays as h;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_current_and_future_us_exchange_holidays()
    RETURNS TABLE
            (
                id              BIGINT,
                date            DATE,
                settlement_date DATE,
                created_at      TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT h.id              as id,
               h.date            as date,
               h.settlement_date as settlement_date,
               h.created_at      as created_at
        from us_exchange_holidays as h
        WHERE h.date >= now()::date;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION add_securities(data json)
    returns TABLE
            (
                new_id     bigint,
                new_symbol text
            )
AS
$$
BEGIN
    RETURN QUERY
        INSERT INTO securities (symbol, company_name, exchange, industry, website, description, ceo, security_name,
                                issue_type, sector, primary_sic_code, employees, address, address2, state, zip,
                                country, phone, logo_url, tags, last_updated)
            SELECT d ->> 'symbol'                                                as symbol,
                   d ->> 'companyName'                                           as company_name,
                   d ->> 'exchange'                                              as exchange,
                   d ->> 'industry'                                              as industry,
                   d ->> 'website'                                               as website,
                   d ->> 'description'                                           as description,
                   d ->> 'ceo'                                                   as ceo,
                   d ->> 'securityName'                                          as security_name,
                   d ->> 'issueType'                                             as issue_type,
                   d ->> 'sector'                                                as sector,
                   d ->> 'primarySicCode'                                        as primary_sic_code,
                   d ->> 'employees'                                             as employees,
                   d ->> 'address'                                               as address,
                   d ->> 'address2'                                              as address2,
                   d ->> 'state'                                                 as state,
                   d ->> 'zip'                                                   as zip,
                   d ->> 'country'                                               as country,
                   d ->> 'phone'                                                 as phone,
                   d ->> 'logoUrl'                                               as logo_url,
                   array(SELECT json_array_elements(cast(d ->> 'tags' AS json))) AS tags,
                   now()                                                         as last_updated
            FROM json_array_elements(data) as d
            ON CONFLICT DO NOTHING RETURNING id, symbol;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_security_by_symbol(reqSymbol text)
    RETURNS TABLE
            (
                id               BIGINT,
                symbol           TEXT,
                company_name     TEXT,
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
                last_updated     TIMESTAMPTZ,
                created_at       TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id               as id,
               s.symbol           as symbol,
               s.company_name     as company_name,
               s.exchange         as exchange,
               s.industry         as industry,
               s.website          as website,
               s.description      as description,
               s.ceo              as ceo,
               s.security_name    as security_name,
               s.issue_type       as issue_type,
               s.sector           as sector,
               s.primary_sic_code as primary_sic_code,
               s.employees        as employees,
               s.tags             as tags,
               s.address          as address,
               s.address2         as address2,
               s.state            as state,
               s.zip              as zip,
               s.country          as country,
               s.phone            as phone,
               s.logo_url         as logo_url,
               s.last_updated     as last_updated,
               s.created_at       as created_a
        from securities as s
        where s.symbol = reqSymbol;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_securities_by_symbols(symbols json)
    RETURNS TABLE
            (
                id               BIGINT,
                symbol           TEXT,
                company_name     TEXT,
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
                last_updated     TIMESTAMPTZ,
                created_at       TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id               as id,
               s.symbol           as symbol,
               s.company_name     as company_name,
               s.exchange         as exchange,
               s.industry         as industry,
               s.website          as website,
               s.description      as description,
               s.ceo              as ceo,
               s.security_name    as security_name,
               s.issue_type       as issue_type,
               s.sector           as sector,
               s.primary_sic_code as primary_sic_code,
               s.employees        as employees,
               s.tags             as tags,
               s.address          as address,
               s.address2         as address2,
               s.state            as state,
               s.zip              as zip,
               s.country          as country,
               s.phone            as phone,
               s.logo_url         as logo_url,
               s.last_updated     as last_updated,
               s.created_at       as created_at
        FROM securities AS s
        WHERE s.symbol IN (SELECT json_array_elements_text(symbols));
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_securities()
    RETURNS TABLE
            (
                id               BIGINT,
                symbol           TEXT,
                company_name     TEXT,
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
                last_updated     TIMESTAMPTZ,
                created_at       TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id               as id,
               s.symbol           as symbol,
               s.company_name     as company_name,
               s.exchange         as exchange,
               s.industry         as industry,
               s.website          as website,
               s.description      as description,
               s.ceo              as ceo,
               s.security_name    as security_name,
               s.issue_type       as issue_type,
               s.sector           as sector,
               s.primary_sic_code as primary_sic_code,
               s.employees        as employees,
               s.tags             as tags,
               s.address          as address,
               s.address2         as address2,
               s.state            as state,
               s.zip              as zip,
               s.country          as country,
               s.phone            as phone,
               s.logo_url         as logo_url,
               s.last_updated     as last_updated,
               s.created_at       as created_a
        from securities as s;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION get_us_exchange_listed_securities()
    RETURNS TABLE
            (
                id               BIGINT,
                symbol           TEXT,
                company_name     TEXT,
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
                last_updated     TIMESTAMPTZ,
                created_at       TIMESTAMPTZ
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT s.id               as id,
               s.symbol           as symbol,
               s.company_name     as company_name,
               s.exchange         as exchange,
               s.industry         as industry,
               s.website          as website,
               s.description      as description,
               s.ceo              as ceo,
               s.security_name    as security_name,
               s.issue_type       as issue_type,
               s.sector           as sector,
               s.primary_sic_code as primary_sic_code,
               s.employees        as employees,
               s.tags             as tags,
               s.address          as address,
               s.address2         as address2,
               s.state            as state,
               s.zip              as zip,
               s.country          as country,
               s.phone            as phone,
               s.logo_url         as logo_url,
               s.last_updated     as last_updated,
               s.created_at       as created_a
        from securities as s
        where s.exchange not like '%OTC%';
END;
$$ LANGUAGE plpgsql;

CREATE INDEX security_prices_time_brin_idx ON security_prices USING brin (time);

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

CREATE TABLE security_override
(
    id               BIGSERIAL                         NOT NULL,
    security_id      BIGINT REFERENCES securities (id),
    symbol           TEXT                              ,
    company_name     TEXT                              ,
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
    created_at       TIMESTAMPTZ                       NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

ALTER TABLE securities
    ADD COLUMN validated BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX security_override_security_id ON security_override(security_id);