import pg from "pg";
import {addSecurityPrice, getSecurityBySymbol, PriceSourceType} from "../market-data/interfaces";
import IEX, {GetHistoricalPrice, GetIntraDayPrices} from "../iex/index";
import {DateTime} from "luxon";
import Repository from "../market-data/repository";
import MarketDataRepo from "../market-data/repository";
import {buildGroups} from "../market-data";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {DefaultConfig} from "../configuration/index";
import {GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3, S3Client} from "@aws-sdk/client-s3";
import Holidays from "../market-data/holidays";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

class PricingFix {
    private repository: Repository;
    private iex: IEX;
    private s3Client: S3Client;
    private s3: S3;

    private pgClient: IDatabase<any>;
    private pgp: IMain;

    constructor(pgClient: IDatabase<any>, pgp: IMain, iexToken: string) {
        this.repository = new Repository(pgClient, pgp);
        this.iex = new IEX(iexToken)
        this.s3Client = new S3Client({});
        this.s3 = new S3({});
        this.pgClient = pgClient;
        this.pgp = pgp;
    }

    iexIntraday = async () => {
        const securities = await this.repository.getUSExchangeListedSecurities();
        const securitiesMap: Record<string, getSecurityBySymbol> = {};
        securities.filter(sec => sec.priceSource === 'IEX').forEach(sec => securitiesMap[sec.symbol] = sec);
        const groupSecurities = buildGroups(securities, 100);
        for (let i = 0; i < groupSecurities.length; i++) {
            const group = groupSecurities[i];
            const symbols = group.map(sec => sec.symbol);
            const response = await this.iex.bulk(symbols, ['intraday-prices']);

            let securityPrices: addSecurityPrice[] = [];
            for (let idx = 0; idx < group.length; idx++) {
                const {symbol, id} = group[idx];
                if (response[symbol] === undefined || response[symbol] === null) {
                    console.error(`could not find symbol ${symbol}`);
                    continue
                }

                const intradayPrices = response[symbol]['intraday-prices'] as GetIntraDayPrices[];
                if (intradayPrices.length <= 0) {
                    console.error(`no intraday prices available for ${symbol}`);
                    continue
                }

                let latestPrice = intradayPrices.length > 0 ? intradayPrices[0]?.close || null : null
                intradayPrices.forEach(ip => {
                    const dt = DateTime.fromFormat(`${ip.date} ${ip.minute}`, "yyyy-LL-dd HH:mm", {
                        zone: "America/New_York"
                    }).set({second: 0, millisecond: 0});

                    let close = ip.close,
                        open = ip.open,
                        high = ip.high,
                        low = ip.low;
                    if (close !== null) latestPrice = close
                    else {
                        close = latestPrice;
                        open = latestPrice;
                        high = latestPrice;
                        low = latestPrice;
                    }

                    if (close === null) return;
                    if (open === null) open = close
                    if (high === null) high = close
                    if (low === null) low = close

                    securityPrices.push({
                        price: close,
                        low: low,
                        high: high,
                        open: open,
                        time: dt,
                        securityId: id,
                        isEod: false,
                        isIntraday: true
                    });
                })
            }
            await this.repository.upsertIntradayPrices(securityPrices)
        }
    }

    ingestFromS3 = async () => {
        const securities = await this.repository.getUSExchangeListedSecurities();
        const securitiesMap: Record<string, getSecurityBySymbol> = {};
        securities.filter(sec => sec.priceSource === 'IEX').forEach(sec => securitiesMap[sec.symbol] = sec);

        const streamToString = (stream: any): Promise<string> =>
            new Promise((resolve, reject) => {
                const chunks: any = [];
                stream.on("data", (chunk: any) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            });

        for (const symbol in securitiesMap) {
            const security = securitiesMap[symbol];
            const res = await this.s3Client.send(new ListObjectsCommand({
                Bucket: "iex-pricing",
                Prefix: `${security.symbol}-`
            }));

            let lastModified: DateTime | null = null;
            let key: string | null = null;
            res.Contents?.forEach(lm => {
                if (!lm.LastModified) return;
                const dtLm = DateTime.fromJSDate(lm.LastModified)
                if (lastModified === null) {
                    lastModified = dtLm
                    key = lm.Key as string
                }

                if (lastModified.toUnixInteger() < dtLm.toUnixInteger()) {
                    lastModified = dtLm
                    key = lm.Key as string
                }
            });

            if (!key) {
                console.error("could not find key for symbol: ", symbol)
                continue
            }

            try {
                const getObjectResponse = await this.s3Client.send(new GetObjectCommand({
                    Bucket: "iex-pricing",
                    Key: key
                }))
                const bodyContent = await streamToString(getObjectResponse.Body);
                const prices = JSON.parse(bodyContent) as any[];

                let securityPrices: addSecurityPrice[] = [];
                let latestPrice: number | null = null;
                prices.forEach(hp => {
                    const dt = DateTime.fromFormat(hp.date, 'yyyy-LL-dd', {
                        zone: "America/New_York"
                    }).set({minute: 0, hour: 16, second: 0, millisecond: 0});

                    if (!dt.isValid) return;

                    let close = hp.close,
                        open = hp.open,
                        high = hp.high,
                        low = hp.low;

                    if (close === null && latestPrice === null) return
                    if (close !== null && latestPrice === null) latestPrice = close;
                    if (close === null && latestPrice !== null) {
                        close = latestPrice;
                        open = latestPrice;
                        high = latestPrice;
                        low = latestPrice;
                    }

                    if (open === null) open = close
                    if (high === null) high = close
                    if (low === null) low = close

                    securityPrices.push({
                        securityId: security.id,
                        price: close,
                        low: low,
                        high: high,
                        open: open,
                        time: dt,
                        isEod: true,
                        isIntraday: false
                    });
                });

                await this.repository.upsertEodPrices(securityPrices)
            } catch (e) {
                console.error("could not get body content for symbol ", symbol);
            }
        }
    }

    iexHistorical = async () => {
        const securities = await this.repository.getUSExchangeListedSecurities();
        // const securities: getSecurityBySymbol[] = [{
        //     id: 17757,
        //     symbol: 'GTBIF',
        //     zip: '',
        //     primarySicCode: '',
        //     website: '',
        //     tags: [],
        //     state: '',
        //     securityName: '',
        //     sector: '',
        //     phone: '',
        //     logoUrl: '',
        //     lastUpdated: DateTime.now().toJSDate(),
        //     priceSource: PriceSourceType.FINICITY,
        //     issueType: '',
        //     industry: '',
        //     exchange: '',
        //     enableUtp: true,
        //     employees: '',
        //     description: '',
        //     createdAt: DateTime.now().toJSDate(),
        //     country: '',
        //     ceo: '',
        //     companyName: '',
        //     address2: '',
        //     address: '',
        // }];

        const securitiesMap: Record<string, getSecurityBySymbol> = {};
        securities.forEach(sec => securitiesMap[sec.symbol] = sec);
        const groupSecurities = buildGroups(securities, 100);

        let finCnt = 0;
        let runningTasks: Promise<any>[] = [];
        let range = '20230101';
        console.log("Running")
        for (let i = 0; i < groupSecurities.length; i++) {
            const group = groupSecurities[i];
            runningTasks.push((async () => {
                const symbols = group.map(sec => sec.symbol);
                const response = await this.iex.bulk(symbols, ["chart"], {
                    range: range
                });

                let securityPrices: addSecurityPrice[] = []
                for (let idx = 0; idx < group.length; idx++) {
                    finCnt = finCnt + 1
                    const {symbol, id} = group[idx];
                    if (response[symbol] === undefined || response[symbol] === null) {
                        console.error(`could not find symbol ${symbol}`)
                        continue
                    }

                    const historicPrices = (response[symbol]['chart']) as GetHistoricalPrice[];
                    if (historicPrices.length <= 0) {
                        console.error(`no historical prices available for ${symbol}`);
                        continue
                    }

                    let latestPrice = historicPrices[0]?.close || null
                    let earliestDate: DateTime | null = null,
                        latestDate: DateTime | null = null;

                    for (let j = 0; j < historicPrices.length; j++) {
                        const hp = historicPrices[j];
                        const dt = DateTime.fromFormat(hp.date, 'yyyy-LL-dd', {
                            zone: "America/New_York"
                        }).set({minute: 0, hour: 16, second: 0, millisecond: 0});

                        if (!dt.isValid) continue;
                        if (earliestDate === null) earliestDate = dt;
                        if (latestDate === null) latestDate = dt;
                        if (earliestDate.isValid && dt.toUnixInteger() < earliestDate.toUnixInteger()) earliestDate = dt
                        if (latestDate.isValid && dt.toUnixInteger() > latestDate.toUnixInteger()) latestDate = dt
                    }

                    // if (earliestDate !== null && earliestDate.isValid && latestDate !== null && latestDate.isValid) {
                    //     const datefmt = `${earliestDate.year}-${earliestDate.month}-${earliestDate.day}-to-${latestDate.year}-${latestDate.month}-${latestDate.day}`
                    //     const fmt = `${symbol}-${datefmt}.json`
                    //     console.log("UPLOADING FILE:::: ", fmt)
                    //     console.log(`\t PROCESSED:::: ${finCnt}/${securities.length}`);
                    //     // await this.s3Client.send(new PutObjectCommand({
                    //     //     Bucket: "iex-pricing",
                    //     //     Key: fmt,
                    //     //     Body: JSON.stringify(historicPrices)
                    //     // }))
                    // }

                    historicPrices.forEach(hp => {
                        const dt = DateTime.fromFormat(hp.date, 'yyyy-LL-dd', {
                            zone: "America/New_York"
                        }).set({minute: 0, hour: 16, second: 0, millisecond: 0});

                        if (!dt.isValid) return;

                        let close = hp.close,
                            open = hp.open,
                            high = hp.high,
                            low = hp.low;

                        if (close === null && latestPrice === null) return
                        if (close !== null && latestPrice === null) latestPrice = close;
                        if (close === null && latestPrice !== null) {
                            close = latestPrice;
                            open = latestPrice;
                            high = latestPrice;
                            low = latestPrice;
                        }

                        if (open === null) open = close
                        if (high === null) high = close
                        if (low === null) low = close

                        securityPrices.push({
                            securityId: id,
                            price: close,
                            low: low,
                            high: high,
                            open: open,
                            time: dt,
                            isEod: true,
                            isIntraday: false
                        });
                    })
                    console.log(`\t PROCESSED:::: ${finCnt}/${securities.length}`);
                }

                await this.repository.upsertEodPrices(securityPrices)
            })());

            if (runningTasks.length === 8) {
                await Promise.all(runningTasks);
                runningTasks = [];
            }

            console.log(`Group: ${i}/${groupSecurities.length}`)
        }

        if (runningTasks.length > 0) await Promise.all(runningTasks);
    }

    // IEX doesnt always have a price for all days, find securities which dont have prices for trading day
    historicalFix = async () => {
        const symbol = 'SPY';
        const response = await this.pgClient.query<{ id: number, security_id: number, price: number, time: Date, open: number | null, high: number | null, low: number | null, is_eod: boolean, is_intraday: boolean, is_fake: boolean }[]>(`
            SELECT id, security_id, price, time, open, high, low, is_eod, is_intraday, is_fake
            FROM security_price
            WHERE security_id = (SELECT id from security WHERE symbol = $1)
              AND is_eod = true
            order by time asc;`, [symbol]);
        if (response.length <= 0) return;

        const securityPrices: { id: number, securityID: number, price: number, time: DateTime, open: number | null, high: number | null, low: number | null, isFake: boolean }[] = [];
        for (let i = 0; i < response.length; i++) {
            const sec = response[i];
            const curDt = DateTime.fromJSDate(sec.time).setZone("America/New_York").set({
                hour: 16,
                second: 0,
                millisecond: 0,
                minute: 0
            });

            securityPrices.push({
                time: curDt,
                high: sec.high,
                low: sec.low,
                open: sec.open,
                isFake: sec.is_fake,
                price: sec.price,
                securityID: sec.security_id,
                id: sec.id
            });
        }

        const marketDataRepo = new MarketDataRepo(this.pgClient, this.pgp);
        const holidays = new Holidays(marketDataRepo);

        let start = DateTime.now().setZone("America/New_York").set({
            hour: 16,
            minute: 0,
            second: 0,
            millisecond: 0,
        });

        let end = start.minus({year: 10});
        const tradingDays = []; // sort in ASC order
        const tdMap: Map<number, {}> = new Map();
        while (end.toUnixInteger() <= start.toUnixInteger()) {
            const tmp = end;
            end = end.plus({day: 1});
            const isTradingDay = await holidays.isTradingDay(tmp);
            if (!isTradingDay) continue;
            tradingDays.push(tmp)
            tdMap.set(tmp.toUnixInteger(), {});
        }

        const earliestDate = tradingDays[0];
        const filteredPrices = securityPrices.filter(s => {
            if (s.time.toUnixInteger() < earliestDate.toUnixInteger()) return false
            if (tdMap.get(s.time.toUnixInteger()) === undefined) {
                console.log("REMOVING: ", s.time.toString())
                return false;
            }
            return true;
        });

        for (let i = 0, j = 0; i < tradingDays.length || j < filteredPrices.length; i++) {
            const tradingDay = tradingDays[i];
            const filteredPrice = filteredPrices[j];
            if (tradingDay.toUnixInteger() === filteredPrice.time.toUnixInteger()) {
                j = j + 1
                continue;
            }

            console.log("MISSING DATE: ", tradingDay.toString())
        }
    }
}

(async () => {
    console.log("Starting")
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    })
    await pgClient.connect()
    const iexCfg = await DefaultConfig.fromCacheOrSSM("iex");

    const pricingFix = new PricingFix(pgClient, pgp, iexCfg.key);
    console.log("Here..")
    await pricingFix.iexHistorical();
    console.log("Finished")
})()