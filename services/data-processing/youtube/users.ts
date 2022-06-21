import fetch from 'node-fetch';
import format from "pg-format";
import { Client, PoolClient } from 'pg';
import { channelInfo, youtubeParams, formatedChannelInfo } from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';


export class YoutubeUsers {
    private youtubeConfig: youtubeConfig;
    private pg_client: Client;
    private youtubeUrl: string;
    private standardYtUrl: string;
    private customYtUrl: string;
    private params: youtubeParams;
    constructor(youtubeConfig: youtubeConfig, pg_client: Client) {
        this.youtubeConfig = youtubeConfig;
        this.pg_client = pg_client;
        this.youtubeUrl = "https://www.googleapis.com/youtube/v3";
        this.standardYtUrl = 'https://www.youtube.com/channel/';
        this.customYtUrl = 'https://www.youtube.com/c/';
        this.params = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        }
    }

    importYoutubeUsers = async (userChannelUrl: string | string[]): Promise<[formatedChannelInfo[], number]> => {
        if (typeof userChannelUrl === 'string') {userChannelUrl = [userChannelUrl]};

        let results = []; let data: channelInfo | undefined; let count: number = 0; let formatedData:formatedChannelInfo;

        for (let i = 0; i < userChannelUrl.length; i++) {
            data = await this.getChannelInfobyUrl(userChannelUrl[i]);
            if (data === undefined) {continue;}
            formatedData = this.formatChannelInfo(data);
            count += await this.appendChannelInfo(formatedData);
            results.push(formatedData);
        }

        return [results, count];
    }

    getChannelInfobyUrl = async (userChannelUrl: string): Promise<channelInfo | undefined> => {
        let customChannelName: string; let fetchUrl: string; let response;
        const channelEndpoint = '/channels?';
        const searchEndpoint = "/search?"

        try {

            if (userChannelUrl.includes(this.standardYtUrl)) {
                const channelId = userChannelUrl.replace(this.standardYtUrl, '');
                const channelParams = new URLSearchParams({
                    key: this.youtubeConfig.api_key as string,
                    part: 'snippet,statistics,status',
                    id: channelId,
                    maxResults: '10',
                })
                fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                response = await (await fetch(fetchUrl, this.params)).json();

                let dataOutput: channelInfo = {
                    id: response.items[0].id,
                    title: response.items[0].snippet.title,
                    description: response.items[0].snippet.description,
                    country: response.items[0].snippet.country,
                    customUrl: response.items[0].snippet.customUrl,
                    publishedAt: new Date(response.items[0].snippet.publishedAt),
                    thumbnails: response.items[0].snippet.thumbnails,
                    statistics: response.items[0].statistics,
                    status: response.items[0].status
                }
                return dataOutput;



            } else if (userChannelUrl.includes(this.customYtUrl)) {
                customChannelName = userChannelUrl.replace(this.customYtUrl, '').toLowerCase();

            } else {
                console.log('Invalid Youtube URL');
                return undefined;
            }

            const searchParams = new URLSearchParams({
                key: this.youtubeConfig.api_key as string,
                q: customChannelName,
                part: 'id',
                type: 'channel',
                maxResults: '10'
            })
            fetchUrl = this.youtubeUrl + searchEndpoint + searchParams;

            response = await (await fetch(fetchUrl, this.params)).json();
            const data = response.items;


            for (let i = 0; i < data.length; i++) {
                const channelParams = new URLSearchParams({
                    key: this.youtubeConfig.api_key as string,
                    part: 'snippet,statistics,status',
                    id: data[i].id.channelId,
                    maxResults: '10',
                })
                fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                response = await (await fetch(fetchUrl, this.params)).json();

                if (response.items[0].snippet.customUrl === customChannelName) {

                    let dataOutput: channelInfo = {
                        id: response.items[0].id,
                        title: response.items[0].snippet.title,
                        description: response.items[0].snippet.description,
                        country: response.items[0].snippet.country,
                        customUrl: response.items[0].snippet.customUrl,
                        publishedAt: new Date(response.items[0].snippet.publishedAt),
                        thumbnails: response.items[0].snippet.thumbnails,
                        statistics: response.items[0].statistics,
                        status: response.items[0].status
                    }
                    return dataOutput;
                }
            }
            console.log('Could not find Channel ID based on the channel profile URL provided');
            return undefined;
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }

    formatChannelInfo = (data: channelInfo): formatedChannelInfo => {

        let formatedChannel: any = JSON.parse(JSON.stringify(data));

        formatedChannel.youtube_channel_id = data.id;
        delete formatedChannel.id;
        formatedChannel.custom_url = data.customUrl;
        delete formatedChannel.customUrl;
        formatedChannel.youtube_created_at = data.publishedAt;
        delete formatedChannel.publishedAt;

        return formatedChannel;
    }

    appendChannelInfo = async (data: formatedChannelInfo): Promise<number> => {
        let success = 0;
        let query: string; let result; let keys: string; let values: any[] = [];
        try {

            keys = Object.keys(data).join(' ,');
            values = Object.values(data);


            query = `INSERT INTO youtube_users(${keys}) VALUES %L ON CONFLICT (youtube_channel_id) DO NOTHING`;
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            result = await this.pg_client.query(format(query, values));

            success += result.rowCount;

        } catch(err) {
            console.log(err);

        }
        return success;
    }


}


