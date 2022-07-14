let apiBaseUrl = process.env.API_BASE_URL || "http://localhost:8082";
let versionCode = process.env.API_VERSION_CODE || "alpha"


export const configApi = (settings: { versionCode?: string, apiBaseUrl?: string }) => {
    apiBaseUrl = settings.apiBaseUrl || apiBaseUrl;
    versionCode = settings.versionCode || versionCode;
}

type ValidationErrorData<T> = Record<Partial<keyof T>, string>;

export class PublicError extends Error {
    statusCode: number
    constructor(msg: Error["message"], code = 400) {
        super(msg);
        this.statusCode = code;
    }
}

export const apiUrl = (...paths: (string | number | undefined)[]) => {
    return `${apiBaseUrl}/${versionCode}` + (paths.length ? "/" + paths.join("/") : "");
}

export abstract class EntityApiBase<TGet, TList, TInsert, TUpdate> {
    protected abstract updateFunction: string;
    protected abstract insertFunction: string;
    //abstract deleteFunction: string;
    protected abstract getFunction: string;
    protected abstract listFunction: string;

    static token: string

    static makeHeaders<T>() {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        }
    }

    static async handleFetchResponse<T>(resp: Response) {
        if (resp.headers.get('Content-Type')?.split(';')[0] !== 'application/json')
            throw new Error(`Unsupported Content-Type from Response ${resp.headers.get('Content-Type')}`)

        const data = await resp.json();
        if (resp.ok)
            return data as T;
        else
            throw data;
    }

    makeUrl = (id?: string | number) => apiUrl(...(id === undefined ? [this.constructor.name] : [this.constructor.name, id]));
    //`${this.constructor.name}${(id !== undefined ? "/" + id : "")}`
    //assumes fetch exists globally
    async get(id: string | number) {
        const resp = await fetch(this.makeUrl(id), {
            method: "GET",
            headers: EntityApiBase.makeHeaders()
        });
        return EntityApiBase.handleFetchResponse<TGet>(resp);
    }
    async list() {
        const resp = await fetch(this.makeUrl(), {
            method: "GET",
            headers: EntityApiBase.makeHeaders()
        });
        return EntityApiBase.handleFetchResponse<TList[]>(resp);
    }

    async insert(item: TInsert) {
        const resp = await fetch(this.makeUrl(), {
            method: "POST",
            body: JSON.stringify(item),
            headers: EntityApiBase.makeHeaders()
        });
        return await EntityApiBase.handleFetchResponse<TGet>(resp)
    }
    async update(id: string | number, item: TUpdate) {
        const resp = await fetch(this.makeUrl(id), {
            method: "POST",
            body: JSON.stringify(item),
            headers: EntityApiBase.makeHeaders()
        });
        return EntityApiBase.handleFetchResponse<TGet>(resp)
    }

    validate(isInsert: boolean): (ValidationErrorData<TGet> | null) { return null };

}

// class Test extends EntityApi<any, any, any, any>{
//     updateFunction = "update";
//     insertFunction = "insert"
//     getFunction = "get"
//     listFunction = "list"
//     /***extensions***/
// }

