process.env.CONFIGURATION_ENV = "production"
process.env.FINICITY_CALLBACK_URL = "ndad"
//import {BrokerageService} from "../brokerage/service";
import BrokerageRepository from "../brokerage/repository";
import Brokerage from "../brokerage";
import {DefaultConfig} from "../configuration/index";
import pgPromise from 'pg-promise';
import Finicity from "../finicity/index";

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
    const brokerage = new Brokerage(pgClient, pgp, finicity)
    const response = await brokerage.generateBrokerageAuthenticationLink("8e787902-f0e9-42aa-a8d8-18e5d7a1a34d", "finicity")
    console.log(response);
})()