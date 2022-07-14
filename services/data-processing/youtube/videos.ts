import fetch from 'node-fetch';
import format from "pg-format";
import {rawYoutubeVideo, youtubeParams, formatedYoutubeVideo} from '../interfaces/youtube';
import {youtubeConfig} from '../interfaces/utils';
import {IDatabase} from "pg-promise";


export class YoutubeVideos {
    private youtubeConfig: youtubeConfig;
    private pg_client: IDatabase<any>;
    private youtubeUrl: string;
    public startDate: string;
    public defaultStartDateDays: number;
    private params: youtubeParams;

    constructor(youtubeConfig: youtubeConfig, pg_client: IDatabase<any>) {
        this.youtubeConfig = youtubeConfig;
        this.pg_client = pg_client;
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
        let query = 'SELECT youtube_channel_id, MAX(created_at) FROM youtube_videos WHERE youtube_channel_id = $1 GROUP BY youtube_channel_id';
        let result = await this.pg_client.result(query, [youtubeChannelId]);

        if (result.rowCount === 0) {
            let defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() - this.defaultStartDateDays);
            await this.setStartDate(defaultDate);
        } else {
            await this.setStartDate(result.rows[0].max);
        }
    }

    importVideos = async (youtubeChannelId: string): Promise<[formatedYoutubeVideo[], number]> => {
        let data = await this.getVideos(youtubeChannelId);

        if (!data[0]) {
            return [[], 0];
        }

        let formatedData = this.formatVideos(data);
        let result = await this.appendVideos(formatedData);
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

        } catch (err) {
            console.log(err);
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

    appendVideos = async (formatedVideos: formatedYoutubeVideo[]): Promise<number> => {
        let success = 0;
        let query: string;
        let result;
        let keys: string;
        let values: any[] = [];
        try {

            keys = Object.keys(formatedVideos[0]).join(' ,');
            formatedVideos.forEach(element => {
                values.push(Object.values(element));
            })

            query = `INSERT INTO youtube_videos(${keys})
            VALUES
            %L
                     ON CONFLICT (video_id)
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

