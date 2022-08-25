import {DateTime} from "luxon";

export interface TweetsAndUsers {
    tweetID: number
    twitterUserID: number
    embed: string
    language: string
    likeCount: number
    possiblySensitive: boolean
    quoteCount: number
    replyCount: number
    retweetCount: number
    text: string
    tweetURL: string
    URLs: string[]
    mediaKeys: {
        data: string[]
    }
    annotations: object
    cashtags: object
    hashtags: object
    mentions: object
    tweetTwitterCreatedAt: DateTime
    tradingPostTweetCreatedAt: DateTime
    twitterUsername: string
    displayName: string
    description: string
    location: string
    followerCount: number
    followingCount: number
    profileImageURL: string
    profileURL: string
    protected: boolean,
    userTwitterCreatedAt: DateTime
    tradingPostTwitterCreatedAt: DateTime
    aspectRatio: number
    maxWidth: number
    tradingpostUserId: string
    tradingpostUserHandle: string
    tradingpostUserEmail: string
    tradingpostUserProfileUrl: string
}

export interface TweetsAndUsersTable extends TweetsAndUsers {
    id: number
    created_at: DateTime
}

export interface rawTweet {
    id: string,
    twitter_user_id: string,
    embed: string,
    lang: string,
    public_metrics: { [key: string]: number },
    possibly_sensitive: boolean,
    text: string,
    tweet_url: string,
    entities?: { [key: string]: string },
    attachments?: { [key: string]: string },
    created_at: Date
}

export interface formatedTweet {
    tweet_id: string,
    twitter_user_id: string,
    embed: string,
    lang: string,
    like_count: number,
    quote_count: number,
    reply_count: number,
    retweet_count: number,
    possibly_sensitive: boolean,
    text: string,
    tweet_url: string,
    urls: string | null,
    media_keys: string | null,
    annotations: string | null,
    cashtags: string | null,
    hashtags: string | null,
    mentions: string | null,
    twitter_created_at: Date
    aspect_ratio: number
    max_width: number
}

export interface rawTwitterUser {
    protected: boolean,
    name: string,
    public_metrics: { [key: string]: number },
    location: string,
    created_at: string,
    username: string,
    description: string,
    profile_image_url: string,
    id: string
}

export interface formatedTwitterUser {
    protected: boolean,//
    display_name: string, //
    follower_count: number,
    following_count: number,
    location: string,//
    twitter_created_at: Date,
    username: string, //
    description: string, //
    profile_image_url: string,//
    profile_url: string, //
    twitter_user_id: string //
}

export type PlatformToken = {
    userId: string,
    platform: string,
    platformUserId: string,
    accessToken: string,
    refreshToken: string,
    expiration: string
}

export interface twitterParams {
    method: string,
    headers: { [key: string]: string }
}