import fetch from 'node-fetch';
import {spotifyConfig} from '../utils';
import {spotifyParams, spotifyShow, spotifyEpisode} from './interfaces';
import Repository from '../repository';

export default class Spotify {
    private spotifyConfig: spotifyConfig;
    private repository: Repository;
    private tokenUrl: string;
    private readonly showUrl: string;
    private access_token: string;
    private readonly params: spotifyParams;

    constructor(repository: Repository, spotifyConfig: spotifyConfig) {
        this.spotifyConfig = spotifyConfig;
        this.repository = repository;
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

    importShows = async (spotifyUsers: { userId: string, showId: string }): Promise<[spotifyShow, number]> => {
        let shows = await this.getShowInfo(spotifyUsers.showId);

        const out = {
            userId: spotifyUsers.userId,
            platform: 'spotify',
            platformUserId: spotifyUsers.showId,
            accessToken: null,
            refreshToken: null,
            expiration: null,
            claims: {
                handle: shows.name
            },
            updatedAt: new Date()
        }

        const dummyTokens = await this.repository.getTokens('platform_user_id', [out.platformUserId], 'spotify');
        if (dummyTokens.length && spotifyUsers.userId !== dummyTokens[0].userId) {
            const dummyCheck = await this.repository.isUserIdDummy(dummyTokens[0].userId);
            if (dummyCheck) {
                await this.repository.mergeDummyAccounts({
                    newUserId: spotifyUsers.userId,
                    dummyUserId: dummyTokens[0].userId
                });
            } else {
                throw new Error("This account is claimed by another non-dummy user.");
            }
        }
        await this.repository.upsertUserTokens(out);

        const result = await this.repository.upsertSpotifyShow([shows]);
        return [shows, result];
    }

    importEpisodes = async (showId: string): Promise<[spotifyEpisode[], number]> => {
        const data = await this.getEpisodes(showId);
        if (data.length <= 0) {
            return [[], 0]
        }

        const results = await this.repository.insertSpotifyEpisodes(data);
        return [data, results]
    }

    getShowInfo = async (showIds: string): Promise<spotifyShow> => {
        if (this.access_token === '') {
            await this.setAccessToken()
        }
        let fetchUrl: string;
        let showResponse;
        let formatedShowInfo: spotifyShow;
        fetchUrl = this.showUrl + showIds + '?market=US';

        showResponse = await (await fetch(fetchUrl, this.params)).json();

        if (Object.keys(showResponse).includes('error')) {
            if (showResponse.error.status === 401) {
                await this.setAccessToken();
                showResponse = await (await fetch(fetchUrl, this.params)).json();
                if (Object.keys(showResponse).includes('error')) {
                    throw showResponse.error;
                }
            } else {
                throw showResponse.error;
            }
        }
        showResponse.spotify_show_id = showIds;
        formatedShowInfo = {
            spotify_show_id: showResponse.spotify_show_id,
            name: showResponse.name,
            description: showResponse.description,
            explicit: showResponse.explicit,
            html_description: showResponse.html_description,
            is_externally_hosted: showResponse.is_externally_hosted,
            media_type: showResponse.media_type,
            publisher: showResponse.publisher,
            copyrights: JSON.stringify(showResponse.copyrights),
            total_episodes: showResponse.total_episodes,
            languages: JSON.stringify(showResponse.languages),
            external_urls: JSON.stringify(showResponse.external_urls),
            images: JSON.stringify(showResponse.images)
        }
        return formatedShowInfo;
    }

    getEpisodes = async (showId: string): Promise<spotifyEpisode[]> => {
        try {
            const startDate = await this.repository.getSpotifyLastUpdate(showId);

            if (this.access_token === '') await this.setAccessToken()
            let results: spotifyEpisode[] = [];
            let fetchUrl: string | null;
            let response;
            let body;
            let embedResponse;

            fetchUrl = this.showUrl + showId + '/episodes?limit=50&market=US';
            while (fetchUrl !== null) {
                response = await fetch(fetchUrl, this.params);
                body = await response.json();
                if (Object.hasOwnProperty("error")) throw new Error(body["error"]);

                fetchUrl = body.next;

                for (let i = 0; i < body.items.length; i++) {
                    if (startDate > new Date(body.items[i].release_date)) {
                        fetchUrl = null
                    }

                    const embeddedResponse = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${body.items[i].id}`);
                    const embeddedBody = await embeddedResponse.text();
                    try {
                        embedResponse = await JSON.parse(embeddedBody);
                        body.items[i].embed = embedResponse;
                    } catch (err) {
                        console.error(err)
                        console.log("body of json response from spotify: ", embeddedBody)
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
                        release_date: new Date(element.release_date),
                        aspect_ratio: 2.0,
                        max_width: 400.00
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
}