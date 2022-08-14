import {DefaultConfig} from "../configuration/index";
import pgPromise from "pg-promise";
import Finicity from "../finicity/index";
import Brokerage from "../brokerage/index";

(async() => {
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
    const brokerageService = new Brokerage(pgClient, pgp, finicity);
    const url = await brokerageService.generateBrokerageAuthenticationLink("fb3a92f3-ce22-4a9c-8680-49600893bd68", "finicity")
    console.log(url)
})()