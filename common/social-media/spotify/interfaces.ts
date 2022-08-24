import {DateTime} from "luxon";

export interface spotifyParams {
    method: string,
    headers: {
        Authorization: string,
        'Content-Type': string
    },
    body?: string
}

export interface spotifyShow {
    spotify_show_id: string,
    name: string,
    description: string,
    explicit: boolean,
    html_description?: string,
    is_externally_hosted?: string,
    media_type?: string,
    publisher: string,
    copyrights: string[] | string,
    total_episodes: number,
    languages: string[] | string,
    external_urls: { [key: string]: string } | string,
    images: { [key: string]: string | number } | string
}

export interface rawSpotifyShow extends spotifyShow {
    available_markets: string[],

    episodes: { [key: string]: any | any[] },
    type: string,
    uri: string
}

export interface spotifyEpisode {
    spotify_episode_id: string
    spotify_show_id: string
    audio_preview_url: string
    description: string
    duration_ms: number
    explicit: boolean
    external_urls: string
    href: string
    html_description: string
    id: string
    images: string
    embed: string
    is_externally_hosted: boolean
    is_playable: boolean
    language: string
    languages: string
    name: string
    release_date: Date
    release_date_precision: string
    type: string
    uri: string
    aspect_ratio: number
    max_width: number
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