process.env.CONFIGURATION_ENV = "production"
process.env.FINICITY_CALLBACK_URL = "ndad"
import {BrokerageService} from "../brokerage/service";
import BrokerageRepository from "../brokerage/repository";
import {DefaultConfig} from "../configuration/index";
import pgPromise from 'pg-promise';
import {FinicityService} from "../brokerage/finicity/index";
import Finicity from "../finicity/index";
import {FinicityTransformer} from "../brokerage/finicity/transformer";

(async () => {
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });
    await pgClient.connect()

    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");

    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init()

    const repository = new BrokerageRepository(pgClient, pgp);
    const finicityService = new FinicityService(finicity, repository, new FinicityTransformer({
        getFinicityInstitutions() {
            throw new Error("Method Not Implemented");
        },
        getSecuritiesWithIssue() {
            throw new Error("Method Not Implemented");
        },
        getTradingPostAccountsWithFinicityNumber(userId: any) {
            throw new Error("Method Not Implemented");
        },
    }));
    const finicityUserUrl = await finicityService.generateBrokerageAuthenticationLink("8e787902-f0e9-42aa-a8d8-18e5d7a1a34d")
    console.log(finicityUserUrl)
})()