import Repository from "./repository"
import {addSecurityPrice, getSecurityWithLatestPrice} from "./interfaces";
import IEX, {GetIntraDayPrices, GetOHLC, PermissionRequiredError} from "../iex";
import {DateTime} from "luxon";
import {buildGroups} from "../../lambdas/market-data/utils";

export default class MarketData {
    constructor(private readonly repository: Repository, private readonly iex: IEX) {
        this.repository = repository
        this.iex = iex;
    }

    public prunePricing = async () => {
        await this.repository.removeSecurityPricesAfter7Days()
    }

    public ingestEodOfDayPricing = async () => {
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
                    const _eodPrices = await this._processEod(securityGroup, response);
                    eodPrices = [...eodPrices, ..._eodPrices];
                } catch (err) {
                    if (err instanceof PermissionRequiredError) {
                        for (let i = 0; i < securityGroup.length; i++) {
                            const sec = securityGroup[i];
                            try {
                                const response = await this.iex.bulk([sec.symbol], ["ohlc"], {
                                    chartIEXOnly: true,
                                    chartIEXWhenNull: true
                                });

                                const _eodPrices = await this._processEod(securityGroup, response);
                                eodPrices = [...eodPrices, ..._eodPrices];
                            } catch (err) {
                                if (err instanceof PermissionRequiredError) {
                                    await this.repository.updateSecurityUtp(sec.securityId, true);
                                    continue;
                                }
                                console.error(`fetching eod prices from iex for symbol=${sec.symbol}`)
                            }
                        }
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

    private _processEod = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>) => {
        const today4pm = DateTime.now().setZone("America/New_York").set({
            hour: 16,
            second: 0,
            minute: 0,
            millisecond: 0
        });

        let eodPrices = []
        for (let j = 0; j < securityGroup.length; j++) {
            const security = securityGroup[j];
            const iexSecurity = response[security.symbol];
            if (!iexSecurity) {
                if (!security.time) continue;
                if (!security.price) continue;

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

            let securityPrice = security.price;
            if (securityPrice === null) {
                if (iexSecurityOhlc.close === null || iexSecurityOhlc.close.price === null) continue;
                securityPrice = iexSecurityOhlc.close.price
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
            })
        }

        return eodPrices;
    }

    public ingestPricing = async () => {
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

    private _process = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>) => {
        const currentTime = DateTime.now().setZone("America/New_York").set({second: 0, millisecond: 0});

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
                    time: DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    }),
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
                    time: DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    }),
                    securityId: security.securityId
                })
                continue;
            }

            // Sorted prices, exclude ones without valid timestamp and no price
            const iexSecurityPricesSorted = iexSecurityPrices
                .map(p => {
                    return {
                        ...p, parsedTime: DateTime.fromFormat(`${p.date} ${p.minute}`, "yyyy-LL-dd HH:mm", {
                            zone: "America/New_York"
                        })
                    };
                })
                .filter(p => p.parsedTime.isValid && p.close !== null)
                .sort((a, b) => a.parsedTime.toUnixInteger() - b.parsedTime.toUnixInteger());

            let changed = false;
            let securityPrice = security.price;
            if (!security.time) security.time = DateTime.now().setZone("America/New_York").set({
                hour: 9,
                minute: 30,
                second: 0,
                millisecond: 0
            });

            if (iexSecurityPricesSorted.length > 0) security.open = iexSecurityPricesSorted[0].open ? iexSecurityPricesSorted[0].open : iexSecurityPricesSorted[0].close

            iexSecurityPricesSorted.forEach(p => {
                // @ts-ignore
                if (security.time.toUnixInteger() > p.parsedTime.toUnixInteger()) return;

                changed = true;
                security.time = p.parsedTime
                if (p.close) securityPrice = p.close

                if (security.low) {
                    if (p.low && p.low < security.low) security.low = p.low
                } else if (p.low) security.low = p.low

                if (security.high) {
                    if (p.high && p.high > security.high) security.high = p.high
                } else if (p.high) security.high = p.high

                intradayPrices.push({
                    price: p.close as number,
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