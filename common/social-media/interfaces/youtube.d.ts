export interface channelInfo {
    id: string;
    title: string;
    description: string;
    country: string;
    customUrl: string;
    publishedAt: Date;
    thumbnails: {
        [key: string]: {
            [key: string]: string | number;
        };
    };
    statistics: {
        [key: string]: string | boolean;
    };
    status: {
        [key: string]: string | boolean;
    };
}
export interface formatedChannelInfo {
    youtube_channel_id: string;
    title: string;
    description: string;
    country: string;
    custom_url: string;
    youtube_created_at: Date;
    thumbnails: {
        [key: string]: {
            [key: string]: string | number;
        };
    };
    statistics: {
        [key: string]: string | boolean;
    };
    status: {
        [key: string]: string | boolean;
    };
}
export interface rawYoutubeVideo {
    kind: string;
    etag: string;
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            [key: string]: string | number;
        };
        channelTitle: string;
        type: string;
        groupId: string;
    };
    contentDetails: {
        upload: {
            videoId: string;
        };
    };
}
export interface formatedYoutubeVideo {
    video_id: string;
    youtube_created_at: string;
    youtube_channel_id: string;
    title: string;
    description: string;
    thumbnails: string;
    video_url: string;
    video_embed: string;
}
export interface youtubeParams {
    method: string;
    headers: {
        [key: string]: string;
    };
}
