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
exports.importVideos = exports.importYoutubeUsers = exports.lambdaImportYoutube = void 0;
const users_1 = require("./users");
const videos_1 = require("./videos");
function lambdaImportYoutube(pgClient, pgp, youtubeConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = 'SELECT youtube_channel_id FROM youtube_users';
        const channelIds = yield pgClient.query(query);
        const Videos = new videos_1.YoutubeVideos(youtubeConfiguration, pgClient, pgp);
        let result;
        let videosImported = 0;
        for (let i = 0; i < channelIds.length; i++) {
            result = yield Videos.importVideos(channelIds[i].youtube_channel_id);
            videosImported += result[1];
        }
        console.log(`${videosImported} youtube videos were imported`);
    });
}
exports.lambdaImportYoutube = lambdaImportYoutube;
function importYoutubeUsers(pgClient, pgp, youtubeConfiguration, userChannelUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const Users = new users_1.YoutubeUsers(youtubeConfiguration, pgClient, pgp);
        const result = yield Users.importYoutubeUsers(userChannelUrl);
        let length;
        if (typeof userChannelUrl === 'string') {
            length = 1;
        }
        else {
            length = userChannelUrl.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
        return result;
    });
}
exports.importYoutubeUsers = importYoutubeUsers;
function importVideos(pgClient, pgp, youtubeConfiguration, youtubeChannelId, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const Vidoes = new videos_1.YoutubeVideos(youtubeConfiguration, pgClient, pgp);
        if (startDate !== undefined) {
            yield Vidoes.setStartDate(startDate);
        }
        const result = yield Vidoes.importVideos(youtubeChannelId);
        console.log(`${result[1]} Youtube videos were imported!`);
        return result;
    });
}
exports.importVideos = importVideos;
