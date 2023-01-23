import Spotify from './';
import { spotifyEpisode, spotifyShow, SpotifyEpisodeAndUser, SpotifyEpisodeAndUserTable } from './interfaces';
import Repository from '../repository';
import { IDatabase, IMain } from 'pg-promise';
import { SearchBody } from '../../models/elastic/search';
import ElasticService from '../../elastic';
type SpotifyConfiguration = {
    client_id: string;
    client_secret: string;
};
declare class SpotifyService {
    private repository;
    private client;
    private elasticSrv;
    constructor(repository: Repository, client: Spotify, elasticSrv: ElasticService);
    importEpisodes: () => Promise<void>;
    exportEpisodesAndUsers: (lastId: number) => Promise<SpotifyEpisodeAndUserTable[]>;
    map: (items: SpotifyEpisodeAndUser[]) => SearchBody[];
    importSpotifyShows: (spotifyUsers: {
        userId: string;
        showId: string;
    }) => Promise<[spotifyShow, number]>;
    importSpotifyEpisodes: (showId: string) => Promise<[spotifyEpisode[], number]>;
}
export declare const DefaultSpotify: (elastic: ElasticService, pgClient: IDatabase<any>, pgp: IMain, cfg: SpotifyConfiguration) => SpotifyService;
export {};
