import { Entity, TableDefs } from './shared/interfaces/Entity'
const fetchDatabaseApi = async <R>(proc: string, body?: string) => {

    const resp = await fetch(`/api/database/${proc}`,
        {
            method: "post",
            body,
            headers: {
                "content-type": "application/json"
            }
        });
    if (resp.ok) {
        return await resp.json() as R;
    }
    else {
        throw new Error((await resp.json()).message)
    }
}

export const listEntity = async () => {
    return await fetchDatabaseApi<Entity[]>("listEntity");
}

export const createEntity = async (name: string) => {
    const bod = JSON.stringify({ name });
    return await fetchDatabaseApi<Entity[]>("createEntity", bod);
}

export const updateEntity = async (entity: Entity) => {
    const bod = JSON.stringify(entity);
    return await fetchDatabaseApi<Entity[]>("updateEntity", bod);
}

// export const getCode = async (entity: Entity) => {
//     const bod = JSON.stringify(entity);
//     return await fetchDatabaseApi<Entity[]>("getCode", bod);
// }
export type DiffErr = { type: string, entityname: string, columnname: string, message: string, name: string, context: string, detail: string };

export const createSQLDiff = async (runTest?: boolean) => {
    const bod = JSON.stringify({ runTest });
    return await fetchDatabaseApi<DiffErr[] | undefined>("createSQLDiff", bod);
}
export const getTableDefs = async () => {
    return await fetchDatabaseApi<TableDefs[]>("getTableDefinitions");
}
export const updateServer = async () => {
    return await fetchDatabaseApi<{}>("updateServer");
}

