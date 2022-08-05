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
exports.addTweets = exports.addTwitterUsersByToken = exports.addTwitterUsersByHandle = exports.lambdaImportTweets = void 0;
const users_1 = require("./users");
const tweets_1 = require("./tweets");
const repository_1 = __importDefault(require("../repository"));
const lambdaImportTweets = (pgClient, pgp, twitterConfiguration) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = new repository_1.default(pgClient, pgp);
    const twitterIds = yield repository.getTwitterUsers();
    const Tweet = new tweets_1.Tweets(twitterConfiguration, repository);
    let result;
    let tweetsImported = 0;
    for (let i = 0; i < twitterIds.length; i++) {
        result = yield Tweet.importTweets(twitterIds[i].twitter_user_id, twitterIds[i].access_token);
        tweetsImported += result[1];
    }
    console.log(`${tweetsImported} tweets were imported!`);
});
exports.lambdaImportTweets = lambdaImportTweets;
const addTwitterUsersByHandle = (handles, pgClient, pgp, twitterConfiguration) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = new repository_1.default(pgClient, pgp);
    const TwitterUser = new users_1.TwitterUsers(twitterConfiguration, repository);
    const result = yield TwitterUser.importUserByHandle(handles);
    let length;
    if (typeof handles === 'string') {
        length = 1;
    }
    else {
        length = handles.length;
    }
    console.log(`Successfully imported ${result.length} of ${length} Twitter profiles.`);
    return result;
});
exports.addTwitterUsersByHandle = addTwitterUsersByHandle;
const addTwitterUsersByToken = (twitterUsers, pgClient, pgp, twitterConfiguration) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = new repository_1.default(pgClient, pgp);
    const TwitterUser = new users_1.TwitterUsers(twitterConfiguration, repository);
    const Tweet = new tweets_1.Tweets(twitterConfiguration, repository);
    try {
        const result = yield TwitterUser.importUserByToken(twitterUsers);
        const tweetResults = yield Tweet.importTweets(result[0].twitter_user_id, twitterUsers.accessToken);
        console.log(`Successfully imported ${result[0].username} Twitter profile.`);
        return result[0];
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.addTwitterUsersByToken = addTwitterUsersByToken;
const addTweets = (twitterUserId, pgClient, pgp, twitterConfiguration, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = new repository_1.default(pgClient, pgp);
    const Tweet = new tweets_1.Tweets(twitterConfiguration, repository);
    const token = yield repository.getTokens('platform_user_id', [twitterUserId], 'twitter');
    if (startDate !== undefined) {
        yield Tweet.setStartDate(twitterUserId, startDate);
    }
    const result = yield Tweet.importTweets(twitterUserId, (token.length ? null : token[0].accessToken));
    console.log(`${result[1]} tweets were imported!`);
    return result;
});
exports.addTweets = addTweets;
