"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyShows = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class SpotifyShows {
    constructor(repository, spotifyConfig) {
        this.setAccessToken = () => __awaiter(this, void 0, void 0, function* () {
            try {
                let buffer = Buffer.from(this.spotifyConfig.client_id + ':' + this.spotifyConfig.client_secret).toString('base64');
                let params = {
                    method: 'POST',
                    headers: {
                        Authorization: 'Basic ' + buffer,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({ grant_type: 'client_credentials' })
                };
                const response = yield (yield (0, node_fetch_1.default)(this.tokenUrl, params)).json();
                this.access_token = response.access_token;
                this.params.headers.Authorization = this.params.headers.Authorization + this.access_token;
                return 1;
            }
            catch (err) {
                console.log(err);
                return 0;
            }
        });
        this.importShows = (showIds) => __awaiter(this, void 0, void 0, function* () {
            if (typeof showIds === 'string') {
                showIds = [showIds];
            }
            const shows = yield this.getShowInfo(showIds);
            if (shows === []) {
                return [[], 0];
            }
            const result = yield this.repository.upsertSpotifyShow(shows);
            return [shows, result];
        });
        this.importEpisodes = (showId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getEpisodes(showId);
            if (data.length <= 0) {
                return [[], 0];
            }
            const results = yield this.repository.insertSpotifyEpisodes(data);
            if (results)
                return [data, results];
            return [[], 0];
        });
        this.getShowInfo = (showIds) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.access_token === '') {
                    yield this.setAccessToken();
                }
                let fetchUrl;
                let showResponse;
                let formatedShowInfo;
                let formatedShows = [];
                for (let i = 0; i < showIds.length; i++) {
                    fetchUrl = this.showUrl + showIds[i] + '?market=US';
                    showResponse = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    if (Object.keys(showResponse).includes('error')) {
                        if (showResponse.error.status === 401) {
                            yield this.setAccessToken();
                            showResponse = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        }
                        else {
                            continue;
                        }
                    }
                    showResponse.spotify_show_id = showIds[i];
                    formatedShowInfo = {
                        spotify_show_id: showResponse[i].spotify_show_id,
                        name: showResponse[i].name,
                        description: showResponse[i].description,
                        explicit: showResponse[i].explicit,
                        html_description: showResponse[i].html_description,
                        is_externally_hosted: showResponse[i].is_externally_hosted,
                        media_type: showResponse[i].media_type,
                        publisher: showResponse[i].publisher,
                        copyrights: JSON.stringify(showResponse[i].copyrights),
                        total_episodes: showResponse[i].total_episodes,
                        languages: JSON.stringify(showResponse[i].languages),
                        external_urls: JSON.stringify(showResponse[i].external_urls),
                        images: JSON.stringify(showResponse[i].images)
                    };
                    formatedShows.push(formatedShowInfo);
                }
                return formatedShows;
            }
            catch (err) {
                console.log(err);
                return [];
            }
        });
        this.getEpisodes = (showId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const startDate = yield this.repository.getSpotifyLastUpdate(showId);
                if (this.access_token === '')
                    yield this.setAccessToken();
                let results = [];
                let fetchUrl;
                let response;
                let body;
                let embedResponse;
                fetchUrl = this.showUrl + showId + '/episodes?limit=50&market=US';
                while (fetchUrl !== null) {
                    response = yield (0, node_fetch_1.default)(fetchUrl, this.params);
                    body = yield response.json();
                    if (Object.hasOwnProperty("error"))
                        throw new Error(body["error"]);
                    fetchUrl = body.next;
                    for (let i = 0; i < body.items.length; i++) {
                        if (startDate > new Date(body.items[i].release_date)) {
                            fetchUrl = null;
                        }
                        const embeddedResponse = yield (0, node_fetch_1.default)(`https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${body.items[i].id}`);
                        const embeddedBody = yield embeddedResponse.text();
                        try {
                            embedResponse = yield JSON.parse(embeddedBody);
                            body.items[i].embed = embedResponse;
                        }
                        catch (err) {
                            console.error(err);
                            console.log("body of json response from spotify: ", embeddedResponse);
                        }
                    }
                    body.items.forEach((element) => {
                        let x = {
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
                        };
                        results.push(x);
                    });
                }
                return results;
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
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
}
exports.SpotifyShows = SpotifyShows;
