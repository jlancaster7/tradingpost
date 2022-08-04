import { EntityApiBase } from "../static/EntityApiBase";
export declare class Extension {
    constructor(baseApi: EntityApiBase<any, any, any, any>);
    protected baseApi: EntityApiBase<any, any, any, any>;
    protected _defaultPostRequest: <S>(s: S) => RequestInit;
    protected _makeFetch: <S, T = S>(methodName: keyof typeof this, requestInit: S extends undefined ? (settings?: S | undefined) => RequestInit : (settings: S) => RequestInit) => S extends undefined ? (settings?: S | undefined) => Promise<T> : (settings: S) => Promise<T>;
}
export default Extension;
declare type EnsuredServerType<T, ExplictBody = void> = {
    [P in keyof T]: T[P] extends (s: infer InferredBody) => Promise<infer R> ? (req: {
        body: ExplictBody extends void ? InferredBody : ExplictBody;
        extra: {
            userId: string;
        };
    }) => Promise<R> : never;
};
export declare const ensureServerExtensions: <T>(defs: EnsuredServerType<T, void>) => EnsuredServerType<T, void>;
