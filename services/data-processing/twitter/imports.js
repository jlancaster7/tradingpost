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
exports.importTweets = exports.importTwitterUsers = exports.lambdaImportTweets = void 0;
const users_1 = require("./users");
const tweets_1 = require("./tweets");
function lambdaImportTweets(pgClient, twitterConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = `SELECT twitter_user_id
                 FROM twitter_users`;
        const twitterIds = yield pgClient.query(query);
        const Tweet = new tweets_1.Tweets(twitterConfiguration, pgClient);
        let result;
        let tweetsImported = 0;
        for (let i = 0; i < twitterIds.length; i++) {
            result = yield Tweet.importTweets(twitterIds[i].twitter_user_id);
            tweetsImported += result[1];
        }
        console.log(`${tweetsImported} tweets were imported!`);
    });
}
exports.lambdaImportTweets = lambdaImportTweets;
function importTwitterUsers(handles, pgClient, twitterConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const TwitterUser = new users_1.TwitterUsers(twitterConfiguration, pgClient);
        const result = yield TwitterUser.importUser(handles);
        let length;
        if (typeof handles === 'string') {
            length = 1;
        }
        else {
            length = handles.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
        return result;
    });
}
exports.importTwitterUsers = importTwitterUsers;
function importTweets(twitterUserId, pgClient, twitterConfiguration, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const Tweet = new tweets_1.Tweets(twitterConfiguration, pgClient);
        if (startDate !== undefined) {
            yield Tweet.setStartDate(startDate);
        }
        const result = yield Tweet.importTweets(twitterUserId);
        console.log(`${result[1]} tweets were imported!`);
        return result;
    });
}
exports.importTweets = importTweets;
