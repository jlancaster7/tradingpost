import fetch from 'node-fetch';
import { rawYoutubeVideo, youtubeParams, formatedYoutubeVideo } from '../interfaces/youtube';
import { youtubeConfig } from '../interfaces/utils';
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

    importVideos = async (youtubeChannelId: string): Promise<[formatedYoutubeVideo[], number]> => {
        let data = await this.getVideos(youtubeChannelId);

        if (!data[0]) {
            return [[], 0];
        }

        let formatedData = this.formatVideos(data);
        let result = await this.repository.insertYoutubeVideos(formatedData);
        return [formatedData, result];
    }

    getVideos = async (youtubeChannelId: string): Promise<rawYoutubeVideo[]> => {
        if (this.startDate === '') {
            await this.getStartDate(youtubeChannelId)
        }

        let fetchUrl: string;
        let channelParams: URLSearchParams;
        let response;
        const playlistEndpoint = '/activities?';
        let nextToken = '';
        let data: any[] = [];
        let items;
        try {
            while (nextToken !== 'end') {
                if (nextToken === '') {
                    channelParams = new URLSearchParams({
                        key: this.youtubeConfig.api_key as string,
                        part: 'id,contentDetails,snippet',
                        channelId: youtubeChannelId,
                        publishedAfter: this.startDate,
                        maxResults: '50',
                    })
                } else {
                    channelParams = new URLSearchParams({
                        key: this.youtubeConfig.api_key as string,
                        part: 'id,contentDetails,snippet',
                        channelId: youtubeChannelId,
                        pageToken: nextToken,
                        publishedAfter: this.startDate,
                        maxResults: '50',
                    })
                }

                fetchUrl = this.youtubeUrl + playlistEndpoint + channelParams;
                response = await (await fetch(fetchUrl, this.params)).json();
                items = response.items;

                if (items === []) {
                    return [];
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

        } catch (e) {
            console.log(e);
            throw e
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

