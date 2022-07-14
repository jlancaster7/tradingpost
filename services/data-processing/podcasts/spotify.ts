import fetch from 'node-fetch';
import {Pool, Client, PoolClient} from 'pg';
import format from "pg-format";
import {spotifyConfig} from '../interfaces/utils';
import {rawSpotifyShow, spotifyParams, spotifyShow, spotifyEpisode} from '../interfaces/podcasts';


export class SpotifyShows {
    private spotifyConfig: spotifyConfig;
    private pg_client: Client;
    private tokenUrl: string;
    private showUrl: string;
    private access_token: string;
    private params: spotifyParams;

    constructor(spotifyConfig: spotifyConfig, pg_client: Client) {
        this.spotifyConfig = spotifyConfig;
        this.pg_client = pg_client;
        this.tokenUrl = 'https://accounts.spotify.com/api/token';
        this.showUrl = 'https://api.spotify.com/v1/shows/';
        this.access_token = '';
        this.params = {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ',
                'Content-Type': 'application/json'
            }
        };
    }

    setAccessToken = async () => {
        try {
            let buffer = Buffer.from(this.spotifyConfig.client_id + ':' + this.spotifyConfig.client_secret).toString('base64');
            let params = {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + buffer,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({grant_type: 'client_credentials'})
            };
            const response = await (await fetch(this.tokenUrl, params)).json();
            this.access_token = response.access_token;

            this.params.headers.Authorization = this.params.headers.Authorization + this.access_token;
            return 1;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }

    importShows = async (showIds: string | string[]): Promise<[spotifyShow[], number]> => {
        if (typeof showIds === 'string') {
            showIds = [showIds]
        }

        const data = await this.getShowInfo(showIds);

        if (data === []) {
            return [[], 0];
        }
        const formatedData = this.formatShowInfo(data);

        const result = await this.appendShow(formatedData);
        return [formatedData, result];
    }

    importEpisdoes = async (showId: string): Promise<[spotifyEpisode[], number]> => {
        const data = await this.getEpisodes(showId);

        if (data === []) {
            return [[], 0]
        }
        const results = await this.appendEpisdoes(data);

        return [data, results]
    }

    getShowInfo = async (showIds: string[]): Promise<rawSpotifyShow[]> => {

        if (this.access_token === '') {
            await this.setAccessToken()
        }

        let results = [];
        let fetchUrl: string;
        let showResponse;

        for (let i = 0; i < showIds.length; i++) {
            fetchUrl = this.showUrl + showIds[i] + '?market=US';

            showResponse = await (await fetch(fetchUrl, this.params)).json();

            if (Object.keys(showResponse).includes('error')) {
                if (showResponse.error.status === 401) {
                    await this.setAccessToken();
                    showResponse = await (await fetch(fetchUrl, this.params)).json();

                } else {
                    continue;
                }
            }
            showResponse.spotify_show_id = showIds[i];
            results.push(showResponse);

        }
        return results;
    }

    getEpisodes = async (showId: string): Promise<spotifyEpisode[]> => {
        if (this.access_token === '') {
            await this.setAccessToken()
        }

        let formatedResponse: spotifyEpisode;
        let results: spotifyEpisode[] = [];
        let fetchUrl: string;
        let showResponse;
        let next = '';
        let embedResponse;

        fetchUrl = this.showUrl + showId + '/episodes?limit=50&market=US';
        while (next !== 'end') {
            showResponse = await (await fetch(fetchUrl, this.params)).json();
            if (Object.keys(showResponse).includes('error')) {
                if (showResponse.error.status === 401) {
                    this.setAccessToken();
                    showResponse = await (await fetch(fetchUrl, this.params)).json();

                } else {
                    return [];
                }
            }
            for (let i = 0; i < showResponse.items.length; i++) {
                let test = await (await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${showResponse.items[i].id}`)).json();
                showResponse.items[i].embed = test;

            }
            showResponse.items.forEach((element: any) => {
                formatedResponse = {
                    spotify_episode_id: element.id,
                    spotify_show_id: showId,
                    audio_preview_url: element.audio_preview_url,
                    name: element.name,
                    description: element.description,
                    duration_ms: element.duration_ms,
                    explicit: element.explicit,
                    html_description: element.html_description,
                    is_externally_hosted: element.is_externally_hosted,
                    is_playable: element.is_playable,
                    language: element.language,
                    languages: JSON.stringify(element.languages),
                    embed: JSON.stringify(element.embed),
                    external_urls: JSON.stringify(element.external_urls),
                    images: JSON.stringify(element.images),
                    release_date: new Date(element.release_date)
                }
                results.push(formatedResponse);
            })

            if (!showResponse.next) {
                next = 'end';
            } else {
                fetchUrl = showResponse.next
            }

        }
        return results;
    }

    formatShowInfo = (data: rawSpotifyShow[]): spotifyShow[] => {
        let formatedShowInfo: spotifyShow;
        let formatedShows = []
        for (let i = 0; i < data.length; i++) {
            formatedShowInfo = {
                spotify_show_id: data[i].spotify_show_id,
                name: data[i].name,
                description: data[i].description,
                explicit: data[i].explicit,
                html_description: data[i].html_description,
                is_externally_hosted: data[i].is_externally_hosted,
                media_type: data[i].media_type,
                publisher: data[i].publisher,
                copyrights: JSON.stringify(data[i].copyrights),
                total_episodes: data[i].total_episodes,
                languages: JSON.stringify(data[i].languages),
                external_urls: JSON.stringify(data[i].external_urls),
                images: JSON.stringify(data[i].images)
            }
            formatedShows.push(formatedShowInfo);
        }

        return formatedShows;
    }
    appendEpisdoes = async (episodes: spotifyEpisode[]) => {
        let success = 0;
        let value_index: string;
        let query: string;
        let result;
        let keys: string;
        let values: any[] = [];
        try {

            keys = Object.keys(episodes[0]).join(' ,');
            episodes.forEach(element => {
                values.push(Object.values(element));
            })


            query = `INSERT INTO spotify_episodes(${keys})
                     VALUES %L
                     ON CONFLICT (spotify_episode_id) DO NOTHING`;

            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            result = await this.pg_client.query(format(query, values));

            success += result.rowCount;

        } catch (err) {
            console.log(err);

        }
        return success;

    }

    appendShow = async (formatedShow: spotifyShow[]): Promise<number> => {
        let success = 0;
        let query: string;
        let result;
        let keys: string;
        let values: any[] = [];
        try {

            keys = Object.keys(formatedShow[0]).join(' ,');
            formatedShow.forEach(element => {
                values.push(Object.values(element));
            })

            query = `INSERT INTO spotify_users(${keys})
                     VALUES %L
                     ON CONFLICT (spotify_show_id) DO NOTHING`;
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            result = await this.pg_client.query(format(query, values));

            success += result.rowCount;

        } catch (err) {
            console.log(err);

        }
        return success;
    }

}
