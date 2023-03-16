import 'dotenv/config'
import {DefaultConfig} from "../configuration";
import pgPromise from "pg-promise";
import pg from 'pg';
import Repository from '../brokerage/repository';
import {Service as FinicityService} from "../brokerage/finicity";
import {Transformer as FinicityTransformer} from "../brokerage/finicity/transformer";
import {default as FinicityApi} from "../finicity";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import Holidays from "../market-data/holidays";
import MarketDataRepository from "../market-data/repository";
import {DateTime} from "luxon";
import {accounts} from "../brokerage/robinhood/api";
import IEX from "../iex/index";
import MarketData from "../market-data/index";
import {init} from "../db/index";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import apn from "apn";
import AndroidNotifications from "../notifications/android";
import NotifRepository from "../notifications/repository";
import Notifications from "../notifications/index";

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


const run = async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    })

    const repository = new Repository(pgClient, pgp);
    const portfolioSummaryService = new PortfolioSummaryService(repository);

    const finicityCfg = await DefaultConfig.fromCacheOrSSM('finicity');
    const finicityApi = new FinicityApi(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicityApi.init();

    const marketDataRepo = new MarketDataRepository(pgClient, pgp);
    const marketHolidays = new Holidays(marketDataRepo);
    const iexConfiguration = await DefaultConfig.fromSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    console.log("I'm testing notifications")
    const streamToString = (stream: any) =>
        new Promise<string>((resolve, reject) => {
            const chunks: any[] = [];
            stream.on("data", (chunk: any) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });

    // const {pgClient, pgp} = await init;

    const s3Client = new S3Client({
        region: "us-east-1"
    });

    const s3Res = await s3Client.send(new GetObjectCommand({
        Bucket: "tradingpost-app-data",
        Key: "ios/AuthKey_6WPUHTZ3LU.p8"
    }));

    const iosKeyBody = await streamToString(s3Res.Body);
    console.log("I'm starting all the setup")
    const iosOptions: apn.ProviderOptions = {
        token: {
            key: iosKeyBody,
            keyId: '6WPUHTZ3LU',
            teamId: '25L2ZZWUPA',
        },
        production: false
    }
    const apnProvider = new apn.Provider(iosOptions);
    const fcmConfig = await DefaultConfig.fromCacheOrSSM("fcm");
    const androidNotif = new AndroidNotifications(fcmConfig.authKey);
    const repo = new NotifRepository(pgClient, pgp)
    const notificationsSrv = new Notifications(apnProvider, androidNotif, repo);

    console.log("I'm past all the setup")
    const watchlistId = 120;
    const currentTime = DateTime.now();
    const twelveHoursAgo = currentTime.minus({hour: 12});

    const curFormat = currentTime.toUTC().toISO();
    const twelveFormat = twelveHoursAgo.toUTC().toISO();
    const u = `https://m.tradingpostapp.com/dash/feed?watchlistId=${watchlistId}&beginDateTime=${twelveFormat}&endDateTime=${curFormat}`;
    await notificationsSrv.sendMessageToUser(
        '4a6f0899-dc6d-40cc-aa6a-1febb579d65a'
        , {
            title: "Test Notification",
            body: "Test Notification",
            data: {
                url: u
            }
        });
    console.log("SENT!")
    // const finicityTransformer = new FinicityTransformer(repository, marketHolidays);
    // const finicitySrv = new FinicityService(finicityApi, repository, finicityTransformer, portfolioSummaryService);

    // await finicitySrv.update("e2268937-157b-4a33-a970-a9ba88d10a46", "6020539284", DateTime.now(), {}, false);

    // console.log("Start")
    // await portfolioSummaryService.computeAccountGroupSummary('e2268937-157b-4a33-a970-a9ba88d10a46')
    // console.log("Fin")
    // const accountIds = [
    //     {
    //         tpAccountId: 689,
    //         internalId: 347,
    //         externalId: '6036155893',
    //         detail: {
    //             description: "ROLLOVER IRA",
    //             dateAsOf: 1678258800
    //         },
    //         aggregationSuccessDate: 1678379879
    //     },
    //     {
    //         tpAccountId: 690,
    //         internalId: 348,
    //         externalId: '6036155894',
    //         detail: {
    //             description: "ROTH IRA",
    //             dateAsOf: 1678258800
    //         },
    //         aggregationSuccessDate: 1678379884
    //     },
    //     {
    //         tpAccountId: 691,
    //         internalId: 349,
    //         externalId: '6036155895',
    //         detail: {
    //             description: "INDIVIDUAL",
    //             dateAsOf: 1678258800
    //         },
    //         aggregationSuccessDate: 1678379884
    //     }
    // ];
    //
    // console.log("Starting")
    // for (let i = 0; i < accountIds.length; i++) {
    //     const account = accountIds[i];
    //     // const holdings = await repository.getFinicityHoldings([account.internalId]);
    //     // await finicityTransformer.holdings('e2268937-157b-4a33-a970-a9ba88d10a46', '6020539284', account.externalId, holdings, 'USD', account.detail, DateTime.fromSeconds(account.aggregationSuccessDate));
    //     await finicityTransformer.computeHoldingsHistory(account.tpAccountId)
    //     // const transactions = await repository.getFinicityTransactions([account.internalId])
    //     // console.log("Account: ", account.internalId, "Transaction length: ", transactions.length)
    //     // await finicityTransformer.transactions('e2268937-157b-4a33-a970-a9ba88d10a46', '6020539284',
    //     //     transactions, account.externalId)
    // }
    // console.log("fin")

}

(async () => {
    await run()
})()