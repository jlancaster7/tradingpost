import {DateTime} from "luxon";

export interface SubstackUser {
    substack_user_id: string,
    title: string,
    description: string,
    link: string,
    language: string,
    email: string,
    image: {
        link: string,
        url: string,
        title: string
    },
    itunes?: {
        owner: {
            name: string, email: string
        },
        author: string
    },
    last_build_date: Date
}

export interface SubstackFeed {
    items: { [key: string]: string }[],
    feedUrl: string,
    image: {
        link: string,
        url: string,
        title: string
    },
    paginationLinks: {
        self: string
    },
    title: string,
    description: string,
    webMaster: string,
    generator: string,
    link: string,
    language: string,
    lastBuildDate: string,
    itunes: {
        owner: {
            name: string, email: string
        },
        author: string
    },
    username: string
}

export interface SubstackArticles {
    substack_user_id: string,
    creator: string,
    title: string,
    link: string,
    substack_created_at: Date,
    content_encoded: string,
    content_encoded_snippet: string,
    enclosure: string,
    dc_creator: string,
    content: string,
    content_snippet: string,
    article_id: string,
    itunes: string
    aspect_ratio: number
    max_width: number
}

export interface SubstackAndNewsletter {
    substack_user_id: string
    article_id: string
    creator: string
    title: string
    link: string
    content_encoded: string
    content_encoded_snippet: string
    enclosure: object
    dc_creator: string
    itunes: object
    content: string
    content_snippet: string
    substack_article_created_at: DateTime
    tradingpost_substack_article_created_at: DateTime
    newsletter_title: string
    newsletter_description: string
    newsletter_link: string
    newsletter_language: string
    newsletter_email: string
    newsletter_image: {
        url: string
        link: string
        title: string
    }
    newsletter_itunes: object
    last_newsletter_build_date: DateTime
    substack_added_to_tradingpost_date: DateTime
    maxWidth: number
    aspectRatio: number
    tradingpostUserId: string
    tradingpostUserHandle: string
    tradingpostUserEmail: string
    tradingpostProfileUrl: string
}

export interface SubstackAndNewsletterTable extends SubstackAndNewsletter {
    id: number
    created_at: DateTime
}