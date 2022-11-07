process.env.CONFIGURATION_ENV = 'production'
import { DefaultConfig } from "../configuration";
import pgPromise, { IDatabase, IMain } from "pg-promise";
import Finicity from './index';
import Repository from '../brokerage/repository';
import FinicityService from "../brokerage/finicity";
import FinicityTransformer from "../brokerage/finicity/transformer";

(async() => {
    let pgClient: IDatabase<any>;
    let pgp: IMain;
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    pgp = pgPromise({});
    pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    await pgClient.connect()
    const repo = new Repository(pgClient, pgp);
    const transformer = new FinicityTransformer(repo);
    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init()

    const finicityService = new FinicityService(finicity, repo, transformer)

    console.log('test')
    console.log(await finicityService.generateBrokerageAuthenticationLink('e96aea04-9a60-4832-9793-f790e60df8eb'))
   
})() 