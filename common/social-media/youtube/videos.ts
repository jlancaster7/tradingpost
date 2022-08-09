import fetch from 'node-fetch';
import { rawYoutubeVideo, youtubeParams, formatedYoutubeVideo } from '../interfaces/youtube';
import { youtubeConfig, PlatformToken } from '../interfaces/utils';
import Repository from '../repository';


export class YoutubeVideos {
    private youtubeConfig: youtubeConfig;
    private repository: Repository;
    private youtubeUrl: string;
    public startDate: string;
    public defaultStartDateDays: number;
    private params: youtubeParams;
    

    constructor(repository: Repository, youtubeConfig: youtubeConfig) {
        this.youtubeConfig = youtubeConfig;
        this.repository = repository;
        this.youtubeUrl = "https://www.googleapis.com/youtube/v3";
        this.startDate = '';
        this.defaultStartDateDays = 90;
        this.params = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        }
    }

    setStartDate = async (startDate: Date) => {
        this.startDate = startDate.toISOString()
    }

    getStartDate = async (youtubeChannelId: string) => {
        const result = await this.repository.getYoutubeLastUpdate(youtubeChannelId);
        this.setStartDate(result);
    }
    refreshTokenById = async (idType: string, id: string): Promise<PlatformToken | null>  => {

        const response = await this.repository.getTokens(idType, [id], 'youtube');
        let data: PlatformToken;
        
        const refreshParams = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: this.youtubeConfig.client_id,
                client_secret: this.youtubeConfig.client_secret,
                refresh_token: response[0].refreshToken,
                grant_type: 'refresh_token'
            })
        }
        const fetchUrl = 'https://oauth2.googleapis.com/token';
        const result = (await (await fetch(fetchUrl, refreshParams)).json())
        const today = new Date();
        if (result.error) {
            console.error(`Youtube Token Referesh for idType: ${idType} and id: ${id} failed to refresh`)
            return null;
        }
        data = {
            userId: response[0].userId, 
            platform: response[0].platform, 
            platformUserId: response[0].platformUserId, 
            accessToken: result.access_token, 
            refreshToken: result.refresh_token, 
            expiration: new Date(today.getTime() + result.expires_in),
            updatedAt: new Date()
        };
        
        await this.repository.upsertUserTokens(data);
        return data;
    }

    importVideos = async (youtubeChannelId: string, accessToken: string | null = null, refreshToken: string | null = null): Promise<[formatedYoutubeVideo[], number]> => {
        let data = await this.getVideos(youtubeChannelId, accessToken, refreshToken);
        if (!data[0]) {
            return [[], 0];
        }
        let formatedData = this.formatVideos(data);
        let result = await this.repository.insertYoutubeVideos(formatedData);
        return [formatedData, result];
    }

    getVideos = async (youtubeChannelId: string, accessToken: string | null = null, refreshToken: string | null = null): Promise<rawYoutubeVideo[]> => {
        if (this.startDate === '') {
            await this.getStartDate(youtubeChannelId)
        }

        let fetchUrl: string;
        let channelParams: URLSearchParams;
        let response;
        const playlistEndpoint = '/activities?';
        let nextToken = '';
        let key = (accessToken ? accessToken : this.youtubeConfig.api_key as string)
        let data: any[] = [];
        let items;

        while (nextToken !== 'end') {
            if (nextToken === '') {
                channelParams = new URLSearchParams({
                    part: 'id,contentDetails,snippet',
                    channelId: youtubeChannelId,
                    publishedAfter: this.startDate,
                    maxResults: '50',
                })
            } else {
                channelParams = new URLSearchParams({
                    part: 'id,contentDetails,snippet',
                    channelId: youtubeChannelId,
                    pageToken: nextToken,
                    publishedAfter: this.startDate,
                    maxResults: '50',
                })
            }
            if (accessToken) {
                channelParams.append('access_token', key)
            }
            else {
                channelParams.append('key', key)
            }
            fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
            response = await (await fetch(fetchUrl, this.params)).json();
            items = response.items;
            if (response.pageInfo && !response.pageInfo.totalResults) {
                throw new Error(`No videos were return for ${youtubeChannelId}`);
            }
            if (accessToken && !items) {
                const newTokens = await this.refreshTokenById('platform_user_id', youtubeChannelId);
                if (newTokens) {
                    channelParams.set('access_token', newTokens.accessToken!)
                    fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                    response = await (await fetch(fetchUrl, this.params)).json();
                    items = response.items;
                    if(!items) {
                        channelParams.delete('access_token');
                        channelParams.append('key', this.youtubeConfig.api_key as string);
                        fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                        response = await (await fetch(fetchUrl, this.params)).json();         
                        items = response.items;
                        if (!items) {
                            throw new Error(`Was unable to get videos using API key or accessToken ${youtubeChannelId}`);
                        }
                    }
                }
                else {
                    channelParams.delete('access_token');
                    channelParams.append('key', this.youtubeConfig.api_key as string);
                    fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                    response = await (await fetch(fetchUrl, this.params)).json();
                    items = response.items;
                    if (!items) {
                        throw new Error(`Was unable to get videos using API key or accessToken ${youtubeChannelId}`);
                    }
                    if (response.pageInfo && !response.pageInfo.totalResults) {
                        throw new Error(`No videos were return for ${youtubeChannelId}`);
                    }
                }
            }
            else if (!items) {
                throw new Error(`No videos were return for ${youtubeChannelId}`);
            }
            items.forEach((element: any) => {
                if (element.snippet.type === 'upload') {
                    data.push(element);
                }
            });
            if (Object.keys(response).includes('nextPageToken')) {
                nextToken = response.nextPageToken;
            } else {
                nextToken = 'end';
            }
        }
        this.startDate = '';
        return data;
    }

    formatVideos = (rawVideos: rawYoutubeVideo[]): formatedYoutubeVideo[] => {
        let formatedVideos: any[] = JSON.parse(JSON.stringify(rawVideos));

        for (let i = 0; i < rawVideos.length; i++) {
            formatedVideos[i].video_id = rawVideos[i].contentDetails.upload.videoId;
            delete formatedVideos[i].contentDetails;
            formatedVideos[i].youtube_created_at = rawVideos[i].snippet.publishedAt;
            formatedVideos[i].youtube_channel_id = rawVideos[i].snippet.channelId;
            formatedVideos[i].title = rawVideos[i].snippet.title;
            formatedVideos[i].description = rawVideos[i].snippet.description;
            formatedVideos[i].thumbnails = JSON.stringify(rawVideos[i].snippet.thumbnails);
            delete formatedVideos[i].snippet;
            formatedVideos[i].video_url = 'https://www.youtube.com/watch?v=' + formatedVideos[i].video_id;
            formatedVideos[i].video_embed = 'https://www.youtube.com/embed/' + formatedVideos[i].video_id;
            delete formatedVideos[i].kind;
            delete formatedVideos[i].etag;
            delete formatedVideos[i].id;
        }
        return formatedVideos;
    }
}

