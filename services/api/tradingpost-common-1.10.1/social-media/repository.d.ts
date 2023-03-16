import { formatedTweet, formatedTwitterUser, TweetsAndUsers, TweetsAndUsersTable } from './twitter/interfaces';
import { PlatformToken } from './utils';
import { SubstackAndNewsletter, SubstackAndNewsletterTable, SubstackArticles, SubstackUser } from './substack/interfaces';
import { spotifyShow, spotifyEpisode, SpotifyEpisodeAndUser, SpotifyEpisodeAndUserTable } from './spotify/interfaces';
import { TradingPostsAndUsersTable } from "./tradingposts/interfaces";
import { formatedYoutubeVideo, formatedChannelInfo, YouTubeVideoAndChannel, YouTubeVideoAndChannelTable } from './youtube/interfaces';
import { IDatabase, IMain } from "pg-promise";
export default class Repository {
    private db;
    private readonly pgp;
    constructor(db: IDatabase<any>, pgp: IMain);
    getSpotifyUsers: () => Promise<{
        spotify_show_id: string;
    }[]>;
    getTwitterUsers: () => Promise<{
        twitter_user_id: string;
        access_token: string | null;
        refresh_token: string | null;
    }[]>;
    getSubstackUsers: () => Promise<{
        substack_user_id: string;
    }[]>;
    getSubstackArticlesAndUsersByArticleIds: (articleIds: string[]) => Promise<SubstackAndNewsletter[]>;
    getSubstackArticlesAndUsers: (lastId: number) => Promise<SubstackAndNewsletterTable[]>;
    getYoutubeUsers: () => Promise<{
        youtube_channel_id: string;
        access_token: string | null;
        refresh_token: string | null;
    }[]>;
    getTweetsLastUpdate: (twitterUserId: string) => Promise<Date>;
    getYoutubeLastUpdate: (youtubeChannelId: string) => Promise<Date>;
    getSpotifyLastUpdate: (spotify_show_id: string) => Promise<Date>;
    getTokens: (idType: string, ids: string[], platform: string) => Promise<PlatformToken[]>;
    upsertUserTokens: (userTokens: PlatformToken) => Promise<import("pg-promise").IResultExt<unknown>>;
    removeUserToken: (idType: string, id: string, platform: string) => Promise<void>;
    isUserIdDummy: (userId: string) => Promise<boolean>;
    mergeDummyAccounts: (userId: {
        newUserId: string;
        dummyUserId: string;
    }) => Promise<void>;
    getTweetsAndUsersById: (lastId: number) => Promise<TweetsAndUsersTable[]>;
    getTweetsAndUsersByTweetIds: (tweetIds: string[]) => Promise<TweetsAndUsers[]>;
    upsertTweets: (formatedTweets: formatedTweet[]) => Promise<number>;
    upsertTwitterUser: (users: formatedTwitterUser[]) => Promise<number>;
    insertSubstackArticles: (formattedArticles: SubstackArticles[]) => Promise<number>;
    insertSubstackUser: (data: SubstackUser) => Promise<number>;
    getEpisodesAndUsersByEpisodeIds: (episodeIds: string[]) => Promise<SpotifyEpisodeAndUser[]>;
    getEpisodesAndUsersById: (id: number) => Promise<SpotifyEpisodeAndUserTable[]>;
    insertSpotifyEpisodes: (episodes: spotifyEpisode[]) => Promise<number>;
    upsertSpotifyShow: (formattedShows: spotifyShow[]) => Promise<number>;
    getYoutubeVideosAndChannelsByVideoIds: (videoIds: string[]) => Promise<YouTubeVideoAndChannel[]>;
    getYoutubeVideosAndChannelsById: (lastId: number) => Promise<YouTubeVideoAndChannelTable[]>;
    insertYoutubeVideos: (formattedVideos: formatedYoutubeVideo[]) => Promise<number>;
    insertChannelInfo: (data: formatedChannelInfo[]) => Promise<number>;
    getTradingPostsAndUsers: (lastId: number) => Promise<TradingPostsAndUsersTable[]>;
}
