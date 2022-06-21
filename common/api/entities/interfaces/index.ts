export interface IAlertList {
        id: number,
    data: any,
    type: string,
    user_id: string
    };

export interface IAlertGet {
    
    };

export interface IBookmarkList {
    
    };

export interface IBookmarkGet {
        id: number,
    post_id: number,
    user_id: string
    };

export interface ICommentList {
        id: number,
    related_type: string,
    related_id: string,
    comment: string
    };

export interface ICommentGet {
        comment: string,
    id: number,
    related_type: string,
    related_id: string
    };

export interface IPlatformClaimList {
        platform: string,
    handle: string,
    claims?: any,
    id: number,
    user_id: string
    };

export interface IPlatformClaimGet {
        platform: string,
    handle: string,
    claims?: any,
    id: number,
    user_id: string
    };

export interface IPostList {
        id: number,
    platform_post_url: string,
    platform: string,
    body: any,
    upvoted_count: number,
    is_upvoted: unknown,
    is_bookmarked: unknown,
    subscription_level: string,
    user: IUserList[]
    };

export interface IPostGet {
        id: number,
    subscription_level: string,
    platform: string,
    platform_post_url: string,
    body: any,
    upvoted_count: number,
    is_upvoted: unknown,
    is_bookmarked: unknown,
    user: IUserList[]
    };

export interface ISubscriberList {
        subscription_id: number,
    user_id: string,
    start_date: unknown,
    due_date: unknown,
    months_subscribed: string,
    payment_source: string,
    id: number
    };

export interface ISubscriberGet {
        id: number,
    subscription_id: number,
    start_date: unknown,
    user_id: string,
    due_date: unknown,
    payment_source: string,
    months_subscribed: string
    };

export interface IUpvoteList {
    
    };

export interface IUpvoteGet {
        id: number,
    user_id: string,
    post_id: number
    };

export interface IUserList {
        id: string,
    handle: string,
    tags: string[],
    display_name: string,
    profile_url?: string
    };

export interface IUserGet {
        handle: string,
    email: string,
    claims: IPlatformClaimList[],
    bio: string,
    tags: string[],
    id: string,
    display_name: string,
    first_name: string,
    last_name: string,
    profile_url?: string,
    banner_url?: string
    };