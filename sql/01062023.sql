CREATE TABLE flagged_content_log
(
    id               BIGSERIAL                      NOT NULL,
    post_id          TEXT                           NOT NULL,
    user_reporter_id UUID REFERENCES data_user (id) NOT NULL,
    reason           TEXT                           NOT NULL,
    status           TEXT                           NOT NULL, -- Field used to indicate whats happened with the current post(REPORTED/REMOVED/HANDLED/etc...)
    updated_at       TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at       TIMESTAMPTZ                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

ALTER TABLE brokerage_task
    ADD COLUMN message_id TEXT UNIQUE;

ALTER TABLE tradingpost_brokerage_account
    ADD COLUMN authentication_service TEXT;