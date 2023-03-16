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
exports.DefaultSpotify = void 0;
const _1 = __importDefault(require("./"));
const repository_1 = __importDefault(require("../repository"));
class SpotifyService {
    constructor(repository, client, elasticSrv) {
        this.importEpisodes = () => __awaiter(this, void 0, void 0, function* () {
            const spotifyShowIds = yield this.repository.getSpotifyUsers();
            const episodesIds = [];
            for (let i = 0; i < spotifyShowIds.length; i++) {
                const [data] = yield this.client.importEpisodes(spotifyShowIds[i].spotify_show_id);
                data.forEach(datum => {
                    episodesIds.push(datum.spotify_episode_id);
                });
            }
            const episodes = yield this.repository.getEpisodesAndUsersByEpisodeIds(episodesIds);
            const elasticEpisodes = this.map(episodes);
            yield this.elasticSrv.ingest(elasticEpisodes);
        });
        this.exportEpisodesAndUsers = (lastId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.getEpisodesAndUsersById(lastId);
        });
        this.map = (items) => {
            const result = items.filter(a => {
                if (a.episode_embed && Object.keys(a.episode_embed).includes('html')) {
                    return true;
                }
                else {
                    console.error(a);
                    return false;
                }
            });
            return result.map((si) => {
                let obj = {
                    id: `spotify_${si.spotify_episode_id}`,
                    content: {
                        body: si.episode_embed.html,
                        description: si.episode_description,
                        htmlBody: si.episode_html_description,
                        htmlTitle: null,
                        title: si.episode_name
                    },
                    imageUrl: null,
                    meta: {},
                    platform: {
                        displayName: si.podcast_name,
                        imageUrl: null,
                        profileUrl: null,
                        username: si.podcast_publisher
                    },
                    platformCreatedAt: si.episode_release_date.toISO(),
                    platformUpdatedAt: si.episode_release_date.toISO(),
                    postType: "spotify",
                    subscription_level: "standard",
                    postTypeValue: 2,
                    postUrl: si.episode_embed.provider_url,
                    ratingsCount: 0,
                    tradingpostCreatedAt: si.tradingpost_episode_created_at.toISO(),
                    tradingpostUpdatedAt: si.tradingpost_episode_created_at.toISO(),
                    user: {
                        id: si.tradingpostUserId,
                        imageUrl: si.tradingpostUserProfileUrl,
                        name: "",
                        type: "",
                        username: si.tradingpostUserHandle
                    },
                    size: {
                        maxWidth: si.maxWidth,
                        aspectRatio: si.aspectRatio
                    }
                };
                return obj;
            });
        };
        this.importSpotifyShows = (spotifyUsers) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.importShows(spotifyUsers);
            console.log(`${result[1]} shows were imported for ${spotifyUsers.userId} with showId: ${spotifyUsers.showId}!`);
            return result;
        });
        this.importSpotifyEpisodes = (showId) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.client.importEpisodes(showId);
            console.log(`${result[1]} episdoes were imported for ${showId}`);
            return result;
        });
        this.repository = repository;
        this.client = client;
        this.elasticSrv = elasticSrv;
    }
}
const DefaultSpotify = (elastic, pgClient, pgp, cfg) => {
    const repository = new repository_1.default(pgClient, pgp);
    return new SpotifyService(repository, new _1.default(repository, cfg), elastic);
};
exports.DefaultSpotify = DefaultSpotify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMENBQXlCO0FBRXpCLCtEQUF1QztBQVV2QyxNQUFNLGNBQWM7SUFLaEIsWUFBWSxVQUFzQixFQUFFLE1BQWUsRUFBRSxVQUEwQjtRQU0vRSxtQkFBYyxHQUFHLEdBQVMsRUFBRTtZQUN4QixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDL0QsTUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFBO1lBRWhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUE7Z0JBQzlDLENBQUMsQ0FBQyxDQUFBO2FBQ0w7WUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsK0JBQStCLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDbkYsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FBTyxNQUFjLEVBQXlDLEVBQUU7WUFDckYsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakUsQ0FBQyxDQUFBLENBQUE7UUFFRCxRQUFHLEdBQUcsQ0FBQyxLQUE4QixFQUFnQixFQUFFO1lBQ25ELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ2xFLE9BQU8sSUFBSSxDQUFBO2lCQUNkO3FCQUFNO29CQUNILE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ2hCLE9BQU8sS0FBSyxDQUFBO2lCQUNmO1lBQ0wsQ0FBQyxDQUFDLENBQUE7WUFDRixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUF5QixFQUFFLEVBQUU7Z0JBQzVDLElBQUksR0FBRyxHQUFlO29CQUNsQixFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3RDLE9BQU8sRUFBRTt3QkFDTCxJQUFJLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJO3dCQUMzQixXQUFXLEVBQUUsRUFBRSxDQUFDLG1CQUFtQjt3QkFDbkMsUUFBUSxFQUFFLEVBQUUsQ0FBQyx3QkFBd0I7d0JBQ3JDLFNBQVMsRUFBRSxJQUFJO3dCQUNmLEtBQUssRUFBRSxFQUFFLENBQUMsWUFBWTtxQkFDekI7b0JBQ0QsUUFBUSxFQUFFLElBQUk7b0JBQ2QsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsUUFBUSxFQUFFO3dCQUNOLFdBQVcsRUFBRSxFQUFFLENBQUMsWUFBWTt3QkFDNUIsUUFBUSxFQUFFLElBQUk7d0JBQ2QsVUFBVSxFQUFFLElBQUk7d0JBQ2hCLFFBQVEsRUFBRSxFQUFFLENBQUMsaUJBQWlCO3FCQUNqQztvQkFDRCxpQkFBaUIsRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFO29CQUNsRCxpQkFBaUIsRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFO29CQUNsRCxRQUFRLEVBQUUsU0FBUztvQkFDbkIsa0JBQWtCLEVBQUUsVUFBVTtvQkFDOUIsYUFBYSxFQUFFLENBQUM7b0JBQ2hCLE9BQU8sRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVk7b0JBQ3RDLFlBQVksRUFBRSxDQUFDO29CQUNmLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUU7b0JBQy9ELG9CQUFvQixFQUFFLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLEVBQUU7b0JBQy9ELElBQUksRUFBRTt3QkFDRixFQUFFLEVBQUUsRUFBRSxDQUFDLGlCQUFpQjt3QkFDeEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyx5QkFBeUI7d0JBQ3RDLElBQUksRUFBRSxFQUFFO3dCQUNSLElBQUksRUFBRSxFQUFFO3dCQUNSLFFBQVEsRUFBRSxFQUFFLENBQUMscUJBQXFCO3FCQUNyQztvQkFDRCxJQUFJLEVBQUU7d0JBQ0YsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRO3dCQUNyQixXQUFXLEVBQUUsRUFBRSxDQUFDLFdBQVc7cUJBQzlCO2lCQUNKLENBQUM7Z0JBQ0YsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQTtRQUVELHVCQUFrQixHQUFHLENBQU8sWUFBZ0QsRUFBa0MsRUFBRTtZQUM1RyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixZQUFZLENBQUMsTUFBTSxpQkFBaUIsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDaEgsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFBLENBQUE7UUFFRCwwQkFBcUIsR0FBRyxDQUFPLE1BQWMsRUFBdUMsRUFBRTtZQUNsRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLCtCQUErQixNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2pFLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUMsQ0FBQSxDQUFBO1FBdkZHLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7Q0FxRko7QUFFTSxNQUFNLGNBQWMsR0FBRyxDQUFDLE9BQXVCLEVBQUUsUUFBd0IsRUFBRSxHQUFVLEVBQUUsR0FBeUIsRUFBRSxFQUFFO0lBQ3ZILE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakQsT0FBTyxJQUFJLGNBQWMsQ0FDckIsVUFBVSxFQUNWLElBQUksVUFBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFDNUIsT0FBTyxDQUNWLENBQUE7QUFDTCxDQUFDLENBQUM7QUFQVyxRQUFBLGNBQWMsa0JBT3pCIn0=