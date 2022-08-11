
import { Entity, EntityField, EntityView } from "../interfaces/Entity";
import { $request, $userProperty, dtExchange, dtExchanger, functionNames, prefixes } from "./code-gen-config";
import { $dataProperty, dataTableName, dropAndMakeFunction, fieldNames, FunctionSettings, getKey, resolveSchema, returnSelectQuery, whereKeyMatches } from "./code-gen-util";
import { spliKeyInfo } from "./code-gen-views";

const dataFieldFilter = {
    key: false,
    nullable: true,
    virtual: false
}

//settings.entityFields.find(_f => _f.name === f)?.private ? `${f}= ${$userProperty}`
type OtherData = { allEntities: Entity[] };

export const makeInsertFunction = (settings: FunctionSettings, fields: string[], other: OtherData) => {
    const key = getKey(settings);
    const validFields = settings.entityFields.filter(f => fields.find(fn => fn === f.name));



    return key?.dataType ? dropAndMakeFunction(settings, functionNames.INSERT,
        {
            declare: {
                _idField: dtExchange[key.dataType.toLowerCase() || ""] || key.dataType
            },
            body: [
                `INSERT INTO ${dataTableName(settings)}(
  ${fieldNames(validFields, dataFieldFilter).join(",\r\n")})`,
                `VALUES (${fieldNames(validFields, dataFieldFilter, true,
                    validFields.filter(f => f.private || f.name === "user_id").map(f => f.name)).join(",\r\n")})`,
                `returning ${dataTableName(settings)}.${key?.name} INTO _idField;`,
                ...makeCalcParts(settings, fields, other, true),
                returnSelectQuery("v", settings, "get", `v.${key?.name} = _idField`)
            ].join("\r\n")
        },
        other.allEntities.find(e => e.name === settings.entityName)?.definition?.views?.find((v) => v.name === `${settings.entityName}_get`)?.fieldNames
    ) : "";
}
const makeCalcParts = (settings: FunctionSettings, fields: string[], other: OtherData, isInsert: boolean) => {

    return settings.entityFields.filter(f =>
        fields.find(fn => fn === f.name) &&
        (f.calcType === "exists" || f.calcType === "json" || f.calcType === "count") &&
        !f.readOnly).flatMap((f) => {
            //Need to add a "write" view 
            const { view, key, privClause, splitKey, entityName, userIdField } = spliKeyInfo("", f, settings.entityFields);

            const { allEntities } = other;
            const relatedTable = `${resolveSchema(settings.isTest)}.${prefixes.DATA}_${entityName}`;

            let selectedFields: EntityField[] = []
            let selectedView: EntityView | undefined;
            for (let index = 0; index < allEntities.length; index++) {
                const entity = allEntities[index];
                entity.definition?.views?.forEach((v) => {
                    if (v.name === view) {
                        selectedView = v;
                    }
                })

                if (selectedView && entity.definition?.fields) {

                    //Hack: Ignore matched id 
                    selectedFields = entity.definition?.fields.filter((_f) => {
                        return selectedView?.fieldNames.find(fn => fn === _f.name) && !_f.PK && _f.name !== key
                    })
                    break
                }

            }
            const pk = settings.entityFields.find((f) => f.PK);
            const idField = isInsert ? "_idField" : $dataProperty(pk?.name || "", dtExchanger(pk?.dataType));

            //... transform users fields 
            const insertFields = [
                key,
                ...selectedFields.map(f => f.name)
            ].join(",");

            const valueFields = [
                idField,
                ...selectedFields.map((f) => {
                    return f.name.toLowerCase() === userIdField.toLowerCase() ? $userProperty : `(value->>'${f.name}')::${f.dataType}`//$dataProperty(f.name, f.dataType)
                })
            ].join(",");

            return [
                `DELETE FROM ${relatedTable} t WHERE t.${key} = ${idField};`,
                `IF request->'data' ? '${f.name}' THEN\r\nINSERT INTO ${relatedTable}(${insertFields})`,
                `SELECT ${valueFields} FROM json_array_elements(${$dataProperty(f.name, f.dataType)});`,
                'END IF;'
            ]
        })
}
export const makeUpdateFunction = (settings: FunctionSettings, fields: string[], other: OtherData) => {
    const condition = whereKeyMatches("v", settings);

    return condition ? dropAndMakeFunction(settings, functionNames.UPDATE, {
        body: [
            `UPDATE ${dataTableName(settings)} v SET ${fieldNames(settings.entityFields.filter(f => fields.find(fn => fn === f.name)), dataFieldFilter)
                .map((f) =>
                    settings.entityFields.find(_f => _f.name === f)?.private ? `${f}= ${$userProperty}` : `${f} =  tp.prop_or_default(${$request}->'data' ,'${f}',v.${f})`
                ).join(", \r\n")
            } WHERE ${condition};`,
            ...makeCalcParts(settings, fields, other, false),
            returnSelectQuery("v", settings, "get", condition)
        ]
            .join("\r\n")
    },
        other.allEntities.find(e => e.name === settings.entityName)?.definition?.views?.find((v) => v.name === `${settings.entityName}_get`)?.fieldNames
    ) : ""
}
export const makeGetFunction = (settings: FunctionSettings, viewFields: string[]) => {
    const condition = whereKeyMatches("v", settings);
    return condition ? dropAndMakeFunction(settings, functionNames.GET, {
        body: returnSelectQuery("v", settings, "get", condition)
    }, viewFields) : ""
}
//TODO: discuss search/find/settings we want to pass
export const makeListFunction = (settings: FunctionSettings, viewFields: string[]) => {
    const pkField = settings.entityFields.find(f => f.PK);
    return pkField ? dropAndMakeFunction(settings, functionNames.LIST, {
        body: returnSelectQuery("v", settings, "list",
            `CASE WHEN  request->'data' ? 'ids' THEN  v.${pkField.name} in (SELECT value::${dtExchanger(pkField.dataType)} from jsonb_array_elements_text(request->'data'->'ids')) ELSE true end`
            //settings.entityFields.filter((f) => f.filter).map((f) => `v.${f.name}=${$dataProperty(f.name, f.dataType || "")}`).join(" and ")
        )
    }, viewFields) : `/**** [${settings.entityName}] Primary Key is missing .....Cant create a list statement ****/`
}
export const makeFunctionDef = (entity: Entity, validFields: EntityField[], isTest: boolean, settings: Record<keyof typeof functionNames, EntityView | undefined>, other: OtherData) => {
    const funcSettings: FunctionSettings = {
        entityFields: validFields,
        entityName: entity.name,
        tableNameOverride: entity.definition?.tableNameOverride || "",
        isTest
    }

    return [
        settings.INSERT?.fieldNames.length ? makeInsertFunction(funcSettings, settings.INSERT.fieldNames, other) : "",
        settings.UPDATE?.fieldNames.length ? makeUpdateFunction(funcSettings, settings.UPDATE.fieldNames, other) : "",
        settings.GET?.fieldNames.length ? makeGetFunction(funcSettings, settings.GET.fieldNames) : "",
        settings.LIST?.fieldNames.length ? makeListFunction(funcSettings, settings.LIST.fieldNames) : ""
    ].join("\r\n\r\n");
}