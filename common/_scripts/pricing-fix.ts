import pg from "pg";
import {addSecurityPrice, getSecurityBySymbol, getSecurityWithLatestPrice} from "../market-data/interfaces";
import IEX, {GetHistoricalPrice, GetIntraDayPrices} from "../iex/index";
import {DateTime} from "luxon";
import Repository from "../market-data/repository";
import {buildGroups} from "../../lambdas/market-data/utils";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import {DefaultConfig} from "../configuration/index";
import {PutObjectCommand, S3Client, S3, GetObjectCommand, ListObjectsCommand} from "@aws-sdk/client-s3";

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

    constructor(pgClient: IDatabase<any>, pgp: IMain, iexToken: string) {
        this.repository = new Repository(pgClient, pgp);
        this.iex = new IEX(iexToken)
        this.s3Client = new S3Client({});
        this.s3 = new S3({});
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
        const securitiesMap: Record<string, getSecurityBySymbol> = {};
        securities.filter(sec => sec.priceSource === 'IEX').forEach(sec => securitiesMap[sec.symbol] = sec);
        const groupSecurities = buildGroups(securities, 100);

        let finCnt = 0;
        for (let i = 0; i < groupSecurities.length; i++) {
            const group = groupSecurities[i];
            const symbols = group.map(sec => sec.symbol);
            const response = await this.iex.bulk(symbols, ["chart"], {
                range: '1m'
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
                    if (dt.toUnixInteger() < earliestDate.toUnixInteger()) earliestDate = dt
                    if (dt.toUnixInteger() > latestDate.toUnixInteger()) latestDate = dt
                }

                if (earliestDate !== null && earliestDate.isValid && latestDate !== null && latestDate.isValid) {
                    const datefmt = `${earliestDate.year}-${earliestDate.month}-${earliestDate.day}-to-${latestDate.year}-${latestDate.month}-${latestDate.day}`
                    const fmt = `${symbol}-${datefmt}.json`
                    console.log("UPLOADING FILE:::: ", fmt)
                    console.log(`\t PROCESSED:::: ${finCnt}/${securities.length}`);
                    await this.s3Client.send(new PutObjectCommand({
                        Bucket: "iex-pricing",
                        Key: fmt,
                        Body: JSON.stringify(historicPrices)
                    }))
                }

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
            }

            await this.repository.upsertEodPrices(securityPrices)
        }
    }

    // localHistorical runs a job that pulls in the market days for the time range and
    // runs through each security making sure that security trading day is up to date, as
    // iex does not return all trading days(even null)
    // We run the job once we are finished with importing all historical pricing and intraday pricing
    // Caveat here is that we need to know when a security IPO'd vs was removed from listing
    localHistorical = async () => {

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
    await pricingFix.iexHistorical();
    console.log("Finished")
})()