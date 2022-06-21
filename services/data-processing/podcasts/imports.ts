import {Pool, Client, PoolClient} from 'pg';
import {getPgClient, getAWSConfigs} from '../utils/utils';
import {SpotifyShows} from './spotify';
import {spotifyEpisode, spotifyShow} from '../interfaces/podcasts';


const awsConfigs = getAWSConfigs();

lambdaImportEpisodes();
//importSpotifyEpisodes('2M5iqRSHj51j3Wkwh5oLMN');
//importSpotifyShows(['2M5iqRSHj51j3Wkwh5oLMN', '5eXZwvvxt3K2dxha3BSaAe', '1VyK52NSZHaDKeMJzT4TSM'])

async function lambdaImportEpisodes() {
    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    let query = 'SELECT spotify_show_id FROM spotify_users';

    const spotifyShowIds = (await pg_client.query(query)).rows;

    const Spotify = new SpotifyShows((await awsConfigs).spotify, pg_client);

    let result: [spotifyEpisode[], number];
    let episodeImported = 0;

    for (let i = 0; i < spotifyShowIds.length; i++) {
        result = await Spotify.importEpisdoes(spotifyShowIds[i].spotify_show_id);

        episodeImported += result[1];
    }
    console.log(`${episodeImported} episodes were imported!`);
    pg_client.end();
}

async function importSpotifyShows(showIds: string | string[]) {
    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    const Spotify = new SpotifyShows((await awsConfigs).spotify, pg_client);

    let result: [spotifyShow[], number];

    result = await Spotify.importShows(showIds);

    console.log(`${result[1]} shows were imported!`);
    pg_client.end();

}

async function importSpotifyEpisodes(showId: string): Promise<[spotifyEpisode[], number]> {
    const pg_client: Client = await getPgClient((await awsConfigs).postgres);

    const Spotify = new SpotifyShows((await awsConfigs).spotify, pg_client);

    let result: [spotifyEpisode[], number];

    result = await Spotify.importEpisdoes(showId);

    console.log(`${result[1]} episdoes were imported for ${showId}`);
    pg_client.end();
    return result;

}

export {lambdaImportEpisodes, importSpotifyShows, importSpotifyEpisodes}