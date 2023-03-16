declare const _default: {
    getAllWatchlists: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<import("../interfaces").AllWatchlists>;
    saveWatchlist: (req: {
        body: {
            id: number;
            is_saved: boolean;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<{
        id: number;
        is_saved: boolean;
    }>;
    toggleNotification: (req: {
        body: {
            id: number;
            is_notification: boolean;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<boolean>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
