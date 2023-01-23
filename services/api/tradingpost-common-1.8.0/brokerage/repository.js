"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
class Repository {
    constructor(db, pgp) {
        this.updateErrorStatusOfAccount = (accountId, error, errorCode) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE tradingpost_brokerage_account
                       SET error      = $1,
                           error_code = $2
                       WHERE id = $3`;
            yield this.db.none(query, [error, errorCode, accountId]);
        });
        this.getCashSecurityId = () => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              symbol,
                              company_name,
                              exchange,
                              industry,
                              website,
                              description,
                              ceo,
                              security_name,
                              issue_type,
                              sector,
                              primary_sic_code,
                              employees,
                              tags,
                              address,
                              address2,
                              state,
                              zip,
                              country,
                              phone,
                              logo_url,
                              last_updated,
                              created_at
                       FROM security
                       WHERE symbol = 'USD:CUR'`;
            const r = yield this.db.oneOrNone(query);
            if (!r)
                throw new Error("something happened to cash!!");
            return {
                id: r.id,
                symbol: r.symbol,
                companyName: r.company_name,
                exchange: r.exchange,
                industry: r.industry,
                website: r.website,
                description: r.description,
                ceo: r.ceo,
                securityName: r.security_name,
                issueType: r.issue_type,
                sector: r.sector,
                primarySicCode: r.primary_sic_code,
                employees: r.employees,
                tags: r.tags,
                address: r.address,
                address2: r.address2,
                state: r.state,
                zip: r.zip,
                country: r.country,
                phone: r.phone,
                logoUrl: r.logo_url,
                createdAt: r.created_at,
                lastUpdated: r.last_updated
            };
        });
        this.getFinicityAccountByTradingpostBrokerageAccountId = (tpBrokerageAccountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT fa.id                      AS finicity_internal_account_id,
                   fa.finicity_user_id        AS finicity_internal_user_id,
                   fa.finicity_institution_id AS finicity_internal_institution_id,
                   fa.account_id              AS finicity_account_id,
                   fa.number                  AS account_number,
                   fa.institution_login_id    AS finicity_institution_login_id,
                   tba.id                     AS tradingpost_internal_brokerage_account_id,
                   tba.user_id                AS tradingpost_user_id,
                   tba.institution_id         AS tradingpost_internal_institution_id,
                   tba.status                 AS status,
                   tba.error                  AS error,
                   tba.error_code             AS error_code
            FROM FINICITY_ACCOUNT FA
                     INNER JOIN TRADINGPOST_BROKERAGE_ACCOUNT TBA ON
                        tba.account_number = fa.number
                    AND fa.finicity_institution_id = (SELECT id
                                                      FROM finicity_institution
                                                      WHERE name = (SELECT name
                                                                    FROM TRADINGPOST_INSTITUTION TI
                                                                    WHERE id = TBA.INSTITUTION_ID))
            WHERE tba.id = $1;`;
            const response = yield this.db.one(query, [tpBrokerageAccountId]);
            return {
                finicityInternalAccountId: response.finicity_internal_account_id,
                finicityInternalUserId: response.finicity_internal_user_id,
                finicityInternalInstitutionId: response.finicity_internal_institution_id,
                finicityAccountId: response.finicity_account_id,
                accountNumber: response.account_number,
                finicityInstitutionLoginId: response.finicity_institution_login_id,
                tradingpostInternalBrokerageAccountId: response.tradingpost_internal_brokerage_account_id,
                tradingpostUserId: response.tradingpost_user_id,
                tradingpostInternalInstitutionId: response.tradingpost_internal_institution_id,
                status: response.status,
                error: response.error,
                errorCode: response.error_code
            };
        });
        this.getFinicityAccountByFinicityAccountId = (finicityAccountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT fa.id             AS internal_account_id,
                              fa.account_id     AS finicity_account_id,
                              fa.customer_id    AS finicity_customer_id,
                              fi.name           AS finicity_institution_name,
                              fi.institution_id AS finicity_institution_id
                       FROM FINICITY_ACCOUNT FA
                                INNER JOIN FINICITY_INSTITUTION FI ON
                           fa.FINICITY_INSTITUTION_ID = fi.id
                       WHERE fa.account_id = $1;`;
            const response = yield this.db.one(query, [finicityAccountId]);
            return {
                id: response.id,
                finicityAccountId: response.finicity_account_id,
                finicityCustomerId: response.finicity_customer_id,
                institutionName: response.finicity_institution_name,
                finicityInstitutionId: response.finicity_institution_id
            };
        });
        this.getSecurityPricesWithEndDateBySecurityIds = (startDate, endDate, securityIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              security_id,
                              price,
                              time,
                              high,
                              low,
                              open,
                              created_at
                       FROM security_price
                       WHERE is_eod = true
                         AND time >= $1
                         AND time <= $2
                         AND security_id IN ($3:list)
                       ORDER BY time DESC`;
            const response = yield this.db.query(query, [startDate, endDate, securityIds]);
            return response.map((row) => {
                let o = {
                    id: row.id,
                    securityId: row.security_id,
                    price: row.price,
                    time: luxon_1.DateTime.fromJSDate(row.time),
                    high: row.high,
                    open: row.open,
                    low: row.low,
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at)
                };
                return o;
            });
        });
        this.getMarketHolidays = (endDate) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`SELECT id, date, settlement_date, created_at
                                              FROM us_exchange_holiday
                                              WHERE date > $1
                                              ORDER BY date DESC`, [endDate.toJSDate()]);
            return response.map((row) => {
                let o = {
                    id: row.id,
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                    date: luxon_1.DateTime.fromJSDate(row.date),
                    settlementDate: luxon_1.DateTime.fromJSDate(row.settlement_date),
                };
                return o;
            });
        });
        this.getTradingPostBrokerageAccountsByBrokerage = (userId, brokerageName) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              institution_id,
                              broker_name,
                              status,
                              account_number,
                              mask,
                              name,
                              official_name,
                              type,
                              subtype,
                              updated_at,
                              created_at,
                              error,
                              error_code,
                              hidden_for_deletion,
                              account_status
                       FROM tradingpost_brokerage_account
                       WHERE user_id = $1
                         AND broker_name = $2;`;
            const results = yield this.db.query(query, [userId, brokerageName]);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    name: r.name,
                    status: r.status,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    error: r.error,
                    errorCode: r.error_code,
                    subtype: r.subtype,
                    accountNumber: r.account_number,
                    type: r.type,
                    officialName: r.official_name,
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    userId: r.user_id,
                    mask: r.mask,
                    id: r.id,
                    brokerName: r.broker_name,
                    institutionId: r.institution_id,
                    hiddenForDeletion: r.hidden_for_deletion,
                    accountStatus: r.account_status
                };
                return x;
            });
        });
        this.getTradingPostBrokerageAccount = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              institution_id,
                              broker_name,
                              status,
                              account_number,
                              mask,
                              name,
                              official_name,
                              type,
                              subtype,
                              updated_at,
                              created_at,
                              error,
                              error_code,
                              hidden_for_deletion,
                              account_status
                       FROM tradingpost_brokerage_account
                       WHERE id = $1;`;
            const result = yield this.db.oneOrNone(query, [accountId]);
            return {
                name: result.name,
                status: result.status,
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                userId: result.user_id,
                mask: result.mask,
                id: result.id,
                brokerName: result.broker_name,
                type: result.type,
                subtype: result.subtype,
                accountNumber: result.account_number,
                officialName: result.official_name,
                institutionId: result.institution_id,
                error: result.error,
                errorCode: result.error_code,
                hiddenForDeletion: result.hidden_for_deletion,
                accountStatus: result.account_status
            };
        });
        this.getTradingPostBrokerageAccountCurrentHoldingsWithSecurity = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT tch.id,
                   tch.account_id,
                   tch.security_id,
                   tch.security_type,
                   tch.price,
                   tch.price_as_of,
                   tch.price_source,
                   tch.value,
                   tch.cost_basis,
                   tch.quantity,
                   tch.currency,
                   tch.updated_at,
                   tch.created_at,
                   s.symbol,
                   tch.option_id,
                   tch.holding_date
            FROM tradingpost_current_holding tch
                     LEFT JOIN security s ON s.id = tch.security_id
            WHERE tch.account_id = $1`;
            const result = yield this.db.query(query, [accountId]);
            return result.map((row) => {
                let o = {
                    holdingDate: luxon_1.DateTime.fromJSDate(row.holding_date),
                    optionId: row.option_id,
                    symbol: row.symbol,
                    accountId: row.account_id,
                    id: row.id,
                    updated_at: luxon_1.DateTime.fromJSDate(row.updated_at),
                    created_at: luxon_1.DateTime.fromJSDate(row.create_at),
                    costBasis: row.cost_basis,
                    currency: row.currency,
                    price: row.price,
                    priceAsOf: luxon_1.DateTime.fromJSDate(row.price_as_of),
                    securityId: row.security_id,
                    priceSource: row.price_source,
                    quantity: row.quantity,
                    securityType: row.security_type,
                    value: row.value
                };
                return o;
            });
        });
        this.getTradingPostBrokerageWithMostRecentHolding = (tpUserId, brokerage) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   user_id,
                   INSTITUTION_ID,
                   BROKER_NAME,
                   STATUS,
                   ACCOUNT_NUMBER,
                   mask,
                   name,
                   OFFICIAL_NAME,
                   TYPE,
                   subtype,
                   updated_at,
                   created_at,
                   error,
                   error_code,
                   (SELECT max(holding_date)
                    FROM TRADINGPOST_CURRENT_HOLDING TCH
                    WHERE ACCOUNT_ID = tba.id) as most_recent_holding,
                   account_status
            FROM TRADINGPOST_BROKERAGE_ACCOUNT TBA
            WHERE user_id = $1
              AND BROKER_NAME = $2;`;
            const result = yield this.db.query(query, [tpUserId, brokerage]);
            return result.map((row) => {
                let o = {
                    mostRecentHolding: luxon_1.DateTime.fromJSDate(row.most_recent_holding),
                    id: row.id,
                    name: row.name,
                    status: row.status,
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                    userId: row.user_id,
                    mask: row.mask,
                    accountNumber: row.account_number,
                    type: row.type,
                    updatedAt: luxon_1.DateTime.fromJSDate(row.updated_at),
                    error: row.error,
                    brokerName: row.broker_name,
                    errorCode: row.error_code,
                    subtype: row.subtype,
                    institutionId: row.institution_id,
                    officialName: row.official_name,
                    accountStatus: row.account_status
                };
                return o;
            });
        });
        this.getTradingPostBrokerageAccountCurrentHoldings = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   account_id,
                   security_id,
                   security_type,
                   price,
                   price_as_of,
                   price_source,
                   value,
                   cost_basis,
                   quantity,
                   currency,
                   updated_at,
                   created_at,
                   option_id,
                   holding_date
            FROM tradingpost_current_holding
            WHERE account_id = $1`;
            const result = yield this.db.query(query, [accountId]);
            return result.map((row) => {
                let o = {
                    holdingDate: luxon_1.DateTime.fromJSDate(row.holding_date),
                    optionId: row.option_id,
                    accountId: row.account_id,
                    id: row.id,
                    updated_at: luxon_1.DateTime.fromJSDate(row.updated_at),
                    created_at: luxon_1.DateTime.fromJSDate(row.create_at),
                    costBasis: row.cost_basis,
                    currency: row.currency,
                    price: row.price,
                    priceAsOf: row.price_as_of,
                    securityId: row.security_id,
                    priceSource: row.price_source,
                    quantity: row.quantity,
                    securityType: row.security_type,
                    value: row.value
                };
                return o;
            });
        });
        this.getTradingPostBrokerageAccountTransactions = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   account_id,
                   security_id,
                   security_type,
                   date,
                   quantity,
                   price,
                   amount,
                   fees,
                   type,
                   currency,
                   updated_at,
                   created_at,
                   option_id
            FROM tradingpost_transaction
            WHERE account_id = $1;`;
            const response = yield this.db.query(query, [accountId]);
            return response.map((row) => {
                let o = {
                    optionId: row.option_id,
                    accountId: row.account_id,
                    created_at: luxon_1.DateTime.fromJSDate(row.created_at),
                    updated_at: luxon_1.DateTime.fromJSDate(row.updated_at),
                    id: row.id,
                    amount: row.amount,
                    fees: row.fees,
                    type: row.type,
                    currency: row.currency,
                    date: luxon_1.DateTime.fromJSDate(row.date),
                    quantity: row.quantity,
                    price: row.price,
                    securityId: row.security_id,
                    securityType: row.security_type
                };
                return o;
            });
        });
        this.getTradingPostAccountsWithFinicityNumber = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT tba.id,
                   tba.user_id,
                   tba.institution_id,
                   tba.broker_name,
                   tba.status,
                   tba.account_number,
                   tba.mask,
                   tba.name,
                   tba.official_name,
                   tba.type,
                   tba.subtype,
                   tba.updated_at,
                   tba.created_at,
                   tba.error,
                   tba.error_code,
                   fa.finicity_user_id        internal_finicity_user_id,
                   fa.id                      internal_finicity_account_id,
                   fa.finicity_institution_id internal_finicity_institution_id,
                   fa.account_id              external_finicity_account_id,
                   fa.number                  external_finicity_account_number,
                   tba.hidden_for_deletion,
                   tba.account_status
            FROM TRADINGPOST_BROKERAGE_ACCOUNT TBA
                     INNER JOIN
                 FINICITY_ACCOUNT FA
                 ON
                     fa.number = tba.account_number
            WHERE user_id = $1;`;
            const response = yield this.db.query(query, [userId]);
            return response.map((r) => {
                let o = {
                    id: r.id,
                    accountNumber: r.account_number,
                    type: r.type,
                    subtype: r.subtype,
                    brokerName: r.broker_name,
                    externalFinicityAccountId: r.external_finicity_account_id,
                    externalFinicityAccountNumber: r.external_finicity_account_id,
                    internalFinicityAccountId: r.internal_finicity_account_id,
                    status: r.status,
                    mask: r.mask,
                    institutionId: r.institution_id,
                    userId: r.user_id,
                    internalFinicityInstitutionId: r.internal_finicity_institution_id,
                    internalFinicityUserId: r.internal_finicity_user_id,
                    officialName: r.official_name,
                    name: r.name,
                    errorCode: r.error_code,
                    error: r.error,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    hiddenForDeletion: r.hidden_for_deletion,
                    accountStatus: r.account_status
                };
                return o;
            });
        });
        this.getSecuritiesWithIssue = () => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   symbol,
                   company_name,
                   issue_type
            FROM security;
        `;
            const response = yield this.db.query(query);
            return response.map((r) => {
                let o = {
                    id: r.id,
                    symbol: r.symbol,
                    name: r.name,
                    issueType: r.issue_type
                };
                return o;
            });
        });
        this.getTradingpostCashSecurity = () => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT s.id                  as security_id,
                              cs.from_symbol        as from_symbol,
                              cs.to_security_symbol as to_security_symbol,
                              cs.currency
                       FROM tradingpost_cash_security cs
                                LEFT JOIN security s
                                          ON s.symbol = cs.to_security_symbol;
        `;
            const response = yield this.db.query(query);
            return response.map((r) => {
                let o = {
                    fromSymbol: r.from_symbol,
                    toSecurityId: parseInt(r.security_id),
                    currency: r.currency
                };
                return o;
            });
        });
        this.upsertInstitutions = (institutions) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'external_id', prop: 'externalId' },
                { name: 'name', prop: 'name' },
                { name: 'account_type_description', prop: 'accountTypeDescription' },
                { name: 'phone', prop: 'phone' },
                { name: 'url_home_app', prop: 'urlHomeApp' },
                { name: 'url_logon_app', prop: 'urlLogonApp' },
                { name: 'oauth_enabled', prop: 'oauthEnabled' },
                { name: 'url_forgot_password', prop: 'urlForgotPassword' },
                { name: 'url_online_registration', prop: 'urlOnlineRegistration' },
                { name: 'class', prop: 'class' },
                { name: 'address_city', prop: 'addressCity' },
                { name: 'address_state', prop: 'addressState' },
                { name: 'address_country', prop: 'addressCountry' },
                { name: 'address_postal_code', prop: 'addressPostalCode' },
                { name: 'address_address_line_1', prop: 'addressAddressLine1' },
                { name: 'address_address_line_2', prop: 'addressAddressLine2' },
                { name: 'email', prop: 'email' },
                { name: 'status', prop: 'status' }
            ], { table: 'tradingpost_institution' });
            const query = upsertReplaceQuery(institutions, cs, this.pgp, "external_id");
            yield this.db.none(query);
        });
        this.upsertInstitution = (institution) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'external_id', prop: 'externalId' },
                { name: 'name', prop: 'name' },
                { name: 'account_type_description', prop: 'accountTypeDescription' },
                { name: 'phone', prop: 'phone' },
                { name: 'url_home_app', prop: 'urlHomeApp' },
                { name: 'url_logon_app', prop: 'urlLogonApp' },
                { name: 'oauth_enabled', prop: 'oauthEnabled' },
                { name: 'url_forgot_password', prop: 'urlForgotPassword' },
                { name: 'url_online_registration', prop: 'urlOnlineRegistration' },
                { name: 'class', prop: 'class' },
                { name: 'address_city', prop: 'addressCity' },
                { name: 'address_state', prop: 'addressState' },
                { name: 'address_country', prop: 'addressCountry' },
                { name: 'address_postal_code', prop: 'addressPostalCode' },
                { name: 'address_address_line_1', prop: 'addressAddressLine1' },
                { name: 'address_address_line_2', prop: 'addressAddressLine2' },
                { name: 'email', prop: 'email' },
                { name: 'status', prop: 'status' }
            ], { table: 'tradingpost_institution' });
            const query = upsertReplaceQuery(institution, cs, this.pgp, "external_id") + ' RETURNING id';
            const r = yield this.db.oneOrNone(query);
            return r.id;
        });
        this.getInstitutionByName = (name) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   external_id,
                   name,
                   account_type_description,
                   phone,
                   url_home_app,
                   url_logon_app,
                   oauth_enabled,
                   url_forgot_password,
                   url_online_registration,
                   class,
                   address_city,
                   address_state,
                   address_country,
                   address_postal_code,
                   address_address_line_1,
                   address_address_line_2,
                   email,
                   status,
                   updated_at,
                   created_at
            FROM tradingpost_institution
            WHERE name = $1;`;
            const r = yield this.db.oneOrNone(query, [name]);
            if (r === null)
                return null;
            return {
                id: r.id,
                externalId: r.external_id,
                name: r.name,
                accountTypeDescription: r.account_type_description,
                phone: r.phone,
                urlHomeApp: r.url_home_app,
                urlLogonApp: r.url_logon_app,
                oauthEnabled: r.oauth_enabled,
                urlForgotPassword: r.url_forgot_password,
                urlOnlineRegistration: r.url_online_registration,
                class: r.class,
                addressCity: r.address_city,
                addressState: r.address_state,
                addressCountry: r.address_country,
                addressPostalCode: r.address_postal_code,
                addressAddressLine1: r.address_address_line_1,
                addressAddressLine2: r.address_address_line_2,
                email: r.email,
                status: r.status,
                updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
            };
        });
        this.getInstitutions = () => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   external_id,
                   name,
                   account_type_description,
                   phone,
                   url_home_app,
                   url_logon_app,
                   oauth_enabled,
                   url_forgot_password,
                   url_online_registration,
                   class,
                   address_city,
                   address_state,
                   address_country,
                   address_postal_code,
                   address_address_line_1,
                   address_address_line_2,
                   email,
                   status,
                   updated_at,
                   created_at
            FROM tradingpost_institution;`;
            const response = yield this.db.query(query);
            return response.map((r) => {
                let o = {
                    id: r.id,
                    externalId: r.external_id,
                    name: r.name,
                    accountTypeDescription: r.account_type_description,
                    phone: r.phone,
                    urlHomeApp: r.url_home_app,
                    urlLogonApp: r.url_logon_app,
                    oauthEnabled: r.oauth_enabled,
                    urlForgotPassword: r.url_forgot_password,
                    urlOnlineRegistration: r.url_online_registration,
                    class: r.class,
                    addressCity: r.address_city,
                    addressState: r.address_state,
                    addressCountry: r.address_country,
                    addressPostalCode: r.address_postal_code,
                    addressAddressLine1: r.address_address_line_1,
                    addressAddressLine2: r.address_address_line_2,
                    email: r.email,
                    status: r.status,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
                };
                return o;
            });
        });
        this.getTradingPostInstitutionsWithFinicityInstitutionId = () => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT ti.id,
                   ti.external_id,
                   ti.name,
                   ti.account_type_description,
                   ti.phone,
                   ti.url_home_app,
                   ti.url_logon_app,
                   ti.oauth_enabled,
                   ti.url_forgot_password,
                   ti.url_online_registration,
                   ti.class,
                   ti.address_city,
                   ti.address_state,
                   ti.address_country,
                   ti.address_postal_code,
                   ti.address_address_line_1,
                   ti.address_address_line_2,
                   ti.email,
                   ti.status,
                   ti.updated_at,
                   ti.created_at,
                   fi.id             internal_finicity_institution_id,
                   fi.institution_id external_finicity_institution_id
            FROM tradingpost_institution ti
                     INNER JOIN finicity_institution fi
                                ON fi.name = ti.name;`;
            const response = yield this.db.query(query);
            return response.map((r) => {
                let o = {
                    externalId: r.external_id,
                    externalFinicityId: r.external_finicity_institution_id,
                    internalFinicityId: r.internal_finicity_institution_id,
                    id: r.id,
                    name: r.name,
                    accountTypeDescription: r.account_type_description,
                    phone: r.phone,
                    urlHomeApp: r.url_home_app,
                    urlLogonApp: r.url_logon_app,
                    oauthEnabled: r.oauth_enabled,
                    urlForgotPassword: r.url_forgot_password,
                    urlOnlineRegistration: r.url_online_registration,
                    class: r.class,
                    addressCity: r.address_city,
                    addressState: r.address_state,
                    addressCountry: r.address_country,
                    addressPostalCode: r.address_postal_code,
                    addressAddressLine1: r.address_address_line_1,
                    addressAddressLine2: r.address_address_line_2,
                    email: r.email,
                    status: r.status,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
                };
                return o;
            });
        });
        this.getTradingPostInstitutionByFinicityId = (finicityInstitutionId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT ti.id,
                   ti.external_id,
                   ti.name,
                   ti.account_type_description,
                   ti.phone,
                   ti.url_home_app,
                   ti.url_logon_app,
                   ti.oauth_enabled,
                   ti.url_forgot_password,
                   ti.url_online_registration,
                   ti.class,
                   ti.address_city,
                   ti.address_state,
                   ti.address_country,
                   ti.address_postal_code,
                   ti.address_address_line_1,
                   ti.address_address_line_2,
                   ti.email,
                   ti.status,
                   ti.updated_at,
                   ti.created_at,
                   fi.id             internal_finicity_institution_id,
                   fi.institution_id external_finicity_institution_id
            FROM tradingpost_institution ti
                     INNER JOIN
                 finicity_institution fi
                 ON
                     fi.name = ti.name
            WHERE fi.institution_id = $1;`;
            const r = yield this.db.oneOrNone(query, [finicityInstitutionId]);
            if (!r)
                return null;
            return {
                externalId: r.external_id,
                externalFinicityId: r.external_finicity_institution_id,
                internalFinicityId: r.internal_finicity_institution_id,
                id: r.id,
                name: r.name,
                accountTypeDescription: r.account_type_description,
                phone: r.phone,
                urlHomeApp: r.url_home_app,
                urlLogonApp: r.url_logon_app,
                oauthEnabled: r.oauth_enabled,
                urlForgotPassword: r.url_forgot_password,
                urlOnlineRegistration: r.url_online_registration,
                class: r.class,
                addressCity: r.address_city,
                addressState: r.address_state,
                addressCountry: r.address_country,
                addressPostalCode: r.address_postal_code,
                addressAddressLine1: r.address_address_line_1,
                addressAddressLine2: r.address_address_line_2,
                email: r.email,
                status: r.status,
                updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
            };
        });
        this.addSecurity = (sec) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO security(symbol, company_name, exchange, industry, website,
                                            description, ceo, security_name, issue_type, sector,
                                            primary_sic_code, employees, tags, address, address2, state,
                                            zip, country, phone, logo_url)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                               $11, $12, $13, $14, $15, $16, $17, $18, $19,
                               $20)
                       RETURNING id;`;
            return (yield this.db.one(query, [sec.symbol, sec.companyName, sec.exchange, sec.industry, sec.website,
                sec.description, sec.ceo, sec.securityName, sec.issueType, sec.securityName, sec.primarySicCode, sec.employees,
                sec.tags, sec.address, sec.address2, sec.state, sec.zip, sec.country, sec.phone, sec.logoUrl])).id;
        });
        this.upsertFinicityInstitution = (institution) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'institution_id', prop: 'institutionId' },
                { name: 'name', prop: 'name' },
                { name: 'voa', prop: 'voa' },
                { name: 'voi', prop: 'voi' },
                { name: 'state_agg', prop: 'stateAgg' },
                { name: 'ach', prop: 'ach' },
                { name: 'trans_agg', prop: 'transAgg' },
                { name: 'aha', prop: 'aha' },
                { name: 'available_balance', prop: 'availBalance' },
                { name: 'account_owner', prop: 'accountOwner' },
                { name: 'loan_payment_details', prop: 'loanPaymentDetails' },
                { name: 'student_loan_data', prop: 'studentLoanData' },
                { name: 'account_type_description', prop: 'accountTypeDescription' },
                { name: 'phone', prop: 'phone' },
                { name: 'url_home_app', prop: 'urlHomeApp' },
                { name: 'url_logon_app', prop: 'urlLogonApp' },
                { name: 'oauth_enabled', prop: 'oauthEnabled' },
                { name: 'url_forgot_password', prop: 'urlForgotPassword' },
                { name: 'url_online_registration', prop: 'urlOnlineRegistration' },
                { name: 'class', prop: 'class' },
                { name: 'special_text', prop: 'specialText' },
                { name: 'time_zone', prop: 'timeZone' },
                { name: 'special_instructions', prop: 'specialInstructions' },
                { name: 'special_instructions_title', prop: 'specialInstructionsTitle' },
                { name: 'address_city', prop: 'addressCity' },
                { name: 'address_state', prop: 'addressState' },
                { name: 'address_country', prop: 'addressCountry' },
                { name: 'address_postal_code', prop: 'addressPostalCode' },
                { name: 'address_line_1', prop: 'addressLine1' },
                { name: 'address_line_2', prop: 'addressLine2' },
                { name: 'currency', prop: 'currency' },
                { name: 'email', prop: 'email' },
                { name: 'status', prop: 'status' },
                { name: 'new_institution_id', prop: 'newInstitutionId' },
                { name: 'branding_logo', prop: 'brandingLogo' },
                { name: 'branding_alternate_logo', prop: 'brandingAlternateLogo' },
                { name: 'branding_icon', prop: 'brandingIcon' },
                { name: 'branding_primary_color', prop: 'brandingPrimaryColor' },
                { name: 'branding_title', prop: 'brandingTitle' },
                { name: 'oauth_institution_id', prop: 'oauthInstitutionId' },
                { name: 'production_status_overall', prop: 'productionStatusOverall' },
                { name: 'production_status_trans_agg', prop: 'productionStatusTransAgg' },
                { name: 'production_status_voa', prop: 'productionStatusVoa' },
                { name: 'production_status_state_agg', prop: 'productionStatusStateAgg' },
                { name: 'production_status_ach', prop: 'productionStatusAch' },
                { name: 'production_status_aha', prop: 'productionStatusAha' },
            ], { table: 'finicity_institution' });
            const query = upsertReplaceQuery(institution, cs, this.pgp, "institution_id") + " RETURNING id";
            const res = yield this.db.oneOrNone(query);
            return res.id;
        });
        this.upsertFinicityInstitutions = (institutions) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'institution_id', prop: 'institutionId' },
                { name: 'name', prop: 'name' },
                { name: 'voa', prop: 'voa' },
                { name: 'voi', prop: 'voi' },
                { name: 'state_agg', prop: 'stateAgg' },
                { name: 'ach', prop: 'ach' },
                { name: 'trans_agg', prop: 'transAgg' },
                { name: 'aha', prop: 'aha' },
                { name: 'available_balance', prop: 'availBalance' },
                { name: 'account_owner', prop: 'accountOwner' },
                { name: 'loan_payment_details', prop: 'loanPaymentDetails' },
                { name: 'student_loan_data', prop: 'studentLoanData' },
                { name: 'account_type_description', prop: 'accountTypeDescription' },
                { name: 'phone', prop: 'phone' },
                { name: 'url_home_app', prop: 'urlHomeApp' },
                { name: 'url_logon_app', prop: 'urlLogonApp' },
                { name: 'oauth_enabled', prop: 'oauthEnabled' },
                { name: 'url_forgot_password', prop: 'urlForgotPassword' },
                { name: 'url_online_registration', prop: 'urlOnlineRegistration' },
                { name: 'class', prop: 'class' },
                { name: 'special_text', prop: 'specialText' },
                { name: 'time_zone', prop: 'timeZone' },
                { name: 'special_instructions', prop: 'specialInstructions' },
                { name: 'special_instructions_title', prop: 'specialInstructionsTitle' },
                { name: 'address_city', prop: 'addressCity' },
                { name: 'address_state', prop: 'addressState' },
                { name: 'address_country', prop: 'addressCountry' },
                { name: 'address_postal_code', prop: 'addressPostalCode' },
                { name: 'address_line_1', prop: 'addressLine1' },
                { name: 'address_line_2', prop: 'addressLine2' },
                { name: 'currency', prop: 'currency' },
                { name: 'email', prop: 'email' },
                { name: 'status', prop: 'status' },
                { name: 'new_institution_id', prop: 'newInstitutionId' },
                { name: 'branding_logo', prop: 'brandingLogo' },
                { name: 'branding_alternate_logo', prop: 'brandingAlternateLogo' },
                { name: 'branding_icon', prop: 'brandingIcon' },
                { name: 'branding_primary_color', prop: 'brandingPrimaryColor' },
                { name: 'branding_title', prop: 'brandingTitle' },
                { name: 'oauth_institution_id', prop: 'oauthInstitutionId' },
                { name: 'production_status_overall', prop: 'productionStatusOverall' },
                { name: 'production_status_trans_agg', prop: 'productionStatusTransAgg' },
                { name: 'production_status_voa', prop: 'productionStatusVoa' },
                { name: 'production_status_state_agg', prop: 'productionStatusStateAgg' },
                { name: 'production_status_ach', prop: 'productionStatusAch' },
                { name: 'production_status_aha', prop: 'productionStatusAha' },
            ], { table: 'finicity_institution' });
            const query = upsertReplaceQuery(institutions, cs, this.pgp, "institution_id");
            yield this.db.none(query);
        });
        this.getFinicityInstitutions = () => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              institution_id,
                              name,
                              voa,
                              voi,
                              state_agg,
                              ach,
                              trans_agg,
                              available_balance,
                              account_owner,
                              loan_payment_details,
                              student_loan_data,
                              phone,
                              url_home_app,
                              url_logon_app,
                              oauth_enabled,
                              url_forgot_password,
                              url_online_registration,
                              class,
                              special_text,
                              time_zone,
                              special_instructions,
                              special_instructions_title,
                              address_city,
                              address_state,
                              address_country,
                              address_postal_code,
                              address_line_1,
                              address_line_2,
                              currency,
                              email,
                              status,
                              new_institution_id,
                              branding_logo,
                              branding_alternate_logo,
                              branding_icon,
                              branding_primary_color,
                              branding_title,
                              oauth_institution_id,
                              production_status_overall,
                              production_status_trans_agg,
                              production_status_voa,
                              production_status_state_agg,
                              production_status_ach,
                              production_status_aha,
                              updated_at,
                              created_at
                       FROM finicity_institution;`;
            const response = yield this.db.query(query);
            return response.map((r) => {
                return {
                    id: r.id,
                    institutionId: r.institution_id,
                    name: r.name,
                    voa: r.voa,
                    voi: r.voi,
                    stateAgg: r.state_agg,
                    ach: r.ach,
                    transAgg: r.trans_agg,
                    aha: r.aha,
                    availBalance: r.avail_balance,
                    accountOwner: r.account_owner,
                    loanPaymentDetails: r.loan_payment_details,
                    studentLoanData: r.student_loan_data,
                    accountTypeDescription: r.account_type_description,
                    phone: r.phone,
                    urlHomeApp: r.url_home_app,
                    urlLogonApp: r.url_logon_app,
                    oauthEnabled: r.oauth_enabled,
                    urlForgotPassword: r.url_forgot_password,
                    urlOnlineRegistration: r.url_online_registration,
                    class: r.class,
                    specialText: r.specialText,
                    timeZone: r.time_zone,
                    specialInstructions: r.special_instructions,
                    specialInstructionsTitle: r.special_instructions_title,
                    addressCity: r.address_city,
                    addressState: r.address_state,
                    addressCountry: r.address_country,
                    addressPostalCode: r.address_postal_code,
                    addressLine1: r.address_line_1,
                    addressLine2: r.address_line_2,
                    currency: r.currency,
                    email: r.email,
                    status: r.status,
                    newInstitutionId: r.new_institution_id,
                    brandingLogo: r.branding_logo,
                    brandingAlternateLogo: r.branding_alternate_logo,
                    brandingIcon: r.branding_icon,
                    brandingPrimaryColor: r.branding_primary_color,
                    brandingTitle: r.branding_title,
                    oauthInstitutionId: r.oauth_institution_id,
                    productionStatusOverall: r.production_status_overall,
                    productionStatusTransAgg: r.production_status_trans_agg,
                    productionStatusVoa: r.production_status_voa,
                    productionStatusStateAgg: r.production_status_state_agg,
                    productionStatusAch: r.production_status_ach,
                    productionStatusAha: r.production_status_aha,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
                };
            });
        });
        this.getFinicityInstitutionsById = (finicityInstitutionIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              institution_id,
                              name,
                              voa,
                              voi,
                              state_agg,
                              ach,
                              trans_agg,
                              available_balance,
                              account_owner,
                              loan_payment_details,
                              student_loan_data,
                              phone,
                              url_home_app,
                              url_logon_app,
                              oauth_enabled,
                              url_forgot_password,
                              url_online_registration,
                              class,
                              special_text,
                              time_zone,
                              special_instructions,
                              special_instructions_title,
                              address_city,
                              address_state,
                              address_country,
                              address_postal_code,
                              address_line_1,
                              address_line_2,
                              currency,
                              email,
                              status,
                              new_institution_id,
                              branding_logo,
                              branding_alternate_logo,
                              branding_icon,
                              branding_primary_color,
                              branding_title,
                              oauth_institution_id,
                              production_status_overall,
                              production_status_trans_agg,
                              production_status_voa,
                              production_status_state_agg,
                              production_status_ach,
                              production_status_aha,
                              updated_at,
                              created_at
                       FROM finicity_institution
                       WHERE institution_id IN ($1:list);`;
            const response = yield this.db.query(query, [finicityInstitutionIds]);
            return response.map((r) => {
                return {
                    id: r.id,
                    institutionId: r.institution_id,
                    name: r.name,
                    voa: r.voa,
                    voi: r.voi,
                    stateAgg: r.state_agg,
                    ach: r.ach,
                    transAgg: r.trans_agg,
                    aha: r.aha,
                    availBalance: r.avail_balance,
                    accountOwner: r.account_owner,
                    loanPaymentDetails: r.loan_payment_details,
                    studentLoanData: r.student_loan_data,
                    accountTypeDescription: r.account_type_description,
                    phone: r.phone,
                    urlHomeApp: r.url_home_app,
                    urlLogonApp: r.url_logon_app,
                    oauthEnabled: r.oauth_enabled,
                    urlForgotPassword: r.url_forgot_password,
                    urlOnlineRegistration: r.url_online_registration,
                    class: r.class,
                    specialText: r.specialText,
                    timeZone: r.time_zone,
                    specialInstructions: r.special_instructions,
                    specialInstructionsTitle: r.special_instructions_title,
                    addressCity: r.address_city,
                    addressState: r.address_state,
                    addressCountry: r.address_country,
                    addressPostalCode: r.address_postal_code,
                    addressLine1: r.address_line_1,
                    addressLine2: r.address_line_2,
                    currency: r.currency,
                    email: r.email,
                    status: r.status,
                    newInstitutionId: r.new_institution_id,
                    brandingLogo: r.branding_logo,
                    brandingAlternateLogo: r.branding_alternate_logo,
                    brandingIcon: r.branding_icon,
                    brandingPrimaryColor: r.branding_primary_color,
                    brandingTitle: r.branding_title,
                    oauthInstitutionId: r.oauth_institution_id,
                    productionStatusOverall: r.production_status_overall,
                    productionStatusTransAgg: r.production_status_trans_agg,
                    productionStatusVoa: r.production_status_voa,
                    productionStatusStateAgg: r.production_status_state_agg,
                    productionStatusAch: r.production_status_ach,
                    productionStatusAha: r.production_status_aha,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
                };
            });
        });
        this.getFinicityUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.oneOrNone(`
            SELECT id,
                   tp_user_id,
                   customer_id,
                   type,
                   updated_at,
                   created_at
            FROM finicity_user
            WHERE tp_user_id = $1`, [userId]);
            if (!response)
                return null;
            return {
                id: response.id,
                tpUserId: response.tp_user_id,
                customerId: response.customer_id,
                type: response.type,
                updatedAt: luxon_1.DateTime.fromJSDate(response.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(response.created_at)
            };
        });
        this.getFinicityUsers = () => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id, tp_user_id, customer_id, type, updated_at, created_at
                       FROM finicity_user;`;
            const response = yield this.db.query(query);
            return response.map((r) => {
                let o = {
                    tpUserId: r.tp_user_id,
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    id: r.id,
                    type: r.type,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    customerId: r.customer_id
                };
                return o;
            });
        });
        this.getTradingPostUserByFinicityCustomerId = (finicityCustomerId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT du.id,
                   du.first_name,
                   du.last_name,
                   du.handle,
                   du.email,
                   du.profile_url,
                   du.settings,
                   du.bio,
                   du.banner_url,
                   du.tags,
                   du.created_at,
                   du.updated_at,
                   du.analyst_profile,
                   du.has_profile_pic,
                   du.dummy
            FROM data_user du
                     INNER JOIN
                 finicity_user fu
                 ON fu.tp_user_id = du.id
            WHERE fu.customer_id = $1;`;
            const row = yield this.db.oneOrNone(query, [finicityCustomerId]);
            if (!row)
                return null;
            return {
                id: row.id,
                bio: row.bio,
                analystProfile: row.analyst_profile,
                bannerUrl: row.banner_url,
                createdAt: luxon_1.DateTime.fromJSDate(row.created_at),
                updatedAt: luxon_1.DateTime.fromJSDate(row.updated_at),
                dummy: row.dummy,
                email: row.email,
                firstName: row.first_name,
                handle: row.handle,
                hasProfilePic: row.has_profile_pic,
                lastName: row.last_name,
                profileUrl: row.profile_url,
                tags: row.tags,
                settings: row.settings
            };
        });
        this.getFinicityUserByFinicityCustomerId = (customerId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.oneOrNone(`
            SELECT id,
                   tp_user_id,
                   customer_id,
                   type,
                   updated_at,
                   created_at
            FROM finicity_user
            WHERE customer_id = $1`, [customerId]);
            if (!response)
                return null;
            return {
                id: response.id,
                tpUserId: response.tp_user_id,
                customerId: response.customer_id,
                type: response.type,
                updatedAt: luxon_1.DateTime.fromJSDate(response.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(response.created_at)
            };
        });
        this.getFinicityUserByFinicityUserId = (userId) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.oneOrNone(`
            SELECT id,
                   tp_user_id,
                   customer_id,
                   type,
                   updated_at,
                   created_at
            FROM finicity_user
            WHERE tp_user_id = $1`, [userId]);
            if (!response)
                return null;
            return {
                id: response.id,
                tpUserId: response.tp_user_id,
                customerId: response.customer_id,
                type: response.type,
                updatedAt: luxon_1.DateTime.fromJSDate(response.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(response.created_at)
            };
        });
        this.addFinicityUser = (userId, customerId, type) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO finicity_user(tp_user_id, customer_id, type)
                       VALUES ($1, $2, $3)
                       ON CONFLICT(customer_id) DO UPDATE SET tp_user_id=EXCLUDED.tp_user_id,
                                                              type      =EXCLUDED.type
                       RETURNING id, updated_at, created_at`;
            const response = yield this.db.one(query, [userId, customerId, type]);
            return {
                id: response.id,
                tpUserId: userId,
                customerId: customerId,
                type: type,
                updatedAt: luxon_1.DateTime.fromJSDate(response.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(response.created_at)
            };
        });
        this.addFinicityAccount = (account) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'finicity_user_id', prop: 'finicityUserId' },
                { name: 'finicity_institution', prop: 'finicityInstitution' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'number', prop: 'number' },
                { name: 'real_account_number_last_4', prop: 'realAccountNumberLast4' },
                { name: 'account_number_display', prop: 'accountNumberDisplay' },
                { name: 'name', prop: 'name' },
                { name: 'balance', prop: 'balance' },
                { name: 'type', prop: 'type' },
                { name: 'aggregation_status_code', prop: 'aggregationStatusCode' },
                { name: 'status', prop: 'status' },
                { name: 'customer_id', prop: 'customerId' },
                { name: 'institution_id', prop: 'institutionId' },
                { name: 'balance_date', prop: 'balanceDate' },
                { name: 'aggregation_success_date', prop: 'aggregationSuccessDate' },
                { name: 'aggregation_attempt_date', prop: 'aggregationAttemptDate' },
                { name: 'created_date', prop: 'createdDate' },
                { name: 'currency', prop: 'currency' },
                { name: 'last_transaction_date', prop: 'lastTransactionDate' },
                { name: 'oldest_transaction_date', prop: 'oldestTransactionDate' },
                { name: 'institution_login_id', prop: 'institutionLoginId' },
                { name: 'last_updated_date', prop: 'lastUpdatedDate' },
                { name: 'detail_margin', prop: 'detailMargin' },
                { name: 'detail_margin_allowed', prop: 'detailMarginAllowed' },
                { name: 'detail_cash_account_allowed', prop: 'detailCashAccountAllowed' },
                { name: 'detail_description', prop: 'detailDescription' },
                { name: 'detail_margin_balance', prop: 'detailMarginBalance' },
                { name: 'detail_short_balance', prop: 'detailShortBalance' },
                { name: 'detail_available_cash_balance', prop: 'detailAvailableCashBalance' },
                { name: 'detail_current_balance', prop: 'detailCurrentBalance' },
                { name: 'detail_date_as_of', prop: 'detailDateAsOf' },
                { name: 'display_position', prop: 'displayPosition' },
                { name: 'parent_account', prop: 'parentAccount' },
                { name: 'account_nickname', prop: 'accountNickname' },
                { name: 'market_segment', prop: 'marketSegment' },
            ], { table: 'finicity_account' });
            const query = this.pgp.helpers.insert(account, cs) + 'RETURNING id;';
            const response = yield this.db.query(query);
            account.id = response.id;
            return account;
        });
        this.upsertFinicityAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'finicity_user_id', prop: 'finicityUserId' },
                { name: 'finicity_institution_id', prop: 'finicityInstitutionId' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'number', prop: 'number' },
                { name: 'real_account_number_last_4', prop: 'realAccountNumberLast4' },
                { name: 'account_number_display', prop: 'accountNumberDisplay' },
                { name: 'name', prop: 'name' },
                { name: 'balance', prop: 'balance' },
                { name: 'type', prop: 'type' },
                { name: 'aggregation_status_code', prop: 'aggregationStatusCode' },
                { name: 'status', prop: 'status' },
                { name: 'customer_id', prop: 'customerId' },
                { name: 'institution_id', prop: 'institutionId' },
                { name: 'balance_date', prop: 'balanceDate' },
                { name: 'aggregation_success_date', prop: 'aggregationSuccessDate' },
                { name: 'aggregation_attempt_date', prop: 'aggregationAttemptDate' },
                { name: 'created_date', prop: 'createdDate' },
                { name: 'currency', prop: 'currency' },
                { name: 'last_transaction_date', prop: 'lastTransactionDate' },
                { name: 'oldest_transaction_date', prop: 'oldestTransactionDate' },
                { name: 'institution_login_id', prop: 'institutionLoginId' },
                { name: 'last_updated_date', prop: 'lastUpdatedDate' },
                { name: 'detail_margin', prop: 'detailMargin' },
                { name: 'detail_margin_allowed', prop: 'detailMarginAllowed' },
                { name: 'detail_cash_account_allowed', prop: 'detailCashAccountAllowed' },
                { name: 'detail_description', prop: 'detailDescription' },
                { name: 'detail_margin_balance', prop: 'detailMarginBalance' },
                { name: 'detail_short_balance', prop: 'detailShortBalance' },
                { name: 'detail_available_cash_balance', prop: 'detailAvailableCashBalance' },
                { name: 'detail_current_balance', prop: 'detailCurrentBalance' },
                { name: 'detail_date_as_of', prop: 'detailDateAsOf' },
                { name: 'display_position', prop: 'displayPosition' },
                { name: 'parent_account', prop: 'parentAccount' },
                { name: 'account_nickname', prop: 'accountNickname' },
                { name: 'market_segment', prop: 'marketSegment' },
                { name: 'tx_push_id', prop: 'txPushId' },
                { name: 'tx_push_signing_key', prop: 'txPushSigningKey' }
            ], { table: 'finicity_account' });
            const query = upsertReplaceQuery(accounts, cs, this.pgp, "account_id");
            yield this.db.none(query);
        });
        this.getFinicityAccounts = (finicityUserId) => __awaiter(this, void 0, void 0, function* () {
            let query = `
            SELECT id,
                   finicity_user_id,
                   finicity_institution_id,
                   account_id,
                   number,
                   real_account_number_last_4,
                   account_number_display,
                   name,
                   balance,
                   type,
                   aggregation_status_code,
                   status,
                   customer_id,
                   institution_id,
                   balance_date,
                   aggregation_success_date,
                   aggregation_attempt_date,
                   created_date,
                   currency,
                   last_transaction_date,
                   oldest_transaction_date,
                   institution_login_id,
                   last_updated_date,
                   detail_margin,
                   detail_margin_allowed,
                   detail_cash_account_allowed,
                   detail_description,
                   detail_margin_balance,
                   detail_short_balance,
                   detail_available_cash_balance,
                   detail_current_balance,
                   detail_date_as_of,
                   display_position,
                   parent_account,
                   account_nickname,
                   market_segment,
                   updated_at,
                   created_at,
                   tx_push_id,
                   tx_push_signing_key
            FROM finicity_account
            WHERE finicity_user_id = $1;`;
            const response = yield this.db.query(query, [finicityUserId]);
            return response.map((a) => {
                let o = {
                    id: a.id,
                    finicityUserId: a.finicity_user_id,
                    finicityInstitutionId: a.finicity_institition_id,
                    accountId: a.account_id,
                    number: a.number,
                    realAccountNumberLast4: a.real_account_number_last_4,
                    accountNumberDisplay: a.account_number_display,
                    name: a.name,
                    balance: a.balance,
                    type: a.type,
                    aggregationStatusCode: a.aggregation_status_code,
                    status: a.status,
                    customerId: a.customer_id,
                    institutionId: a.institution_id,
                    balanceDate: a.balance_date,
                    aggregationSuccessDate: a.aggregation_success_date,
                    aggregationAttemptDate: a.aggregation_attempt_date,
                    createdDate: a.created_date,
                    currency: a.currency,
                    lastTransactionDate: a.last_transaction_date,
                    oldestTransactionDate: a.oldest_transaction_date,
                    institutionLoginId: a.institution_login_id,
                    lastUpdatedDate: a.last_updated_date,
                    detailMargin: a.detail_margin,
                    detailMarginAllowed: a.detail_margin_allowed,
                    detailCashAccountAllowed: a.detail_cash_account_allowed,
                    detailDescription: a.detail_description,
                    detailMarginBalance: a.detail_margin_balance,
                    detailShortBalance: a.detail_short_balance,
                    detailAvailableCashBalance: a.detail_available_cash_balance,
                    detailCurrentBalance: a.detail_current_balance,
                    detailDateAsOf: a.detail_date_as_of,
                    displayPosition: a.display_position,
                    parentAccount: a.parent_account,
                    accountNickname: a.account_nickname,
                    marketSegment: a.market_segment,
                    updatedAt: luxon_1.DateTime.fromJSDate(a.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(a.created_at),
                    txPushId: a.tx_push_id,
                    txPushSigningKey: a.tx_push_signing_key
                };
                return o;
            });
        });
        this.getFinicityAccountDetails = (finicityUserId) => __awaiter(this, void 0, void 0, function* () {
            let query = `
            SELECT id,
                   finicity_user_id,
                   finicity_institution_id,
                   account_id,
                   detail_margin,
                   detail_margin_allowed,
                   detail_cash_account_allowed,
                   detail_description,
                   detail_margin_balance,
                   detail_short_balance,
                   detail_available_cash_balance,
                   detail_current_balance,
                   detail_date_as_of
            FROM finicity_account
            WHERE finicity_user_id = $1;`;
            const response = yield this.db.query(query, [finicityUserId]);
            return response.map((a) => {
                return {
                    detailMargin: a.detail_margin,
                    detailMarginAllowed: a.detail_margin_allowed,
                    detailCashAccountAllowed: a.detail_cash_account_allowed,
                    detailDescription: a.detail_description,
                    detailMarginBalance: a.detail_margin_balance,
                    detailShortBalance: a.detail_short_balance,
                    detailAvailableCashBalance: a.detail_available_cash_balance,
                    detailCurrentBalance: a.detail_current_balance,
                    detailDateAsOf: a.detail_date_as_of,
                };
            });
        });
        this.upsertFinicityHoldings = (holdings) => __awaiter(this, void 0, void 0, function* () {
            if (holdings.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'finicity_account_id', prop: 'finicityAccountId' },
                { name: 'holding_id', prop: 'holdingId' },
                { name: 'security_id_type', prop: 'securityIdType' },
                { name: 'pos_type', prop: 'posType' },
                { name: 'sub_account_type', prop: 'subAccountType' },
                { name: 'description', prop: 'description' },
                { name: 'symbol', prop: 'symbol' },
                { name: 'cusip_no', prop: 'cusipNo' },
                { name: 'current_price', prop: 'currentPrice' },
                { name: 'transaction_type', prop: 'transactionType' },
                { name: 'market_value', prop: 'marketValue' },
                { name: 'security_unit_price', prop: 'securityUnitPrice' },
                { name: 'units', prop: 'units' },
                { name: 'cost_basis', prop: 'costBasis' },
                { name: 'status', prop: 'status' },
                { name: 'security_type', prop: 'securityType' },
                { name: 'security_name', prop: 'securityName' },
                { name: 'security_currency', prop: 'securityCurrency' },
                { name: 'current_price_date', prop: 'currentPriceDate' },
                { name: 'option_strike_price', prop: 'optionStrikePrice' },
                { name: 'option_type', prop: 'optionType' },
                { name: 'option_shares_per_contract', prop: 'optionSharesPerContract' },
                { name: 'options_expire_date', prop: 'optionExpiredate' },
                { name: 'fi_asset_class', prop: 'fiAssetClass' },
                { name: 'asset_class', prop: 'assetClass' },
                { name: 'currency_rate', prop: 'currencyRate' },
                { name: 'cost_basis_per_share', prop: 'costBasisPerShare' },
                { name: 'mf_type', prop: 'mfType' },
                { name: 'total_gl_dollar', prop: 'totalGlDollar' },
                { name: 'total_gl_percent', prop: 'totalGlPercent' },
                { name: 'today_gl_dollar', prop: 'todayGlDollar' },
                { name: 'today_gl_percent', prop: 'todayGlPercent' },
            ], { table: 'finicity_holding' });
            const query = upsertReplaceQuery(holdings, cs, this.pgp, "holding_id");
            yield this.db.none(query);
        });
        this.getFinicityHoldings = (finicityUserId) => __awaiter(this, void 0, void 0, function* () {
            let query = `    SELECT fh.id,
                                finicity_account_id,
                                holding_id,
                                security_id_type,
                                pos_type,
                                sub_account_type,
                                description,
                                symbol,
                                cusip_no,
                                current_price,
                                transaction_type,
                                market_value,
                                security_unit_price,
                                units,
                                cost_basis,
                                fh.status,
                                security_type,
                                security_name,
                                security_currency,
                                current_price_date,
                                option_strike_price,
                                option_type,
                                option_shares_per_contract,
                                options_expire_date,
                                fi_asset_class,
                                asset_class,
                                currency_rate,
                                cost_basis_per_share,
                                mf_type,
                                total_gl_dollar,
                                total_gl_percent,
                                today_gl_dollar,
                                today_gl_percent,
                                fh.updated_at,
                                fh.created_at
                         FROM finicity_holding fh
                                  INNER JOIN finicity_account fa
                                             ON fa.id = fh.finicity_account_id
                         WHERE fa.finicity_user_id = $1`;
            const response = yield this.db.query(query, [finicityUserId]);
            return response.map((h) => {
                return {
                    id: h.id,
                    finicityAccountId: h.finicity_account_id,
                    holdingId: h.holding_id,
                    securityIdType: h.security_id_type,
                    posType: h.pos_type,
                    subAccountType: h.sub_account_type,
                    description: h.description,
                    symbol: h.symbol,
                    cusipNo: h.cusip_no,
                    currentPrice: h.current_price,
                    transactionType: h.transaction_type,
                    marketValue: h.market_value,
                    securityUnitPrice: h.security_unit_price,
                    units: h.units,
                    costBasis: h.cost_basis,
                    status: h.status,
                    securityType: h.security_type,
                    securityName: h.security_name,
                    securityCurrency: h.security_currency,
                    currentPriceDate: h.current_price_date,
                    optionStrikePrice: h.option_strike_price,
                    optionType: h.option_type,
                    optionSharesPerContract: h.option_shares_per_contract,
                    optionsExpireDate: h.options_expire_date,
                    fiAssetClass: h.fi_asset_class,
                    assetClass: h.asset_class,
                    currencyRate: h.currency_rate,
                    costBasisPerShare: h.cost_basis_per_share,
                    mfType: h.mf_type,
                    totalGlDollar: h.total_gl_dollar,
                    totalGlPercent: h.total_gl_percent,
                    todayGlDollar: h.today_gl_dollar,
                    todayGlPercent: h.today_gl_percent,
                    updatedAt: luxon_1.DateTime.fromJSDate(h.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(h.created_at)
                };
            });
        });
        this.upsertFinicityTransactions = (transactions) => __awaiter(this, void 0, void 0, function* () {
            if (transactions.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'internal_finicity_account_id', prop: 'internalFinicityAccountId' },
                { name: 'transaction_id', prop: 'transactionId' },
                { name: 'amount', prop: 'amount' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'customer_id', prop: 'customerId' },
                { name: 'status', prop: 'status' },
                { name: 'description', prop: 'description' },
                { name: 'memo', prop: 'memo' },
                { name: 'type', prop: 'type' },
                { name: 'unit_quantity', prop: 'unitQuantity' },
                { name: 'fee_amount', prop: 'feeAmount' },
                { name: 'cusip_no', prop: 'cusipNo' },
                { name: 'posted_date', prop: 'postedDate' },
                { name: 'transaction_date', prop: 'transactionDate' },
                { name: 'created_date', prop: 'createdDate' },
                { name: 'categorization_normalized_payee_name', prop: 'categorizationNormalizedPayeeName' },
                { name: 'categorization_category', prop: 'categorizationCategory' },
                { name: 'categorization_country', prop: 'categorizationCountry' },
                { name: 'categorization_best_representation', prop: 'categorizationBestRepresentation' },
                { name: 'commission_amount', prop: 'commissionAmount' },
                { name: 'ticker', prop: 'ticker' },
                { name: 'unit_price', prop: 'unitPrice' },
                { name: 'investment_transaction_type', prop: 'investmentTransactionType' },
            ], { table: 'finicity_transaction' });
            const query = upsertReplaceQuery(transactions, cs, this.pgp, "transaction_id");
            yield this.db.none(query);
        });
        this.getFinicityTransactions = (finicityUserId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT ft.id,
                   ft.internal_finicity_account_id,
                   ft.transaction_id,
                   ft.amount,
                   ft.account_id,
                   ft.customer_id,
                   ft.status,
                   ft.description,
                   ft.memo,
                   ft.type,
                   ft.unit_quantity,
                   ft.fee_amount,
                   ft.cusip_no,
                   ft.posted_date,
                   ft.transaction_date,
                   ft.created_date,
                   ft.categorization_normalized_payee_name,
                   ft.categorization_category,
                   ft.categorization_country,
                   ft.categorization_best_representation,
                   ft.commission_amount,
                   ft.unit_price,
                   ft.ticker,
                   ft.investment_transaction_type,
                   ft.updated_at,
                   ft.created_at
            FROM finicity_transaction ft
                     INNER JOIN finicity_account fa ON fa.id = ft.internal_finicity_account_id
            WHERE fa.finicity_user_id = $1
        `;
            const response = yield this.db.query(query, [finicityUserId]);
            return response.map((t) => {
                return {
                    id: t.id,
                    finicityAccountId: t.finicity_account_id,
                    transactionId: t.transaction_id,
                    accountId: t.account_id,
                    customerId: t.customer_id,
                    amount: t.amount,
                    description: t.description,
                    postedDate: t.posted_date,
                    transactionDate: t.transaction_date,
                    investmentTransactionType: t.investment_transaction_type,
                    status: t.status,
                    memo: t.memo,
                    type: t.type,
                    unitQuantity: t.unit_quantity,
                    feeAmount: t.fee_amount,
                    cusipNo: t.cusip_no,
                    createdDate: t.created_date,
                    categorizationNormalizedPayeeName: t.categorization_normalized_payee_name,
                    categorizationCategory: t.categorization_category,
                    categorizationCountry: t.categorization_country,
                    categorizationBestRepresentation: t.categorization_best_representation,
                    commissionAmount: t.commission_amount,
                    ticker: t.ticker,
                    unitPrice: t.unit_price,
                    updatedAt: luxon_1.DateTime.fromJSDate(t.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(t.created_at)
                };
            });
        });
        this.getTradingPostBrokerageAccounts = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              institution_id,
                              broker_name,
                              status,
                              account_number,
                              mask,
                              name,
                              official_name,
                              type,
                              subtype,
                              updated_at,
                              created_at,
                              error,
                              error_code,
                              hidden_for_deletion,
                              account_status
                       FROM tradingpost_brokerage_account
                       WHERE user_id = $1`;
            const response = yield this.db.query(query, [userId]);
            return response.map((r) => {
                let x = {
                    id: r.id,
                    userId: r.user_id,
                    institutionId: r.institution_id,
                    brokerName: r.brokerage_name,
                    status: r.status,
                    accountNumber: r.account_number,
                    mask: r.mask,
                    name: r.name,
                    officialName: r.official_name,
                    type: r.type,
                    subtype: r.subtype,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    hiddenForDeletion: r.hidden_for_deletion,
                    errorCode: r.error_code,
                    error: r.error,
                    accountStatus: r.account_status
                };
                return x;
            });
        });
        this.addTradingPostBrokerageAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'institution_id', prop: 'institutionId' },
                { name: 'broker_name', prop: 'brokerName' },
                { name: 'status', prop: 'status' },
                { name: 'account_number', prop: 'accountNumber' },
                { name: 'mask', prop: 'mask' },
                { name: 'name', prop: 'name' },
                { name: 'official_name', prop: 'officialName' },
                { name: 'type', prop: 'type' },
                { name: 'subtype', prop: 'subtype' },
                { name: 'hidden_for_deletion', prop: 'hiddenForDeletion' },
                { name: 'account_status', prop: 'accountStatus' }
            ], { table: 'tradingpost_brokerage_account' });
            const query = this.pgp.helpers.insert(accounts, cs);
            yield this.db.none(query);
        });
        this.upsertTradingPostBrokerageAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
            if (accounts.length <= 0)
                return [];
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'institution_id', prop: 'institutionId' },
                { name: 'broker_name', prop: 'brokerName' },
                { name: 'status', prop: 'status' },
                { name: 'account_number', prop: 'accountNumber' },
                { name: 'mask', prop: 'mask' },
                { name: 'name', prop: 'name' },
                { name: 'official_name', prop: 'officialName' },
                { name: 'type', prop: 'type' },
                { name: 'subtype', prop: 'subtype' },
                { name: "updated_at", prop: "updatedAt" },
                { name: 'hidden_for_deletion', prop: 'hiddenForDeletion' },
                { name: 'account_status', prop: 'accountStatus' }
            ], { table: 'tradingpost_brokerage_account' });
            const newAccounts = accounts.map(acc => (Object.assign(Object.assign({}, acc), { updatedAt: luxon_1.DateTime.now() })));
            const query = upsertReplaceQuery(newAccounts, cs, this.pgp, "user_id,institution_id,account_number") + ` RETURNING id`;
            const response = yield this.db.query(query);
            if (!response || response.length <= 0)
                return [];
            return response.map((r) => r.id);
        });
        this.addTradingPostAccountGroups = (accountGroups) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'name', prop: 'name' },
                { name: 'default_benchmark_id', prop: 'defaultBenchmarkId' },
            ], { table: 'tradingpost_account_group' });
            const query = this.pgp.helpers.insert(accountGroups, cs);
            yield this.db.none(query);
        });
        this.deleteTradingPostAccountCurrentHoldings = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            if (accountIds.length <= 0)
                return;
            const query = `DELETE
                       FROM tradingpost_current_holding
                       WHERE account_id IN ($1:list);`;
            yield this.db.none(query, [accountIds]);
        });
        this.getTradingPostAccountGroups = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT atg.id,
                              atg.account_group_id,
                              ag.user_id,
                              ag.name,
                              atg.account_id,
                              ag.default_benchmark_id,
                              ag.created_at,
                              ag.updated_at
                       FROM tradingpost_account_group ag
                                RIGHT JOIN _tradingpost_account_to_group atg
                                           ON atg.account_group_id = ag.id
                       WHERE user_id = $1
        `;
            const response = yield this.db.any(query, [userId]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get account groups for userId: ${userId}`);
            }
            let accountGroups = [];
            for (let d of response) {
                accountGroups.push({
                    accountGroupId: parseInt(d.account_group_id),
                    accountId: parseInt(d.account_id),
                    userId: d.user_id,
                    name: d.name,
                    defaultBenchmarkId: parseInt(d.default_benchmark_id),
                });
            }
            return accountGroups;
        });
        this.addTradingPostAccountGroup = (userId, name, accountIds, defaultBenchmarkId) => __awaiter(this, void 0, void 0, function* () {
            let query = `INSERT INTO tradingpost_account_group(user_id, name, default_benchmark_id)
                     VALUES ($1, $2, $3)
                     ON CONFLICT
                         ON CONSTRAINT name_userid_unique DO UPDATE SET name = EXCLUDED.name
                     RETURNING id;`;
            const accountGroupIdResults = yield this.db.any(query, [userId, name, defaultBenchmarkId]);
            if (accountGroupIdResults.length <= 0)
                return 0;
            const accountGroupId = accountGroupIdResults[0].id;
            let values = accountIds.map(accountId => ({
                account_id: accountId,
                account_group_id: accountGroupId
            }));
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'account_id' },
                { name: 'account_group_id', prop: 'account_group_id' },
            ], { table: '_tradingpost_account_to_group' });
            if (values.length <= 0)
                return 0;
            const accountGroupsQuery = this.pgp.helpers.insert(values, cs) + ' ON CONFLICT DO NOTHING';
            const result = yield this.db.result(accountGroupsQuery);
            return result.rowCount > 0 ? 1 : 0;
        });
        this.upsertTradingPostCurrentHoldings = (currentHoldings) => __awaiter(this, void 0, void 0, function* () {
            if (currentHoldings.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'accountId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'security_type', prop: 'securityType' },
                { name: 'price', prop: 'price' },
                { name: 'price_as_of', prop: 'priceAsOf' },
                { name: 'price_source', prop: 'priceSource' },
                { name: 'value', prop: 'value' },
                { name: 'cost_basis', prop: 'costBasis' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'currency', prop: 'currency' },
                { name: 'option_id', prop: 'optionId' },
                { name: 'holding_date', prop: 'holdingDate' }
            ], { table: 'tradingpost_current_holding' });
            const query = upsertReplaceQuery(currentHoldings, cs, this.pgp, "account_id, security_id, coalesce (option_id, -1)");
            yield this.db.none(query);
        });
        this.addTradingPostHistoricalHoldings = (historicalHoldings) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'accountId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'option_id', prop: 'optionId' },
                { name: 'security_type', prop: 'securityType' },
                { name: 'price', prop: 'price' },
                { name: 'price_as_of', prop: 'priceAsOf' },
                { name: 'price_source', prop: 'priceSource' },
                { name: 'value', prop: 'value' },
                { name: 'cost_basis', prop: 'costBasis' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'currency', prop: 'currency' },
                { name: 'date', prop: 'date' },
                { name: 'option_id', prop: 'optionId' }
            ], { table: 'tradingpost_historical_holding' });
            const query = this.pgp.helpers.insert(historicalHoldings, cs);
            yield this.db.none(query);
        });
        this.upsertTradingPostHistoricalHoldings = (historicalHoldings) => __awaiter(this, void 0, void 0, function* () {
            if (historicalHoldings.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'accountId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'option_id', prop: 'optionId' },
                { name: 'security_type', prop: 'securityType' },
                { name: 'price', prop: 'price' },
                { name: 'price_as_of', prop: 'priceAsOf' },
                { name: 'price_source', prop: 'priceSource' },
                { name: 'value', prop: 'value' },
                { name: 'cost_basis', prop: 'costBasis' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'currency', prop: 'currency' },
                { name: 'date', prop: 'date' },
            ], { table: 'tradingpost_historical_holding' });
            const query = upsertReplaceQuery(historicalHoldings, cs, this.pgp, 'account_id, security_id, coalesce(option_id,-1), date, price');
            yield this.db.none(query);
        });
        this.addTradingPostCustomIndustries = (customIndustries) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'industry', prop: 'industry' },
            ]);
            const query = this.pgp.helpers.insert(customIndustries, cs);
            yield this.db.none(query);
        });
        this.addTradingPostTransactions = (transactions) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'accountId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'security_type', prop: 'securityType' },
                { name: 'date', prop: 'date' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'price', prop: 'price' },
                { name: 'amount', prop: 'amount' },
                { name: 'fees', prop: 'fees' },
                { name: 'type', prop: 'type' },
                { name: 'currency', prop: 'currency' },
                { name: 'option_id', prop: 'optionId' }
            ], { table: 'tradingpost_transaction' });
            const query = this.pgp.helpers.insert(transactions, cs);
            yield this.db.none(query);
        });
        this.getOldestTransaction = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const r = yield this.db.oneOrNone(`SELECT id,
                                                  account_id,
                                                  security_id,
                                                  security_type,
                                                  date,
                                                  quantity,
                                                  price,
                                                  amount,
                                                  fees,
                                                  type,
                                                  currency,
                                                  updated_at,
                                                  created_at,
                                                  option_id
                                           FROM tradingpost_transaction
                                           WHERE account_id = $1
                                           ORDER BY date ASC
                                           LIMIT 1;`, accountId);
            if (!r)
                return null;
            return {
                optionId: r.option_id,
                accountId: r.account_id,
                amount: r.amount,
                fees: r.fees,
                type: r.type,
                currency: r.currency,
                date: luxon_1.DateTime.fromJSDate(r.date),
                quantity: r.quantity,
                price: r.price,
                securityId: r.security_id,
                securityType: r.security_type,
            };
        });
        this.upsertTradingPostTransactions = (transactions) => __awaiter(this, void 0, void 0, function* () {
            if (transactions.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'accountId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'security_type', prop: 'securityType' },
                { name: 'date', prop: 'date' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'price', prop: 'price' },
                { name: 'amount', prop: 'amount' },
                { name: 'fees', prop: 'fees' },
                { name: 'type', prop: 'type' },
                { name: 'currency', prop: 'currency' },
                { name: 'option_id', prop: 'optionId' }
            ], { table: 'tradingpost_transaction' });
            const query = upsertReplaceQuery(transactions, cs, this.pgp, 'account_id, security_id, coalesce (option_id, -1), type, date, price');
            yield this.db.none(query);
        });
        this.addTradingPostAccountGroupStats = (groupStats) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_group_id', prop: 'accountGroupId' },
                { name: 'beta', prop: 'beta', },
                { name: 'sharpe', prop: 'sharpe' },
                { name: 'industry_allocations', prop: 'industryAllocations', mod: ':json' },
                { name: 'exposure', prop: 'exposure' },
                { name: 'date', prop: 'date' },
                { name: 'benchmark_id', prop: 'benchmarkId' }
            ], { table: 'tradingpost_account_group_stat' });
            const query = this.pgp.helpers.insert(groupStats, cs);
            yield this.db.none(query);
        });
        this.addTradingPostAccountToAccountGroup = (accountToAccountGroups) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_id', prop: 'accountId' },
                { name: 'account_group_id', prop: 'accountGroupId' }
            ], { table: '_tradingpost_account_to_group' });
            const query = this.pgp.helpers.insert(accountToAccountGroups, cs);
            yield this.db.none(query);
        });
        this.getTradingPostHoldingsByAccount = (userId, accountId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT account_id,
                            security_id,
                            security_type,
                            option_id,
                            (SELECT json_agg(t)
                             FROM public.security_option as t
                             WHERE t.id = tradingpost_historical_holding.option_id) AS option_info,
                            price,
                            value,
                            cost_basis,
                            CASE
                                WHEN quantity = 0 THEN 0
                                WHEN cost_basis is null THEN 0
                                ELSE (value - (cost_basis))
                                END                                                 as pnl,
                            quantity,
                            date
                     FROM tradingpost_historical_holding
                     WHERE account_id = $1
                       AND date BETWEEN $2
                         AND $3
                     ORDER BY value desc
        `;
            const response = yield this.db.any(query, [accountId, startDate, endDate]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get current holdings for userId: ${userId} and  accountId: ${accountId}`);
            }
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    accountId: d.account_id,
                    securityId: parseInt(d.security_id),
                    securityType: d.security_type,
                    optionId: parseInt(d.option_id),
                    optionInfo: d.option_info,
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    pnl: parseFloat(d.pnl),
                    quantity: parseFloat(d.quantity),
                    date: d.date
                });
            }
            return holdings;
        });
        this.getTradingPostHoldingsByAccountGroup = (userId, accountGroupId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id        AS account_group_id,
                            ht.security_id              AS security_id,
                            ht.security_type            AS security_type,
                            ht.option_id                AS option_id,
                            (SELECT json_agg(t)
                             FROM public.security_option as t
                             WHERE t.id = ht.option_id) AS option_info,
                            AVG(ht.price)               AS price,
                            SUM(ht.value)               AS value,
                            CASE
                                WHEN SUM(ht.quantity) = 0 THEN 0
                                WHEN sum(ht.cost_basis) is null THEN 0
                                ELSE SUM(ht.cost_basis) / SUM(ht.quantity)
                                END
                                                        AS cost_basis,
                            CASE
                                WHEN SUM(ht.quantity) = 0 THEN 0
                                WHEN SUM(ht.cost_basis) IS null THEN 0
                                ELSE (SUM(ht.value) - (SUM(ht.cost_basis)))
                                END
                                                        AS pnl,
                            SUM(ht.quantity)            AS quantity,
                            ht.date                     AS date
                     FROM tradingpost_historical_holding ht
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON ht.account_id = atg.account_id
                     WHERE atg.account_group_id =
                           $1
                       AND ht
                         .
                         date
                         BETWEEN
                         $2
                         AND
                         $3
                     GROUP BY atg
                                  .
                                  account_group_id,
                              ht
                                  .
                                  security_id,
                              ht
                                  .
                                  date,
                              ht.security_type,
                              ht.option_id
                     ORDER BY value
                             desc`;
            const response = yield this.db.any(query, [accountGroupId, startDate, endDate]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get historical holdings for accountGroupId: ${accountGroupId}`);
            }
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    accountGroupId: parseInt(d.account_group_id),
                    securityId: parseInt(d.security_id),
                    securityType: d.security_type,
                    optionId: parseInt(d.option_id),
                    optionInfo: d.option_info,
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    pnl: parseFloat(d.pnl),
                    quantity: parseFloat(d.quantity),
                    date: d.date
                });
            }
            return holdings;
        });
        this.getTradingPostCurrentHoldingsByAccountGroup = (accountGroupId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id        AS account_group_id,
                            ch.security_id              AS security_id,
                            ch.security_type            AS security_type,
                            ch.option_id                AS option_id,
                            (SELECT json_agg(t)
                             FROM public.security_option as t
                             WHERE t.id = ch.option_id) AS option_info,
                            AVG(ch.price)               AS price,
                            SUM(ch.value)               AS value,
                            CASE
                                WHEN SUM(ch.quantity) = 0 THEN 0
                                WHEN sum(ch.cost_basis) is null THEN 0
                                ELSE SUM(ch.cost_basis) / SUM(ch.quantity)
                                END
                                                        AS cost_basis,
                            CASE
                                WHEN SUM(ch.quantity) = 0 THEN 0
                                WHEN SUM(ch.cost_basis) IS null THEN 0
                                ELSE (SUM(ch.value) - (SUM(ch.cost_basis)))
                                END
                                                        AS pnl,
                            SUM(ch.quantity)            AS quantity,
                            ch.updated_at               AS updated_at
                     FROM tradingpost_current_holding ch
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON ch.account_id = atg.account_id
                     WHERE atg.account_group_id =
                           $1
                     GROUP BY atg
                                  .
                                  account_group_id,
                              ch
                                  .
                                  security_id,
                              ch
                                  .
                                  updated_at,
                              ch
                                  .
                                  option_id,
                              ch.security_type
                     ORDER BY value
                             desc;`;
            let holdings = [];
            if (!accountGroupId) {
                return holdings;
            }
            const response = yield this.db.any(query, [accountGroupId]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get current holdings for accountGroupId: ${accountGroupId}`);
            }
            for (let d of response) {
                holdings.push({
                    accountGroupId: parseInt(d.account_group_id),
                    securityId: parseInt(d.security_id),
                    securityType: d.security_type,
                    optionId: parseInt(d.option_id),
                    optionInfo: d.option_info,
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    pnl: parseFloat(d.pnl),
                    quantity: parseFloat(d.quantity),
                    date: d.updated_at
                });
            }
            return holdings;
        });
        this.getTradingPostTransactionsByAccountGroup = (accountGroupId, paging, cash) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id          AS account_group_id,
                            security_id,
                            security_type,
                            date,
                            SUM(quantity)                 AS quantity,
                            AVG(price)                    AS price,
                            SUM(amount)                   AS amount,
                            SUM(fees)                     AS fees,
                            type,
                            currency,
                            option_id,
                            (SELECT json_agg(t)
                             FROM public.security_option as t
                             WHERE t.id = tt."option_id") AS "option_info"
                     FROM tradingpost_transaction tt
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON tt.account_id = atg.account_id
                     WHERE atg.account_group_id = $1
                       AND type in ($2:list)
                     GROUP BY account_group_id, security_id, security_type, date, type, currency, option_id
                     ORDER BY date DESC
        `;
            let trades = [];
            if (!accountGroupId) {
                return trades;
            }
            let response;
            let includedTypes = ['buy', 'sell', 'short', 'cover'];
            if (cash) {
                includedTypes.push('cash');
            }
            let params = [accountGroupId, includedTypes];
            if (paging) {
                query += `LIMIT $3
                      OFFSET $4`;
                params.push(...[paging.limit, paging.offset * paging.limit]);
            }
            response = yield this.db.any(query, params);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get trades for accountGroupId: ${accountGroupId}`);
            }
            for (let d of response) {
                trades.push({
                    accountGroupId: parseInt(d.account_group_id),
                    securityId: parseInt(d.security_id),
                    securityType: d.security_type,
                    optionId: parseInt(d.option_id),
                    optionInfo: d.option_info,
                    date: luxon_1.DateTime.fromJSDate(d.date),
                    quantity: parseFloat(d.quantity),
                    price: parseFloat(d.price),
                    amount: parseFloat(d.amount),
                    fees: parseFloat(d.fees),
                    type: d.type,
                    currency: d.currency
                });
            }
            return trades;
        });
        this.getTradingPostAccountGroupReturns = (accountGroupId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            account_group_id,
                            date,
                            return,
                            created_at,
                            updated_at
                     FROM account_group_hpr
                     WHERE account_group_id = $1
                       AND date BETWEEN $2
                         AND $3
                     ORDER BY date;`;
            const response = yield this.db.any(query, [accountGroupId, startDate, endDate]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get returns for accountGroupId: ${accountGroupId}`);
            }
            let holdingPeriodReturns = [];
            for (let d of response) {
                holdingPeriodReturns.push({
                    id: parseInt(d.id),
                    accountGroupId: parseInt(d.account_group_id),
                    date: luxon_1.DateTime.fromJSDate(d.date),
                    return: parseFloat(d.return),
                    created_at: luxon_1.DateTime.fromJSDate(d.created_at),
                    updated_at: luxon_1.DateTime.fromJSDate(d.updated_at)
                });
            }
            return holdingPeriodReturns;
        });
        this.getDailySecurityPrices = (securityId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            security_id,
                            price,
                            time,
                            created_at
                     FROM security_price
                     WHERE security_id = $1
                       AND time BETWEEN $2
                         AND $3
                       AND is_eod = true;
        `;
            const response = yield this.db.any(query, [securityId, startDate, endDate]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get prices for securityId: ${securityId}`);
            }
            let prices = [];
            for (let d of response) {
                prices.push({
                    securityId: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    date: luxon_1.DateTime.fromJSDate(d.time)
                });
            }
            return prices;
        });
        this.addSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            if (securities.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'symbol', prop: 'symbol' },
                { name: 'company_name', prop: 'companyName' },
                { name: 'exchange', prop: 'exchange' },
                { name: 'industry', prop: 'industry' },
                { name: 'website', prop: 'website' },
                { name: 'description', prop: 'description' },
                { name: 'ceo', prop: 'ceo' },
                { name: 'security_name', prop: 'securityName' },
                { name: 'issue_type', prop: 'issueType' },
                { name: 'sector', prop: 'sector' },
                { name: 'primary_sic_code', prop: 'primarySicCode' },
                { name: 'employees', prop: 'employees' },
                { name: 'tags', prop: 'tags' },
                { name: 'address', prop: 'address' },
                { name: 'address2', prop: 'address2' },
                { name: 'state', prop: 'state' },
                { name: 'zip', prop: 'zip' },
                { name: 'country', prop: 'country' },
                { name: 'phone', prop: 'phone' },
                { name: 'logo_url', prop: 'logoUrl' },
                { name: 'enable_utp', prop: 'enableUtp' },
                { name: 'price_source', prop: 'priceSource' }
            ], { table: 'security' });
            const query = this.pgp.helpers.insert(securities, cs);
            yield this.db.none(query);
        });
        this.getSecuritiesBySymbol = (symbols) => __awaiter(this, void 0, void 0, function* () {
            if (symbols.length <= 0)
                return [];
            let query = `SELECT id,
                            symbol,
                            company_name,
                            exchange,
                            industry,
                            website,
                            description,
                            ceo,
                            security_name,
                            issue_type,
                            sector,
                            primary_sic_code,
                            employees,
                            tags,
                            address,
                            address2,
                            state,
                            zip,
                            country,
                            phone,
                            logo_url,
                            last_updated,
                            created_at
                     FROM security
                     WHERE symbol IN ($1:list)`;
            const response = yield this.db.query(query, [symbols]);
            if (!response || response.length <= 0)
                return [];
            let sec = [];
            for (let d of response) {
                sec.push({
                    id: parseInt(d.id),
                    symbol: d.symbol,
                    companyName: d.company_name,
                    exchange: d.exchange,
                    industry: d.industry,
                    website: d.website,
                    description: d.description,
                    ceo: d.ceo,
                    securityName: d.security_name,
                    issueType: d.issueType,
                    sector: d.sector,
                    primarySicCode: d.primary_sic_code,
                    employees: d.employees,
                    tags: d.tags,
                    address: d.address,
                    address2: d.address2,
                    state: d.state,
                    zip: d.zip,
                    country: d.country,
                    phone: d.phone,
                    logoUrl: d.logo_url,
                    lastUpdated: d.last_updated,
                    createdAt: d.created_at
                });
            }
            return sec;
        });
        this.getSecurities = (securityIds) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            symbol,
                            company_name,
                            exchange,
                            industry,
                            website,
                            description,
                            ceo,
                            security_name,
                            issue_type,
                            sector,
                            primary_sic_code,
                            employees,
                            tags,
                            address,
                            address2,
                            state,
                            zip,
                            country,
                            phone,
                            logo_url,
                            last_updated,
                            created_at
                     FROM security
                     WHERE id IN ($1:list)`;
            const response = yield this.db.query(query, [securityIds]);
            if (!response || response.length <= 0) {
                throw new Error(`Failed to get security info for securityIds: ${securityIds}`);
            }
            let sec = [];
            for (let d of response) {
                sec.push({
                    id: parseInt(d.id),
                    symbol: d.symbol,
                    companyName: d.company_name,
                    exchange: d.exchange,
                    industry: d.industry,
                    website: d.website,
                    description: d.description,
                    ceo: d.ceo,
                    securityName: d.security_name,
                    issueType: d.issueType,
                    sector: d.sector,
                    primarySicCode: d.primary_sic_code,
                    employees: d.employees,
                    tags: d.tags,
                    address: d.address,
                    address2: d.address2,
                    state: d.state,
                    zip: d.zip,
                    country: d.country,
                    phone: d.phone,
                    logoUrl: d.logo_url,
                    lastUpdated: d.last_updated,
                    createdAt: d.created_at
                });
            }
            return sec;
        });
        this.getAccountGroupHPRsLatestDate = (accountGroupId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT max(date)
                     FROM account_group_hpr
                     WHERE account_group_id = $1`;
            const latestDate = yield this.db.one(query, [accountGroupId]);
            return latestDate.max;
        });
        this.addAccountGroupReturns = (accountGroupReturns) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_group_id', prop: 'accountGroupId' },
                { name: 'date', prop: 'date' },
                { name: 'return', prop: 'return' },
            ], { table: 'account_group_hpr' });
            const query = upsertReplaceQueryWithColumns(accountGroupReturns, cs, this.pgp, ["return"], "date, account_group_id");
            const result = yield this.db.result(query);
            return result.rowCount > 0 ? 1 : 0;
        });
        this.addBenchmarkReturns = (benchmarkReturns) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'date', prop: 'date' },
                { name: 'return', prop: 'return' }
            ], { table: 'benchmark_hpr' });
            const query = upsertReplaceQueryWithColumns(benchmarkReturns, cs, this.pgp, ["return"], "benchmark_hpr_security_id_date_key");
            const result = yield this.db.result(query);
            return result.rowCount > 0 ? 1 : 0;
        });
        this.addAccountGroupSummary = (accountGroupSummary) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_group_id', prop: 'accountGroupId' },
                { name: 'beta', prop: 'beta' },
                { name: 'sharpe', prop: 'sharpe' },
                { name: 'industry_allocations', prop: 'industryAllocations' },
                { name: 'exposure', prop: 'exposure' },
                { name: 'date', prop: 'date' },
                { name: 'benchmark_id', prop: 'benchmarkId' }
            ], { table: 'tradingpost_account_group_stat' });
            const query = upsertReplaceQueryWithColumns(accountGroupSummary, cs, this.pgp, ["beta", "sharpe", "industry_allocations", "exposure", "date", "benchmark_id"], "account_group_id, date");
            const result = yield this.db.result(query);
            return result.rowCount > 0 ? 1 : 0;
        });
        this.getAccountGroupSummary = (accountGroupId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            account_group_id,
                            beta,
                            sharpe,
                            industry_allocations,
                            exposure,
                            date,
                            benchmark_id,
                            updated_at,
                            created_at
                     FROM tradingpost_account_group_stat
                     WHERE account_group_id = $1
                     ORDER BY date DESC
                     LIMIT 1
        `;
            const result = yield this.db.one(query, [accountGroupId]);
            return {
                accountGroupId: result.account_group_id,
                beta: result.beta,
                sharpe: result.sharpe,
                industryAllocations: result.industry_allocations,
                exposure: result.exposure,
                date: result.date,
                benchmarkId: result.benchmark_id
            };
        });
        this.deleteFinicityHoldings = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM FINICITY_HOLDING
                       WHERE finicity_account_id IN ($1:list);`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteFinicityTransactions = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM FINICITY_TRANSACTION
                       WHERE internal_finicity_account_id IN ($1:list);`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteFinicityAccounts = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM finicity_account
                       WHERE id IN ($1:list);`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteTradingPostBrokerageAccounts = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            if (accountIds.length <= 0)
                return;
            try {
                const accountGroupRes = yield this.db.query(`SELECT distinct account_group_id
                                                         FROM _TRADINGPOST_ACCOUNT_TO_GROUP
                                                         WHERE account_id IN ($1:list)`, [accountIds]);
                let accountGroupIds = accountGroupRes.map((r) => r.account_group_id);
                if (accountGroupIds.length > 0) {
                    yield this.db.none(`
                BEGIN;
                    DELETE FROM ACCOUNT_GROUP_HPR WHERE account_group_id IN ($1:list);
                    DELETE FROM TRADINGPOST_ACCOUNT_GROUP_STAT WHERE account_group_id IN ($1:list);
                    DELETE FROM _TRADINGPOST_ACCOUNT_TO_GROUP WHERE account_group_id IN($1:list);
                    DELETE FROM TRADINGPOST_ACCOUNT_GROUP WHERE id IN($1:list);
                COMMIT;
                `, [accountGroupIds]);
                }
            }
            catch (e) {
                console.error(e);
            }
            try {
                if (accountIds.length > 0) {
                    yield this.db.none(`
                BEGIN;            
                    DELETE FROM TRADINGPOST_HISTORICAL_HOLDING WHERE account_id IN ($1:list);
                    DELETE FROM TRADINGPOST_CURRENT_HOLDING WHERE account_id IN ($1:list);
                    DELETE FROM TRADINGPOST_TRANSACTION WHERE account_id IN ($1:list);
                    DELETE FROM TRADINGPOST_BROKERAGE_ACCOUNT WHERE id IN ($1:list);
                COMMIT;
            `, [accountIds]);
                }
            }
            catch (e) {
                console.error(e);
            }
        });
        this.addOptionContract = (optionContract) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'type', prop: 'type' },
                { name: 'strike_price', prop: 'strikePrice' },
                { name: 'expiration', prop: 'expiration' },
                { name: 'external_id', prop: 'externalId' }
            ], { table: 'security_option' });
            const query = this.pgp.helpers.insert(optionContract, cs) + ` RETURNING id`;
            return (yield this.db.one(query)).id;
        });
        this.upsertOptionContracts = (optionContracts) => __awaiter(this, void 0, void 0, function* () {
            if (optionContracts.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'type', prop: 'type' },
                { name: 'strike_price', prop: 'strikePrice' },
                { name: 'expiration', prop: 'expiration' },
                { name: 'external_id', prop: 'externalId' }
            ], { table: 'security_option' });
            const query = upsertReplaceQuery(optionContracts, cs, this.pgp, "security_id,type,strike_price,expiration");
            yield this.db.none(query, [optionContracts]);
        });
        this.upsertOptionContract = (oc) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO security_option(security_id, type, strike_price, expiration, external_id)
                       VALUES ($1, $2, $3, $4, $5)
                       ON CONFLICT(security_id, type, strike_price, expiration)
                           DO UPDATE SET security_id=EXCLUDED.security_id,
                                         type=EXCLUDED.type,
                                         strike_price=EXCLUDED.strike_price,
                                         expiration=EXCLUDED.expiration,
                                         external_id=EXCLUDED.external_id
                       RETURNING id;
        `;
            const result = yield this.db.oneOrNone(query, [oc.securityId, oc.type, oc.strikePrice, oc.expiration, oc.externalId]);
            if (result === null)
                return null;
            return result.id;
        });
        this.getOptionContract = (securityId, expirationDate, strikePrice, optionType) => __awaiter(this, void 0, void 0, function* () {
            const s = `SELECT id,
                          security_id,
                          type,
                          strike_price,
                          expiration,
                          external_id,
                          updated_at,
                          created_at
                   FROM security_option
                   WHERE security_id = $1
                     AND expiration = $2
                     and strike_price = $3
                     and type = $4;`;
            const res = yield this.db.oneOrNone(s, [securityId, expirationDate, strikePrice, optionType]);
            if (!res)
                return null;
            return {
                id: res.id,
                securityId: res.security_id,
                type: res.type,
                strikePrice: res.strike_price,
                expiration: res.expiration,
                externalId: res.external_id,
                updatedAt: luxon_1.DateTime.fromJSDate(res.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(res.created_at)
            };
        });
        this.getOptionContractsByExternalIds = (externalIds) => __awaiter(this, void 0, void 0, function* () {
            if (externalIds.length <= 0)
                return [];
            const s = `SELECT id,
                          security_id,
                          type,
                          strike_price,
                          expiration,
                          external_id,
                          updated_at,
                          created_at
                   FROM security_option
                   WHERE external_id IN ($1:list);`;
            const res = yield this.db.query(s, [externalIds]);
            if (!res || res.length <= 0)
                return [];
            return res.map((r) => ({
                id: r.id,
                securityId: r.security_id,
                type: r.type,
                strikePrice: r.strike_price,
                expiration: r.expiration,
                externalId: r.external_id,
                updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
            }));
        });
        this.getAccountOptionsContractsByTransactions = (accountId, securityId, strikePrice) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT so.id,
                              so.security_id,
                              so.type,
                              so.strike_price,
                              so.expiration,
                              external_id
                       FROM SECURITY_OPTION SO
                                INNER JOIN TRADINGPOST_TRANSACTION TT ON
                           so.id = tt.option_id
                       WHERE tt.account_id = $1
                         AND so.strike_price = $2
                         AND so.security_id = $3
                       ORDER BY expiration DESC`;
            const res = yield this.db.query(query, [accountId, strikePrice, securityId]);
            if (res.length <= 0)
                return [];
            return res.map((r) => {
                let o = {
                    id: r.id,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    securityId: r.security_id,
                    type: r.type,
                    expiration: r.expiration,
                    strikePrice: r.strike_price,
                    externalId: r.external_id
                };
                return o;
            });
        });
        this.getTradingPostBrokerageAccountsByBrokerageAndIds = (userId, brokerage, brokerageAccountIds) => __awaiter(this, void 0, void 0, function* () {
            if (brokerageAccountIds.length <= 0)
                return [];
            const query = `SELECT id,
                              user_id,
                              institution_id,
                              broker_name,
                              status,
                              account_number,
                              mask,
                              name,
                              official_name,
                              type,
                              subtype,
                              updated_at,
                              created_at,
                              error,
                              error_code,
                              hidden_for_deletion,
                              account_status
                       FROM TRADINGPOST_BROKERAGE_ACCOUNT
                       WHERE user_id = $1
                         AND broker_name = $2
                         AND account_number IN ($3:list);`;
            const results = yield this.db.query(query, [userId, brokerage, brokerageAccountIds]);
            if (!results || results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    userId: r.user_id,
                    mask: r.mask,
                    institutionId: r.institution_id,
                    name: r.name,
                    status: r.status,
                    error: r.error,
                    errorCode: r.error_code,
                    officialName: r.official_name,
                    subtype: r.subtype,
                    type: r.type,
                    brokerName: r.broker_name,
                    accountNumber: r.account_number,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    hiddenForDeletion: r.hidden_for_deletion,
                    accountStatus: r.account_status
                };
                return x;
            });
        });
        this.getPendingJobs = (brokerage) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   brokerage,
                   brokerage_user_id,
                   date_to_process,
                   status,
                   data,
                   updated_at,
                   created_at
            FROM brokerage_to_process
            WHERE brokerage = $1
              AND status = 'PENDING'
            ORDER BY date_to_process`;
            const results = yield this.db.query(query, [brokerage]);
            if (results.length <= 0)
                return [];
            return results.map((result) => ({
                id: result.id,
                brokerage: result.brokerage,
                brokerageUserId: result.brokerage_user_id,
                dateToProcess: luxon_1.DateTime.fromJSDate(result.date_to_process),
                status: result.status,
                data: result.data,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
            }));
        });
        this.getBrokerageJobsPerUser = (brokerage, brokerageUserId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   brokerage,
                   brokerage_user_id,
                   date_to_process,
                   status,
                   data,
                   updated_at,
                   created_at
            FROM brokerage_to_process
            WHERE brokerage = $1
              AND brokerage_user_id = $2
              AND (status = 'PENDING' OR status = 'RUNNING')
            ORDER BY date_to_process`;
            const results = yield this.db.query(query, [brokerage, brokerageUserId]);
            if (results.length <= 0)
                return [];
            return results.map((result) => ({
                id: result.id,
                brokerage: result.brokerage,
                brokerageUserId: result.brokerage_user_id,
                dateToProcess: luxon_1.DateTime.fromJSDate(result.date_to_process),
                status: result.status,
                data: result.data,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
            }));
        });
        this.updateJobStatus = (jobId, status) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE brokerage_to_process
                       SET status = $1
                       WHERE id = $2`;
            yield this.db.none(query, [status, jobId]);
        });
        this.getIbkrMasterAndSubAccounts = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = ` SELECT id,
                               user_id,
                               account_id,
                               account_process_date,
                               type,
                               account_title,
                               street,
                               street2,
                               city,
                               state,
                               zip,
                               country,
                               account_type,
                               customer_type,
                               base_currency,
                               master_account_id,
                               van,
                               capabilities,
                               alias,
                               primary_email,
                               date_opened,
                               date_closed,
                               date_funded,
                               account_representative,
                               updated_at,
                               created_at
                        FROM ibkr_account
                        WHERE account_id = $1
                           OR master_account_id = $1;`;
            const results = yield this.db.query(query, [accountId]);
            if (results.length <= 0)
                return [];
            return results.map((result) => ({
                id: result.id,
                van: result.van,
                accountId: result.account_id,
                userId: result.user_id,
                street2: result.stree2,
                type: result.type,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                street: result.street,
                state: result.state,
                zip: result.zip,
                country: result.country,
                masterAccountId: result.master_account_id,
                primaryEmail: result.primary_email,
                dateOpened: luxon_1.DateTime.fromJSDate(result.date_opened),
                dateFunded: result.date_funded ? luxon_1.DateTime.fromJSDate(result.date_funded) : null,
                dateClosed: result.date_closed ? luxon_1.DateTime.fromJSDate(result.date_closed) : null,
                city: result.city,
                customerType: result.customer_type,
                capabilities: result.capabilities,
                accountType: result.account_type,
                accountTitle: result.account_title,
                baseCurrency: result.base_currency,
                alias: result.alias,
                accountRepresentative: result.account_representative,
                accountProcessDate: luxon_1.DateTime.fromJSDate(result.account_process_date)
            }));
        });
        this.getIbkrAccount = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = ` SELECT id,
                               user_id,
                               account_id,
                               account_process_date,
                               type,
                               account_title,
                               street,
                               street2,
                               city,
                               state,
                               zip,
                               country,
                               account_type,
                               customer_type,
                               base_currency,
                               master_account_id,
                               van,
                               capabilities,
                               alias,
                               primary_email,
                               date_opened,
                               date_closed,
                               date_funded,
                               account_representative,
                               updated_at,
                               created_at
                        FROM ibkr_account
                        WHERE account_id = $1;`;
            const result = yield this.db.oneOrNone(query, [accountId]);
            if (!result)
                return null;
            return {
                id: result.id,
                van: result.van,
                accountId: result.account_id,
                userId: result.user_id,
                street2: result.stree2,
                type: result.type,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                street: result.street,
                state: result.state,
                zip: result.zip,
                country: result.country,
                masterAccountId: result.master_account_id,
                primaryEmail: result.primary_email,
                dateOpened: luxon_1.DateTime.fromJSDate(result.date_opened),
                dateFunded: result.date_funded ? luxon_1.DateTime.fromJSDate(result.date_funded) : null,
                dateClosed: result.date_closed ? luxon_1.DateTime.fromJSDate(result.date_closed) : null,
                city: result.city,
                customerType: result.customer_type,
                capabilities: result.capabilities,
                accountType: result.account_type,
                accountTitle: result.account_title,
                baseCurrency: result.base_currency,
                alias: result.alias,
                accountRepresentative: result.account_representative,
                accountProcessDate: luxon_1.DateTime.fromJSDate(result.account_process_date)
            };
        });
        this.upsertIbkrAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
            if (accounts.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'account_process_date', prop: 'accountProcessDate' },
                { name: 'type', prop: 'type' },
                { name: 'account_title', prop: 'accountTitle' },
                { name: 'street', prop: 'street' },
                { name: 'street2', prop: 'street2' },
                { name: 'city', prop: 'city' },
                { name: 'state', prop: 'state' },
                { name: 'zip', prop: 'zip' },
                { name: 'country', prop: 'country' },
                { name: 'account_type', prop: 'accountType' },
                { name: 'customer_type', prop: 'customerType' },
                { name: 'base_currency', prop: 'baseCurrency' },
                { name: 'master_account_id', prop: 'masterAccountId' },
                { name: 'van', prop: 'van' },
                { name: 'capabilities', prop: 'capabilities' },
                { name: 'alias', prop: 'alias' },
                { name: 'primary_email', prop: 'primaryEmail' },
                { name: 'date_opened', prop: 'dateOpened' },
                { name: 'date_closed', prop: 'dateClosed' },
                { name: 'date_funded', prop: 'dateFunded' },
                { name: 'account_representative', prop: 'accountRepresentative' }
            ], { table: 'ibkr_account' });
            const query = upsertReplaceQuery(accounts, cs, this.pgp, "account_id");
            yield this.db.none(query);
        });
        this.upsertIbkrSecurities = (securities) => __awaiter(this, void 0, void 0, function* () {
            if (securities.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'file_date', prop: 'fileDate' },
                { name: 'type', prop: 'type' },
                { name: 'con_id', prop: 'conId' },
                { name: 'asset_type', prop: 'assetType' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'cusip', prop: 'cusip' },
                { name: 'symbol', prop: 'symbol' },
                { name: 'bb_ticker', prop: 'bbTicker' },
                { name: 'bb_ticker_and_exchange_code', prop: 'bbTickerAndExchangeCode' },
                { name: 'bb_global_id', prop: 'bbGlobalId' },
                { name: 'description', prop: 'description' },
                { name: 'underlying_symbol', prop: 'underlyingSymbol' },
                { name: 'underlying_category', prop: 'underlyingCategory' },
                { name: 'underlying_security_id', prop: 'underlyingSecurityId' },
                { name: 'underlying_primary_exchange', prop: 'underlyingPrimaryExchange' },
                { name: 'underlying_con_id', prop: 'underlyingConId' },
                { name: 'multiplier', prop: 'multiplier' },
                { name: 'expiration_date', prop: 'expirationDate' },
                { name: 'option_type', prop: 'optionType' },
                { name: 'option_strike', prop: 'optionStrike' },
                { name: 'maturity_date', prop: 'maturityDate' },
                { name: 'issue_date', prop: 'issueDate' },
                { name: 'primary_exchange', prop: 'primaryExchange' },
                { name: 'currency', prop: 'currency' },
                { name: 'sub_category', prop: 'subCategory' },
                { name: 'issuer', prop: 'issuer' },
                { name: 'delivery_month', prop: 'deliveryMonth' }
            ], { table: 'ibkr_security' });
            const query = upsertReplaceQuery(securities, cs, this.pgp, "con_id");
            yield this.db.none(query);
        });
        this.upsertIbkrActivity = (activities) => __awaiter(this, void 0, void 0, function* () {
            if (activities.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'type', prop: 'type' },
                { name: 'file_date', prop: 'fileDate' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'con_id', prop: 'conId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'symbol', prop: 'symbol' },
                { name: 'bb_ticker', prop: 'bbTicker' },
                { name: 'bb_global_id', prop: 'bbGlobalId' },
                { name: 'security_description', prop: 'securityDescription' },
                { name: 'asset_type', prop: 'assetType' },
                { name: 'currency', prop: 'currency' },
                { name: 'base_currency', prop: 'baseCurrency' },
                { name: 'trade_date', prop: 'tradeDate' },
                { name: 'trade_time', prop: 'tradeTime' },
                { name: 'settle_date', prop: 'settleDate' },
                { name: 'order_time', prop: 'orderTime' },
                { name: 'transaction_type', prop: 'transactionType' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'unit_price', prop: 'unitPrice' },
                { name: 'gross_amount', prop: 'grossAmount' },
                { name: 'sec_fee', prop: 'secFee' },
                { name: 'commission', prop: 'commission' },
                { name: 'tax', prop: 'tax' },
                { name: 'net', prop: 'net' },
                { name: 'net_in_base', prop: 'netInBase' },
                { name: 'trade_id', prop: 'tradeId' },
                { name: 'tax_basis_election', prop: 'taxBasisElection' },
                { name: 'description', prop: 'description' },
                { name: 'fx_rate_to_base', prop: 'fxRateToBase' },
                { name: 'contra_party_name', prop: 'contraPartyName' },
                { name: 'clr_firm_id', prop: 'clrFirmId' },
                { name: 'exchange', prop: 'exchange' },
                { name: 'master_account_id', prop: 'masterAccountId' },
                { name: 'van', prop: 'van' },
                { name: 'away_broker_commission', prop: 'awayBrokerCommission' },
                { name: 'order_id', prop: 'orderId' },
                { name: 'client_references', prop: 'clientReferences' },
                { name: 'transaction_id', prop: 'transactionId' },
                { name: 'execution_id', prop: 'executionId' },
                { name: 'cost_basis', prop: 'costBasis' },
                { name: 'flag', prop: 'flag' }
            ], { table: 'ibkr_activity' });
            const query = upsertReplaceQuery(activities, cs, this.pgp, "account_id, con_id, trade_date, transaction_type, quantity");
            yield this.db.none(query);
        });
        this.upsertIbkrCashReport = (cashReports) => __awaiter(this, void 0, void 0, function* () {
            if (cashReports.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'file_date', prop: 'fileDate' },
                { name: 'type', prop: 'type' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'report_date', prop: 'reportDate' },
                { name: 'currency', prop: 'currency' },
                { name: 'base_summary', prop: 'baseSummary' },
                { name: 'label', prop: 'label' },
                { name: 'total', prop: 'total' },
                { name: 'securities', prop: 'securities' },
                { name: 'futures', prop: 'futures' },
                { name: 'ibukl', prop: 'ibukl' },
                { name: 'paxos', prop: 'paxos' },
            ], { table: 'ibkr_cash_report' });
            const query = upsertReplaceQuery(cashReports, cs, this.pgp, "account_id, report_date, base_summary, label");
            yield this.db.none(query);
        });
        this.upsertIbkrNav = (navs) => __awaiter(this, void 0, void 0, function* () {
            if (navs.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'file_date', prop: 'fileDate' },
                { name: 'type', prop: 'type' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'base_currency', prop: 'baseCurrency' },
                { name: 'cash', prop: 'cash' },
                { name: 'cash_collateral', prop: 'cashCollateral' },
                { name: 'stocks', prop: 'stocks' },
                { name: 'ipo_subscription', prop: 'ipoSubscription' },
                { name: 'securities_borrowed', prop: 'securitiesBorrowed' },
                { name: 'securities_lent', prop: 'securitiesLent' },
                { name: 'options', prop: 'options' },
                { name: 'bonds', prop: 'bonds' },
                { name: 'commodities', prop: 'commodities' },
                { name: 'funds', prop: 'funds' },
                { name: 'notes', prop: 'notes' },
                { name: 'accruals', prop: 'accruals' },
                { name: 'dividend_accruals', prop: 'dividendAccruals' },
                { name: 'soft_dollars', prop: 'softDollars' },
                { name: 'crypto', prop: 'crypto' },
                { name: 'totals', prop: 'totals' },
                { name: 'twr', prop: 'twr' },
                { name: 'cfd_unrealized_pl', prop: 'cfdUnrealizedPl' },
                { name: 'forex_cfd_unrealized_pl', prop: 'forexCfdUnrealizedPl' },
                { name: 'processed_date', prop: 'processedDate' }
            ], { table: 'ibkr_nav' });
            const query = upsertReplaceQuery(navs, cs, this.pgp, "account_id, processed_date");
            yield this.db.none(query);
        });
        this.upsertIbkrPls = (pls) => __awaiter(this, void 0, void 0, function* () {
            if (pls.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'file_date', prop: 'fileDate' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'internal_asset_id', prop: 'internalAssetId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'symbol', prop: 'symbol' },
                { name: 'bb_ticker', prop: 'bbTicker' },
                { name: 'bb_global_id', prop: 'bbGlobalId' },
                { name: 'security_description', prop: 'securityDescription' },
                { name: 'asset_type', prop: 'assetType' },
                { name: 'currency', prop: 'currency' },
                { name: 'report_date', prop: 'reportDate' },
                { name: 'position_mtm', prop: 'positionMtm' },
                { name: 'position_mtm_in_base', prop: 'positionMtmInBase' },
                { name: 'transaction_mtm', prop: 'transactionMtm' },
                { name: 'transaction_mtm_in_base', prop: 'transactionMtmInBase' },
                { name: 'realized_st', prop: 'realizedSt' },
                { name: 'realized_st_in_base', prop: 'realizedStInBase' },
                { name: 'realized_lt', prop: 'realizedLt' },
                { name: 'realized_lt_in_base', prop: 'realizedLtInBase' },
                { name: 'unrealized_st', prop: 'unrealizedSt' },
                { name: 'unrealized_st_in_base', prop: 'unrealizedStInBase' },
                { name: 'unrealized_lt', prop: 'unrealizedLt' },
                { name: 'unrealized_lt_in_base', prop: 'unrealizedLtInBase' },
            ], { table: 'ibkr_pl' });
            const query = upsertReplaceQuery(pls, cs, this.pgp, "account_id, internal_asset_id, report_date");
            yield this.db.none(query);
        });
        this.upsertIbkrPositions = (positions) => __awaiter(this, void 0, void 0, function* () {
            if (positions.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'file_date', prop: 'fileDate' },
                { name: 'type', prop: 'type' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'con_id', prop: 'conId' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'symbol', prop: 'symbol' },
                { name: 'bb_ticker', prop: 'bbTicker' },
                { name: 'bb_global_id', prop: 'bbGlobalId' },
                { name: 'security_description', prop: 'securityDescription' },
                { name: 'asset_type', prop: 'assetType' },
                { name: 'currency', prop: 'currency' },
                { name: 'base_currency', prop: 'baseCurrency' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'quantity_in_base', prop: 'quantityInBase' },
                { name: 'cost_price', prop: 'costPrice' },
                { name: 'cost_basis', prop: 'costBasis' },
                { name: 'cost_basis_in_base', prop: 'costBasisInBase' },
                { name: 'market_price', prop: 'marketPrice' },
                { name: 'market_value', prop: 'marketValue' },
                { name: 'market_value_in_base', prop: 'marketValueInBase' },
                { name: 'open_date_time', prop: 'openDateTime' },
                { name: 'fx_rate_to_base', prop: 'fxRateToBase' },
                { name: 'report_date', prop: 'reportDate' },
                { name: 'settled_quantity', prop: 'settledQuantity' },
                { name: 'settled_quantity_in_base', prop: 'settledQuantityInBase' },
                { name: 'master_account_id', prop: 'masterAccountId' },
                { name: 'van', prop: 'van' },
                { name: 'accrued_int', prop: 'accruedInt' },
                { name: 'originating_order_id', prop: 'originatingOrderId' },
                { name: 'multiplier', prop: 'multiplier' },
            ], { table: 'ibkr_position' });
            const query = upsertReplaceQuery(positions, cs, this.pgp, "account_id, con_id, asset_type, report_date");
            yield this.db.none(query);
        });
        this.upsertRobinhoodUsers = (users) => __awaiter(this, void 0, void 0, function* () {
            if (users.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'username', prop: 'username' },
                { name: 'device_token', prop: 'deviceToken' },
                { name: 'status', prop: 'status' },
                { name: 'uses_mfa', prop: 'usesMfa' },
                { name: 'access_token', prop: 'accessToken' },
                { name: 'refresh_token', prop: 'refreshToken' },
            ], { table: 'robinhood_account' });
            const query = upsertReplaceQuery(users, cs, this.pgp, "username");
            yield this.db.none(query);
        });
        this.getRobinhoodUsers = () => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              username,
                              device_token,
                              status,
                              uses_mfa,
                              access_token,
                              refresh_token,
                              updated_at,
                              created_at
                       FROM robinhood_user`;
            const results = yield this.db.query(query);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    userId: r.user_id,
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    status: r.status,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    accessToken: r.access_token,
                    deviceToken: r.device_token,
                    refreshToken: r.refresh_token,
                    username: r.username,
                    usesMfa: r.uses_mfa
                };
                return x;
            });
        });
        this.getRobinhoodUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              username,
                              device_token,
                              status,
                              uses_mfa,
                              access_token,
                              refresh_token,
                              updated_at,
                              created_at
                       FROM robinhood_user
                       WHERE user_id = $1;`;
            const results = yield this.db.query(query, [userId]);
            if (results.length <= 0)
                return null;
            return {
                id: results[0].id,
                userId: results[0].user_id,
                username: results[0].username,
                deviceToken: results[0].device_token,
                status: results[0].status,
                usesMfa: results[0].uses_mfa,
                accessToken: results[0].access_token,
                refreshToken: results[0].refresh_token,
                updatedAt: luxon_1.DateTime.fromJSDate(results[0].updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(results[0].created_at)
            };
        });
        this.updateRobinhoodUser = (user) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE robinhood_user
                       SET user_id=$1,
                           device_token=$2,
                           status=$3,
                           uses_mfa=$4,
                           access_token=$5,
                           refresh_token=$6,
                           updated_at=NOW()
                       WHERE username = $7`;
            yield this.db.query(query, [user.userId, user.deviceToken, user.status, user.usesMfa, user.accessToken, user.refreshToken, user.username]);
        });
        this.insertRobinhoodUser = (user) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO robinhood_user(user_id, username, device_token, status, uses_mfa, access_token,
                                                  refresh_token)
                       VALUES ($1, $2, $3, $4, $5, $6, $7);`;
            yield this.db.query(query, [user.userId, user.username, user.deviceToken, user.status, user.usesMfa, user.accessToken, user.refreshToken]);
        });
        this.deleteRobinhoodAccountsPositions = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM robinhood_position
                       WHERE internal_account_id IN ($1:list);`;
            yield this.db.none(query, [accountIds]);
        });
        this.getRobinhoodAccountsByRobinhoodUserId = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              user_id,
                              account_number,
                              url,
                              portfolio_cash,
                              can_downgrade_to_cash_url,
                              user_url,
                              type,
                              brokerage_account_type,
                              external_created_at,
                              external_updated_at,
                              deactivated,
                              deposit_halted,
                              withdrawl_halted,
                              only_position_closing_trades,
                              buying_power,
                              onbp,
                              cash_available_for_withdrawl,
                              cash,
                              amount_eligible_for_deposit_cancellation,
                              cash_held_for_orders,
                              uncleared_deposits,
                              sma,
                              sma_held_for_orders,
                              unsettled_funds,
                              unsettled_debit,
                              crypto_buying_power,
                              max_ach_early_access_amount,
                              cash_balances,
                              updated_at,
                              created_at
                       FROM robinhood_account
                       WHERE user_id = $1`;
            const results = yield this.db.query(query, [userId]);
            return results.map((r) => {
                let x = {
                    userId: r.user_id,
                    accountNumber: r.account_number,
                    type: r.type,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    id: r.id,
                    amountEligibleForDepositCancellation: r.amount_eligible_for_deposit_cancellation,
                    brokerageAccountType: r.brokerage_account_type,
                    buyingPower: r.buying_power,
                    canDowngradeToCashUrl: r.can_downgrade_to_cash_url,
                    cash: r.cash,
                    cashAvailableForWithdrawl: r.cash_available_for_withdrawal,
                    cashBalances: r.cash_balances,
                    cashHeldForOrders: r.cash_held_for_orders,
                    cryptoBuyingPower: r.crypto_buying_power,
                    deactivated: r.deactivated,
                    depositHalted: r.deposit_halted,
                    externalCreatedAt: r.external_created_at,
                    externalUpdatedAt: r.external_updated_at,
                    maxAchEarlyAccessAmount: r.max_ach_early_access_amount,
                    onbp: r.onbp,
                    sma: r.sma,
                    onlyPositionClosingTrades: r.only_position_closing_trade,
                    portfolioCash: r.portfolio_cash,
                    smaHeldForOrders: r.sma_held_for_orders,
                    unclearedDeposits: r.uncleared_deposits,
                    unsettledDebit: r.unsettled_debit,
                    userUrl: r.user_url,
                    unsettledFunds: r.unsettled_funds,
                    url: r.url,
                    withdrawlHalted: r.withdrawl_halted
                };
                return x;
            });
        });
        this.upsertRobinhoodAccounts = (accs) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'account_number', prop: 'accountNumber' },
                { name: 'url', prop: 'url' },
                { name: 'portfolio_cash', prop: 'portfolioCash' },
                { name: 'can_downgrade_to_cash_url', prop: 'canDowngradeToCashUrl' },
                { name: 'user_url', prop: 'userUrl' },
                { name: 'type', prop: 'type' },
                { name: 'brokerage_account_type', prop: 'brokerageAccountType' },
                { name: 'external_created_at', prop: 'externalCreatedAt' },
                { name: 'external_updated_at', prop: 'externalUpdatedAt' },
                { name: 'deactivated', prop: 'deactivated' },
                { name: 'deposit_halted', prop: 'depositHalted' },
                { name: 'withdrawl_halted', prop: 'withdrawlHalted' },
                { name: 'only_position_closing_trades', prop: 'onlyPositionClosingTrades' },
                { name: 'buying_power', prop: 'buyingPower' },
                { name: 'onbp', prop: 'onbp' },
                { name: 'cash_available_for_withdrawl', prop: 'cashAvailableForWithdrawl' },
                { name: 'cash', prop: 'cash' },
                { name: 'amount_eligible_for_deposit_cancellation', prop: 'amountEligibleForDepositCancellation' },
                { name: 'cash_held_for_orders', prop: 'cashHeldForOrders' },
                { name: 'uncleared_deposits', prop: 'unclearedDeposits' },
                { name: 'sma', prop: 'sma' },
                { name: 'sma_held_for_orders', prop: 'smaHeldForOrders' },
                { name: 'unsettled_funds', prop: 'unsettledFunds' },
                { name: 'unsettled_debit', prop: 'unsettledDebit' },
                { name: 'crypto_buying_power', prop: 'cryptoBuyingPower' },
                { name: 'max_ach_early_access_amount', prop: 'maxAchEarlyAccessAmount' },
                { name: 'cash_balances', prop: 'cashBalances' }
            ], { table: "robinhood_account" });
            const query = upsertReplaceQuery(accs, cs, this.pgp, "account_number");
            yield this.db.none(query);
        });
        this.upsertRobinhoodInstruments = (instruments) => __awaiter(this, void 0, void 0, function* () {
            if (instruments.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'url', prop: 'url' },
                { name: 'symbol', prop: 'symbol' },
                { name: 'quote_url', prop: 'quoteUrl' },
                { name: 'fundamentals_url', prop: 'fundamentalsUrl' },
                { name: 'splits_url', prop: 'splitsUrl' },
                { name: 'state', prop: 'state' },
                { name: 'market_url', prop: 'marketUrl' },
                { name: 'name', prop: 'name' },
                { name: 'tradeable', prop: 'tradeable' },
                { name: 'tradability', prop: 'tradability' },
                { name: 'bloomberg_unique', prop: 'bloombergUnique' },
                { name: 'margin_initial_ratio', prop: 'marginInitialRatio' },
                { name: 'maintenance_ratio', prop: 'maintenanceRatio' },
                { name: 'country', prop: 'country' },
                { name: 'day_trade_ratio', prop: 'dayTradeRatio' },
                { name: 'list_date', prop: 'listDate' },
                { name: 'min_tick_size', prop: 'minTickSize' },
                { name: 'type', prop: 'type' },
                { name: 'tradeable_chain_id', prop: 'tradeable_chain_id' },
                { name: 'rhs_tradability', prop: 'rhsTradability' },
                { name: 'fractional_tradability', prop: 'fractionalTradability' },
                { name: 'default_collar_fraction', prop: 'defaultCollarFraction' },
                { name: 'ipo_access_status', prop: 'ipoAccessStatus' },
                { name: 'ipo_access_cob_deadline', prop: 'ipoAccessCobDeadline' },
                { name: 'ipo_s1_url', prop: 'ipoS1Url' },
                { name: 'ipo_roadshow_url', prop: 'ipoRoadshowUrl' },
                { name: 'is_spac', prop: 'ipoSpac' },
                { name: 'is_test', prop: 'isTest' },
                { name: 'ipo_access_supports_dsp', prop: 'ipoAccessSupportsDsp' },
                { name: 'extended_hours_fractional_tradability', prop: 'extendedHoursFractionalTradability' },
                { name: 'internal_halt_reason', prop: 'internalHaltReason' },
                { name: 'internal_halt_details', prop: 'internalHaltDetails' },
                { name: 'internal_halt_sessions', prop: 'internalHaltSessions' },
                { name: 'internal_halt_start_time', prop: 'internalStartTime' },
                { name: 'internal_halt_end_time', prop: 'internalEndTime' },
                { name: 'internal_halt_source', prop: 'internalHaltSource' },
                { name: 'all_day_tradability', prop: 'allDayTradability' },
            ], { table: 'robinhood_instrument' });
            const query = upsertReplaceQuery(instruments, cs, this.pgp, "symbol");
            yield this.db.none(query);
        });
        this.addRobinhoodInstrument = (instrument) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO robinhood_instrument(external_id, url, symbol, quote_url, fundamentals_url,
                                                        splits_url, state,
                                                        market_url,
                                                        name, tradeable, tradability, bloomberg_unique,
                                                        margin_initial_ratio, maintenance_ratio,
                                                        country, day_trade_ratio, list_date, min_tick_size, type,
                                                        tradeable_chain_id, rhs_tradability, fractional_tradability,
                                                        default_collar_fraction,
                                                        ipo_access_status, ipo_access_cob_deadline, ipo_s1_url,
                                                        ipo_roadshow_url, is_spac, is_test,
                                                        ipo_access_supports_dsp, extended_hours_fractional_tradability,
                                                        internal_halt_reason, internal_halt_details,
                                                        internal_halt_sessions, internal_halt_start_time,
                                                        internal_halt_end_time, internal_halt_source,
                                                        all_day_tradability)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
                               $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
                               $37, $38)
                       ON CONFLICT (symbol) DO UPDATE SET symbol=EXCLUDED.symbol
                       RETURNING id;`;
            const results = yield this.db.oneOrNone(query, [instrument.externalId, instrument.url, instrument.symbol, instrument.quoteUrl,
                instrument.fundamentalsUrl, instrument.splitsUrl, instrument.state, instrument.marketUrl, instrument.name,
                instrument.tradeable, instrument.tradability, instrument.bloombergUnique, instrument.marginInitialRatio,
                instrument.maintenanceRatio, instrument.country, instrument.dayTradeRatio, instrument.listDate,
                instrument.minTickSize, instrument.type, instrument.tradeableChainId, instrument.rhsTradability,
                instrument.fractionalTradability,
                instrument.defaultCollarFraction, instrument.ipoAccessStatus, instrument.ipoAccessCobDeadline,
                instrument.ipoS1Url, instrument.ipoRoadshowUrl, instrument.isSpac, instrument.isTest,
                instrument.ipoAccessSupportsDsp, instrument.extendedHoursFractionalTradability,
                instrument.internalHaltReason, instrument.internalHaltDetails, instrument.internalHaltSessions,
                instrument.internalHaltStartTime, instrument.internalHaltEndTime, instrument.internalHaltSource,
                instrument.allDayTradability]);
            if (results === null)
                throw new Error("could not return id");
            return results.id;
        });
        this.upsertRobinhoodTransactions = (txs) => __awaiter(this, void 0, void 0, function* () {
            if (txs.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'internal_account_id', prop: 'internalAccountId' },
                { name: 'internal_instrument_id', prop: 'internalInstrumentId' },
                { name: 'internal_option_id', prop: 'internalOptionId' },
                { name: 'external_id', prop: 'externalId' },
                { name: 'ref_id', prop: 'refId' },
                { name: 'url', prop: 'url' },
                { name: 'account_url', prop: 'accountUrl' },
                { name: 'position_url', prop: 'positionUrl' },
                { name: 'cancel', prop: 'cancel' },
                { name: 'instrument_url', prop: 'instrumentUrl' },
                { name: 'instrument_id', prop: 'instrumentId' },
                { name: 'cumulative_quantity', prop: 'cumulativeQuantity' },
                { name: 'average_price', prop: 'averagePrice' },
                { name: 'fees', prop: 'fees' },
                { name: 'rate', prop: 'rate' },
                { name: 'position', prop: 'position' },
                { name: 'withholding', prop: 'withholding' },
                { name: 'cash_dividend_id', prop: 'cashDividendId' },
                { name: 'state', prop: 'state' },
                { name: 'type', prop: 'type' },
                { name: 'side', prop: 'side' },
                { name: 'trigger', prop: 'trigger' },
                { name: 'price', prop: 'price' },
                { name: 'stop_price', prop: 'stopPrice' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'reject_reason', prop: 'rejectReason' },
                { name: 'external_created_at', prop: 'externalCreatedAt' },
                { name: 'external_updated_at', prop: 'externalUpdatedAt' },
                { name: 'last_transaction_at', prop: 'lastTransactionAt' },
                { name: 'executions_price', prop: 'executionsPrice' },
                { name: 'executions_quantity', prop: 'executionsQuantity' },
                { name: 'executions_settlement_date', prop: 'executionsSettlementDate' },
                { name: 'executions_timestamp', prop: 'executionsTimestamp' },
                { name: 'executions_id', prop: 'executionsId' },
                { name: 'extended_hours', prop: 'extendedHours' },
                { name: 'dollar_based_amount', prop: 'dollarBasedAmount' },
                { name: 'investment_schedule_id', prop: 'investmentScheduleId' },
                { name: 'account_number', prop: 'accountNumber' },
                { name: 'cancel_url', prop: 'cancelUrl' },
                { name: 'canceled_quantity', prop: 'canceledQuantity' },
                { name: 'direction', prop: 'direction' },
                { name: 'option_leg_id', prop: 'optionLegId' },
                { name: 'position_effect', prop: 'positionEffect' },
                { name: 'ratio_quantity', prop: 'ratioQuantity' },
                { name: 'pending_quantity', prop: 'pendingQuantity' },
                { name: 'processed_quantity', prop: 'processedQuantity' },
                { name: 'chain_id', prop: 'chainId' },
                { name: 'chain_symbol', prop: 'chainSymbol' },
                { name: 'ach_relationship', prop: 'achRelationship' },
                { name: 'expected_landing_date', prop: 'expectedLandingDate' },
                { name: 'expected_landing_datetime', prop: 'expectedLandingDateTime' },
            ], { table: 'robinhood_transaction' });
            const query = upsertReplaceQuery(txs, cs, this.pgp, `internal_account_id,internal_instrument_id,coalesce(internal_option_id,-1),executions_timestamp,executions_quantity`);
            yield this.db.none(query);
        });
        this.upsertRobinhoodOptions = (options) => __awaiter(this, void 0, void 0, function* () {
            if (options.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'internal_instrument_id', prop: 'internalInstrumentId' },
                { name: 'external_id', prop: 'externalId' },
                { name: 'chain_id', prop: 'chainId' },
                { name: 'chain_symbol', prop: 'chainSymbol' },
                { name: 'external_created_at', prop: 'externalCreatedAt' },
                { name: 'expiration_date', prop: 'expiration_date' },
                { name: 'issue_date', prop: 'issueDate' },
                { name: 'min_ticks_above_tick', prop: 'minTicksAboveTick' },
                { name: 'min_ticks_below_tick', prop: 'minTicksBelowTick' },
                { name: 'min_ticks_cutoff_price', prop: 'minTicksCutoffPrice' },
                { name: 'rhs_tradability', prop: 'rhsTradability' },
                { name: 'state', prop: 'state' },
                { name: 'strike_price', prop: 'strikePrice' },
                { name: 'tradability', prop: 'tradability' },
                { name: 'type', prop: 'type' },
                { name: 'external_updated_at', prop: 'externalUpdatedAt' },
                { name: 'url', prop: 'url' },
                { name: 'sellout_date_time', prop: 'selloutDateTime' },
                { name: 'long_strategy_code', prop: 'longStrategyCode' },
                { name: 'short_strategy_code', prop: 'shortStrategyCode' }
            ], { table: 'robinhood_option' });
            const query = upsertReplaceQuery(options, cs, this.pgp, "external_id");
            yield this.db.none(query);
        });
        this.upsertRobinhoodOption = (option) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO robinhood_option(internal_instrument_id, external_id, chain_id, chain_symbol,
                                                    external_created_at, expiration_date,
                                                    issue_date, min_ticks_above_tick, min_ticks_below_tick,
                                                    min_ticks_cutoff_price, rhs_tradability,
                                                    state, strike_price, tradability, type, external_updated_at, url,
                                                    sellout_date_time, long_strategy_code,
                                                    short_strategy_code)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
                               $20)
                       ON CONFLICT(external_id) DO UPDATE SET internal_instrument_id=EXCLUDED.internal_instrument_id,
                                                              external_id=EXCLUDED.external_id,
                                                              chain_id=EXCLUDED.chain_id,
                                                              chain_symbol=EXCLUDED.chain_symbol,
                                                              external_created_at=EXCLUDED.external_created_at,
                                                              expiration_date=EXCLUDED.expiration_date,
                                                              issue_date=EXCLUDED.issue_date,
                                                              min_ticks_above_tick=EXCLUDED.min_ticks_above_tick,
                                                              min_ticks_below_tick=EXCLUDED.min_ticks_below_tick,
                                                              min_ticks_cutoff_price=EXCLUDED.min_ticks_cutoff_price,
                                                              rhs_tradability=EXCLUDED.rhs_tradability,
                                                              state=EXCLUDED.state,
                                                              strike_price=EXCLUDED.strike_price,
                                                              tradability=EXCLUDED.tradability,
                                                              type=EXCLUDED.type,
                                                              external_updated_at=EXCLUDED.external_updated_at,
                                                              url=EXCLUDED.url,
                                                              sellout_date_time=EXCLUDED.sellout_date_time,
                                                              long_strategy_code=EXCLUDED.long_strategy_code,
                                                              short_strategy_code=EXCLUDED.short_strategy_code
                       RETURNING id;`;
            const response = yield this.db.oneOrNone(query, [option.internalInstrumentId, option.externalId, option.chainId, option.chainSymbol, option.externalCreatedAt, option.expirationDate, option.issueDate,
                option.minTicksAboveTick, option.minTicksBelowTick, option.minTicksCutoffPrice, option.rhsTradability, option.state, option.strikePrice, option.tradability,
                option.type, option.externalUpdatedAt, option.url, option.selloutDateTime, option.longStrategyCode, option.shortStrategyCode]);
            if (response === null)
                return null;
            return response.id;
        });
        this.upsertRobinhoodPositions = (positions) => __awaiter(this, void 0, void 0, function* () {
            if (positions.length <= 0)
                return;
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'internal_account_id', prop: 'internalAccountId' },
                { name: 'internal_instrument_id', prop: 'internalInstrumentId' },
                { name: 'internal_option_id', prop: 'internalOptionId' },
                { name: 'url', prop: 'url' },
                { name: 'instrument_url', prop: 'instrumentUrl' },
                { name: 'instrument_id', prop: 'instrumentId' },
                { name: 'account_url', prop: 'accountUrl' },
                { name: 'account_number', prop: 'accountNumber' },
                { name: 'average_buy_price', prop: 'averageBuyPrice' },
                { name: 'pending_average_buy_price', prop: 'pendingAverageBuyPrice' },
                { name: 'quantity', prop: 'quantity' },
                { name: 'intraday_average_buy_price', prop: 'intradayAverageBuyPrice' },
                { name: 'intraday_quantity', prop: 'intradayQuantity' },
                { name: 'shares_available_for_exercise', prop: 'sharesAvailableForExercise' },
                { name: 'shares_held_for_buys', prop: 'sharesHeldForBuys' },
                { name: 'shares_held_for_sells', prop: 'sharesHeldForSells' },
                { name: 'shares_held_for_stock_grants', prop: 'sharesHeldForStockGrants' },
                { name: 'ipo_allocated_quantity', prop: 'ipoAllocatedQuantity' },
                { name: 'ipo_dsp_allocated_quantity', prop: 'ipoDspAllocatedQuantity' },
                { name: 'avg_cost_affected', prop: 'avgCostAffected' },
                { name: 'avg_cost_affected_reason', prop: 'avgCostAffectedReason' },
                { name: 'is_primary_account', prop: 'isPrimaryAccount' },
                { name: 'external_updated_at', prop: 'externalUpdatedAt' },
                { name: 'external_created_at', prop: 'externalCreatedAt' },
                { name: 'average_price', prop: 'averagePrice' },
                { name: 'chain_id', prop: 'chainId' },
                { name: 'chain_symbol', prop: 'chainSymbol' },
                { name: 'external_id', prop: 'externalId' },
                { name: 'type', prop: 'type' },
                { name: 'pending_buy_quantity', prop: 'pendingBuyQuantity' },
                { name: 'pending_expired_quantity', prop: 'pendingExpiredQuantity' },
                { name: 'pending_assignment_quantity', prop: 'pendingAssignmentQuantity' },
                { name: 'pending_sell_quantity', prop: 'pendingSellQuantity' },
                { name: 'intraday_average_open_price', prop: 'intradayAverageOpenPrice' },
                { name: 'trade_value_multiplier', prop: 'tradeValueMultiplier' },
                { name: 'external_option_id', prop: 'externalOptionId' },
            ], { table: 'robinhood_position' });
            const query = upsertReplaceQuery(positions, cs, this.pgp, `internal_account_id,internal_instrument_id,internal_option_id`);
            yield this.db.none(query);
        });
        this.getRobinhoodInstrumentsByExternalId = (instrumentIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              external_id,
                              url,
                              symbol,
                              quote_url,
                              fundamentals_url,
                              splits_url,
                              state,
                              market_url,
                              name,
                              tradeable,
                              tradability,
                              bloomberg_unique,
                              margin_initial_ratio,
                              maintenance_ratio,
                              country,
                              day_trade_ratio,
                              list_date,
                              min_tick_size,
                              type,
                              tradeable_chain_id,
                              rhs_tradability,
                              fractional_tradability,
                              default_collar_fraction,
                              ipo_access_status,
                              ipo_access_cob_deadline,
                              ipo_s1_url,
                              ipo_roadshow_url,
                              is_spac,
                              is_test,
                              ipo_access_supports_dsp,
                              extended_hours_fractional_tradability,
                              internal_halt_reason,
                              internal_halt_details,
                              internal_halt_sessions,
                              internal_halt_start_time,
                              internal_halt_end_time,
                              internal_halt_source,
                              all_day_tradability,
                              updated_at,
                              created_at
                       FROM robinhood_instrument
                       where external_id IN ($1:list);`;
            const results = yield this.db.query(query, [instrumentIds]);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    externalId: r.external_id,
                    name: r.name,
                    marketUrl: r.market_url,
                    url: r.url,
                    type: r.type,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    symbol: r.symbol,
                    state: r.state,
                    splitsUrl: r.splits_url,
                    quoteUrl: r.quote_url,
                    country: r.country,
                    maintenanceRatio: r.maintenance_ratio,
                    marginInitialRatio: r.margin_initial_ratio,
                    bloombergUnique: r.bloomberg_unique,
                    tradability: r.tradability,
                    tradeable: r.tradeable,
                    dayTradeRatio: r.day_trade_ratio,
                    fundamentalsUrl: r.fundamentals_url,
                    listDate: r.list_date,
                    minTickSize: r.min_tick_size,
                    tradeableChainId: r.tradeable_chain_id,
                    rhsTradability: r.rhs_tradability,
                    fractionalTradability: r.fractional_tradability,
                    defaultCollarFraction: r.default_collar_fraction,
                    ipoAccessStatus: r.ipo_access_status,
                    ipoAccessCobDeadline: r.ipo_access_cob_deadline,
                    ipoS1Url: r.ipo_s1_url,
                    ipoRoadshowUrl: r.ipo_roadshow_url,
                    ipoAccessSupportsDsp: r.ipo_access_supports_dsp,
                    isSpac: r.is_spac,
                    isTest: r.is_test,
                    extendedHoursFractionalTradability: r.extended_hours_fractional_tradability,
                    internalHaltReason: r.internal_halt_reason,
                    internalHaltDetails: r.internal_Halt_details,
                    internalHaltSessions: r.internal_halt_sessions,
                    internalHaltStartTime: r.internal_halt_start_time,
                    internalHaltEndTime: r.internal_halt_end_time,
                    internalHaltSource: r.internal_halt_source,
                    allDayTradability: r.all_day_tradability,
                };
                return x;
            });
        });
        this.getRobinhoodInstrumentBySymbol = (symbol) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              external_id,
                              url,
                              symbol,
                              quote_url,
                              fundamentals_url,
                              splits_url,
                              state,
                              market_url,
                              name,
                              tradeable,
                              tradability,
                              bloomberg_unique,
                              margin_initial_ratio,
                              maintenance_ratio,
                              country,
                              day_trade_ratio,
                              list_date,
                              min_tick_size,
                              type,
                              tradeable_chain_id,
                              rhs_tradability,
                              fractional_tradability,
                              default_collar_fraction,
                              ipo_access_status,
                              ipo_access_cob_deadline,
                              ipo_s1_url,
                              ipo_roadshow_url,
                              is_spac,
                              is_test,
                              ipo_access_supports_dsp,
                              extended_hours_fractional_tradability,
                              internal_halt_reason,
                              internal_halt_details,
                              internal_halt_sessions,
                              internal_halt_start_time,
                              internal_halt_end_time,
                              internal_halt_source,
                              all_day_tradability,
                              updated_at,
                              created_at
                       FROM robinhood_instrument
                       where symbol = $1;`;
            const r = yield this.db.oneOrNone(query, [symbol]);
            if (r === null)
                return null;
            return {
                id: r.id,
                externalId: r.external_id,
                name: r.name,
                marketUrl: r.market_url,
                url: r.url,
                type: r.type,
                updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                symbol: r.symbol,
                state: r.state,
                splitsUrl: r.splits_url,
                quoteUrl: r.quote_url,
                country: r.country,
                maintenanceRatio: r.maintenance_ratio,
                marginInitialRatio: r.margin_initial_ratio,
                bloombergUnique: r.bloomberg_unique,
                tradability: r.tradability,
                tradeable: r.tradeable,
                dayTradeRatio: r.day_trade_ratio,
                fundamentalsUrl: r.fundamentals_url,
                listDate: r.list_date,
                minTickSize: r.min_tick_size,
                tradeableChainId: r.tradeable_chain_id,
                rhsTradability: r.rhs_tradability,
                fractionalTradability: r.fractional_tradability,
                defaultCollarFraction: r.default_collar_fraction,
                ipoAccessStatus: r.ipo_access_status,
                ipoAccessCobDeadline: r.ipo_access_cob_deadline,
                ipoS1Url: r.ipo_s1_url,
                ipoRoadshowUrl: r.ipo_roadshow_url,
                ipoAccessSupportsDsp: r.ipo_access_supports_dsp,
                isSpac: r.is_spac,
                isTest: r.is_test,
                extendedHoursFractionalTradability: r.extended_hours_fractional_tradability,
                internalHaltReason: r.internal_halt_reason,
                internalHaltDetails: r.internal_Halt_details,
                internalHaltSessions: r.internal_halt_sessions,
                internalHaltStartTime: r.internal_halt_start_time,
                internalHaltEndTime: r.internal_halt_end_time,
                internalHaltSource: r.internal_halt_source,
                allDayTradability: r.all_day_tradability,
            };
        });
        this.getSecurityWithLatestPricingWithRobinhoodIds = (rhIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `select ri.id     as rh_internal_id,
                              s.id,
                              s.symbol,
                              s.company_name,
                              s.exchange,
                              s.industry,
                              s.website,
                              s.description,
                              s.ceo,
                              s.security_name,
                              s.issue_type,
                              s.sector,
                              s.primary_sic_code,
                              s.employees,
                              s.tags,
                              s.address,
                              s.address2,
                              s.state,
                              s.zip,
                              s.country,
                              s.phone,
                              s.logo_url,
                              (select price
                               from security_price
                               where security_id = s.id
                               order by time desc
                               limit 1) as latest_price
                       from robinhood_instrument ri
                                inner join security s on
                           ri.symbol = s.symbol
                       where ri.id in ($1:list);`;
            const results = yield this.db.query(query, [rhIds]);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    address: r.address,
                    address2: r.address2,
                    state: r.state,
                    zip: r.zip,
                    country: r.country,
                    phone: r.phone,
                    ceo: r.ceo,
                    securityName: r.security_name,
                    issueType: r.issue_type,
                    sector: r.sector,
                    primarySicCode: r.primary_sic_code,
                    employees: r.employees,
                    tags: r.tags,
                    companyName: r.company_name,
                    exchange: r.exchange,
                    industry: r.industry,
                    website: r.website,
                    description: r.description,
                    latestPrice: r.latest_price === undefined || r.latest_price === null ? null : r.latest_price,
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    lastUpdated: luxon_1.DateTime.fromJSDate(r.last_updated),
                    logoUrl: r.logo_url,
                    symbol: r.symbol,
                    rhInternalId: r.rh_internal_id,
                };
                return x;
            });
        });
        this.getTradingPostOptionsWithRobinhoodOptionIds = (rhOptionIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `select ro.id as internal_robinhood_option_id,
                              so.id,
                              so.security_id,
                              so.type,
                              so.strike_price,
                              so.expiration,
                              so.updated_at,
                              so.created_at,
                              so.external_id
                       from robinhood_option ro
                                inner join security_option so
                                           on
                                                       ro.strike_price = so.strike_price
                                                   and ro.type = so.type
                                                   and ro.expiration_date = so.expiration
                       where ro.id in ($1:list);`;
            const results = yield this.db.query(query, [rhOptionIds]);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    type: r.type,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    internalRobinhoodOptionId: r.internal_robinhood_option_id,
                    expiration: luxon_1.DateTime.fromJSDate(r.expiration),
                    externalId: r.external_id,
                    securityId: r.security_id,
                    strikePrice: r.strike_price,
                };
                return x;
            });
        });
        this.getRobinhoodOptionsByExternalIds = (externalIds) => __awaiter(this, void 0, void 0, function* () {
            if (externalIds.length <= 0)
                return [];
            const query = `SELECT id,
                              internal_instrument_id,
                              external_id,
                              strike_price,
                              expiration_date,
                              type,
                              chain_id,
                              chain_symbol,
                              external_created_at,
                              issue_date,
                              min_ticks_above_tick,
                              min_ticks_below_tick,
                              min_ticks_cutoff_price,
                              rhs_tradability,
                              state,
                              tradability,
                              external_updated_at,
                              url,
                              sellout_date_time,
                              long_strategy_code,
                              short_strategy_code,
                              updated_at,
                              created_at
                       FROM robinhood_option
                       WHERE external_id IN ($1:list);`;
            const results = yield this.db.query(query, [externalIds]);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    url: r.url,
                    type: r.type,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    rhsTradability: r.rhs_tradability,
                    longStrategyCode: r.long_strategy_code,
                    selloutDateTime: r.sellout_date_time,
                    externalUpdatedAt: r.external_updated_at,
                    tradability: r.tradability,
                    strikePrice: r.strike_price,
                    minTicksCutoffPrice: r.min_ticks_cutoff_price,
                    minTicksBelowTick: r.min_ticks_below_tick,
                    minTicksAboveTick: r.min_ticks_above_tick,
                    issueDate: r.issue_date,
                    expirationDate: luxon_1.DateTime.fromJSDate(r.expiration_date),
                    chainId: r.chain_id,
                    externalCreatedAt: r.external_created_at,
                    externalId: r.external_id,
                    state: r.state,
                    chainSymbol: r.chain_symbol,
                    internalInstrumentId: r.internal_instrument_id,
                    shortStrategyCode: r.short_strategy_code,
                };
                return x;
            });
        });
        this.getRobinhoodOption = (internalOptionId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              internal_instrument_id,
                              external_id,
                              strike_price,
                              expiration_date,
                              type,
                              chain_id,
                              chain_symbol,
                              external_created_at,
                              issue_date,
                              min_ticks_above_tick,
                              min_ticks_below_tick,
                              min_ticks_cutoff_price,
                              rhs_tradability,
                              state,
                              tradability,
                              external_updated_at,
                              url,
                              sellout_date_time,
                              long_strategy_code,
                              short_strategy_code,
                              updated_at,
                              created_at
                       FROM robinhood_option
                       WHERE id = $1
        `;
            const result = yield this.db.oneOrNone(query, [internalOptionId]);
            if (!result)
                return null;
            return {
                id: result.id,
                url: result.url,
                type: result.type,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                rhsTradability: result.rhs_tradability,
                longStrategyCode: result.long_strategy_code,
                selloutDateTime: result.sellout_date_time,
                externalUpdatedAt: result.external_updated_at,
                tradability: result.tradability,
                strikePrice: result.strike_price,
                minTicksCutoffPrice: result.min_ticks_cutoff_price,
                minTicksBelowTick: result.min_ticks_below_tick,
                minTicksAboveTick: result.min_ticks_above_tick,
                issueDate: result.issue_date,
                expirationDate: luxon_1.DateTime.fromJSDate(result.expiration_date),
                chainId: result.chain_id,
                externalCreatedAt: result.external_created_at,
                externalId: result.external_id,
                state: result.state,
                chainSymbol: result.chain_symbol,
                internalInstrumentId: result.internal_instrument_id,
                shortStrategyCode: result.short_strategy_code,
            };
        });
        this.upsertBrokerageTasks = (tasks) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'user_id', prop: 'userId' },
                { name: 'brokerage', prop: 'brokerage' },
                { name: 'status', prop: 'status' },
                { name: 'type', prop: 'type' },
                { name: 'date', prop: 'date' },
                { name: 'brokerage_user_id', prop: 'brokerageUserId' },
                { name: 'started', prop: 'started' },
                { name: 'finished', prop: 'finished' },
                { name: 'data', prop: 'data' },
                { name: 'error', prop: 'error' }
            ], { table: 'brokerage_task' });
            const query = upsertReplaceQuery(tasks, cs, this.pgp, `brokerage, status, type, date, user_id`);
            yield this.db.none(query);
        });
        this.updateTask = (taskId, params) => __awaiter(this, void 0, void 0, function* () {
            let query = `UPDATE brokerage_task
                     SET `;
            let cnt = 1;
            let paramPass = [];
            Object.keys(params).forEach((key, idx) => {
                // @ts-ignore
                const val = params[key];
                paramPass.push(val);
                query += ` ${camelToSnakeCase(key)}=$${cnt}`;
                cnt++;
                if (idx < Object.keys(params).length - 1)
                    query += ',';
            });
            query += ` WHERE id = $` + (paramPass.length + 1);
            paramPass.push(taskId);
            yield this.db.none(query, paramPass);
        });
        this.getBrokerageTasks = (params) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            user_id,
                            created_at,
                            updated_at,
                            date,
                            started,
                            brokerage,
                            type,
                            brokerage_user_id,
                            status,
                            finished,
                            data
                     FROM brokerage_task `;
            let dbParams = [];
            const keys = Object.keys(params);
            if (keys.length > 0)
                query += ` WHERE `;
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                // @ts-ignore
                const value = params[key];
                query += `${camelToSnakeCase(key)}=$${i + 1}`;
                dbParams.push(value);
                if (keys.length > 1 && i < keys.length - 1)
                    query += ` AND `;
            }
            const results = yield this.db.query(query, dbParams);
            if (results.length <= 0)
                return [];
            return results.map((r) => {
                let x = {
                    id: r.id,
                    error: r.error,
                    brokerage: r.brokerage,
                    userId: r.user_id,
                    status: r.status,
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    date: luxon_1.DateTime.fromJSDate(r.date),
                    type: r.type,
                    data: r.data,
                    brokerageUserId: r.brokerage_user_id,
                    started: r.started ? luxon_1.DateTime.fromJSDate(r.started) : null,
                    finished: r.finished ? luxon_1.DateTime.fromJSDate(r.finished) : null,
                };
                return x;
            });
        });
        this.getPendingBrokerageTask = () => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE brokerage_task
                       SET started = CURRENT_TIMESTAMP,
                           status  = 'RUNNING'
                       WHERE id = (select id
                                   from brokerage_task
                                   WHERE started IS NULL
                                     AND status = 'PENDING'
                                   order by date asc,
                                            case
                                                "type"
                                                when 'NEW_ACCOUNT' then 1
                                                when 'NEW_DATA' then 2
                                                when 'TODO' then 3
                                                end
                                   LIMIT 1 FOR UPDATE SKIP LOCKED)
                       RETURNING id, user_id, brokerage, status, type, date, brokerage_user_id, started, finished, data, error, updated_at, created_at;`;
            const result = yield this.db.oneOrNone(query);
            if (!result)
                return null;
            return {
                id: result.id,
                userId: result.user_id,
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                date: luxon_1.DateTime.fromJSDate(result.date),
                started: result.started ? luxon_1.DateTime.fromJSDate(result.started) : null,
                brokerage: result.brokerage,
                type: result.type,
                brokerageUserId: result.brokerage_user_id,
                status: result.status,
                finished: result.finished ? luxon_1.DateTime.fromJSDate(result.finished) : null,
                data: result.data,
                error: result.error
            };
        });
        this.getExistingTaskByDate = (brokerage, type, date, userId, brokerageUserId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            select id,
                   user_id,
                   brokerage,
                   status,
                   type,
                   date, -- Used for when to process in ASCENDING order
                   brokerage_user_id,
                   started,
                   finished,
                   data,
                   error,
                   updated_at,
                   created_at
            from brokerage_task
            WHERE brokerage = $1
              AND type = $2
              AND date = $3
              AND user_id = $4
              AND brokerage_user_id = $5`;
            const result = yield this.db.oneOrNone(query, [brokerage, type, date, userId, brokerageUserId]);
            if (!result)
                return null;
            return {
                id: result.id,
                userId: result.user_id,
                data: result.data,
                type: result.type,
                status: result.status,
                brokerageUserId: result.brokerage_user_id,
                brokerage: result.brokerage,
                date: luxon_1.DateTime.fromJSDate(result.date),
                started: result.started ? luxon_1.DateTime.fromJSDate(result.started) : null,
                finished: result.finished ? luxon_1.DateTime.fromJSDate(result.finished) : null,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                error: result.error
            };
        });
        this.getExistingTask = (brokerage, status, type, date, userId, brokerageUserId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            select id,
                   user_id,
                   brokerage,
                   status,
                   type,
                   date, -- Used for when to process in ASCENDING order
                   brokerage_user_id,
                   started,
                   finished,
                   data,
                   error,
                   updated_at,
                   created_at
            from brokerage_task
            WHERE brokerage = $1
              AND status = $2
              AND type = $3
              AND date = $4
              AND user_id = $5
              AND brokerage_user_id = $6`;
            const result = yield this.db.oneOrNone(query, [brokerage, status, type, date, userId, brokerageUserId]);
            if (!result)
                return null;
            return {
                id: result.id,
                userId: result.user_id,
                data: result.data,
                type: result.type,
                status: result.status,
                brokerageUserId: result.brokerage_user_id,
                brokerage: result.brokerage,
                date: luxon_1.DateTime.fromJSDate(result.date),
                started: result.started ? luxon_1.DateTime.fromJSDate(result.started) : null,
                finished: result.finished ? luxon_1.DateTime.fromJSDate(result.finished) : null,
                updatedAt: luxon_1.DateTime.fromJSDate(result.updated_at),
                createdAt: luxon_1.DateTime.fromJSDate(result.created_at),
                error: result.error
            };
        });
        this.scheduleTradingPostAccountForDeletion = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE tradingpost_brokerage_account
                       SET hidden_for_deletion = TRUE
                       WHERE id IN ($1);`;
            yield this.db.none(query, [accountId]);
        });
        this.db = db;
        this.pgp = pgp;
    }
}
exports.default = Repository;
function upsertReplaceQuery(data, cs, pgp, conflict = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`;
        }).join();
}
function upsertReplaceQueryWithColumns(data, cs, pgp, columns, conflict = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        columns.map(col => {
            return `${col}=EXCLUDED.${col}`;
        }).join();
}
const camelToSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFzREEsaUNBQStCO0FBYS9CLE1BQXFCLFVBQVU7SUFJM0IsWUFBWSxFQUFrQixFQUFFLEdBQVU7UUFLMUMsK0JBQTBCLEdBQUcsQ0FBTyxTQUFpQixFQUFFLEtBQWMsRUFBRSxTQUFpQixFQUFpQixFQUFFO1lBQ3ZHLE1BQU0sS0FBSyxHQUFHOzs7cUNBR2UsQ0FBQztZQUM5QixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUM1RCxDQUFDLENBQUEsQ0FBQTtRQUVELHNCQUFpQixHQUFHLEdBQXVDLEVBQUU7WUFDekQsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnREF3QjBCLENBQUE7WUFDeEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsQ0FBQztnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDeEQsT0FBTztnQkFDSCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO2dCQUNoQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFlBQVk7Z0JBQzNCLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUTtnQkFDcEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Z0JBQ2xCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztnQkFDMUIsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHO2dCQUNWLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtn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