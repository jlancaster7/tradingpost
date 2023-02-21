import {SSM} from '@aws-sdk/client-ssm';
//We can add this in the future if we want
// declare global {
//     namespace NodeJS {
//         interface ProcessEnv extends Partial<ConfigPaths> { }
//     }
// }
type ConfigKeys =
    "elastic"
    | "iex"
    | "postgres"
    | "authkey"
    | "spotify"
    | "twitter"
    | "youtube"
    | "discord_bot"
    | "ios"
    | "fcm"
    | "substack"
    | "sendgrid"
    | "finicity"
    | "robinhood"
    | "openai"
    | "finnhub"
    | "teams"


export interface ConfigPaths extends Record<ConfigKeys, unknown> {
    teams: {
        alertChannel: string
    }
    robinhood: {
        clientId: string
        expiresIn: number
        scope: string
    }
    elastic: {
        cloudId: string
        apiKey: string
    }
    finicity: {
        partnerId: string
        partnerSecret: string
        appKey: string
    }
    postgres: {
        host: string
        user: string
        password: string
        database: string
        port: number
    }
    fcm: {
        authKey: string
    }
    ios: {
        key: string
        keyId: string
        teamId: string
    }
    iex: { key: string }
    authkey: string
    spotify: {
        client_id: string
        client_secret: string
    }
    twitter: {
        API_key: string
        API_secret_key: string
        bearer_token: string
        client_id: string
    }
    youtube: {
        api_key: string
        client_id: string
        client_secret: string
    }
    discord_bot: {
        token: string
        guildId: string
        clientId: string
    }
    substack: {}
    sendgrid: {
        key: string
    }
    openai: {
        OPENAI_API_KEY: string
    }
    finnhub: {
        FINNHUB_API_KEY: string
    }
}

export type ConfigurationEnv = "production" | "development" | "automation"

type ConfigOptions = {
    raw: boolean,
    maxCacheDuration?: number
}

const defaultOptions: Partial<Record<ConfigKeys, ConfigOptions>> = {
    authkey: {
        raw: true,
    }
}

type Expirable<T> = {
    [P in keyof T]?: {
        value: T[P]
        cachedAt: number
    }
}

export class Configuration<K extends Record<string, any>> {
    private ssmClient: SSM;
    private environment: string
    private isCacheEnabled: boolean
    private cache: Expirable<K> = {}
    private defaultOptions: Partial<Record<keyof K, ConfigOptions>>

    constructor(
        ssmClient: SSM,
        defaultOptions?: Configuration<K>["defaultOptions"],
        environment: ConfigurationEnv = (process.env.CONFIGURATION_ENV as ConfigurationEnv || "development"),
        enableCache = process.env.CONFIGURATION_ENABLE_CACHE ? JSON.parse(process.env.CONFIGURATION_ENABLE_CACHE) : true
    ) {

        this.defaultOptions = defaultOptions || {}
        this.isCacheEnabled = enableCache;
        this.environment = environment;
        this.ssmClient = ssmClient;
    }

    fromSSM = async <T extends keyof K>(path: T, options?: ConfigOptions): Promise<K[T]> => {
        let output: string | undefined;

        if (path in process.env) {
            const val = process.env[path] as string;
            return (options?.raw || this.defaultOptions[path]?.raw) ? val : JSON.parse(val);
        }


        const fullPath = `/${this.environment}/${path as string}`
        if ((process.env as any)[path]) {
            console.log(`${fullPath} as been loaded from the local environment`);
            output = process.env[path] as any
        } else
            output = (await this.ssmClient.getParameter({Name: fullPath, WithDecryption: true})).Parameter?.Value;

        if (output === undefined)
            throw new Error(`Could not find value for parameter path '${fullPath}' please make sure the path exists and the value is populated`);

        return (options?.raw || this.defaultOptions[path]?.raw) ? output : JSON.parse(output);
    }

    //NOTE: Currently cache will only use default options. This was done to remove the need to cache based on options 
    fromCacheOrSSM = async <T extends keyof K>(path: T): Promise<K[T]> => {
        if (!this.isCacheEnabled)
            console.warn("'fromCacheOrSSM' was called but cache is not enabled. You should enable cache or use 'fromSSM'")

        const cachedEntry = this.cache[path],
            maxDuration = this.defaultOptions[path]?.maxCacheDuration

        if (cachedEntry && maxDuration && (Date.now().valueOf() - cachedEntry.cachedAt) > maxDuration)
            delete this.cache[path];

        //Needed to explicitly cast. I think typescript is confused...
        return (this.cache[path]?.value || await this.fromSSM(path)) as K[T]
    }
}

const BASE_REGION = "us-east-1";
const API_VERSION = '2014-11-06';

export const DefaultConfig = new Configuration<ConfigPaths>(new SSM({
    apiVersion: API_VERSION,
    region: BASE_REGION,
}), {authkey: {raw: true}});


export const AutomationConfig = new Configuration<{ npm_key: string }>(new SSM({
    apiVersion: API_VERSION,
    region: BASE_REGION,
}), {npm_key: {raw: true}}, "automation");


