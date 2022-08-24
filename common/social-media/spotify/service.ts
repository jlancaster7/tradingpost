import Spotify from './';
import {spotifyEpisode, spotifyShow, SpotifyEpisodeAndUser} from './interfaces';
import Repository from '../repository';
import {IDatabase, IMain} from 'pg-promise'
import {SearchBody} from '../../models/elastic/search';
import ElasticService from '../../elastic';

type SpotifyConfiguration = {
    client_id: string
    client_secret: string
}

class SpotifyService {
    private repository: Repository;
    private client: Spotify;
    private elasticSrv: ElasticService;

    constructor(repository: Repository, client: Spotify, elasticSrv: ElasticService) {
        this.repository = repository;
        this.client = client;
        this.elasticSrv = elasticSrv;
    }

    importEpisodes = async () => {
        const spotifyShowIds = await this.repository.getSpotifyUsers();
        const episodesIds: string[] = []

        for (let i = 0; i < spotifyShowIds.length; i++) {
            const [data] = await this.client.importEpisodes(spotifyShowIds[i].spotify_show_id);
            data.forEach(datum => {
                episodesIds.push(datum.spotify_episode_id)
            })
        }

        const episodes = await this.repository.getEpisodesAndUsersByEpisodeIds(episodesIds)
        const elasticEpisodes = this.map(episodes);
        await this.elasticSrv.ingest(elasticEpisodes);
    }

    exportEpisodesAndUsers = async (lastId: string): Promise<SpotifyEpisodeAndUser[]> => {
        return await this.repository.getEpisodesAndUsersById(lastId);
    }

    map = (items: SpotifyEpisodeAndUser[]): SearchBody[] => {
        return items.map((si: SpotifyEpisodeAndUser) => {
            let obj: SearchBody = {
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
        })
    }

    importSpotifyShows = async (spotifyUsers: { userId: string, showId: string }): Promise<[spotifyShow, number]> => {
        const result = await this.client.importShows(spotifyUsers);
        console.log(`${result[1]} shows were imported for ${spotifyUsers.userId} with showId: ${spotifyUsers.showId}!`);
        return result;
    }

    importSpotifyEpisodes = async (showId: string): Promise<[spotifyEpisode[], number]> => {
        const result = await this.client.importEpisodes(showId);
        console.log(`${result[1]} episdoes were imported for ${showId}`);
        return result;
    }
}

export const DefaultSpotify = (elastic: ElasticService, pgClient: IDatabase<any>, pgp: IMain, cfg: SpotifyConfiguration) => {
    const repository = new Repository(pgClient, pgp);
    return new SpotifyService(
        repository,
        new Spotify(repository, cfg),
        elastic
    )
};