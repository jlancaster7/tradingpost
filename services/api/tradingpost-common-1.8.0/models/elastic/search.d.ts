import { DateTime } from "luxon";
export interface SearchBody {
    id: string;
    user: {
        imageUrl: string | null;
        id: string | null;
        name: string | null;
        username: string | null;
        type: string | null;
    };
    ratingsCount: number | null;
    postType: string | null;
    subscription_level: string | null;
    postTypeValue: number;
    imageUrl: string | null;
    postUrl: string | null;
    platform: {
        username: string | null;
        displayName: string | null;
        profileUrl: string | null;
        imageUrl: string | null;
    };
    content: {
        title: string | null;
        htmlTitle: string | null;
        body: string | null;
        htmlBody: string | null;
        description: string | null;
    };
    size: {
        maxWidth: number;
        aspectRatio: number;
    };
    platformUpdatedAt: DateTime | null | string;
    tradingpostUpdatedAt: DateTime | null | string;
    platformCreatedAt: DateTime | null | string;
    tradingpostCreatedAt: DateTime | null | string;
    meta: object | null;
}
