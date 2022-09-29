process.env.CONFIGURATION_ENV = 'production'
process.env.FINICITY_CALLBACK_URL ="https://app.tradingpostapp.com"
import {DefaultConfig} from "../configuration";
import pgPromise from 'pg-promise';
import Finicity from "../finicity";
import FinicityService from "../brokerage/finicity";
import Repository from "../brokerage/repository"
import FinicityTransformer from "../brokerage/finicity/transformer";
import Brokerage from "../brokerage";
import {PortfolioSummaryService} from "../brokerage/portfolio-summary";
import pg from "pg";

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
    await finicity.init();

    // const deleteTables = [
    //     'tradingpost_current_holding',
    //     'tradingpost_historical_holding',
    //     'tradingpost_transaction',
    //     'account_group_hpr',
    //     '_tradingpost_account_to_group',
    //     'tradingpost_account_group_stat',
    //     'tradingpost_account_group',
    //     'tradingpost_brokerage_account'
    // ]
    // for (let d of deleteTables) {
    //     let query = `DELETE FROM ${d}`;
    //     await pgClient.query(query);
    // }

    const tpUserId = "8e787902-f0e9-42aa-a8d8-18e5d7a1a34d";
    // console.log("Starting...")
    const brokerageService = new Brokerage(pgClient, pgp, finicity);
    // await brokerageService.addNewAccounts("6007115349", "finicity")
    const url = await brokerageService.generateBrokerageAuthenticationLink(tpUserId, 'finicity', '332');
    console.log(url)
    // // await brokerageService.newlyAuthenticatedBrokerage(tpUserId, 'finicity')
    // console.log("Finished")
})()
