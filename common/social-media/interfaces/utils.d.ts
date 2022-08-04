export interface config {
    twitter: twitterConfig;
    youtube: youtubeConfig;
    postgres: postgresConfig;
    spotify: spotifyConfig;
}
export interface twitterConfig {
    [key: string]: string | number | boolean;
}
export interface youtubeConfig {
    [key: string]: string | number | boolean;
}
export interface postgresConfig {
    [key: string]: string | number | boolean;
}
export interface spotifyConfig {
    [key: string]: string | number | boolean;
}
export declare type PlatformToken = {
    userId: string;
    platform: string;
    platformUserId: string;
    accessToken: string;
    refreshToken: string;
    expiration: Date;
};
