import fetch from 'node-fetch';
import {twitterConfig} from '../interfaces/utils';
import {rawTwitterUser, formatedTwitterUser, PlatformToken, twitterParams} from '../interfaces/twitter';
import Repository from '../repository'
import {IDatabase, IMain} from "pg-promise";

export class TwitterUsers {
    private twitterConfig: twitterConfig;
    //private pg_client: IDatabase<any>;
    //private pgp: IMain
    private repository: Repository;
    private twitterUrl: string;
    private params: twitterParams;

    constructor(twitterConfig: twitterConfig, repository: Repository) {
        this.twitterConfig = twitterConfig;
        this.repository = repository;
        //this.pg_client = pg_client;
        //this.pgp = pgp;
        this.twitterUrl = "https://api.twitter.com/2";
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterConfig['bearer_token'] as string
            }
        }
    }
    
    refreshTokensbyId = async (userIds: string[]) => {
        try {
            const response = await this.repository.getTokens(userIds, 'twitter');
            const authUrl = '/oauth2/token';
            let data = [];
            for (let d of response) {
                const refreshParams = {
                    method: 'POST',
                    headers: {
                        "content-type": 'application/x-www-form-urlencoded'
                    }, 
                    form: {
                        refresh_token: d.claims.refresh_token,
                        grant_type: 'refresh_token',
                        client_id: this.twitterConfig.clientId
                    }
                }
                const fetchUrl = this.twitterUrl + authUrl;
                const response = (await (await fetch(fetchUrl, refreshParams)).json()).data;
                data.push({userId: d.user_id, platform: d.platform, platformUserId: d.platform_user_id, accessToken: response.access_token, refreshToken: response.refresh_token, expiration: response.expires_in});
            }
            await this.repository.upsertUserTokens(data);
        } catch (err) {
            console.error(err);
        }
    }
   

    importUserByToken = async (twitterUsers: {userId: string, accessToken: string, refreshToken: string, expiration: string}[]): Promise<[formatedTwitterUser[], number]> => {

        let data: rawTwitterUser[] = [];
        let out: PlatformToken[] = []; 
        let temp: rawTwitterUser | null;
        
        for (let d of twitterUsers) {
            temp = await this.getUserInfoByToken(d.accessToken);
            if (!temp) { 
                await this.refreshTokensbyId([d.userId]);
                temp = await this.getUserInfoByToken(d.accessToken);
                if (!temp) { continue; }
            }
            out.push({userId: d.userId, platform: 'twitter', platformUserId: temp.id, accessToken: d.accessToken, refreshToken: d.refreshToken, expiration: d.expiration})
            data.push(temp);
        }
        
        if (data === []) {
            return [[],0]
        }
        const formatedData = this.formatUser(data);
        await this.repository.upsertUserTokens(out);
        const result = await this.repository.upsertTwitterUser(formatedData);

        return [formatedData, result] ;
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
                "user.fields": "created_at,description,id,location,name,profile_image_url,protected,public_metrics,username",
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
