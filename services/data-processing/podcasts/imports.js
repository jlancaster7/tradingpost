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
const spotify_1 = require("./spotify");
function lambdaImportEpisodes(pgClient, spotifyConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = 'SELECT spotify_show_id FROM spotify_users';
        const spotifyShowIds = (yield pgClient.query(query)).rows;
        const Spotify = new spotify_1.SpotifyShows(spotifyConfiguration, pgClient);
        let result;
        let episodeImported = 0;
        for (let i = 0; i < spotifyShowIds.length; i++) {
            result = yield Spotify.importEpisdoes(spotifyShowIds[i].spotify_show_id);
            episodeImported += result[1];
        }
        console.log(`${episodeImported} episodes were imported!`);
    });
}
exports.lambdaImportEpisodes = lambdaImportEpisodes;
function importSpotifyShows(showIds, pgClient, spotifyCfg) {
    return __awaiter(this, void 0, void 0, function* () {
        const Spotify = new spotify_1.SpotifyShows(spotifyCfg, pgClient);
        let result;
        result = yield Spotify.importShows(showIds);
        console.log(`${result[1]} shows were imported!`);
    });
}
exports.importSpotifyShows = importSpotifyShows;
function importSpotifyEpisodes(showId, pgClient, spotifyCfg) {
    return __awaiter(this, void 0, void 0, function* () {
        const Spotify = new spotify_1.SpotifyShows(spotifyCfg, pgClient);
        let result;
        result = yield Spotify.importEpisdoes(showId);
        console.log(`${result[1]} episdoes were imported for ${showId}`);
        return result;
    });
}
exports.importSpotifyEpisodes = importSpotifyEpisodes;
