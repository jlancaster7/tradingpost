import { SSM } from '@aws-sdk/client-ssm';
declare type ConfigKeys = "elastic" | "iex" | "postgres" | "authkey" | "spotify" | "twitter" | "youtube" | "discord_bot";
interface ConfigPaths extends Record<ConfigKeys, unknown> {
    elastic: {};
    postgres: {
        host: string;
        user: string;
        password: string;
        database: string;
        port: number;
    };
    iex: {
        key: string;
    };
    authkey: string;
    spotify: {};
    twitter: {};
    youtube: {};
    discord_bot: {};
}
export declare type ConfigurationEnv = "production" | "development";
declare type ConfigOptions = {
    raw: boolean;
    maxCacheDuration?: number;
};
export declare class Configuration {
    private ssmClient;
    private environment;
    private isCacheEnabled;
    private cache;
    constructor(ssmClient: SSM, environment?: ConfigurationEnv, enableCache?: any);
    fromSSM: <T extends keyof ConfigPaths>(path: T, options?: ConfigOptions | undefined) => Promise<ConfigPaths[T]>;
    fromCacheOrSSM: <T extends keyof ConfigPaths>(path: T) => Promise<ConfigPaths[T]>;
}
export declare const DefaultConfig: Configuration;
export {};
