import {SpotifyShows} from './spotify';
import {spotifyEpisode, spotifyShow} from '../interfaces/podcasts';
import {IDatabase, IMain} from 'pg-promise'

type SpotifyConfiguration = {
    client_id: string
    client_secret: string
}

async function lambdaImportEpisodes(pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration) {
    let query = 'SELECT spotify_show_id FROM spotify_users';

    const spotifyShowIds = await pgClient.query(query);

    const Spotify = new SpotifyShows(spotifyConfiguration, pgClient, pgp);

    let result: [spotifyEpisode[], number];
    let episodeImported = 0;

    for (let i = 0; i < spotifyShowIds.length; i++) {
        result = await Spotify.importEpisodes(spotifyShowIds[i].spotify_show_id);
        episodeImported += result[1];
    }

    console.log(`${episodeImported} episodes were imported!`);
}

async function importSpotifyShows(showIds: string | string[], pgClient: IDatabase<any>, pgp: IMain, spotifyCfg: SpotifyConfiguration) {
    const Spotify = new SpotifyShows(spotifyCfg, pgClient, pgp);

    let result: [spotifyShow[], number];

    result = await Spotify.importShows(showIds);

    console.log(`${result[1]} shows were imported!`);
}

async function importSpotifyEpisodes(showId: string, pgClient: IDatabase<any>, pgp: IMain, spotifyCfg: SpotifyConfiguration): Promise<[spotifyEpisode[], number]> {
    const Spotify = new SpotifyShows(spotifyCfg, pgClient, pgp);

    let result: [spotifyEpisode[], number];

    result = await Spotify.importEpisodes(showId);

    console.log(`${result[1]} episdoes were imported for ${showId}`);
    return result;
}

export {lambdaImportEpisodes, importSpotifyShows, importSpotifyEpisodes}