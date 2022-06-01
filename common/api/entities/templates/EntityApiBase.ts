const apiBaseUrl = "http://10.0.0.94:8082";
type ValidationErrorData<T> = Record<Partial<keyof T>, string>;


export const apiUrl = (...paths: (string | number | undefined)[]) => {
    return `${apiBaseUrl}/alpha` + (paths.length ? "/" + paths.join("/") : "");
}

export abstract class EntityApiBase<TGet, TList, TInsert, TUpdate> {
    protected abstract updateFunction: string;
    protected abstract insertFunction: string;
    //abstract deleteFunction: string;
    protected abstract getFunction: string;
    protected abstract listFunction: string;
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
            method: "GET"
        });
        return EntityApiBase.handleFetchResponse<TGet>(resp);
    }
    async list() {
        const resp = await fetch(this.makeUrl(), {
            method: "GET"
        });
        return EntityApiBase.handleFetchResponse<TList[]>(resp);
    }

    async insert(item: TInsert) {
        const resp = await fetch(this.makeUrl(), {
            method: "POST",
            body: JSON.stringify(item),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await EntityApiBase.handleFetchResponse<TGet>(resp)
    }
    async update(id: string | number, item: TUpdate) {
        const resp = await fetch(this.makeUrl(id), {
            method: "POST",
            body: JSON.stringify(item),
            headers: {
                'Content-Type': 'application/json'
            }
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

