import { DateTime } from 'luxon';

export type TradingPostsAndUsers = {
    user_id: string,
    subscription_level: string,
    title: string,
    body: string,
    tradingpost_user_handle: string,
    tradingpost_user_email: string,
    tradingpost_user_profile_url: string,
}
export type TableInfo = {
    id: number,
    created_at: DateTime,
    updated_at: DateTime
}

export type TradingPostsAndUsersTable = TradingPostsAndUsers & TableInfo