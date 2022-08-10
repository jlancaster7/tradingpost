import {DateTime} from 'luxon';

export type LastID = string | number | null

export interface Provider {
    getItems: (lastId: LastID) => Promise<{ items: ElasticSearchBody[], lastId: LastID }>
    name: string
}


export interface ElasticSearchBody {
    id: string
    user: {
        imageUrl: string | null
        id: string | null
        name: string | null
        username: string | null
        type: string | null
    },
    ratingsCount: number | null
    postType: string | null
    postTypeValue: number
    imageUrl: string | null
    postUrl: string | null
    platform: {
        username: string | null
        displayName: string | null
        profileUrl: string | null
        imageUrl: string | null
    }
    content: {
        title: string | null
        htmlTitle: string | null
        body: string | null
        htmlBody: string | null
        description: string | null
    },
    size: {
        maxWidth: number
        aspectRatio: number
    }
    platformUpdatedAt: DateTime | null | string
    tradingpostUpdatedAt: DateTime | null | string
    platformCreatedAt: DateTime | null | string
    tradingpostCreatedAt: DateTime | null | string
    meta: object | null
}

export interface TweetsAndUser {
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

// TODO: Update user_id and I believe we are using hashes rather than numeric IDs
export interface YouTubeVideoAndChannel {
    video_id: string
    youtube_channel_id: string
    title: string
    description: string
    video_url: string
    video_embed: string
    thumbnails: object
    youtube_created_at: DateTime
    trading_post_youtube_video_created_at: DateTime
    channel_title: string
    channel_description: string
    country: string
    custom_channel_url: string
    channel_thumbnails: object
    channel_statistics: object
    channel_status: object
    channel_created_at: DateTime
    trading_post_channel_created_at: DateTime
    maxWidth: number
    aspectRatio: number
    tradingpostUserId: string
    tradingpostUserHandle: string
    tradingpostUserEmail: string
    tradingpostUserProfileUrl: string
}

export interface SubstackAndNewsletter {
    substack_user_id: string
    article_id: string
    creator: string
    title: string
    link: string
    content_encoded: string
    content_encoded_snippet: string
    enclosure: object
    dc_creator: string
    itunes: object
    content: string
    content_snippet: string
    substack_article_created_at: DateTime
    tradingpost_substack_article_created_at: DateTime
    newsletter_title: string
    newsletter_description: string
    newsletter_link: string
    newsletter_language: string
    newsletter_email: string
    newsletter_image: {
        url: string
        link: string
        title: string
    }
    newsletter_itunes: object
    last_newsletter_build_date: DateTime
    substack_added_to_tradingpost_date: DateTime
    maxWidth: number
    aspectRatio: number
    tradingpostUserId: string
    tradingpostUserHandle: string
    tradingpostUserEmail: string
    tradingpostProfileUrl: string
}

export interface SpotifyEpisodeAndUser {
    spotify_episode_id: string
    spotify_show_id: string
    audio_preview_url: string
    episode_name: string
    episode_description: string
    episode_duration_ms: number
    is_episode_explicit: boolean
    episode_html_description: string
    is_episode_externally_hosted: boolean
    is_episode_playable: boolean
    episode_language: string
    episode_languages: string[]
    episode_embed: {
        html: string
        type: string
        title: string
        width: number
        height: number
        version: string
        provider_url: string
        provider_name: string
        thumbnail_url: string
        thumbnail_width: number
        thumbnail_height: number
    }
    episode_external_urls: object
    episode_images: object
    episode_release_date: DateTime
    tradingpost_episode_created_at: DateTime
    podcast_name: string
    podcast_description: string
    is_podcast_explicit: boolean
    podcast_html_description: string
    is_podcast_externally_hosted: boolean
    podcast_media_type: string
    podcast_publisher: string
    podcast_total_episodes: number
    podcast_languages: string[]
    podcast_external_urls: object
    podcast_images: object[]
    podcast_copyrights: any[]
    tradingpost_podcast_created_at: DateTime
    maxWidth: number
    aspectRatio: number
    tradingpostUserId: string
    tradingpostUserHandle: string
    tradingpostUserEmail: string
    tradingpostUserProfileUrl: string
}