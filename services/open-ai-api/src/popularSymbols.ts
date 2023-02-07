
import 'dotenv/config';
import pgPromise from "pg-promise";
import ElasticService from '@tradingpost/common/elastic';
import { DefaultConfig } from "@tradingpost/common/configuration";
import {Client as ElasticClient} from '@elastic/elasticsearch';
import { execProc } from "@tradingpost/common/db"
import { ISecurityList } from '@tradingpost/common/api/entities/interfaces'

const run = async () => {
    console.log('start')
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });


    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticClient = new ElasticClient({
    cloud: {
        id: elasticConfiguration.cloudId as string
    },
    auth: {
        apiKey: elasticConfiguration.apiKey as string
    },
    maxRetries: 5,
    }) 
    const indexName = "tradingpost-search";
    const elastic = new ElasticService(elasticClient, indexName);
    console.log('elastic service started')
    const results = await pgClient.query(`SELECT id, social_analytics FROM data_user`);
    const securities = await execProc<ISecurityList>("tp.api_security_list"); 
    let stats: {[key: string]:  {allTime: number, yesterday: number, monthPrior: number}} = {}
    securities.forEach((a) => {
        stats[a.symbol] = {allTime: 0, yesterday: 0, monthPrior: 0}
    })
   
    let yesterday = new Date()
    let monthPrior = new Date()
    yesterday.setDate(yesterday.getDate() - 1);
    monthPrior.setDate(yesterday.getDate() - 90);
    console.log('going through securities')
    for (let d of securities) {
        const { hits } = await elastic.search(`$${d.symbol}`)
        
        for (let g of hits) {

            if (stats[d.symbol]) {
                stats[d.symbol].allTime += 1;
                if (g._source?.platformCreatedAt && new Date(g._source?.platformCreatedAt) >= yesterday) {
                    stats[d.symbol].yesterday += 1;
                }
                if (g._source?.platformCreatedAt && new Date(g._source?.platformCreatedAt) >= monthPrior) {
                    stats[d.symbol].monthPrior += 1;
                }
            }
        }
    }
    const sortableStats: any[] = []
    securities.forEach((item) => {
        sortableStats.push([item.symbol, stats[item.symbol].allTime, stats[item.symbol].monthPrior])
    })
    sortableStats.sort((a,b) => b[2] - a[2]);
    console.log(sortableStats.slice(0,30));
}

run();