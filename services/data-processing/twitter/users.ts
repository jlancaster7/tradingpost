import fetch from 'node-fetch';
import format from "pg-format";
import {twitterParams} from '../interfaces/twitter';
import {twitterConfig} from '../interfaces/utils';
import {rawTwitterUser, formatedTwitterUser} from '../interfaces/twitter';
import {IDatabase} from "pg-promise";

export class TwitterUsers {
    private twitterConfig: twitterConfig;
    private pg_client: IDatabase<any>;
    private twitterUrl: string;
    private params: twitterParams;

    constructor(twitterConfig: twitterConfig, pg_client: IDatabase<any>) {
        this.twitterConfig = twitterConfig;
        this.pg_client = pg_client;
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
        let success = 0;
        let query: string;
        let result;
        let keys: string;
        let values: any[] = [];

        try {
            keys = Object.keys(users[0]).join(' ,');
            users.forEach(element => {
                values.push(Object.values(element));
            })

            query = `INSERT INTO twitter_users(${keys})
            VALUES
            %L
                     ON CONFLICT (twitter_user_id)
            DO NOTHING`;
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            result = await this.pg_client.result(format(query, values));

            success += result.rowCount;
        } catch (err) {
            console.log(err);
        }
        return success;
    }
}
