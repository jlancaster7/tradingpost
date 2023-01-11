/* No changes to data_alert [alert]*/

CREATE  TABLE data_block_list(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    blocked_user_id UUID,
    blocked_by_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

/* No changes to data_bookmark [bookmark]*/

/* No changes to data_brokerage [brokerage]*/

/* No changes to data_comment [comment]*/

/* No changes to ibkr_account [ibkr]*/

/* No changes to data_notification [notification]*/

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

/* No changes to data_user [user]*/

/* No changes to data_watchlist [watchlist]*/

/* No changes to data_watchlist_item [watchlist_item]*/

/* No changes to data_watchlist_saved [watchlist_saved]*/