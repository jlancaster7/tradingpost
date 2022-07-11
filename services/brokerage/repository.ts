import {IRepository} from "./interfaces";
import {RealizefiAccount, RealizefiUser, RealizefiAccountTransaction, RealizefiAccountPosition} from "./interfaces";
import {ColumnSet, IDatabase, IMain} from "pg-promise";

export default class Repository implements IRepository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db
        this.pgp = pgp;
    }

    addRealizefiAccountPositions = async (accountPositions: RealizefiAccountPosition[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'}, {name: 'symbol', prop: 'symbol'},
            {name: 'average_price', prop: 'averagePrice'}, {name: 'cost_basis', prop: 'costBasis'},
            {name: 'long_quantity', prop: 'longQuantity'}, {name: 'short_quantity', prop: 'shortQuantity'},
            {name: 'market_value', prop: 'marketValue'}, {
                name: 'current_day_profit_loss',
                prop: 'currentDayProfitLoss'
            },
            {name: 'current_day_profit_loss_percentage', prop: 'currentDayProfitLossPercentage'},
            {name: 'security_type', prop: 'securityType'}, {name: 'security_id', prop: 'securityId'},
            {name: 'security_symbol', prop: 'securitySymbol'},
            {name: 'security_share_class_figi', prop: 'securityShareClassFigi'},
            {name: 'security_composite_figi', prop: 'securityCompositeFigi'},
            {name: 'security_strike_price', prop: 'securityStrikePrice'},
            {name: 'security_expiration', prop: 'securityExpiration'},
            {name: 'security_contract_type', prop: 'securityContractType'},
            {name: 'security_primary_exchange', prop: 'securityPrimaryExchange'}
        ], {table: 'realizefi_account_positions'})
        const query = upsertReplaceQuery(accountPositions, cs, this.pgp, "account,symbol")
        await this.db.any(query);
    }

    addRealizefiAccountTransactions = async (accountTransactions: RealizefiAccountTransaction[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'}, {name: 'realizefi_transaction_id', prop: 'realizefiTransactionId'},
            {name: 'transaction_date', prop: 'transactionDate'}, {name: 'settlement_date', prop: 'settlementDate'},
            {name: 'transaction_type', prop: 'transactionType'}, {name: 'net_amount', prop: 'netAmount'},
            {name: 'transaction_type_detail', prop: 'transactionTypeDetail'},
            {name: 'transaction_sub_type', prop: 'transactionSubTypeDetail'}, {name: 'side', prop: 'side'},
            {name: 'quantity', prop: 'quantity'}, {name: 'price', prop: 'price'},
            {name: 'adjustment_ratio', prop: 'adjustmentRatio'}, {name: 'instrument', prop: 'instrument'},
            {name: 'symbol', prop: 'symbol'}, {name: 'fees', prop: 'fees'}
        ], {table: 'realizefi_account_transactions'});
        const query = upsertReplaceQuery(accountTransactions, cs, this.pgp, 'realizefi_transaction_id')
        await this.db.any(query);
    }

    addRealizefiAccounts = async (realizeAccounts: RealizefiAccount[]): Promise<void> => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'account_id', prop: 'accountId'},
            {name: 'realizefi_institution_id', prop: 'realizefiInstitutionId'},
            {name: 'institution', prop: 'institution'},
            {name: 'account_number', prop: 'accountNumber'},
            {name: 'health_status', prop: 'healthStatus'},
            {name: 'permission_scopes', prop: 'permissionScopes'},
            {name: 'buying_power', prop: 'buyingPower'},
            {name: 'cash', prop: 'cash'},
            {name: 'account_value', prop: 'accountValue'},
            {name: 'margin', prop: 'margin'}
        ], {table: 'realizefi_accounts'});
        const query = upsertReplaceQuery(realizeAccounts, cs, this.pgp, 'realizefi_institution_id');
        await this.db.any(query);
    }

    addRealizefiUser = async (realizefiUserId: string): Promise<RealizefiUser> => {
        const data = await this.db.one('INSERT INTO realizefi_users(realizefi_id) VALUES($1) RETURNING id;', [realizefiUserId]);
        return {id: data.id, realizefiId: realizefiUserId}
    }

    getRealizefiAccountPositions = async (userId: string): Promise<RealizefiAccountPosition[]> => {
        let query = `
            SELECT rap.id,
                   rap.account_id,
                   rap.symbol,
                   rap.average_price,
                   rap.cost_basis,
                   rap.long_quantity,
                   rap.short_quantity,
                   rap.market_value,
                   rap.current_day_profit_loss,
                   rap.current_day_profit_loss_percentage,
                   rap.security_type,
                   rap.security_id,
                   rap.security_symbol,
                   rap.security_share_class_figi,
                   rap.security_composite_figi,
                   rap.security_strike_price,
                   rap.security_expiration,
                   rap.security_contract_type,
                   rap.security_primary_exchange
            FROM realizefi_account_positions rap
                     INNER JOIN realizefi_accounts ra ON ra.id = rap.account_id
                     INNER JOIN realizefi_users ru ON ru.id = ra.account_id
            WHERE ru.user_id = $1`
        const data = await this.db.any(query, [userId]);
        let positions: RealizefiAccountPosition[] = [];
        for (const d of data) {
            positions.push({
                id: d.id,
                accountId: d.account_id,
                symbol: d.symbol,
                averagePrice: d.average_price,
                costBasis: d.cost_basis,
                longQuantity: d.long_quantity,
                shortQuantity: d.short_quantity,
                marketValue: d.market_value,
                currentDayProfitLoss: d.current_day_profit_loss,
                currentDayProfitLossPercentage: d.current_day_profit_loss_percentage,
                securityType: d.security_type,
                securityId: d.security_id,
                securitySymbol: d.security_symbol,
                securityShareClassFigi: d.security_share_class_figi,
                securityCompositeFigi: d.security_composite_figi,
                securityStrikePrice: d.security_strike_price,
                securityExpiration: d.security_expiration,
                securityContractType: d.security_contract_type,
                securityPrimaryExchange: d.security_primary_exchange
            })
        }
        return positions
    }

    getRealizefiAccountTransactions = async (userId: string): Promise<RealizefiAccountTransaction[]> => {
        const query = `SELECT rat.id,
                              rat.account_id,
                              rat.realizefi_transaction_id,
                              rat.transaction_date,
                              rat.settlement_date,
                              rat.transaction_type,
                              rat.net_amount,
                              rat.transaction_type_detail,
                              rat.transaction_sub_type_detail,
                              rat.side,
                              rat.quantity,
                              rat.price,
                              rat.adjustment_ratio,
                              rat.instrument,
                              rat.fees
                       FROM realizefi_account_transactions rat
                                INNER JOIN realizefi_accounts ra ON ra.id = rat.account_id
                                INNER JOIN realizefi_users ru ON ru.id = ra.account_id
                       WHERE ru.user_id = $1;`
        const data = await this.db.any(query, [userId]);
        let transactions: RealizefiAccountTransaction[] = [];
        for (const d of data) {
            transactions.push({
                symbol: d.symbol,
                id: d.id,
                accountId: d.account_id,
                realizefiTransactionId: d.realizefi_transaction_id,
                transactionDate: d.transaction_date,
                settlementDate: d.settlement_date,
                transactionType: d.transaction_type,
                netAmount: d.net_amount,
                transactionTypeDetail: d.transaction_type_detail,
                transactionSubTypeDetail: d.transaction_sub_type_detail,
                side: d.side,
                quantity: d.quantity,
                price: d.price,
                adjustmentRatio: d.adjustment_ratio,
                instrument: d.instrument,
                fees: d.fees
            })
        }
        return transactions
    }

    getRealizefiAccounts = async (realizeAccountId: string): Promise<RealizefiAccount[]> => {
        let query = `
            SELECT ra.id,
                   ra.account_id,
                   ra.realizefi_institution_id,
                   ra.institution,
                   ra.account_number,
                   ra.health_status,
                   ra.permission_scopes,
                   ra.buying_power,
                   ra.cash,
                   ra.account_value,
                   ra.margin
            FROM realizefi_accounts ra
                     INNER JOIN realizefi_users ru ON ru.id = ra.account_id
            WHERE ru.realizefi_id = $1;`
        const data = await this.db.any(query, [realizeAccountId]);
        let accounts: RealizefiAccount[] = [];
        for (const d of data) {
            accounts.push({
                id: d.id,
                accountId: d.account_id,
                realizefiInstitutionId: d.realizefi_institution_id,
                institution: d.institution,
                accountNumber: d.account_number,
                healthStatus: d.health_status,
                permissionScopes: d.permission_scopes,
                buyingPower: d.buying_power,
                cash: d.cash,
                accountValue: d.account_value,
                margin: d.margin,
            })
        }

        return accounts
    }

    getRealizefiUser = async (request: { tpUserId?: string; realizefiUserId?: string }): Promise<RealizefiUser | null> => {
        let query = 'SELECT id, realizefi_id from realizefi_users WHERE 1=1  ';
        if (request.realizefiUserId) query += ` AND realizefi_id='${request.realizefiUserId}'`
        if (request.tpUserId) query += ` AND user_id='${request.tpUserId}'`
        const data = await this.db.one(query);
        return {
            id: data.id,
            realizefiId: data.realizefi_id
        }
    }
}

function upsertReplaceQuery(data: any, cs: ColumnSet, pgp: IMain, conflict: string = "id") {
    return pgp.helpers.insert(data, cs) +
        ` ON CONFLICT(${conflict}) DO UPDATE SET ` +
        cs.columns.map(x => {
            let col = pgp.as.name(x.name);
            return `${col}=EXCLUDED.${col}`
        }).join();
}