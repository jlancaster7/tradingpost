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