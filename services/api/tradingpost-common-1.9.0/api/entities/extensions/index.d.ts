import { EntityApiBase } from "../static/EntityApiBase";
export declare class Extension {
    constructor(baseApi: EntityApiBase<any, any, any, any>);
    protected baseApi: EntityApiBase<any, any, any, any>;
    protected _defaultPostRequest: <S>(s: S) => RequestInit;
    protected _makeFetch: <S, T = S>(methodName: keyof typeof this, requestInit: S extends undefined ? (settings?: S | undefined) => RequestInit : (settings: S) => RequestInit) => S extends undefined ? (settings?: S | undefined) => Promise<T> : (settings: S) => Promise<T>;
    protected _makePagedFetch: <S, T = S>(methodName: keyof typeof this, requestInit: S extends undefined ? (settings?: S | undefined) => RequestInit : (settings: S) => RequestInit) => S extends undefined ? (req: {
        page: number;
    }) => Promise<T> : (req: {
        $page: number;
        $limit?: number | undefined;
        settings: S;
    }) => Promise<T>;
}
export default Extension;
type EnsuredServerType<T, ExplictBody = void> = {
    [P in keyof T]: T[P] extends (s: infer InferredBody) => Promise<infer R> ? (req: {
        body: ExplictBody extends void ? (InferredBody extends {
            $page: number;
            settings: infer SettingsType;
        } ? SettingsType : InferredBody) : ExplictBody;
        extra: {
            userId: string;
            page?: number;
            limit?: number;
        };
    }) => Promise<R> : never;
};
export declare const ensureServerExtensions: <T>(defs: EnsuredServerType<T, void> & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number;
        limit?: number;
    }) => Promise<void>) | undefined;
}) => EnsuredServerType<T, void> & {
    get?: ((i: any, extra: {
        userId: string;
        page?: number;
        limit?: number;
    }) => Promise<void>) | undefined;
};
