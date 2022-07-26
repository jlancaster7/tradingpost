import { EntityApiBase } from "../static/EntityApiBase";
export declare class Extension {
    protected baseApi: EntityApiBase<any, any, any, any>;
    constructor(baseApi: EntityApiBase<any, any, any, any>);
    protected _makeFetch: <S, T = any>(methodName: keyof typeof this, requestInit: (settings: S) => RequestInit) => (settings: S) => Promise<T>;
}
export default Extension;
export declare const ensureServerExtensions: <T>(defs: Record<keyof T, (req: {
    body: any;
    extra: {
        userId: string;
    };
}) => Promise<any>>) => Record<keyof T, (req: {
    body: any;
    extra: {
        userId: string;
    };
}) => Promise<any>>;
