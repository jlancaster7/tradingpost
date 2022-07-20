export interface rawTweet {
    id: string;
    twitter_user_id: string;
    embed: string;
    lang: string;
    public_metrics: {
        [key: string]: number;
    };
    possibly_sensitive: boolean;
    text: string;
    tweet_url: string;
    entities?: {
        [key: string]: string;
    };
    attachments?: {
        [key: string]: string;
    };
    created_at: Date;
}
export interface formatedTweet {
    tweet_id: string;
    twitter_user_id: string;
    embed: string;
    lang: string;
    like_count: number;
    quote_count: number;
    reply_count: number;
    retweet_count: number;
    possibly_sensitive: boolean;
    text: string;
    tweet_url: string;
    urls?: {
        [key: string]: string;
    };
    media_keys?: {
        [key: string]: string;
    };
    annotations?: {
        [key: string]: string;
    };
    cashtags?: {
        [key: string]: string;
    };
    hashtags?: {
        [key: string]: string;
    };
    mentions?: {
        [key: string]: string;
    };
    twitter_created_at: Date;
}
export interface rawTwitterUser {
    protected: boolean;
    name: string;
    public_metrics: {
        [key: string]: number;
    };
    location: string;
    created_at: string;
    username: string;
    description: string;
    profile_img_url: string;
    id: string;
}
export interface formatedTwitterUser {
    protected: boolean;
    display_name: string;
    follower_count: number;
    following_count: number;
    location: string;
    twitter_created_at: Date;
    username: string;
    description: string;
    profile_img_url: string;
    profile_url: string;
    twitter_user_id: string;
}
export interface twitterParams {
    method: string;
    headers: {
        [key: string]: string;
    };
}
