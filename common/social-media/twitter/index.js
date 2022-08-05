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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBcUM7QUFDckMscUNBQWdDO0FBQ2hDLCtEQUFzQztBQVcvQixNQUFNLGtCQUFrQixHQUFHLENBQU8sUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQUUsRUFBRTtJQUV6SCxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUksZUFBTSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNELElBQUksTUFBaUMsQ0FBQztJQUN0QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEMsTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3RixjQUFjLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9CO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsd0JBQXdCLENBQUMsQ0FBQztBQUUzRCxDQUFDLENBQUEsQ0FBQTtBQWRZLFFBQUEsa0JBQWtCLHNCQWM5QjtBQUVNLE1BQU0sdUJBQXVCLEdBQUcsQ0FBTyxPQUEwQixFQUFFLFFBQXdCLEVBQUUsR0FBVSxFQUFFLG9CQUEwQyxFQUFrQyxFQUFFO0lBRTFMLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFR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