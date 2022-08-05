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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF1QztBQUV2QywrREFBdUM7QUFRdkMsU0FBZSxvQkFBb0IsQ0FBQyxRQUF3QixFQUFFLEdBQVUsRUFBRSxvQkFBMEM7O1FBRWhILE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxjQUFjLEdBQUcsTUFBTSxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxzQkFBWSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRW5FLElBQUksTUFBa0MsQ0FBQztRQUN2QyxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFFeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFekUsZUFBZSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxlQUFlLDBCQUEwQixDQUFDLENBQUM7SUFDOUQsQ0FBQztDQUFBO0FBc0JPLG9EQUFvQjtBQXBCNUIsU0FBZSxrQkFBa0IsQ0FBQyxZQUE4QyxFQUFFLFFBQXdCLEVBQUUsR0FBVSxFQUFFLG9CQUEwQzs7UUFDOUosTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLHNCQUFZLENBQUMsVUFBVSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFFbkUsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixZQUFZLENBQUMsTUFBTSxpQkFBaUIsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEgsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUFBO0FBWTZCLGdEQUFrQjtBQVZoRCxTQUFlLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxRQUF3QixFQUFFLEdBQVUsRUFBRSxvQkFBMEM7O1FBQ2pJLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxzQkFBWSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRW5FLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQywrQkFBK0IsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNqRSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQUE7QUFFaUQsc0RBQXFCIn0=
