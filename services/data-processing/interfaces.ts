import {DateTime} from 'luxon';

export interface YouTubeChannelInformation {
    id: string
    title: string
    description: string
    country: string
    customUrl: string
    publishedDate: DateTime
    thumbnails: object
    statistics: object
    status: object
}