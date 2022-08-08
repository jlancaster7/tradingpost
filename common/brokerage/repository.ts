import {
    AccountGroupHPRs,
    AccountGroupHPRsTable,
    FinicityAccount,
    FinicityHolding,
    FinicityInstitution,
    FinicityTransaction,
    FinicityUser,
    GetSecurityBySymbol, GetSecurityPrice,
    HistoricalHoldings,
    IBrokerageRepository,
    ISummaryRepository,
    SecurityHPRs,
    SecurityIssue,
    SecurityPrices,
    TradingPostAccountGroups,
    TradingPostAccountGroupStats,
    TradingPostAccountToAccountGroup,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountsTable,
    TradingPostBrokerageAccountWithFinicity,
    TradingPostCurrentHoldings,
    TradingPostCurrentHoldingsTable, TradingPostCurrentHoldingsTableWithSecurity,
    TradingPostCustomIndustry,
    TradingPostHistoricalHoldings,
    TradingPostInstitution,
    TradingPostInstitutionTable,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
    TradingPostTransactionsTable, TradingPostUser
} from "./interfaces";
import {ColumnSet, IDatabase, IMain} from "pg-promise";
import {DateTime} from "luxon";
import {addSecurity, getUSExchangeHoliday} from "../market-data/interfaces";
import {sec} from "mathjs";

export default class Repository implements IBrokerageRepository, ISummaryRepository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    getCashSecurityId = async (): Promise<GetSecurityBySymbol> => {
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
                       WHERE symbol = 'USD:CUR'`
        const r = await this.db.oneOrNone(query);
        if (!r) throw new Error("something happened to cash!!");
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
        }
    }

    getSecurityPricesWithEndDateBySecurityIds = async (startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]> => {
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
                       ORDER BY time DESC`


        const response = await this.db.query(query, [startDate, endDate, securityIds]);
        return response.map((row: any) => {
            let o: GetSecurityPrice = {
                id: row.id,
                securityId: row.security_id,
                price: row.price,
                time: DateTime.fromJSDate(row.time),
                high: row.high,
                open: row.open,
                low: row.low,
                createdAt: DateTime.fromJSDate(row.created_at)
            }
            return o
        })
    }

    getMarketHolidays = async (endDate: DateTime): Promise<getUSExchangeHoliday[]> => {
        const response = await this.db.query(`SELECT id,
                                                     date,
                                                     settlement_date,
                                                     created_at
                                              FROM us_exchange_holiday
                                              WHERE date > $1
                                              ORDER BY date DESC`, [endDate.toJSDate()])
        return response.map((row: any) => {
            let o: getUSExchangeHoliday = {
                id: row.id,
                createdAt: DateTime.fromJSDate(row.created_at),
                date: DateTime.fromJSDate(row.date),
                settlementDate: DateTime.fromJSDate(row.settlement_date),
            }
            return o
        })
    }

    getTradingPostBrokerageAccount = async (accountId: number): Promise<TradingPostBrokerageAccountsTable> => {
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
                       WHERE id = $1;`
        const result = await this.db.oneOrNone(query, [accountId])
        return {
            name: result.name,
            status: result.status,
            created_at: DateTime.fromJSDate(result.created_at),
            updated_at: DateTime.fromJSDate(result.updated_at),
            userId: result.user_id,
            mask: result.mask,
            id: result.id,
            brokerName: result.broker_name,
            type: result.type,
            subtype: result.subtype,
            accountNumber: result.account_number,
            officialName: result.official_name,
            institutionId: result.institution_id
        }
    }

    getTradingPostBrokerageAccountCurrentHoldingsWithSecurity = async (accountId: number): Promise<TradingPostCurrentHoldingsTableWithSecurity[]> => {
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
            WHERE tch.account_id = $1`
        const result = await this.db.query(query, [accountId]);
        return result.map((row: any) => {
            let o: TradingPostCurrentHoldingsTableWithSecurity = {
                symbol: row.symbol,
                accountId: row.account_id,
                id: row.id,
                updated_at: DateTime.fromJSDate(row.updated_at),
                created_at: DateTime.fromJSDate(row.create_at),
                costBasis: row.cost_basis,
                currency: row.currency,
                price: row.price,
                priceAsOf: row.price_as_of,
                securityId: row.security_id,
                priceSource: row.price_source,
                quantity: row.quantity,
                securityType: row.security_type,
                value: row.value
            }
            return o
        })
    }

    getTradingPostBrokerageAccountCurrentHoldings = async (accountId: number): Promise<TradingPostCurrentHoldingsTable[]> => {
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
        const result = await this.db.query(query, [accountId]);
        return result.map((row: any) => {
            let o: TradingPostCurrentHoldingsTable = {
                accountId: row.account_id,
                id: row.id,
                updated_at: DateTime.fromJSDate(row.updated_at),
                created_at: DateTime.fromJSDate(row.create_at),
                costBasis: row.cost_basis,
                currency: row.currency,
                price: row.price,
                priceAsOf: row.price_as_of,
                securityId: row.security_id,
                priceSource: row.price_source,
                quantity: row.quantity,
                securityType: row.security_type,
                value: row.value
            }
            return o
        })
    }

    getTradingPostBrokerageAccountTransactions = async (accountId: number): Promise<TradingPostTransactionsTable[]> => {
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
            WHERE account_id = $1;`
        const response = await this.db.query(query, [accountId]);
        return response.map((row: any) => {
            let o: TradingPostTransactionsTable = {
                accountId: row.account_id,
                created_at: DateTime.fromJSDate(row.created_at),
                updated_at: DateTime.fromJSDate(row.updated_at),
                id: row.id,
                amount: row.amount,
                fees: row.fees,
                type: row.type,
                currency: row.currency,
                date: DateTime.fromJSDate(row.date),
                quantity: row.quantity,
                price: row.price,
                securityId: row.security_id,
                securityType: row.security_type
            }
            return o
        })
    }

    getTradingPostAccountsWithFinicityNumber = async (userId: string): Promise<TradingPostBrokerageAccountWithFinicity[]> => {
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
        const response = await this.db.query(query, [userId]);
        return response.map((r: any) => {
            let o: TradingPostBrokerageAccountWithFinicity = {
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
                updated_at: DateTime.fromJSDate(r.updated_at),
                created_at: DateTime.fromJSDate(r.created_at)
            }
            return o
        });
    }

    getSecuritiesWithIssue = async (): Promise<SecurityIssue[]> => {
        const query = `
            SELECT id,
                   symbol,
                   company_name,
                   issue_type
            FROM security;
        `;
        const response = await this.db.query(query);
        return response.map((r: any) => {
            let o: SecurityIssue = {
                id: r.id,
                symbol: r.symbol,
                name: r.name,
                issueType: r.issue_type
            }
            return o
        })
    }

    getTradingPostInstitutionsWithFinicityId = async (): Promise<TradingPostInstitutionWithFinicityInstitutionId[]> => {
        return []
    }

    upsertInstitutions = async (institutions: TradingPostInstitution[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'external_id', prop: 'externalId'},
            {name: 'name', prop: 'name'},
            {name: 'account_type_description', prop: 'accountTypeDescription'},
            {name: 'phone', prop: 'phone'},
            {name: 'url_home_app', prop: 'urlHomeApp'},
            {name: 'url_logon_app', prop: 'urlLogonApp'},
            {name: 'oauth_enabled', prop: 'oauthEnabled'},
            {name: 'url_forgot_password', prop: 'urlForgotPassword'},
            {name: 'url_online_registration', prop: 'urlOnlineRegistration'},
            {name: 'class', prop: 'class'},
            {name: 'address_city', prop: 'addressCity'},
            {name: 'address_state', prop: 'addressState'},
            {name: 'address_country', prop: 'addressCountry'},
            {name: 'address_postal_code', prop: 'addressPostalCode'},
            {name: 'address_address_line_1', prop: 'addressAddressLine1'},
            {name: 'address_address_line_2', prop: 'addressAddressLine2'},
            {name: 'email', prop: 'email'},
            {name: 'status', prop: 'status'}
        ], {table: 'tradingpost_institution'})
        const query = upsertReplaceQuery(institutions, cs, this.pgp, "external_id")
        await this.db.none(query)
    }

    upsertInstitution = async (institution: TradingPostInstitution): Promise<number> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'external_id', prop: 'externalId'},
            {name: 'name', prop: 'name'},
            {name: 'account_type_description', prop: 'accountTypeDescription'},
            {name: 'phone', prop: 'phone'},
            {name: 'url_home_app', prop: 'urlHomeApp'},
            {name: 'url_logon_app', prop: 'urlLogonApp'},
            {name: 'oauth_enabled', prop: 'oauthEnabled'},
            {name: 'url_forgot_password', prop: 'urlForgotPassword'},
            {name: 'url_online_registration', prop: 'urlOnlineRegistration'},
            {name: 'class', prop: 'class'},
            {name: 'address_city', prop: 'addressCity'},
            {name: 'address_state', prop: 'addressState'},
            {name: 'address_country', prop: 'addressCountry'},
            {name: 'address_postal_code', prop: 'addressPostalCode'},
            {name: 'address_address_line_1', prop: 'addressAddressLine1'},
            {name: 'address_address_line_2', prop: 'addressAddressLine2'},
            {name: 'email', prop: 'email'},
            {name: 'status', prop: 'status'}
        ], {table: 'tradingpost_institution'})
        const query = upsertReplaceQuery(institution, cs, this.pgp, "external_id") + ' RETURNING id'
        const r = await this.db.oneOrNone(query)
        return r.id
    }

    getInstitutions = async (): Promise<TradingPostInstitutionTable[]> => {
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
            FROM tradingpost_institution;`
        const response = await this.db.query(query);
        return response.map((r: any) => {
            let o: TradingPostInstitutionTable = {
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
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at)
            }
            return o
        })
    }

    getTradingPostInstitutionsWithFinicityInstitutionId = async (): Promise<TradingPostInstitutionWithFinicityInstitutionId[]> => {
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
                                ON fi.name = ti.name;`
        const response = await this.db.query(query);
        return response.map((r: any) => {
            let o: TradingPostInstitutionWithFinicityInstitutionId = {
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
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at)
            }
            return o
        })
    }

    getTradingPostInstitutionByFinicityId = async (finicityInstitutionId: number): Promise<TradingPostInstitutionWithFinicityInstitutionId | null> => {
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
            WHERE fi.institution_id = $1;`

        const r = await this.db.oneOrNone(query, [finicityInstitutionId]);
        if (!r) return null
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
            updatedAt: DateTime.fromJSDate(r.updated_at),
            createdAt: DateTime.fromJSDate(r.created_at)
        }
    }

    addSecurity = async (sec: addSecurity) => {
        const query = `INSERT INTO security(symbol, company_name, exchange, industry, website,
                                            description, ceo, security_name, issue_type, sector,
                                            primary_sic_code, employees, tags, address, address2, state,
                                            zip, country, phone, logo_url)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                               $11, $12, $13, $14, $15, $16, $17, $18, $19,
                               $20)
                       RETURNING id;`
        return (await this.db.one(query, [sec.symbol, sec.companyName, sec.exchange, sec.industry, sec.website,
            sec.description, sec.ceo, sec.securityName, sec.issueType, sec.securityName, sec.primarySicCode, sec.employees,
            sec.tags, sec.address, sec.address2, sec.state, sec.zip, sec.country, sec.phone, sec.logoUrl])).id;
    }

    upsertFinicityInstitution = async (institution: FinicityInstitution): Promise<number> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'institution_id', prop: 'institutionId'},
            {name: 'name', prop: 'name'},
            {name: 'voa', prop: 'voa'},
            {name: 'voi', prop: 'voi'},
            {name: 'state_agg', prop: 'stateAgg'},
            {name: 'ach', prop: 'ach'},
            {name: 'trans_agg', prop: 'transAgg'},
            {name: 'aha', prop: 'aha'},
            {name: 'available_balance', prop: 'availBalance'},
            {name: 'account_owner', prop: 'accountOwner'},
            {name: 'loan_payment_details', prop: 'loanPaymentDetails'},
            {name: 'student_loan_data', prop: 'studentLoanData'},
            {name: 'account_type_description', prop: 'accountTypeDescription'},
            {name: 'phone', prop: 'phone'},
            {name: 'url_home_app', prop: 'urlHomeApp'},
            {name: 'url_logon_app', prop: 'urlLogonApp'},
            {name: 'oauth_enabled', prop: 'oauthEnabled'},
            {name: 'url_forgot_password', prop: 'urlForgotPassword'},
            {name: 'url_online_registration', prop: 'urlOnlineRegistration'},
            {name: 'class', prop: 'class'},
            {name: 'special_text', prop: 'specialText'},
            {name: 'time_zone', prop: 'timeZone'},
            {name: 'special_instructions', prop: 'specialInstructions'},
            {name: 'special_instructions_title', prop: 'specialInstructionsTitle'},
            {name: 'address_city', prop: 'addressCity'},
            {name: 'address_state', prop: 'addressState'},
            {name: 'address_country', prop: 'addressCountry'},
            {name: 'address_postal_code', prop: 'addressPostalCode'},
            {name: 'address_line_1', prop: 'addressLine1'},
            {name: 'address_line_2', prop: 'addressLine2'},
            {name: 'currency', prop: 'currency'},
            {name: 'email', prop: 'email'},
            {name: 'status', prop: 'status'},
            {name: 'new_institution_id', prop: 'newInstitutionId'},
            {name: 'branding_logo', prop: 'brandingLogo'},
            {name: 'branding_alternate_logo', prop: 'brandingAlternateLogo'},
            {name: 'branding_icon', prop: 'brandingIcon'},
            {name: 'branding_primary_color', prop: 'brandingPrimaryColor'},
            {name: 'branding_title', prop: 'brandingTitle'},
            {name: 'oauth_institution_id', prop: 'oauthInstitutionId'},
            {name: 'production_status_overall', prop: 'productionStatusOverall'},
            {name: 'production_status_trans_agg', prop: 'productionStatusTransAgg'},
            {name: 'production_status_voa', prop: 'productionStatusVoa'},
            {name: 'production_status_state_agg', prop: 'productionStatusStateAgg'},
            {name: 'production_status_ach', prop: 'productionStatusAch'},
            {name: 'production_status_aha', prop: 'productionStatusAha'},
        ], {table: 'finicity_institution'});
        const query = upsertReplaceQuery(institution, cs, this.pgp, "institution_id") + " RETURNING id"
        const res = await this.db.oneOrNone(query);
        return res.id;
    }

    upsertFinicityInstitutions = async (institutions: FinicityInstitution[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'institution_id', prop: 'institutionId'},
            {name: 'name', prop: 'name'},
            {name: 'voa', prop: 'voa'},
            {name: 'voi', prop: 'voi'},
            {name: 'state_agg', prop: 'stateAgg'},
            {name: 'ach', prop: 'ach'},
            {name: 'trans_agg', prop: 'transAgg'},
            {name: 'aha', prop: 'aha'},
            {name: 'available_balance', prop: 'availBalance'},
            {name: 'account_owner', prop: 'accountOwner'},
            {name: 'loan_payment_details', prop: 'loanPaymentDetails'},
            {name: 'student_loan_data', prop: 'studentLoanData'},
            {name: 'account_type_description', prop: 'accountTypeDescription'},
            {name: 'phone', prop: 'phone'},
            {name: 'url_home_app', prop: 'urlHomeApp'},
            {name: 'url_logon_app', prop: 'urlLogonApp'},
            {name: 'oauth_enabled', prop: 'oauthEnabled'},
            {name: 'url_forgot_password', prop: 'urlForgotPassword'},
            {name: 'url_online_registration', prop: 'urlOnlineRegistration'},
            {name: 'class', prop: 'class'},
            {name: 'special_text', prop: 'specialText'},
            {name: 'time_zone', prop: 'timeZone'},
            {name: 'special_instructions', prop: 'specialInstructions'},
            {name: 'special_instructions_title', prop: 'specialInstructionsTitle'},
            {name: 'address_city', prop: 'addressCity'},
            {name: 'address_state', prop: 'addressState'},
            {name: 'address_country', prop: 'addressCountry'},
            {name: 'address_postal_code', prop: 'addressPostalCode'},
            {name: 'address_line_1', prop: 'addressLine1'},
            {name: 'address_line_2', prop: 'addressLine2'},
            {name: 'currency', prop: 'currency'},
            {name: 'email', prop: 'email'},
            {name: 'status', prop: 'status'},
            {name: 'new_institution_id', prop: 'newInstitutionId'},
            {name: 'branding_logo', prop: 'brandingLogo'},
            {name: 'branding_alternate_logo', prop: 'brandingAlternateLogo'},
            {name: 'branding_icon', prop: 'brandingIcon'},
            {name: 'branding_primary_color', prop: 'brandingPrimaryColor'},
            {name: 'branding_title', prop: 'brandingTitle'},
            {name: 'oauth_institution_id', prop: 'oauthInstitutionId'},
            {name: 'production_status_overall', prop: 'productionStatusOverall'},
            {name: 'production_status_trans_agg', prop: 'productionStatusTransAgg'},
            {name: 'production_status_voa', prop: 'productionStatusVoa'},
            {name: 'production_status_state_agg', prop: 'productionStatusStateAgg'},
            {name: 'production_status_ach', prop: 'productionStatusAch'},
            {name: 'production_status_aha', prop: 'productionStatusAha'},
        ], {table: 'finicity_institution'});
        const query = upsertReplaceQuery(institutions, cs, this.pgp, "institution_id")
        await this.db.none(query);
    }

    getFinicityInstitutions = async (): Promise<FinicityInstitution[]> => {
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
                       FROM finicity_institution;`
        const response = await this.db.query(query);
        return response.map((r: any) => {
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
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at)
            }
        });
    }

    getFinicityInstitutionsById = async (finicityInstitutionIds: number[]): Promise<FinicityInstitution[]> => {
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
                       WHERE institution_id IN ($1:list);`
        const response = await this.db.query(query, [finicityInstitutionIds]);
        return response.map((r: any) => {
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
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at)
            }
        });
    }

    getFinicityUser = async (userId: string): Promise<FinicityUser | null> => {
        const response = await this.db.oneOrNone(`
            SELECT id,
                   tp_user_id,
                   customer_id,
                   type,
                   updated_at,
                   created_at
            FROM finicity_user
            WHERE tp_user_id = $1`, [userId]);
        if (!response) return null;
        return {
            id: response.id,
            tpUserId: response.tp_user_id,
            customerId: response.customer_id,
            type: response.type,
            updatedAt: DateTime.fromJSDate(response.updated_at),
            createdAt: DateTime.fromJSDate(response.created_at)
        }
    }

    getTradingPostUserByFinicityCustomerId = async (finicityCustomerId: string): Promise<TradingPostUser | null> => {
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
            WHERE fu.customer_id = $1;`
        const row: any = await this.db.oneOrNone(query, [finicityCustomerId]);
        if (!row) return null;

        return {
            id: row.id,
            bio: row.bio,
            analystProfile: row.analyst_profile,
            bannerUrl: row.banner_url,
            createdAt: DateTime.fromJSDate(row.created_at),
            updatedAt: DateTime.fromJSDate(row.updated_at),
            dummy: row.dummy,
            email: row.email,
            firstName: row.first_name,
            handle: row.handle,
            hasProfilePic: row.has_profile_pic,
            lastName: row.last_name,
            profileUrl: row.profile_url,
            tags: row.tags,
            settings: row.settings
        }
    }

    getFinicityUserByFinicityCustomerId = async (customerId: string): Promise<FinicityUser | null> => {
        const response = await this.db.oneOrNone(`
            SELECT id,
                   tp_user_id,
                   customer_id,
                   type,
                   updated_at,
                   created_at
            FROM finicity_user
            WHERE customer_id = $1`, [customerId]);
        if (!response) return null;
        return {
            id: response.id,
            tpUserId: response.tp_user_id,
            customerId: response.customer_id,
            type: response.type,
            updatedAt: DateTime.fromJSDate(response.updated_at),
            createdAt: DateTime.fromJSDate(response.created_at)
        }
    }

    addFinicityUser = async (userId: string, customerId: string, type: string): Promise<FinicityUser> => {
        const query = `INSERT INTO finicity_user(tp_user_id, customer_id, type)
                       VALUES ($1, $2, $3)
                       RETURNING id, updated_at, created_at`;
        const response = await this.db.one(query, [userId, customerId, type]);
        return {
            id: response.id,
            tpUserId: userId,
            customerId: customerId,
            type: type,
            updatedAt: DateTime.fromJSDate(response.updated_at),
            createdAt: DateTime.fromJSDate(response.created_at)
        }
    }

    addFinicityAccount = async (account: FinicityAccount): Promise<FinicityAccount> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'finicity_user_id', prop: 'finicityUserId'},
            {name: 'finicity_institution', prop: 'finicityInstitution'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'number', prop: 'number'},
            {name: 'real_account_number_last_4', prop: 'realAccountNumberLast4'},
            {name: 'account_number_display', prop: 'accountNumberDisplay'},
            {name: 'name', prop: 'name'},
            {name: 'balance', prop: 'balance'},
            {name: 'type', prop: 'type'},
            {name: 'aggregation_status_code', prop: 'aggregationStatusCode'},
            {name: 'status', prop: 'status'},
            {name: 'customer_id', prop: 'customerId'},
            {name: 'institution_id', prop: 'institutionId'},
            {name: 'balance_date', prop: 'balanceDate'},
            {name: 'aggregation_success_date', prop: 'aggregationSuccessDate'},
            {name: 'aggregation_attempt_date', prop: 'aggregationAttemptDate'},
            {name: 'created_date', prop: 'createdDate'},
            {name: 'currency', prop: 'currency'},
            {name: 'last_transaction_date', prop: 'lastTransactionDate'},
            {name: 'oldest_transaction_date', prop: 'oldestTransactionDate'},
            {name: 'institution_login_id', prop: 'institutionLoginId'},
            {name: 'last_updated_date', prop: 'lastUpdatedDate'},
            {name: 'detail_margin', prop: 'detailMargin'},
            {name: 'detail_margin_allowed', prop: 'detailMarginAllowed'},
            {name: 'detail_cash_account_allowed', prop: 'detailCashAccountAllowed'},
            {name: 'detail_description', prop: 'detailDescription'},
            {name: 'detail_margin_balance', prop: 'detailMarginBalance'},
            {name: 'detail_short_balance', prop: 'detailShortBalance'},
            {name: 'detail_available_cash_balance', prop: 'detailAvailableCashBalance'},
            {name: 'detail_current_balance', prop: 'detailCurrentBalance'},
            {name: 'detail_date_as_of', prop: 'detailDateAsOf'},
            {name: 'display_position', prop: 'displayPosition'},
            {name: 'parent_account', prop: 'parentAccount'},
            {name: 'account_nickname', prop: 'accountNickname'},
            {name: 'market_segment', prop: 'marketSegment'},
        ], {table: 'finicity_account'});
        const query = this.pgp.helpers.insert(account, cs) + 'RETURNING id;';
        const response = await this.db.query(query);
        account.id = response.id;
        return account;
    }

    upsertFinicityAccounts = async (accounts: FinicityAccount[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'finicity_user_id', prop: 'finicityUserId'},
            {name: 'finicity_institution_id', prop: 'finicityInstitutionId'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'number', prop: 'number'},
            {name: 'real_account_number_last_4', prop: 'realAccountNumberLast4'},
            {name: 'account_number_display', prop: 'accountNumberDisplay'},
            {name: 'name', prop: 'name'},
            {name: 'balance', prop: 'balance'},
            {name: 'type', prop: 'type'},
            {name: 'aggregation_status_code', prop: 'aggregationStatusCode'},
            {name: 'status', prop: 'status'},
            {name: 'customer_id', prop: 'customerId'},
            {name: 'institution_id', prop: 'institutionId'},
            {name: 'balance_date', prop: 'balanceDate'},
            {name: 'aggregation_success_date', prop: 'aggregationSuccessDate'},
            {name: 'aggregation_attempt_date', prop: 'aggregationAttemptDate'},
            {name: 'created_date', prop: 'createdDate'},
            {name: 'currency', prop: 'currency'},
            {name: 'last_transaction_date', prop: 'lastTransactionDate'},
            {name: 'oldest_transaction_date', prop: 'oldestTransactionDate'},
            {name: 'institution_login_id', prop: 'institutionLoginId'},
            {name: 'last_updated_date', prop: 'lastUpdatedDate'},
            {name: 'detail_margin', prop: 'detailMargin'},
            {name: 'detail_margin_allowed', prop: 'detailMarginAllowed'},
            {name: 'detail_cash_account_allowed', prop: 'detailCashAccountAllowed'},
            {name: 'detail_description', prop: 'detailDescription'},
            {name: 'detail_margin_balance', prop: 'detailMarginBalance'},
            {name: 'detail_short_balance', prop: 'detailShortBalance'},
            {name: 'detail_available_cash_balance', prop: 'detailAvailableCashBalance'},
            {name: 'detail_current_balance', prop: 'detailCurrentBalance'},
            {name: 'detail_date_as_of', prop: 'detailDateAsOf'},
            {name: 'display_position', prop: 'displayPosition'},
            {name: 'parent_account', prop: 'parentAccount'},
            {name: 'account_nickname', prop: 'accountNickname'},
            {name: 'market_segment', prop: 'marketSegment'},
        ], {table: 'finicity_account'});

        const query = upsertReplaceQuery(accounts, cs, this.pgp, "account_id")
        await this.db.none(query);
    }

    getFinicityAccounts = async (finicityUserId: number): Promise<FinicityAccount[]> => {
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
            WHERE finicity_user_id = $1;`
        const response = await this.db.query(query, [finicityUserId]);
        return response.map((a: any) => {
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
                updatedAt: DateTime.fromJSDate(a.updated_at),
                createdAt: DateTime.fromJSDate(a.created_at)
            }
        })
    }

    upsertFinicityHoldings = async (holdings: FinicityHolding[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'finicity_account_id', prop: 'finicityAccountId'},
            {name: 'holding_id', prop: 'holdingId'},
            {name: 'security_id_type', prop: 'securityIdType'},
            {name: 'pos_type', prop: 'posType'},
            {name: 'sub_account_type', prop: 'subAccountType'},
            {name: 'description', prop: 'description'},
            {name: 'symbol', prop: 'symbol'},
            {name: 'cusip_no', prop: 'cusipNo'},
            {name: 'current_price', prop: 'currentPrice'},
            {name: 'transaction_type', prop: 'transactionType'},
            {name: 'market_value', prop: 'marketValue'},
            {name: 'security_unit_price', prop: 'securityUnitPrice'},
            {name: 'units', prop: 'units'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'status', prop: 'status'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'security_name', prop: 'securityName'},
            {name: 'security_currency', prop: 'securityCurrency'},
            {name: 'current_price_date', prop: 'currentPriceDate'},
            {name: 'option_strike_price', prop: 'optionStrikePrice'},
            {name: 'option_type', prop: 'optionType'},
            {name: 'option_shares_per_contract', prop: 'optionSharesPerContract'},
            {name: 'options_expire_date', prop: 'optionsExpireDate'},
            {name: 'fi_asset_class', prop: 'fiAssetClass'},
            {name: 'asset_class', prop: 'assetClass'},
            {name: 'currency_rate', prop: 'currencyRate'},
            {name: 'cost_basis_per_share', prop: 'costBasisPerShare'},
            {name: 'mf_type', prop: 'mfType'},
            {name: 'total_gl_dollar', prop: 'totalGlDollar'},
            {name: 'total_gl_percent', prop: 'totalGlPercent'},
            {name: 'today_gl_dollar', prop: 'todayGlDollar'},
            {name: 'today_gl_percent', prop: 'todayGlPercent'},
        ], {table: 'finicity_holding'});
        const query = upsertReplaceQuery(holdings, cs, this.pgp, "holding_id");
        await this.db.none(query)
    }

    getFinicityHoldings = async (finicityUserId: number): Promise<FinicityHolding[]> => {
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
                         WHERE fa.finicity_user_id = $1`
        const response = await this.db.query(query, [finicityUserId])
        return response.map((h: any) => {
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
                updatedAt: DateTime.fromJSDate(h.updated_at),
                createdAt: DateTime.fromJSDate(h.created_at)
            }
        })
    }

    upsertFinicityTransactions = async (transactions: FinicityTransaction[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'internal_finicity_account_id', prop: 'internalFinicityAccountId'},
            {name: 'transaction_id', prop: 'transactionId'},
            {name: 'amount', prop: 'amount'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'customer_id', prop: 'customerId'},
            {name: 'status', prop: 'status'},
            {name: 'description', prop: 'description'},
            {name: 'memo', prop: 'memo'},
            {name: 'type', prop: 'type'},
            {name: 'unit_quantity', prop: 'unitQuantity'},
            {name: 'fee_amount', prop: 'feeAmount'},
            {name: 'cusip_no', prop: 'cusipNo'},
            {name: 'posted_date', prop: 'postedDate'},
            {name: 'transaction_date', prop: 'transactionDate'},
            {name: 'created_date', prop: 'createdDate'},
            {name: 'categorization_normalized_payee_name', prop: 'categorizationNormalizedPayeeName'},
            {name: 'categorization_category', prop: 'categorizationCategory'},
            {name: 'categorization_country', prop: 'categorizationCountry'},
            {name: 'categorization_best_representation', prop: 'categorizationBestRepresentation'},
            {name: 'commission_amount', prop: 'commissionAmount'},
            {name: 'ticker', prop: 'ticker'},
            {name: 'unit_price', prop: 'unitPrice'},
            {name: 'investment_transaction_type', prop: 'investmentTransactionType'},
        ], {table: 'finicity_transaction'})
        const query = upsertReplaceQuery(transactions, cs, this.pgp, "transaction_id")
        await this.db.none(query);
    }

    getFinicityTransactions = async (finicityUserId: number): Promise<FinicityTransaction[]> => {
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
        `
        const response = await this.db.query(query, [finicityUserId]);
        return response.map((t: any) => {
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
                updatedAt: DateTime.fromJSDate(t.updated_at),
                createdAt: DateTime.fromJSDate(t.created_at)
            }
        })
    }

    getTradingPostBrokerageAccounts = async (userId: string): Promise<TradingPostBrokerageAccountsTable[]> => {
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
        const response = await this.db.query(query, [userId]);
        return response.map((r: any) => {
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
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at)
            }
        });
    }

    addTradingPostBrokerageAccounts = async (accounts: TradingPostBrokerageAccounts[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'institution_id', prop: 'institutionId'},
            {name: 'broker_name', prop: 'brokerName'},
            {name: 'status', prop: 'status'},
            {name: 'account_number', prop: 'accountNumber'},
            {name: 'mask', prop: 'mask'},
            {name: 'name', prop: 'name'},
            {name: 'official_name', prop: 'officialName'},
            {name: 'type', prop: 'type'},
            {name: 'subtype', prop: 'subtype'},
        ], {table: 'tradingpost_brokerage_account'})
        const query = this.pgp.helpers.insert(accounts, cs);
        await this.db.none(query);
    }

    upsertTradingPostBrokerageAccounts = async (accounts: TradingPostBrokerageAccounts[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'institution_id', prop: 'institutionId'},
            {name: 'broker_name', prop: 'brokerName'},
            {name: 'status', prop: 'status'},
            {name: 'account_number', prop: 'accountNumber'},
            {name: 'mask', prop: 'mask'},
            {name: 'name', prop: 'name'},
            {name: 'official_name', prop: 'officialName'},
            {name: 'type', prop: 'type'},
            {name: 'subtype', prop: 'subtype'},
        ], {table: 'tradingpost_brokerage_account'})
        const query = upsertReplaceQuery(accounts, cs, this.pgp, "user_id,institution_id,account_number");
        await this.db.none(query);
    }

    addTradingPostAccountGroups = async (accountGroups: TradingPostAccountGroups[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'name', prop: 'name'},
            {name: 'default_benchmark_id', prop: 'defaultBenchmarkId'},
        ], {table: 'tradingpost_account_group'})
        const query = this.pgp.helpers.insert(accountGroups, cs);
        await this.db.none(query);
    }

    getTradingPostAccountGroups = async (userId: string): Promise<TradingPostAccountGroups[]> => {
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
        const response = await this.db.any(query, [userId]);
        if (!response || response.length <= 0) {
            throw new Error(`Failed to get account groups for userId: ${userId}`);
        }

        let accountGroups: TradingPostAccountGroups[] = [];

        for (let d of response) {
            accountGroups.push({
                accountGroupId: parseInt(d.account_group_id),
                accountId: parseInt(d.account_id),
                userId: d.user_id,
                name: d.name,
                defaultBenchmarkId: parseInt(d.default_benchmark_id),

            })
        }
        return accountGroups;
    }

    addTradingPostAccountGroup = async (userId: string, name: string, accountIds: number[], defaultBenchmarkId: number): Promise<number> => {
        let query = `INSERT INTO tradingpost_account_group(user_id, name, default_benchmark_id)
                     VALUES ($1, $2, $3)
                     ON CONFLICT ON CONSTRAINT name_userid_unique DO UPDATE SET name = EXCLUDED.name
                     RETURNING id;`;

        const accountGroupIdResults = await this.db.any(query, [userId, name, defaultBenchmarkId]);
        if (accountGroupIdResults.length <= 0) return 0

        const accountGroupId = accountGroupIdResults[0].id;

        let values: { account_id: number, account_group_id: number }[] = accountIds.map(accountId => ({
            account_id: accountId,
            account_group_id: accountGroupId
        }));

        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'account_id'},
            {name: 'account_group_id', prop: 'account_group_id'},
        ], {table: '_tradingpost_account_to_group'});
        const accountGroupsQuery = this.pgp.helpers.insert(values, cs) + ' ON CONFLICT DO NOTHING';
        const result = await this.db.result(accountGroupsQuery);
        return result.rowCount > 0 ? 1 : 0;
    }

    addTradingPostCurrentHoldings = async (currentHoldings: TradingPostCurrentHoldings[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'price', prop: 'price'},
            {name: 'price_as_of', prop: 'priceAsOf'},
            {name: 'price_source', prop: 'priceSource'},
            {name: 'value', prop: 'value'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'currency', prop: 'currency'},
        ], {table: 'tradingpost_current_holding'})
        const query = upsertReplaceQuery(currentHoldings, cs, this.pgp, "account_id,security_id");
        await this.db.none(query);
    }

    upsertTradingPostCurrentHoldings = async (currentHoldings: TradingPostCurrentHoldings[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'price', prop: 'price'},
            {name: 'price_as_of', prop: 'priceAsOf'},
            {name: 'price_source', prop: 'priceSource'},
            {name: 'value', prop: 'value'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'currency', prop: 'currency'},
        ], {table: 'tradingpost_current_holding'})
        const query = upsertReplaceQuery(currentHoldings, cs, this.pgp, "account_id,security_id");
        await this.db.none(query);
    }

    addTradingPostHistoricalHoldings = async (historicalHoldings: TradingPostHistoricalHoldings[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'price', prop: 'price'},
            {name: 'price_as_of', prop: 'priceAsOf'},
            {name: 'price_source', prop: 'priceSource'},
            {name: 'value', prop: 'value'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'currency', prop: 'currency'},
            {name: 'date', prop: 'date'},
        ], {table: 'tradingpost_historical_holding'})
        const query = this.pgp.helpers.insert(historicalHoldings, cs)
        await this.db.none(query);
    }

    upsertTradingPostHistoricalHoldings = async (historicalHoldings: TradingPostHistoricalHoldings[]) => {
        if (historicalHoldings.length <= 0) return
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'price', prop: 'price'},
            {name: 'price_as_of', prop: 'priceAsOf'},
            {name: 'price_source', prop: 'priceSource'},
            {name: 'value', prop: 'value'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'currency', prop: 'currency'},
            {name: 'date', prop: 'date'},
        ], {table: 'tradingpost_historical_holding'})
        const query = upsertReplaceQuery(historicalHoldings, cs, this.pgp)
        await this.db.none(query);
    }

    addTradingPostCustomIndustries = async (customIndustries: TradingPostCustomIndustry[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'industry', prop: 'industry'},
        ]);
        const query = this.pgp.helpers.insert(customIndustries, cs);
        await this.db.none(query)
    }

    addTradingPostTransactions = async (transactions: TradingPostTransactions[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'date', prop: 'date'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'price', prop: 'price'},
            {name: 'amount', prop: 'amount'},
            {name: 'fees', prop: 'fees'},
            {name: 'type', prop: 'type'},
            {name: 'currency', prop: 'currency'}
        ], {table: 'tradingpost_transaction'});
        const query = this.pgp.helpers.insert(transactions, cs);
        await this.db.none(query)
    }

    upsertTradingPostTransactions = async (transactions: TradingPostTransactions[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'date', prop: 'date'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'price', prop: 'price'},
            {name: 'amount', prop: 'amount'},
            {name: 'fees', prop: 'fees'},
            {name: 'type', prop: 'type'},
            {name: 'currency', prop: 'currency'}
        ], {table: 'tradingpost_transaction'});
        const query = upsertReplaceQuery(transactions, cs, this.pgp, 'account_id, security_id, date, quantity');
        await this.db.none(query)
    }

    addTradingPostAccountGroupStats = async (groupStats: TradingPostAccountGroupStats[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_group_id', prop: 'accountGroupId'},
            {name: 'beta', prop: 'beta'},
            {name: 'sharpe', prop: 'sharpe'},
            {name: 'industry_allocations', prop: 'industryAllocations'},
            {name: 'exposure', prop: 'exposure'},
            {name: 'date', prop: 'date'},
            {name: 'benchmark_id', prop: 'benchmarkId'}
        ], {table: 'tradingpost_account_group_stat'})
        const query = this.pgp.helpers.insert(groupStats, cs);
        await this.db.none(query);
    }

    addTradingPostAccountToAccountGroup = async (accountToAccountGroups: TradingPostAccountToAccountGroup[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'account_group_id', prop: 'accountGroupId'}
        ], {table: '_tradingpost_account_to_group'});
        const query = this.pgp.helpers.insert(accountToAccountGroups, cs);
        await this.db.none(query);
    }

    getTradingPostHoldingsByAccount = async (userId: string, accountId: number, startDate: DateTime, endDate: DateTime): Promise<HistoricalHoldings[]> => {
        let query = `SELECT account_id,
                            security_id,
                            price,
                            value,
                            cost_basis,
                            (price - cost_basis) / cost_basis as pnl,
                            quantity,
                            date
                     FROM tradingpost_historical_holding
                     WHERE account_id = $1
                       AND date BETWEEN $2 AND $3
        `;

        const response = await this.db.any(query, [accountId, startDate, endDate]);
        if (!response || response.length <= 0) {
            throw new Error(`Failed to get current holdings for userId: ${userId} and  accountId: ${accountId}`);
        }
        ;
        let holdings: HistoricalHoldings[] = [];

        for (let d of response) {
            holdings.push({
                accountId: d.account_id,
                securityId: parseInt(d.security_id),
                price: parseFloat(d.price),
                value: parseFloat(d.value),
                costBasis: parseFloat(d.cost_basis),
                pnl: parseFloat(d.pnl),
                quantity: parseFloat(d.quantity),
                date: d.date
            })
        }

        return holdings;
    }

    getTradingPostHoldingsByAccountGroup = async (userId: string, accountGroupId: number, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<HistoricalHoldings[]> => {
        let query = `SELECT atg.account_group_id                                  AS account_group_id,
                            ht.security_id                                        AS security_id,
                            AVG(ht.price)                                         AS price,
                            SUM(ht.value)                                         AS value,
                            SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity)   AS cost_basis,
                            (AVG(ht.price) - (SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity))) /
                            (SUM(ht.cost_basis * ht.quantity) / SUM(ht.quantity)) AS pnl,
                            SUM(ht.quantity)                                      AS quantity,
                            ht.date                                               AS date
                     FROM tradingpost_historical_holding ht
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON ht.account_id = atg.account_id
                     WHERE atg.account_group_id = $1
                       AND ht.date BETWEEN $2 AND $3
                     GROUP BY atg.account_group_id, ht.security_id, ht.date`;
        const response = await this.db.any(query, [accountGroupId, startDate, endDate]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get historical holdings for accountGroupId: ${accountGroupId}`);
        }

        let holdings: HistoricalHoldings[] = [];

        for (let d of response) {
            holdings.push({
                accountGroupId: parseInt(d.account_group_id),
                securityId: parseInt(d.security_id),
                price: parseFloat(d.price),
                value: parseFloat(d.value),
                costBasis: parseFloat(d.cost_basis),
                pnl: parseFloat(d.pnl),
                quantity: parseFloat(d.quantity),
                date: d.date
            })
        }

        return holdings;
    }

    getTradingPostCurrentHoldingsByAccountGroup = async (accountGroupId: number): Promise<HistoricalHoldings[]> => {
        let query = `SELECT atg.account_group_id                                  AS account_group_id,
                            ch.security_id                                        AS security_id,
                            AVG(ch.price)                                         AS price,
                            SUM(ch.value)                                         AS value,
                            SUM(ch.cost_basis * ch.quantity) / SUM(ch.quantity)   AS cost_basis,
                            (AVG(ch.price) - (SUM(ch.cost_basis * ch.quantity) / SUM(ch.quantity))) /
                            (SUM(ch.cost_basis * ch.quantity) / SUM(ch.quantity)) AS pnl,
                            SUM(ch.quantity)                                      AS quantity,
                            ch.updated_at                                         AS updated_at
                     FROM tradingpost_current_holding ch
                              LEFT JOIN _tradingpost_account_to_group atg
                                        ON ch.account_id = atg.account_id
                     WHERE atg.account_group_id = $1
                     GROUP BY atg.account_group_id, ch.security_id, ch.updated_at`;
        const response = await this.db.any(query, [accountGroupId]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get current holdings for accountGroupId: ${accountGroupId}`);
        }

        let holdings: HistoricalHoldings[] = [];

        for (let d of response) {
            holdings.push({
                accountGroupId: parseInt(d.account_group_id),
                securityId: parseInt(d.security_id),
                price: parseFloat(d.price),
                value: parseFloat(d.value),
                costBasis: parseFloat(d.cost_basis),
                pnl: parseFloat(d.pnl),
                quantity: parseFloat(d.quantity),
                date: d.updated_at
            })
        }

        return holdings;
    }

    getTradingPostAccountGroupReturns = async (accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]> => {
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
        const response = await this.db.any(query, [accountGroupId, startDate, endDate]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get returns for accountGroupId: ${accountGroupId}`);
        }
        ;
        let holdingPeriodReturns: AccountGroupHPRsTable[] = []
        for (let d of response) {
            holdingPeriodReturns.push({
                id: parseInt(d.id),
                accountGroupId: parseInt(d.account_group_id),
                date: d.date,
                return: parseFloat(d.return),
                created_at: d.created_at,
                updated_at: d.updated_at
            })
        }
        return holdingPeriodReturns;
    }

    getDailySecurityPrices = async (securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]> => {
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
        const response = await this.db.any(query, [securityId, startDate, endDate]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get prices for securityId: ${securityId}`);
        }
        ;
        let prices: SecurityPrices[] = [];

        for (let d of response) {
            prices.push({
                securityId: parseInt(d.security_id),
                price: parseFloat(d.price),
                date: d.time
            });
        }
        return prices;
    }

    getSecurities = async (securityIds: number[]): Promise<GetSecurityBySymbol[]> => {
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
        const response = await this.db.query(query, [securityIds])
        if (!response || response.length <= 0) {
            throw new Error(`Failed to get security info for securityIds: ${securityIds}`);
        }
        ;

        let sec: GetSecurityBySymbol[] = []
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
            })
        }

        return sec;
    }

    getAccountGroupHPRsLatestDate = async (accountGroupId: number): Promise<any> => {
        let query = `SELECT max(date)
                     FROM account_group_hpr
                     WHERE account_group_id = $1`;
        const latestDate = await this.db.one(query, [accountGroupId]);

        return latestDate.max;
    }

    addAccountGroupReturns = async (accountGroupReturns: AccountGroupHPRs[]): Promise<number> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_group_id', prop: 'accountGroupId'},
            {name: 'date', prop: 'date'},
            {name: 'return', prop: 'return'},
        ], {table: 'account_group_hpr'})
        const query = upsertReplaceQueryWithColumns(accountGroupReturns, cs, this.pgp, ["return"],
            "account_group_hpr_account_group_id_date_idx")
        const result = await this.db.result(query)
        return result.rowCount > 0 ? 1 : 0
    }

    addBenchmarkReturns = async (benchmarkReturns: SecurityHPRs[]): Promise<number> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'date', prop: 'date'},
            {name: 'return', prop: 'return'}
        ], {table: 'benchmark_hpr'});

        const query = upsertReplaceQueryWithColumns(benchmarkReturns, cs, this.pgp, ["return"],
            "benchmark_hpr_security_id_date_key")
        const result = await this.db.result(query);
        return result.rowCount > 0 ? 1 : 0
    }

    addAccountGroupSummary = async (accountGroupSummary: TradingPostAccountGroupStats): Promise<number> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_group_id', prop: 'accountGroupId'},
            {name: 'beta', prop: 'beta'},
            {name: 'sharpe', prop: 'sharpe'},
            {name: 'industry_allocations', prop: 'industryAllocations'},
            {name: 'exposure', prop: 'exposure'},
            {name: 'date', prop: 'date'},
            {name: 'benchmark_id', prop: 'benchmarkId'}
        ], {table: 'tradingpost_account_group_stat'})

        const query = upsertReplaceQueryWithColumns(accountGroupSummary, cs, this.pgp,
            ["beta", "sharpe", "industry_allocations", "exposure", "date", "benchmark_id"],
            "tradingpost_account_group_stat_account_group_id_date_idx");
        const result = await this.db.result(query);
        return result.rowCount > 0 ? 1 : 0
    }

    getAccountGroupSummary = async (accountGroupId: number): Promise<TradingPostAccountGroupStats> => {
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
        const result = await this.db.one(query, [accountGroupId]);

        const summary: TradingPostAccountGroupStats = {
            accountGroupId: result.account_group_id,
            beta: result.beta,
            sharpe: result.sharpe,
            industryAllocations: result.industry_allocations,
            exposure: result.exposure,
            date: result.date,
            benchmarkId: result.benchmark_id
        }
        return summary;
    }

    deleteFinicityHoldings = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM FINICITY_HOLDING
                       WHERE finicity_account_id IN ($1:list);`;
        await this.db.none(query, [accountIds])
    }

    deleteFinicityTransactions = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM FINICITY_TRANSACTION
                       WHERE internal_finicity_account_id IN ($1:list);`;
        await this.db.none(query, [accountIds])
    }

    deleteFinicityAccounts = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM finicity_account
                       WHERE id IN ($1:list);`;
        await this.db.none(query, [accountIds]);
    }

    deleteTradingPostBrokerageAccounts = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM tradingpost_brokerage_account
                       WHERE id IN ($1:list)`
        await this.db.none(query, [accountIds])
    }

    deleteTradingPostBrokerageTransactions = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM tradingpost_transaction
                       WHERE account_id IN ($1:list)`
        await this.db.none(query, [accountIds]);
    }

    deleteTradingPostBrokerageHoldings = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM TRADINGPOST_CURRENT_HOLDING
                       WHERE account_id IN ($1:list)`
        await this.db.none(query, [accountIds]);
    }

    deleteTradingPostBrokerageHistoricalHoldings = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM TRADINGPOST_HISTORICAL_HOLDING
                       WHERE account_id IN ($1:list)`
        await this.db.none(query, [accountIds]);
    }
}

function upsertReplaceQuery(data: any, cs: ColumnSet, pgp: IMain, conflict: string = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`;
        }).join()
}

function upsertReplaceQueryWithColumns(data: any, cs: ColumnSet, pgp: IMain, columns: string[], conflict: string = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        columns.map(col => {
            return `${col}=EXCLUDED.${col}`
        }).join();
}