export const $request = "request";
export const $userProperty = `(${$request}->>'user_id')::UUID`;
export const schemas = {
    TEMP: "pg_temp",
    DEFAULT: "public"
}

export const prefixes = {
    API: "api",
    DATA: "data"
}

export const functionNames = {
    INSERT: "insert",
    UPDATE: "update",
    LIST: "list",
    GET: "get"
}
export const dtExchange: Record<string, string> = {
    "bigserial": "BIGINT",
    "timestamptz":"TIMESTAMP WITH TIME ZONE",
    "MONEY":"decimal"
}


export function dtExchanger(type?: string) {
    return dtExchange[type?.toLowerCase() || ""] || type || "";
}