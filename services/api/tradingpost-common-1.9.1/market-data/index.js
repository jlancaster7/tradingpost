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
exports.buildGroups = void 0;
const iex_1 = require("../iex");
const luxon_1 = require("luxon");
class MarketData {
    constructor(repository, iex) {
        this.repository = repository;
        this.iex = iex;
        this.prunePricing = () => __awaiter(this, void 0, void 0, function* () {
            yield this.repository.removeSecurityPricesAfter7Days();
        });
        this.ingestEodOfDayPricing = () => __awaiter(this, void 0, void 0, function* () {
            let securitiesWithEodAndLatestPrice = yield this.repository.getUsExchangeListedSecuritiesWithPricing();
            securitiesWithEodAndLatestPrice = securitiesWithEodAndLatestPrice.filter(sec => sec.priceSource === 'IEX');
            const securityGroups = (0, exports.buildGroups)(securitiesWithEodAndLatestPrice, 100);
            let newEodPrices = [];
            let oldEodPrices = [];
            for (let i = 0; i < securityGroups.length; i++) {
                const securityGroup = securityGroups[i];
                const symbols = securityGroup.map(sec => sec.symbol);
                try {
                    const response = yield this.iex.bulk(symbols, ["ohlc"]);
                    [newEodPrices, oldEodPrices] = yield this.processEndOfDayPricing(response, securityGroup, newEodPrices, oldEodPrices);
                }
                catch (err) {
                    if (err instanceof iex_1.PermissionRequiredError) {
                        [newEodPrices, oldEodPrices] = yield this.resolveEodPricing(securityGroup, newEodPrices, oldEodPrices);
                        continue;
                    }
                    console.error(`could not fetch data for symbols=${symbols.join(',')} err=${err}`);
                }
            }
            try {
                yield this.repository.updatePricesById(oldEodPrices);
            }
            catch (err) {
                console.error("updating security prices for eod pricing ", err);
            }
            try {
                yield this.repository.insertSecuritiesPrices(newEodPrices);
            }
            catch (err) {
                console.error("inserting security prices for eod pricing ", err);
            }
        });
        this.processEndOfDayPricing = (response, securityGroup, newEodPrices, oldEodPrices) => __awaiter(this, void 0, void 0, function* () {
            const todayAt400pm = luxon_1.DateTime.now().setZone("America/New_York").set({
                minute: 0,
                hour: 16,
                second: 0,
                millisecond: 0
            });
            const todayAt930am = luxon_1.DateTime.now().setZone("America/New_York").set({
                minute: 30,
                hour: 9,
                second: 0,
                millisecond: 0
            });
            for (let j = 0; j < securityGroup.length; j++) {
                const sec = securityGroup[j];
                let eodPrice = {
                    id: sec.eodId,
                    price: sec.price,
                    low: sec.low,
                    high: sec.high,
                    open: sec.open,
                    isEod: true,
                    isIntraday: false,
                    securityId: sec.securityId,
                    time: todayAt400pm,
                    isNew: true
                };
                if (sec.time && sec.time.setZone("America/New_York").toUnixInteger() >= todayAt930am.toUnixInteger()) {
                    eodPrice.isNew = false;
                }
                const iexSecurity = response[sec.symbol];
                if (!iexSecurity) {
                    [newEodPrices, oldEodPrices] = this.validateIsEodPrice(sec.symbol, eodPrice, newEodPrices, oldEodPrices);
                    continue;
                }
                const iexSecurityOhlc = iexSecurity['ohlc'];
                if (!iexSecurityOhlc) {
                    [newEodPrices, oldEodPrices] = this.validateIsEodPrice(sec.symbol, eodPrice, newEodPrices, oldEodPrices);
                    continue;
                }
                if (!eodPrice.price && !iexSecurityOhlc.close)
                    continue;
                const close = iexSecurityOhlc.close ? iexSecurityOhlc.close.price : eodPrice.price;
                if (eodPrice.isNew)
                    newEodPrices = [...newEodPrices, {
                            securityId: sec.securityId,
                            price: close,
                            low: iexSecurityOhlc.low ? iexSecurityOhlc.low : close,
                            isEod: true,
                            isIntraday: false,
                            high: iexSecurityOhlc.high ? iexSecurityOhlc.high : close,
                            time: todayAt400pm.toJSDate(),
                            open: iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : close,
                        }];
                else
                    oldEodPrices = [...oldEodPrices, {
                            id: eodPrice.id,
                            securityId: sec.securityId,
                            price: close,
                            low: iexSecurityOhlc.low ? iexSecurityOhlc.low : close,
                            isEod: true,
                            isIntraday: false,
                            high: iexSecurityOhlc.high ? iexSecurityOhlc.high : close,
                            time: todayAt400pm.toJSDate(),
                            open: iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : close,
                        }];
            }
            return [newEodPrices, oldEodPrices];
        });
        this.ingestPricing = () => __awaiter(this, void 0, void 0, function* () {
            let securities = yield this.repository.getUsExchangeListedSecuritiesWithPricing();
            securities = securities.filter(sec => sec.priceSource === 'IEX');
            const securityGroups = (0, exports.buildGroups)(securities, 100);
            let newSecurityPrices = [];
            let newEodPrices = [];
            let oldEodPrices = [];
            for (let i = 0; i < securityGroups.length; i++) {
                const securityGroup = securityGroups[i];
                const symbols = securityGroup.map(sec => sec.symbol);
                try {
                    const response = yield this.iex.bulk(symbols, ["intraday-prices"], {
                        chartIEXOnly: true,
                        chartIEXWhenNull: true
                    });
                    [newSecurityPrices, newEodPrices, oldEodPrices] = yield this.processIntradayPrices(response, securityGroup, newSecurityPrices, newEodPrices, oldEodPrices);
                }
                catch (err) {
                    if (err instanceof iex_1.PermissionRequiredError) {
                        [newSecurityPrices, newEodPrices, oldEodPrices] = yield this.resolve(securityGroup, newSecurityPrices, newEodPrices, oldEodPrices);
                        continue;
                    }
                    console.error(`could not fetch prices from IEX symbols=${symbols.join(',')} error=${err}`);
                }
            }
            try {
                yield this.repository.upsertSecuritiesPrices(newSecurityPrices);
            }
            catch (e) {
                console.error("could not upsert security prices ", e);
            }
            try {
                yield this.repository.insertSecuritiesPrices(newEodPrices);
            }
            catch (e) {
                console.error("could not insert new eod security prices ", e);
            }
            try {
                yield this.repository.updatePricesById(oldEodPrices);
            }
            catch (e) {
                console.error("could not update eod security prices ", e);
            }
        });
        this.validateIsEodPrice = (symbol, eodPrice, newEodPrices, oldEodPrices) => {
            if (!eodPrice.id)
                console.error(`could not find security/symbol -- symbol=${symbol}`);
            else if (eodPrice.isNew)
                newEodPrices = [...newEodPrices, {
                        price: eodPrice.price,
                        high: eodPrice.high,
                        low: eodPrice.low,
                        isEod: true,
                        isIntraday: false,
                        open: eodPrice.open,
                        time: eodPrice.time.toJSDate(),
                        securityId: eodPrice.securityId
                    }];
            else
                oldEodPrices = [...oldEodPrices, {
                        id: eodPrice.id,
                        price: eodPrice.price,
                        high: eodPrice.high,
                        low: eodPrice.low,
                        isEod: true,
                        isIntraday: false,
                        open: eodPrice.open,
                        time: eodPrice.time.toJSDate(),
                        securityId: eodPrice.securityId
                    }];
            return [newEodPrices, oldEodPrices];
        };
        this.resolveEodPricing = (securityGroup, newEodPrices, oldEodPrices) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < securityGroup.length; i++) {
                const sec = securityGroup[i];
                try {
                    const response = yield this.iex.bulk([sec.symbol], ["ohlc"]);
                    [newEodPrices, oldEodPrices] = yield this.processEndOfDayPricing(response, [sec], newEodPrices, oldEodPrices);
                }
                catch (err) {
                    if (err instanceof iex_1.PermissionRequiredError) {
                        yield this.repository.updateSecurityUtp(sec.securityId, true);
                        continue;
                    }
                    console.error(`fetching ohlc prices from iex for symbol=${sec.symbol}`);
                }
            }
            return [newEodPrices, oldEodPrices];
        });
        this.resolve = (securityGroup, newSecurityPrices, newEodPrices, oldEodPrices) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < securityGroup.length; i++) {
                const sec = securityGroup[i];
                try {
                    const response = yield this.iex.bulk([sec.symbol], ["intraday-prices"], {
                        chartIEXOnly: true,
                        chartIEXWhenNull: true
                    });
                    [newSecurityPrices, newEodPrices, oldEodPrices] = yield this.processIntradayPrices(response, [sec], newSecurityPrices, newEodPrices, oldEodPrices);
                }
                catch (err) {
                    if (err instanceof iex_1.PermissionRequiredError) {
                        yield this.repository.updateSecurityUtp(sec.securityId, true);
                        continue;
                    }
                    console.error(`fetching intraday prices from iex for symbol=${sec.symbol}`);
                }
            }
            return [newSecurityPrices, newEodPrices, oldEodPrices];
        });
        this.processIntradayPrices = (response, securityGroup, newSecurityPrices, newEodPrices, oldEodPrices) => __awaiter(this, void 0, void 0, function* () {
            const today930 = luxon_1.DateTime.now().setZone("America/New_York").set({
                hour: 9,
                minute: 30,
                second: 0,
                millisecond: 0
            });
            for (let j = 0; j < securityGroup.length; j++) {
                const security = securityGroup[j];
                let eodPrice = {
                    id: security.eodId,
                    securityId: security.securityId,
                    price: security.price,
                    time: today930,
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    close: security.price,
                    isIntraday: false,
                    isEod: true,
                    isNew: true
                };
                if (security.time && security.time.setZone("America/New_York").toUnixInteger() >= today930.toUnixInteger()) {
                    eodPrice.isNew = false;
                    eodPrice.time = security.time.setZone("America/New_York");
                }
                const iexSecurity = response[security.symbol];
                if (!iexSecurity) {
                    [newEodPrices, oldEodPrices] = this.validateIsEodPrice(security.symbol, eodPrice, newEodPrices, oldEodPrices);
                    continue;
                }
                const iexSecurityPrices = iexSecurity['intraday-prices'];
                if (!iexSecurityPrices || iexSecurityPrices.length <= 0) {
                    [newEodPrices, oldEodPrices] = this.validateIsEodPrice(security.symbol, eodPrice, newEodPrices, oldEodPrices);
                    continue;
                }
                let latestTime = null;
                if (security.time)
                    latestTime = security.time.setZone("America/New_York");
                iexSecurityPrices.forEach(iexSecPrice => {
                    const t = luxon_1.DateTime.fromFormat(`${iexSecPrice.date} ${iexSecPrice.minute}`, "yyyy-LL-dd HH:mm", {
                        zone: "America/New_York"
                    });
                    if (!t.isValid)
                        return;
                    if (t.hour === 16)
                        return;
                    if (latestTime && latestTime.toUnixInteger() > t.toUnixInteger())
                        return;
                    if (security.price === null && iexSecPrice.close === null)
                        return;
                    let high = iexSecPrice.high, low = iexSecPrice.low, close = (iexSecPrice.close !== null ? iexSecPrice.close : security.price), open = iexSecPrice.open;
                    if (high === null)
                        high = close;
                    if (low === null)
                        low = close;
                    if (open === null)
                        open = close;
                    newSecurityPrices = [...newSecurityPrices, {
                            securityId: security.securityId,
                            high: high,
                            low: low,
                            open: open,
                            price: close,
                            time: t.toJSDate(),
                            isEod: false,
                            isIntraday: true
                        }];
                    eodPrice.time = t;
                    eodPrice.price = close;
                    eodPrice.open = open;
                    eodPrice.close = close;
                    eodPrice.low = low;
                    eodPrice.high = high;
                    [newEodPrices, oldEodPrices] = this.validateIsEodPrice(security.symbol, eodPrice, newEodPrices, oldEodPrices);
                });
            }
            return [newSecurityPrices, newEodPrices, oldEodPrices];
        });
        this.repository = repository;
        this.iex = iex;
    }
}
exports.default = MarketData;
const buildGroups = (securities, max = 100) => {
    const groups = [];
    let group = [];
    securities.forEach(sec => {
        group.push(sec);
        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });
    if (group.length > 0)
        groups.push(group);
    return groups;
};
exports.buildGroups = buildGroups;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxnQ0FBZ0Y7QUFDaEYsaUNBQStCO0FBRS9CLE1BQXFCLFVBQVU7SUFFM0IsWUFBNkIsVUFBc0IsRUFBbUIsR0FBUTtRQUFqRCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQW1CLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFLOUUsaUJBQVksR0FBRyxHQUFTLEVBQUU7WUFDdEIsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUE7UUFDMUQsQ0FBQyxDQUFBLENBQUE7UUFFRCwwQkFBcUIsR0FBRyxHQUFTLEVBQUU7WUFDL0IsSUFBSSwrQkFBK0IsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsd0NBQXdDLEVBQUUsQ0FBQztZQUN2RywrQkFBK0IsR0FBRywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQzNHLE1BQU0sY0FBYyxHQUFtQyxJQUFBLG1CQUFXLEVBQUMsK0JBQStCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFekcsSUFBSSxZQUFZLEdBQXVCLEVBQUUsQ0FBQztZQUMxQyxJQUFJLFlBQVksR0FBMEIsRUFBRSxDQUFDO1lBRTdDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QyxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXJELElBQUk7b0JBQ0EsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENB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