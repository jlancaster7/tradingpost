declare type ValidationErrorData<T> = Record<Partial<keyof T>, string>;
export declare class PublicError extends Error {
    statusCode: number;
    constructor(msg: Error["message"], code?: number);
}
export declare const apiUrl: (...paths: (string | number | undefined)[]) => string;
export declare abstract class EntityApiBase<TGet, TList, TInsert, TUpdate> {
    protected abstract updateFunction: string;
    protected abstract insertFunction: string;
    protected abstract getFunction: string;
    protected abstract listFunction: string;
    static token: string;
    static makeHeaders<T>(): {
        'Content-Type': string;
        Authorization: string;
    };
    static handleFetchResponse<T>(resp: Response): Promise<T>;
    makeUrl: (id?: string | number | undefined) => string;
    get(id: string | number): Promise<TGet>;
    list(): Promise<TList[]>;
    insert(item: TInsert): Promise<TGet>;
    update(id: string | number, item: TUpdate): Promise<TGet>;
    validate(isInsert: boolean): (ValidationErrorData<TGet> | null);
}
export {};
