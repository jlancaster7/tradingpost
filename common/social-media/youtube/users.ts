import fetch from 'node-fetch';
import {channelInfo, formatedChannelInfo, youtubeParams} from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';
import Repository from '../repository';
import { PlatformToken } from '../interfaces/utils';


export class YoutubeUsers {
    private youtubeConfig: youtubeConfig;
    private repository: Repository;
    private youtubeUrl: string;
    private standardYtUrl: string;
    private customYtUrl: string;
    private params: youtubeParams;

    constructor(repository: Repository, youtubeConfig: youtubeConfig) {
        this.youtubeConfig = youtubeConfig;
        this.repository = repository;
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

    importYoutubeUsersById = async (userChannelUrl: string[]): Promise<[formatedChannelInfo[], number]> => {
        let temp: channelInfo | undefined;
        let data: channelInfo[] = [];
        let count: number = 0;
        let formatedData: formatedChannelInfo[];

        for (let d of userChannelUrl) {
            temp = await this.getChannelInfobyUrl(d);
            if (temp === undefined) {
                continue;
            }
            data.push(temp);
        }
        formatedData = this.formatChannelInfo(data);
        count += await this.repository.insertChannelInfo(formatedData);

        return [formatedData, count];
    }
    importYoutubeUsersbyToken = async (youtubeUsers: {userId: string, accessToken: string, refreshToken: string, expiration: string}[]): Promise<[formatedChannelInfo[], number]> => {
        let temp: channelInfo[];
        let data: channelInfo[] = [];
        let count: number = 0;
        let out: PlatformToken[] = [];
        let formatedData: formatedChannelInfo[];

        for (let d of youtubeUsers) {
            temp = await this.getChannelInfobyToken(d.accessToken);
            if (temp === undefined) {
                continue;
            }
            temp.forEach(a => data.push(a));

            out.push({userId: d.userId, platform: 'youtube', platformUserId: temp[0].id, accessToken: d.accessToken, refreshToken: d.refreshToken, expiration: d.expiration});
        }

        formatedData = this.formatChannelInfo(data);
        await this.repository.upsertUserTokens(out);
        count += await this.repository.insertChannelInfo(formatedData);
        

        return [formatedData, count];
    }

    getChannelInfobyToken = async (token: string): Promise<channelInfo[]> => {
        
        let fetchUrl: string;
        let response;
        let result: channelInfo[] = []
        const channelEndpoint = '/channels?';
        
        try {
            const channelParams = new URLSearchParams({
                access_token: token,
                part: 'snippet,statistics,status',
                mine: 'true',
                maxResults: '10'
            });

            fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
            response = (await (await fetch(fetchUrl, this.params)).json()).items;

            for (let i = 0; i < response.length; i++) {
                result.push({
                    id: response.items[0].id,
                    title: response.items[0].snippet.title,
                    description: response.items[0].snippet.description,
                    country: response.items[0].snippet.country,
                    customUrl: response.items[0].snippet.customUrl,
                    publishedAt: new Date(response.items[0].snippet.publishedAt),
                    thumbnails: response.items[0].snippet.thumbnails,
                    statistics: response.items[0].statistics,
                    status: response.items[0].status
                });   
            }
            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    getChannelInfobyUrl = async (userChannelUrl: string): Promise<channelInfo | undefined> => {
        let customChannelName: string;
        let fetchUrl: string;
        let response;
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
                });

                fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                response = await (await fetch(fetchUrl, this.params)).json();

                return {
                    id: response.items[0].id,
                    title: response.items[0].snippet.title,
                    description: response.items[0].snippet.description,
                    country: response.items[0].snippet.country,
                    customUrl: response.items[0].snippet.customUrl,
                    publishedAt: new Date(response.items[0].snippet.publishedAt),
                    thumbnails: response.items[0].snippet.thumbnails,
                    statistics: response.items[0].statistics,
                    status: response.items[0].status
                };
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
                });

                fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
                response = await (await fetch(fetchUrl, this.params)).json();

                if (response.items[0].snippet.customUrl === customChannelName) {
                    return {
                        id: response.items[0].id,
                        title: response.items[0].snippet.title,
                        description: response.items[0].snippet.description,
                        country: response.items[0].snippet.country,
                        customUrl: response.items[0].snippet.customUrl,
                        publishedAt: new Date(response.items[0].snippet.publishedAt),
                        thumbnails: response.items[0].snippet.thumbnails,
                        statistics: response.items[0].statistics,
                        status: response.items[0].status
                    };
                }
            }

            console.log('Could not find Channel ID based on the channel profile URL provided');
            return undefined;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    formatChannelInfo = (data: channelInfo[]): formatedChannelInfo[] => {
        let formatedChannel: formatedChannelInfo[] = [];
        for (let d of data) {
            formatedChannel.push({
                youtube_channel_id: d.id,
                title: d.title,
                description: d.description,
                country: d.country,
                custom_url: d.customUrl,
                youtube_created_at: d.publishedAt,
                thumbnails: d.thumbnails,
                statistics: d.statistics,
                status: d.status
            })
        }
        return formatedChannel;
    }

}
