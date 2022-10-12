import Repository from "./repository"
import {addSecurityPrice, getSecurityWithLatestPrice, updateSecurityPrice} from "./interfaces";
import IEX, {GetIntraDayPrices, GetOHLC, PermissionRequiredError} from "../iex";
import {DateTime} from "luxon";

export default class MarketData {

    constructor(private readonly repository: Repository, private readonly iex: IEX) {
        this.repository = repository
        this.iex = iex;
    }

    prunePricing = async () => {
        await this.repository.removeSecurityPricesAfter7Days()
    }

    ingestEodOfDayPricing = async () => {
        const securitiesWithEodAndLatestPrice = await this.repository.getUsExchangeListedSecuritiesWithPricing();
        const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securitiesWithEodAndLatestPrice, 100);

        let newEodPrices: addSecurityPrice[] = [];
        let oldEodPrices: updateSecurityPrice[] = [];

        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            const symbols = securityGroup.map(sec => sec.symbol);

            try {
                const response = await this.iex.bulk(symbols, ["ohlc"]);
                [newEodPrices, oldEodPrices] = await this.processEndOfDayPricing(response, securityGroup, newEodPrices, oldEodPrices);
            } catch (err) {
                if (err instanceof PermissionRequiredError) {
                    [newEodPrices, oldEodPrices] = await this.resolveEodPricing(securityGroup, newEodPrices, oldEodPrices)
                    continue;
                }
                console.error(`could not fetch data for symbols=${symbols.join(',')} err=${err}`)
            }
        }

        try {
            await this.repository.updatePricesById(oldEodPrices)
        } catch (err) {
            console.error("updating security prices for eod pricing ", err)
        }

        try {
            await this.repository.insertSecuritiesPrices(newEodPrices)
        } catch (err) {
            console.error("inserting security prices for eod pricing ", err)
        }
    }

    private processEndOfDayPricing = async (response: Record<string, any>, securityGroup: getSecurityWithLatestPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]): Promise<[addSecurityPrice[], updateSecurityPrice[]]> => {
        const todayAt400pm = DateTime.now().setZone("America/New_York").set({
            minute: 0,
            hour: 16,
            second: 0,
            millisecond: 0
        });

        const todayAt930am = DateTime.now().setZone("America/New_York").set({
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
            }

            if (sec.time && sec.time.setZone("America/New_York").toUnixInteger() >= todayAt930am.toUnixInteger()) {
                eodPrice.isNew = false;
            }

            const iexSecurity = response[sec.symbol];
            if (!iexSecurity) {
                [newEodPrices, oldEodPrices] = this.validateIsEodPrice(sec.symbol, eodPrice, newEodPrices, oldEodPrices);
                continue
            }

            const iexSecurityOhlc = iexSecurity['ohlc'] as GetOHLC;
            if (!iexSecurityOhlc) {
                [newEodPrices, oldEodPrices] = this.validateIsEodPrice(sec.symbol, eodPrice, newEodPrices, oldEodPrices);
                continue
            }

            if (!eodPrice.price && !iexSecurityOhlc.close) continue;

            const close = iexSecurityOhlc.close ? iexSecurityOhlc.close.price : eodPrice.price;
            if (eodPrice.isNew) newEodPrices = [...newEodPrices, {
                securityId: sec.securityId,
                price: close!,
                low: iexSecurityOhlc.low ? iexSecurityOhlc.low : close,
                isEod: true,
                isIntraday: false,
                high: iexSecurityOhlc.high ? iexSecurityOhlc.high : close,
                time: todayAt400pm.toJSDate(),
                open: iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : close,
            }]
            else oldEodPrices = [...oldEodPrices, {
                id: eodPrice.id!,
                securityId: sec.securityId,
                price: close!,
                low: iexSecurityOhlc.low ? iexSecurityOhlc.low : close,
                isEod: true,
                isIntraday: false,
                high: iexSecurityOhlc.high ? iexSecurityOhlc.high : close,
                time: todayAt400pm.toJSDate(),
                open: iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : close,
            }]
        }

        return [newEodPrices, oldEodPrices];
    }

    ingestPricing = async () => {
        const securities = await this.repository.getUsExchangeListedSecuritiesWithPricing();
        const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);
        let newSecurityPrices: addSecurityPrice[] = [];
        let newEodPrices: addSecurityPrice[] = [];
        let oldEodPrices: updateSecurityPrice[] = [];

        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            const symbols = securityGroup.map(sec => sec.symbol);
            try {
                const response = await this.iex.bulk(symbols, ["intraday-prices"], {
                    chartIEXOnly: true,
                    chartIEXWhenNull: true
                });
                [newSecurityPrices, newEodPrices, oldEodPrices] = await this.processIntradayPrices(response, securityGroup, newSecurityPrices, newEodPrices, oldEodPrices);
            } catch (err) {
                if (err instanceof PermissionRequiredError) {
                    [newSecurityPrices, newEodPrices, oldEodPrices] = await this.resolve(securityGroup, newSecurityPrices, newEodPrices, oldEodPrices)
                    continue
                }
                console.error(`could not fetch prices from IEX symbols=${symbols.join(',')} error=${err}`)
            }
        }

        try {
            await this.repository.upsertSecuritiesPrices(newSecurityPrices);
        } catch (e) {
            console.error("could not upsert security prices ", e)
        }

        try {
            await this.repository.insertSecuritiesPrices(newEodPrices)
        } catch (e) {
            console.error("could not insert new eod security prices ", e)
        }

        try {
            await this.repository.updatePricesById(oldEodPrices)
        } catch (e) {
            console.error("could not update eod security prices ", e)
        }
    }

    validateIsEodPrice = (symbol: string, eodPrice: any, newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]): [addSecurityPrice[], updateSecurityPrice[]] => {
        if (!eodPrice.id) console.error(`could not find security/symbol -- symbol=${symbol}`)
        else if (eodPrice.isNew) newEodPrices = [...newEodPrices, {
            price: eodPrice.price!,
            high: eodPrice.high,
            low: eodPrice.low,
            isEod: true,
            isIntraday: false,
            open: eodPrice.open,
            time: eodPrice.time.toJSDate(),
            securityId: eodPrice.securityId
        }]
        else oldEodPrices = [...oldEodPrices, {
                id: eodPrice.id,
                price: eodPrice.price!,
                high: eodPrice.high,
                low: eodPrice.low,
                isEod: true,
                isIntraday: false,
                open: eodPrice.open,
                time: eodPrice.time.toJSDate(),
                securityId: eodPrice.securityId
            }]
        return [newEodPrices, oldEodPrices]
    }

    resolveEodPricing = async (securityGroup: getSecurityWithLatestPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]): Promise<[addSecurityPrice[], updateSecurityPrice[]]> => {
        for (let i = 0; i < securityGroup.length; i++) {
            const sec = securityGroup[i];
            try {
                const response = await this.iex.bulk([sec.symbol], ["ohlc"]);
                [newEodPrices, oldEodPrices] = await this.processEndOfDayPricing(response, [sec], newEodPrices, oldEodPrices)
            } catch (err) {
                if (err instanceof PermissionRequiredError) {
                    await this.repository.updateSecurityUtp(sec.securityId, true);
                    continue
                }
                console.error(`fetching ohlc prices from iex for symbol=${sec.symbol}`)
            }
        }

        return [newEodPrices, oldEodPrices]
    }

    resolve = async (securityGroup: getSecurityWithLatestPrice[], newSecurityPrices: addSecurityPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]): Promise<[addSecurityPrice[], addSecurityPrice[], updateSecurityPrice[]]> => {
        for (let i = 0; i < securityGroup.length; i++) {
            const sec = securityGroup[i];
            try {
                const response = await this.iex.bulk([sec.symbol], ["intraday-prices"], {
                    chartIEXOnly: true,
                    chartIEXWhenNull: true
                });

                [newSecurityPrices, newEodPrices, oldEodPrices] = await this.processIntradayPrices(response, [sec], newSecurityPrices, newEodPrices, oldEodPrices)
            } catch (err) {
                if (err instanceof PermissionRequiredError) {
                    await this.repository.updateSecurityUtp(sec.securityId, true);
                    continue
                }
                console.error(`fetching intraday prices from iex for symbol=${sec.symbol}`)
            }
        }

        return [newSecurityPrices, newEodPrices, oldEodPrices]
    }

    private processIntradayPrices = async (response: Record<string, any>, securityGroup: getSecurityWithLatestPrice[], newSecurityPrices: addSecurityPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]): Promise<[addSecurityPrice[], addSecurityPrice[], updateSecurityPrice[]]> => {
        const today930 = DateTime.now().setZone("America/New_York").set({
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
            }

            if (security.time && security.time.setZone("America/New_York").toUnixInteger() >= today930.toUnixInteger()) {
                eodPrice.isNew = false;
                eodPrice.time = security.time.setZone("America/New_York");
            }

            const iexSecurity = response[security.symbol];
            if (!iexSecurity) {
                [newEodPrices, oldEodPrices] = this.validateIsEodPrice(security.symbol, eodPrice, newEodPrices, oldEodPrices)
                continue;
            }

            const iexSecurityPrices = iexSecurity['intraday-prices'] as GetIntraDayPrices[];
            if (!iexSecurityPrices || iexSecurityPrices.length <= 0) {
                [newEodPrices, oldEodPrices] = this.validateIsEodPrice(security.symbol, eodPrice, newEodPrices, oldEodPrices)
                continue;
            }

            let latestTime: DateTime | null = null;
            if (security.time) latestTime = security.time.setZone("America/New_York")

            iexSecurityPrices.forEach(iexSecPrice => {
                const t = DateTime.fromFormat(`${iexSecPrice.date} ${iexSecPrice.minute}`, "yyyy-LL-dd HH:mm", {
                    zone: "America/New_York"
                });

                if (!t.isValid) return;
                if (t.hour === 16) return;
                if (latestTime && latestTime.toUnixInteger() > t.toUnixInteger()) return;
                if (security.price === null && iexSecPrice.close === null) return;

                let high = iexSecPrice.high,
                    low = iexSecPrice.low,
                    close = (iexSecPrice.close !== null ? iexSecPrice.close : security.price)!,
                    open = iexSecPrice.open;

                if (high === null) high = close
                if (low === null) low = close
                if (open === null) open = close

                newSecurityPrices = [...newSecurityPrices, {
                    securityId: security.securityId,
                    high: high,
                    low: low,
                    open: open,
                    price: close,
                    time: t.toJSDate(),
                    isEod: false,
                    isIntraday: true
                }]

                eodPrice.time = t;
                eodPrice.price = close;
                eodPrice.open = open;
                eodPrice.close = close;
                eodPrice.low = low;
                eodPrice.high = high;
                [newEodPrices, oldEodPrices] = this.validateIsEodPrice(security.symbol, eodPrice, newEodPrices, oldEodPrices)
            });
        }

        return [newSecurityPrices, newEodPrices, oldEodPrices]
    }
}

export const buildGroups = (securities: any[], max = 100): any[][] => {
    const groups: any[][] = [];
    let group: any[] = [];
    securities.forEach(sec => {
        group.push(sec)
        if (group.length === max) {
            groups.push(group);
            group = [];
        }
    });

    if (group.length > 0) groups.push(group);

    return groups;
}