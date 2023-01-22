import { ISecurityPrices } from "../interfaces/index";
declare const _default: {
    list: (req: {
        body: undefined;
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<import("../static/interfaces").ISecurityList[]>;
    quickadd: (req: {
        body: {
            ticker: string;
            add: boolean;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<void>;
    getPrices: (req: {
        body: {
            securityId: number;
            includeIntraday: boolean;
            includeHistorical: boolean;
        };
        extra: {
            userId: string;
            page?: number | undefined;
            limit?: number | undefined;
        };
    }) => Promise<ISecurityPrices>;
} & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number | undefined;
        limit?: number | undefined;
    }) => Promise<void>) | undefined;
};
export default _default;
