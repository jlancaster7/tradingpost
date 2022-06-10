import {Configuration} from "../lib/configuration";
import {IEX} from "../lib/iex";
import {Client} from "pg";
import {addSecurityPrice, Repository} from "../lib/repository";
import {DateTime} from 'luxon';
import MarketService from "../lib/market-service";

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);

const run = async() => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const iexConfiguration = await configuration.fromSSM("/production/iex");
    const iex = new IEX(iexConfiguration['key'] as string);
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    });
    await pgClient.connect();
    const repository = new Repository(pgClient);
    const marketSrv = new MarketService(repository);
    console.log("Getting is market open...")
    await marketSrv.isMarketOpen();
    await pgClient.end()
}

(async()=>{
    await run()
})()