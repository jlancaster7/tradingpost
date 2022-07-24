import { spotifyConfig } from '../interfaces/utils';
import { rawSpotifyShow, spotifyShow, spotifyEpisode } from '../interfaces/podcasts';
import { IDatabase, IMain } from "pg-promise";
export declare class SpotifyShows {
    private spotifyConfig;
    private pg_client;
    private pgp;
    private tokenUrl;
    private showUrl;
    private access_token;
    private params;
    constructor(spotifyConfig: spotifyConfig, pg_client: IDatabase<any>, pgp: IMain);
    setAccessToken: () => Promise<0 | 1>;
    importShows: (showIds: string | string[]) => Promise<[spotifyShow[], number]>;
    importEpisodes: (showId: string) => Promise<[spotifyEpisode[], number]>;
    getShowInfo: (showIds: string[]) => Promise<rawSpotifyShow[]>;
    getEpisodes: (showId: string) => Promise<spotifyEpisode[]>;
    formatShowInfo: (data: rawSpotifyShow[]) => spotifyShow[];
    appendEpisodes: (episodes: spotifyEpisode[]) => Promise<number>;
    appendShow: (formattedShows: spotifyShow[]) => Promise<number>;
}
