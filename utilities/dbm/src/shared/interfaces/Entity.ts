import { StringMappingType } from "typescript";

export type CalcTypes = "none" | "json" | "count" | "inline" | "exists";
export interface EntityField {
    "name": string,
    "dataType": string,
    "maxLength"?: number | string,
    "nullable"?: boolean,
    "PK"?: boolean,
    "filter"?: boolean,
    "calcType"?: CalcTypes,
    "condition"?: string,
    private?: boolean,
    "calc"?: CalcTypes,
    locked?: boolean,
    readOnly?: boolean,
    draft?: boolean,
}
export interface EntityView {
    "name": string,
    "fieldNames": string[]
}
export interface EntityDefinition {
    fields?: EntityField[],
    views?: EntityView[]
    tableNameOverride?: string
}
export interface Entity {
    id?: number,
    name: string,
    definition?: EntityDefinition
    lockedOn?: Date | null,
    modifiedOn?: Date
}

export interface TableDefs {
    column_name: string,
    table_name: string,
    primary_key_data?: {
        constraint_name: string
        key_column: string
    }
    data_type: string,
    is_nullable: "YES" | "NO"
}