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
        this.getSecurityPricesWithEndDateBySecurityIds = (endDate, securityIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT id,
                              security_id,
                              price,
                              time,
                              high,
                              low,
                              open,
                              updated_at,
                              created_at
                       FROM security_price
                       WHERE time <= $1
                         AND security_ids IN ($2:list)
                       ORDER BY time DESC`;
            const response = yield this.db.query(query, [endDate, securityIds]);
            return response.map((row) => {
                let o = {
                    id: row.id,
                    securityId: row.security_id,
                    price: row.price,
                    time: luxon_1.DateTime.fromJSDate(row.time),
                    high: row.high,
                    open: row.open,
                    low: row.low,
                    updatedAt: luxon_1.DateTime.fromJSDate(row.updated_at),
                    createdAt: luxon_1.DateTime.fromJSDate(row.created_at)
                };
                return o;
            });
        });
        this.getMarketHolidays = (endDate) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.db.query(`SELECT id,
                                                     date,
                                                     settlement_date,
                                                     created_at
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
                              created_at
                       FROM tradingpost_brokerage_account
                       WHERE id = $1;`;
            const result = yield this.db.oneOrNone(query, [accountId]);
            return {
                name: result.name,
                status: result.status,
                created_at: luxon_1.DateTime.fromJSDate(result.created_at),
                updated_at: luxon_1.DateTime.fromJSDate(result.updated_at),
                userId: result.user_id,
                mask: result.mask,
                id: result.id,
                brokerName: result.broker_name,
                type: result.type,
                subtype: result.subtype,
                accountNumber: result.account_number,
                officialName: result.official_name,
                institutionId: result.institution_id
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
                   s.symbol
            FROM tradingpost_current_holding tch
                     LEFT JOIN security s ON s.id = tch.security_id
            WHERE tch.account_id = $1`;
            const result = yield this.db.query(query, [accountId]);
            return result.map((row) => {
                let o = {
                    symbol: row.symbol,
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
                   created_at
            FROM tradingpost_current_holding
            WHERE account_id = $1`;
            const result = yield this.db.query(query, [accountId]);
            return result.map((row) => {
                let o = {
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
                   created_at
            FROM tradingpost_transaction
            WHERE account_id = $1;`;
            const response = yield this.db.query(query, [accountId]);
            return response.map((row) => {
                let o = {
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
                   fa.finicity_user_id        internal_finicity_user_id,
                   fa.id                      internal_finicity_account_id,
                   fa.finicity_institution_id internal_finicity_institution_id,
                   fa.account_id              external_finicity_account_id,
                   fa.number                  external_finicity_account_number
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
                    updated_at: luxon_1.DateTime.fromJSDate(r.updated_at),
                    created_at: luxon_1.DateTime.fromJSDate(r.created_at)
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
        this.getTradingPostInstitutionsWithFinicityId = () => __awaiter(this, void 0, void 0, function* () {
            return [];
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
            const response = yield this.db.oneOrNone("SELECT id, tp_user_id, customer_id, type, updated_at, created_at FROM finicity_user WHERE tp_user_id = $1", [userId]);
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
                   created_at
            FROM finicity_account
            WHERE finicity_user_id = $1;`;
            const response = yield this.db.query(query, [finicityUserId]);
            return response.map((a) => {
                return {
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
                    createdAt: luxon_1.DateTime.fromJSDate(a.created_at)
                };
            });
        });
        this.upsertFinicityHoldings = (holdings) => __awaiter(this, void 0, void 0, function* () {
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
                { name: 'options_expire_date', prop: 'optionsExpireDate' },
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
            let query = `    SELECT id,
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
                                status,
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
                                updated_at,
                                created_at
                         FROM finicity_holdings fh
                                  INNER JOIN finicity_account fa ON fa.id = fh.finicity_account_id
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
            SELECT id,
                   finicity_account_id,
                   transaction_id,
                   amount,
                   account_id,
                   customer_id,
                   status,
                   description,
                   memo,
                   type,
                   interest_amount,
                   principal_amount,
                   fee_amount,
                   escrow_amount,
                   unit_quantity,
                   posted_date,
                   transaction_date,
                   created_date,
                   categorization_normalized_payee_name,
                   categorization_category,
                   categorization_city,
                   categorization_state,
                   categorization_postal_code,
                   categorization_country,
                   categorization_best_representation,
                   running_balance_amount,
                   check_num,
                   income_type,
                   subaccount_security_type,
                   commission_amount,
                   split_denominator,
                   split_numerator,
                   shares_per_contract,
                   taxes_amount,
                   unit_price,
                   currency_symbol,
                   sub_account_fund,
                   ticker,
                   security_id,
                   security_id_type,
                   investment_transaction_type,
                   effective_date,
                   first_effective_date,
                   updated_at,
                   created_at
            FROM finicity_transactions ft
                     INNER JOIN finicity_account fa ON fa.id = ft.finicity_account_id
            WHERE fa.finicity_user_id = $1
        `;
            const response = yield this.db.query(query, [finicityUserId]);
            return response.map((t) => {
                return {
                    id: t.id,
                    finicityAccountId: t.finicity_account_id,
                    transactionId: t.transaction_id,
                    amount: t.amount,
                    accountId: t.account_id,
                    customerId: t.customer_id,
                    status: t.status,
                    description: t.description,
                    memo: t.memo,
                    type: t.type,
                    interestAmount: t.interest_amount,
                    principalAmount: t.principal_amount,
                    feeAmount: t.fee_amount,
                    escrowAmount: t.escrow_amount,
                    unitQuantity: t.unit_quantity,
                    postedDate: t.posted_date,
                    transactionDate: t.transaction_date,
                    createdDate: t.created_date,
                    categorizationNormalizedPayeeName: t.categorization_normalized_payee_name,
                    categorizationCategory: t.categorization_category,
                    categorizationCity: t.categorization_city,
                    categorizationState: t.categorization_state,
                    categorizationPostalCode: t.categorization_postal_code,
                    categorizationCountry: t.categorization_country,
                    categorizationBestRepresentation: t.categorization_best_representation,
                    runningBalanceAmount: t.running_balance_amount,
                    checkNum: t.check_num,
                    incomeType: t.income_type,
                    subaccountSecurityType: t.subaccount_security_type,
                    commissionAmount: t.commission_amount,
                    splitDenominator: t.split_denominator,
                    splitNumerator: t.split_numerator,
                    sharesPerContract: t.shares_per_contract,
                    taxesAmount: t.taxes_amount,
                    unitPrice: t.unit_price,
                    currencySymbol: t.currency_symbol,
                    subAccountFund: t.sub_account_fund,
                    ticker: t.ticker,
                    securityId: t.security_id,
                    securityIdType: t.security_id_type,
                    investmentTransactionType: t.investment_transaction_type,
                    effectiveDate: t.effective_date,
                    firstEffectiveDate: t.first_effective_date,
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
                              created_at
                       FROM tradingpost_accounts
                       WHERE user_id = $1`;
            const response = yield this.db.query(query, [userId]);
            return response.map((r) => {
                return {
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
                    createdAt: luxon_1.DateTime.fromJSDate(r.created_at)
                };
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
            ], { table: 'tradingpost_brokerage_account' });
            const query = this.pgp.helpers.insert(accounts, cs);
            yield this.db.none(query);
        });
        this.upsertTradingPostBrokerageAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
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
            ], { table: 'tradingpost_brokerage_accounts' });
            const query = upsertReplaceQuery(accounts, cs, this.pgp, "user_id,institution_id,account_number");
            yield this.db.none(query);
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
        this.getTradingPostAccountGroups = (userId) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT atg.id,
                              atg.account_group_id,
                              ag.user_id,
                              ag.name,
                              atg.account_id,
                              ag.default_benchmark_id,
                              ag.created_at,
                              ag.updated_at
                       FROM tradingpost_account_groups ag
                                RIGHT JOIN _tradingpost_account_to_group atg
                                           ON atg.account_group_id = ag.id
                       WHERE user_id = $1
        `;
            const response = yield this.db.any(query, [userId]);
            if (!response || response.length <= 0)
                return [];
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
            let query = `INSERT INTO tradingpost_account_groups(user_id, name, default_benchmark_id)
                     VALUES ($1, $2, $3)
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
            const accountGroupsQuery = this.pgp.helpers.insert(values, cs);
            const result = yield this.db.result(accountGroupsQuery);
            return result.rowCount > 0 ? 1 : 0;
        });
        this.addTradingPostCurrentHoldings = (currentHoldings) => __awaiter(this, void 0, void 0, function* () {
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
            ], { table: 'tradingpost_current_holding' });
            const query = upsertReplaceQuery(currentHoldings, cs, this.pgp, "account_id,security_id");
            yield this.db.none(query);
        });
        this.upsertTradingPostCurrentHoldings = (currentHoldings) => __awaiter(this, void 0, void 0, function* () {
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
            ], { table: 'tradingpost_current_holding' });
            const query = upsertReplaceQuery(currentHoldings, cs, this.pgp, "account_id,security_id");
            yield this.db.none(query);
        });
        this.addTradingPostHistoricalHoldings = (historicalHoldings) => __awaiter(this, void 0, void 0, function* () {
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
                { name: 'date', prop: 'date' },
            ], { table: 'tradingpost_historical_holding' });
            const query = this.pgp.helpers.insert(historicalHoldings, cs);
            yield this.db.none(query);
        });
        this.upsertTradingPostHistoricalHoldings = (historicalHoldings) => __awaiter(this, void 0, void 0, function* () {
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
                { name: 'date', prop: 'date' },
            ], { table: 'tradingpost_historical_holding' });
            const query = upsertReplaceQuery(historicalHoldings, cs, this.pgp);
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
                { name: 'currency', prop: 'currency' }
            ], { table: 'tradingpost_transaction' });
            const query = this.pgp.helpers.insert(transactions, cs);
            yield this.db.none(query);
        });
        this.upsertTradingPostTransactions = (transactions) => __awaiter(this, void 0, void 0, function* () {
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
                { name: 'currency', prop: 'currency' }
            ], { table: 'tradingpost_transaction' });
            const query = upsertReplaceQuery(transactions, cs, this.pgp);
            yield this.db.none(query);
        });
        this.addTradingPostAccountGroupStats = (groupStats) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_group_id', prop: 'accountGroupId' },
                { name: 'beta', prop: 'beta' },
                { name: 'sharpe', prop: 'sharpe' },
                { name: 'industry_allocations', prop: 'industryAllocations' },
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
                            price,
                            value,
                            cost_basis,
                            quantity,
                            date
                     FROM tradingpost_historical_holdings
                     WHERE account_id = $1
                       AND date BETWEEN $2 AND $3
        `;
            const response = yield this.db.any(query, [accountId, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    accountId: d.account_id,
                    securityId: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    quantity: parseFloat(d.quantity),
                    date: d.date
                });
            }
            return holdings;
        });
        this.getTradingPostHoldingsByAccountGroup = (userId, accountGroupId, startDate, endDate = luxon_1.DateTime.now()) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id                                AS account_group_id,
                            ht.security_id                                      AS security_id,
                            AVG(ht.price)                                       AS price,
                            SUM(ht.value)                                       AS value,
                            SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity) AS cost_basis,
                            SUM(ht.quantity)                                    AS quantity,
                            ht.date                                             AS date
                     FROM tradingpost_historical_holdings ht
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON ht.account_id = atg.account_id
                     WHERE atg.account_group_id = $1
                       AND ht.date BETWEEN $2 AND $3
                     GROUP BY atg.account_group_id, ht.security_id, ht.date
        `;
            const response = yield this.db.any(query, [accountGroupId, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    accountGroupId: parseInt(d.account_group_id),
                    securityId: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    quantity: parseFloat(d.quantity),
                    date: d.date
                });
            }
            return holdings;
        });
        this.getTradingPostCurrentHoldingsByAccountGroup = (accountGroupId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT atg.account_group_id                                AS account_group_id,
                            ch.security_id                                      AS security_id,
                            AVG(ch.price)                                       AS price,
                            SUM(ch.value)                                       AS value,
                            SUM(ch.cost_basis * ch.quantity) / SUM(ch.quantity) AS cost_basis,
                            SUM(ch.quantity)                                    AS quantity,
                            ch.updated_at                                       AS updated_at
                     FROM tradingpost_current_holdings ch
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON ch.account_id = atg.account_id
                     WHERE atg.account_group_id = $1
                     GROUP BY atg.account_group_id, ch.security_id, ch.updated_at
        `;
            const response = yield this.db.any(query, [accountGroupId]);
            if (!response || response.length <= 0)
                return [];
            let holdings = [];
            for (let d of response) {
                holdings.push({
                    accountGroupId: parseInt(d.account_group_id),
                    securityId: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    value: parseFloat(d.value),
                    costBasis: parseFloat(d.cost_basis),
                    quantity: parseFloat(d.quantity),
                    date: d.updated_at
                });
            }
            return holdings;
        });
        this.getTradingPostAccountGroupReturns = (accountGroupId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT id,
                            account_group_id,
                            date,
                            return,
                            created_at,
                            updated_at
                     FROM account_group_hprs
                     WHERE account_group_id = $1
                       AND date BETWEEN $2 AND $3
                     ORDER BY date ASC
        `;
            const response = yield this.db.any(query, [accountGroupId, startDate, endDate]);
            if (!response || response.length <= 0)
                return [];
            let holdingPeriodReturns = [];
            for (let d of response) {
                holdingPeriodReturns.push({
                    id: parseInt(d.id),
                    accountGroupId: parseInt(d.account_group_id),
                    date: d.date,
                    return: parseFloat(d.return),
                    created_at: d.created_at,
                    updated_at: d.updated_at
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
                     FROM security_prices
                     WHERE security_id = $1
                       AND time BETWEEN $2 AND $3
                       AND (time at time zone 'America/New_York')::time = '16:00:00'
        `;
            const response = yield this.db.any(query, [securityId, startDate, endDate]);
            if (!response || response.length <= 0) {
                return [];
            }
            let prices = [];
            for (let d of response) {
                prices.push({
                    securityId: parseInt(d.security_id),
                    price: parseFloat(d.price),
                    date: d.time
                });
            }
            return prices;
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
                            created_at,
                            validated
                     FROM securities
                     WHERE id IN ($1:list)`;
            const response = yield this.db.query(query, [securityIds]);
            if (response.length <= 0)
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
        this.getAccountGroupHPRsLatestDate = (accountGroupId) => __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT max(date)
                     FROM account_group_hprs
                     WHERE account_group_id = $1`;
            const latestDate = yield this.db.one(query, [accountGroupId]);
            return latestDate.max;
        });
        this.addAccountGroupReturns = (accountGroupReturns) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'account_group_id', prop: 'accountGroupId' },
                { name: 'date', prop: 'date' },
                { name: 'return', prop: 'return' },
            ], { table: 'account_group_hprs' });
            const query = upsertReplaceQueryWithColumns(accountGroupReturns, cs, this.pgp, ["return"], "account_group_hprs_account_group_id_date_key");
            const result = yield this.db.result(query);
            return result.rowCount > 0 ? 1 : 0;
        });
        this.addBenchmarkReturns = (benchmarkReturns) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'security_id', prop: 'securityId' },
                { name: 'date', prop: 'date' },
                { name: 'return', prop: 'return' }
            ], { table: 'benchmark_hprs' });
            const query = upsertReplaceQueryWithColumns(benchmarkReturns, cs, this.pgp, ["return"], "benchmark_hprs_security_id_date_key");
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
            ], { table: 'tradingpost_account_group_stats' });
            const query = upsertReplaceQueryWithColumns(accountGroupSummary, cs, this.pgp, ["beta", "sharpe", "industry_allocations", "exposure", "date", "benchmark_id"], "tradingpost_account_group_stats_account_group_id_date_key");
            const result = yield this.db.result(query);
            return result.rowCount > 0 ? 1 : 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQ0EsaUNBQStCO0FBSS9CLE1BQXFCLFVBQVU7SUFJM0IsWUFBWSxFQUFrQixFQUFFLEdBQVU7UUFLMUMsOENBQXlDLEdBQUcsQ0FBTyxPQUFpQixFQUFFLFdBQXFCLEVBQStCLEVBQUU7WUFDeEgsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7OzswQ0FZb0IsQ0FBQTtZQUNsQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMsR0FBcUI7b0JBQ3RCLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixVQUFVLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzNCLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztvQkFDaEIsSUFBSSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ25DLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtvQkFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7b0JBQ2QsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO29CQUNaLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO29CQUM5QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztpQkFDakQsQ0FBQTtnQkFDRCxPQUFPLENBQUMsQ0FBQTtZQUNaLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCxzQkFBaUIsR0FBRyxDQUFPLE9BQWlCLEVBQW1DLEVBQUU7WUFDN0UsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQzs7Ozs7O2lFQU1vQixFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUNoRixPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLEdBQXlCO29CQUMxQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7b0JBQzlDLElBQUksRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNuQyxjQUFjLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztpQkFDM0QsQ0FBQTtnQkFDRCxPQUFPLENBQUMsQ0FBQTtZQUNaLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCxtQ0FBOEIsR0FBRyxDQUFPLFNBQWlCLEVBQThDLEVBQUU7WUFDckcsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7O3NDQWNnQixDQUFBO1lBQzlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtZQUMxRCxPQUFPO2dCQUNILElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtnQkFDakIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNO2dCQUNyQixVQUFVLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztnQkFDbEQsVUFBVSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQ2xELE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDdEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUNqQixFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ2IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXO2dCQUM5QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ2pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztnQkFDdkIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxjQUFjO2dCQUNwQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGFBQWE7Z0JBQ2xDLGFBQWEsRUFBRSxNQUFNLENBQUMsY0FBYzthQUN2QyxDQUFBO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUFFRCw4REFBeUQsR0FBRyxDQUFPLFNBQWlCLEVBQTBELEVBQUU7WUFDNUksTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7O3NDQWlCZ0IsQ0FBQTtZQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxHQUFnRDtvQkFDakQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQ3pCLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRTtvQkFDVixVQUFVLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztvQkFDL0MsVUFBVSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7b0JBQzlDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVTtvQkFDekIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO29CQUN0QixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLFNBQVMsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDMUIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFXO29CQUMzQixXQUFXLEVBQUUsR0FBRyxDQUFDLFlBQVk7b0JBQzdCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsWUFBWSxFQUFFLEdBQUcsQ0FBQyxhQUFhO29CQUMvQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7aUJBQ25CLENBQUE7Z0JBQ0QsT0FBTyxDQUFDLENBQUE7WUFDWixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0RBQTZDLEdBQUcsQ0FBTyxTQUFpQixFQUE4QyxFQUFFO1lBQ3BILE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7a0NBZVksQ0FBQztZQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxHQUFvQztvQkFDckMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxVQUFVO29CQUN6QixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsVUFBVSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7b0JBQy9DLFVBQVUsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO29CQUM5QyxTQUFTLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQ3pCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUNoQixTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzFCLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBVztvQkFDM0IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZO29CQUM3QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7b0JBQ3RCLFlBQVksRUFBRSxHQUFHLENBQUMsYUFBYTtvQkFDL0IsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO2lCQUNuQixDQUFBO2dCQUNELE9BQU8sQ0FBQyxDQUFBO1lBQ1osQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUEsQ0FBQTtRQUVELCtDQUEwQyxHQUFHLENBQU8sU0FBaUIsRUFBMkMsRUFBRTtZQUM5RyxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7O21DQWVhLENBQUE7WUFDM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMsR0FBaUM7b0JBQ2xDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVTtvQkFDekIsVUFBVSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7b0JBQy9DLFVBQVUsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO29CQUMvQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO29CQUNsQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7b0JBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO29CQUNkLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsSUFBSSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ25DLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLO29CQUNoQixVQUFVLEVBQUUsR0FBRyxDQUFDLFdBQVc7b0JBQzNCLFlBQVksRUFBRSxHQUFHLENBQUMsYUFBYTtpQkFDbEMsQ0FBQTtnQkFDRCxPQUFPLENBQUMsQ0FBQTtZQUNaLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCw2Q0FBd0MsR0FBRyxDQUFPLE1BQWMsRUFBc0QsRUFBRTtZQUNwSCxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dDQXdCVSxDQUFDO1lBQ3pCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLEdBQTRDO29CQUM3QyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1IsYUFBYSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUMvQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNsQixVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVc7b0JBQ3pCLHlCQUF5QixFQUFFLENBQUMsQ0FBQyw0QkFBNEI7b0JBQ3pELDZCQUE2QixFQUFFLENBQUMsQ0FBQyw0QkFBNEI7b0JBQzdELHlCQUF5QixFQUFFLENBQUMsQ0FBQyw0QkFBNEI7b0JBQ3pELE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLGFBQWEsRUFBRSxDQUFDLENBQUMsY0FBYztvQkFDL0IsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNqQiw2QkFBNkIsRUFBRSxDQUFDLENBQUMsZ0NBQWdDO29CQUNqRSxzQkFBc0IsRUFBRSxDQUFDLENBQUMseUJBQXlCO29CQUNuRCxZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQkFDWixVQUFVLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDN0MsVUFBVSxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7aUJBQ2hELENBQUE7Z0JBQ0QsT0FBTyxDQUFDLENBQUE7WUFDWixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsR0FBbUMsRUFBRTtZQUMxRCxNQUFNLEtBQUssR0FBRzs7Ozs7O1NBTWIsQ0FBQztZQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxHQUFrQjtvQkFDbkIsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVTtpQkFDMUIsQ0FBQTtnQkFDRCxPQUFPLENBQUMsQ0FBQTtZQUNaLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCw2Q0FBd0MsR0FBRyxHQUFxRSxFQUFFO1lBQzlHLE9BQU8sRUFBRSxDQUFBO1FBQ2IsQ0FBQyxDQUFBLENBQUE7UUFFRCx1QkFBa0IsR0FBRyxDQUFPLFlBQXNDLEVBQWlCLEVBQUU7WUFDakYsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUN6QyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFDO2dCQUNsRSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQzFDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUM1QyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN4RCxFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ2hFLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDakQsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN4RCxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUM7Z0JBQzdELEVBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDN0QsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2FBQ25DLEVBQUUsRUFBQyxLQUFLLEVBQUUseUJBQXlCLEVBQUMsQ0FBQyxDQUFBO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQTtZQUMzRSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO1FBRUQsc0JBQWlCLEdBQUcsQ0FBTyxXQUFtQyxFQUFtQixFQUFFO1lBQy9FLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSx3QkFBd0IsRUFBQztnQkFDbEUsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUMxQyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDNUMsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDeEQsRUFBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFDO2dCQUNoRSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzNDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2pELEVBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDeEQsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUM3RCxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUM7Z0JBQzdELEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQzthQUNuQyxFQUFFLEVBQUMsS0FBSyxFQUFFLHlCQUF5QixFQUFDLENBQUMsQ0FBQTtZQUN0QyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEdBQUcsZUFBZSxDQUFBO1lBQzVGLE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDeEMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFBO1FBQ2YsQ0FBQyxDQUFBLENBQUE7UUFFRCxvQkFBZSxHQUFHLEdBQWlELEVBQUU7WUFDakUsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MENBc0JvQixDQUFBO1lBQ2xDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxHQUFnQztvQkFDakMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDekIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLHNCQUFzQixFQUFFLENBQUMsQ0FBQyx3QkFBd0I7b0JBQ2xELEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxVQUFVLEVBQUUsQ0FBQyxDQUFDLFlBQVk7b0JBQzFCLFdBQVcsRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDNUIsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixpQkFBaUIsRUFBRSxDQUFDLENBQUMsbUJBQW1CO29CQUN4QyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsdUJBQXVCO29CQUNoRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUMzQixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLGNBQWMsRUFBRSxDQUFDLENBQUMsZUFBZTtvQkFDakMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtvQkFDN0MsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtvQkFDN0MsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7b0JBQzVDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2lCQUMvQyxDQUFBO2dCQUNELE9BQU8sQ0FBQyxDQUFBO1lBQ1osQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUEsQ0FBQTtRQUVELHdEQUFtRCxHQUFHLEdBQXFFLEVBQUU7WUFDekgsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NEQTBCZ0MsQ0FBQTtZQUM5QyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO2dCQUMzQixJQUFJLENBQUMsR0FBb0Q7b0JBQ3JELFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDekIsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLGdDQUFnQztvQkFDdEQsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLGdDQUFnQztvQkFDdEQsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQkFDWixzQkFBc0IsRUFBRSxDQUFDLENBQUMsd0JBQXdCO29CQUNsRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsVUFBVSxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUMxQixXQUFXLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzVCLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0IsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtvQkFDaEQsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLFdBQVcsRUFBRSxDQUFDLENBQUMsWUFBWTtvQkFDM0IsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixjQUFjLEVBQUUsQ0FBQyxDQUFDLGVBQWU7b0JBQ2pDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxtQkFBbUI7b0JBQ3hDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxzQkFBc0I7b0JBQzdDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxzQkFBc0I7b0JBQzdDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07b0JBQ2hCLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUM1QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztpQkFDL0MsQ0FBQTtnQkFDRCxPQUFPLENBQUMsQ0FBQTtZQUNaLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCwwQ0FBcUMsR0FBRyxDQUFPLHFCQUE2QixFQUFtRSxFQUFFO1lBQzdJLE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQ0E2Qm9CLENBQUE7WUFFbEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDbEUsT0FBTztnQkFDSCxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVc7Z0JBQ3pCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxnQ0FBZ0M7Z0JBQ3RELGtCQUFrQixFQUFFLENBQUMsQ0FBQyxnQ0FBZ0M7Z0JBQ3RELEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDUixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7Z0JBQ1osc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QjtnQkFDbEQsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO2dCQUNkLFVBQVUsRUFBRSxDQUFDLENBQUMsWUFBWTtnQkFDMUIsV0FBVyxFQUFFLENBQUMsQ0FBQyxhQUFhO2dCQUM1QixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7Z0JBQzdCLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxtQkFBbUI7Z0JBQ3hDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyx1QkFBdUI7Z0JBQ2hELEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztnQkFDZCxXQUFXLEVBQUUsQ0FBQyxDQUFDLFlBQVk7Z0JBQzNCLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtnQkFDN0IsY0FBYyxFQUFFLENBQUMsQ0FBQyxlQUFlO2dCQUNqQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsbUJBQW1CO2dCQUN4QyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsc0JBQXNCO2dCQUM3QyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsc0JBQXNCO2dCQUM3QyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7Z0JBQ2QsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO2dCQUNoQixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztnQkFDNUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7YUFDL0MsQ0FBQTtRQUNMLENBQUMsQ0FBQSxDQUFBO1FBRUQsOEJBQXlCLEdBQUcsQ0FBTyxXQUFnQyxFQUFtQixFQUFFO1lBQ3BGLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDO2dCQUMvQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7Z0JBQzFCLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDckMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7Z0JBQzFCLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNyQyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztnQkFDMUIsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDakQsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBQztnQkFDMUQsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFDO2dCQUNwRCxFQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUM7Z0JBQ2xFLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDMUMsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzVDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7Z0JBQ3hELEVBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBQztnQkFDaEUsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDckMsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUMzRCxFQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUM7Z0JBQ3RFLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNqRCxFQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7Z0JBQ3hELEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzlDLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzlDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBQztnQkFDdEQsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBQztnQkFDaEUsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBQztnQkFDOUQsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDL0MsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFDO2dCQUMxRCxFQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRSxJQUFJLEVBQUUseUJBQXlCLEVBQUM7Z0JBQ3BFLEVBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBQztnQkFDdkUsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUM1RCxFQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUM7Z0JBQ3ZFLEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDNUQsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2FBQy9ELEVBQUUsRUFBQyxLQUFLLEVBQUUsc0JBQXNCLEVBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLGVBQWUsQ0FBQTtZQUMvRixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNsQixDQUFDLENBQUEsQ0FBQTtRQUVELCtCQUEwQixHQUFHLENBQU8sWUFBbUMsRUFBaUIsRUFBRTtZQUN0RixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDL0MsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQztnQkFDMUIsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3JDLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO2dCQUMxQixFQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDckMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7Z0JBQzFCLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQ2pELEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQzFELEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBQztnQkFDcEQsRUFBQyxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFDO2dCQUNsRSxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQzFDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUM1QyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN4RCxFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ2hFLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3JDLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDM0QsRUFBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixFQUFDO2dCQUN0RSxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDakQsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN4RCxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM5QyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM5QyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUM7Z0JBQ3RELEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ2hFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUM7Z0JBQzlELEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBQztnQkFDMUQsRUFBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFDO2dCQUNwRSxFQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUM7Z0JBQ3ZFLEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDNUQsRUFBQyxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixFQUFDO2dCQUN2RSxFQUFDLElBQUksRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUM7Z0JBQzVELEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQzthQUMvRCxFQUFFLEVBQUMsS0FBSyxFQUFFLHNCQUFzQixFQUFDLENBQUMsQ0FBQztZQUNwQyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtZQUM5RSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQsNEJBQXVCLEdBQUcsR0FBeUMsRUFBRTtZQUNqRSxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0RBK0M0QixDQUFBO1lBQzFDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQzNCLE9BQU87b0JBQ0gsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLGFBQWEsRUFBRSxDQUFDLENBQUMsY0FBYztvQkFDL0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7b0JBQ1YsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTO29CQUNyQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7b0JBQ1YsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTO29CQUNyQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7b0JBQ1YsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxvQkFBb0I7b0JBQzFDLGVBQWUsRUFBRSxDQUFDLENBQUMsaUJBQWlCO29CQUNwQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsd0JBQXdCO29CQUNsRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsVUFBVSxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUMxQixXQUFXLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzVCLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0IsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtvQkFDaEQsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDMUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTO29CQUNyQixtQkFBbUIsRUFBRSxDQUFDLENBQUMsb0JBQW9CO29CQUMzQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsMEJBQTBCO29CQUN0RCxXQUFXLEVBQUUsQ0FBQyxDQUFDLFlBQVk7b0JBQzNCLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0IsY0FBYyxFQUFFLENBQUMsQ0FBQyxlQUFlO29CQUNqQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsbUJBQW1CO29CQUN4QyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQzlCLFlBQVksRUFBRSxDQUFDLENBQUMsY0FBYztvQkFDOUIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO29CQUNwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29CQUNoQixnQkFBZ0IsRUFBRSxDQUFDLENBQUMsa0JBQWtCO29CQUN0QyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLHFCQUFxQixFQUFFLENBQUMsQ0FBQyx1QkFBdUI7b0JBQ2hELFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0Isb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtvQkFDOUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUMvQixrQkFBa0IsRUFBRSxDQUFDLENBQUMsb0JBQW9CO29CQUMxQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMseUJBQXlCO29CQUNwRCx3QkFBd0IsRUFBRSxDQUFDLENBQUMsMkJBQTJCO29CQUN2RCxtQkFBbUIsRUFBRSxDQUFDLENBQUMscUJBQXFCO29CQUM1Qyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsMkJBQTJCO29CQUN2RCxtQkFBbUIsRUFBRSxDQUFDLENBQUMscUJBQXFCO29CQUM1QyxtQkFBbUIsRUFBRSxDQUFDLENBQUMscUJBQXFCO29CQUM1QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDNUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7aUJBQy9DLENBQUE7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFBO1FBRUQsZ0NBQTJCLEdBQUcsQ0FBTyxzQkFBZ0MsRUFBa0MsRUFBRTtZQUNyRyxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBEQWdEb0MsQ0FBQTtZQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUN0RSxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtnQkFDM0IsT0FBTztvQkFDSCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1IsYUFBYSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUMvQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHO29CQUNWLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixRQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVM7b0JBQ3JCLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixRQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVM7b0JBQ3JCLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0Isa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQjtvQkFDMUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxpQkFBaUI7b0JBQ3BDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyx3QkFBd0I7b0JBQ2xELEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxVQUFVLEVBQUUsQ0FBQyxDQUFDLFlBQVk7b0JBQzFCLFdBQVcsRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDNUIsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixpQkFBaUIsRUFBRSxDQUFDLENBQUMsbUJBQW1CO29CQUN4QyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsdUJBQXVCO29CQUNoRCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUMxQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVM7b0JBQ3JCLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxvQkFBb0I7b0JBQzNDLHdCQUF3QixFQUFFLENBQUMsQ0FBQywwQkFBMEI7b0JBQ3RELFdBQVcsRUFBRSxDQUFDLENBQUMsWUFBWTtvQkFDM0IsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixjQUFjLEVBQUUsQ0FBQyxDQUFDLGVBQWU7b0JBQ2pDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxtQkFBbUI7b0JBQ3hDLFlBQVksRUFBRSxDQUFDLENBQUMsY0FBYztvQkFDOUIsWUFBWSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUM5QixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ3BCLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07b0JBQ2hCLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxrQkFBa0I7b0JBQ3RDLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0IscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtvQkFDaEQsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixvQkFBb0IsRUFBRSxDQUFDLENBQUMsc0JBQXNCO29CQUM5QyxhQUFhLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQy9CLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxvQkFBb0I7b0JBQzFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyx5QkFBeUI7b0JBQ3BELHdCQUF3QixFQUFFLENBQUMsQ0FBQywyQkFBMkI7b0JBQ3ZELG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQkFBcUI7b0JBQzVDLHdCQUF3QixFQUFFLENBQUMsQ0FBQywyQkFBMkI7b0JBQ3ZELG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQkFBcUI7b0JBQzVDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQkFBcUI7b0JBQzVDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUM1QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztpQkFDL0MsQ0FBQTtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFBLENBQUE7UUFFRCxvQkFBZSxHQUFHLENBQU8sTUFBYyxFQUFnQyxFQUFFO1lBQ3JFLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsMkdBQTJHLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2hLLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzNCLE9BQU87Z0JBQ0gsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLFFBQVEsRUFBRSxRQUFRLENBQUMsVUFBVTtnQkFDN0IsVUFBVSxFQUFFLFFBQVEsQ0FBQyxXQUFXO2dCQUNoQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7Z0JBQ25CLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUNuRCxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUN0RCxDQUFBO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUFFRCxvQkFBZSxHQUFHLENBQU8sTUFBYyxFQUFFLFVBQWtCLEVBQUUsSUFBWSxFQUF5QixFQUFFO1lBQ2hHLE1BQU0sS0FBSyxHQUFHOzs0REFFc0MsQ0FBQztZQUNyRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0RSxPQUFPO2dCQUNILEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRTtnQkFDZixRQUFRLEVBQUUsTUFBTTtnQkFDaEIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLElBQUksRUFBRSxJQUFJO2dCQUNWLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2dCQUNuRCxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQzthQUN0RCxDQUFBO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUFFRCx1QkFBa0IsR0FBRyxDQUFPLE9BQXdCLEVBQTRCLEVBQUU7WUFDOUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDbEQsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUMzRCxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSx3QkFBd0IsRUFBQztnQkFDcEUsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFDO2dCQUM5RCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ2xDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ2hFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDL0MsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzNDLEVBQUMsSUFBSSxFQUFFLDBCQUEwQixFQUFFLElBQUksRUFBRSx3QkFBd0IsRUFBQztnQkFDbEUsRUFBQyxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFDO2dCQUNsRSxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDNUQsRUFBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFDO2dCQUNoRSxFQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQzFELEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBQztnQkFDcEQsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDNUQsRUFBQyxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsSUFBSSxFQUFFLDBCQUEwQixFQUFDO2dCQUN2RSxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7Z0JBQ3ZELEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDNUQsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFDO2dCQUMxRCxFQUFDLElBQUksRUFBRSwrQkFBK0IsRUFBRSxJQUFJLEVBQUUsNEJBQTRCLEVBQUM7Z0JBQzNFLEVBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBQztnQkFDOUQsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNuRCxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUM7Z0JBQ25ELEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBQztnQkFDbkQsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQzthQUNsRCxFQUFFLEVBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFDLENBQUMsQ0FBQztZQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQztZQUNyRSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUN6QixPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDLENBQUEsQ0FBQTtRQUVELDJCQUFzQixHQUFHLENBQU8sUUFBMkIsRUFBaUIsRUFBRTtZQUMxRSxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNsRCxFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ2hFLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFDO2dCQUNwRSxFQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUM7Z0JBQzlELEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztnQkFDbEMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSx1QkFBdUIsRUFBQztnQkFDaEUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUN6QyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDO2dCQUMvQyxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQztnQkFDM0MsRUFBQyxJQUFJLEVBQUUsMEJBQTBCLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixFQUFDO2dCQUNsRSxFQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUM7Z0JBQ2xFLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUM1RCxFQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUM7Z0JBQ2hFLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBQztnQkFDMUQsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFDO2dCQUNwRCxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUM1RCxFQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsMEJBQTBCLEVBQUM7Z0JBQ3ZFLEVBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDdkQsRUFBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUM1RCxFQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUM7Z0JBQzFELEVBQUMsSUFBSSxFQUFFLCtCQUErQixFQUFFLElBQUksRUFBRSw0QkFBNEIsRUFBQztnQkFDM0UsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFDO2dCQUM5RCxFQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ25ELEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBQztnQkFDbkQsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDL0MsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFDO2dCQUNuRCxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDO2FBQ2xELEVBQUUsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO1lBRWhDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQTtZQUN0RSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBTyxjQUFzQixFQUE4QixFQUFFO1lBQy9FLElBQUksS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lDQXdDcUIsQ0FBQTtZQUNqQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDOUQsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQzNCLE9BQU87b0JBQ0gsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLGNBQWMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCO29CQUNsQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsdUJBQXVCO29CQUNoRCxTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVU7b0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjtvQkFDcEQsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtvQkFDOUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztvQkFDbEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLHFCQUFxQixFQUFFLENBQUMsQ0FBQyx1QkFBdUI7b0JBQ2hELE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUN6QixhQUFhLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQy9CLFdBQVcsRUFBRSxDQUFDLENBQUMsWUFBWTtvQkFDM0Isc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QjtvQkFDbEQsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QjtvQkFDbEQsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUMzQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ3BCLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQkFBcUI7b0JBQzVDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyx1QkFBdUI7b0JBQ2hELGtCQUFrQixFQUFFLENBQUMsQ0FBQyxvQkFBb0I7b0JBQzFDLGVBQWUsRUFBRSxDQUFDLENBQUMsaUJBQWlCO29CQUNwQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQkFBcUI7b0JBQzVDLHdCQUF3QixFQUFFLENBQUMsQ0FBQywyQkFBMkI7b0JBQ3ZELGlCQUFpQixFQUFFLENBQUMsQ0FBQyxrQkFBa0I7b0JBQ3ZDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQkFBcUI7b0JBQzVDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxvQkFBb0I7b0JBQzFDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyw2QkFBNkI7b0JBQzNELG9CQUFvQixFQUFFLENBQUMsQ0FBQyxzQkFBc0I7b0JBQzlDLGNBQWMsRUFBRSxDQUFDLENBQUMsaUJBQWlCO29CQUNuQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQjtvQkFDbkMsYUFBYSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUMvQixlQUFlLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQjtvQkFDbkMsYUFBYSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUMvQixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDNUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7aUJBQy9DLENBQUE7WUFDTCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FBTyxRQUEyQixFQUFpQixFQUFFO1lBQzFFLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7Z0JBQ3hELEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2xELEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDO2dCQUNuQyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2xELEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMxQyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ25DLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUM7Z0JBQ25ELEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUM7Z0JBQ3hELEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFDO2dCQUNyRCxFQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUM7Z0JBQ3RELEVBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDeEQsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSx5QkFBeUIsRUFBQztnQkFDckUsRUFBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFDO2dCQUN4RCxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM5QyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBQztnQkFDekQsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2pDLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQ2hELEVBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBQztnQkFDbEQsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDaEQsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2FBQ3JELEVBQUUsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN2RSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBTyxjQUFzQixFQUE4QixFQUFFO1lBQy9FLElBQUksS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dEQXFDb0MsQ0FBQTtZQUNoRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUE7WUFDN0QsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7Z0JBQzNCLE9BQU87b0JBQ0gsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUNSLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxtQkFBbUI7b0JBQ3hDLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVTtvQkFDdkIsY0FBYyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ2xDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUTtvQkFDbkIsY0FBYyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ2xDLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDMUIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29CQUNoQixPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ25CLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0IsZUFBZSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ25DLFdBQVcsRUFBRSxDQUFDLENBQUMsWUFBWTtvQkFDM0IsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVTtvQkFDdkIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29CQUNoQixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLFlBQVksRUFBRSxDQUFDLENBQUMsYUFBYTtvQkFDN0IsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQjtvQkFDckMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtvQkFDdEMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUN6Qix1QkFBdUIsRUFBRSxDQUFDLENBQUMsMEJBQTBCO29CQUNyRCxpQkFBaUIsRUFBRSxDQUFDLENBQUMsbUJBQW1CO29CQUN4QyxZQUFZLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQzlCLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDekIsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixpQkFBaUIsRUFBRSxDQUFDLENBQUMsb0JBQW9CO29CQUN6QyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU87b0JBQ2pCLGFBQWEsRUFBRSxDQUFDLENBQUMsZUFBZTtvQkFDaEMsY0FBYyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ2xDLGFBQWEsRUFBRSxDQUFDLENBQUMsZUFBZTtvQkFDaEMsY0FBYyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ2xDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUM1QyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztpQkFDL0MsQ0FBQTtZQUNMLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFBLENBQUE7UUFFRCwrQkFBMEIsR0FBRyxDQUFPLFlBQW1DLEVBQWlCLEVBQUU7WUFDdEYsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLDhCQUE4QixFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBQztnQkFDekUsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBQztnQkFDL0MsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMxQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUM7Z0JBQ25DLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUN6QyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUM7Z0JBQ25ELEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxzQ0FBc0MsRUFBRSxJQUFJLEVBQUUsbUNBQW1DLEVBQUM7Z0JBQ3pGLEVBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSx3QkFBd0IsRUFBQztnQkFDakUsRUFBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFDO2dCQUMvRCxFQUFDLElBQUksRUFBRSxvQ0FBb0MsRUFBRSxJQUFJLEVBQUUsa0NBQWtDLEVBQUM7Z0JBQ3RGLEVBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBQztnQkFDckQsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsMkJBQTJCLEVBQUM7YUFDM0UsRUFBRSxFQUFDLEtBQUssRUFBRSxzQkFBc0IsRUFBQyxDQUFDLENBQUE7WUFDbkMsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUE7WUFDOUUsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUEsQ0FBQTtRQUVELDRCQUF1QixHQUFHLENBQU8sY0FBc0IsRUFBa0MsRUFBRTtZQUN2RixNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztTQWlEYixDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFO2dCQUMzQixPQUFPO29CQUNILEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtvQkFDUixpQkFBaUIsRUFBRSxDQUFDLENBQUMsbUJBQW1CO29CQUN4QyxhQUFhLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQy9CLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVO29CQUN2QixVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVc7b0JBQ3pCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUMxQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO29CQUNaLGNBQWMsRUFBRSxDQUFDLENBQUMsZUFBZTtvQkFDakMsZUFBZSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ25DLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVTtvQkFDdkIsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDekIsZUFBZSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ25DLFdBQVcsRUFBRSxDQUFDLENBQUMsWUFBWTtvQkFDM0IsaUNBQWlDLEVBQUUsQ0FBQyxDQUFDLG9DQUFvQztvQkFDekUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtvQkFDakQsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDekMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQjtvQkFDM0Msd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjtvQkFDdEQscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtvQkFDL0MsZ0NBQWdDLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztvQkFDdEUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtvQkFDOUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTO29CQUNyQixVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVc7b0JBQ3pCLHNCQUFzQixFQUFFLENBQUMsQ0FBQyx3QkFBd0I7b0JBQ2xELGdCQUFnQixFQUFFLENBQUMsQ0FBQyxpQkFBaUI7b0JBQ3JDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxpQkFBaUI7b0JBQ3JDLGNBQWMsRUFBRSxDQUFDLENBQUMsZUFBZTtvQkFDakMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDeEMsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUMzQixTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVU7b0JBQ3ZCLGNBQWMsRUFBRSxDQUFDLENBQUMsZUFBZTtvQkFDakMsY0FBYyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7b0JBQ2xDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXO29CQUN6QixjQUFjLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQjtvQkFDbEMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLDJCQUEyQjtvQkFDeEQsYUFBYSxFQUFFLENBQUMsQ0FBQyxjQUFjO29CQUMvQixrQkFBa0IsRUFBRSxDQUFDLENBQUMsb0JBQW9CO29CQUMxQyxTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDNUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7aUJBQy9DLENBQUE7WUFDTCxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQSxDQUFBO1FBRUQsb0NBQStCLEdBQUcsQ0FBTyxNQUFjLEVBQWdELEVBQUU7WUFDckcsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7OzBDQWNvQixDQUFDO1lBQ25DLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0RCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtnQkFDM0IsT0FBTztvQkFDSCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1IsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNqQixhQUFhLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQy9CLFVBQVUsRUFBRSxDQUFDLENBQUMsY0FBYztvQkFDNUIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29CQUNoQixhQUFhLEVBQUUsQ0FBQyxDQUFDLGNBQWM7b0JBQy9CLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQkFDWixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUM3QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNsQixTQUFTLEVBQUUsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDNUMsU0FBUyxFQUFFLGdCQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7aUJBQy9DLENBQUE7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQSxDQUFBO1FBRUQsb0NBQStCLEdBQUcsQ0FBTyxRQUF3QyxFQUFFLEVBQUU7WUFDakYsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNqQyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDO2dCQUMvQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQzthQUNyQyxFQUFFLEVBQUMsS0FBSyxFQUFFLCtCQUErQixFQUFDLENBQUMsQ0FBQTtZQUM1QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFFRCx1Q0FBa0MsR0FBRyxDQUFPLFFBQXdDLEVBQWlCLEVBQUU7WUFDbkcsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNqQyxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDO2dCQUMvQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxlQUFlLEVBQUM7Z0JBQy9DLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQzthQUNyQyxFQUFFLEVBQUMsS0FBSyxFQUFFLGdDQUFnQyxFQUFDLENBQUMsQ0FBQTtZQUM3QyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztZQUNsRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQsZ0NBQTJCLEdBQUcsQ0FBTyxhQUF5QyxFQUFFLEVBQUU7WUFDOUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNqQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFDO2FBQzdELEVBQUUsRUFBQyxLQUFLLEVBQUUsMkJBQTJCLEVBQUMsQ0FBQyxDQUFBO1lBQ3hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUEsQ0FBQTtRQUVELGdDQUEyQixHQUFHLENBQU8sTUFBYyxFQUF1QyxFQUFFO1lBQ3hGLE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7U0FZYixDQUFDO1lBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBRWpELElBQUksYUFBYSxHQUErQixFQUFFLENBQUM7WUFFbkQsS0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7Z0JBQ3BCLGFBQWEsQ0FBQyxJQUFJLENBQUM7b0JBQ2YsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7b0JBQzVDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDakMsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNqQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztpQkFFdkQsQ0FBQyxDQUFBO2FBQ0w7WUFDRCxPQUFPLGFBQWEsQ0FBQztRQUN6QixDQUFDLENBQUEsQ0FBQTtRQUVELCtCQUEwQixHQUFHLENBQU8sTUFBYyxFQUFFLElBQVksRUFBRSxVQUFvQixFQUFFLGtCQUEwQixFQUFtQixFQUFFO1lBQ25JLElBQUksS0FBSyxHQUFHOzttQ0FFZSxDQUFDO1lBRTVCLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFJLHFCQUFxQixDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU8sQ0FBQyxDQUFBO1lBRS9DLE1BQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVuRCxJQUFJLE1BQU0sR0FBdUQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFGLFVBQVUsRUFBRSxTQUFTO2dCQUNyQixnQkFBZ0IsRUFBRSxjQUFjO2FBQ25DLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUN4QyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUM7YUFDdkQsRUFBRSxFQUFDLEtBQUssRUFBRSwrQkFBK0IsRUFBQyxDQUFDLENBQUE7WUFDNUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQzlELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN4RCxPQUFPLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUEsQ0FBQTtRQUVELGtDQUE2QixHQUFHLENBQU8sZUFBNkMsRUFBRSxFQUFFO1lBQ3BGLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3hDLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQzthQUN2QyxFQUFFLEVBQUMsS0FBSyxFQUFFLDZCQUE2QixFQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUMxRixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQscUNBQWdDLEdBQUcsQ0FBTyxlQUE2QyxFQUFpQixFQUFFO1lBQ3RHLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3hDLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQzthQUN2QyxFQUFFLEVBQUMsS0FBSyxFQUFFLDZCQUE2QixFQUFDLENBQUMsQ0FBQTtZQUMxQyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztZQUMxRixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQSxDQUFBO1FBRUQscUNBQWdDLEdBQUcsQ0FBTyxrQkFBbUQsRUFBRSxFQUFFO1lBQzdGLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFDO2dCQUM3QyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3hDLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2dCQUMzQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7YUFDL0IsRUFBRSxFQUFDLEtBQUssRUFBRSxnQ0FBZ0MsRUFBQyxDQUFDLENBQUE7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQzdELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFFRCx3Q0FBbUMsR0FBRyxDQUFPLGtCQUFtRCxFQUFFLEVBQUU7WUFDaEcsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDeEMsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUM7Z0JBQzNDLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDO2dCQUM5QixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBQztnQkFDdkMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQzthQUMvQixFQUFFLEVBQUMsS0FBSyxFQUFFLGdDQUFnQyxFQUFDLENBQUMsQ0FBQTtZQUM3QyxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2xFLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFFRCxtQ0FBOEIsR0FBRyxDQUFPLGdCQUE2QyxFQUFFLEVBQUU7WUFDckYsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNqQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7YUFDdkMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRCwrQkFBMEIsR0FBRyxDQUFPLFlBQXVDLEVBQUUsRUFBRTtZQUMzRSxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUM7Z0JBQ3ZDLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDO2dCQUN6QyxFQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBQztnQkFDN0MsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2dCQUNwQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQztnQkFDOUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7YUFDdkMsRUFBRSxFQUFDLEtBQUssRUFBRSx5QkFBeUIsRUFBQyxDQUFDLENBQUM7WUFDdkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0NBQTZCLEdBQUcsQ0FBTyxZQUF1QyxFQUFFLEVBQUU7WUFDOUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBQztnQkFDekMsRUFBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUM7Z0JBQzdDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUM7Z0JBQzlCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDO2dCQUNoQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDO2FBQ3ZDLEVBQUUsRUFBQyxLQUFLLEVBQUUseUJBQXlCLEVBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDLFlBQVksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRCxvQ0FBK0IsR0FBRyxDQUFPLFVBQTBDLEVBQUUsRUFBRTtZQUNuRixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNsRCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7Z0JBQ2hDLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBQztnQkFDM0QsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUM7Z0JBQ3BDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQzthQUM5QyxFQUFFLEVBQUMsS0FBSyxFQUFFLGdDQUFnQyxFQUFDLENBQUMsQ0FBQTtZQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFFRCx3Q0FBbUMsR0FBRyxDQUFPLHNCQUEwRCxFQUFFLEVBQUU7WUFDdkcsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFDO2dCQUN2QyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7YUFDckQsRUFBRSxFQUFDLEtBQUssRUFBRSwrQkFBK0IsRUFBQyxDQUFDLENBQUM7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUIsQ0FBQyxDQUFBLENBQUE7UUFFRCxvQ0FBK0IsR0FBRyxDQUFPLE1BQWMsRUFBRSxTQUFpQixFQUFFLFNBQW1CLEVBQUUsT0FBaUIsRUFBaUMsRUFBRTtZQUNqSixJQUFJLEtBQUssR0FBRzs7Ozs7Ozs7OztTQVVYLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMzRSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFBRSxPQUFPLEVBQUUsQ0FBQztZQUNqRCxJQUFJLFFBQVEsR0FBeUIsRUFBRSxDQUFDO1lBRXhDLEtBQUssSUFBSSxDQUFDLElBQUksUUFBUSxFQUFFO2dCQUNwQixRQUFRLENBQUMsSUFBSSxDQUFDO29CQUNWLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVTtvQkFDdkIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO29CQUNuQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQzFCLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDMUIsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUNuQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQ2hDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtpQkFDZixDQUFDLENBQUE7YUFDTDtZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUMsQ0FBQSxDQUFBO1FBRUQseUNBQW9DLEdBQUcsQ0FBTyxNQUFjLEVBQUUsY0FBc0IsRUFBRSxTQUFtQixFQUFFLFVBQW9CLGdCQUFRLENBQUMsR0FBRyxFQUFFLEVBQWlDLEVBQUU7WUFDNUssSUFBSSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7U0FhWCxDQUFDO1lBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFaEYsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFDakQsSUFBSSxRQUFRLEdBQXlCLEVBQUUsQ0FBQztZQUV4QyxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBRTtnQkFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDVixjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDNUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO29CQUNuQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQzFCLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDMUIsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUNuQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQ2hDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtpQkFDZixDQUFDLENBQUE7YUFDTDtZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUMsQ0FBQSxDQUFBO1FBRUQsZ0RBQTJDLEdBQUcsQ0FBTyxjQUFzQixFQUFpQyxFQUFFO1lBQzFHLElBQUksS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7U0FZWCxDQUFDO1lBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBRWpELElBQUksUUFBUSxHQUF5QixFQUFFLENBQUM7WUFFeEMsS0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7Z0JBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ1YsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7b0JBQzVDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDbkMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUMxQixLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQzFCLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztvQkFDbkMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO29CQUNoQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFVBQVU7aUJBQ3JCLENBQUMsQ0FBQTthQUNMO1lBRUQsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFBLENBQUE7UUFFRCxzQ0FBaUMsR0FBRyxDQUFPLGNBQXNCLEVBQUUsU0FBbUIsRUFBRSxPQUFpQixFQUFvQyxFQUFFO1lBQzNJLElBQUksS0FBSyxHQUFHOzs7Ozs7Ozs7O1NBVVgsQ0FBQztZQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRWhGLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ2pELElBQUksb0JBQW9CLEdBQTRCLEVBQUUsQ0FBQTtZQUN0RCxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBRTtnQkFDcEIsb0JBQW9CLENBQUMsSUFBSSxDQUFDO29CQUN0QixFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ2xCLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO29CQUM1QyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUM1QixVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVU7b0JBQ3hCLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTtpQkFDM0IsQ0FBQyxDQUFBO2FBQ0w7WUFDRCxPQUFPLG9CQUFvQixDQUFDO1FBQ2hDLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FBTyxVQUFrQixFQUFFLFNBQW1CLEVBQUUsT0FBaUIsRUFBNkIsRUFBRTtZQUNySCxJQUFJLEtBQUssR0FBRzs7Ozs7Ozs7O1NBU1gsQ0FBQztZQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRTVFLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxJQUFJLE1BQU0sR0FBcUIsRUFBRSxDQUFDO1lBRWxDLEtBQUssSUFBSSxDQUFDLElBQUksUUFBUSxFQUFFO2dCQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDO29CQUNSLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDbkMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUMxQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7aUJBQ2YsQ0FBQyxDQUFDO2FBQ047WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUEsQ0FBQTtRQUVELGtCQUFhLEdBQUcsQ0FBTyxXQUFxQixFQUFrQyxFQUFFO1lBQzVFLElBQUksS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJDQXlCdUIsQ0FBQztZQUNwQyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7WUFDMUQsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFFcEMsSUFBSSxHQUFHLEdBQTBCLEVBQUUsQ0FBQTtZQUNuQyxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBRTtnQkFDcEIsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDTCxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ2xCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtvQkFDaEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUMzQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ3BCLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUTtvQkFDcEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNsQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7b0JBQzFCLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixZQUFZLEVBQUUsQ0FBQyxDQUFDLGFBQWE7b0JBQzdCLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztvQkFDdEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29CQUNoQixjQUFjLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQjtvQkFDbEMsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTO29CQUN0QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7b0JBQ1osT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNsQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7b0JBQ3BCLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSztvQkFDZCxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7b0JBQ1YsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNsQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7b0JBQ2QsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRO29CQUNuQixXQUFXLEVBQUUsQ0FBQyxDQUFDLFlBQVk7b0JBQzNCLFNBQVMsRUFBRSxDQUFDLENBQUMsVUFBVTtpQkFDMUIsQ0FBQyxDQUFBO2FBQ0w7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsQ0FBQSxDQUFBO1FBRUQsa0NBQTZCLEdBQUcsQ0FBTyxjQUFzQixFQUFnQixFQUFFO1lBQzNFLElBQUksS0FBSyxHQUFHOztpREFFNkIsQ0FBQztZQUMxQyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFFOUQsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQzFCLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FBTyxtQkFBdUMsRUFBbUIsRUFBRTtZQUN4RixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFDO2dCQUNsRCxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztnQkFDNUIsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUM7YUFDbkMsRUFBRSxFQUFDLEtBQUssRUFBRSxvQkFBb0IsRUFBQyxDQUFDLENBQUE7WUFDakMsTUFBTSxLQUFLLEdBQUcsNkJBQTZCLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDckYsOENBQThDLENBQUMsQ0FBQTtZQUNuRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzFDLE9BQU8sTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RDLENBQUMsQ0FBQSxDQUFBO1FBRUQsd0JBQW1CLEdBQUcsQ0FBTyxnQkFBZ0MsRUFBbUIsRUFBRTtZQUM5RSxNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUM7Z0JBQ3pDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQzthQUNuQyxFQUFFLEVBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQztZQUU5QixNQUFNLEtBQUssR0FBRyw2QkFBNkIsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNsRixxQ0FBcUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsT0FBTyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEMsQ0FBQyxDQUFBLENBQUE7UUFFRCwyQkFBc0IsR0FBRyxDQUFPLG1CQUFpRCxFQUFtQixFQUFFO1lBQ2xHLE1BQU0sRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxFQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBQ2xELEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO2dCQUM1QixFQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQztnQkFDaEMsRUFBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFDO2dCQUMzRCxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQztnQkFDcEMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7Z0JBQzVCLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDO2FBQzlDLEVBQUUsRUFBQyxLQUFLLEVBQUUsaUNBQWlDLEVBQUMsQ0FBQyxDQUFBO1lBRTlDLE1BQU0sS0FBSyxHQUFHLDZCQUE2QixDQUFDLG1CQUFtQixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUN6RSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsc0JBQXNCLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsRUFDOUUsMkRBQTJELENBQUMsQ0FBQztZQUNqRSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQzFDLE9BQU8sTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RDLENBQUMsQ0FBQSxDQUFBO1FBN3hERyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ25CLENBQUM7Q0E0eERKO0FBbnlERCw2QkFteURDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxJQUFTLEVBQUUsRUFBYSxFQUFFLEdBQVUsRUFBRSxXQUFtQixJQUFJO0lBQ3JGLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUMvQixnQkFBZ0IsUUFBUSxrQkFBa0I7UUFDMUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDZixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsT0FBTyxHQUFHLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQixDQUFDO0FBRUQsU0FBUyw2QkFBNkIsQ0FBQyxJQUFTLEVBQUUsRUFBYSxFQUFFLEdBQVUsRUFBRSxPQUFpQixFQUFFLFdBQW1CLElBQUk7SUFDbkgsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQy9CLGdCQUFnQixRQUFRLGtCQUFrQjtRQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2QsT0FBTyxHQUFHLEdBQUcsYUFBYSxHQUFHLEVBQUUsQ0FBQTtRQUNuQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixDQUFDIn0=
