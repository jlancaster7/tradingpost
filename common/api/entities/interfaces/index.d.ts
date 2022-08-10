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
}
export interface ICommentGet {
    comment: string;
    id: number;
    related_type: string;
    related_id: string;
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
    platform_post_url: string;
    platform: string;
    body: any;
    upvoted_count: number;
    is_upvoted: boolean;
    is_bookmarked: boolean;
    subscription_level: string;
    user: IUserList[];
}
export interface IPostGet {
    id: number;
    subscription_level: string;
    platform: string;
    platform_post_url: string;
    body: any;
    upvoted_count: number;
    is_upvoted: boolean;
    is_bookmarked: boolean;
    user: IUserList[];
}
export interface ISubscriberList {
    subscription_id: number;
    user_id: string;
    start_date: unknown;
    due_date: unknown;
    months_subscribed: string;
    payment_source: string;
    id: number;
}
export interface ISubscriberGet {
    id: number;
    subscription_id: number;
    start_date: unknown;
    user_id: string;
    due_date: unknown;
    payment_source: string;
    months_subscribed: string;
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
}
export interface IUserUpdate {
    id?: string;
    first_name?: string;
    last_name?: string;
    analyst_profile?: Statics.IAnalystProfile;
    has_profile_pic?: boolean;
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
    items: IWatchlistItemList[];
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
    items: Omit<IWatchlistItemList, 'watchlist_id' | 'id'>[];
    type: string;
    user_id?: string;
}
export interface IWatchlistUpdate {
    id?: number;
    name?: string;
    note?: string;
    items?: Omit<IWatchlistItemList, 'watchlist_id' | 'id'>[];
    type?: string;
    user_id?: string;
}
export interface IWatchlistItemList {
    id: number;
    symbol: string;
    watchlist_id: number;
    note?: string;
}
export interface IWatchlistItemGet {
    id: number;
    symbol: string;
    watchlist_id: number;
    note?: string;
}
export interface IWatchlistSavedList {
    id: number;
    user_id: string;
    watchlist_id: number;
}
export interface IWatchlistSavedGet {
}
export * from '../static/interfaces';
