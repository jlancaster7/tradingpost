import fetch from 'node-fetch';
import {spotifyConfig} from '../interfaces/utils';
import {rawSpotifyShow, spotifyParams, spotifyShow, spotifyEpisode} from '../interfaces/podcasts';
import {IDatabase, IMain} from "pg-promise";

export class SpotifyShows {
    private spotifyConfig: spotifyConfig;
    private pg_client: IDatabase<any>;
    private pgp: IMain;
    private tokenUrl: string;
    private showUrl: string;
    private access_token: string;
    private params: spotifyParams;

    constructor(spotifyConfig: spotifyConfig, pg_client: IDatabase<any>, pgp: IMain) {
        this.spotifyConfig = spotifyConfig;
        this.pg_client = pg_client;
        this.pgp = pgp;
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

    importEpisodes = async (showId: string): Promise<[spotifyEpisode[], number]> => {
        const data = await this.getEpisodes(showId);

        if (data.length <= 0) {
            return [[], 0]
        }

        const results = await this.appendEpisodes(data);
        if (results) return [data, results]

        return [[], 0]
    }

    getShowInfo = async (showIds: string[]): Promise<rawSpotifyShow[]> => {
        try {


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
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    getEpisodes = async (showId: string): Promise<spotifyEpisode[]> => {
        try {
            if (this.access_token === '') await this.setAccessToken()
            let results: spotifyEpisode[] = [];
            let fetchUrl: string;
            let next = null;
            let embedResponse;

            fetchUrl = this.showUrl + showId + '/episodes?limit=50&market=US';
            while (next === null) {
                const response = await fetch(fetchUrl, this.params);
                const body = await response.json();
                if (Object.hasOwnProperty("error")) throw new Error(body["error"]);
                next = body.next;
                for (let i = 0; i < body.items.length; i++) {
                    const embeddedResponse = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${body.items[i].id}`);
                    const embeddedBody = await embeddedResponse.text();
                    try {
                        embedResponse = await JSON.parse(embeddedBody);
                        body.items[i].embed = embedResponse;
                    } catch (err) {
                        console.error(err)
                        console.log("body of json response from spotify: ", embeddedBody)
                        console.log(embeddedResponse.status)
                    }
                }

                body.items.forEach((element: any) => {
                    let x: spotifyEpisode = {
                        href: element.href,
                        type: element.type,
                        uri: element.uri,
                        id: element.id,
                        release_date_precision: '',
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
                    results.push(x)
                });
            }
            return results;
        } catch (e) {
            console.log(e);
            throw e
        }

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

    appendEpisodes = async (episodes: spotifyEpisode[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'spotify_episode_id', prop: 'spotify_episode_id'},
                {name: 'spotify_show_id', prop: 'spotify_show_id'},
                {name: 'audio_preview_url', prop: 'audio_preview_url'},
                {name: 'name', prop: 'name'},
                {name: 'description', prop: 'description'},
                {name: 'duration_ms', prop: 'duration_ms'},
                {name: 'explicit', prop: 'explicit'},
                {name: 'html_description', prop: 'html_description'},
                {name: 'is_externally_hosted', prop: 'is_externally_hosted'},
                {name: 'is_playable', prop: 'is_playable'},
                {name: 'language', prop: 'language'},
                {name: 'languages', prop: 'languages'},
                {name: 'embed', prop: 'embed'},
                {name: 'external_urls', prop: 'external_urls'},
                {name: 'images', prop: 'images'},
                {name: 'release_date', prop: 'release_date'},
            ], {table: 'spotify_episodes'});
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const query = this.pgp.helpers.insert(episodes, cs) + ' ON CONFLICT DO NOTHING';
            const results = await this.pg_client.result(query);
            if (!results) return 0;
            return results.rowCount;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    appendShow = async (formattedShows: spotifyShow[]): Promise<number> => {
        try {
            // TODO: this query should update certain fields on conflict, if we are trying to update a profile
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'spotify_show_id', prop: 'spotify_show_id'},
                {name: 'name', prop: 'name'},
                {name: 'description', prop: 'description'},
                {name: 'explicit', prop: 'explicit'},
                {name: 'html_description', prop: 'html_description'},
                {name: 'is_externally_hosted', prop: 'is_externally_hosted'},
                {name: 'media_type', prop: 'media_type'},
                {name: 'publisher', prop: 'publisher'},
                {name: 'copyrights', prop: 'copyrights'},
                {name: 'total_episodes', prop: 'total_episodes'},
                {name: 'languages', prop: 'languages'},
                {name: 'external_urls', prop: 'external_urls'},
                {name: 'images', prop: 'images'},
            ], {table: 'spotify_users'});
            const query = this.pgp.helpers.insert(formattedShows, cs) + ' ON CONFLICT DO NOTHING';
            const results = await this.pg_client.result(query);
            if (!results) return 0;
            return results.rowCount;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}