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
        this.execTx = (fn) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.tx((t) => __awaiter(this, void 0, void 0, function* () {
                const repo = new Repository(t, this.pgp);
                yield fn(repo);
            }));
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
        this.updateErrorStatusOfAccount = (accountId, error, errorCode) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE tradingpost_brokerage_account
                       SET error      = $1,
                           error_code = $2
                       WHERE id = $3`;
            yield this.db.none(query, [error, errorCode, accountId]);
        });
        this.updateTradingPostBrokerageAccountLastUpdated = (userId, brokerageUserId, brokerageName) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE tradingpost_brokerage_account
                       SET updated_at = NOW()
                       WHERE user_id = $1
                         AND account_number = $2
                         AND broker_name = $3 RETURNING updated_at;`;
            const res = yield this.db.oneOrNone(query, [userId, brokerageUserId, brokerageName]);
            if (!res)
                throw new Error("could not update brokerage account last_updated");
            return luxon_1.DateTime.fromJSDate(res.updated_at);
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
        this.getSecurityPricesWithEndDateBySecurityIds = (startDate, endDate, securityIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              security_id,
                              price, time, high, low, open, created_at
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
        this.getTradingPostBrokerageAccountByUser = (tpUserId, authenticationService, accountNumber) => __awaiter(this, void 0, void 0, function* () {
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
                              account_status,
                              authentication_service
                       FROM tradingpost_brokerage_account
                       WHERE user_id = $1
                         AND authentication_service = $2
                         AND account_number = $3;`;
            const result = yield this.db.oneOrNone(query, [tpUserId, authenticationService, accountNumber]);
            if (!result)
                return null;
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
                accountStatus: result.account_status,
                authenticationService: result.authentication_service
            };
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
                              account_status,
                              authentication_service
                       FROM tradingpost_brokerage_account
                       WHERE id = $1;`;
            const result = yield this.db.oneOrNone(query, [accountId]);
            if (!result)
                return null;
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
                accountStatus: result.account_status,
                authenticationService: result.authentication_service
            };
        });
        this.getTradingPostBrokerageAccountsByBrokerageNumbersAndAuthService = (tpUserId, brokerageNumbers, authenticationService) => __awaiter(this, void 0, void 0, function* () {
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
                              account_status,
                              authentication_service
                       FROM tradingpost_brokerage_account
                       WHERE user_id = $1
                         AND account_number IN ($2:list)
                         AND authentication_service = $3;`;
            const result = yield this.db.query(query, [tpUserId, brokerageNumbers, authenticationService]);
            return result.map((r) => {
                return {
                    name: r.name,
                    status: r.status,
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at),
                    updatedAt: luxon_1.DateTime.fromJSDate(r.updated_at),
                    userId: r.user_id,
                    mask: r.mask,
                    id: r.id,
                    brokerName: r.broker_name,
                    type: r.type,
                    subtype: r.subtype,
                    accountNumber: r.account_number,
                    officialName: r.official_name,
                    institutionId: r.institution_id,
                    error: r.error,
                    errorCode: r.error_code,
                    hiddenForDeletion: r.hidden_for_deletion,
                    accountStatus: r.account_status,
                    authenticationService: r.authentication_service
                };
            });
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
        this.getTradingPostBrokerageAccountTransactions = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
                   account_id,
                   security_id,
                   security_type, date, quantity, price, amount, fees, type, currency, updated_at, created_at, option_id
            FROM tradingpost_transaction
            WHERE account_id = $1
            ORDER BY date DESC;`;
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
                   tba.account_status,
                   tba.authentication_service
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
                    accountStatus: r.account_status,
                    authenticationService: r.authentication_service
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
                               $20) RETURNING id;`;
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
        this.addFinicityUser = (userId, customerId, type) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO finicity_user(tp_user_id, customer_id, type)
                       VALUES ($1, $2, $3) ON CONFLICT(customer_id) DO
        UPDATE SET tp_user_id=EXCLUDED.tp_user_id,
            type =EXCLUDED.type
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
                              account_status,
                              authentication_service
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
                    accountStatus: r.account_status,
                    authenticationService: r.authentication_service
                };
                return x;
            });
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
                { name: 'account_status', prop: 'accountStatus' },
                { name: 'authentication_service', prop: 'authenticationService' }
            ], { table: 'tradingpost_brokerage_account' });
            const newAccounts = accounts.map(acc => (Object.assign(Object.assign({}, acc), { updatedAt: luxon_1.DateTime.now() })));
            const query = upsertReplaceQuery(newAccounts, cs, this.pgp, "user_id,institution_id,account_number") + ` RETURNING id`;
            const response = yield this.db.query(query);
            if (!response || response.length <= 0)
                return [];
            return response.map((r) => r.id);
        });
        this.deleteTradingPostAccountCurrentHoldings = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            if (accountIds.length <= 0)
                return;
            const query = `DELETE
                       FROM tradingpost_current_holding
                       WHERE account_id IN ($1:list);`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteTradingPostBrokerageData = (accountId) => __awaiter(this, void 0, void 0, function* () {
            yield this.db.none(`DELETE
                            FROM tradingpost_current_holding
                            where account_id = $1;`, [accountId]);
            yield this.db.none(`DELETE
                            FROM tradingpost_historical_holding
                            where account_id = $1;`, [accountId]);
            yield this.db.none(`DELETE
                            FROM tradingpost_transaction
                            where account_id = $1;`, [accountId]);
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
                     VALUES ($1, $2, $3) ON CONFLICT
                     ON CONSTRAINT name_userid_unique DO
        UPDATE SET name = EXCLUDED.name
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
        this.getOldestTransaction = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const r = yield this.db.oneOrNone(`SELECT id,
                                                  account_id,
                                                  security_id,
                                                  security_type, date, quantity, price, amount, fees, type, currency, updated_at, created_at, option_id
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
        this.getTradingPostHoldingsByAccountGroup = (userId, accountGroupId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id        AS account_group_id,
                            ht.security_id              AS security_id,
                            ht.security_type            AS security_type,
                            ht.option_id                AS option_id,
                            (SELECT json_agg(t)
                             FROM public.security_option as t
                             WHERE t.id = ht.option_id) AS option_info,
                            AVG(ht.price)               AS price,
                            SUM(ht.value) AS value,
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
        AND
        ht
        .
        date
        BETWEEN
        $2
        AND
        $3
        GROUP
        BY
        atg
        .
        account_group_id,
        ht
        .
        security_id,
        ht
        .
        date,
        ht
        .
        security_type,
        ht
        .
        option_id
        ORDER
        BY
        value
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
                            SUM(ch.value) AS value,
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
        GROUP
        BY
        atg
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
        ch
        .
        security_type
        ORDER
        BY
        value
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
            let query = `SELECT atg.account_group_id AS account_group_id,
                            security_id,
                            security_type, date, SUM (quantity) AS quantity, AVG (price) AS price, SUM (amount) AS amount, SUM (fees) AS fees, type, currency, option_id, (SELECT json_agg(t)
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
                            account_group_id, date, return, created_at, updated_at
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
                            price, time, created_at
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
        this.addAccountGroupReturns = (accountGroupReturns) => __awaiter(this, void 0, void 0, function* () {
            if (accountGroupReturns.length <= 0)
                return 0;
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
                            exposure, date, benchmark_id, updated_at, created_at
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
            const accountGroupRes = yield this.db.query(`SELECT distinct account_group_id
                                                     FROM _TRADINGPOST_ACCOUNT_TO_GROUP
                                                     WHERE account_id IN ($1:list)`, [accountIds]);
            const accountGroupIds = accountGroupRes.map((r) => r.account_group_id);
            if (accountGroupIds.length <= 0)
                accountGroupRes.push(0);
            yield this.db.none(`
                BEGIN;
                    DELETE FROM TRADINGPOST_ACCOUNT_GROUP_STAT WHERE account_group_id IN ($1:list);
                    DELETE FROM ACCOUNT_GROUP_HPR WHERE account_group_id IN ($1:list);
                    DELETE FROM _TRADINGPOST_ACCOUNT_TO_GROUP WHERE account_id IN ($2:list);
                    
                    DELETE FROM TRADINGPOST_HISTORICAL_HOLDING WHERE account_id IN ($2:list);
                    DELETE FROM TRADINGPOST_CURRENT_HOLDING WHERE account_id IN ($2:list);
                    DELETE FROM TRADINGPOST_TRANSACTION WHERE account_id IN ($2:list);
                    DELETE FROM TRADINGPOST_BROKERAGE_ACCOUNT WHERE id IN ($2:list);
                COMMIT;
                `, [accountGroupIds, accountIds]);
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
                       VALUES ($1, $2, $3, $4, $5) ON CONFLICT(security_id, type, strike_price, expiration)
                           DO
        UPDATE SET security_id=EXCLUDED.security_id,
            type =EXCLUDED.type,
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
                              account_status,
                              authentication_service
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
                    accountStatus: r.account_status,
                    authenticationService: r.authentication_service
                };
                return x;
            });
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
                       WHERE username = $7
                         AND user_id = $1;`;
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
                               $37, $38) ON CONFLICT (symbol) DO
        UPDATE SET symbol=EXCLUDED.symbol
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
        this.upsertRobinhoodOption = (option) => __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO robinhood_option(internal_instrument_id, external_id, chain_id, chain_symbol,
                                                    external_created_at, expiration_date,
                                                    issue_date, min_ticks_above_tick, min_ticks_below_tick,
                                                    min_ticks_cutoff_price, rhs_tradability,
                                                    state, strike_price, tradability, type, external_updated_at, url,
                                                    sellout_date_time, long_strategy_code,
                                                    short_strategy_code)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
                               $20) ON CONFLICT(external_id) DO
        UPDATE SET internal_instrument_id=EXCLUDED.internal_instrument_id,
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
            state =EXCLUDED.state,
            strike_price=EXCLUDED.strike_price,
            tradability=EXCLUDED.tradability,
            type =EXCLUDED.type,
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
            const query = `select ri.id as rh_internal_id,
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
                               order by time desc limit 1) as latest_price
                       from robinhood_instrument ri
                           inner join security s
                       on
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
            if (rhOptionIds.length <= 0)
                return [];
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
        this.getOrInsertBrokerageTaskByMessageId = (messageId, brokerageTask) => __awaiter(this, void 0, void 0, function* () {
            // TODO: Refactor to be concurrency safe
            // TODO: Think of a better response type... maybe a object with exists, or an error?
            const query = `SELECT id
                       from brokerage_task
                       WHERE message_id = $1`;
            const result = yield this.db.oneOrNone(query, [messageId]);
            if (result)
                return null;
            const brokerageTaskQuery = `
            INSERT INTO brokerage_task(user_id, brokerage, status, type, date, brokerage_user_id, started, finished,
                                       data, error, message_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;`;
            const insertResult = yield this.db.oneOrNone(brokerageTaskQuery, [brokerageTask.userId,
                brokerageTask.brokerage, brokerageTask.status, brokerageTask.type, brokerageTask.date, brokerageTask.brokerageUserId,
                brokerageTask.started, brokerageTask.finished, brokerageTask.data, brokerageTask.error, messageId
            ]);
            return insertResult.id;
        });
        this.scheduleTradingPostAccountForDeletion = (accountId) => __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE tradingpost_brokerage_account
                       SET hidden_for_deletion = TRUE
                       WHERE id = $1;`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnREEsaUNBQStCO0FBWS9CLE1BQXFCLFVBQVU7SUFJM0IsWUFBWSxFQUFrQixFQUFFLEdBQVU7UUFLMUMsV0FBTSxHQUFHLENBQU8sRUFBb0MsRUFBaUIsRUFBRTtZQUNuRSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQU0sQ0FBQyxFQUFDLEVBQUU7Z0JBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUEsQ0FBQTtRQUVELGVBQVUsR0FBRyxDQUFPLE1BQWMsRUFBRSxNQUE0TyxFQUFpQixFQUFFO1lBQy9SLElBQUksS0FBSyxHQUFHOzBCQUNNLENBQUE7WUFDbEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ1osSUFBSSxTQUFTLEdBQVEsRUFBRSxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxFQUFFO2dCQUNyRCxhQUFhO2dCQUNiLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEIsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEIsS0FBSyxJQUFJLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7Z0JBQzVDLEdBQUcsRUFBRSxDQUFBO2dCQUNMLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLENB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