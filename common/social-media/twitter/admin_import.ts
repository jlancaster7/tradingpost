import 'dotenv/config'
import {DefaultConfig} from '../../configuration';
import { DefaultTwitter } from './service';
import Repository from '../repository'
import {IDatabase, IMain} from "pg-promise";
import pgPromise from "pg-promise";
import Twitter from "./";
import PostPrepper from "../../post-prepper";
import ElasticService from "../../elastic";
import {Client as ElasticClient} from '@elastic/elasticsearch';

const importList = ['DeItaone','DisruptorStocks','PythiaR','Citrini7','LastBearStandng','concodanomics','ConsensusGurus','LizAnnSonders','winsteadscap','conorsen','MadThunderdome','elerianm','GergelyOrosz','StockMarketNerd','dampedspring','TidefallCapital','FedGuy12','lebas_janney','SpecialSitsNews','Josh_Young_1','zerohedge','QTRResearch','chigrl','EventDrivenMgr','cz_binance','howardlindzon','Sino_Market','AlphaSeeker84','sloth_investor','Crussian17','RyanReeves_','AmitayYaniv','Seawolfcap','KlendathuCap','ActAccordingly','marketplunger1','fed_speak','BucknSF','dalibali2','hhhypergrowth','ExitMultiple','JackFarley96','borrowed_ideas','WallStCynic','StockMKTNewz','InnocenceCapit1','cap_zay','AnalystEgg','countdraghula','NickTimiraos','agnostoxxx','Biohazard3737','LoganMohtashami','rationalwalk','value_invest12','LHSummers','tracyalloway','NestBetter']


const run = async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    await pgClient.connect()
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
    const elasticService = new ElasticService(elasticClient, indexName);

    const postPrepper = new PostPrepper();

    

    const twitterConfiguration = await DefaultConfig.fromCacheOrSSM("twitter");
    const twitter = DefaultTwitter(twitterConfiguration, pgClient, pgp, postPrepper, elasticService);

    await twitter.addTwitterUsersByHandle(importList)
}
run();