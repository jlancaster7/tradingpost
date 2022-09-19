import { number } from "mathjs"
import { PriceInfo } from "../../cache"
import { IUserList, IWatchlistList } from "../interfaces"

export interface ISecurityGet {
    id: number,
    symbol: string,
    company_name: string
    exchange: string,
    industry: string
    description: string,
    logo_url: string
    price: PriceInfo["price"]| null,
    week_52_high: number,
    week_52_low: number,
    isOnQuickWatch?:boolean
}

export interface ISecurityList {
    id: number,
    symbol: string,
    security_name: string
    company_name: string
    logo_url: string
    is_benchmark: boolean
}

export interface IAnalystProfile {
    investment_strategy: string,
    portfolio_concentration: number,
    benchmark: string
    interests: string[]
}

export interface IElasticResponse {
    hits: IElasticPost[]
}

export interface IElasticPost {
    _index: string,
    _id: string,
    _score: number,
    _source: {
        id: string,
        content: {
            body: string,
            description: string,
            htmlBody: string,
            htmlTitle: string | null,
            title: string | null
        },
        imageUrl: null,
        meta: {},
        platform: {
            displayName: string,
            imageUrl: string,
            profileUrl: string,
            username: string
        }
        ,
        platformCreatedAt: string,
        platformUpdatedAt: null,
        postType: 'tweet' | 'spotify' | 'substack' | 'youtube',
        postTypeValue: number,
        postUrl: string,
        ratingsCount: 0,
        tradingpostCreatedAt: string,
        tradingpostUpdatedAt: null,
        size: {
            maxWidth: number,
            aspectRatio: number
        },
        user: {
            id: string,
        }
    }
}

export type IElasticPostExt = IElasticPost & {
    ext: {
        user?: IUserList,
        is_bookmarked?: boolean,
        is_upvoted?: boolean
    }
}

export type AllWatchlists = { quick: IWatchlistList, created: IWatchlistList[], saved: IWatchlistList[] }