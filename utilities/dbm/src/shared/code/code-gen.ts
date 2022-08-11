import { Entity, EntityDefinition, EntityField, EntityView, TableDefs } from "../interfaces/Entity"
import { makeApiDef } from "./code-gen-api"
import { dtExchanger, functionNames, prefixes } from "./code-gen-config"
import { makeFunctionDef } from "./code-gen-functions"
import { makeInterfaceDef } from "./code-gen-interfaces"
import { makeTableDef } from "./code-gen-table"
import { makeViewDef } from "./code-gen-views"

//        //"timestamp with time zone"

//will rename on refactor
const dtRemapper = {

}

export const makeEntityDefs = (entity: Entity, deleteFields: Record<string, boolean>, isTest: boolean, existingFields: TableDefs[], allEntities: Entity[]) => {
    const { definition } = entity
    if (definition) {
        const { views: _ogViews = [], fields } = definition,
            views = [..._ogViews],
            validFields = fields?.filter((f) => !deleteFields[f.name] && !f.draft) || [],
            fieldMap: Record<string, EntityField> = {}


        validFields.forEach((f) => {
            fieldMap[f.name] = f;
        });

        const namedViews = tidyUpViews(entity.name, views, fieldMap);

        return {
            table: makeTableDef(entity.name, entity.definition?.tableNameOverride || `${prefixes.DATA}_${entity.name}`, validFields, isTest,
                existingFields.length ? existingFields.map((f) => ({
                    dataType: dtExchanger(f.data_type),
                    name: f.column_name,
                    nullable: f.is_nullable === "YES",
                    PK: Boolean(f.primary_key_data)
                })) : undefined,
                existingFields.find((f) => f.primary_key_data)?.primary_key_data?.constraint_name),
            views: makeViewDef(entity, views, validFields, fieldMap, isTest),
            interfaces: views?.map(v => makeInterfaceDef(v, fields, deleteFields, v === namedViews.UPDATE || v === namedViews.INSERT, v === namedViews.UPDATE)).join("\r\n\r\n") || "",
            fields: fieldMap,
            functions: makeFunctionDef(entity, validFields, isTest, namedViews, { allEntities }),
            api: makeApiDef(entity.name, isTest, {
                get: Boolean(namedViews.GET?.fieldNames.length),
                list: Boolean(namedViews.LIST?.fieldNames.length),
                update: Boolean(namedViews.UPDATE?.fieldNames.length),
                insert: Boolean(namedViews.INSERT?.fieldNames.length)
            })
        }
    } else {
        return null;
    }
}

const tidyUpViews = (entityName: string, views: EntityView[], fieldMap: Record<string, EntityField>) => {
    const prefix = `${entityName.toLowerCase()}_`;
    //clean up view names if needed
    let upsertIndex: number | null = null;

    views.forEach((v, i) => {
        if (!v.name.startsWith(prefix))
            v.name = prefix + v.name;
        if (v.name === prefix + "upsert")
            upsertIndex = i;
    });

    if (upsertIndex) {
        //break out upsert views
        views.splice(upsertIndex, 1,
            { name: `${prefix}${functionNames.INSERT}`, fieldNames: views[upsertIndex].fieldNames.filter((f) => !fieldMap[f].PK) },
            { name: `${prefix}${functionNames.UPDATE}`, fieldNames: views[upsertIndex].fieldNames }
        )
    }
    return {
        GET: views.find(v => v.name === `${prefix}${functionNames.GET}`),
        INSERT: views.find(v => v.name === `${prefix}${functionNames.INSERT}`),
        LIST: views.find(v => v.name === `${prefix}${functionNames.LIST}`),
        UPDATE: views.find(v => v.name === `${prefix}${functionNames.UPDATE}`)
    };
}

