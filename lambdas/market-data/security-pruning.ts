import {Configuration} from "@tradingpost/common/configuration";
import {Context} from "aws-lambda";
import {Client} from "pg";
import {Repository} from '../../services/market-data/repository';

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssmClient = new AWS.SSM();
const configuration = new Configuration(ssmClient);

const run = async () => {
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const pgClient = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string,
        port: 5432,
    });

    await pgClient.connect();
    const repository = new Repository(pgClient);
    await start(repository)
    await pgClient.end();
}

const start = async (repository: Repository) => {
    await repository.removeSecurityPricesAfter7Days()
}

module.exports.run = async (event: any, context: Context) => {
    await run();
};