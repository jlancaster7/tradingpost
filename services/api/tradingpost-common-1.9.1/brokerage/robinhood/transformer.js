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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../interfaces");
const luxon_1 = require("luxon");
const base_transformer_1 = __importDefault(require("../base-transformer"));
class Transformer extends base_transformer_1.default {
    constructor(repo) {
        super(repo);
        this._getSecurities = (rhInternalSecurityIds) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this._repo.getSecurityWithLatestPricingWithRobinhoodIds(rhInternalSecurityIds);
            const response = {};
            results.map(r => response[r.rhInternalId] = r);
            return response;
        });
        this._getOptions = (rhOptionIds) => __awaiter(this, void 0, void 0, function* () {
            const tpOptions = yield this._repo.getTradingPostOptionsWithRobinhoodOptionIds(rhOptionIds);
            let internalRhOptionToInternalTpOption = {};
            rhOptionIds.forEach(r => internalRhOptionToInternalTpOption[r] = 0);
            tpOptions.forEach(tpOption => internalRhOptionToInternalTpOption[tpOption.internalRobinhoodOptionId] = tpOption.id);
            const internalRhIds = Object.keys(internalRhOptionToInternalTpOption).map(k => parseInt(k));
            for (let i = 0; i < internalRhIds.length; i++) {
                const internalRhId = internalRhIds[i];
                const internalTpId = internalRhOptionToInternalTpOption[internalRhId];
                // CREATE THE OPTION IT DOESN'T EXIST
                if (internalTpId === 0) {
                    const robinhoodOption = yield this._repo.getRobinhoodOption(internalRhId);
                    if (robinhoodOption === null)
                        throw new Error("could not get robinhood option");
                    const securities = yield this._repo.getSecuritiesBySymbol([robinhoodOption.chainSymbol]);
                    if (securities.length <= 0)
                        throw new Error("could not find security for option contract");
                    const security = securities[0];
                    const tpOptionId = yield this._repo.upsertOptionContract({
                        type: robinhoodOption.type,
                        expiration: robinhoodOption.expirationDate,
                        securityId: security.id,
                        externalId: robinhoodOption.externalId,
                        strikePrice: robinhoodOption.strikePrice,
                    });
                    if (tpOptionId === null)
                        throw new Error("couldnt insert option id");
                    internalRhOptionToInternalTpOption[internalRhId] = tpOptionId;
                }
            }
            return internalRhOptionToInternalTpOption;
        });
        this._getAccounts = (userId, accountNumbers) => __awaiter(this, void 0, void 0, function* () {
            const accs = yield this._repo.getTradingPostBrokerageAccountsByBrokerageAndIds(userId, 'Robinhood', accountNumbers);
            let res = {};
            accs.forEach((acc) => res[acc.accountNumber] = acc);
            return res;
        });
        this.accounts = (userId, institutionId, user, accounts) => __awaiter(this, void 0, void 0, function* () {
            yield this.upsertAccounts(accounts.map(acc => {
                let x = {
                    userId: userId,
                    accountNumber: acc.accountNumber,
                    error: false,
                    institutionId: institutionId,
                    type: acc.brokerageAccountType ? acc.brokerageAccountType : "Brokerage",
                    subtype: acc.type,
                    officialName: "",
                    errorCode: 0,
                    mask: "",
                    name: user.username,
                    status: "active",
                    brokerName: interfaces_1.DirectBrokeragesType.Robinhood,
                    hiddenForDeletion: false,
                    accountStatus: interfaces_1.TradingPostBrokerageAccountStatus.PROCESSING
                };
                return x;
            }));
        });
        this.positions = (userId, positions) => __awaiter(this, void 0, void 0, function* () {
            let accountMap = yield this._getAccounts(userId, positions.filter(p => p.accountNumber !== null).map(p => p.accountNumber));
            let securityMap = yield this._getSecurities(positions.map(p => p.internalInstrumentId));
            let optionsMap = yield this._getOptions(positions.filter(p => p.internalOptionId !== null).map(p => p.internalOptionId));
            const internalRobinhoodCash = yield this._repo.getRobinhoodInstrumentBySymbol("USD:CUR");
            if (!internalRobinhoodCash)
                throw new Error("no cash security created for robinhood");
            const tpPositions = [];
            for (let i = 0; i < positions.length; i++) {
                const rhPos = positions[i];
                if (rhPos.accountNumber === null)
                    throw new Error("NO ACCOUNT NUMBER");
                let account = accountMap[rhPos.accountNumber];
                let security = securityMap[rhPos.internalInstrumentId];
                if (!security) {
                    console.warn("could not find security ", rhPos.internalInstrumentId);
                    continue;
                }
                let securityType = interfaces_1.SecurityType.equity;
                if (rhPos.internalInstrumentId === internalRobinhoodCash.id) {
                    securityType = interfaces_1.SecurityType.cashEquivalent;
                }
                let optionId = null;
                if (rhPos.internalOptionId) {
                    let foundOptionId = optionsMap[rhPos.internalOptionId];
                    if (!foundOptionId)
                        throw new Error("option id set, could not find");
                    securityType = interfaces_1.SecurityType.option;
                    optionId = foundOptionId;
                }
                const holdingDate = luxon_1.DateTime.now().setZone("America/New_York").set({
                    millisecond: 0,
                    minute: 0,
                    hour: 0,
                    second: 0
                });
                const avgPriceFloat = parseFloat(rhPos.averagePrice);
                const quantityFloat = parseFloat(rhPos.quantity);
                tpPositions.push({
                    accountId: account.id,
                    costBasis: avgPriceFloat * quantityFloat,
                    currency: 'USD',
                    holdingDate: holdingDate,
                    optionId: optionId,
                    price: security.latestPrice || 1,
                    priceAsOf: luxon_1.DateTime.now(),
                    priceSource: 'IEX',
                    quantity: quantityFloat,
                    securityId: security.id,
                    securityType: securityType,
                    value: (security.latestPrice || 1) * quantityFloat,
                });
            }
            yield this.upsertPositions(tpPositions, Object.keys(accountMap).map(key => accountMap[key].id));
            yield this.holdingsHistory(userId, tpPositions);
        });
        this.transactions = (userId, transactions) => __awaiter(this, void 0, void 0, function* () {
            let accountMap = yield this._getAccounts(userId, transactions.filter(p => p.accountNumber !== null).map(p => p.accountNumber));
            let securityMap = yield this._getSecurities((transactions.map(p => p.internalInstrumentId)));
            let optionsMap = yield this._getOptions(transactions.filter(p => p.internalOptionId !== null).map(p => p.internalOptionId));
            const internalRobinhoodCash = yield this._repo.getRobinhoodInstrumentBySymbol("USD:CUR");
            if (!internalRobinhoodCash)
                throw new Error("no cash security created for robinhood");
            const tpTransactions = [];
            for (let i = 0; i < transactions.length; i++) {
                const rhTx = transactions[i];
                if (rhTx.accountNumber === null)
                    throw new Error("no account number");
                let internalAccount = accountMap[rhTx.accountNumber];
                let securityType = interfaces_1.SecurityType.equity;
                if (rhTx.internalInstrumentId === internalRobinhoodCash.id) {
                    securityType = interfaces_1.SecurityType.cashEquivalent;
                }
                let security = securityMap[rhTx.internalInstrumentId];
                if (!security) {
                    console.log(rhTx);
                    throw new Error("security not found for robinhood transactions");
                }
                let optionId = null;
                if (rhTx.internalOptionId !== null) {
                    let tmpOptionId = optionsMap[rhTx.internalOptionId];
                    if (!tmpOptionId)
                        throw new Error("option id set, could not find tx");
                    securityType = interfaces_1.SecurityType.option;
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
            yield this.upsertTransactions(tpTransactions);
        });
        this.holdingsHistory = (userId, positions) => __awaiter(this, void 0, void 0, function* () {
            const hh = positions.map(p => {
                let x = {
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
                };
                return x;
            });
            yield this.upsertHistoricalHoldings(hh);
        });
        this._repo = repo;
    }
}
exports.default = Transformer;
const rhTxTypeToTpTxType = (rhType, side) => {
    if (rhType === null)
        throw new Error("no type set");
    switch (rhType) {
        case 'cash':
            return interfaces_1.InvestmentTransactionType.cash;
        case 'interest':
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case 'dividend':
            return interfaces_1.InvestmentTransactionType.dividendOrInterest;
        case 'market': {
            if (side === null)
                throw new Error("no side to market");
            if (side === 'sell')
                return interfaces_1.InvestmentTransactionType.sell;
            if (side === 'buy')
                return interfaces_1.InvestmentTransactionType.buy;
        }
        case 'limit': {
            if (side === null)
                throw new Error("no side to limit");
            if (side === 'buy')
                return interfaces_1.InvestmentTransactionType.buy;
            if (side === 'sell')
                return interfaces_1.InvestmentTransactionType.sell;
        }
        default:
            throw new Error(`rh type ${rhType} not detected`);
    }
    return interfaces_1.InvestmentTransactionType.buy;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQVNBLDhDQVl1QjtBQUN2QixpQ0FBK0I7QUFDL0IsMkVBQW9FO0FBa0JwRSxNQUFxQixXQUFZLFNBQVEsMEJBQWU7SUFHcEQsWUFBWSxJQUFnQjtRQUN4QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFJaEIsbUJBQWMsR0FBRyxDQUFPLHFCQUErQixFQUFvRSxFQUFFO1lBQ3pILE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3JHLE1BQU0sUUFBUSxHQUE0RCxFQUFFLENBQUM7WUFDN0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0MsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFBLENBQUE7UUFFRCxnQkFBVyxHQUFHLENBQU8sV0FBcUIsRUFBbUMsRUFBRTtZQUMzRSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsMkNBQTJDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUYsSUFBSSxrQ0FBa0MsR0FBMkIsRUFBRSxDQUFDO1lBQ3BFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVwRSxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsa0NBQWtDLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BILE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENB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