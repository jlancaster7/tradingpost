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
    const result = yield TwitterUser.importUserByToken(twitterUsers);
    console.log(`Successfully imported ${result[1]} of ${twitterUsers.length} Twitter profiles.`);
    return result[0];
});
exports.addTwitterUsersByToken = addTwitterUsersByToken;
const addTweets = (twitterUserId, pgClient, pgp, twitterConfiguration, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const repository = new repository_1.default(pgClient, pgp);
    const Tweet = new tweets_1.Tweets(twitterConfiguration, repository);
    if (startDate !== undefined) {
        yield Tweet.setStartDate(twitterUserId, startDate);
    }
    const result = yield Tweet.importTweets(twitterUserId);
    console.log(`${result[1]} tweets were imported!`);
    return result;
});
exports.addTweets = addTweets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBcUM7QUFDckMscUNBQWdDO0FBQ2hDLCtEQUFzQztBQVcvQixNQUFNLGtCQUFrQixHQUFHLENBQU8sUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQUUsRUFBRTtJQUd6SCxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUksZUFBTSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNELElBQUksTUFBaUMsQ0FBQztJQUN0QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFFdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFFeEMsTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3RixjQUFjLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9CO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGNBQWMsd0JBQXdCLENBQUMsQ0FBQztBQUMzRCxDQUFDLENBQUEsQ0FBQTtBQWhCWSxRQUFBLGtCQUFrQixzQkFnQjlCO0FBRU0sTUFBTSx1QkFBdUIsR0FBRyxDQUFPLE9BQTBCLEVBQUUsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQWtDLEVBQUU7SUFFMUwsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRCxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFZLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFdkUsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0QsSUFBSSxNQUFjLENBQUM7SUFDbkIsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7UUFDN0IsTUFBTSxHQUFHLENBQUMsQ0FBQTtLQUNiO1NBQU07UUFDSCxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQTtLQUMxQjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLE1BQU0sQ0FBQyxNQUFNLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3JGLE9BQU8sTUFBTSxDQUFBO0FBQ2pCLENBQUMsQ0FBQSxDQUFBO0FBZFksUUFBQSx1QkFBdUIsMkJBY25DO0FBQ00sTUFBTSxzQkFBc0IsR0FBRyxDQUFPLFlBQTZGLEVBQUUsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQWtDLEVBQUU7SUFFNVAsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRCxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFZLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFdkUsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFHakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLFlBQVksQ0FBQyxNQUFNLG9CQUFvQixDQUFDLENBQUM7SUFDOUYsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsQ0FBQyxDQUFBLENBQUE7QUFWWSxRQUFBLHNCQUFzQiwwQkFVbEM7QUFDTSxNQUFNLFNBQVMsR0FBRyxDQUFPLGFBQXFCLEVBQUUsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQUUsU0FBZ0IsRUFBc0MsRUFBRTtJQUM3TCxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksZUFBTSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNELElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtRQUN6QixNQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3REO0lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUE7SUFDakQsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFBLENBQUE7QUFUWSxRQUFBLFNBQVMsYUFTckIifQ==