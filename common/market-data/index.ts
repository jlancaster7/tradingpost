import Repository from "./repository"
import {addSecurityPrice, getSecurityWithLatestPrice, updateSecurityPrice} from "./interfaces";
import IEX, {GetIntraDayPrices, GetOHLC, PermissionRequiredError} from "../iex";
import {DateTime} from "luxon";
import {sec} from "mathjs";

export default class MarketData {

    constructor(private readonly repository: Repository, private readonly iex: IEX) {
        this.repository = repository
        this.iex = iex;
    }

    prunePricing = async () => {
        await this.repository.removeSecurityPricesAfter7Days()
    }

    ingestEodOfDayPricing = async () => {
        let securities = await this.repository.getUsExchangeListedSecuritiesWithPricing();
        securities = securities.filter(sec => sec.priceSource === 'IEX')

        const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);
        let eodPrices: addSecurityPrice[] = []
        let runningTasks: Promise<any>[] = [];

        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            runningTasks.push((async () => {
                const symbols = securityGroup.map(sec => sec.symbol);
                try {
                    const response = await this.iex.bulk(symbols, ["ohlc"]);
                    const today4pm = DateTime.now().setZone("America/New_York").set({
                        hour: 16,
                        second: 0,
                        minute: 0,
                        millisecond: 0
                    });

                    for (let j = 0; j < securityGroup.length; j++) {
                        const security = securityGroup[j];
                        const iexSecurity = response[security.symbol];
                        if (!iexSecurity) {
                            // TODO: Roll-forward...?
                            if (!security.time) continue;
                            if (!security.price) continue;

                            eodPrices.push({
                                price: security.price,
                                high: security.high,
                                low: security.low,
                                isEod: true,
                                isIntraday: false,
                                open: security.open,
                                time: today4pm,
                                securityId: security.securityId
                            })
                            continue;
                        }

                        const iexSecurityOhlc = iexSecurity['ohlc'] as GetOHLC;
                        if (!iexSecurityOhlc) {
                            if (!security.time) continue;
                            if (!security.price) continue;
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
                    }

                } catch (err) {
                    if (err instanceof PermissionRequiredError) {
                        // TODO: RESOVLE EOD PRICING
                    }
                    console.error(`could not fetch data for symbols=${symbols.join(',')} err=${err}`)
                }
            })());

            if (runningTasks.length === 8) {
                await Promise.all(runningTasks);
                try {
                    await this.repository.upsertEodPrices(eodPrices);
                } catch (e) {
                    console.error(e)
                    console.error("eod price")
                }

                eodPrices = [];
            }
        }

        if (runningTasks.length > 0) await Promise.all(runningTasks)

        try {
            await this.repository.upsertEodPrices(eodPrices);
        } catch (e) {
            console.error(e);
            console.error("eod price");
        }
    }

    private processEndOfDayPricing = async (response: Record<string, any>, securityGroup: getSecurityWithLatestPrice[], newEodPrices: addSecurityPrice[], oldEodPrices: updateSecurityPrice[]): Promise<[addSecurityPrice[], updateSecurityPrice[]]> => {
        // const todayAt400pm = DateTime.now().setZone("America/New_York").set({
        //     minute: 0,
        //     hour: 16,
        //     second: 0,
        //     millisecond: 0
        // });
        //
        // const todayAt930am = DateTime.now().setZone("America/New_York").set({
        //     minute: 30,
        //     hour: 9,
        //     second: 0,
        //     millisecond: 0
        // });
        //
        // for (let j = 0; j < securityGroup.length; j++) {
        //     const sec = securityGroup[j];
        //     let eodPrice = {
        //         id: sec.eodId,
        //         price: sec.price,
        //         low: sec.low,
        //         high: sec.high,
        //         open: sec.open,
        //         isEod: true,
        //         isIntraday: false,
        //         securityId: sec.securityId,
        //         time: todayAt400pm,
        //         isNew: true
        //     }
        //
        //     if (sec.time && sec.time.setZone("America/New_York").toUnixInteger() >= todayAt930am.toUnixInteger()) {
        //         eodPrice.isNew = false;
        //     }
        //
        //     const iexSecurity = response[sec.symbol];
        //     if (!iexSecurity) {
        //         [newEodPrices, oldEodPrices] = this.validateIsEodPrice(sec.symbol, eodPrice, newEodPrices, oldEodPrices);
        //         continue
        //     }
        //
        //     const iexSecurityOhlc = iexSecurity['ohlc'] as GetOHLC;
        //     if (!iexSecurityOhlc) {
        //         [newEodPrices, oldEodPrices] = this.validateIsEodPrice(sec.symbol, eodPrice, newEodPrices, oldEodPrices);
        //         continue
        //     }
        //
        //     if (!eodPrice.price && !iexSecurityOhlc.close) continue;
        //
        //     const close = iexSecurityOhlc.close ? iexSecurityOhlc.close.price : eodPrice.price;
        //     if (eodPrice.isNew) newEodPrices = [...newEodPrices, {
        //         securityId: sec.securityId,
        //         price: close!,
        //         low: iexSecurityOhlc.low ? iexSecurityOhlc.low : close,
        //         isEod: true,
        //         isIntraday: false,
        //         high: iexSecurityOhlc.high ? iexSecurityOhlc.high : close,
        //         time: todayAt400pm.toJSDate(),
        //         open: iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : close,
        //     }]
        //     else oldEodPrices = [...oldEodPrices, {
        //         id: eodPrice.id!,
        //         securityId: sec.securityId,
        //         price: close!,
        //         low: iexSecurityOhlc.low ? iexSecurityOhlc.low : close,
        //         isEod: true,
        //         isIntraday: false,
        //         high: iexSecurityOhlc.high ? iexSecurityOhlc.high : close,
        //         time: todayAt400pm.toJSDate(),
        //         open: iexSecurityOhlc.open.price ? iexSecurityOhlc.open.price : close,
        //     }]
        // }

        return [newEodPrices, oldEodPrices];
    }

    ingestPricing = async () => {
        let securities = await this.repository.getUsExchangeListedSecuritiesWithPricing();
        securities = securities.filter(sec => sec.priceSource === 'IEX')

        const securityGroups: getSecurityWithLatestPrice[][] = buildGroups(securities, 100);

        let intradayPrices: addSecurityPrice[] = [];
        let eodPrices: addSecurityPrice[] = []
        let runningTasks: Promise<any>[] = [];

        for (let i = 0; i < securityGroups.length; i++) {
            const securityGroup = securityGroups[i];
            runningTasks.push((async () => {
                const symbols = securityGroup.map(sec => sec.symbol);
                try {
                    // Try/Catch for IEX Errors(Too many Requests/Permission/etc...) -- dealio hereio
                    // Add in retries and such...
                    const response = await this.iex.bulk(symbols, ["intraday-prices"], {
                        chartIEXOnly: true,
                        chartIEXWhenNull: true
                    });

                    const [intraday, eod] = await this._process(securityGroup, response);
                    intradayPrices = [...intradayPrices, ...intraday]
                    eodPrices = [...eodPrices, ...eod];

                } catch (err) {
                    if (err instanceof PermissionRequiredError) {
                        for (let i = 0; i < securityGroup.length; i++) {
                            const sec = securityGroup[i];
                            try {
                                const response = await this.iex.bulk([sec.symbol], ["intraday-prices"], {
                                    chartIEXOnly: true,
                                    chartIEXWhenNull: true
                                });
                                const [intraday, eod] = await this._process(securityGroup, response);
                                intradayPrices = [...intradayPrices, ...intraday]
                                eodPrices = [...eodPrices, ...eod];
                            } catch (err) {
                                if (err instanceof PermissionRequiredError) {
                                    await this.repository.updateSecurityUtp(sec.securityId, true);
                                    continue;
                                }
                                console.error(`fetching intraday prices from iex for symbol=${sec.symbol}`)
                            }
                        }
                        return
                    }
                    console.error(`could not fetch prices from IEX symbols=${symbols.join(',')} error=${err}`)
                }
            })());

            if (runningTasks.length === 8) {
                await Promise.all(runningTasks);
                try {
                    await this.repository.upsertEodPrices(eodPrices)
                } catch (e) {
                    console.error(e)
                    console.error("eod price")
                }

                try {
                    await this.repository.upsertIntradayPrices(intradayPrices);
                } catch (e) {
                    console.error(e)
                    console.log("intraday price")
                }

                eodPrices = [];
                intradayPrices = [];
                runningTasks = [];
            }
        }

        if (runningTasks.length > 0) await Promise.all(runningTasks)

        try {
            await this.repository.upsertEodPrices(eodPrices)
        } catch (e) {
            console.error(e)
            console.error("eod price")
        }

        try {
            await this.repository.upsertIntradayPrices(intradayPrices);
        } catch (e) {
            console.error(e)
            console.log("intraday price")
        }
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

    _process = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>) => {
        const currentTime = DateTime.now().setZone("America/New_York").set({
            hour: 16,
            second: 0,
            millisecond: 0
        });

        let eodPrices: addSecurityPrice[] = [];
        let intradayPrices: addSecurityPrice[] = [];

        for (let j = 0; j < securityGroup.length; j++) {
            const security = securityGroup[j];

            const iexSecurity = response[security.symbol];
            if (!iexSecurity) {
                // Check to see if we have made a record yet for today... for is_eod, if not, then do it with curr time
                if (!security.time) continue;
                if (security.time.day === currentTime.day) continue;
                if (!security.price) continue;

                // Rolling Yesterday Forward
                eodPrices.push({
                    price: security.price,
                    high: security.high,
                    low: security.low,
                    isEod: true,
                    isIntraday: false,
                    open: security.open,
                    time: currentTime,
                    securityId: security.securityId
                })

                continue;
            }

            const iexSecurityPrices = iexSecurity['intraday-prices'] as GetIntraDayPrices[];
            if (!iexSecurityPrices || iexSecurityPrices.length <= 0) {
                if (!security.time) continue;
                if (security.time.day === currentTime.day) continue;
                if (!security.price) continue;

                // Rolling Yesterday Forward
                eodPrices.push({
                    price: security.price,
                    high: security.high,
                    low: security.low,
                    isEod: true,
                    isIntraday: false,
                    open: security.open,
                    time: currentTime,
                    securityId: security.securityId
                })
                continue;
            }

            const iexSecurityPricesSorted = iexSecurityPrices
                .map(p => {
                    return {
                        ...p, parsedTime: DateTime.fromFormat(`${p.date} ${p.minute}`, "yyyy-LL-dd HH:mm", {
                            zone: "America/New_York"
                        })
                    };
                })
                .filter(p => p.parsedTime.isValid)
                .sort((a, b) => a.parsedTime.toUnixInteger() - b.parsedTime.toUnixInteger());

            let changed = false;
            let securityPrice = security.price;
            iexSecurityPricesSorted.forEach(p => {
                if (!security.time) {
                    security.time = p.parsedTime;
                } else if (security.time.toUnixInteger() > p.parsedTime.toUnixInteger()) return;

                changed = true;
                security.time = p.parsedTime
                if (p.close) securityPrice = p.close
                security.low = p.low
                security.high = p.high
                security.open = p.open


                if (!p.close) return
                intradayPrices.push({
                    price: p.close,
                    open: p.open,
                    time: p.parsedTime,
                    high: p.high,
                    low: p.low,
                    isEod: false,
                    securityId: security.securityId,
                    isIntraday: true
                })
            });

            if (!changed || !security.time || !securityPrice) continue;

            eodPrices.push({
                price: securityPrice,
                low: security.low,
                high: security.high,
                open: security.open,
                time: security.time,
                isIntraday: false,
                isEod: true,
                securityId: security.securityId
            })
        }

        return [intradayPrices, eodPrices];
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