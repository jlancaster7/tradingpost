import { spotifyConfig } from '../interfaces/utils';
import { spotifyShow, spotifyEpisode } from '../interfaces/podcasts';
import Repository from '../repository';
export declare class SpotifyShows {
    private spotifyConfig;
    private repository;
    private tokenUrl;
    private showUrl;
    private access_token;
    private params;
    constructor(repository: Repository, spotifyConfig: spotifyConfig);
    setAccessToken: () => Promise<0 | 1>;
    importShows: (showIds: string | string[]) => Promise<[spotifyShow[], number]>;
    importEpisodes: (showId: string) => Promise<[spotifyEpisode[], number]>;
    getShowInfo: (showIds: string[]) => Promise<spotifyShow[]>;
    getEpisodes: (showId: string) => Promise<spotifyEpisode[]>;
}
