import fetch from 'node-fetch';
import { twitterConfig, PlatformToken } from '../interfaces/utils';
import {rawTwitterUser, formatedTwitterUser, twitterParams} from '../interfaces/twitter';
import Repository from '../repository'


export class TwitterUsers {
    private twitterConfig: twitterConfig;

    private repository: Repository;
    private twitterUrl: string;
    private params: twitterParams;

    constructor(twitterConfig: twitterConfig, repository: Repository) {
        this.twitterConfig = twitterConfig;
        this.repository = repository;

        this.twitterUrl = "https://api.twitter.com/2";
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterConfig['bearer_token'] as string
            }
        }
    }
    
    refreshTokensbyId = async (idType: string, id: string): Promise<PlatformToken | null> => {
        try {
            const response = await this.repository.getTokens(idType, [id], 'twitter');
            const authUrl = '/oauth2/token';
            let data: PlatformToken;
            
            const refreshParams = {
                method: 'POST',
                headers: {
                    "content-type": 'application/x-www-form-urlencoded'
                }, 
                form: {
                    refresh_token: response[0].refreshToken,
                    grant_type: 'refresh_token',
                    client_id: this.twitterConfig.clientId
                }
            }
            const fetchUrl = this.twitterUrl + authUrl;
            const result = (await (await fetch(fetchUrl, refreshParams)).json()).data;
            
            const expiration = new Date();
            if (!result) {null;}
            data = {
                userId: response[0].userId, 
                platform: response[0].platform, 
                platformUserId: response[0].platformUserId, 
                accessToken: result.access_token, 
                refreshToken: result.refresh_token, 
                expiration: new Date( expiration.getTime() + result.expires_in),
                updatedAt: new Date()
            };
        
            await this.repository.upsertUserTokens(data);
            return data;
        } catch (err) {
            console.error(err);
            return null
        }
    }
   

    importUserByToken = async (twitterUser: {userId: string, accessToken: string, refreshToken: string, expiration: number}): Promise<[formatedTwitterUser, number]> => {

        let data: rawTwitterUser | null;
        let token: PlatformToken; 
        
        data = await this.getUserInfoByToken(twitterUser.accessToken);
        
        if (!data) { 
            const newToken = await this.refreshTokensbyId('user_id', twitterUser.userId);
            if (!newToken) { throw new Error(`Failed to import user for user id: ${twitterUser.userId}`);
            }
            data = await this.getUserInfoByToken(twitterUser.accessToken);
            if (!data) {
                throw new Error("Twitter API failed");
            }
        }
        const expiration = new Date();
        token = {userId: twitterUser.userId, 
            platform: 'twitter', 
            platformUserId: data.id, 
            accessToken: twitterUser.accessToken, 
            refreshToken: twitterUser.refreshToken, 
            expiration: new Date( expiration.getTime() + twitterUser.expiration),
            updatedAt: new Date()
        }     

        const formatedData = this.formatUser([data])[0];
        
        let dummyTokens = (await this.repository.getTokens('platform_user_id', [token.platformUserId], 'twitter'));
        if (dummyTokens.length && twitterUser.userId !== dummyTokens[0].userId) {
            const dummyCheck = await this.repository.isUserIdDummy(dummyTokens[0].userId);
            if (dummyCheck) {
                await this.repository.mergeDummyAccounts({newUserId: twitterUser.userId, dummyUserId: dummyTokens[0].userId});
            } else {
                throw new Error("This account is claimed by another non-dummy user.");
            }
        }
        await this.repository.upsertUserTokens(token);
        const result = await this.repository.upsertTwitterUser([formatedData]);
        return [formatedData, result];
    }

    importUserByHandle = async (handles: string | string[]): Promise<formatedTwitterUser[]> => {
        if (typeof handles === 'string') {
            handles = [handles];
        }
        const data = await this.getUserInfo(handles);
        if (data === []) {
            return []
        }
        const formatedData = this.formatUser(data);
        const result = await this.repository.upsertTwitterUser(formatedData);

        return formatedData;
    }

    getUserInfo = async (handles: string[]): Promise<rawTwitterUser[]> => {
        let data;
        try {
            this.params.headers.authorization = 'BEARER ' + this.twitterConfig['bearer_token'] as string;
            const userInfoEndpoint = "/users/by?";

            const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                usernames: handles.join(),
                "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username",
            })

            const response = await fetch(fetchUrl, this.params);
            data = (await response.json()).data;
            return data;
        } catch (err) {
            console.log(err);
            return [];
        }
    }
    getUserInfoByToken = async (token: string): Promise<rawTwitterUser | null> => {
        let data;
        try {
            this.params.headers.authorization = 'BEARER ' + token;

            const userInfoEndpoint = "/users/me?";

            const fetchUrl = this.twitterUrl + userInfoEndpoint + new URLSearchParams({
                "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username"
            })

            const response = await fetch(fetchUrl, this.params);
            data = (await response.json()).data;
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    formatUser = (rawUsers: rawTwitterUser[]): formatedTwitterUser[] => {
        
        let formatedUsers: formatedTwitterUser[] = [];
        for (let i = 0; i < rawUsers.length; i++) {
            formatedUsers.push({
                twitter_user_id: rawUsers[i].id,
                username: rawUsers[i].username,
                display_name: rawUsers[i].name,
                description: rawUsers[i].description,
                profile_url: 'https://www.twitter.com/' + rawUsers[i].username,
                profile_image_url: rawUsers[i].profile_image_url,
                location: rawUsers[i].location,
                protected: rawUsers[i].protected,
                twitter_created_at: new Date(rawUsers[i].created_at),
                follower_count: rawUsers[i].public_metrics.followers_count,
                following_count: rawUsers[i].public_metrics.following_count
            })

        }

        return formatedUsers;
    }

   
}
