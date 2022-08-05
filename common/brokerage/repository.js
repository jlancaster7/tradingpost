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
                       WHERE time >= $1
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
            const row = this.db.oneOrNone(query, [finicityCustomerId]);
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
                         FROM finicity_holding fh
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
            FROM finicity_transaction ft
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
                       FROM tradingpost_brokerage_account
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
            ], { table: 'tradingpost_brokerage_account' });
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
                       FROM tradingpost_account_group ag
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
            let query = `INSERT INTO tradingpost_account_group(user_id, name, default_benchmark_id)
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
                     FROM tradingpost_historical_holding
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
                     FROM tradingpost_historical_holding ht
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
                     FROM tradingpost_current_holding ch
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
                     FROM account_group_hpr
                     WHERE account_group_id = $1
                       AND date BETWEEN $2 AND $3
                     ORDER BY date;`;
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
                     FROM security_price
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
                     FROM security
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
            const query = upsertReplaceQueryWithColumns(accountGroupReturns, cs, this.pgp, ["return"], "account_group_hpr_account_group_id_date_key");
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
            const query = upsertReplaceQueryWithColumns(accountGroupSummary, cs, this.pgp, ["beta", "sharpe", "industry_allocations", "exposure", "date", "benchmark_id"], "tradingpost_account_group_stats_account_group_id_date_key");
            const result = yield this.db.result(query);
            return result.rowCount > 0 ? 1 : 0;
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
            const query = `DELETE
                       FROM tradingpost_brokerage_account
                       WHERE id IN ($1:list)`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteTradingPostBrokerageTransactions = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM tradingpost_transaction
                       WHERE account_id IN ($1:list)`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteTradingPostBrokerageHoldings = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM TRADINGPOST_CURRENT_HOLDING
                       WHERE account_id IN ($1:list)`;
            yield this.db.none(query, [accountIds]);
        });
        this.deleteTradingPostBrokerageHistoricalHoldings = (accountIds) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE
                       FROM TRADINGPOST_HISTORICAL_HOLDING
                       WHERE account_id IN ($1:list)`;
            yield this.db.none(query, [accountIds]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQ0EsaUNBQStCO0FBSS9CLE1BQXFCLFVBQVU7SUFJM0IsWUFBWSxFQUFrQixFQUFFLEdBQVU7UUFLMUMsc0JBQWlCLEdBQUcsR0FBdUMsRUFBRTtZQUN6RCxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dEQXdCMEIsQ0FBQTtZQUN4QyxNQUFNLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxDQUFDO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUN4RCxPQUFPO2dCQUNILEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDUixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Z0JBQ2hCLFdBQVcsRUFBRSxDQUFDLENBQUMsWUFBWTtnQkFDM0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO2dCQUNwQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7Z0JBQ3BCLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztnQkFDbEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2dCQUMxQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7Z0JBQ1YsWUFBWSxFQUFFLENBQUMsQ0FBQyxhQUFhO2dCQUM3QixTQUFTLEVBQUUsQ0FBQyxDQUFDLFVBQVU7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtnQkFDaEIsY0FBYyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7Z0JBQ2xDLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUztnQkFDdEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO2dCQUNaLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztnQkFDbEIsUUFBUSxFQUFFLENB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