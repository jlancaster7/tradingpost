import 'dotenv/config';
import { DefaultConfig } from '@tradingpost/common/configuration';
//import GPU from 'gpu.js';
import pgPromise, {IDatabase, IMain} from 'pg-promise';
import FinnhubService from './service';
import Finnhub from './finnhub';
import { GPTAccount } from './gptAccount';
import Repository from './repository'
import { OpenAIClass } from './openAI';
import { S3Client } from "@aws-sdk/client-s3";


let pgClient: IDatabase<any>;
let pgp: IMain;
export const availableTickers = ['META', 'AMZN', 'TSLA', 'AAPL', 'NFLX', 'MSFT', 'TGT', 'NVDA', 'GOOGL', 'ADBE', 'SNOW', 'DIS', 'CRWD', 'CRM', 'SNAP', 'V', 'ABNB', 'DDOG', 'COST']

export type initOutput = {
    openaiServices: OpenAIClass
    finnhubService: FinnhubService
    gptAccount: GPTAccount
}
export const init = async (): Promise<initOutput> => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM('postgres');
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })
    }
    const s3client = new S3Client({
        region: "us-east-1"
    });
    // @ts-ignore
    const openaiConfiguration = await DefaultConfig.fromCacheOrSSM('openai');
    // @ts-ignore
    const finnhubConfiguration = await DefaultConfig.fromCacheOrSSM('finnhub');

    const repo = new Repository(pgClient, pgp, s3client);

    const gptAccount = new GPTAccount(repo);

    // @ts-ignore
    const finnhub = new Finnhub(finnhubConfiguration.FINNHUB_API_KEY);
    const finnhubService = new FinnhubService(repo, finnhub);

    // @ts-ignore
    const openaiServices = new OpenAIClass(openaiConfiguration.OPENAI_API_KEY, repo);

    return {openaiServices, finnhubService, gptAccount}
}