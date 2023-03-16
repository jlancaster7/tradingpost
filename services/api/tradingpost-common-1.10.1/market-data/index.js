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
const iex_1 = require("../iex");
const luxon_1 = require("luxon");
const utils_1 = require("../../lambdas/market-data/utils");
class MarketData {
    constructor(repository, iex) {
        this.repository = repository;
        this.iex = iex;
        this.prunePricing = () => __awaiter(this, void 0, void 0, function* () {
            yield this.repository.removeSecurityPricesAfter7Days();
        });
        this.ingestEodOfDayPricing = () => __awaiter(this, void 0, void 0, function* () {
            let securities = yield this.repository.getUsExchangeListedSecuritiesWithPricing();
            securities = securities.filter(sec => sec.priceSource === 'IEX');
            const securityGroups = (0, utils_1.buildGroups)(securities, 100);
            let eodPrices = [];
            let runningTasks = [];
            for (let i = 0; i < securityGroups.length; i++) {
                const securityGroup = securityGroups[i];
                runningTasks.push((() => __awaiter(this, void 0, void 0, function* () {
                    const symbols = securityGroup.map(sec => sec.symbol);
                    try {
                        const response = yield this.iex.bulk(symbols, ["ohlc"]);
                        const _eodPrices = yield this._processEod(securityGroup, response);
                        eodPrices = [...eodPrices, ..._eodPrices];
                    }
                    catch (err) {
                        if (err instanceof iex_1.PermissionRequiredError) {
                            for (let i = 0; i < securityGroup.length; i++) {
                                const sec = securityGroup[i];
                                try {
                                    const response = yield this.iex.bulk([sec.symbol], ["ohlc"], {
                                        chartIEXOnly: true,
                                        chartIEXWhenNull: true
                                    });
                                    const _eodPrices = yield this._processEod(securityGroup, response);
                                    eodPrices = [...eodPrices, ..._eodPrices];
                                }
                                catch (err) {
                                    if (err instanceof iex_1.PermissionRequiredError) {
                                        yield this.repository.updateSecurityUtp(sec.securityId, true);
                                        continue;
                                    }
                                    console.error(`fetching eod prices from iex for symbol=${sec.symbol}`);
                                }
                            }
                        }
                        console.error(`could not fetch data for symbols=${symbols.join(',')} err=${err}`);
                    }
                }))());
                if (runningTasks.length === 8) {
                    yield Promise.all(runningTasks);
                    try {
                        yield this.repository.upsertEodPrices(eodPrices);
                    }
                    catch (e) {
                        console.error(e);
                        console.error("eod price");
                    }
                    eodPrices = [];
                }
            }
            if (runningTasks.length > 0)
                yield Promise.all(runningTasks);
            try {
                yield this.repository.upsertEodPrices(eodPrices);
            }
            catch (e) {
                console.error(e);
                console.error("eod price");
            }
        });
        this._processEod = (securityGroup, response) => __awaiter(this, void 0, void 0, function* () {
            const today4pm = luxon_1.DateTime.now().setZone("America/New_York").set({
                hour: 16,
                second: 0,
                minute: 0,
                millisecond: 0
            });
            let eodPrices = [];
            for (let j = 0; j < securityGroup.length; j++) {
                const security = securityGroup[j];
                const iexSecurity = response[security.symbol];
                if (!iexSecurity) {
                    if (!security.time)
                        continue;
                    if (!security.price)
                        continue;
                    // We have a past item in there, so lets roll it forward
                    eodPrices.push({
                        price: security.price,
                        high: security.high,
                        low: security.low,
                        isEod: true,
                        isIntraday: false,
                        open: security.open,
                        time: today4pm,
                        securityId: security.securityId
                    });
                    continue;
                }
                const iexSecurityOhlc = iexSecurity['ohlc'];
                if (!iexSecurityOhlc) {
                    if (!security.time)
                        continue;
                    if (!security.price)
                        continue;
                    eodPrices.push({
                        price: security.price,
                        high: security.high,
                        low: security.low,
                        isEod: true,
                        securityId: security.securityId,
                        time: today4pm,
                        isIntraday: false,
                        open: security.open
                    });
                    continue;
                }
                let securityPrice = security.price;
                if (securityPrice === null) {
                    if (iexSecurityOhlc.close === null || iexSecurityOhlc.close.price === null)
                        continue;
                    securityPrice = iexSecurityOhlc.close.price;
                }
                eodPrices.push({
                    price: securityPrice,
                    open: iexSecurityOhlc.open && iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : security.open,
                    time: today4pm,
                    isIntraday: false,
                    low: iexSecurityOhlc.low ? iexSecurityOhlc.low : security.low,
                    isEod: true,
                    securityId: security.securityId,
                    high: iexSecurityOhlc.high ? iexSecurityOhlc.high : security.high
                });
            }
            return eodPrices;
        });
        this.ingestPricing = () => __awaiter(this, void 0, void 0, function* () {
            let securities = yield this.repository.getUsExchangeListedSecuritiesWithPricing();
            securities = securities.filter(sec => sec.priceSource === 'IEX');
            const securityGroups = (0, utils_1.buildGroups)(securities, 100);
            let intradayPrices = [];
            let eodPrices = [];
            let runningTasks = [];
            for (let i = 0; i < securityGroups.length; i++) {
                const securityGroup = securityGroups[i];
                runningTasks.push((() => __awaiter(this, void 0, void 0, function* () {
                    const symbols = securityGroup.map(sec => sec.symbol);
                    try {
                        // Try/Catch for IEX Errors(Too many Requests/Permission/etc...) -- dealio hereio
                        // Add in retries and such...
                        const response = yield this.iex.bulk(symbols, ["intraday-prices"], {
                            chartIEXOnly: true,
                            chartIEXWhenNull: true
                        });
                        const [intraday, eod] = yield this._process(securityGroup, response);
                        intradayPrices = [...intradayPrices, ...intraday];
                        eodPrices = [...eodPrices, ...eod];
                    }
                    catch (err) {
                        if (err instanceof iex_1.PermissionRequiredError) {
                            for (let i = 0; i < securityGroup.length; i++) {
                                const sec = securityGroup[i];
                                try {
                                    const response = yield this.iex.bulk([sec.symbol], ["intraday-prices"], {
                                        chartIEXOnly: true,
                                        chartIEXWhenNull: true
                                    });
                                    const [intraday, eod] = yield this._process(securityGroup, response);
                                    intradayPrices = [...intradayPrices, ...intraday];
                                    eodPrices = [...eodPrices, ...eod];
                                }
                                catch (err) {
                                    if (err instanceof iex_1.PermissionRequiredError) {
                                        yield this.repository.updateSecurityUtp(sec.securityId, true);
                                        continue;
                                    }
                                    console.error(`fetching intraday prices from iex for symbol=${sec.symbol}`);
                                }
                            }
                            return;
                        }
                        console.error(`could not fetch prices from IEX symbols=${symbols.join(',')} error=${err}`);
                    }
                }))());
                if (runningTasks.length === 8) {
                    yield Promise.all(runningTasks);
                    try {
                        yield this.repository.upsertEodPrices(eodPrices);
                    }
                    catch (e) {
                        console.error(e);
                        console.error("eod price");
                    }
                    try {
                        yield this.repository.upsertIntradayPrices(intradayPrices);
                    }
                    catch (e) {
                        console.error(e);
                        console.log("intraday price");
                    }
                    eodPrices = [];
                    intradayPrices = [];
                    runningTasks = [];
                }
            }
            if (runningTasks.length > 0)
                yield Promise.all(runningTasks);
            try {
                yield this.repository.upsertEodPrices(eodPrices);
            }
            catch (e) {
                console.error(e);
                console.error("eod price");
            }
            try {
                yield this.repository.upsertIntradayPrices(intradayPrices);
            }
            catch (e) {
                console.error(e);
                console.log("intraday price");
            }
        });
        this._process = (securityGroup, response) => __awaiter(this, void 0, void 0, function* () {
            const currentTime = luxon_1.DateTime.now().setZone("America/New_York").set({ second: 0, millisecond: 0 });
            let eodPrices = [];
            let intradayPrices = [];
            for (let j = 0; j < securityGroup.length; j++) {
                const security = securityGroup[j];
                const iexSecurity = response[security.symbol];
                if (!iexSecurity) {
                    // Check to see if we have made a record yet for today... for is_eod, if not, then do it with curr time
                    if (!security.time)
                        continue;
                    if (security.time.day === currentTime.day)
                        continue;
                    if (!security.price)
                        continue;
                    // Rolling Yesterday Forward
                    eodPrices.push({
                        price: security.price,
                        high: security.high,
                        low: security.low,
                        isEod: true,
                        isIntraday: false,
                        open: security.open,
                        time: luxon_1.DateTime.now().setZone("America/New_York").set({
                            hour: 9,
                            minute: 30,
                            second: 0,
                            millisecond: 0
                        }),
                        securityId: security.securityId
                    });
                    continue;
                }
                const iexSecurityPrices = iexSecurity['intraday-prices'];
                if (!iexSecurityPrices || iexSecurityPrices.length <= 0) {
                    if (!security.time)
                        continue;
                    if (security.time.day === currentTime.day)
                        continue;
                    if (!security.price)
                        continue;
                    // Rolling Yesterday Forward
                    eodPrices.push({
                        price: security.price,
                        high: security.high,
                        low: security.low,
                        isEod: true,
                        isIntraday: false,
                        open: security.open,
                        time: luxon_1.DateTime.now().setZone("America/New_York").set({
                            hour: 9,
                            minute: 30,
                            second: 0,
                            millisecond: 0
                        }),
                        securityId: security.securityId
                    });
                    continue;
                }
                // Sorted prices, exclude ones without valid timestamp and no price
                const iexSecurityPricesSorted = iexSecurityPrices
                    .map(p => {
                    return Object.assign(Object.assign({}, p), { parsedTime: luxon_1.DateTime.fromFormat(`${p.date} ${p.minute}`, "yyyy-LL-dd HH:mm", {
                            zone: "America/New_York"
                        }) });
                })
                    .filter(p => p.parsedTime.isValid && p.close !== null)
                    .sort((a, b) => a.parsedTime.toUnixInteger() - b.parsedTime.toUnixInteger());
                let changed = false;
                let securityPrice = security.price;
                if (!security.time)
                    security.time = luxon_1.DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    });
                if (iexSecurityPricesSorted.length > 0)
                    security.open = iexSecurityPricesSorted[0].open ? iexSecurityPricesSorted[0].open : iexSecurityPricesSorted[0].close;
                iexSecurityPricesSorted.forEach(p => {
                    // @ts-ignore
                    if (security.time.toUnixInteger() > p.parsedTime.toUnixInteger())
                        return;
                    changed = true;
                    security.time = p.parsedTime;
                    if (p.close)
                        securityPrice = p.close;
                    if (security.low) {
                        if (p.low && p.low < security.low)
                            security.low = p.low;
                    }
                    else if (p.low)
                        security.low = p.low;
                    if (security.high) {
                        if (p.high && p.high > security.high)
                            security.high = p.high;
                    }
                    else if (p.high)
                        security.high = p.high;
                    intradayPrices.push({
                        price: p.close,
                        open: p.open,
                        time: p.parsedTime,
                        high: p.high,
                        low: p.low,
                        isEod: false,
                        securityId: security.securityId,
                        isIntraday: true
                    });
                });
                if (!changed || !security.time || !securityPrice)
                    continue;
                eodPrices.push({
                    price: securityPrice,
                    low: security.low,
                    high: security.high,
                    open: security.open,
                    time: security.time,
                    isIntraday: false,
                    isEod: true,
                    securityId: security.securityId
                });
            }
            return [intradayPrices, eodPrices];
        });
        this.repository = repository;
        this.iex = iex;
    }
}
exports.default = MarketData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLGdDQUFnRjtBQUNoRixpQ0FBK0I7QUFDL0IsMkRBQTREO0FBRTVELE1BQXFCLFVBQVU7SUFDM0IsWUFBNkIsVUFBc0IsRUFBbUIsR0FBUTtRQUFqRCxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQW1CLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFLdkUsaUJBQVksR0FBRyxHQUFTLEVBQUU7WUFDN0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUE7UUFDMUQsQ0FBQyxDQUFBLENBQUE7UUFFTSwwQkFBcUIsR0FBRyxHQUFTLEVBQUU7WUFDdEMsSUFBSSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHdDQUF3QyxFQUFFLENBQUM7WUFDbEYsVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxDQUFBO1lBRWhFLE1BQU0sY0FBYyxHQUFtQyxJQUFBLG1CQUFXLEVBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3BGLElBQUksU0FBUyxHQUF1QixFQUFFLENBQUE7WUFDdEMsSUFBSSxZQUFZLEdBQW1CLEVBQUUsQ0FBQztZQUV0QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBUyxFQUFFO29CQUMxQixNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFD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