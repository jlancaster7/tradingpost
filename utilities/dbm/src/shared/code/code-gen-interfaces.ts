import { EntityView, EntityField } from "../interfaces/Entity";
import { ensurePascalCase } from "./code-gen-util";
import { DataTypeMap } from "./data-type-map";

export const makeInterfaceDef = (v: EntityView, fields: EntityField[] | undefined, deleteFields: Record<string, boolean>, isUpsertView: boolean, isUpdate: boolean) =>
    `export interface I${ensurePascalCase(v.name)} {
    ${v.fieldNames.filter((fn) => !deleteFields[fn]).map(fn => {
        const field = fields?.find(f => f.name === fn);
        return `    ${fn}${field?.nullable || isUpdate ? "?" : ""}: ${field?.dataType === "json" ?
            //Sets the associated view OR manual type set in the "maxLength" field if there is no calc type
            (field.calcType === "json" ?
                (!isUpsertView ? `I${ensurePascalCase(field.calc?.split("|")[0] || "")}[]` :
                    //Hacky:::This needs to be fixed to allow user to select a view to upsert from the DBM or me never on the upsert... good enough for now.
                    `Omit<I${ensurePascalCase(field.calc?.split("|")[0] || "")},'${field.calc?.split("|")[1]}'|'id'>[]`)
                : field.maxLength) :
            ((DataTypeMap as any)[field?.dataType as any] || "unknown")}`
    }).join(",\r\n")}
    };`;


