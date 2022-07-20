import fetch from 'node-fetch';
import {twitterConfig} from '../interfaces/utils';
import {rawTwitterUser, formatedTwitterUser, twitterParams} from '../interfaces/twitter';
import {IDatabase, IMain} from "pg-promise";

export class TwitterUsers {
    private twitterConfig: twitterConfig;
    private pg_client: IDatabase<any>;
    private pgp: IMain
    private twitterUrl: string;
    private params: twitterParams;

    constructor(twitterConfig: twitterConfig, pg_client: IDatabase<any>, pgp: IMain) {
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
        this.pgp = pgp;
        this.twitterUrl = "https://api.twitter.com/2";
        this.params = {
            method: 'GET',
            headers: {
                authorization: 'BEARER ' + this.twitterConfig['bearer_token'] as string
            }
        }
    }

    importUser = async (handles: string | string[]): Promise<[formatedTwitterUser[], number]> => {
        if (typeof handles === 'string') {
            handles = [handles]
        }

        const data = await this.getUserInfo(handles);
        if (data === []) {
            return [[], 0]
        }
        const formatedData = this.formatUserInfo(data);
        const result = await this.appendUserInfo(formatedData);

        return [formatedData, result];
    }

    getUserInfo = async (handles: string[]): Promise<rawTwitterUser[]> => {
        let data;
        try {
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

    formatUserInfo = (rawUsers: rawTwitterUser[]): formatedTwitterUser[] => {
        let formatedUsers: any[] = JSON.parse(JSON.stringify(rawUsers));

        for (let i = 0; i < rawUsers.length; i++) {
            formatedUsers[i].follower_count = rawUsers[i].public_metrics.followers_count;
            formatedUsers[i].following_count = rawUsers[i].public_metrics.following_count;
            formatedUsers[i].twitter_created_at = new Date(rawUsers[i].created_at);
            formatedUsers[i].twitter_user_id = rawUsers[i].id;
            formatedUsers[i].display_name = rawUsers[i].name;
            formatedUsers[i].profile_url = 'https://www.twitter.com/' + rawUsers[i].username;

            delete formatedUsers[i].name;
            delete formatedUsers[i].created_at;
            delete formatedUsers[i].id;
            delete formatedUsers[i].public_metrics;
        }

        return formatedUsers;
    }

    appendUserInfo = async (users: formatedTwitterUser[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'protected', prop: 'protected'},
                {name: 'display_name', prop: 'display_name'},
                {name: 'follower_count', prop: 'follower_count'},
                {name: 'following_count', prop: 'following_count'},
                {name: 'location', prop: 'location'},
                {name: 'twitter_created_at', prop: 'twitter_created_at'},
                {name: 'username', prop: 'username'},
                {name: 'description', prop: 'description'},
                {name: 'profile_img_url', prop: 'profile_img_url'},
                {name: 'profile_url', prop: 'profile_url'},
                {name: 'twitter_user_id', prop: 'twitter_user_id'},
            ], {table: 'twitter_users'})
            const query = this.pgp.helpers.insert(users, cs) + ' ON CONFLICT DO NOTHING';
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const result = await this.pg_client.result(query);
            return result.rowCount
        } catch (err) {
            console.log(err);
            throw err
        }
    }
}
