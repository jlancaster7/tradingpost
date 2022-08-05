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
exports.importYoutubeUsersByToken = exports.importVideos = exports.importYoutubeUsersById = exports.lambdaImportYoutube = void 0;
const users_1 = require("./users");
const videos_1 = require("./videos");
const repository_1 = __importDefault(require("../repository"));
function lambdaImportYoutube(pgClient, pgp, youtubeConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const channelIds = yield repository.getYoutubeUsers();
        const Videos = new videos_1.YoutubeVideos(repository, youtubeConfiguration);
        let result;
        let videosImported = 0;
        for (let i = 0; i < channelIds.length; i++) {
            try {
                result = yield Videos.importVideos(channelIds[i].youtube_channel_id, channelIds[i].access_token, channelIds[i].refresh_token);
                videosImported += result[1];
            }
            catch (err) {
                console.error(err);
            }
        }
        console.log(`${videosImported} youtube videos were imported`);
    });
}
exports.lambdaImportYoutube = lambdaImportYoutube;
function importYoutubeUsersById(pgClient, pgp, youtubeConfiguration, userChannelUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Users = new users_1.YoutubeUsers(repository, youtubeConfiguration);
        const result = yield Users.importYoutubeUsersById(userChannelUrl);
        let length;
        if (typeof userChannelUrl === 'string') {
            length = 1;
        }
        else {
            length = userChannelUrl.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Youtube profiles.`);
        return result;
    });
}
exports.importYoutubeUsersById = importYoutubeUsersById;
function importYoutubeUsersByToken(youtubeUsers, pgClient, pgp, youtubeConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Users = new users_1.YoutubeUsers(repository, youtubeConfiguration);
        const result = yield Users.importYoutubeUsersbyToken(youtubeUsers);
        console.log(`Successfully imported ${result[0][0].title} Youtube profile.`);
        return result;
    });
}
exports.importYoutubeUsersByToken = importYoutubeUsersByToken;
function importVideos(pgClient, pgp, youtubeConfiguration, youtubeChannelId, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Videos = new videos_1.YoutubeVideos(repository, youtubeConfiguration);
        if (startDate !== undefined) {
            yield Videos.setStartDate(startDate);
        }
        const result = yield Videos.importVideos(youtubeChannelId);
        console.log(`${result[1]} Youtube videos were imported!`);
        return result;
    });
}
exports.importVideos = importVideos;
