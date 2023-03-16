import { ISubscriptionGet } from "../interfaces";
declare const _default: {
    getByUserId: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<ISubscriptionGet | null>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
