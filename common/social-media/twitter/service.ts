import {formatedTweet, formatedTwitterUser, TweetsAndUsers, TweetsAndUsersTable} from './interfaces';
import Repository from '../repository'
import {IDatabase, IMain} from "pg-promise";
import PostPrepper from "../../post-prepper";
import Twitter from "./";
import ElasticService from "../../elastic";
import {SearchBody} from "../../models/elastic/search";

type TwitterConfiguration = {
    API_key: string
    API_secret_key: string
    bearer_token: string
}

export default class TwitterService {
    private twitter: Twitter;
    private repository: Repository;
    private postPrepper: PostPrepper;
    private readonly elasticSrv?: ElasticService;

    constructor(twitter: Twitter, repository: Repository, postPrepper: PostPrepper, elasticSrv?: ElasticService) {
        this.twitter = twitter;
        this.repository = repository;
        this.postPrepper = postPrepper;
        this.elasticSrv = elasticSrv;
    }

    importTweets = async () => {
        if (this.elasticSrv === undefined) throw new Error("initialize elastic")
        const twitterIds = await this.repository.getTwitterUsers();

        for (let i = 0; i < twitterIds.length; i++) {
            const [results] = await this.twitter.importTweets(twitterIds[i].twitter_user_id, twitterIds[i].access_token);
            const tweetsAndUsers = await this.repository.getTweetsAndUsersByTweetIds(results.map(result => result.tweet_id));
            if (tweetsAndUsers.length <= 0) continue;
            await this.elasticSrv.ingest(this.map(tweetsAndUsers));
        }
    }

    exportTweetsAndUsers = async (lastId: number): Promise<TweetsAndUsersTable[]> => {
        return await this.repository.getTweetsAndUsersById(lastId);
    }

    map = (items: TweetsAndUsers[]): SearchBody[] => {
        return items.map(tw => {
            let obj: SearchBody = {
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
    }

    ddTwitterUsersByHandle = async (handles: string | string[]): Promise<formatedTwitterUser[]> => {
        const result = await this.twitter.importUserByHandle(handles);
        let length: number;
        if (typeof handles === 'string') {
            length = 1
        } else {
            length = handles.length
        }
        console.log(`Successfully imported ${result.length} of ${length} Twitter profiles.`);
        return result
    }

    addTwitterUsersByToken = async (twitterUsers: { userId: string, accessToken: string, refreshToken: string, expiration: number }): Promise<formatedTwitterUser> => {
        const result = await this.twitter.importUserByToken(twitterUsers);
        console.log(`Successfully imported ${result[0].username} Twitter profile.`);
        return result[0];
    }

    addTweets = async (twitterUserId: string, startDate?: Date): Promise<[formatedTweet[], number]> => {
        const token = await this.repository.getTokens('platform_user_id', [twitterUserId], 'twitter');
        if (startDate !== undefined) {
            await this.twitter.setStartDate(twitterUserId, startDate);
        }
        const result = await this.twitter.importTweets(twitterUserId, (token.length ? null : token[0].accessToken));
        console.log(`${result[1]} tweets were imported!`)
        return result;
    }
}

export const DefaultTwitter = (twitterCfg: TwitterConfiguration, pgClient: IDatabase<any>, pgp: IMain, postPrepper?: PostPrepper, elasticSrv?: ElasticService): TwitterService => {
    const repo = new Repository(pgClient, pgp);
    let pp: PostPrepper;
    if (postPrepper === undefined) pp = new PostPrepper();
    else pp = postPrepper
    const twitter = new Twitter(twitterCfg, repo, pp);
    return new TwitterService(twitter, repo, pp, elasticSrv);
}

