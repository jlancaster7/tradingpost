import {
    OptionContractTableWithRobinhoodId,
    RobinhoodAccount,
    RobinhoodInstrumentTable,
    RobinhoodOptionTable,
    RobinhoodPosition,
    RobinhoodTransaction,
    RobinhoodUserTable
} from "./interfaces";
import {
    DirectBrokeragesType,
    GetSecurityBySymbol,
    InvestmentTransactionType,
    SecurityTableWithLatestPriceRobinhoodId,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountsTable,
    TradingPostBrokerageAccountStatus,
    TradingPostCurrentHoldings,
    TradingPostHistoricalHoldings,
    TradingPostTransactions
} from "../interfaces";
import {DateTime} from "luxon";
import TransformerBase, {BaseRepository} from "../base-transformer";

interface Repository extends BaseRepository {
    getRobinhoodInstrumentBySymbol(symbol: string): Promise<RobinhoodInstrumentTable | null>

    getCashSecurityId(): Promise<GetSecurityBySymbol>

    getSecurityWithLatestPricingWithRobinhoodIds(rhIds: number[]): Promise<SecurityTableWithLatestPriceRobinhoodId[]>

    getTradingPostOptionsWithRobinhoodOptionIds(rhOptionIds: number[]): Promise<OptionContractTableWithRobinhoodId[]>

    getRobinhoodOption(internalOptionId: number): Promise<RobinhoodOptionTable | null>

    getSecuritiesBySymbol(symbols: string[]): Promise<GetSecurityBySymbol[]>

    getTradingPostBrokerageAccountsByBrokerageAndIds(userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]>
}

export default class Transformer extends TransformerBase {
    private _repo: Repository;

    constructor(repo: Repository) {
        super(repo);
        this._repo = repo;
    }

    _getSecurities = async (rhInternalSecurityIds: number[]): Promise<Record<number, SecurityTableWithLatestPriceRobinhoodId>> => {
        const results = await this._repo.getSecurityWithLatestPricingWithRobinhoodIds(rhInternalSecurityIds);
        const response: Record<number, SecurityTableWithLatestPriceRobinhoodId> = {};
        results.map(r => response[r.rhInternalId] = r);
        return response;
    }

    _getOptions = async (rhOptionIds: number[]): Promise<Record<number, number>> => {
        const tpOptions = await this._repo.getTradingPostOptionsWithRobinhoodOptionIds(rhOptionIds);
        let internalRhOptionToInternalTpOption: Record<number, number> = {};
        rhOptionIds.forEach(r => internalRhOptionToInternalTpOption[r] = 0);

        tpOptions.forEach(tpOption => internalRhOptionToInternalTpOption[tpOption.internalRobinhoodOptionId] = tpOption.id);
        const internalRhIds = Object.keys(internalRhOptionToInternalTpOption).map(k => parseInt(k));
        for (let i = 0; i < internalRhIds.length; i++) {
            const internalRhId = internalRhIds[i];
            const internalTpId = internalRhOptionToInternalTpOption[internalRhId];

            // CREATE THE OPTION IT DOESN'T EXIST
            if (internalTpId === 0) {
                const robinhoodOption = await this._repo.getRobinhoodOption(internalRhId);
                if (robinhoodOption === null) throw new Error("could not get robinhood option");

                const securities = await this._repo.getSecuritiesBySymbol([robinhoodOption.chainSymbol as string]);
                if (securities.length <= 0) throw new Error("could not find security for option contract")
                const security = securities[0];

                const tpOptionId = await this._repo.upsertOptionContract({
                    type: robinhoodOption.type,
                    expiration: robinhoodOption.expirationDate,
                    securityId: security.id,
                    externalId: robinhoodOption.externalId,// CREATe eXterNAL ID,
                    strikePrice: robinhoodOption.strikePrice,
                });

                if (tpOptionId === null) throw new Error("couldnt insert option id")
                internalRhOptionToInternalTpOption[internalRhId] = tpOptionId
            }
        }

        return internalRhOptionToInternalTpOption
    }

    _getAccounts = async (userId: string, accountNumbers: string[]): Promise<Record<number, TradingPostBrokerageAccountsTable>> => {
        const accs = await this._repo.getTradingPostBrokerageAccountsByBrokerageAndIds(userId, 'Robinhood', accountNumbers);
        let res: Record<string, TradingPostBrokerageAccountsTable> = {};
        accs.forEach((acc) => res[acc.accountNumber] = acc)
        return res;
    }

    accounts = async (userId: string, institutionId: number, user: RobinhoodUserTable, accounts: RobinhoodAccount[]): Promise<number[]> => {
        return await this.upsertAccounts(accounts.map(acc => {
            let x: TradingPostBrokerageAccounts = {
                userId: userId,
                accountNumber: acc.accountNumber,
                error: false,
                institutionId: institutionId,
                type: acc.brokerageAccountType ? acc.brokerageAccountType : "Brokerage",
                subtype: acc.type,
                officialName: "", // TODO: Make user call when registering an account and piece meal together
                errorCode: 0,
                mask: "",
                name: user.username,
                status: "active",
                brokerName: DirectBrokeragesType.Robinhood,
                hiddenForDeletion: false,
                accountStatus: TradingPostBrokerageAccountStatus.PROCESSING,
                authenticationService: "Robinhood"
            }

            return x
        }))
    }

    positions = async (userId: string, positions: RobinhoodPosition[]) => {
        let accountMap: Record<string, TradingPostBrokerageAccountsTable> = await this._getAccounts(userId, positions.filter(p => p.accountNumber !== null).map(p => p.accountNumber as string));
        let securityMap: Record<number, SecurityTableWithLatestPriceRobinhoodId> = await this._getSecurities(positions.map(p => p.internalInstrumentId));
        let optionsMap: Record<number, number> = await this._getOptions(positions.filter(p => p.internalOptionId !== null).map(p => p.internalOptionId as number));

        const internalRobinhoodCash = await this._repo.getRobinhoodInstrumentBySymbol("USD:CUR");
        if (!internalRobinhoodCash) throw new Error("no cash security created for robinhood");

        const tpPositions: TradingPostCurrentHoldings[] = [];
        for (let i = 0; i < positions.length; i++) {
            const rhPos = positions[i];

            if (rhPos.accountNumber === null) throw new Error("NO ACCOUNT NUMBER");

            let account = accountMap[rhPos.accountNumber];
            let security = securityMap[rhPos.internalInstrumentId];
            if (!security) {
                console.warn("could not find security ", rhPos.internalInstrumentId)
                continue
            }

            let securityType = SecurityType.equity;
            if (rhPos.internalInstrumentId === internalRobinhoodCash.id) {
                securityType = SecurityType.cashEquivalent;
            }

            let optionId = null;
            if (rhPos.internalOptionId) {
                let foundOptionId = optionsMap[rhPos.internalOptionId]
                if (!foundOptionId) throw new Error("option id set, could not find")
                securityType = SecurityType.option;
                optionId = foundOptionId;
            }

            const holdingDate = DateTime.now().setZone("America/New_York").set({
                millisecond: 0,
                minute: 0,
                hour: 0,
                second: 0
            });

            const avgPriceFloat = parseFloat(rhPos.averagePrice)
            const quantityFloat = parseFloat(rhPos.quantity);

            tpPositions.push({
                accountId: account.id,
                costBasis: avgPriceFloat * quantityFloat,
                currency: 'USD',
                holdingDate: holdingDate,
                optionId: optionId,
                price: security.latestPrice || 1,
                priceAsOf: DateTime.now(),
                priceSource: 'IEX',
                quantity: quantityFloat,
                securityId: security.id,
                securityType: securityType,
                value: (security.latestPrice || 1) * quantityFloat,
            });
        }

        await this.upsertPositions(tpPositions, Object.keys(accountMap).map(key => accountMap[key].id))
        await this.holdingsHistory(userId, tpPositions);
    }

    transactions = async (userId: string, transactions: RobinhoodTransaction[]) => {
        let accountMap: Record<string, TradingPostBrokerageAccountsTable> = await this._getAccounts(userId, transactions.filter(p => p.accountNumber !== null).map(p => p.accountNumber as string));
        let securityMap: Record<number, SecurityTableWithLatestPriceRobinhoodId> = await this._getSecurities((transactions.map(p => p.internalInstrumentId)));
        let optionsMap: Record<number, number> = await this._getOptions(transactions.filter(p => p.internalOptionId !== null).map(p => p.internalOptionId as number));

        const internalRobinhoodCash = await this._repo.getRobinhoodInstrumentBySymbol("USD:CUR");
        if (!internalRobinhoodCash) throw new Error("no cash security created for robinhood");

        const tpTransactions: TradingPostTransactions[] = [];
        for (let i = 0; i < transactions.length; i++) {
            const rhTx = transactions[i];

            if (rhTx.accountNumber === null) throw new Error("no account number");

            let internalAccount = accountMap[rhTx.accountNumber];

            let securityType = SecurityType.equity;
            if (rhTx.internalInstrumentId === internalRobinhoodCash.id) {
                securityType = SecurityType.cashEquivalent;
            }

            let security = securityMap[rhTx.internalInstrumentId];
            if (!security) {
                console.log(rhTx);
                throw new Error("security not found for robinhood transactions");
            }

            let optionId = null;
            if (rhTx.internalOptionId !== null) {
                let tmpOptionId = optionsMap[rhTx.internalOptionId];
                if (!tmpOptionId) throw new Error("option id set, could not find tx");
                securityType = SecurityType.option;
                optionId = tmpOptionId;
            }

            const investmentType = rhTxTypeToTpTxType(rhTx.type, rhTx.side);

            tpTransactions.push({
                accountId: internalAccount.id,
                type: investmentType,
                amount: rhTx.executionsQuantity,
                currency: "USD",
                optionId: optionId,
                price: rhTx.executionsPrice,
                date: rhTx.executionsTimestamp,
                securityType: securityType,
                fees: rhTx.fees ? parseFloat(rhTx.fees) : 0,
                securityId: security.id,
                quantity: rhTx.executionsQuantity,
                accountGroupId: undefined,
                optionInfo: null,
            });
        }

        await this.upsertTransactions(tpTransactions);
    }

    holdingsHistory = async (userId: string, positions: TradingPostCurrentHoldings[]) => {
        const hh = positions.map(p => {
            let x: TradingPostHistoricalHoldings = {
                accountId: p.accountId,
                price: p.price,
                securityId: p.securityId,
                securityType: p.securityType,
                priceAsOf: p.priceAsOf,
                priceSource: p.priceSource,
                value: p.value,
                costBasis: p.costBasis,
                quantity: p.quantity,
                currency: p.currency,
                optionId: p.optionId,
                date: p.holdingDate
            }
            return x;
        })

        await this.upsertHistoricalHoldings(hh);
    }
}

const rhTxTypeToTpTxType = (rhType: string | null, side: string | null): InvestmentTransactionType => {
    if (rhType === null) throw new Error("no type set")
    switch (rhType) {
        case 'cash':
            return InvestmentTransactionType.cash;
        case 'interest':
            return InvestmentTransactionType.dividendOrInterest;
        case 'dividend':
            return InvestmentTransactionType.dividendOrInterest;
        case 'market': {
            if (side === null) throw new Error("no side to market");
            if (side === 'sell') return InvestmentTransactionType.sell;
            if (side === 'buy') return InvestmentTransactionType.buy;
        }
        case 'limit': {
            if (side === null) throw new Error("no side to limit");
            if (side === 'buy') return InvestmentTransactionType.buy;
            if (side === 'sell') return InvestmentTransactionType.sell;
        }
        default:
            throw new Error(`rh type ${rhType} not detected`)
    }
    return InvestmentTransactionType.buy
}