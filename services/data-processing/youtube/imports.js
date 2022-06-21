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
const utils_1 = require("../utils/utils");
const users_1 = require("./users");
const videos_1 = require("./videos");
const awsConfigs = (0, utils_1.getAWSConfigs)();
lambdaImportYoutube();
function lambdaImportYoutube() {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        let query = 'SELECT youtube_channel_id FROM youtube_users';
        const channelIds = (yield pg_client.query(query)).rows;
        const Videos = new videos_1.YoutubeVideos((yield awsConfigs).youtube, pg_client);
        let result;
        let videosImported = 0;
        for (let i = 0; i < channelIds.length; i++) {
            result = yield Videos.importVideos(channelIds[i].youtube_channel_id);
            videosImported += result[1];
        }
        console.log(`${videosImported} youtube videos were imported`);
        pg_client.end();
        return;
    });
}
exports.lambdaImportYoutube = lambdaImportYoutube;
function importYoutubeUsers(userChannelUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const Users = new users_1.YoutubeUsers((yield awsConfigs).youtube, pg_client);
        const result = yield Users.importYoutubeUsers(userChannelUrl);
        let length;
        if (typeof userChannelUrl === 'string') {
            length = 1;
        }
        else {
            length = userChannelUrl.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
        pg_client.end();
        return result;
    });
}
exports.importYoutubeUsers = importYoutubeUsers;
function importVideos(youtubeChannelId, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const Vidoes = new videos_1.YoutubeVideos((yield awsConfigs).youtube, pg_client);
        if (startDate !== undefined) {
            Vidoes.setStartDate(startDate);
        }
        const result = yield Vidoes.importVideos(youtubeChannelId);
        console.log(`${result[1]} Youtube videos were imported!`);
        pg_client.end();
        return result;
    });
}
exports.importVideos = importVideos;
