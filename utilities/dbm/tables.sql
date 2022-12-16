/* No changes to data_alert [alert]*/

/* No changes to data_bookmark [bookmark]*/

CREATE  TABLE data_brokerage(
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

/* No changes to data_comment [comment]*/

/* No changes to ibkr_account [ibkr]*/

CREATE  TABLE data_notification(
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

/* No changes to data_platform_claim [platform_claim]*/

/* No changes to data_post [post]*/

/* No changes to data_subscriber [subscriber]*/

/* No changes to data_subscription [subscription]*/

CREATE  TABLE tradingpost_transactio(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    account_id BIGINT,
    security_id TEXT,
    security_type TEXT,
    date TEXT,
    quantity MONEY,
    price MONEY,
    amount MONEY,
    fees MONEY,
    type TEXT,
    currency TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

/* No changes to data_upvote [upvote]*/

ALTER TABLE data_user
ADD COLUMN is_deleted BOOLEAN;

/* No changes to data_watchlist [watchlist]*/

/* No changes to data_watchlist_item [watchlist_item]*/

/* No changes to data_watchlist_saved [watchlist_saved]*/