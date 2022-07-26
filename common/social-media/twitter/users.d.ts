import { twitterConfig } from '../interfaces/utils';
import { rawTwitterUser, formatedTwitterUser } from '../interfaces/twitter';
import Repository from '../repository';
export declare class TwitterUsers {
    private twitterConfig;
    private repository;
    private twitterUrl;
    private params;
    constructor(twitterConfig: twitterConfig, repository: Repository);
    refreshTokensbyId: (userIds: string[]) => Promise<void>;
    importUserByToken: (twitterUsers: {
        userId: string;
        accessToken: string;
        refreshToken: string;
        expiration: string;
    }[]) => Promise<[formatedTwitterUser[], number]>;
    importUserByHandle: (handles: string | string[]) => Promise<formatedTwitterUser[]>;
    getUserInfo: (handles: string[]) => Promise<rawTwitterUser[]>;
    getUserInfoByToken: (token: string) => Promise<rawTwitterUser | null>;
    formatUser: (rawUsers: rawTwitterUser[]) => formatedTwitterUser[];
}
