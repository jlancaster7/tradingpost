import {DefaultConfig} from "@tradingpost/common/configuration/index";
import pgPromise from "pg-promise";
import pg from "pg";
import IEX from "@tradingpost/common/iex/index";
import Holidays from "@tradingpost/common/market-data/holidays";
import Repository from "@tradingpost/common/market-data/repository";
import {S3Client} from "@aws-sdk/client-s3";
import {SQSClient} from "@aws-sdk/client-sqs";
import ElasticService from "@tradingpost/common/elastic/index";
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

export const init = (async () => {
    const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });

    const marketRepository = new Repository(pgClient, pgp);
    const marketHolidays = new Holidays(marketRepository);

    const iexConfiguration = await DefaultConfig.fromCacheOrSSM("iex");
    const iex = new IEX(iexConfiguration.key);

    const s3Client = new S3Client({region: "us-east-1"});
    const sqsClient = new SQSClient({region: 'us-east-1'});

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

    return {pgp, pgClient, marketHolidays, marketRepository, iex, sqsClient, s3Client, elasticService}
})();

