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
        this.getTradingPostAccountsWithFinicityNumber = (userId) => {
            throw new Error("Method not implemented.");
        };
        this.getSecuritiesWithIssue = () => __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
        this.getTradingPostInstitutionsWithFinicityId = () => __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
        this.upsertInstitutions = (institutions) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
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
            ], { table: 'trading_post_institution' });
            const query = upsertReplaceQuery(institutions, cs, this.pgp, "name");
            yield this.db.none(query);
        });
        this.getInstitutions = () => __awaiter(this, void 0, void 0, function* () {
            const query = `
            SELECT id,
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
            SELECT id,
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
                   created_at,
                   fi.id             internal_finicity_institution_id,
                   fi.institution_id external_finicity_institution_id
            FROM tradingpost_institution ti
                     INNER JOIN finicity_institution fi
                                ON fi.name = ti.name;`;
            const response = yield this.db.query(query);
            return response.map((r) => {
                let o = {
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
        this.upsertFinicityInstitutions = (institutions) => __awaiter(this, void 0, void 0, function* () {
            const cs = new this.pgp.helpers.ColumnSet([
                { name: 'institution_id', prop: 'institutionId' }, { name: 'name', prop: 'name' }, { name: 'voa', prop: 'voa' },
                { name: 'voi', prop: 'voi' }, { name: 'state_agg', prop: 'stateAgg' }, { name: 'ach', prop: 'ach' },
                { name: 'trans_agg', prop: 'transAgg' },
                { name: 'aha', prop: 'aha' }, { name: 'available_balance', prop: 'availBalance' },
                { name: 'account_owner', prop: 'accountOwner' }, { name: 'loan_payment_details', prop: 'loanPaymentDetails' },
                { name: 'student_loan_data', prop: 'studentLoanData' },
                { name: 'account_type_description', prop: 'accountTypeDescription' }, { name: 'phone', prop: 'phone' },
                { name: 'url_home_app', prop: 'urlHomeApp' }, { name: 'url_logon_app', prop: 'urlLogonApp' },
                { name: 'oauth_enabled', prop: 'oauthEnabled' }, { name: 'url_forgot_password', prop: 'urlForgotPassword' },
                { name: 'url_online_registration', prop: 'urlOnlineRegistration' }, { name: 'class', prop: 'class' },
                { name: 'special_text', prop: 'specialText' }, { name: 'time_zone', prop: 'timeZone' },
                { name: 'special_instructions', prop: 'specialInstructions' },
                { name: 'special_instructions_title', prop: 'specialInstructionsTitle' },
                { name: 'address_city', prop: 'addressCity' }, { name: 'address_state', prop: 'addressState' },
                { name: 'address_country', prop: 'addressCountry' }, { name: 'address_postal_code', prop: 'addressPostalCode' },
                { name: 'address_line_1', prop: 'addressLine1' }, { name: 'address_line_2', prop: 'addressLine2' },
                { name: 'currency', prop: 'currency' }, { name: 'email', prop: 'email' }, { name: 'status', prop: 'status' },
                { name: 'new_institution_id', prop: 'newInstitutionId' }, { name: 'branding_logo', prop: 'brandingLogo' },
                { name: 'branding_alternate_logo', prop: 'brandingAlternateLogo' },
                { name: 'branding_icon', prop: 'brandingIcon' },
                { name: 'branding_primary_color', prop: 'brandingPrimaryColor' },
                { name: 'branding_title', prop: 'brandingTitle' }, { name: 'oauth_institution_id', prop: 'oauthInstitutionId' },
                { name: 'production_status_overall', prop: 'productionStatusOverall' },
                { name: 'production_status_trans_agg', prop: 'productionStatusTransAgg' },
                { name: 'production_status_voa', prop: 'productionStatusVoa' },
                { name: 'production_status_state_agg', prop: 'productionStatusStateAgg' },
                { name: 'production_status_ach', prop: 'production_status_ach' },
                { name: 'production_status_aha', prop: 'production_status_aha' },
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
                       WHERE institution_id IN ($1);`;
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
        this.addFinicityAccounts = (accounts) => __awaiter(this, void 0, void 0, function* () {
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
            const query = this.pgp.helpers.insert(accounts, cs);
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
            WHERE finicity_user_id = $1
        `;
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
                { name: 'option_expire_date', prop: 'optionExpireDate' },
                { name: 'fi_asset_class', prop: 'fiAssetClass' },
                { name: 'asset_class', prop: 'assetClass' },
                { name: 'currency_rate', prop: 'currencyRate' },
                { name: 'cost_basis_per_share', prop: 'costBasisPerShare' },
                { name: 'mf_type', prop: 'mfType' },
                { name: 'total_gl_dollar', prop: 'totalGlDollar' },
                { name: 'total_gl_percent', prop: 'totalGlPercent' },
                { name: 'today_gl_dollar', prop: 'todayGlDollar' },
                { name: 'today_gl_dollar', prop: 'todayGlPercent' },
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
                { name: 'finicity_account_id', prop: 'finicityAccountId' },
                { name: 'transaction_id', prop: 'transactionId' },
                { name: 'amount', prop: 'amount' },
                { name: 'account_id', prop: 'accountId' },
                { name: 'customer_id', prop: 'customerId' },
                { name: 'status', prop: 'status' },
                { name: 'description', prop: 'description' },
                { name: 'memo', prop: 'memo' },
                { name: 'type', prop: 'type' },
                { name: 'interest_amount', prop: 'interestAmount' },
                { name: 'principal_amount', prop: 'principalAmount' },
                { name: 'fee_amount', prop: 'feeAmount' },
                { name: 'escrow_amount', prop: 'escrowAmount' },
                { name: 'unit_quantity', prop: 'unitQuantity' },
                { name: 'posted_date', prop: 'postedDate' },
                { name: 'transaction_date', prop: 'transactionDate' },
                { name: 'created_date', prop: 'createdDate' },
                { name: 'categorization_normalized_payee_name', prop: 'categorizationNormalizedPayeeName' },
                { name: 'categorization_category', prop: 'categorizationCategory' },
                { name: 'categorization_city', prop: 'categorizationCity' },
                { name: 'categorization_state', prop: 'categorizationState' },
                { name: 'categorization_postal_code', prop: 'categorizationPostalCode' },
                { name: 'categorization_country', prop: 'categorizationCountry' },
                { name: 'categorization_best_representation', prop: 'categorizationBestRepresentation' },
                { name: 'running_balance_amount', prop: 'runningBalanceAmount' },
                { name: 'check_num', prop: 'checkNum' },
                { name: 'income_type', prop: 'incomeType' },
                { name: 'subaccount_security_type', prop: 'subaccountSecurityType' },
                { name: 'commission_amount', prop: 'commissionAmount' },
                { name: 'split_denominator', prop: 'splitDenominator' },
                { name: 'split_numerator', prop: 'splitNumerator' },
                { name: 'shares_per_contract', prop: 'sharesPerContract' },
                { name: 'taxes_amount', prop: 'taxesAmount' },
                { name: 'unit_price', prop: 'unitPrice' },
                { name: 'currency_symbol', prop: 'currencySymbol' },
                { name: 'sub_account_fund', prop: 'subAccountFund' },
                { name: 'ticker', prop: 'ticker' },
                { name: 'security_id', prop: 'securityId' },
                { name: 'security_id_type', prop: 'security_id_type' },
                { name: 'investment_transaction_type', prop: 'investmentTransactionType' },
                { name: 'effective_date', prop: 'effectiveDate' },
                { name: 'first_effective_date', prop: 'firstEffectiveDate' }
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
            ], { table: 'tradingpost_brokerage_accounts' });
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
            const query = this.pgp.helpers.insert(currentHoldings, cs);
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
                     WHERE id IN ($1)`;
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
    addTradingPostBrokerageHoldings(holdings) {
        throw new Error("Method not implemented.");
    }
    addTradingPostBrokerageTransactions(transactions) {
        throw new Error("Method not implemented.");
    }
    addTradingPostBrokerageHoldingsHistory(holdingsHistory) {
        throw new Error("Method not implemented.");
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
