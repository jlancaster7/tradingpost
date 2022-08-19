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