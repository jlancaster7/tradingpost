import { EntityField } from "../interfaces/Entity";
import { $request, $userProperty, dtExchange, dtExchanger, prefixes, schemas } from "./code-gen-config";

export type FunctionSettings = {
    entityName: string,
    tableNameOverride: string,
    entityFields: EntityField[],
    prefixOverride?: string,
    isTest: boolean
}

export type Defs = {
    table: string
    views: string,
    interfaces: string,
    functions: string,
    api: string
}

export const getUserId = (entityName: string) => {
    return entityName === "user" ? "id" : "user_id";
}


export const resolveSchema = (isTest: boolean) => isTest ? schemas.TEMP : schemas.DEFAULT;
export const returnSelectQuery = (tableAlias: string, settings: FunctionSettings, viewSuffix: string, clause?: string) => {
    const keyName = getKey(settings)?.name;
    return `return query SELECT * FROM ${resolveSchema(settings.isTest)}.view_${settings.entityName}_${viewSuffix}(${$request}) as ${tableAlias} ${clause ? "WHERE " + clause : ""}`

}
export const createSqlFunctionName = (schema: string, prefix: string, entityName: string, functionName: string) =>
    `${schema}.${prefix}_${entityName}${(functionName ? `_${functionName}` : "")}`;

export const dataTableName = (settings: FunctionSettings) => `${resolveSchema(settings.isTest)}.${(settings.tableNameOverride || `${prefixes.DATA}_${settings.entityName}`)}`;

export const isSplitCalc = (calcType: string) => {
    return calcType === "count" || calcType === "json" || calcType === "exists"
}
export const getKey = (settings: FunctionSettings) => settings.entityFields.find((f) => f.PK);

export const dropAndMakeFunction = (settings: FunctionSettings, functionName: string, content: {
    declare?: Record<string, string>, body: string
}, fieldNames?: string[]) => {
    const schema = settings.isTest ? schemas.TEMP : schemas.DEFAULT
    const fullFunctionName = createSqlFunctionName(schema, settings.prefixOverride || prefixes.API, settings.entityName, functionName);

    return `
    DROP FUNCTION IF EXISTS ${fullFunctionName}(jsonb);
  
    CREATE OR REPLACE FUNCTION ${fullFunctionName}(
        request jsonb)
        RETURNS TABLE(${(fieldNames ? fieldNames.map((fn) => settings.entityFields.find(f => f.name === fn)) : settings.entityFields).filter(f => f).map(f => `"${f?.name}" ${dtExchange[f?.dataType.toLowerCase() || ""] || f?.dataType}`).join(",")})
        LANGUAGE 'plpgsql'
    AS $BODY$
    ${content.declare ? "DECLARE\r\n" + Object.keys(content.declare).map(k => `${k} ${content.declare?.[k]};`).join("\r\n") : ""}
    BEGIN
  ${content.body};
    END;
    $BODY$;`
}

export const $dataProperty = (fieldName: string, dataType: string) => `(${$request}->'data'->>'${fieldName}')::${dataType}`;

export const fieldNames = (fields: EntityField[], includeSettings: {
    key: boolean, virtual: boolean, nullable: boolean
}, asRequest?: boolean,
    //hackyyyyy
    privateToUUID?: string[]
) => fields.filter((f) => {
    return (includeSettings.key || !f.PK) && (includeSettings.virtual || !f.calcType) && (includeSettings.nullable || !f.nullable)
}).map((f) => asRequest ?
    (privateToUUID && privateToUUID.find(n => n === f.name) ? $userProperty : $dataProperty(f.name, f.dataType))
    : f.name)

export const whereKeyMatches = (tableAlias: string, settings: FunctionSettings) => {
    const key = getKey(settings);
    return key ? `${tableAlias}."${key?.name}" = ${$dataProperty(key?.name || "", dtExchanger(key?.dataType))}` : undefined;
}

export const ensurePascalCase = (name: string) => name.split("_").map((s, i) => s[0].toUpperCase() + s.substring(1)).join("");
export const ensureCamelCase = (name: string) => name.split("_").map((s, i) => i ? s[0].toUpperCase() + s.substring(1) : s[0].toLowerCase() + s.substring(1)).join("");
export const ensureSnake = (text: string) => {
    if (text) {
        const lastChar = text.charAt(text.length - 1);
        if (/[A-Z]/.test(lastChar)) {
            text = text.substring(0, text.length - 1) + "_" + lastChar.toLocaleLowerCase();
        }
        return text.toLowerCase().replaceAll(" ", "_");
    }
    else
        return text
}


export const isReadOnly = (field: EntityField) => field.calc === "count" || field.calc === "inline" || field.readOnly;