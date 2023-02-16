import {DateTime} from "luxon";

export enum NotificationSubscriptionTypes {
    WATCHLIST_NOTIFICATION = 'WATCHLIST_NOTIFICATION',
    HOLDINGS_NOTIFICATION = 'HOLDINGS_NOTIFICATION'
}

export interface BulkMessage {
    token: string
    title: string
    body: string
    imageUrl?: string
    provider?: "Android" | "Apple"
    data: Record<string, any>
}

export type Message = {
    title: string
    body: string
    data?: Record<string, any>
    imageUrl?: string
}

export interface BulkMessage {
    token: string
    title: string
    body: string
    imageUrl?: string
    provider?: "Android" | "Apple"
    data: Record<string, any>
}

export type UserDevice = {
    userId: string
    deviceId: string
    provider: "ios" | "android" | "web"
    updatedAt: DateTime
    createdAt: DateTime
    active: boolean
}

export type MessageOptions = {
    analyticsLabel?: string
}

export interface INotificationsRepository {
    getUserDevices(userId: string): Promise<UserDevice[]>

    getUsersDevices(userIds: string[]): Promise<UserDevice[]>

    getUserDeviceByDeviceId(deviceId: string): Promise<UserDevice>

    disableUserDevices(deviceIds: string[]): Promise<void>
}

export type MessageResponse = {
    errors: {
        reason: string
        deviceId: string
        userId: string
    }[]
}

export type MulticastMessageResponse = {
    errors: {
        reason: string
        deviceIds: string[]
        userId: string
    }[]
}

export type TradeNotificationWithSubscriber = {
    securityId: number
    accountId: number
    date: DateTime
    subscriberUserId: string
    subscriberDeviceId: string
    subscriberProvider: string
    subscriberDeviceTimezone: string
    traderUserId: string
}