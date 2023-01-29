import {
    AccountGroupHPRs,
    AccountGroupHPRsTable,
    FinicityAccount,
    FinicityHolding,
    FinicityInstitution,
    FinicityTransaction,
    FinicityUser,
    GetSecurityBySymbol,
    GetSecurityPrice,
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
    TradingPostCurrentHoldingsTable,
    TradingPostCurrentHoldingsTableWithSecurity,
    TradingPostCustomIndustry,
    TradingPostHistoricalHoldings,
    TradingPostInstitution,
    TradingPostInstitutionTable,
    TradingPostInstitutionWithFinicityInstitutionId,
    TradingPostTransactions,
    TradingPostTransactionsTable,
    TradingPostUser,
    TradingPostCashSecurity,
    FinicityAccountAndInstitution,
    FinicityAndTradingpostBrokerageAccount,
    OptionContract,
    OptionContractTable,
    IbkrAccountTable,
    IbkrAccount,
    IbkrSecurity,
    IbkrActivity,
    IbkrCashReport,
    IbkrNav,
    IbkrPl,
    IbkrPosition,
    TradingPostCurrentHoldingsTableWithMostRecentHolding,
    SecurityTableWithLatestPriceRobinhoodId,
    TradingPostTransactionsByAccountGroup,
    BrokerageTask,
    BrokerageTaskTable,
    BrokerageTaskStatusType, DirectBrokeragesType, BrokerageTaskType
} from "./interfaces";
import {ColumnSet, IDatabase, IMain} from "pg-promise";
import {DateTime} from "luxon";
import {addSecurity, getUSExchangeHoliday} from "../market-data/interfaces";
import security from "../api/entities/extensions/Security";
import {
    OptionContractTableWithRobinhoodId,
    RobinhoodAccount,
    RobinhoodAccountTable,
    RobinhoodInstrument, RobinhoodInstrumentTable, RobinhoodOption, RobinhoodOptionTable,
    RobinhoodPosition, RobinhoodTransaction,
    RobinhoodUser, RobinhoodUserTable
} from "./robinhood/interfaces";
import brokerage from "../api/entities/extensions/Brokerage";

export default class Repository implements IBrokerageRepository, ISummaryRepository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }

    updateErrorStatusOfAccount = async (accountId: number, error: boolean, errorCode: number): Promise<void> => {
        const query = `UPDATE tradingpost_brokerage_account
                       SET error      = $1,
                           error_code = $2
                       WHERE id = $3`;
        await this.db.none(query, [error, errorCode, accountId])
    }

    updateTradingPostBrokerageAccountLastUpdated = async (userId: string, brokerageUserId: string, brokerageName: string): Promise<DateTime> => {
        const query = `UPDATE tradingpost_brokerage_account
                       SET updated_at = NOW()
                       WHERE user_id = $1
                         AND account_number = $2
                         AND broker_name = $3 RETURNING updated_at;`
        const res = await this.db.oneOrNone(query, [userId, brokerageUserId, brokerageName]);
        if (!res) throw new Error("could not update brokerage account last_updated");
        return DateTime.fromJSDate(res.updated_at);
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

    getFinicityAccountByTradingpostBrokerageAccountId = async (tpBrokerageAccountId: number): Promise<FinicityAndTradingpostBrokerageAccount | null> => {
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
            WHERE tba.id = $1;`
        const response = await this.db.one(query, [tpBrokerageAccountId]);
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
        }
    }

    getFinicityAccountByFinicityAccountId = async (finicityAccountId: string): Promise<FinicityAccountAndInstitution> => {
        const query = `SELECT fa.id             AS internal_account_id,
                              fa.account_id     AS finicity_account_id,
                              fa.customer_id    AS finicity_customer_id,
                              fi.name           AS finicity_institution_name,
                              fi.institution_id AS finicity_institution_id
                       FROM FINICITY_ACCOUNT FA
                                INNER JOIN FINICITY_INSTITUTION FI ON
                           fa.FINICITY_INSTITUTION_ID = fi.id
                       WHERE fa.account_id = $1;`
        const response = await this.db.one(query, [finicityAccountId]);
        return {
            id: response.id,
            finicityAccountId: response.finicity_account_id,
            finicityCustomerId: response.finicity_customer_id,
            institutionName: response.finicity_institution_name,
            finicityInstitutionId: response.finicity_institution_id
        }
    }

    getSecurityPricesWithEndDateBySecurityIds = async (startDate: DateTime, endDate: DateTime, securityIds: number[]): Promise<GetSecurityPrice[]> => {
        const query = `SELECT id,
                              security_id,
                              price, time, high, low, open, created_at
                       FROM security_price
                       WHERE is_eod = true
                         AND time >= $1
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
        const response = await this.db.query(`SELECT id, date, settlement_date, created_at
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

    getTradingPostBrokerageAccountByUser = async (tpUserId: string, brokerageName: string, accountNumber: string): Promise<TradingPostBrokerageAccountsTable | null> => {
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
                         AND broker_name = $2
                         AND account_number = $3;`
        const result = await this.db.oneOrNone(query, [tpUserId, brokerageName, accountNumber]);
        if (!result) return null;

        return {
            name: result.name,
            status: result.status,
            createdAt: DateTime.fromJSDate(result.created_at),
            updatedAt: DateTime.fromJSDate(result.updated_at),
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
        }
    }

    getTradingPostBrokerageAccount = async (accountId: number, tpUserId?: string, brokerageName?: string): Promise<TradingPostBrokerageAccountsTable> => {
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
                       WHERE id = $1;`
        const result = await this.db.oneOrNone(query, [accountId])
        return {
            name: result.name,
            status: result.status,
            createdAt: DateTime.fromJSDate(result.created_at),
            updatedAt: DateTime.fromJSDate(result.updated_at),
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
                   s.symbol,
                   tch.option_id,
                   tch.holding_date
            FROM tradingpost_current_holding tch
                     LEFT JOIN security s ON s.id = tch.security_id
            WHERE tch.account_id = $1`
        const result = await this.db.query(query, [accountId]);
        return result.map((row: any) => {
            let o: TradingPostCurrentHoldingsTableWithSecurity = {
                holdingDate: DateTime.fromJSDate(row.holding_date),
                optionId: row.option_id,
                symbol: row.symbol,
                accountId: row.account_id,
                id: row.id,
                updated_at: DateTime.fromJSDate(row.updated_at),
                created_at: DateTime.fromJSDate(row.create_at),
                costBasis: row.cost_basis,
                currency: row.currency,
                price: row.price,
                priceAsOf: DateTime.fromJSDate(row.price_as_of),
                securityId: row.security_id,
                priceSource: row.price_source,
                quantity: row.quantity,
                securityType: row.security_type,
                value: row.value
            }
            return o
        })
    }

    getTradingPostBrokerageWithMostRecentHolding = async (tpUserId: string, brokerage: string): Promise<TradingPostCurrentHoldingsTableWithMostRecentHolding[]> => {
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
        const result = await this.db.query(query, [tpUserId, brokerage]);
        return result.map((row: any) => {
            let o: TradingPostCurrentHoldingsTableWithMostRecentHolding = {
                mostRecentHolding: DateTime.fromJSDate(row.most_recent_holding),
                id: row.id,
                name: row.name,
                status: row.status,
                createdAt: DateTime.fromJSDate(row.created_at),
                userId: row.user_id,
                mask: row.mask,
                accountNumber: row.account_number,
                type: row.type,
                updatedAt: DateTime.fromJSDate(row.updated_at),
                error: row.error,
                brokerName: row.broker_name,
                errorCode: row.error_code,
                subtype: row.subtype,
                institutionId: row.institution_id,
                officialName: row.official_name,
                accountStatus: row.account_status
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
                   created_at,
                   option_id,
                   holding_date
            FROM tradingpost_current_holding
            WHERE account_id = $1`;
        const result = await this.db.query(query, [accountId]);
        return result.map((row: any) => {
            let o: TradingPostCurrentHoldingsTable = {
                holdingDate: DateTime.fromJSDate(row.holding_date),
                optionId: row.option_id,
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
                   security_type, date, quantity, price, amount, fees, type, currency, updated_at, created_at, option_id
            FROM tradingpost_transaction
            WHERE account_id = $1
            ORDER BY date DESC;`
        const response = await this.db.query(query, [accountId]);
        return response.map((row: any) => {
            let o: TradingPostTransactionsTable = {
                optionId: row.option_id,
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
                errorCode: r.error_code,
                error: r.error,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
                hiddenForDeletion: r.hidden_for_deletion,
                accountStatus: r.account_status,
                authenticationService: r.authentication_service
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

    getTradingpostCashSecurity = async (): Promise<TradingPostCashSecurity[]> => {
        const query = `SELECT s.id                  as security_id,
                              cs.from_symbol        as from_symbol,
                              cs.to_security_symbol as to_security_symbol,
                              cs.currency
                       FROM tradingpost_cash_security cs
                                LEFT JOIN security s
                                          ON s.symbol = cs.to_security_symbol;
        `;
        const response = await this.db.query(query);
        return response.map((r: any) => {
            let o: TradingPostCashSecurity = {
                fromSymbol: r.from_symbol,
                toSecurityId: parseInt(r.security_id),
                currency: r.currency
            }
            return o
        })
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

    getInstitutionByName = async (name: string): Promise<TradingPostInstitutionTable | null> => {
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
            WHERE name = $1;`
        const r = await this.db.oneOrNone(query, [name]);
        if (r === null) return null;
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
            updatedAt: DateTime.fromJSDate(r.updated_at),
            createdAt: DateTime.fromJSDate(r.created_at)
        }
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
                               $20) RETURNING id;`
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

    getFinicityUsers = async (): Promise<FinicityUser[]> => {
        const query = `SELECT id, tp_user_id, customer_id, type, updated_at, created_at
                       FROM finicity_user;`;
        const response = await this.db.query(query);
        return response.map((r: any) => {
            let o: FinicityUser = {
                tpUserId: r.tp_user_id,
                createdAt: DateTime.fromJSDate(r.created_at),
                id: r.id,
                type: r.type,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                customerId: r.customer_id
            }
            return o;
        });
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

    getFinicityUserByFinicityUserId = async (userId: string): Promise<FinicityUser | null> => {
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

    addFinicityUser = async (userId: string, customerId: string, type: string): Promise<FinicityUser> => {
        const query = `INSERT INTO finicity_user(tp_user_id, customer_id, type)
                       VALUES ($1, $2, $3) ON CONFLICT(customer_id) DO
        UPDATE SET tp_user_id=EXCLUDED.tp_user_id,
            type =EXCLUDED.type
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
            {name: 'tx_push_id', prop: 'txPushId'},
            {name: 'tx_push_signing_key', prop: 'txPushSigningKey'}
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
                   created_at,
                   tx_push_id,
                   tx_push_signing_key
            FROM finicity_account
            WHERE finicity_user_id = $1;`
        const response = await this.db.query(query, [finicityUserId]);

        return response.map((a: any) => {
            let o: FinicityAccount = {
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
                createdAt: DateTime.fromJSDate(a.created_at),
                txPushId: a.tx_push_id,
                txPushSigningKey: a.tx_push_signing_key
            }
            return o
        })
    }

    getFinicityAccountDetails = async (finicityUserId: number): Promise<FinicityAccount[]> => {
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
            WHERE finicity_user_id = $1;`
        const response = await this.db.query(query, [finicityUserId]);
        return response.map((a: any) => {
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
            }
        })
    }

    upsertFinicityHoldings = async (holdings: FinicityHolding[]): Promise<void> => {
        if (holdings.length <= 0) return;
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
            {name: 'options_expire_date', prop: 'optionExpiredate'},
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
        if (transactions.length <= 0) return
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
        `
        const response = await this.db.query(query, [finicityUserId]);
        return response.map((t: any) => {
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
                              created_at,
                              error,
                              error_code,
                              hidden_for_deletion,
                              account_status,
                              authentication_service
                       FROM tradingpost_brokerage_account
                       WHERE user_id = $1`;
        const response = await this.db.query(query, [userId]);
        return response.map((r: any) => {
            let x: TradingPostBrokerageAccountsTable = {
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
                createdAt: DateTime.fromJSDate(r.created_at),
                hiddenForDeletion: r.hidden_for_deletion,
                errorCode: r.error_code,
                error: r.error,
                accountStatus: r.account_status,
                authenticationService: r.authentication_service
            }
            return x;
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
            {name: 'hidden_for_deletion', prop: 'hiddenForDeletion'},
            {name: 'account_status', prop: 'accountStatus'},
            {name: 'authentication_service', prop: 'authenticationService'}
        ], {table: 'tradingpost_brokerage_account'})
        const query = this.pgp.helpers.insert(accounts, cs);
        await this.db.none(query);
    }

    upsertTradingPostBrokerageAccounts = async (accounts: TradingPostBrokerageAccounts[]): Promise<number[]> => {
        if (accounts.length <= 0) return [];
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
            {name: "updated_at", prop: "updatedAt"},
            {name: 'hidden_for_deletion', prop: 'hiddenForDeletion'},
            {name: 'account_status', prop: 'accountStatus'},
            {name: 'authentication_service', prop: 'authenticationService'}
        ], {table: 'tradingpost_brokerage_account'})
        const newAccounts = accounts.map(acc => ({...acc, updatedAt: DateTime.now()}));
        const query = upsertReplaceQuery(newAccounts, cs, this.pgp, "user_id,institution_id,account_number") + ` RETURNING id`;
        const response = await this.db.query(query);
        if (!response || response.length <= 0) return [];
        return response.map((r: any) => r.id);
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

    deleteTradingPostAccountCurrentHoldings = async (accountIds: number[]): Promise<void> => {
        if (accountIds.length <= 0) return;
        const query = `DELETE
                       FROM tradingpost_current_holding
                       WHERE account_id IN ($1:list);`
        await this.db.none(query, [accountIds])
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
                     VALUES ($1, $2, $3) ON CONFLICT
                     ON CONSTRAINT name_userid_unique DO
        UPDATE SET name = EXCLUDED.name
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

        if (values.length <= 0) return 0

        const accountGroupsQuery = this.pgp.helpers.insert(values, cs) + ' ON CONFLICT DO NOTHING';
        const result = await this.db.result(accountGroupsQuery);
        return result.rowCount > 0 ? 1 : 0;
    }

    upsertTradingPostCurrentHoldings = async (currentHoldings: TradingPostCurrentHoldings[]): Promise<void> => {
        if (currentHoldings.length <= 0) return;
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
            {name: 'option_id', prop: 'optionId'},
            {name: 'holding_date', prop: 'holdingDate'}
        ], {table: 'tradingpost_current_holding'})
        const query = upsertReplaceQuery(currentHoldings, cs, this.pgp, "account_id, security_id, coalesce (option_id, -1)");
        await this.db.none(query);
    }

    addTradingPostHistoricalHoldings = async (historicalHoldings: TradingPostHistoricalHoldings[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'option_id', prop: 'optionId'},
            {name: 'security_type', prop: 'securityType'},
            {name: 'price', prop: 'price'},
            {name: 'price_as_of', prop: 'priceAsOf'},
            {name: 'price_source', prop: 'priceSource'},
            {name: 'value', prop: 'value'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'currency', prop: 'currency'},
            {name: 'date', prop: 'date'},
            {name: 'option_id', prop: 'optionId'}
        ], {table: 'tradingpost_historical_holding'})
        const query = this.pgp.helpers.insert(historicalHoldings, cs)
        await this.db.none(query);
    }

    upsertTradingPostHistoricalHoldings = async (historicalHoldings: TradingPostHistoricalHoldings[]) => {
        if (historicalHoldings.length <= 0) return
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'option_id', prop: 'optionId'},
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
        const query = upsertReplaceQuery(historicalHoldings, cs, this.pgp, 'account_id, security_id, coalesce(option_id,-1), date, price')
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
            {name: 'currency', prop: 'currency'},
            {name: 'option_id', prop: 'optionId'}
        ], {table: 'tradingpost_transaction'});
        const query = this.pgp.helpers.insert(transactions, cs);
        await this.db.none(query)
    }

    getOldestTransaction = async (accountId: number): Promise<TradingPostTransactions | null> => {
        const r = await this.db.oneOrNone(`SELECT id,
                                                  account_id,
                                                  security_id,
                                                  security_type, date, quantity, price, amount, fees, type, currency, updated_at, created_at, option_id
                                           FROM tradingpost_transaction
                                           WHERE account_id = $1
                                           ORDER BY date ASC
                                               LIMIT 1;`, accountId)
        if (!r) return null
        return {
            optionId: r.option_id,
            accountId: r.account_id,
            amount: r.amount,
            fees: r.fees,
            type: r.type,
            currency: r.currency,
            date: DateTime.fromJSDate(r.date),
            quantity: r.quantity,
            price: r.price,
            securityId: r.security_id,
            securityType: r.security_type,
        }
    }

    upsertTradingPostTransactions = async (transactions: TradingPostTransactions[]) => {
        if (transactions.length <= 0) return;
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
            {name: 'currency', prop: 'currency'},
            {name: 'option_id', prop: 'optionId'}
        ], {table: 'tradingpost_transaction'});
        const query = upsertReplaceQuery(transactions, cs, this.pgp, 'account_id, security_id, coalesce (option_id, -1), type, date, price');
        await this.db.none(query)
    }

    addTradingPostAccountGroupStats = async (groupStats: TradingPostAccountGroupStats[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_group_id', prop: 'accountGroupId'},
            {name: 'beta', prop: 'beta',},
            {name: 'sharpe', prop: 'sharpe'},
            {name: 'industry_allocations', prop: 'industryAllocations', mod: ':json'},
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
                            quantity, date
                     FROM tradingpost_historical_holding
                     WHERE account_id = $1
                       AND date BETWEEN $2
                       AND $3
                     ORDER BY value desc
        `;

        const response = await this.db.any(query, [accountId, startDate, endDate]);
        if (!response || response.length <= 0) {
            throw new Error(`Failed to get current holdings for userId: ${userId} and  accountId: ${accountId}`);
        }

        let holdings: HistoricalHoldings[] = [];

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
            })
        }

        return holdings;
    }

    getTradingPostHoldingsByAccountGroup = async (userId: string, accountGroupId: number, startDate: DateTime, endDate: DateTime = DateTime.now()): Promise<HistoricalHoldings[]> => {
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
        const response = await this.db.any(query, [accountGroupId, startDate, endDate]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get historical holdings for accountGroupId: ${accountGroupId}`);
        }

        let holdings: HistoricalHoldings[] = [];

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
            })
        }

        return holdings;
    }

    getTradingPostCurrentHoldingsByAccountGroup = async (accountGroupId: number): Promise<HistoricalHoldings[]> => {
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
        let holdings: HistoricalHoldings[] = [];
        if (!accountGroupId) {
            return holdings;
        }
        const response = await this.db.any(query, [accountGroupId]);

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
            })
        }

        return holdings;
    }
    getTradingPostTransactionsByAccountGroup = async (accountGroupId: number, paging: { limit: number, offset: number } | undefined, cash?: boolean): Promise<TradingPostTransactionsByAccountGroup[]> => {
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
        let trades: TradingPostTransactionsByAccountGroup[] = []
        if (!accountGroupId) {
            return trades;
        }
        let response: any[];
        let includedTypes = ['buy', 'sell', 'short', 'cover'];
        if (cash) {
            includedTypes.push('cash')
        }
        let params = [accountGroupId, includedTypes]
        if (paging) {
            query += `LIMIT $3
                      OFFSET $4`
            params.push(...[paging.limit, paging.offset * paging.limit])
        }
        response = await this.db.any(query, params);
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
                date: DateTime.fromJSDate(d.date),
                quantity: parseFloat(d.quantity),
                price: parseFloat(d.price),
                amount: parseFloat(d.amount), // (quantity * price) + fees
                fees: parseFloat(d.fees),
                type: d.type,
                currency: d.currency
            })
        }
        return trades;
    }

    getTradingPostAccountGroupReturns = async (accountGroupId: number, startDate: DateTime, endDate: DateTime): Promise<AccountGroupHPRsTable[]> => {
        let query = `SELECT id,
                            account_group_id, date, return, created_at, updated_at
                     FROM account_group_hpr
                     WHERE account_group_id = $1
                       AND date BETWEEN $2
                       AND $3
                     ORDER BY date;`;
        const response = await this.db.any(query, [accountGroupId, startDate, endDate]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get returns for accountGroupId: ${accountGroupId}`);
        }

        let holdingPeriodReturns: AccountGroupHPRsTable[] = []
        for (let d of response) {
            holdingPeriodReturns.push({
                id: parseInt(d.id),
                accountGroupId: parseInt(d.account_group_id),
                date: DateTime.fromJSDate(d.date),
                return: parseFloat(d.return),
                created_at: DateTime.fromJSDate(d.created_at),
                updated_at: DateTime.fromJSDate(d.updated_at)
            })
        }

        return holdingPeriodReturns;
    }

    getDailySecurityPrices = async (securityId: number, startDate: DateTime, endDate: DateTime): Promise<SecurityPrices[]> => {
        let query = `SELECT id,
                            security_id,
                            price, time, created_at
                     FROM security_price
                     WHERE security_id = $1
                       AND time BETWEEN $2
                       AND $3
                       AND is_eod = true;
        `;
        const response = await this.db.any(query, [securityId, startDate, endDate]);

        if (!response || response.length <= 0) {
            throw new Error(`Failed to get prices for securityId: ${securityId}`);
        }

        let prices: SecurityPrices[] = [];

        for (let d of response) {
            prices.push({
                securityId: parseInt(d.security_id),
                price: parseFloat(d.price),
                date: DateTime.fromJSDate(d.time)
            });
        }
        return prices;
    }

    addSecurities = async (securities: addSecurity[]) => {
        if (securities.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'symbol', prop: 'symbol'},
            {name: 'company_name', prop: 'companyName'},
            {name: 'exchange', prop: 'exchange'},
            {name: 'industry', prop: 'industry'},
            {name: 'website', prop: 'website'},
            {name: 'description', prop: 'description'},
            {name: 'ceo', prop: 'ceo'},
            {name: 'security_name', prop: 'securityName'},
            {name: 'issue_type', prop: 'issueType'},
            {name: 'sector', prop: 'sector'},
            {name: 'primary_sic_code', prop: 'primarySicCode'},
            {name: 'employees', prop: 'employees'},
            {name: 'tags', prop: 'tags'},
            {name: 'address', prop: 'address'},
            {name: 'address2', prop: 'address2'},
            {name: 'state', prop: 'state'},
            {name: 'zip', prop: 'zip'},
            {name: 'country', prop: 'country'},
            {name: 'phone', prop: 'phone'},
            {name: 'logo_url', prop: 'logoUrl'},
            {name: 'enable_utp', prop: 'enableUtp'},
            {name: 'price_source', prop: 'priceSource'}
        ], {table: 'security'});
        const query = this.pgp.helpers.insert(securities, cs);
        await this.db.none(query);
    }

    getSecuritiesBySymbol = async (symbols: string[]): Promise<GetSecurityBySymbol[]> => {
        if (symbols.length <= 0) return [];
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
        const response = await this.db.query(query, [symbols])
        if (!response || response.length <= 0) return [];

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
                            created_at
                     FROM security
                     WHERE id IN ($1:list)`;
        const response = await this.db.query(query, [securityIds])
        if (!response || response.length <= 0) {
            throw new Error(`Failed to get security info for securityIds: ${securityIds}`);
        }

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
        if (accountGroupReturns.length <= 0) return 0;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_group_id', prop: 'accountGroupId'},
            {name: 'date', prop: 'date'},
            {name: 'return', prop: 'return'},
        ], {table: 'account_group_hpr'})
        const query = upsertReplaceQueryWithColumns(accountGroupReturns, cs, this.pgp, ["return"],
            "date, account_group_id")

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
            "account_group_id, date");
        const result = await this.db.result(query);
        return result.rowCount > 0 ? 1 : 0
    }

    getAccountGroupSummary = async (accountGroupId: number): Promise<TradingPostAccountGroupStats> => {
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
        const result = await this.db.one(query, [accountGroupId]);

        return {
            accountGroupId: result.account_group_id,
            beta: result.beta,
            sharpe: result.sharpe,
            industryAllocations: result.industry_allocations,
            exposure: result.exposure,
            date: result.date,
            benchmarkId: result.benchmark_id
        };
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
        if (accountIds.length <= 0) return
        try {
            const accountGroupRes = await this.db.query(`SELECT distinct account_group_id
                                                         FROM _TRADINGPOST_ACCOUNT_TO_GROUP
                                                         WHERE account_id IN ($1:list)`, [accountIds]);
            let accountGroupIds = accountGroupRes.map((r: { account_group_id: any; }) => r.account_group_id);
            if (accountGroupIds.length > 0) {
                await this.db.none(`
                BEGIN;
                    DELETE FROM ACCOUNT_GROUP_HPR WHERE account_group_id IN ($1:list);
                    DELETE FROM TRADINGPOST_ACCOUNT_GROUP_STAT WHERE account_group_id IN ($1:list);
                    DELETE FROM _TRADINGPOST_ACCOUNT_TO_GROUP WHERE account_group_id IN($1:list);
                    DELETE FROM TRADINGPOST_ACCOUNT_GROUP WHERE id IN($1:list);
                COMMIT;
                `, [accountGroupIds])
            }
        } catch (e) {
            console.error(e)
        }

        try {
            if (accountIds.length > 0) {
                await this.db.none(`
                BEGIN;            
                    DELETE FROM TRADINGPOST_HISTORICAL_HOLDING WHERE account_id IN ($1:list);
                    DELETE FROM TRADINGPOST_CURRENT_HOLDING WHERE account_id IN ($1:list);
                    DELETE FROM TRADINGPOST_TRANSACTION WHERE account_id IN ($1:list);
                    DELETE FROM TRADINGPOST_BROKERAGE_ACCOUNT WHERE id IN ($1:list);
                COMMIT;
            `, [accountIds])
            }
        } catch (e) {
            console.error(e)
        }
    }

    addOptionContract = async (optionContract: OptionContract): Promise<number> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'type', prop: 'type'},
            {name: 'strike_price', prop: 'strikePrice'},
            {name: 'expiration', prop: 'expiration'},
            {name: 'external_id', prop: 'externalId'}
        ], {table: 'security_option'})

        const query = this.pgp.helpers.insert(optionContract, cs) + ` RETURNING id`;
        return (await this.db.one(query)).id;
    }

    upsertOptionContracts = async (optionContracts: OptionContract[]): Promise<void> => {
        if (optionContracts.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'security_id', prop: 'securityId'},
            {name: 'type', prop: 'type'},
            {name: 'strike_price', prop: 'strikePrice'},
            {name: 'expiration', prop: 'expiration'},
            {name: 'external_id', prop: 'externalId'}
        ], {table: 'security_option'})

        const query = upsertReplaceQuery(optionContracts, cs, this.pgp, "security_id,type,strike_price,expiration")
        await this.db.none(query, [optionContracts])
    }

    upsertOptionContract = async (oc: OptionContract): Promise<number | null> => {
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
        const result = await this.db.oneOrNone<{ id: number }>(query, [oc.securityId, oc.type, oc.strikePrice, oc.expiration, oc.externalId]);
        if (result === null) return null;
        return result.id
    }

    getOptionContract = async (securityId: number, expirationDate: DateTime, strikePrice: number, optionType: string): Promise<OptionContractTable | null> => {
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
                     and type = $4;`
        const res = await this.db.oneOrNone(s, [securityId, expirationDate, strikePrice, optionType]);
        if (!res) return null;
        return {
            id: res.id,
            securityId: res.security_id,
            type: res.type,
            strikePrice: res.strike_price,
            expiration: res.expiration,
            externalId: res.external_id,
            updatedAt: DateTime.fromJSDate(res.updated_at),
            createdAt: DateTime.fromJSDate(res.created_at)
        }
    }

    getOptionContractsByExternalIds = async (externalIds: string[]): Promise<OptionContractTable[]> => {
        if (externalIds.length <= 0) return [];
        const s = `SELECT id,
                          security_id,
                          type,
                          strike_price,
                          expiration,
                          external_id,
                          updated_at,
                          created_at
                   FROM security_option
                   WHERE external_id IN ($1:list);`
        const res = await this.db.query(s, [externalIds]);
        if (!res || res.length <= 0) return [];
        return res.map((r: any) => ({
            id: r.id,
            securityId: r.security_id,
            type: r.type,
            strikePrice: r.strike_price,
            expiration: r.expiration,
            externalId: r.external_id,
            updatedAt: DateTime.fromJSDate(r.updated_at),
            createdAt: DateTime.fromJSDate(r.created_at)
        }))
    }

    getAccountOptionsContractsByTransactions = async (accountId: number, securityId: number, strikePrice: number): Promise<OptionContractTable[]> => {
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
        const res = await this.db.query(query, [accountId, strikePrice, securityId]);
        if (res.length <= 0) return [];
        return res.map((r: any) => {
            let o: OptionContractTable = {
                id: r.id,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
                securityId: r.security_id,
                type: r.type,
                expiration: r.expiration,
                strikePrice: r.strike_price,
                externalId: r.external_id
            }
            return o;
        })
    }

    getTradingPostBrokerageAccountsByBrokerageAndIds = async (userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]> => {
        if (brokerageAccountIds.length <= 0) return [];
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
                         AND account_number IN ($3:list);`
        const results = await this.db.query(query, [userId, brokerage, brokerageAccountIds]);
        if (!results || results.length <= 0) return [];

        return results.map((r: any) => {
            let x: TradingPostBrokerageAccountsTable = {
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
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
                hiddenForDeletion: r.hidden_for_deletion,
                accountStatus: r.account_status,
                authenticationService: r.authentication_service
            }
            return x;
        })
    }

    getPendingJobs = async (brokerage: string): Promise<any[]> => {
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
        const results = await this.db.query(query, [brokerage]);
        if (results.length <= 0) return [];
        return results.map((result: any) => ({
            id: result.id,
            brokerage: result.brokerage,
            brokerageUserId: result.brokerage_user_id,
            dateToProcess: DateTime.fromJSDate(result.date_to_process),
            status: result.status,
            data: result.data,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
        }));
    }

    getBrokerageJobsPerUser = async (brokerage: string, brokerageUserId: string): Promise<any[]> => {
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
        const results = await this.db.query(query, [brokerage, brokerageUserId]);
        if (results.length <= 0) return [];
        return results.map((result: any) => ({
            id: result.id,
            brokerage: result.brokerage,
            brokerageUserId: result.brokerage_user_id,
            dateToProcess: DateTime.fromJSDate(result.date_to_process),
            status: result.status,
            data: result.data,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
        }));
    }

    updateJobStatus = async (jobId: number, status: any): Promise<void> => {
        const query = `UPDATE brokerage_to_process
                       SET status = $1
                       WHERE id = $2`;
        await this.db.none(query, [status, jobId]);
    }

    getIbkrMasterAndSubAccounts = async (accountId: string): Promise<IbkrAccountTable[]> => {
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
                           OR master_account_id = $1;`
        const results = await this.db.query(query, [accountId]);
        if (results.length <= 0) return [];
        return results.map((result: any) => ({
            id: result.id,
            van: result.van,
            accountId: result.account_id,
            userId: result.user_id,
            street2: result.stree2,
            type: result.type,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
            street: result.street,
            state: result.state,
            zip: result.zip,
            country: result.country,
            masterAccountId: result.master_account_id,
            primaryEmail: result.primary_email,
            dateOpened: DateTime.fromJSDate(result.date_opened),
            dateFunded: result.date_funded ? DateTime.fromJSDate(result.date_funded) : null,
            dateClosed: result.date_closed ? DateTime.fromJSDate(result.date_closed) : null,
            city: result.city,
            customerType: result.customer_type,
            capabilities: result.capabilities,
            accountType: result.account_type,
            accountTitle: result.account_title,
            baseCurrency: result.base_currency,
            alias: result.alias,
            accountRepresentative: result.account_representative,
            accountProcessDate: DateTime.fromJSDate(result.account_process_date)
        }))
    }
    getIbkrAccount = async (accountId: string): Promise<IbkrAccountTable | null> => {
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
                        WHERE account_id = $1;`
        const result = await this.db.oneOrNone(query, [accountId]);
        if (!result) return null;
        return {
            id: result.id,
            van: result.van,
            accountId: result.account_id,
            userId: result.user_id,
            street2: result.stree2,
            type: result.type,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
            street: result.street,
            state: result.state,
            zip: result.zip,
            country: result.country,
            masterAccountId: result.master_account_id,
            primaryEmail: result.primary_email,
            dateOpened: DateTime.fromJSDate(result.date_opened),
            dateFunded: result.date_funded ? DateTime.fromJSDate(result.date_funded) : null,
            dateClosed: result.date_closed ? DateTime.fromJSDate(result.date_closed) : null,
            city: result.city,
            customerType: result.customer_type,
            capabilities: result.capabilities,
            accountType: result.account_type,
            accountTitle: result.account_title,
            baseCurrency: result.base_currency,
            alias: result.alias,
            accountRepresentative: result.account_representative,
            accountProcessDate: DateTime.fromJSDate(result.account_process_date)
        }
    }

    upsertIbkrAccounts = async (accounts: IbkrAccount[]): Promise<void> => {
        if (accounts.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'account_process_date', prop: 'accountProcessDate'},
            {name: 'type', prop: 'type'},
            {name: 'account_title', prop: 'accountTitle'},
            {name: 'street', prop: 'street'},
            {name: 'street2', prop: 'street2'},
            {name: 'city', prop: 'city'},
            {name: 'state', prop: 'state'},
            {name: 'zip', prop: 'zip'},
            {name: 'country', prop: 'country'},
            {name: 'account_type', prop: 'accountType'},
            {name: 'customer_type', prop: 'customerType'},
            {name: 'base_currency', prop: 'baseCurrency'},
            {name: 'master_account_id', prop: 'masterAccountId'},
            {name: 'van', prop: 'van'},
            {name: 'capabilities', prop: 'capabilities'},
            {name: 'alias', prop: 'alias'},
            {name: 'primary_email', prop: 'primaryEmail'},
            {name: 'date_opened', prop: 'dateOpened'},
            {name: 'date_closed', prop: 'dateClosed'},
            {name: 'date_funded', prop: 'dateFunded'},
            {name: 'account_representative', prop: 'accountRepresentative'}
        ], {table: 'ibkr_account'})
        const query = upsertReplaceQuery(accounts, cs, this.pgp, "account_id");
        await this.db.none(query);
    }

    upsertIbkrSecurities = async (securities: IbkrSecurity[]): Promise<void> => {
        if (securities.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'file_date', prop: 'fileDate'},
            {name: 'type', prop: 'type'},
            {name: 'con_id', prop: 'conId'},
            {name: 'asset_type', prop: 'assetType'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'cusip', prop: 'cusip'},
            {name: 'symbol', prop: 'symbol'},
            {name: 'bb_ticker', prop: 'bbTicker'},
            {name: 'bb_ticker_and_exchange_code', prop: 'bbTickerAndExchangeCode'},
            {name: 'bb_global_id', prop: 'bbGlobalId'},
            {name: 'description', prop: 'description'},
            {name: 'underlying_symbol', prop: 'underlyingSymbol'},
            {name: 'underlying_category', prop: 'underlyingCategory'},
            {name: 'underlying_security_id', prop: 'underlyingSecurityId'},
            {name: 'underlying_primary_exchange', prop: 'underlyingPrimaryExchange'},
            {name: 'underlying_con_id', prop: 'underlyingConId'},
            {name: 'multiplier', prop: 'multiplier'},
            {name: 'expiration_date', prop: 'expirationDate'},
            {name: 'option_type', prop: 'optionType'},
            {name: 'option_strike', prop: 'optionStrike'},
            {name: 'maturity_date', prop: 'maturityDate'},
            {name: 'issue_date', prop: 'issueDate'},
            {name: 'primary_exchange', prop: 'primaryExchange'},
            {name: 'currency', prop: 'currency'},
            {name: 'sub_category', prop: 'subCategory'},
            {name: 'issuer', prop: 'issuer'},
            {name: 'delivery_month', prop: 'deliveryMonth'}
        ], {table: 'ibkr_security'})
        const query = upsertReplaceQuery(securities, cs, this.pgp, "con_id");
        await this.db.none(query);
    }

    upsertIbkrActivity = async (activities: IbkrActivity[]): Promise<void> => {
        if (activities.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'type', prop: 'type'},
            {name: 'file_date', prop: 'fileDate'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'con_id', prop: 'conId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'symbol', prop: 'symbol'},
            {name: 'bb_ticker', prop: 'bbTicker'},
            {name: 'bb_global_id', prop: 'bbGlobalId'},
            {name: 'security_description', prop: 'securityDescription'},
            {name: 'asset_type', prop: 'assetType'},
            {name: 'currency', prop: 'currency'},
            {name: 'base_currency', prop: 'baseCurrency'},
            {name: 'trade_date', prop: 'tradeDate'},
            {name: 'trade_time', prop: 'tradeTime'},
            {name: 'settle_date', prop: 'settleDate'},
            {name: 'order_time', prop: 'orderTime'},
            {name: 'transaction_type', prop: 'transactionType'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'unit_price', prop: 'unitPrice'},
            {name: 'gross_amount', prop: 'grossAmount'},
            {name: 'sec_fee', prop: 'secFee'},
            {name: 'commission', prop: 'commission'},
            {name: 'tax', prop: 'tax'},
            {name: 'net', prop: 'net'},
            {name: 'net_in_base', prop: 'netInBase'},
            {name: 'trade_id', prop: 'tradeId'},
            {name: 'tax_basis_election', prop: 'taxBasisElection'},
            {name: 'description', prop: 'description'},
            {name: 'fx_rate_to_base', prop: 'fxRateToBase'},
            {name: 'contra_party_name', prop: 'contraPartyName'},
            {name: 'clr_firm_id', prop: 'clrFirmId'},
            {name: 'exchange', prop: 'exchange'},
            {name: 'master_account_id', prop: 'masterAccountId'},
            {name: 'van', prop: 'van'},
            {name: 'away_broker_commission', prop: 'awayBrokerCommission'},
            {name: 'order_id', prop: 'orderId'},
            {name: 'client_references', prop: 'clientReferences'},
            {name: 'transaction_id', prop: 'transactionId'},
            {name: 'execution_id', prop: 'executionId'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'flag', prop: 'flag'}
        ], {table: 'ibkr_activity'})
        const query = upsertReplaceQuery(activities, cs, this.pgp, "account_id, con_id, trade_date, transaction_type, quantity");
        await this.db.none(query);
    }

    upsertIbkrCashReport = async (cashReports: IbkrCashReport[]): Promise<void> => {
        if (cashReports.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'file_date', prop: 'fileDate'},
            {name: 'type', prop: 'type'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'report_date', prop: 'reportDate'},
            {name: 'currency', prop: 'currency'},
            {name: 'base_summary', prop: 'baseSummary'},
            {name: 'label', prop: 'label'},
            {name: 'total', prop: 'total'},
            {name: 'securities', prop: 'securities'},
            {name: 'futures', prop: 'futures'},
            {name: 'ibukl', prop: 'ibukl'},
            {name: 'paxos', prop: 'paxos'},
        ], {table: 'ibkr_cash_report'})
        const query = upsertReplaceQuery(cashReports, cs, this.pgp, "account_id, report_date, base_summary, label");
        await this.db.none(query);
    }

    upsertIbkrNav = async (navs: IbkrNav[]): Promise<void> => {
        if (navs.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'file_date', prop: 'fileDate'},
            {name: 'type', prop: 'type'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'base_currency', prop: 'baseCurrency'},
            {name: 'cash', prop: 'cash'},
            {name: 'cash_collateral', prop: 'cashCollateral'},
            {name: 'stocks', prop: 'stocks'},
            {name: 'ipo_subscription', prop: 'ipoSubscription'},
            {name: 'securities_borrowed', prop: 'securitiesBorrowed'},
            {name: 'securities_lent', prop: 'securitiesLent'},
            {name: 'options', prop: 'options'},
            {name: 'bonds', prop: 'bonds'},
            {name: 'commodities', prop: 'commodities'},
            {name: 'funds', prop: 'funds'},
            {name: 'notes', prop: 'notes'},
            {name: 'accruals', prop: 'accruals'},
            {name: 'dividend_accruals', prop: 'dividendAccruals'},
            {name: 'soft_dollars', prop: 'softDollars'},
            {name: 'crypto', prop: 'crypto'},
            {name: 'totals', prop: 'totals'},
            {name: 'twr', prop: 'twr'},
            {name: 'cfd_unrealized_pl', prop: 'cfdUnrealizedPl'},
            {name: 'forex_cfd_unrealized_pl', prop: 'forexCfdUnrealizedPl'},
            {name: 'processed_date', prop: 'processedDate'}
        ], {table: 'ibkr_nav'})
        const query = upsertReplaceQuery(navs, cs, this.pgp, "account_id, processed_date");
        await this.db.none(query);
    }

    upsertIbkrPls = async (pls: IbkrPl[]): Promise<void> => {
        if (pls.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'file_date', prop: 'fileDate'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'internal_asset_id', prop: 'internalAssetId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'symbol', prop: 'symbol'},
            {name: 'bb_ticker', prop: 'bbTicker'},
            {name: 'bb_global_id', prop: 'bbGlobalId'},
            {name: 'security_description', prop: 'securityDescription'},
            {name: 'asset_type', prop: 'assetType'},
            {name: 'currency', prop: 'currency'},
            {name: 'report_date', prop: 'reportDate'},
            {name: 'position_mtm', prop: 'positionMtm'},
            {name: 'position_mtm_in_base', prop: 'positionMtmInBase'},
            {name: 'transaction_mtm', prop: 'transactionMtm'},
            {name: 'transaction_mtm_in_base', prop: 'transactionMtmInBase'},
            {name: 'realized_st', prop: 'realizedSt'},
            {name: 'realized_st_in_base', prop: 'realizedStInBase'},
            {name: 'realized_lt', prop: 'realizedLt'},
            {name: 'realized_lt_in_base', prop: 'realizedLtInBase'},
            {name: 'unrealized_st', prop: 'unrealizedSt'},
            {name: 'unrealized_st_in_base', prop: 'unrealizedStInBase'},
            {name: 'unrealized_lt', prop: 'unrealizedLt'},
            {name: 'unrealized_lt_in_base', prop: 'unrealizedLtInBase'},
        ], {table: 'ibkr_pl'})
        const query = upsertReplaceQuery(pls, cs, this.pgp, "account_id, internal_asset_id, report_date");
        await this.db.none(query);
    }

    upsertIbkrPositions = async (positions: IbkrPosition[]): Promise<void> => {
        if (positions.length <= 0) return
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'file_date', prop: 'fileDate'},
            {name: 'type', prop: 'type'},
            {name: 'account_id', prop: 'accountId'},
            {name: 'con_id', prop: 'conId'},
            {name: 'security_id', prop: 'securityId'},
            {name: 'symbol', prop: 'symbol'},
            {name: 'bb_ticker', prop: 'bbTicker'},
            {name: 'bb_global_id', prop: 'bbGlobalId'},
            {name: 'security_description', prop: 'securityDescription'},
            {name: 'asset_type', prop: 'assetType'},
            {name: 'currency', prop: 'currency'},
            {name: 'base_currency', prop: 'baseCurrency'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'quantity_in_base', prop: 'quantityInBase'},
            {name: 'cost_price', prop: 'costPrice'},
            {name: 'cost_basis', prop: 'costBasis'},
            {name: 'cost_basis_in_base', prop: 'costBasisInBase'},
            {name: 'market_price', prop: 'marketPrice'},
            {name: 'market_value', prop: 'marketValue'},
            {name: 'market_value_in_base', prop: 'marketValueInBase'},
            {name: 'open_date_time', prop: 'openDateTime'},
            {name: 'fx_rate_to_base', prop: 'fxRateToBase'},
            {name: 'report_date', prop: 'reportDate'},
            {name: 'settled_quantity', prop: 'settledQuantity'},
            {name: 'settled_quantity_in_base', prop: 'settledQuantityInBase'},
            {name: 'master_account_id', prop: 'masterAccountId'},
            {name: 'van', prop: 'van'},
            {name: 'accrued_int', prop: 'accruedInt'},
            {name: 'originating_order_id', prop: 'originatingOrderId'},
            {name: 'multiplier', prop: 'multiplier'},
        ], {table: 'ibkr_position'})
        const query = upsertReplaceQuery(positions, cs, this.pgp, "account_id, con_id, asset_type, report_date");
        await this.db.none(query);
    }

    upsertRobinhoodUsers = async (users: RobinhoodUser[]): Promise<void> => {
        if (users.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'username', prop: 'username'},
            {name: 'device_token', prop: 'deviceToken'},
            {name: 'status', prop: 'status'},
            {name: 'uses_mfa', prop: 'usesMfa'},
            {name: 'access_token', prop: 'accessToken'},
            {name: 'refresh_token', prop: 'refreshToken'},
        ], {table: 'robinhood_account'});
        const query = upsertReplaceQuery(users, cs, this.pgp, "username");
        await this.db.none(query);
    }

    getRobinhoodUsers = async (): Promise<RobinhoodUserTable[]> => {
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
                       FROM robinhood_user`
        const results = await this.db.query(query);
        if (results.length <= 0) return [];

        return results.map((r: any) => {
            let x: RobinhoodUserTable = {
                id: r.id,
                userId: r.user_id,
                createdAt: DateTime.fromJSDate(r.created_at),
                status: r.status,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                accessToken: r.access_token,
                deviceToken: r.device_token,
                refreshToken: r.refresh_token,
                username: r.username,
                usesMfa: r.uses_mfa
            }
            return x;
        });
    }

    getRobinhoodUser = async (userId: string): Promise<RobinhoodUserTable | null> => {
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
                       WHERE user_id = $1;`
        const results = await this.db.query<[{ id: number, user_id: string, username: string, device_token: string, status: string, uses_mfa: boolean, access_token: string, refresh_token: string, updated_at: Date, created_at: Date }]>(query, [userId]);
        if (results.length <= 0) return null;
        return {
            id: results[0].id,
            userId: results[0].user_id,
            username: results[0].username,
            deviceToken: results[0].device_token,
            status: results[0].status,
            usesMfa: results[0].uses_mfa,
            accessToken: results[0].access_token,
            refreshToken: results[0].refresh_token,
            updatedAt: DateTime.fromJSDate(results[0].updated_at),
            createdAt: DateTime.fromJSDate(results[0].created_at)
        };
    }

    updateRobinhoodUser = async (user: RobinhoodUser) => {
        const query = `UPDATE robinhood_user
                       SET user_id=$1,
                           device_token=$2,
                           status=$3,
                           uses_mfa=$4,
                           access_token=$5,
                           refresh_token=$6,
                           updated_at=NOW()
                       WHERE username = $7`
        await this.db.query(query, [user.userId, user.deviceToken, user.status, user.usesMfa, user.accessToken, user.refreshToken, user.username])
    }

    insertRobinhoodUser = async (user: RobinhoodUser) => {
        const query = `INSERT INTO robinhood_user(user_id, username, device_token, status, uses_mfa, access_token,
                                                  refresh_token)
                       VALUES ($1, $2, $3, $4, $5, $6, $7);`
        await this.db.query(query, [user.userId, user.username, user.deviceToken, user.status, user.usesMfa, user.accessToken, user.refreshToken]);
    }

    deleteRobinhoodAccountsPositions = async (accountIds: number[]): Promise<void> => {
        const query = `DELETE
                       FROM robinhood_position
                       WHERE internal_account_id IN ($1:list);`
        await this.db.none(query, [accountIds]);
    }

    getRobinhoodAccountsByRobinhoodUserId = async (userId: number): Promise<RobinhoodAccountTable[]> => {
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
        const results = await this.db.query(query, [userId]);
        return results.map((r: any) => {
            let x: RobinhoodAccountTable = {
                userId: r.user_id,
                accountNumber: r.account_number,
                type: r.type,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
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
            }
            return x;
        })
    }

    upsertRobinhoodAccounts = async (accs: RobinhoodAccount[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'account_number', prop: 'accountNumber'},
            {name: 'url', prop: 'url'},
            {name: 'portfolio_cash', prop: 'portfolioCash'},
            {name: 'can_downgrade_to_cash_url', prop: 'canDowngradeToCashUrl'},
            {name: 'user_url', prop: 'userUrl'},
            {name: 'type', prop: 'type'},
            {name: 'brokerage_account_type', prop: 'brokerageAccountType'},
            {name: 'external_created_at', prop: 'externalCreatedAt'},
            {name: 'external_updated_at', prop: 'externalUpdatedAt'},
            {name: 'deactivated', prop: 'deactivated'},
            {name: 'deposit_halted', prop: 'depositHalted'},
            {name: 'withdrawl_halted', prop: 'withdrawlHalted'},
            {name: 'only_position_closing_trades', prop: 'onlyPositionClosingTrades'},
            {name: 'buying_power', prop: 'buyingPower'},
            {name: 'onbp', prop: 'onbp'},
            {name: 'cash_available_for_withdrawl', prop: 'cashAvailableForWithdrawl'},
            {name: 'cash', prop: 'cash'},
            {name: 'amount_eligible_for_deposit_cancellation', prop: 'amountEligibleForDepositCancellation'},
            {name: 'cash_held_for_orders', prop: 'cashHeldForOrders'},
            {name: 'uncleared_deposits', prop: 'unclearedDeposits'},
            {name: 'sma', prop: 'sma'},
            {name: 'sma_held_for_orders', prop: 'smaHeldForOrders'},
            {name: 'unsettled_funds', prop: 'unsettledFunds'},
            {name: 'unsettled_debit', prop: 'unsettledDebit'},
            {name: 'crypto_buying_power', prop: 'cryptoBuyingPower'},
            {name: 'max_ach_early_access_amount', prop: 'maxAchEarlyAccessAmount'},
            {name: 'cash_balances', prop: 'cashBalances'}
        ], {table: "robinhood_account"});
        const query = upsertReplaceQuery(accs, cs, this.pgp, "account_number");
        await this.db.none(query);
    }

    upsertRobinhoodInstruments = async (instruments: RobinhoodInstrument[]): Promise<void> => {
        if (instruments.length <= 0) return;

        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'url', prop: 'url'},
            {name: 'symbol', prop: 'symbol'},
            {name: 'quote_url', prop: 'quoteUrl'},
            {name: 'fundamentals_url', prop: 'fundamentalsUrl'},
            {name: 'splits_url', prop: 'splitsUrl'},
            {name: 'state', prop: 'state'},
            {name: 'market_url', prop: 'marketUrl'},
            {name: 'name', prop: 'name'},
            {name: 'tradeable', prop: 'tradeable'},
            {name: 'tradability', prop: 'tradability'},
            {name: 'bloomberg_unique', prop: 'bloombergUnique'},
            {name: 'margin_initial_ratio', prop: 'marginInitialRatio'},
            {name: 'maintenance_ratio', prop: 'maintenanceRatio'},
            {name: 'country', prop: 'country'},
            {name: 'day_trade_ratio', prop: 'dayTradeRatio'},
            {name: 'list_date', prop: 'listDate'},
            {name: 'min_tick_size', prop: 'minTickSize'},
            {name: 'type', prop: 'type'},
            {name: 'tradeable_chain_id', prop: 'tradeable_chain_id'},
            {name: 'rhs_tradability', prop: 'rhsTradability'},
            {name: 'fractional_tradability', prop: 'fractionalTradability'},
            {name: 'default_collar_fraction', prop: 'defaultCollarFraction'},
            {name: 'ipo_access_status', prop: 'ipoAccessStatus'},
            {name: 'ipo_access_cob_deadline', prop: 'ipoAccessCobDeadline'},
            {name: 'ipo_s1_url', prop: 'ipoS1Url'},
            {name: 'ipo_roadshow_url', prop: 'ipoRoadshowUrl'},
            {name: 'is_spac', prop: 'ipoSpac'},
            {name: 'is_test', prop: 'isTest'},
            {name: 'ipo_access_supports_dsp', prop: 'ipoAccessSupportsDsp'},
            {name: 'extended_hours_fractional_tradability', prop: 'extendedHoursFractionalTradability'},
            {name: 'internal_halt_reason', prop: 'internalHaltReason'},
            {name: 'internal_halt_details', prop: 'internalHaltDetails'},
            {name: 'internal_halt_sessions', prop: 'internalHaltSessions'},
            {name: 'internal_halt_start_time', prop: 'internalStartTime'},
            {name: 'internal_halt_end_time', prop: 'internalEndTime'},
            {name: 'internal_halt_source', prop: 'internalHaltSource'},
            {name: 'all_day_tradability', prop: 'allDayTradability'},
        ], {table: 'robinhood_instrument'});
        const query = upsertReplaceQuery(instruments, cs, this.pgp, "symbol")
        await this.db.none(query);
    }

    addRobinhoodInstrument = async (instrument: RobinhoodInstrument): Promise<number> => {
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
            RETURNING id;`
        const results = await this.db.oneOrNone<{ id: number }>(query, [instrument.externalId, instrument.url, instrument.symbol, instrument.quoteUrl,
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
            instrument.allDayTradability])
        if (results === null) throw new Error("could not return id");
        return results.id;
    }

    upsertRobinhoodTransactions = async (txs: RobinhoodTransaction[]): Promise<void> => {
        if (txs.length <= 0) return;
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'internal_account_id', prop: 'internalAccountId'},
            {name: 'internal_instrument_id', prop: 'internalInstrumentId'},
            {name: 'internal_option_id', prop: 'internalOptionId'},
            {name: 'external_id', prop: 'externalId'},
            {name: 'ref_id', prop: 'refId'},
            {name: 'url', prop: 'url'},
            {name: 'account_url', prop: 'accountUrl'},
            {name: 'position_url', prop: 'positionUrl'},
            {name: 'cancel', prop: 'cancel'},
            {name: 'instrument_url', prop: 'instrumentUrl'},
            {name: 'instrument_id', prop: 'instrumentId'},
            {name: 'cumulative_quantity', prop: 'cumulativeQuantity'},
            {name: 'average_price', prop: 'averagePrice'},
            {name: 'fees', prop: 'fees'},
            {name: 'rate', prop: 'rate'},
            {name: 'position', prop: 'position'},
            {name: 'withholding', prop: 'withholding'},
            {name: 'cash_dividend_id', prop: 'cashDividendId'},
            {name: 'state', prop: 'state'},
            {name: 'type', prop: 'type'},
            {name: 'side', prop: 'side'},
            {name: 'trigger', prop: 'trigger'},
            {name: 'price', prop: 'price'},
            {name: 'stop_price', prop: 'stopPrice'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'reject_reason', prop: 'rejectReason'},
            {name: 'external_created_at', prop: 'externalCreatedAt'},
            {name: 'external_updated_at', prop: 'externalUpdatedAt'},
            {name: 'last_transaction_at', prop: 'lastTransactionAt'},
            {name: 'executions_price', prop: 'executionsPrice'},
            {name: 'executions_quantity', prop: 'executionsQuantity'},
            {name: 'executions_settlement_date', prop: 'executionsSettlementDate'},
            {name: 'executions_timestamp', prop: 'executionsTimestamp'},
            {name: 'executions_id', prop: 'executionsId'},
            {name: 'extended_hours', prop: 'extendedHours'},
            {name: 'dollar_based_amount', prop: 'dollarBasedAmount'},
            {name: 'investment_schedule_id', prop: 'investmentScheduleId'},
            {name: 'account_number', prop: 'accountNumber'},
            {name: 'cancel_url', prop: 'cancelUrl'},
            {name: 'canceled_quantity', prop: 'canceledQuantity'},
            {name: 'direction', prop: 'direction'},
            {name: 'option_leg_id', prop: 'optionLegId'},
            {name: 'position_effect', prop: 'positionEffect'},
            {name: 'ratio_quantity', prop: 'ratioQuantity'},
            {name: 'pending_quantity', prop: 'pendingQuantity'},
            {name: 'processed_quantity', prop: 'processedQuantity'},
            {name: 'chain_id', prop: 'chainId'},
            {name: 'chain_symbol', prop: 'chainSymbol'},
            {name: 'ach_relationship', prop: 'achRelationship'},
            {name: 'expected_landing_date', prop: 'expectedLandingDate'},
            {name: 'expected_landing_datetime', prop: 'expectedLandingDateTime'},
        ], {table: 'robinhood_transaction'});

        const query = upsertReplaceQuery(txs, cs, this.pgp, `internal_account_id,internal_instrument_id,coalesce(internal_option_id,-1),executions_timestamp,executions_quantity`)
        await this.db.none(query);
    }

    upsertRobinhoodOptions = async (options: RobinhoodOption[]): Promise<void> => {
        if (options.length <= 0) return;

        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'internal_instrument_id', prop: 'internalInstrumentId'},
            {name: 'external_id', prop: 'externalId'},
            {name: 'chain_id', prop: 'chainId'},
            {name: 'chain_symbol', prop: 'chainSymbol'},
            {name: 'external_created_at', prop: 'externalCreatedAt'},
            {name: 'expiration_date', prop: 'expiration_date'},
            {name: 'issue_date', prop: 'issueDate'},
            {name: 'min_ticks_above_tick', prop: 'minTicksAboveTick'},
            {name: 'min_ticks_below_tick', prop: 'minTicksBelowTick'},
            {name: 'min_ticks_cutoff_price', prop: 'minTicksCutoffPrice'},
            {name: 'rhs_tradability', prop: 'rhsTradability'},
            {name: 'state', prop: 'state'},
            {name: 'strike_price', prop: 'strikePrice'},
            {name: 'tradability', prop: 'tradability'},
            {name: 'type', prop: 'type'},
            {name: 'external_updated_at', prop: 'externalUpdatedAt'},
            {name: 'url', prop: 'url'},
            {name: 'sellout_date_time', prop: 'selloutDateTime'},
            {name: 'long_strategy_code', prop: 'longStrategyCode'},
            {name: 'short_strategy_code', prop: 'shortStrategyCode'}
        ], {table: 'robinhood_option'});
        const query = upsertReplaceQuery(options, cs, this.pgp, "external_id");
        await this.db.none(query);
    }

    upsertRobinhoodOption = async (option: RobinhoodOption): Promise<number | null> => {
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
            RETURNING id;`


        const response = await this.db.oneOrNone<{ id: number }>(query, [option.internalInstrumentId, option.externalId, option.chainId, option.chainSymbol, option.externalCreatedAt, option.expirationDate, option.issueDate,
            option.minTicksAboveTick, option.minTicksBelowTick, option.minTicksCutoffPrice, option.rhsTradability, option.state, option.strikePrice, option.tradability,
            option.type, option.externalUpdatedAt, option.url, option.selloutDateTime, option.longStrategyCode, option.shortStrategyCode])
        if (response === null) return null;
        return response.id;
    }

    upsertRobinhoodPositions = async (positions: RobinhoodPosition[]): Promise<void> => {
        if (positions.length <= 0) return;

        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'internal_account_id', prop: 'internalAccountId'},
            {name: 'internal_instrument_id', prop: 'internalInstrumentId'},
            {name: 'internal_option_id', prop: 'internalOptionId'},
            {name: 'url', prop: 'url'},
            {name: 'instrument_url', prop: 'instrumentUrl'},
            {name: 'instrument_id', prop: 'instrumentId'},
            {name: 'account_url', prop: 'accountUrl'},
            {name: 'account_number', prop: 'accountNumber'},
            {name: 'average_buy_price', prop: 'averageBuyPrice'},
            {name: 'pending_average_buy_price', prop: 'pendingAverageBuyPrice'},
            {name: 'quantity', prop: 'quantity'},
            {name: 'intraday_average_buy_price', prop: 'intradayAverageBuyPrice'},
            {name: 'intraday_quantity', prop: 'intradayQuantity'},
            {name: 'shares_available_for_exercise', prop: 'sharesAvailableForExercise'},
            {name: 'shares_held_for_buys', prop: 'sharesHeldForBuys'},
            {name: 'shares_held_for_sells', prop: 'sharesHeldForSells'},
            {name: 'shares_held_for_stock_grants', prop: 'sharesHeldForStockGrants'},
            {name: 'ipo_allocated_quantity', prop: 'ipoAllocatedQuantity'},
            {name: 'ipo_dsp_allocated_quantity', prop: 'ipoDspAllocatedQuantity'},
            {name: 'avg_cost_affected', prop: 'avgCostAffected'},
            {name: 'avg_cost_affected_reason', prop: 'avgCostAffectedReason'},
            {name: 'is_primary_account', prop: 'isPrimaryAccount'},
            {name: 'external_updated_at', prop: 'externalUpdatedAt'},
            {name: 'external_created_at', prop: 'externalCreatedAt'},
            {name: 'average_price', prop: 'averagePrice'},
            {name: 'chain_id', prop: 'chainId'},
            {name: 'chain_symbol', prop: 'chainSymbol'},
            {name: 'external_id', prop: 'externalId'},
            {name: 'type', prop: 'type'},
            {name: 'pending_buy_quantity', prop: 'pendingBuyQuantity'},
            {name: 'pending_expired_quantity', prop: 'pendingExpiredQuantity'},
            {name: 'pending_assignment_quantity', prop: 'pendingAssignmentQuantity'},
            {name: 'pending_sell_quantity', prop: 'pendingSellQuantity'},
            {name: 'intraday_average_open_price', prop: 'intradayAverageOpenPrice'},
            {name: 'trade_value_multiplier', prop: 'tradeValueMultiplier'},
            {name: 'external_option_id', prop: 'externalOptionId'},
        ], {table: 'robinhood_position'});
        const query = upsertReplaceQuery(positions, cs, this.pgp, `internal_account_id,internal_instrument_id,internal_option_id`)
        await this.db.none(query);
    }

    getRobinhoodInstrumentsByExternalId = async (instrumentIds: string[]): Promise<RobinhoodInstrumentTable[]> => {
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
                       where external_id IN ($1:list);`
        const results = await this.db.query(query, [instrumentIds]);
        if (results.length <= 0) return [];

        return results.map((r: any) => {
            let x: RobinhoodInstrumentTable = {
                id: r.id,
                externalId: r.external_id,
                name: r.name,
                marketUrl: r.market_url,
                url: r.url,
                type: r.type,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
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
            }
            return x;
        })
    }

    getRobinhoodInstrumentBySymbol = async (symbol: string): Promise<RobinhoodInstrumentTable | null> => {
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
                       where symbol = $1;`
        const r = await this.db.oneOrNone(query, [symbol]);
        if (r === null) return null;
        return {
            id: r.id,
            externalId: r.external_id,
            name: r.name,
            marketUrl: r.market_url,
            url: r.url,
            type: r.type,
            updatedAt: DateTime.fromJSDate(r.updated_at),
            createdAt: DateTime.fromJSDate(r.created_at),
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
        }
    }

    getSecurityWithLatestPricingWithRobinhoodIds = async (rhIds: number[]): Promise<SecurityTableWithLatestPriceRobinhoodId[]> => {
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
                       where ri.id in ($1:list);`
        const results = await this.db.query(query, [rhIds]);
        if (results.length <= 0) return [];
        return results.map((r: any) => {
            let x: SecurityTableWithLatestPriceRobinhoodId = {
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
                createdAt: DateTime.fromJSDate(r.created_at),
                lastUpdated: DateTime.fromJSDate(r.last_updated),
                logoUrl: r.logo_url,
                symbol: r.symbol,
                rhInternalId: r.rh_internal_id,
            }
            return x;
        })
    }

    getTradingPostOptionsWithRobinhoodOptionIds = async (rhOptionIds: number[]): Promise<OptionContractTableWithRobinhoodId[]> => {
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
                       where ro.id in ($1:list);`
        const results = await this.db.query(query, [rhOptionIds]);
        if (results.length <= 0) return [];
        return results.map((r: any) => {
            let x: OptionContractTableWithRobinhoodId = {
                id: r.id,
                type: r.type,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
                internalRobinhoodOptionId: r.internal_robinhood_option_id,
                expiration: DateTime.fromJSDate(r.expiration),
                externalId: r.external_id,
                securityId: r.security_id,
                strikePrice: r.strike_price,
            }
            return x;
        })
    }

    getRobinhoodOptionsByExternalIds = async (externalIds: string[]): Promise<RobinhoodOptionTable[]> => {
        if (externalIds.length <= 0) return [];
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
                       WHERE external_id IN ($1:list);`
        const results = await this.db.query(query, [externalIds]);
        if (results.length <= 0) return [];

        return results.map((r: any) => {
            let x: RobinhoodOptionTable = {
                id: r.id,
                url: r.url,
                type: r.type,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
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
                expirationDate: DateTime.fromJSDate(r.expiration_date),
                chainId: r.chain_id,
                externalCreatedAt: r.external_created_at,
                externalId: r.external_id,
                state: r.state,
                chainSymbol: r.chain_symbol,
                internalInstrumentId: r.internal_instrument_id,
                shortStrategyCode: r.short_strategy_code,
            }
            return x;
        })
    }

    getRobinhoodOption = async (internalOptionId: number): Promise<RobinhoodOptionTable | null> => {
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
        const result = await this.db.oneOrNone(query, [internalOptionId]);
        if (!result) return null;
        return {
            id: result.id,
            url: result.url,
            type: result.type,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
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
            expirationDate: DateTime.fromJSDate(result.expiration_date),
            chainId: result.chain_id,
            externalCreatedAt: result.external_created_at,
            externalId: result.external_id,
            state: result.state,
            chainSymbol: result.chain_symbol,
            internalInstrumentId: result.internal_instrument_id,
            shortStrategyCode: result.short_strategy_code,
        }
    }

    upsertBrokerageTasks = async (tasks: BrokerageTask[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'user_id', prop: 'userId'},
            {name: 'brokerage', prop: 'brokerage'},
            {name: 'status', prop: 'status'},
            {name: 'type', prop: 'type'},
            {name: 'date', prop: 'date'},
            {name: 'brokerage_user_id', prop: 'brokerageUserId'},
            {name: 'started', prop: 'started'},
            {name: 'finished', prop: 'finished'},
            {name: 'data', prop: 'data'},
            {name: 'error', prop: 'error'},
            {name: 'message_id', prop: 'messageId'}
        ], {table: 'brokerage_task'});

        const query = upsertReplaceQuery(tasks, cs, this.pgp, `brokerage, status, type, date, user_id`)
        await this.db.none(query);
    }

    updateTask = async (taskId: number, params: { userId?: string, brokerage?: string, type?: BrokerageTaskType, date?: DateTime, brokerageUserId?: string, started?: DateTime, finished?: DateTime, status?: BrokerageTaskStatusType, error?: any, data?: any, messageId?: string }): Promise<void> => {
        let query = `UPDATE brokerage_task
                     SET `
        let cnt = 1;
        let paramPass: any = [];
        Object.keys(params).forEach((key: string, idx: number) => {
            // @ts-ignore
            const val = params[key];
            paramPass.push(val);
            query += ` ${camelToSnakeCase(key)}=$${cnt}`
            cnt++
            if (idx < Object.keys(params).length - 1) query += ','
        });

        query += ` WHERE id = $` + (paramPass.length + 1)
        paramPass.push(taskId);
        await this.db.none(query, paramPass);
    }


    getBrokerageTasks = async (params: { brokerage?: string, userId?: string, status?: BrokerageTaskStatusType }): Promise<BrokerageTaskTable[]> => {
        let query = `SELECT id,
                            user_id,
                            created_at,
                            updated_at, date, started, brokerage, type, brokerage_user_id, status, finished, data, message_id
                     FROM brokerage_task `;

        let dbParams = [];
        const keys = Object.keys(params);
        if (keys.length > 0) query += ` WHERE `;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i] as string;

            // @ts-ignore
            const value = params[key];
            query += `${camelToSnakeCase(key)}=$${i + 1}`
            dbParams.push(value);
            if (keys.length > 1 && i < keys.length - 1) query += ` AND `
        }

        const results = await this.db.query(query, dbParams);
        if (results.length <= 0) return [];

        return results.map((r: any) => {
            let x: BrokerageTaskTable = {
                id: r.id,
                error: r.error,
                brokerage: r.brokerage,
                userId: r.user_id,
                status: r.status,
                updatedAt: DateTime.fromJSDate(r.updated_at),
                createdAt: DateTime.fromJSDate(r.created_at),
                date: DateTime.fromJSDate(r.date),
                type: r.type,
                data: r.data,
                brokerageUserId: r.brokerage_user_id,
                started: r.started ? DateTime.fromJSDate(r.started) : null,
                finished: r.finished ? DateTime.fromJSDate(r.finished) : null,
                messageId: r.message_id
            }
            return x;
        })
    }

    getOrInsertBrokerageTaskByMessageId = async (messageId: string, brokerageTask: BrokerageTask): Promise<number | null> => {
        // TODO: Refactor to be concurrency safe
        // TODO: Think of a better response type... maybe a object with exists, or an error?
        const query = `SELECT id
                       from brokerage_task
                       WHERE message_id = $1`
        const result = await this.db.oneOrNone(query, [messageId]);
        if (result) return null;

        const brokerageTaskQuery = `
            INSERT INTO brokerage_task(user_id, brokerage, status, type, date, brokerage_user_id, started, finished,
                                       data, error, message_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id;`
        const insertResult = await this.db.oneOrNone(brokerageTaskQuery, [brokerageTask.userId,
            brokerageTask.brokerage, brokerageTask.status, brokerageTask.type, brokerageTask.date, brokerageTask.brokerageUserId,
            brokerageTask.started, brokerageTask.finished, brokerageTask.data, brokerageTask.error, messageId
        ]);
        return insertResult.id;
    }

    getPendingBrokerageTask = async (): Promise<BrokerageTaskTable | null> => {
        const query = `UPDATE brokerage_task
                       SET started = CURRENT_TIMESTAMP,
                           status  = 'RUNNING'
                       WHERE id = (select id
                                   from brokerage_task
                                   WHERE started IS NULL
                                     AND status = 'PENDING'
                                   order by
                           date asc
                           , case
                           "type"
                           when 'NEW_ACCOUNT' then 1
                           when 'NEW_DATA' then 2
                           when 'TODO' then 3
        end
                                   LIMIT
        1 FOR
        UPDATE SKIP LOCKED)
            RETURNING id, user_id, brokerage, status, type, date, brokerage_user_id, started, finished, data, error, updated_at, created_at, message_id;`
        const result = await this.db.oneOrNone(query);
        if (!result) return null;

        return {
            id: result.id,
            userId: result.user_id,
            createdAt: DateTime.fromJSDate(result.created_at),
            updatedAt: DateTime.fromJSDate(result.updated_at),
            date: DateTime.fromJSDate(result.date),
            started: result.started ? DateTime.fromJSDate(result.started) : null,
            brokerage: result.brokerage,
            type: result.type,
            brokerageUserId: result.brokerage_user_id,
            status: result.status,
            finished: result.finished ? DateTime.fromJSDate(result.finished) : null,
            data: result.data,
            error: result.error,
            messageId: result.messageId
        }
    }

    getExistingTaskByDate = async (brokerage: DirectBrokeragesType, type: BrokerageTaskType, date: DateTime, userId: string, brokerageUserId: string): Promise<BrokerageTaskTable | null> => {
        const query = `
            select id,
                   user_id,
                   brokerage,
                   status,
                   type, date, -- Used for when to process in ASCENDING order
                brokerage_user_id, started, finished, data, error, updated_at, created_at, message_id
            from brokerage_task
            WHERE brokerage = $1
              AND type = $2
              AND date = $3
              AND user_id = $4
              AND brokerage_user_id = $5`;
        const result = await this.db.oneOrNone(query, [brokerage, type, date, userId, brokerageUserId]);
        if (!result) return null;
        return {
            id: result.id,
            userId: result.user_id,
            data: result.data,
            type: result.type,
            status: result.status,
            brokerageUserId: result.brokerage_user_id,
            brokerage: result.brokerage,
            date: DateTime.fromJSDate(result.date),
            started: result.started ? DateTime.fromJSDate(result.started) : null,
            finished: result.finished ? DateTime.fromJSDate(result.finished) : null,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
            error: result.error,
            messageId: result.message_id
        }
    }


    getExistingTask = async (brokerage: DirectBrokeragesType, status: BrokerageTaskStatusType, type: BrokerageTaskType, date: DateTime, userId: string, brokerageUserId: string): Promise<BrokerageTaskTable | null> => {
        const query = `
            select id,
                   user_id,
                   brokerage,
                   status,
                   type, date, -- Used for when to process in ASCENDING order
                brokerage_user_id, started, finished, data, error, updated_at, created_at, message_id
            from brokerage_task
            WHERE brokerage = $1
              AND status = $2
              AND type = $3
              AND date = $4
              AND user_id = $5
              AND brokerage_user_id = $6`;
        const result = await this.db.oneOrNone(query, [brokerage, status, type, date, userId, brokerageUserId]);
        if (!result) return null;
        return {
            id: result.id,
            userId: result.user_id,
            data: result.data,
            type: result.type,
            status: result.status,
            brokerageUserId: result.brokerage_user_id,
            brokerage: result.brokerage,
            date: DateTime.fromJSDate(result.date),
            started: result.started ? DateTime.fromJSDate(result.started) : null,
            finished: result.finished ? DateTime.fromJSDate(result.finished) : null,
            updatedAt: DateTime.fromJSDate(result.updated_at),
            createdAt: DateTime.fromJSDate(result.created_at),
            error: result.error,
            messageId: result.message_id
        }
    }

    scheduleTradingPostAccountForDeletion = async (accountId: number): Promise<void> => {
        const query = `UPDATE tradingpost_brokerage_account
                       SET hidden_for_deletion = TRUE
                       WHERE id IN ($1);`
        await this.db.none(query, [accountId]);
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

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
