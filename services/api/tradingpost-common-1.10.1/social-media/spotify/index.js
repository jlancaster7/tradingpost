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
const node_fetch_1 = __importDefault(require("node-fetch"));
class ServerDownException extends Error {
    constructor(msg) {
        super(msg);
    }
}
class Spotify {
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
        this.adminImportShows = (showId) => __awaiter(this, void 0, void 0, function* () {
            let shows = yield this.getShowInfo(showId);
            const result = yield this.repository.upsertSpotifyShow([shows]);
            return 0;
        });
        this.importShows = (spotifyUsers) => __awaiter(this, void 0, void 0, function* () {
            let shows = yield this.getShowInfo(spotifyUsers.showId);
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
            };
            const dummyTokens = yield this.repository.getTokens('platform_user_id', [out.platformUserId], 'spotify');
            if (dummyTokens.length && spotifyUsers.userId !== dummyTokens[0].userId) {
                const dummyCheck = yield this.repository.isUserIdDummy(dummyTokens[0].userId);
                if (dummyCheck) {
                    yield this.repository.mergeDummyAccounts({
                        newUserId: spotifyUsers.userId,
                        dummyUserId: dummyTokens[0].userId
                    });
                }
                else {
                    throw new Error("This account is claimed by another non-dummy user.");
                }
            }
            yield this.repository.upsertUserTokens(out);
            const result = yield this.repository.upsertSpotifyShow([shows]);
            return [shows, result];
        });
        this.importEpisodes = (showId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getEpisodes(showId);
            if (data.length <= 0) {
                return [[], 0];
            }
            const results = yield this.repository.insertSpotifyEpisodes(data);
            return [data, results];
        });
        this.getShowInfo = (showIds) => __awaiter(this, void 0, void 0, function* () {
            if (this.access_token === '') {
                yield this.setAccessToken();
            }
            let fetchUrl;
            let showResponse;
            let formatedShowInfo;
            fetchUrl = this.showUrl + showIds + '?market=US';
            showResponse = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
            if (Object.keys(showResponse).includes('error')) {
                if (showResponse.error.status === 401) {
                    yield this.setAccessToken();
                    showResponse = yield (yield (0, node_fetch_1.default)(fetchUrl, this.params)).json();
                    if (Object.keys(showResponse).includes('error')) {
                        throw showResponse.error;
                    }
                }
                else {
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
            };
            return formatedShowInfo;
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
                            //continue;
                        }
                        const embeddedResponse = yield (0, node_fetch_1.default)(`https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${body.items[i].id}`);
                        if (embeddedResponse.status === 502)
                            throw new ServerDownException('');
                        const embeddedBody = yield embeddedResponse.text();
                        try {
                            embedResponse = yield JSON.parse(embeddedBody);
                            body.items[i].embed = embedResponse;
                        }
                        catch (err) {
                            console.error(err);
                            console.log("body of json response from spotify: ", embeddedBody);
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
                            release_date: new Date(element.release_date),
                            aspect_ratio: 2.0,
                            max_width: 400.00
                        };
                        results.push(x);
                    });
                }
                return results;
            }
            catch (e) {
                if (e instanceof ServerDownException)
                    return [];
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
exports.default = Spotify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLDREQUErQjtBQUsvQixNQUFNLG1CQUFvQixTQUFRLEtBQUs7SUFDbkMsWUFBWSxHQUFXO1FBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQUVELE1BQXFCLE9BQU87SUFReEIsWUFBWSxVQUFzQixFQUFFLGFBQTRCO1FBZWhFLG1CQUFjLEdBQUcsR0FBUyxFQUFFO1lBQ3hCLElBQUk7Z0JBQ0EsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25ILElBQUksTUFBTSxHQUFHO29CQUNULE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRTt3QkFDTCxhQUFhLEVBQUUsUUFBUSxHQUFHLE1BQU07d0JBQ2hDLGNBQWMsRUFBRSxtQ0FBbUM7cUJBQ3REO29CQUNELElBQUksRUFBRSxJQUFJLGVBQWUsQ0FBQyxFQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFBQyxDQUFDO2lCQUNoRSxDQUFDO2dCQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUEsb0JBQUssRUFBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztnQkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUUxRixPQUFP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