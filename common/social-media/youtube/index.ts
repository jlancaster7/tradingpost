import Repository from "../repository";
import {youtubeConfig, PlatformToken} from '../utils';
import {channelInfo, formatedChannelInfo, formatedYoutubeVideo, rawYoutubeVideo} from "./interfaces";
import fetch from "node-fetch";

export default class YouTube {
    private repository: Repository;
    private youtubeCfg: youtubeConfig;
    private readonly youtubeUrl: string;
    private readonly standardYtUrl: string;
    private readonly customYtUrl: string;
    private params: { headers: { accept: string }; method: string };
    private startDate: string;
    private defaultStartDateDays: number;

    constructor(repository: Repository, cfg: youtubeConfig) {
        this.repository = repository;
        this.youtubeCfg = cfg;
        this.youtubeUrl = "https://www.googleapis.com/youtube/v3";
        this.standardYtUrl = 'https://www.youtube.com/channel/';
        this.customYtUrl = 'https://www.youtube.com/c/';
        this.params = {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        }
        this.startDate = '';
        this.defaultStartDateDays = 90;
    }

    setStartDate = async (startDate: Date) => {
        this.startDate = startDate.toISOString()
    }

    getStartDate = async (youtubeChannelId: string) => {
        const result = await this.repository.getYoutubeLastUpdate(youtubeChannelId);
        this.setStartDate(result);
    }

    refreshTokenById = async (idType: string, id: string): Promise<PlatformToken | null> => {
        const response = await this.repository.getTokens(idType, [id], 'youtube');
        let data: PlatformToken;

        const refreshParams = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: this.youtubeCfg.client_id,
                client_secret: this.youtubeCfg.client_secret,
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
            claims: response[0].claims || {handle: ''},
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
        let key = (accessToken ? accessToken : this.youtubeCfg.api_key as string)
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
            } else {
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
                    if (!items) {
                        channelParams.delete('access_token');
                        channelParams.append('key', this.youtubeCfg.api_key as string);
                        fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                        response = await (await fetch(fetchUrl, this.params)).json();
                        items = response.items;
                        if (!items) {
                            throw new Error(`Was unable to get videos using API key or accessToken ${youtubeChannelId}`);
                        }
                    }
                } else {
                    channelParams.delete('access_token');
                    channelParams.append('key', this.youtubeCfg.api_key as string);
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
            } else if (!items) {
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
            formatedVideos[i].aspect_ratio = 1.0
            formatedVideos[i].max_width = 400.0
        }
        return formatedVideos;
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

    importYoutubeUsersbyToken = async (youtubeUsers: { userId: string, accessToken: string, refreshToken: string, expiration: number }): Promise<[formatedChannelInfo[], number]> => {
        let temp: channelInfo[];
        let data: channelInfo[] = [];
        let count: number = 0;
        let out: PlatformToken[] = [];
        let formatedData: formatedChannelInfo[];

        temp = await this.getChannelInfobyToken(youtubeUsers.userId, youtubeUsers.accessToken);

        const expiration = new Date();
        for (let d of temp) {
            data.push(d);
            out.push({
                userId: youtubeUsers.userId,
                platform: 'youtube',
                platformUserId: d.id,
                accessToken: youtubeUsers.accessToken,
                refreshToken: youtubeUsers.refreshToken,
                expiration: new Date(expiration.getTime() + youtubeUsers.expiration),
                claims: {
                    handle: d.title
                },
                updatedAt: new Date()
            });
        }

        formatedData = this.formatChannelInfo(data);
        const dummyTokens = await this.repository.getTokens('platform_user_id', out.map(a => a.platformUserId), 'youtube');
        if (dummyTokens !== null && dummyTokens.length > 0 && !dummyTokens.map(a => a.userId).includes(youtubeUsers.userId)) {
            for (let d of dummyTokens) {
                const dummyCheck = await this.repository.isUserIdDummy(d.userId);
                if (!dummyCheck) {
                    throw new Error("One of the channels on this user is claimed by another non-dummy user.")
                }
            }
        }
        for (let d of out) {
            const temp = dummyTokens.find((a: PlatformToken) => a.platformUserId === d.platformUserId);
            if (!temp) {
                await this.repository.upsertUserTokens(d);
            } else {
                await this.repository.upsertUserTokens(d);
                await this.repository.mergeDummyAccounts({newUserId: d.userId, dummyUserId: temp.userId});
            }
        }
        count += await this.repository.insertChannelInfo(formatedData);

        return [formatedData, count];
    }

    disconnectYoutubeUser = async (userId: string) => {
        const platform = 'youtube';
        const authUrl = 'https://oauth2.googleapis.com/revoke';
        const tokens = await this.repository.getTokens('user_id', [userId], platform);
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: tokens[0].refreshToken
            })
        }
        const response = await fetch(authUrl, params);

        console.log(await response.json());

        await this.repository.removeUserToken('user_id', userId, platform)

    }

    getChannelInfobyToken = async (userId: string, token: string): Promise<channelInfo[]> => {

        let fetchUrl: string;
        let response;
        let result: channelInfo[] = []
        const channelEndpoint = '/channels?';

        const channelParams = new URLSearchParams({
            access_token: token,
            part: 'snippet,statistics,status',
            mine: 'true',
            maxResults: '10'
        });
        fetchUrl = this.youtubeUrl + channelEndpoint + channelParams;
        response = await (await fetch(fetchUrl, this.params)).json()
        if (!response.pageInfo.totalResults) {
            throw new Error(`No channel exists for this Google account for userId: ${userId}`);
        }
        for (let i = 0; i < response.items.length; i++) {
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
                    key: this.youtubeCfg.api_key as string,
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
                key: this.youtubeCfg.api_key as string,
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
                    key: this.youtubeCfg.api_key as string,
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