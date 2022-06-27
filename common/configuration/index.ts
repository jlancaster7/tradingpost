import {SSM} from '@aws-sdk/client-ssm';

type ConfigKeys = "elastic" | "iex" | "postgres" | "authkey" | "spotify" | "twitter" | "youtube" | "discord_bot"

interface ConfigPaths extends Record<ConfigKeys, unknown> {
    elastic: {}
    postgres: {
        host: string,
        user: string,
        password: string,
        database: string,
        port: number
    }
    iex: { key: string }
    authkey: string,
    spotify: {}
    twitter: {}
    youtube: {}
    discord_bot: {}
}

export type ConfigurationEnv = "production" | "development"

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

export class Configuration {
    private ssmClient: SSM;
    private environment: string
    private isCacheEnabled: boolean
    private cache: Expirable<ConfigPaths> = {}

    constructor(
        ssmClient: SSM,
        environment: ConfigurationEnv = (process.env.CONFIGURATION_ENV as ConfigurationEnv || "development"),
        enableCache = process.env.CONFIGURATION_ENABLE_CACHE ? JSON.parse(process.env.CONFIGURATION_ENABLE_CACHE) : true
    ) {

        console.log("Configuration ENV: ", process.env.CONFIGURATION_ENV);
        this.isCacheEnabled = enableCache;
        this.environment = environment;
        this.ssmClient = ssmClient;
    }

    fromSSM = async <T extends keyof ConfigPaths>(path: T, options?: ConfigOptions): Promise<ConfigPaths[T]> => {
        const fullPath = `/${this.environment}/${path}`
        const res = (await this.ssmClient
            .getParameter({Name: fullPath, WithDecryption: true}));
        if (res.Parameter?.Value === undefined)
            throw new Error(`Could not find value for parameter path '${fullPath}' please make sure the path exists and the value is populated`);

        return (options?.raw || defaultOptions[path]?.raw) ? res.Parameter.Value : JSON.parse(res.Parameter.Value);
    }

    //NOTE: Currently cache will only use default options. This was done to remove the need to cache based on options 
    fromCacheOrSSM = async <T extends keyof ConfigPaths>(path: T): Promise<ConfigPaths[T]> => {
        if (!this.isCacheEnabled)
            console.warn("'fromCacheOrSSM' was called but cache is not enabled. You should enable cache or use 'fromSSM'")

        const cachedEntry = this.cache[path],
            maxDuration = defaultOptions[path]?.maxCacheDuration

        if (cachedEntry && maxDuration && (Date.now().valueOf() - cachedEntry.cachedAt) > maxDuration)
            delete this.cache[path];

        //Needed to explicitly cast. I think typescript is confused...
        return (this.cache[path]?.value || await this.fromSSM(path)) as ConfigPaths[T]
    }
}

export const DefaultConfig = new Configuration(new SSM({
    apiVersion: '2014-11-06',
    region: "us-east-1",
}));
