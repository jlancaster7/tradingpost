import { spotifyConfig } from '../utils';
import { spotifyShow, spotifyEpisode } from './interfaces';
import Repository from '../repository';
export default class Spotify {
    private spotifyConfig;
    private repository;
    private tokenUrl;
    private readonly showUrl;
    private access_token;
    private readonly params;
    constructor(repository: Repository, spotifyConfig: spotifyConfig);
    setAccessToken: () => Promise<1 | 0>;
    adminImportShows: (showId: string) => Promise<number>;
    importShows: (spotifyUsers: {
        userId: string;
        showId: string;
    }) => Promise<[spotifyShow, number]>;
    importEpisodes: (showId: string) => Promise<[spotifyEpisode[], number]>;
    getShowInfo: (showIds: string) => Promise<spotifyShow>;
    getEpisodes: (showId: string) => Promise<spotifyEpisode[]>;
}
