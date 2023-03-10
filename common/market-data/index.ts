import Repository from "./repository"
import {addSecurityPrice, getSecurityWithLatestPrice} from "./interfaces";
import IEX, {GetIntraDayPrices, PermissionRequiredError} from "../iex";
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
                    const response = await this.iex.bulk(symbols, ["intraday-prices"], {
                        sort: "desc",
                        chartLast: 1
                    });

                    const _eodPrices = await this._processEod(securityGroup, response);
                    eodPrices = [...eodPrices, ..._eodPrices];
                } catch (err) {
                    if (err instanceof PermissionRequiredError) {
                        for (let i = 0; i < securityGroup.length; i++) {
                            const sec = securityGroup[i];
                            try {
                                const response = await this.iex.bulk([sec.symbol], ["intraday-prices"], {
                                    sort: "desc",
                                    chartLast: 1
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
                runningTasks = [];
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
                    high: security.price,
                    low: security.price,
                    isEod: true,
                    isIntraday: false,
                    open: security.price,
                    time: today4pm,
                    securityId: security.securityId
                })
                continue;
            }

            const iexSecurityIntradayPrices = iexSecurity['intraday-prices'] as GetIntraDayPrices[];
            if (!iexSecurityIntradayPrices || iexSecurityIntradayPrices.length === 0) {
                if (!security.time) continue;
                if (!security.price) continue;
                eodPrices.push({
                    price: security.price,
                    high: security.price,
                    low: security.price,
                    isEod: true,
                    securityId: security.securityId,
                    time: today4pm,
                    isIntraday: false,
                    open: security.price
                });
                continue;
            }

            const p = iexSecurityIntradayPrices[0];
            let marketClose: number | null = p.marketClose;
            if (!marketClose) marketClose = p.close !== null ? p.close : security.price
            if (!marketClose) continue

            let marketOpen: number | null = p.marketOpen
            if (!marketOpen) marketOpen = p.open !== null ? p.open : security.open

            let marketHigh: number | null = p.marketHigh
            if (!marketHigh) marketHigh = p.high !== null ? p.high : security.high

            let marketLow: number | null = p.marketLow
            if (!marketLow) marketLow = p.low !== null ? p.low : security.low

            eodPrices.push({
                price: marketClose,
                open: marketOpen,
                time: today4pm,
                low: marketLow,
                high: marketHigh,
                isIntraday: false,
                isEod: true,
                securityId: security.securityId,
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

    _process = async (securityGroup: getSecurityWithLatestPrice[], response: Record<string, any>) => {
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
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    isEod: true,
                    isIntraday: false,
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
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    isEod: true,
                    isIntraday: false,
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

            if (iexSecurityPricesSorted.length === 0) {
                if (!security.price) continue

                eodPrices.push({
                    price: security.price,
                    high: security.price,
                    low: security.price,
                    open: security.price,
                    isEod: true,
                    isIntraday: false,
                    time: DateTime.now().setZone("America/New_York").set({
                        hour: 9,
                        minute: 30,
                        second: 0,
                        millisecond: 0
                    }),
                    securityId: security.securityId
                })
                continue
            }

            if (security.time && iexSecurityPricesSorted[iexSecurityPricesSorted.length - 1].parsedTime.toUnixInteger() === security.time.toUnixInteger()) continue

            let securityPrice = security.price;
            if (!security.time) security.time = DateTime.now().setZone("America/New_York").set({
                hour: 9,
                minute: 30,
                second: 0,
                millisecond: 0
            });

            security.open = iexSecurityPricesSorted[0].open ? iexSecurityPricesSorted[0].open : iexSecurityPricesSorted[0].close
            security.low = iexSecurityPricesSorted[0].close
            security.open = iexSecurityPricesSorted[0].close
            security.price = iexSecurityPricesSorted[0].close

            iexSecurityPricesSorted.forEach(p => {
                security.time = p.parsedTime
                securityPrice = p.close

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

            if (!securityPrice) continue

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