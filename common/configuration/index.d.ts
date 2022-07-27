import { SSM } from '@aws-sdk/client-ssm';
declare type ConfigKeys = "elastic" | "iex" | "postgres" | "authkey" | "spotify" | "twitter" | "youtube" | "discord_bot" | "ios" | "fcm" | "substack" | "sendgrid" | "finicity";
interface ConfigPaths extends Record<ConfigKeys, unknown> {
    elastic: {
        cloudId: string;
        apiKey: string;
    };
    finicity: {
        partnerId: string;
        partnerSecret: string;
        appKey: string;
    };
    postgres: {
        host: string;
        user: string;
        password: string;
        database: string;
        port: number;
    };
    fcm: {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_x509_cert_url: string;
    };
    ios: {
        key: string;
        keyId: string;
        teamId: string;
    };
    iex: {
        key: string;
    };
    authkey: string;
    spotify: {
        client_id: string;
        client_secret: string;
    };
    twitter: {
        API_key: string;
        API_secret_key: string;
        bearer_token: string;
        client_id: string;
    };
    youtube: {
        api_key: string;
    };
    discord_bot: {
        token: string;
        guildId: string;
        clientId: string;
    };
    substack: {};
    sendgrid: {
        key: string;
    };
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
    fromSSM: <T extends keyof K>(path: T, options?: ConfigOptions) => Promise<K[T]>;
    fromCacheOrSSM: <T extends keyof K>(path: T) => Promise<K[T]>;
}
export declare const DefaultConfig: Configuration<ConfigPaths>;
export declare const AutomationConfig: Configuration<{
    npm_key: string;
}>;
export {};
