import {DateTime} from "luxon";

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

export interface YouTubeVideoAndChannelTable extends YouTubeVideoAndChannel {
    id: number
    created_at: DateTime
}

export interface channelInfo {
    id: string,
    title: string,
    description: string,
    country: string,
    customUrl: string,
    publishedAt: Date,
    thumbnails: { [key: string]: { [key: string]: string | number } },
    statistics: { [key: string]: string | boolean },
    status: { [key: string]: string | boolean },
}

export interface formatedChannelInfo {
    youtube_channel_id: string,
    title: string,
    description: string,
    country: string,
    custom_url: string,
    youtube_created_at: Date,
    thumbnails: { [key: string]: { [key: string]: string | number } },
    statistics: { [key: string]: string | boolean },
    status: { [key: string]: string | boolean },
}

export interface rawYoutubeVideo {
    kind: string,
    etag: string,
    id: string,
    snippet: {
        publishedAt: string,
        channelId: string,
        title: string,
        description: string,
        thumbnails: { [key: string]: string | number },
        channelTitle: string,
        type: string,
        groupId: string
    },
    contentDetails: { upload: { videoId: string } }
}

export interface formatedYoutubeVideo {
    video_id: string
    youtube_created_at: string
    youtube_channel_id: string
    title: string
    description: string
    thumbnails: string
    video_url: string
    video_embed: string
    aspect_ratio: number
    max_width: number
}

export interface youtubeParams {
    method: string,
    headers: { [key: string]: string }
}