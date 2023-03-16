import { ICommentList } from "../interfaces";
export interface ICommentPlus extends ICommentList {
    created_at: Date;
    updated_at: Date;
    handle: string;
    display_name: string;
    profile_url: string;
    subscription: {
        [key: string]: string;
    };
}
declare const _default: {
    postList: (req: {
        body: {
            type: string;
            id: string;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<ICommentPlus[]>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
