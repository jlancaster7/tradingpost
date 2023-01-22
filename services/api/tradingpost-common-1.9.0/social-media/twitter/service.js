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
exports.DefaultTwitter = void 0;
const repository_1 = __importDefault(require("../repository"));
const post_prepper_1 = __importDefault(require("../../post-prepper"));
const _1 = __importDefault(require("./"));
class TwitterService {
    constructor(twitter, repository, postPrepper, elasticSrv) {
        this.importTweets = () => __awaiter(this, void 0, void 0, function* () {
            if (this.elasticSrv === undefined)
                throw new Error("initialize elastic");
            const twitterIds = yield this.repository.getTwitterUsers();
            for (let i = 0; i < twitterIds.length; i++) {
                const twitterAccount = twitterIds[i];
                const [results] = yield this.twitter.importTweets(twitterAccount.twitter_user_id, twitterAccount.access_token);
                const tweetsAndUsers = yield this.repository.getTweetsAndUsersByTweetIds(results.map(result => result.tweet_id));
                if (tweetsAndUsers.length <= 0)
                    continue;
                yield this.elasticSrv.ingest(this.map(tweetsAndUsers));
            }
        });
        this.exportTweetsAndUsers = (lastId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.getTweetsAndUsersById(lastId);
        });
        this.map = (items) => {
            return items.map(tw => {
                let obj = {
                    id: `twitter_${tw.tweetID}`,
                    content: {
                        body: tw.text,
                        description: tw.text,
                        htmlBody: tw.embed,
                        htmlTitle: null,
                        title: null
                    },
                    imageUrl: null,
                    meta: {},
                    platform: {
                        displayName: tw.displayName,
                        imageUrl: tw.profileImageURL,
                        profileUrl: tw.profileURL,
                        username: tw.twitterUsername
                    },
                    platformCreatedAt: tw.tweetTwitterCreatedAt.toISO(),
                    platformUpdatedAt: null,
                    postType: "tweet",
                    subscription_level: "standard",
                    postTypeValue: 1.75,
                    postUrl: tw.tweetURL,
                    ratingsCount: 0,
                    tradingpostCreatedAt: tw.tradingPostTweetCreatedAt.toISO(),
                    tradingpostUpdatedAt: null,
                    size: {
                        maxWidth: tw.maxWidth,
                        aspectRatio: tw.aspectRatio
                    },
                    user: {
                        id: tw.tradingpostUserId,
                        imageUrl: tw.tradingpostUserProfileUrl,
                        name: "",
                        type: "",
                        username: tw.tradingpostUserHandle
                    }
                };
                return obj;
            });
        };
        this.addTwitterUsersByHandle = (handles) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.twitter.importUserByHandle(handles);
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
        this.addTwitterUsersByToken = (twitterUsers) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.twitter.importUserByToken(twitterUsers);
            console.log(`Successfully imported ${result[0].username} Twitter profile.`);
            return result[0];
        });
        this.addTweets = (twitterUserId, startDate) => __awaiter(this, void 0, void 0, function* () {
            const token = yield this.repository.getTokens('platform_user_id', [twitterUserId], 'twitter');
            if (startDate !== undefined) {
                yield this.twitter.setStartDate(twitterUserId, startDate);
            }
            const result = yield this.twitter.importTweets(twitterUserId, (token.length ? null : token[0].accessToken));
            console.log(`${result[1]} tweets were imported!`);
            return result;
        });
        this.twitter = twitter;
        this.repository = repository;
        this.postPrepper = postPrepper;
        this.elasticSrv = elasticSrv;
    }
}
exports.default = TwitterService;
const DefaultTwitter = (twitterCfg, pgClient, pgp, postPrepper, elasticSrv) => {
    const repo = new repository_1.default(pgClient, pgp);
    let pp;
    if (postPrepper === undefined)
        pp = new post_prepper_1.default();
    else
        pp = postPrepper;
    const twitter = new _1.default(twitterCfg, repo, pp);
    return new TwitterService(twitter, repo, pp, elasticSrv);
};
exports.DefaultTwitter = DefaultTwitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsK0RBQXNDO0FBRXRDLHNFQUE2QztBQUM3QywwQ0FBeUI7QUFVekIsTUFBcUIsY0FBYztJQU0vQixZQUFZLE9BQWdCLEVBQUUsVUFBc0IsRUFBRSxXQUF3QixFQUFFLFVBQTJCO1FBTzNHLGlCQUFZLEdBQUcsR0FBUyxFQUFFO1lBQ3RCLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtZQUN4RSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3hDLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQy9HLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pILElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUFFLFNBQVM7Z0JBQ3pDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2FBQzFEO1FBQ0wsQ0FBQyxD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