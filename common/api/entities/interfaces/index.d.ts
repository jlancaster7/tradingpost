import * as Statics from '../static/interfaces';
export interface IAlertList {
    id: number;
    data: any;
    type: string;
    user_id: string;
}
export interface IAlertGet {
}
export interface IBookmarkList {
    user_id: string;
    post_id: string;
    id: number;
}
export interface IBookmarkGet {
    id: number;
    post_id: string;
    user_id: string;
}
export interface ICommentList {
    id: number;
    related_type: string;
    related_id: string;
    comment: string;
    user_id: string;
}
export interface ICommentGet {
    comment: string;
    id: number;
    related_type: string;
    related_id: string;
    user_id: string;
}
export interface ICommentInsert {
    related_type: string;
    related_id: string;
    comment: string;
    user_id: string;
}
export interface IIbkrList {
}
export interface IIbkrGet {
}
export interface IPlatformClaimList {
    platform: string;
    claims?: any;
    id: number;
    user_id: string;
    platform_user_id: string;
}
export interface IPlatformClaimGet {
    platform: string;
    claims?: any;
    id: number;
    user_id: string;
}
export interface IPostList {
    id: number;
    body: string;
    upvoted_count: number;
    subscription_level: string;
    user: IUserList[];
    comment_count: number;
    title: string;
    max_width?: number;
    aspect_ratio?: number;
}
export interface IPostGet {
    id: number;
    subscription_level: string;
    body: string;
    upvoted_count: number;
    user: IUserList[];
    comment_count: number;
    title: string;
    aspect_ratio?: number;
    max_width?: number;
}
export interface ISubscriberList {
    subscription_id: number;
    user_id: string;
    start_date: Date;
    due_date?: Date;
    months_subscribed: string;
    payment_source: string;
    id: number;
    subscription: ISubscriptionGet[];
    user: IUserList[];
    approved: boolean;
}
export interface ISubscriberGet {
    id: number;
    subscription_id: number;
    start_date: Date;
    user_id: string;
    due_date?: Date;
    payment_source: string;
    months_subscribed: string;
    subscription: ISubscriptionGet[];
    user: IUserList[];
    approved: boolean;
}
export interface ISubscriberInsert {
    id: number;
    subscription_id: number;
    user_id: string;
    start_date: Date;
    approved: boolean;
}
export interface ISubscriberUpdate {
    id?: number;
    subscription_id?: number;
    approved?: boolean;
}
export interface ISubscriptionList {
    id: number;
    user_id: string;
    name: string;
    cost: number;
    user: IUserList[];
}
export interface ISubscriptionGet {
    id: number;
    settings?: any;
    cost: number;
    name: string;
    user_id: string;
    user: IUserList[];
}
export interface ISubscriptionInsert {
    name: string;
    settings?: any;
    cost: number;
    user_id: string;
}
export interface ISubscriptionUpdate {
    name?: string;
    settings?: any;
    id?: number;
    cost?: number;
    user_id?: string;
}
export interface ITradeList {
}
export interface ITradeGet {
}
export interface IUpvoteList {
    post_id: string;
    user_id: string;
    id: number;
}
export interface IUpvoteGet {
    id: number;
    user_id: string;
    post_id: string;
}
export interface IUserList {
    id: string;
    handle: string;
    tags: string[];
    display_name: string;
    profile_url?: string;
    subscription: {
        cost: string;
        id: number;
        is_subscribed: boolean;
        count: number;
        settings: any;
        is_pending: boolean;
    };
    social_analytics?: any;
}
export interface IUserGet {
    handle: string;
    email: string;
    claims: IPlatformClaimList[];
    bio: string;
    tags: string[];
    id: string;
    display_name: string;
    first_name: string;
    last_name: string;
    profile_url?: string;
    banner_url?: string;
    analyst_profile?: Statics.IAnalystProfile;
    subscription: {
        cost: string;
        id: number;
        is_subscribed: boolean;
        count: number;
        settings: any;
        is_pending: boolean;
    };
    settings?: Statics.IUserSettings;
    social_analytics?: any;
}
export interface IUserUpdate {
    id?: string;
    first_name?: string;
    last_name?: string;
    analyst_profile?: Statics.IAnalystProfile;
    has_profile_pic?: boolean;
    profile_url?: string;
    settings?: Statics.IUserSettings;
    banner_url?: string;
    bio?: string;
    social_analytics?: any;
}
export interface IWatchlistList {
    id: number;
    name: string;
    note?: string;
    user: IUserList[];
    type: string;
    user_id?: string;
    item_count: number;
    saved_by_count: number;
}
export interface IWatchlistGet {
    user: IUserList[];
    items: IWatchlistItemInsert[];
    note?: string;
    name: string;
    id: number;
    type: string;
    saved_by_count: number;
    is_saved: boolean;
}
export interface IWatchlistInsert {
    name: string;
    note?: string;
    items: Omit<IWatchlistItemInsert, 'watchlist_id' | 'id'>[];
    type: string;
    user_id?: string;
}
export interface IWatchlistUpdate {
    id?: number;
    name?: string;
    note?: string;
    items?: Omit<IWatchlistItemInsert, 'watchlist_id' | 'id'>[];
    type?: string;
    user_id?: string;
}
export interface IWatchlistItemList {
    id: number;
    symbol: string;
    watchlist_id: number;
    note?: string;
    date_added: Date;
}
export interface IWatchlistItemGet {
    id: number;
    symbol: string;
    watchlist_id: number;
    note?: string;
    date_added?: Date;
}
export interface IWatchlistItemInsert {
    symbol: string;
    watchlist_id: number;
    note?: string;
    id: number;
}
export interface IWatchlistSavedList {
    id: number;
    user_id: string;
    watchlist_id: number;
}
export interface IWatchlistSavedGet {
}
export interface ISecurityPrices {
    historical: {
        high: number;
        low: number;
        open: number;
        close: number;
        date: string;
    }[];
    intraday: {
        high: number;
        low: number;
        open: number;
        close: number;
        date: string;
    }[];
}
export declare type ListAlertsResponse = {
    id: number;
    type: string;
    dateTime: string;
    seen: boolean;
    data: Record<string, any>;
};
export declare type ListTradesResponse = {
    id: number;
    dateTime: string;
    price: string;
    type: string;
    handle: string;
    symbol: string;
};
export * from '../static/interfaces';
