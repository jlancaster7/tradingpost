insert into tradingpost_institution (external_id, name, account_type_description, phone, url_home_app, url_logon_app,
                                     oauth_enabled, url_forgot_password, url_online_registration, class, address_city,
                                     address_state, address_country, address_postal_code, address_address_line_1, email,
                                     status)
values ('', 'Robinhood', 'Brokerage', '', 'https://robinhood.com/', 'https://robinhood.com/', true,
        'https://robinhood.com/forgot_password', 'https://robinhood.com/signup', 'Brokerage', 'Menlo Park',
        'California', 'United States', '94025', '85 Willow Road Menlo Park', '', 'online');
create table robinhood_account
(
    id            bigserial                      not null,
    user_id       uuid references data_user (id) not null,
    username      text                           not null unique,
    device_token  text                           not null,
    status        text                           not null,
    uses_mfa      boolean                        not null,
    access_token  text,
    refresh_token text,
    updated_at    TIMESTAMPTZ                    not null default CURRENT_TIMESTAMP,
    created_at    TIMESTAMPTZ                    not null default CURRENT_TIMESTAMP,
    primary key (id)
);