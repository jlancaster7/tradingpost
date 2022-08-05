import { formatedTweet, formatedTwitterUser } from './interfaces/twitter';
import { PlatformToken } from './interfaces/utils';
import { SubstackArticles, SubstackUser } from './interfaces/rss_feeds';
import { spotifyShow, spotifyEpisode } from './interfaces/podcasts';
import { formatedYoutubeVideo, formatedChannelInfo } from './interfaces/youtube';
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
    getYoutubeUsers: () => Promise<{
        youtube_channel_id: string;
        access_token: string | null;
        refresh_token: string | null;
    }[]>;
    getTweetsLastUpdate: (twitterUserId: string) => Promise<Date>;
    getYoutubeLastUpdate: (youtubeChannelId: string) => Promise<Date>;
    getSpotifyLastUpdate: (spotify_show_id: string) => Promise<Date>;
    getTokens: (idType: string, ids: string[], platform: string) => Promise<PlatformToken[]>;
    upsertUserTokens: (userTokens: PlatformToken) => Promise<import("pg-promise").IResultExt>;
    isUserIdDummy: (userId: string) => Promise<boolean>;
    mergeDummyAccounts: (userId: {
        newUserId: string;
        dummyUserId: string;
    }) => Promise<void>;
    upsertTweets: (formatedTweets: formatedTweet[]) => Promise<number>;
    upsertTwitterUser: (users: formatedTwitterUser[]) => Promise<number>;
    insertSubstackArticles: (formattedArticles: SubstackArticles[]) => Promise<number>;
    insertSubstackUser: (data: SubstackUser) => Promise<number>;
    insertSpotifyEpisodes: (episodes: spotifyEpisode[]) => Promise<number>;
    upsertSpotifyShow: (formattedShows: spotifyShow[]) => Promise<number>;
    insertYoutubeVideos: (formattedVideos: formatedYoutubeVideo[]) => Promise<number>;
    insertChannelInfo: (data: formatedChannelInfo[]) => Promise<number>;
}
