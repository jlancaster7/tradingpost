import { spotifyEpisode, spotifyShow } from '../interfaces/podcasts';
import { IDatabase, IMain } from 'pg-promise';
declare type SpotifyConfiguration = {
    client_id: string;
    client_secret: string;
};
declare function lambdaImportEpisodes(pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration): Promise<void>;
declare function importSpotifyShows(spotifyUsers: {
    userId: string;
    showId: string;
}, pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration): Promise<[spotifyShow, number]>;
declare function importSpotifyEpisodes(showId: string, pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration): Promise<[spotifyEpisode[], number]>;
export { lambdaImportEpisodes, importSpotifyShows, importSpotifyEpisodes };
