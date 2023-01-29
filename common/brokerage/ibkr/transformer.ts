import {
    DirectBrokeragesType,
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
    TradingPostBrokerageAccountStatus,
    TradingPostCurrentHoldings,
    TradingPostCurrentHoldingsTableWithMostRecentHolding,
    TradingPostHistoricalHoldings,
    TradingPostTransactions
} from "../interfaces";
import {DateTime} from "luxon";
import {addSecurity, PriceSourceType} from "../../market-data/interfaces";
import BaseTransformer, {BaseRepository, transformTransactionTypeAmount} from "../base-transformer"
import {filter} from "mathjs";

export interface TransformerRepository extends BaseRepository {
    getTradingPostBrokerageAccountsByBrokerageAndIds(userId: string, brokerage: string, brokerageAccountIds: string[]): Promise<TradingPostBrokerageAccountsTable[]>

    getTradingPostBrokerageAccounts(userId: string): Promise<TradingPostBrokerageAccountsTable[]>

    getSecuritiesBySymbol(symbols: string[]): Promise<GetSecurityBySymbol[]>

    addSecurities(securities: addSecurity[]): Promise<void>

    upsertOptionContracts(optionContracts: OptionContract[]): Promise<void>

    getTradingPostBrokerageWithMostRecentHolding(tpUserId: string, brokerage: string): Promise<TradingPostCurrentHoldingsTableWithMostRecentHolding[]>

    getOptionContractsByExternalIds(externalIds: string[]): Promise<OptionContractTable[]>

    updateTradingPostBrokerageAccountLastUpdated(userId: string, brokerageUserId: string, brokerageName: string): Promise<DateTime>
}

const transformSecurityType = (type: string): SecurityType => {
    switch (type) {
        case "BILL": // Treasury Bills
            return SecurityType.fixedIncome;
        case "BOND":  // Bonds(includes corporate and municipal)
            return SecurityType.fixedIncome;
        case "CASH": // Forex
            return SecurityType.cashEquivalent;
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
            throw new Error(`no security type found for ibkr item ${type}`)
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

export default class IbkrTransformer extends BaseTransformer {
    private _repository: TransformerRepository;

    constructor(repository: TransformerRepository) {
        super(repository);
        this._repository = repository;
    }

    accounts = async (processDate: DateTime, tpUserId: string, accounts: IbkrAccount[]): Promise<number[]> => {
        // Pull accounts, see if already exists, if so, then don't update(unless process_date is different)
        // upsert account then
        // We only want to update our master account with last_updated so that we know
        const tpAccounts = await this._repository.getTradingPostBrokerageAccounts(tpUserId);
        let accountIdToLastUpdate = null;
        let filteredAccounts = accounts.filter(acc => {
            if (acc.masterAccountId === null) {
                accountIdToLastUpdate = acc.accountId;
                return false;
            }

            const tpAccount = tpAccounts.find(a => a.accountNumber === acc.accountId)
            if (!tpAccount) return true
            return tpAccount.updatedAt.toUnixInteger() < processDate.toUnixInteger();
        });

        const transformedAccounts = filteredAccounts.map(fa => {
            let x: TradingPostBrokerageAccounts = {
                accountNumber: fa.accountId,
                error: false,
                userId: tpUserId,
                brokerName: DirectBrokeragesType.Ibkr,
                errorCode: 0,
                mask: "",
                name: fa.accountTitle ? fa.accountTitle : "",
                type: fa.accountType ? fa.accountType : "",
                subtype: fa.type,
                status: fa.state ? fa.state : "",
                institutionId: 6723,
                officialName: "Interactive Brokers",
                hiddenForDeletion: false,
                accountStatus: TradingPostBrokerageAccountStatus.PROCESSING,
                authenticationService: "Ibkr"
            }
            return x;
        });
        const newAccountNumbers = await this.upsertAccounts(transformedAccounts);
        if (!accountIdToLastUpdate) throw new Error("could not get account id to last update");
        await this._repository.updateTradingPostBrokerageAccountLastUpdated(tpUserId, accountIdToLastUpdate, DirectBrokeragesType.Ibkr)
        return newAccountNumbers;
    }

    securities = async (processDate: DateTime, tpUserId: string, securitiesAndOptions: IbkrSecurity[]) => {
        const options = securitiesAndOptions.filter(sec => sec.underlyingSymbol !== null);
        const securities = securitiesAndOptions.filter(sec => sec.underlyingSymbol === null);
        const securitiesSymbols = securities.map(sec => sec.symbol);
        const tpSecurities = await this._repository.getSecuritiesBySymbol(securitiesSymbols);

        const newSecurities = securities.filter(sec => !tpSecurities.find(tpSec => tpSec.symbol === sec.symbol))
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
                issueType: sec.issuer,
                priceSource: PriceSourceType.IBKR,
                enableUtp: false
            }
            return x
        }));

        const optionsSymbols = options.map(opt => opt.underlyingSymbol as string);
        const tpOptionsSecurities = await this._repository.getSecuritiesBySymbol(optionsSymbols);
        let tpOptionsMap: Record<string, number> = {};
        tpOptionsSecurities.forEach(tp => tpOptionsMap[tp.symbol] = tp.id);

        const tpOptions = options.map(opt => {
            let optionType = "";
            if (optionType === "C" || optionType === null) optionType = "Call";
            else if (optionType === "P") optionType = "Put";

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
        await this._repository.upsertOptionContracts(tpOptions);
    }

    transactions = async (processDate: DateTime, tpUserId: string, transactions: IbkrActivity[]) => {
        const optionTransactions = transactions.filter(tx => {
            if (tx.transactionType === null) throw new Error("transaction type is null");
            const transactionType = transformTransactionType(tx.transactionType);
            if (transactionType === InvestmentTransactionType.dividendOrInterest ||
                transactionType === InvestmentTransactionType.cash ||
                transactionType === InvestmentTransactionType.fee
            ) {
                return false;
            }

            if (tx.assetType === null) throw new Error("asset type is null")
            const secType = transformSecurityType(tx.assetType);
            return secType === SecurityType.option;
        });

        const securitiesMap = await this._getSecurities(transactions);
        const optionsMap = await this._getOptions(optionTransactions);
        const tpAccountMap = await this._getAccounts(tpUserId, transactions);

        let tpTransactions: TradingPostTransactions[] = [];
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.transactionType === null) throw new Error("transaction type is null");
            if (tx.quantity === null) throw new Error("quantity is null");
            if (tx.unitPrice === null) throw new Error("unit price is null");
            if (tx.grossAmount === null) throw new Error("gross amount is null");

            const internalAccount = tpAccountMap[tx.accountId];
            if (!internalAccount) continue;

            const transactionType = transformTransactionType(tx.transactionType);
            let securityType = SecurityType.cashEquivalent;
            if (tx.assetType !== null) securityType = transformSecurityType(tx.assetType);

            let optionId = null;
            let symbol = tx.symbol as string;
            if (securityType === SecurityType.option) {
                optionId = optionsMap[symbol].id
                symbol = symbol.split(" ")[0].trim();
            }

            let date = tx.orderTime
            if (date === null) date = processDate;

            if (!symbol && (
                transactionType === InvestmentTransactionType.fee ||
                transactionType === InvestmentTransactionType.dividendOrInterest ||
                transactionType === InvestmentTransactionType.cash)
            ) symbol = 'USD:CUR'

            const x: TradingPostTransactions = transformTransactionTypeAmount(transactionType, {
                accountId: internalAccount.id,
                currency: tx.currency,
                amount: tx.net ? tx.net : 0,
                date: date,
                price: tx.unitPrice,
                type: transactionType,
                fees: (tx.secFee ? tx.secFee : 0) + (tx.commission ? tx.commission : 0),
                optionId: optionId,
                quantity: tx.quantity,
                securityId: securitiesMap[symbol].id,
                securityType: securityType,
            });
            tpTransactions.push(x);
        }

        await this.upsertTransactions(tpTransactions);
    }

    holdings = async (processDate: DateTime, tpUserId: string, ibkrHoldings: IbkrPosition[]) => {
        const tpAccountIdMap = await this._getAccounts(tpUserId, ibkrHoldings);
        const securitiesMapBySymbol = await this._getSecurities(ibkrHoldings);
        const optionsMapping = await this._getOptions(ibkrHoldings);

        let historicalHoldings: TradingPostHistoricalHoldings[] = [];
        for (let i = 0; i < ibkrHoldings.length; i++) {
            const h = ibkrHoldings[i];
            if (h.assetType === null) throw new Error("no type for ibkr holding");
            if (h.marketPrice === null) throw new Error("no market price for ibkr holding");
            if (h.marketValue === null) throw new Error("no market value for ibkr holding");
            if (h.quantity === null) throw new Error("no quantity for ibkr holding");

            const internalAccount = tpAccountIdMap[h.accountId];
            if (!internalAccount) continue;

            const securityType = transformSecurityType(h.assetType);
            let symbol = h.symbol
            if (securityType === SecurityType.cashEquivalent) symbol = "USD:CUR";
            if (symbol === null) throw new Error("no symbol for ibkr holding");

            let optionId: number | null = null;
            if (securityType === SecurityType.option) {
                optionId = optionsMapping[symbol].id
                symbol = symbol.split(" ")[0];
            }

            let marketPrice = h.marketPrice
            let value = h.marketValue;
            if (securityType === SecurityType.cashEquivalent) {
                marketPrice = 1
                value = h.quantity
            }

            historicalHoldings.push({
                accountId: internalAccount.id,
                price: marketPrice,
                costBasis: h.costBasis,
                date: h.reportDate,
                currency: h.currency,
                optionId: optionId,
                securityId: securitiesMapBySymbol[symbol].id,
                value: value,
                priceAsOf: h.reportDate,
                priceSource: DirectBrokeragesType.Ibkr,
                quantity: h.quantity,
                securityType: securityType,
            })
        }

        await this.upsertHistoricalHoldings(historicalHoldings);

        const currentTpHoldings = await this._repository.getTradingPostBrokerageWithMostRecentHolding(tpUserId, DirectBrokeragesType.Ibkr);
        if (currentTpHoldings.length > 0) {
            const {mostRecentHolding} = currentTpHoldings[0];
            if (mostRecentHolding !== null && mostRecentHolding.isValid && mostRecentHolding.toUnixInteger() > processDate.toUnixInteger()) {
                return
            }
        }

        let currentHoldings: TradingPostCurrentHoldings[] = [];
        for (let i = 0; i < ibkrHoldings.length; i++) {
            const h = ibkrHoldings[i];
            if (h.assetType === null) throw new Error("no type for ibkr holding");
            if (h.marketPrice === null) throw new Error("no market price for ibkr holding");
            if (h.marketValue === null) throw new Error("no market value for ibkr holding");
            if (h.quantity === null) throw new Error("no quantity for ibkr holding");

            const internalAccount = tpAccountIdMap[h.accountId];
            if (!internalAccount) continue;

            let symbol = h.symbol;
            const securityType = transformSecurityType(h.assetType);
            if (securityType === SecurityType.cashEquivalent) symbol = "USD:CUR";
            if (symbol === null) throw new Error("no symbol for ibkr holding");

            let optionId: number | null = null;
            if (securityType === SecurityType.option) {
                optionId = optionsMapping[symbol].id
                symbol = symbol.split(" ")[0];
            }

            let marketPrice = h.marketPrice
            let value = h.marketValue;
            if (securityType === SecurityType.cashEquivalent) {
                marketPrice = 1
                value = h.quantity
            }

            currentHoldings.push({
                accountId: internalAccount.id,
                priceSource: DirectBrokeragesType.Ibkr,
                value: value,
                priceAsOf: h.reportDate,
                price: marketPrice,
                optionId: optionId,
                currency: h.currency,
                quantity: h.quantity,
                costBasis: h.costBasis,
                securityType: securityType,
                securityId: securitiesMapBySymbol[symbol].id,
                holdingDate: h.reportDate
            });
        }

        const tpAccountIds = currentTpHoldings.map(tp => tp.id);
        await this.upsertPositions(currentHoldings, tpAccountIds)
    }

    _getAccounts = async <T extends { accountId: string }>(tpUserId: string, ibkrWithAccount: T[]): Promise<Record<string, TradingPostBrokerageAccountsTable>> => {
        let ibkrAccountIdMap: Record<string, null> = {}
        ibkrWithAccount.forEach(acc => ibkrAccountIdMap[acc.accountId] = null);
        let accountIds = Object.keys(ibkrAccountIdMap);
        const accounts = await this._repository.getTradingPostBrokerageAccountsByBrokerageAndIds(tpUserId, DirectBrokeragesType.Ibkr, accountIds);
        let tpAccountIdMap: Record<string, TradingPostBrokerageAccountsTable> = {};
        accounts.forEach(acc => tpAccountIdMap[acc.accountNumber] = acc);
        return tpAccountIdMap
    }

    _getSecurities = async <T extends { symbol: string | null }>(ibkrWithSymbols: T[]): Promise<Record<string, GetSecurityBySymbol>> => {
        let symbols = ibkrWithSymbols.filter(i => i.symbol !== null).map(i => i.symbol as string);
        symbols = [...symbols, "USD:CUR"];
        let optionsSymbols: Record<string, null> = {}
        symbols.forEach(sym => {
            let splitSym = sym.split(" ");
            if (splitSym.length > 1) {
                optionsSymbols[splitSym[0].trim()] = null;
            }
        })

        symbols = [...symbols, ...Object.keys(optionsSymbols)]
        const securities = await this._repository.getSecuritiesBySymbol(symbols);

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