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
const pg_format_1 = __importDefault(require("pg-format"));
class SpotifyShows {
    constructor(spotifyConfig, pg_client) {
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
            const data = yield this.getShowInfo(showIds);
            if (data === []) {
                return [[], 0];
            }
            const formatedData = this.formatShowInfo(data);
            const result = yield this.appendShow(formatedData);
            return [formatedData, result];
        });
        this.importEpisdoes = (showId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getEpisodes(showId);
            if (data === []) {
                return [[], 0];
            }
            const results = yield this.appendEpisdoes(data);
            return [data, results];
        });
        this.getShowInfo = (showIds) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.access_token === '') {
                    yield this.setAccessToken();
                }
                let results = [];
                let fetchUrl;
                let showResponse;
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
                    results.push(showResponse);
                }
                return results;
            }
            catch (err) {
                console.log(err);
                return [];
            }
        });
        this.getEpisodes = (showId) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.access_token === '') {
                    yield this.setAccessToken();
                }
                let formatedResponse;
                let results = [];
                let fetchUrl;
                let showResponse;
                let next = '';
                let embedResponse;
                fetchUrl = this.showUrl + showId + '/episodes?limit=50&market=US';
                while (next !== 'end') {
                    showResponse = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    if (Object.keys(showResponse).includes('error')) {
                        if (showResponse.error.status === 401) {
                            yield this.setAccessToken();
                            showResponse = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                        }
                        else {
                            return [];
                        }
                    }
                    for (let i = 0; i < showResponse.items.length; i++) {
                        embedResponse = yield (yield (0, node_fetch_1.default)(`https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${showResponse.items[i].id}`)).json();
                        showResponse.items[i].embed = embedResponse;
                    }
                    showResponse.items.forEach((element) => {
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
                        };
                        results.push(formatedResponse);
                    });
                    if (!showResponse.next) {
                        next = 'end';
                    }
                    else {
                        fetchUrl = showResponse.next;
                    }
                }
                return results;
            }
            catch (err) {
                console.log(err);
                return [];
            }
        });
        this.formatShowInfo = (data) => {
            let formatedShowInfo;
            let formatedShows = [];
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
                };
                formatedShows.push(formatedShowInfo);
            }
            return formatedShows;
        };
        this.appendEpisdoes = (episodes) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            let query;
            let result;
            let keys;
            let values = [];
            try {
                keys = Object.keys(episodes[0]).join(' ,');
                episodes.forEach(element => {
                    values.push(Object.values(element));
                });
                query = `INSERT INTO spotify_episodes(${keys})
            VALUES
            %L
                     ON CONFLICT (spotify_episode_id)
            DO NOTHING`;
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                result = yield this.pg_client.result((0, pg_format_1.default)(query, values));
                success += result.rowCount;
            }
            catch (err) {
                console.log(err);
            }
            return success;
        });
        this.appendShow = (formatedShow) => __awaiter(this, void 0, void 0, function* () {
            let success = 0;
            let query;
            let result;
            let keys;
            let values = [];
            try {
                keys = Object.keys(formatedShow[0]).join(' ,');
                formatedShow.forEach(element => {
                    values.push(Object.values(element));
                });
                query = `INSERT INTO spotify_users(${keys})
            VALUES
            %L
                     ON CONFLICT (spotify_show_id)
            DO NOTHING`;
                // TODO: this query should update certain fields on conflict, if we are trying to update a profile
                result = yield this.pg_client.result((0, pg_format_1.default)(query, values));
                success += result.rowCount;
            }
            catch (err) {
                console.log(err);
            }
            return success;
        });
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
}
exports.SpotifyShows = SpotifyShows;
