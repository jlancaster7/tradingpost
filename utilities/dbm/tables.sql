/* No changes to data_alert [alert]*/

/* No changes to data_bookmark [bookmark]*/

/* No changes to data_comment [comment]*/

/* No changes to data_platform_claim [platform_claim]*/

/* No changes to data_post [post]*/

/* No changes to data_subscriber [subscriber]*/

CREATE  TABLE data_subscription(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    user_id UUID,
    name TEXT,
    cost MONEY,
    settings JSON,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

/* No changes to data_upvote [upvote]*/

/* No changes to data_user [user]*/

/* No changes to data_watchlist [watchlist]*/

/* No changes to data_watchlist_item [watchlist_item]*/

/* No changes to data_watchlist_saved [watchlist_saved]*/