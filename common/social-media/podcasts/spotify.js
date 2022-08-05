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
        this.importShows = (spotifyUsers) => __awaiter(this, void 0, void 0, function* () {
            let shows = yield this.getShowInfo(spotifyUsers.showId);
            const out = {
                userId: spotifyUsers.userId,
                platform: 'substack',
                platformUserId: spotifyUsers.showId,
                accessToken: null,
                refreshToken: null,
                expiration: null,
                updatedAt: new Date()
            };
            const dummyTokens = yield this.repository.getTokens('platform_user_id', [out.platformUserId], 'spotify');
            if (dummyTokens.length && spotifyUsers.userId !== dummyTokens[0].userId) {
                const dummyCheck = yield this.repository.isUserIdDummy(dummyTokens[0].userId);
                if (dummyCheck) {
                    yield this.repository.mergeDummyAccounts({ newUserId: spotifyUsers.userId, dummyUserId: dummyTokens[0].userId });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BvdGlmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNwb3RpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNERBQStCO0FBTy9CLE1BQWEsWUFBWTtJQVFyQixZQUFZLFVBQXNCLEVBQUUsYUFBNEI7UUFlaEUsbUJBQWMsR0FBRyxHQUFTLEVBQUU7WUFDeEIsSUFBSTtnQkFDQSxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkgsSUFBSSxNQUFNLEdBQUc7b0JBQ1QsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFO3dCQUNMLGFBQWEsRUFBRSxRQUFRLEdBQUcsTUFBTTt3QkFDaEMsY0FBYyxFQUFFLG1DQUFtQztxQkFDdEQ7b0JBQ0QsSUFBSSxFQUFFLElBQUksZUFBZSxDQUFDLEVBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUFDLENBQUM7aUJBQ2hFLENBQUM7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBQSxvQkFBSyxFQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBRTFGLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLENBQUMsQ0FBQzthQUNaO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUFFRCxnQkFBVyxHQUFHLENBQU8sWUFBOEMsRUFBa0MsRUFBRTtZQUNuRyxJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXhELE1BQU0sR0FBRyxHQUFHO2dCQUNSLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtnQkFDM0IsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLGNBQWMsRUFBRSxZQUFZLENBQUMsTUFBTTtnQkFDbkMsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFO2FBQ3hCLENBQUE7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pHLElBQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLFVBQVUsRUFBRTtvQkFDWixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7aUJBQ2xIO3FCQUFNO29CQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztpQkFDekU7YUFDSjtZQUNELE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUU1QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFBLENBQUE7UUFFRCxtQkFBYyxHQUFHLENBQU8sTUFBYyxFQUF1QyxFQUFFO1lBQzNFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1QyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO2dCQUNsQixPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQ2pCO1lBQ0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDMUIsQ0FBQyxDQUFBLENBQUE7UUFFRCxnQkFBVyxHQUFHLENBQU8sT0FBZSxFQUF3QixFQUFFO1lBQzFELElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO2FBQzlCO1lBQ0QsSUFBSSxRQUFnQixDQUFDO1lBQ3JCLElBQUksWUFBWSxDQUFDO1lBQ2pCLElBQUksZ0JBQTZCLENBQUM7WUFDbEMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFFLFlBQVksQ0FBQztZQUVoRCxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBQSxvQkFBSyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVqRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM3QyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQkFDbkMsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzVCLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFBLG9CQUFLLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUM3QyxNQUFNLFlBQVksQ0FBQyxLQUFLLENBQUM7cUJBQzVCO2lCQUNKO3FCQUFNO29CQUNILE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQztpQkFDNUI7YUFDSjtZQUNELFlBQVksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO1lBQ3ZDLGdCQUFnQixHQUFHO2dCQUNmLGVBQWUsRUFBRSxZQUFZLENBQUMsZUFBZTtnQkFDN0MsSUFBSSxFQUFFLFlBQVksQ0FBQyxJQUFJO2dCQUN2QixXQUFXLEVBQUUsWUFBWSxDQUFDLFdBQVc7Z0JBQ3JDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUTtnQkFDL0IsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLGdCQUFnQjtnQkFDL0Msb0JBQW9CLEVBQUUsWUFBWSxDQUFDLG9CQUFvQjtnQkFDdkQsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO2dCQUNuQyxTQUFTLEVBQUUsWUFBWSxDQUFDLFNBQVM7Z0JBQ2pDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7Z0JBQ25ELGNBQWMsRUFBRSxZQUFZLENBQUMsY0FBYztnQkFDM0MsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztnQkFDakQsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQztnQkFDekQsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQzthQUM5QyxDQUFBO1lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQztRQUM1QixDQUFDLENBQUEsQ0FBQTtRQUVELGdCQUFXLEdBQUcsQ0FBTyxNQUFjLEVBQTZCLEVBQUU7WUFDOUQsSUFBSTtnQkFDQSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXJFLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFO29CQUFFLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO2dCQUN6RCxJQUFJLE9BQU8sR0FBcUIsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLFFBQXVCLENBQUM7Z0JBQzVCLElBQUksUUFBUSxDQUFDO2dCQUNiLElBQUksSUFBSSxDQUFDO2dCQUNULElBQUksYUFBYSxDQUFDO2dCQUVsQixRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsOEJBQThCLENBQUM7Z0JBQ2xFLE9BQU8sUUFBUSxLQUFLLElBQUksRUFBRTtvQkFDdEIsUUFBUSxHQUFHLE1BQU0sSUFBQSxvQkFBSyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzlDLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDN0IsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQzt3QkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUVuRSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFFckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN4QyxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxFQUFFOzRCQUFFLFFBQVEsR0FBRyxJQUFJLENBQUE7eUJBQUU7d0JBQ3pFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFBLG9CQUFLLEVBQUMsd0VBQXdFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDakksTUFBTSxZQUFZLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDbkQsSUFBSTs0QkFDQSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUMvQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7eUJBQ3ZDO3dCQUFDLE9BQU8sR0FBRyxFQUFFOzRCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7NEJBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTt5QkFDeEU7cUJBQ0o7b0JBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRTt3QkFDaEMsSUFBSSxDQUFDLEdBQW1COzRCQUNwQixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7NEJBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTs0QkFDbEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHOzRCQUNoQixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7NEJBQ2Qsc0JBQXNCLEVBQUUsRUFBRTs0QkFDMUIsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEVBQUU7NEJBQzlCLGVBQWUsRUFBRSxNQUFNOzRCQUN2QixpQkFBaUIsRUFBRSxPQUFPLENBQUMsaUJBQWlCOzRCQUM1QyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7NEJBQ2xCLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVzs0QkFDaEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXOzRCQUNoQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7NEJBQzFCLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxnQkFBZ0I7NEJBQzFDLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxvQkFBb0I7NEJBQ2xELFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVzs0QkFDaEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFROzRCQUMxQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDOzRCQUM1QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDOzRCQUNwQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDOzRCQUNwRCxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDOzRCQUN0QyxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQzt5QkFDL0MsQ0FBQTt3QkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO29CQUNuQixDQUFDLENBQUMsQ0FBQztpQkFDTjtnQkFDRCxPQUFPLE9BQU8sQ0FBQzthQUNsQjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLENBQUE7YUFDVjtRQUNMLENBQUMsQ0FBQSxDQUFBO1FBbkxHLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsd0NBQXdDLENBQUM7UUFDekQsSUFBSSxDQUFDLE9BQU8sR0FBRyxtQ0FBbUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsTUFBTSxFQUFFLEtBQUs7WUFDYixPQUFPLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLFNBQVM7Z0JBQ3hCLGNBQWMsRUFBRSxrQkFBa0I7YUFDckM7U0FDSixDQUFDO0lBQ04sQ0FBQztDQXdLSjtBQTdMRCxvQ0E2TEMifQ==
