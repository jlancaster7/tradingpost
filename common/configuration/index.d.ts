import { SSM } from '@aws-sdk/client-ssm';
interface ConfigPaths {
    elastic: {};
    postgres: {
        host: string;
        user: string;
        password: string;
        database: string;
        port: number;
    };
    authkey: string;
    spotify: {};
    twitter: {};
    youtube: {};
    discord_bot: {};
}
export declare type ConfigurationEnv = "production" | "development" | "automation";
declare type ConfigOptions = {
    raw: boolean;
    maxCacheDuration?: number;
};
export declare class Configuration<K extends Record<string, any>> {
    private ssmClient;
    private environment;
    private isCacheEnabled;
    private cache;
    private defaultOptions;
    constructor(ssmClient: SSM, defaultOptions?: Configuration<K>["defaultOptions"], environment?: ConfigurationEnv, enableCache?: any);
    fromSSM: <T extends keyof K>(path: T, options?: ConfigOptions | undefined) => Promise<K[T]>;
    fromCacheOrSSM: <T extends keyof K>(path: T) => Promise<K[T]>;
}
export declare const DefaultConfig: Configuration<ConfigPaths>;
export declare const AutomationConfig: Configuration<{
    npm_key: string;
}>;
export {};
