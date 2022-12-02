import {
    OptionContractTableWithRobinhoodId,
    RobinhoodAccount,
    RobinhoodInstrumentTable, RobinhoodOptionTable,
    RobinhoodPosition,
    RobinhoodUserTable
} from "./interfaces";
import {
    GetSecurityBySymbol,
    OptionContract, SecurityTableWithLatestPriceRobinhoodId,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountsTable,
    TradingPostCurrentHoldings
} from "../interfaces";
import {DateTime} from "luxon";

interface Repository {
    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<number[]>

    upsertTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    deleteTradingPostAccountCurrentHoldings(accountIds: number[]): Promise<void>

    getRobinhoodInstrumentBySymbol(symbol: string): Promise<RobinhoodInstrumentTable | null>

    getCashSecurityId(): Promise<GetSecurityBySymbol>

    getSecurityWithLatestPricingWithRobinhoodIds(rhIds: number[]): Promise<SecurityTableWithLatestPriceRobinhoodId[]>

    getTradingPostOptionsWithRobinhoodOptionIds(rhOptionIds: number[]): Promise<OptionContractTableWithRobinhoodId[]>

    upsertOptionContract(oc: OptionContract): Promise<number | null>

    getRobinhoodOption(internalOptionId: number): Promise<RobinhoodOptionTable | null>

    getSecuritiesBySymbol(symbols: string[]): Promise<GetSecurityBySymbol[]>

    getTradingPostBrokerageAccountsByBrokerageAndIds(userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]>
}

export default class Transformer {
    private _repo: Repository;

    constructor(repo: Repository) {
        this._repo = repo;
    }

    _getSecurities = async (rhInternalSecurityIds: number[]): Promise<Record<number, SecurityTableWithLatestPriceRobinhoodId>> => {
        const results = await this._repo.getSecurityWithLatestPricingWithRobinhoodIds(rhInternalSecurityIds);
        const response: Record<number, SecurityTableWithLatestPriceRobinhoodId> = {};
        results.map(r => response[r.rhInternalId] = r);
        return response;
    }

    _getOptions = async (rhOptionIds: number[]): Promise<Record<number, number>> => {
        console.log("o")
        const tpOptions = await this._repo.getTradingPostOptionsWithRobinhoodOptionIds(rhOptionIds);
        console.log("f")
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

    accounts = async (userId: string, institutionId: number, user: RobinhoodUserTable, accounts: RobinhoodAccount[]) => {
        const tpAccounts = accounts.map(acc => {
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
                brokerName: "Robinhood"
            }

            return x
        })
        console.log(tpAccounts)
        await this._repo.upsertTradingPostBrokerageAccounts(tpAccounts);
    }

    positions = async (userId: string, positions: RobinhoodPosition[]) => {
        console.log("h")
        let accountMap: Record<string, TradingPostBrokerageAccountsTable> = await this._getAccounts(userId, positions.filter(p => p.accountNumber !== null).map(p => p.accountNumber as string));
        console.log("sec")
        let securityMap: Record<number, SecurityTableWithLatestPriceRobinhoodId> = await this._getSecurities(positions.map(p => p.internalInstrumentId));
        console.log("opts")
        let optionsMap: Record<number, number> = await this._getOptions(positions.filter(p => p.internalOptionId !== null).map(p => p.internalOptionId as number));

        console.log("cash")
        const internalRobinhoodCash = await this._repo.getRobinhoodInstrumentBySymbol("CUR:USD");
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

        console.log("accs")
        const internalIds: number[] = Object.keys(accountMap).map(key => accountMap[key].id)
        await this._repo.deleteTradingPostAccountCurrentHoldings(internalIds);
        console.log("up")
        await this._repo.upsertTradingPostCurrentHoldings(tpPositions);
    }
}