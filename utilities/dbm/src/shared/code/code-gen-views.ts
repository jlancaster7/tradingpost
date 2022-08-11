import { Entity, EntityField, EntityView } from "../interfaces/Entity";
import { $request, $userProperty, prefixes } from "./code-gen-config";
import { dataTableName, dropAndMakeFunction, getUserId, resolveSchema } from "./code-gen-util";


export const spliKeyInfo = (entityName: string, field: EntityField, fields: EntityField[], priveLetter?: string) => {


    const [view, key, splitKey = fields.find(f => f.PK)?.name] = field.calc?.split("|") || [];
    //HACKY
    entityName = entityName || view.split("_").filter((v, i, a) => i <= a.length - 2).join("_")
    const userIdField = getUserId(entityName);
    //const userProperty = `(${$request}->>'user_id')::UUID`;
    const privClause = field.private ? ` and ${priveLetter || "t"}.${userIdField} = ${$userProperty}` : "";

    return {
        view,
        entityName,
        userIdField,
        $userProperty,
        key,
        splitKey,
        privClause
    }
}
export const makeViewStatement = (entityName: string, tableName: string, view: EntityView, fieldMap: Record<string, EntityField>, _fields: EntityField[], isTemp: boolean) => {

    const tempPrefix = resolveSchema(isTemp);
    //
    return `SELECT ${view.fieldNames.filter((fn) => fieldMap[fn]).map(
        fn => {
            const field = fieldMap[fn];
            if (field) {
                const { view, key, privClause, splitKey } = spliKeyInfo(entityName, field, _fields, "");
                switch (field.calcType) {
                    case "count":
                        return `(SELECT count(*) FROM ${tempPrefix}.view_${view}(${$request}) as t WHERE t."${key}"=d."${splitKey}"${privClause}) as "${fn}"`;
                    case "exists":
                        return `EXISTS(SELECT * FROM ${tempPrefix}.view_${view}(${$request}) as t WHERE t.${key}=d."${splitKey}"${privClause}) as "${fn}"`;
                    case "json":
                        return `(SELECT json_agg(t) FROM ${tempPrefix}.view_${view}(${$request}) as t WHERE t.${key}=d."${splitKey}"${privClause}) as "${fn}"`;
                    case "inline":
                        return `(${field.calc}) as "${fn}"`;
                    default:
                        return field.private ? `CASE WHEN d.${getUserId(entityName)} = (${$request}->>'user_id')::UUID THEN d."${fn}" END as "${fn}"` : 'd."' + fn + '"';
                }
            }
            else
                return fn
        }).join(", ")
        } FROM ${tableName} as d`;
}


export const makeViewDef = (entity: Entity, views: EntityView[], validFields: EntityField[], fieldMap: Record<string, EntityField>, isTest: boolean) => {
    const viewDef: Record<string, { fieldNames: string[], definition: string }> = {}
    views.forEach(v => {
        if (v.fieldNames.length) {
            const viewSelect = makeViewStatement(entity.name, dataTableName({
                entityFields: [],
                entityName: entity.name,
                isTest,
                tableNameOverride: entity.definition?.tableNameOverride || "",
                prefixOverride: ""
            }), v, fieldMap, validFields, isTest);
            viewDef[v.name] = {
                fieldNames: v.fieldNames,
                definition:
                    dropAndMakeFunction(
                        {
                            //This is not a mistake
                            entityName: v.name,
                            tableNameOverride: entity.definition?.tableNameOverride || "",
                            entityFields: v.fieldNames.map(fn => fieldMap[fn]).filter(f => f) as EntityField[],
                            prefixOverride: "view",
                            isTest
                        },
                        
                        "", {
                        body: `RETURN QUERY ${viewSelect}`
                    })
            }
        }
    }
    );
    return viewDef;
}