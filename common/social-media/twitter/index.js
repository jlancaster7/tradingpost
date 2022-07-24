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
exports.addTweets = exports.addTwitterUsersByToken = exports.addTwitterUsersByHandle = exports.lambdaImportTweets = void 0;
const users_1 = require("./users");
const tweets_1 = require("./tweets");
const lambdaImportTweets = (pgClient, pgp, twitterConfiguration) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `SELECT twitter_user_id, twitter_users.user_id, token
                 FROM twitter_users
                 LEFT JOIN (SELECT user_id, token FROM platform_tokens WHERE platform = 'twitter') as a
                 ON twitter_users.user_id = a.user_id
                 `;
    const twitterIds = yield pgClient.query(query);
    const Tweet = new tweets_1.Tweets(twitterConfiguration, pgClient, pgp);
    let result;
    let tweetsImported = 0;
    for (let i = 0; i < twitterIds.length; i++) {
        result = yield Tweet.importTweets(twitterIds[i].twitter_user_id, twitterIds[i].token);
        tweetsImported += result[1];
    }
    console.log(`${tweetsImported} tweets were imported!`);
});
exports.lambdaImportTweets = lambdaImportTweets;
const addTwitterUsersByHandle = (handles, pgClient, pgp, twitterConfiguration) => __awaiter(void 0, void 0, void 0, function* () {
    const TwitterUser = new users_1.TwitterUsers(twitterConfiguration, pgClient, pgp);
    const result = yield TwitterUser.importUserByHandle(handles);
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
exports.addTwitterUsersByHandle = addTwitterUsersByHandle;
const addTwitterUsersByToken = (twitterUsers, pgClient, pgp, twitterConfiguration) => __awaiter(void 0, void 0, void 0, function* () {
    const TwitterUser = new users_1.TwitterUsers(twitterConfiguration, pgClient, pgp);
    yield TwitterUser.upsertUserToken(twitterUsers);
    const result = yield TwitterUser.importUserByToken(twitterUsers);
    console.log(`Successfully imported ${result[1]} of ${twitterUsers.length} Twitter profiles.`);
    return result;
});
exports.addTwitterUsersByToken = addTwitterUsersByToken;
const addTweets = (twitterUserId, pgClient, pgp, twitterConfiguration, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const Tweet = new tweets_1.Tweets(twitterConfiguration, pgClient, pgp);
    if (startDate !== undefined) {
        yield Tweet.setStartDate(startDate);
    }
    const result = yield Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`);
    return result;
});
exports.addTweets = addTweets;
