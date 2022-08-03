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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BvdGlmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNwb3RpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNERBQStCO0FBTy9CLE1BQWEsWUFBWTtJQVFyQixZQUFZLFVBQXNCLEVBQUUsYUFBNEI7UUFlaEUsbUJBQWMsR0FBRyxHQUFTLEVBQUU7WUFDeEIsSUFBSTtnQkFDQSxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkgsSUFBSSxNQUFNLEdBQUc7b0JBQ1QsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFO3dCQUNMLGFBQWEsRUFBRSxRQUFRLEdBQUcsTUFBTTt3QkFDaEMsY0FBYyxFQUFFLG1DQUFtQztxQkFDdEQ7b0JBQ0QsSUFBSSxFQUFFLElBQUksZUFBZSxDQUFDLEVBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUFDLENBQUM7aUJBQ2hFLENBQUM7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBQSxvQkFBSyxFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBRTFGLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixP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