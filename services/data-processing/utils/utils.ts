const AWS = require('aws-sdk');
import { Pool, Client, PoolClient } from 'pg';
import { Configuration } from './configuration';
import { config, postgresConfig } from '../interfaces/utils';


async function getAWSConfigs(): Promise<config> {

    AWS.config.update({region: 'us-east-1'});
    const ssmClient = new AWS.SSM();
    const configuration = new Configuration(ssmClient);
    const postgresConfiguration = await configuration.fromSSM("/production/postgres");
    const twitterConfiguration = await configuration.fromSSM("/production/twitter");
    const youtubeConfiguration = await configuration.fromSSM("/production/youtube");
    const spotifyConfiguration = await configuration.fromSSM("/production/spotify")

    return {twitter: twitterConfiguration, youtube: youtubeConfiguration, postgres: postgresConfiguration, spotify: spotifyConfiguration};
}

async function getPgClient(postgresConfiguration: postgresConfig): Promise<Client> {

    const pg_client = new Client({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        database: postgresConfiguration['database'] as string,
        password: postgresConfiguration['password'] as string,
        port: 5432
    });

    await pg_client.connect();

    return pg_client;
}

export { getAWSConfigs, getPgClient };

