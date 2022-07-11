import {DateTime} from "luxon";

export type Message = {
    title?: string
    body?: string
    imageUrl?: string
}

export type UserDevice = {
    userId: string
    deviceId: string
    provider: "Apple" | "Android" | "Web"
    updatedAt: DateTime
    createdAt: DateTime
}

export type MessageOptions = {
    analyticsLabel?: string
}