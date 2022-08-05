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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSpotifyEpisodes = exports.importSpotifyShows = exports.lambdaImportEpisodes = void 0;
const spotify_1 = require("./spotify");
const repository_1 = __importDefault(require("../repository"));
function lambdaImportEpisodes(pgClient, pgp, spotifyConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const spotifyShowIds = yield repository.getSpotifyUsers();
        const Spotify = new spotify_1.SpotifyShows(repository, spotifyConfiguration);
        let result;
        let episodeImported = 0;
        for (let i = 0; i < spotifyShowIds.length; i++) {
            result = yield Spotify.importEpisodes(spotifyShowIds[i].spotify_show_id);
            episodeImported += result[1];
        }
        console.log(`${episodeImported} episodes were imported!`);
    });
}
exports.lambdaImportEpisodes = lambdaImportEpisodes;
function importSpotifyShows(spotifyUsers, pgClient, pgp, spotifyConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Spotify = new spotify_1.SpotifyShows(repository, spotifyConfiguration);
        const result = yield Spotify.importShows(spotifyUsers);
        console.log(`${result[1]} shows were imported for ${spotifyUsers.userId} with showId: ${spotifyUsers.showId}!`);
        return result;
    });
}
exports.importSpotifyShows = importSpotifyShows;
function importSpotifyEpisodes(showId, pgClient, pgp, spotifyConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Spotify = new spotify_1.SpotifyShows(repository, spotifyConfiguration);
        const result = yield Spotify.importEpisodes(showId);
        console.log(`${result[1]} episdoes were imported for ${showId}`);
        return result;
    });
}
exports.importSpotifyEpisodes = importSpotifyEpisodes;
