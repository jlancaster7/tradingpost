import 'dotenv/config';
import {Context} from "aws-lambda";
import pg from 'pg';
import {DefaultYoutube} from "@tradingpost/common/social-media/youtube/service";
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import ElasticService from "@tradingpost/common/elastic";
import {Client as ElasticClient} from "@elastic/elasticsearch";

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

let pgClient: IDatabase<any>;
let pgp: IMain;

const runLambda = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        await pgClient.connect()
    }

    const elasticConfiguration = await DefaultConfig.fromCacheOrSSM("elastic");
    const elasticService = new ElasticService(new ElasticClient({
        cloud: {
            id: elasticConfiguration.cloudId
        },
        auth: {
            apiKey: elasticConfiguration.apiKey
        },
        maxRetries: 5,
    }), "tradingpost-search");

    const youtubeCfg = await DefaultConfig.fromCacheOrSSM("youtube");
    const youtube = DefaultYoutube(youtubeCfg, pgClient, pgp, elasticService);

    try {
        await youtube.import();
    } catch (e) {
        console.error(e)
        throw e;
    }
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}