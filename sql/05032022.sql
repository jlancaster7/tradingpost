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
    SELECT d ->> 'securityId' as security_id,
           d ->> 'price'      as price,
           d ->> 'time'       as time
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
                                     year_5_change_percent, year_1_change_percent, ytd_change_percent,
                                     month_6_change_percent, month_3_change_percent, month_1_change_percent,
                                     day_30_change_percent, day_5_change_percent, last_updated)
    SELECT d ->> 'securityId'                as security_id,
           d ->> 'calculationPrice'          as calculation_price,
           d ->> 'delayedPrice'              as delayed_price,
           d ->> 'delayedPriceTime'          as delayed_price_time,
           d ->> 'oddLotDelayedPrice'        as odd_lot_delayed_price,
           d ->> 'oddLotDelayedPriceTime'    as odd_lot_delayed_price_time,
           d ->> 'extendedPrice'             as extended_price,
           d ->> 'extendedChange'            as extended_change,
           d ->> 'extendedChangePercent'     as extended_change_percent,
           d ->> 'extendedPriceTime'         as extended_price_time,
           d ->> 'previousClose'             as previous_close,
           d ->> 'previousVolume'            as previous_volume,
           d ->> 'avgTotalVolume'            as avg_total_volume,
           d ->> 'marketCap'                 as market_cap,
           d ->> 'peRatio'                   as pe_ratio,
           d ->> 'week52High'                as week_52_high,
           d ->> 'week52Low'                 as week_52_low,
           d ->> 'ytdChange'                 as ytd_change,
           d ->> 'lastTradeTime'             as last_trade_time,
           d ->> 'currency'                  as currency,
           d ->> 'close'                     as close,
           d ->> 'high'                      as high,
           d ->> 'low'                       as low,
           d ->> 'open'                      as open,
           d ->> 'volume'                    as volume,
           d ->> 'marketChangeOverTime'      as market_change_over_time,
           d ->> 'unadjustedOpen'            as unadjusted_open,
           d ->> 'unadjustedClose'           as unadjusted_close,
           d ->> 'unadjustedLow'             as unadjusted_low,
           d ->> 'unadjustedVolume'          as unadjusted_volume,
           d ->> 'fullyAdjustedOpen'         as fully_adjusted_open,
           d ->> 'fullyAdjustedClose'        as fully_adjusted_close,
           d ->> 'fullyAdjustedLow'          as fully_adjusted_low,
           d ->> 'fullyAdjustedVolume'       as fully_adjusted_volume,
           d ->> 'label'                     as label,
           d ->> 'change'                    as change,
           d ->> 'changePercent'             as change_percent,
           d ->> 'week52HighSplitAdjustOnly' as week_52_high_split_adjust_only,
           d ->> 'week52LowSplitAdjustOnly'  as week_52_low_split_adjust_only,
           d ->> 'week52Change'              as week_52_change,
           d ->> 'sharesOutstanding'         as shares_outstanding,
           d ->> 'float'                     as float,
           d ->> 'avg10Volume'               as avg_10_volume,
           d ->> 'avg30Volume'               as avg_30_volume,
           d ->> 'day200MovingAvg'           as day_200_moving_avg,
           d ->> 'day50MovingAvg'            as day_50_moving_avg,
           d ->> 'employees'                 as employees,
           d ->> 'ttmEps'                    as ttm_eps,
           d ->> 'ttmDividendRate'           as ttm_dividend_rate,
           d ->> 'dividendYield'             as dividend_yield,
           d ->> 'nextDividendDate'          as next_dividend_date,
           d ->> 'exDividendDate'            as ex_dividend_date,
           d ->> 'nextEarningsDate'          as next_earnings_date,
           d ->> 'beta'                      as beta,
           d ->> 'maxChangePercent'          as max_change_percent,
           d ->> 'year5ChangePercent'        as year_5_change_percent,
           d ->> 'year2ChangePercent'        as year_2_change_percent,
           d ->> 'year1ChangePercent'        as year_1_change_percent,
           d ->> 'ytdChangePercent'          as ytd_change_percent,
           d ->> 'month6ChangePercent'       as month_6_change_percent,
           d ->> 'month3ChangePercent'       as month_3_change_percent,
           d ->> 'month1ChangePercent'       as month_1_change_percent,
           d ->> 'day30ChangePercent'        as day_30_change_percent,
           d ->> 'day5ChangePercent'         as day_5_change_percent,
           now()                             as last_updated
    from json_array_elements(data) as d
    ON CONFLICT (security_id) DO UPDATE
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