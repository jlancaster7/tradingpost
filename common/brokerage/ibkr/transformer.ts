import {
    GetSecurityBySymbol,
    IbkrAccount,
    IbkrActivity,
    IbkrPosition,
    IbkrSecurity,
    InvestmentTransactionType,
    OptionContract,
    OptionContractTable,
    SecurityType,
    TradingPostBrokerageAccounts,
    TradingPostBrokerageAccountsTable,
    TradingPostCurrentHoldings,
    TradingPostCurrentHoldingsTable,
    TradingPostHistoricalHoldings,
    TradingPostTransactions
} from "../interfaces";
import {DateTime} from "luxon";
import {addSecurity} from "../../market-data/interfaces";
import {transformTransactionTypeAmount} from "../utils/utils";

export interface TransformerRepository {
    getTradingPostBrokerageAccountsByBrokerageAndIds(userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]>

    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>

    upsertTradingPostBrokerageAccounts(accounts: TradingPostBrokerageAccounts[]): Promise<void>

    getSecurities(securityIds: number[]): Promise<GetSecurityBySymbol[]>

    getSecuritiesBySymbol(symbols: string[]): Promise<GetSecurityBySymbol[]>

    addSecurities(securities: addSecurity[]): Promise<void>

    upsertOptionContracts(optionContracts: OptionContract[]): Promise<void>

    upsertTradingPostTransactions(transactions: TradingPostTransactions[]): Promise<void>

    upsertTradingPostHistoricalHoldings(historicalHoldings: TradingPostHistoricalHoldings[]): Promise<void>

    addTradingPostCurrentHoldings(currentHoldings: TradingPostCurrentHoldings[]): Promise<void>

    deleteTradingPostAccountCurrentHoldings(accountIds: number[]): Promise<void>

    getTradingPostBrokerageAccountCurrentHoldings(accountId: string): Promise<TradingPostCurrentHoldingsTable[]>

    getOptionContractsByExternalIds(externalIds: string[]): Promise<OptionContractTable[]>
}

const transformSecurityType = (type: string): SecurityType => {
    switch (type) {
        case "BILL": // Treasury Bills
            return SecurityType.fixedIncome;
        case "BOND":  // Bonds(includes corporate and municipal)
            return SecurityType.fixedIncome;
        case "CASH": // Forex
            return SecurityType.currency;
        case "CFD": // Contracts for Differences
            return SecurityType.unknown;
        case "CMDTY": // Gold or Silver (Metals)
            return SecurityType.index;
        case "CRYPTO": // Cryptocurrency
            return SecurityType.currency;
        case "DIVACC": // Dividend Accrual Balance
            return SecurityType.cashEquivalent;
        case "FOP": // Future Options
            return SecurityType.option;
        case "FSFOP": // Options on Futures (Futures Style)
            return SecurityType.option;
        case "FSOPT": // Options(Futures Style)
            return SecurityType.option;
        case "FUND": // Mutual Funds
            return SecurityType.mutualFund;
        case "FUT": // Futures
            return SecurityType.option;
        case "FXCFD": // Contract for Difference on Forex
            return SecurityType.currency;
        case "FXFWD": // FX Forwards
            return SecurityType.currency;
        case "IBGNOTE": // IB Notes
            return SecurityType.fixedIncome;
        case "INTACC": // Interest Accrual Balance
            return SecurityType.cashEquivalent;
        case "IOPT": // Structured Products
            return SecurityType.fixedIncome;
        case "OPT": // Equity and Index Options
            return SecurityType.option;
        case "STK":  // Stocks(includes ADR, ETF)
            return SecurityType.equity;
        case "WAR": // Warrants
            return SecurityType.option;
        default:
            throw new Error("no security type found for ibkr item")
    }
}

const transformTransactionType = (transactionType: string): InvestmentTransactionType => {
    switch (transactionType) {
        case "ADJ": // Adjustments(client fees/commission/option cash / position MTM/ price adjustments)
            return InvestmentTransactionType.fee;
        case "ASSIGN":
            return InvestmentTransactionType.transfer;
        case "BUY": // Buy
            return InvestmentTransactionType.buy
        case "CA": // cancel
            return InvestmentTransactionType.cancel
        case "CFD": // CFD interest and fees
            return InvestmentTransactionType.fee;
        case "CINT": // credit interest on cash balances
            return InvestmentTransactionType.dividendOrInterest
        case "CO": // Correct
            return InvestmentTransactionType.transfer
        case "CORP": // Corporate Actions(splits/mergers/acquisitions/etc.
            return InvestmentTransactionType.transfer
        case "COVER": // Cover short
            return InvestmentTransactionType.cover
        case "DCARD": // Debit/Prepaid Card Activity
            return InvestmentTransactionType.cash;
        case "DEL": // Transfer for securities(outgoing)
            return InvestmentTransactionType.transfer;
        case "DEP": // Deposit of Funds(including cash transferred in)
            return InvestmentTransactionType.cash;
        case "DINT": // Debit interest on cash balances and hard to borrow fees
            return InvestmentTransactionType.dividendOrInterest
        case "DIV": // Dividends
            return InvestmentTransactionType.dividendOrInterest
        case "DIVACC": // Dividend Accrual Activity
            return InvestmentTransactionType.dividendOrInterest
        case "DIVR": // Dividend Reinvestment
            return InvestmentTransactionType.buy
        case "DVPCA": // Cancelled DVP
            throw new Error("no transaction type for cancelled dvp");
        case "DVPIN": // Incoming DVP
            throw new Error("no transaction type for incoming dvp");
        case "DVPOUT": // Outgoing DVP
            throw new Error("no transaction type for outgoing dvp");
        case "EXE": // Exercise
                    // TODO: Check if its a call or a put before
            return InvestmentTransactionType.buy
        case "EXP": // Expire
            return InvestmentTransactionType.cancel
        case "FRTAX": // Foreign Tax Withholding
            return InvestmentTransactionType.fee
        case "GEA": // Expiration or assignment resulting from offsetting positions
            throw new Error("no transaction type for expiration or assignment");
        case "INSDEPXFR": // Insured Deposit Transfer
            return InvestmentTransactionType.cash
        case "INTACC": // Interest Accrual Activity
            return InvestmentTransactionType.dividendOrInterest
        case "INTP": // Investment Interest Paid
            return InvestmentTransactionType.dividendOrInterest
        case "INTR": // Investment Interest Received
            return InvestmentTransactionType.dividendOrInterest
        case "MFEE": // Management Fee
            return InvestmentTransactionType.fee
        case "OFEE": // Other fees including market data, order cancellations, etc.
            return InvestmentTransactionType.fee
        case "PIL": // Payment in Lieu of Dividends
            return InvestmentTransactionType.transfer
        case "REC": // Receipt of Securities(incoming)
            return InvestmentTransactionType.transfer;
        case "SCOM": // Settled Commission
            return InvestmentTransactionType.fee
        case "SELL": //Sell
            return InvestmentTransactionType.sell
        case "SHORT": // Sell Short
            return InvestmentTransactionType.short
        case "STAX": // Sales Tax
            return InvestmentTransactionType.fee
        case "TTAX": // Transaction Tax records that are reported separately from trades
            return InvestmentTransactionType.fee
        case "WITH": // Withdrawl of Funds(including cash transferred out)
            return InvestmentTransactionType.cash
        default:
            throw new Error("unrecognized transaction type for ibkr")
    }
}

export default class IbkrTransformer {
    private _repository: TransformerRepository;

    constructor(repository: TransformerRepository) {
        this._repository = repository;
    }

    importTradingPostBrokerageAccounts = async (processDate: DateTime, tpUserId: string, accounts: IbkrAccount[]) => {
        // Pull accounts, see if already exists, if so, then don't update(unless process_date is different)
        // upsert account then
        const tpAccounts = await this._repository.getTradingPostBrokerageAccounts(tpUserId);

        let filteredAccounts = accounts.filter(acc => {
            const tpAccount = tpAccounts.find(a => a.accountNumber === acc.accountId)
            if (!tpAccount) return true
            return tpAccount.updatedAt.toUnixInteger() < processDate.toUnixInteger();
        });

        await this._repository.upsertTradingPostBrokerageAccounts(filteredAccounts.map(fa => {
            let x: TradingPostBrokerageAccounts = {
                accountNumber: fa.accountId,
                error: false,
                userId: tpUserId,
                brokerName: "ibkr",
                errorCode: 0,
                mask: "",
                name: fa.accountTitle ? fa.accountTitle : "",
                type: fa.accountType ? fa.accountType : "",
                subtype: fa.type,
                status: fa.state ? fa.state : "",
                institutionId: 6723,
                officialName: "Interactive Brokers"
            }
            return x;
        }));
    }

    importTradingPostSecurities = async (processDate: DateTime, tpUserId: string, securitiesAndOptions: IbkrSecurity[]) => {
        const options = securitiesAndOptions.filter(sec => sec.optionType !== null);
        const securities = securitiesAndOptions.filter(sec => sec.optionType === null);

        console.log("Options Length", options.length);
        console.log("Securities Length", securities.length);

        const securitiesSymbols = securities.map(sec => sec.symbol);
        console.log("Getting Security Symbols")
        const tpSecurities = await this._repository.getSecuritiesBySymbol(securitiesSymbols);

        const newSecurities = securities.filter(sec => !tpSecurities.find(tpSec => tpSec.symbol === sec.symbol))
        console.log("Adding new securities")
        await this._repository.addSecurities(newSecurities.map(sec => {
            let x: addSecurity = {
                companyName: sec.description ? sec.description : "",
                address: null,
                ceo: null,
                state: null,
                country: null,
                zip: null,
                address2: null,
                exchange: sec.primaryExchange,
                description: sec.description,
                symbol: sec.symbol,
                logoUrl: null,
                sector: null,
                industry: null,
                phone: null,
                tags: null,
                website: null,
                primarySicCode: null,
                securityName: sec.description,
                employees: null,
                issueType: sec.issuer
            }
            return x
        }));

        const optionsSymbols = options.map(opt => opt.underlyingSymbol as string);
        console.log("Fetching securities again")
        const tpOptionsSecurities = await this._repository.getSecuritiesBySymbol(optionsSymbols);
        let tpOptionsMap: Record<string, number> = {};
        tpOptionsSecurities.forEach(tp => tpOptionsMap[tp.symbol] = tp.id);

        const tpOptions = options.map(opt => {
            let optionType = "";
            if (optionType === "C") optionType = "Call";
            else if (optionType === "P") optionType = "Put";
            else throw new Error("unrecognized option type");

            if (opt.expirationDate === null) throw new Error("no expiration date set for option");
            if (opt.optionStrike === null) throw new Error("no option strike price");

            let x: OptionContract = {
                securityId: tpOptionsMap[opt.underlyingSymbol as string],
                type: optionType,
                expiration: opt.expirationDate,
                strikePrice: opt.optionStrike,
                externalId: opt.symbol
            }

            return x;
        })
        console.log("Upserting contracts")
        await this._repository.upsertOptionContracts(tpOptions);
    }

    importTradingPostTransactions = async (processDate: DateTime, tpUserId: string, transactions: IbkrActivity[]) => {
        const optionTransactions = transactions.filter(tx => {
            if (tx.assetType === null) throw new Error("asset type is null")
            const secType = transformSecurityType(tx.assetType);
            return secType === SecurityType.option;
        });

        const securitiesTransactions = transactions.filter(tx => {
            if (tx.assetType === null) throw new Error("asset type is null");
            const secType = transformSecurityType(tx.assetType);
            return secType !== SecurityType.option;
        })

        const securitiesMap = await this._getSecurities(securitiesTransactions);
        const optionsMap = await this._getOptions(optionTransactions);
        const tpAccountMap = await this._getAccounts(tpUserId, transactions);

        const tpTransactions = transactions.map(tx => {
            if (tx.transactionType === null) throw new Error("transaction type is null");

            let securityType = SecurityType.cashEquivalent;
            if (tx.assetType !== null) securityType = transformSecurityType(securityType);

            if (tx.quantity === null) throw new Error("quantity is null");
            if (tx.unitPrice === null) throw new Error("unit price is null");
            if (tx.grossAmount === null) throw new Error("gross amount is null");
            let date = tx.orderTime
            if (date === null) {
                if (tx.settleDate === null)
                    throw new Error("order time and settle date is null")
                date = tx.settleDate;
            }

            let optionId = null;
            let symbol = tx.symbol as string;
            if (securityType === SecurityType.option) {
                optionId = optionsMap[symbol].id;
                symbol = symbol.split(" ")[0];
            }

            const transactionType = transformTransactionType(tx.transactionType);
            let x: TradingPostTransactions = {
                accountId: tpAccountMap[tx.accountId].id,
                currency: tx.currency,
                amount: tx.grossAmount,
                date: date,
                price: tx.unitPrice,
                type: transactionType,
                fees: tx.secFee,
                optionId: optionId,
                quantity: tx.quantity,
                securityId: securitiesMap[symbol].id,
                securityType: securityType,
            }

            return transformTransactionTypeAmount(transactionType, x);
        });

        console.log(tpTransactions);
        await this._repository.upsertTradingPostTransactions(tpTransactions);
    }

    importTradingPostHoldings = async (processDate: DateTime, tpUserId: string, ibkrHoldings: IbkrPosition[]) => {
        const tpAccountIdMap = await this._getAccounts(tpUserId, ibkrHoldings);
        const securitiesMapBySymbol = await this._getSecurities(ibkrHoldings);
        const optionsMapping = await this._getOptions(ibkrHoldings);

        const historicalHoldings = ibkrHoldings.map(h => {
            if (h.assetType === null) throw new Error("no type for ibkr holding");
            const securityType = transformSecurityType(h.assetType);

            let symbol = h.symbol
            if (securityType === SecurityType.cashEquivalent) symbol = "USD:CUR";

            if (symbol === null) throw new Error("no symbol for ibkr holding");

            if (h.marketPrice === null) throw new Error("no market price for ibkr holding");
            if (h.marketValue === null) throw new Error("no market value for ibkr holding");
            if (h.quantity === null) throw new Error("no quantity for ibkr holding");


            let optionId: number | null = null;
            if (securityType === SecurityType.option) {
                console.log(" OPTION symbol: !!! WOOOT ", symbol);
                optionId = optionsMapping[symbol].id
                symbol = symbol.split(" ")[0];
                console.log("OPTION SET!")
            }

            console.log("SETTING ACCOUNT: ", h.accountId);
            console.log("SYMBOL ", symbol);
            try {
                let x: TradingPostHistoricalHoldings = {
                    accountId: tpAccountIdMap[h.accountId].id,
                    price: h.marketPrice,
                    costBasis: h.costBasis,
                    date: h.reportDate,
                    currency: h.currency,
                    optionId: optionId,
                    securityId: securitiesMapBySymbol[symbol].id,
                    value: h.marketValue,
                    priceAsOf: h.reportDate,
                    priceSource: "ibkr",
                    quantity: h.quantity,
                    securityType: securityType,
                }
                return x;
            } catch (e) {
                console.log(securitiesMapBySymbol);
                console.log(tpAccountIdMap)
                throw e;
            }
        });

        await this._repository.upsertTradingPostHistoricalHoldings(historicalHoldings)

        // Get an accounts last process time
        const tpAccountMapKeys = Object.keys(tpAccountIdMap)
        for (let i = 0; i < tpAccountMapKeys.length; i++) {
            const tpAccount = tpAccountIdMap[tpAccountMapKeys[i]];
            const holdings = await this._repository.getTradingPostBrokerageAccountCurrentHoldings(tpAccount.accountNumber);
            if (holdings.length <= 0) continue;
            if (holdings[0].holdingDate.toUnixInteger() < processDate.toUnixInteger()) return
            else break
        }

        const currentHoldings = ibkrHoldings.map(h => {
            if (h.assetType === null) throw new Error("no type for ibkr holding");
            const securityType = transformSecurityType(h.assetType);

            let symbol = h.symbol;
            if (securityType === SecurityType.cashEquivalent) symbol = "USD:CUR";
            if (symbol === null) throw new Error("no symbol for ibkr holding");

            if (h.marketPrice === null) throw new Error("no market price for ibkr holding");
            if (h.marketValue === null) throw new Error("no market value for ibkr holding");
            if (h.quantity === null) throw new Error("no quantity for ibkr holding");


            let optionId: number | null = null;
            if (securityType === SecurityType.option) {
                optionId = optionsMapping[symbol].id
                symbol = symbol.split(" ")[0];
            }

            let x: TradingPostCurrentHoldings = {
                accountId: tpAccountIdMap[h.accountId].id,
                priceSource: "ibkr",
                value: h.marketValue,
                priceAsOf: h.reportDate,
                price: h.marketPrice,
                optionId: optionId,
                currency: h.currency,
                quantity: h.quantity,
                costBasis: h.costBasis,
                securityType: securityType,
                securityId: securitiesMapBySymbol[symbol].id,
                holdingDate: processDate
            }
            return x
        })

        await this._repository.deleteTradingPostAccountCurrentHoldings(tpAccountMapKeys.map((k) => tpAccountIdMap[k].id));
        await this._repository.addTradingPostCurrentHoldings(currentHoldings);
    }

    _getAccounts = async <T extends { accountId: string }>(tpUserId: string, ibkrWithAccount: T[]): Promise<Record<string, TradingPostBrokerageAccountsTable>> => {
        let ibkrAccountIdMap: Record<string, null> = {}
        ibkrWithAccount.forEach(acc => ibkrAccountIdMap[acc.accountId] = null);
        let accountIds = Object.keys(ibkrAccountIdMap);
        const accounts = await this._repository.getTradingPostBrokerageAccountsByBrokerageAndIds(tpUserId, "ibkr", accountIds);
        let tpAccountIdMap: Record<string, TradingPostBrokerageAccountsTable> = {};
        accounts.forEach(acc => tpAccountIdMap[acc.accountNumber] = acc);
        return tpAccountIdMap
    }

    _getSecurities = async <T extends { symbol: string | null }>(ibkrWithSymbols: T[]): Promise<Record<string, GetSecurityBySymbol>> => {
        const symbols = ibkrWithSymbols.filter(i => i.symbol !== null).map(i => i.symbol as string);
        if (!symbols || symbols.length <= 0) return {};
        const securities = await this._repository.getSecuritiesBySymbol([...symbols, "USD:CUR"]);

        let securitiesMapBySymbol: Record<string, GetSecurityBySymbol> = {};
        securities.forEach(sec => securitiesMapBySymbol[sec.symbol] = sec);
        return securitiesMapBySymbol;
    }

    _getOptions = async <T extends { symbol: string | null, securityDescription: string | null }>(ibkrOptions: T[]): Promise<Record<string, OptionContractTable>> => {
        const options = await this._repository.getOptionContractsByExternalIds(ibkrOptions.map(s => s.symbol as string));
        let optionsMap: Record<string, OptionContractTable> = {};
        options.forEach(opt => optionsMap[opt.externalId as string] = opt);
        return optionsMap;
    }
}