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
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSpotifyEpisodes = exports.importSpotifyShows = exports.lambdaImportEpisodes = void 0;
const utils_1 = require("../utils/utils");
const spotify_1 = require("./spotify");
const awsConfigs = (0, utils_1.getAWSConfigs)();
lambdaImportEpisodes();
//importSpotifyEpisodes('2M5iqRSHj51j3Wkwh5oLMN');
//importSpotifyShows(['2M5iqRSHj51j3Wkwh5oLMN', '5eXZwvvxt3K2dxha3BSaAe', '1VyK52NSZHaDKeMJzT4TSM'])
function lambdaImportEpisodes() {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        let query = 'SELECT spotify_show_id FROM spotify_users';
        const spotifyShowIds = (yield pg_client.query(query)).rows;
        const Spotify = new spotify_1.SpotifyShows((yield awsConfigs).spotify, pg_client);
        let result;
        let episodeImported = 0;
        for (let i = 0; i < spotifyShowIds.length; i++) {
            result = yield Spotify.importEpisdoes(spotifyShowIds[i].spotify_show_id);
            episodeImported += result[1];
        }
        console.log(`${episodeImported} episodes were imported!`);
        pg_client.end();
    });
}
exports.lambdaImportEpisodes = lambdaImportEpisodes;
function importSpotifyShows(showIds) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const Spotify = new spotify_1.SpotifyShows((yield awsConfigs).spotify, pg_client);
        let result;
        result = yield Spotify.importShows(showIds);
        console.log(`${result[1]} shows were imported!`);
        pg_client.end();
    });
}
exports.importSpotifyShows = importSpotifyShows;
function importSpotifyEpisodes(showId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const Spotify = new spotify_1.SpotifyShows((yield awsConfigs).spotify, pg_client);
        let result;
        result = yield Spotify.importEpisdoes(showId);
        console.log(`${result[1]} episdoes were imported for ${showId}`);
        pg_client.end();
        return result;
    });
}
exports.importSpotifyEpisodes = importSpotifyEpisodes;
