import {SpotifyShows} from './spotify';
import {spotifyEpisode, spotifyShow} from '../interfaces/podcasts';
import Repository from '../repository';
import {IDatabase, IMain} from 'pg-promise'

type SpotifyConfiguration = {
    client_id: string
    client_secret: string
}

async function lambdaImportEpisodes(pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration) {

    const repository = new Repository(pgClient, pgp);
    const spotifyShowIds = await repository.getSpotifyUsers(); 
    const Spotify = new SpotifyShows(repository, spotifyConfiguration);

    let result: [spotifyEpisode[], number];
    let episodeImported = 0;

    for (let i = 0; i < spotifyShowIds.length; i++) {
        result = await Spotify.importEpisodes(spotifyShowIds[i].spotify_show_id);
        
        episodeImported += result[1];
    }

    console.log(`${episodeImported} episodes were imported!`);
}

async function importSpotifyShows(spotifyUsers: {userId: string, showId: string}, pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration): Promise<[spotifyShow, number]> {
    const repository = new Repository(pgClient, pgp);
    const Spotify = new SpotifyShows(repository, spotifyConfiguration);

    const result = await Spotify.importShows(spotifyUsers);

    console.log(`${result[1]} shows were imported for ${spotifyUsers.userId} with showId: ${spotifyUsers.showId}!`);
    return result;
}

async function importSpotifyEpisodes(showId: string, pgClient: IDatabase<any>, pgp: IMain, spotifyConfiguration: SpotifyConfiguration): Promise<[spotifyEpisode[], number]> {
    const repository = new Repository(pgClient, pgp);
    const Spotify = new SpotifyShows(repository, spotifyConfiguration);

    const result = await Spotify.importEpisodes(showId);

    console.log(`${result[1]} episdoes were imported for ${showId}`);
    return result;
}

export {lambdaImportEpisodes, importSpotifyShows, importSpotifyEpisodes}