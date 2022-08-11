import { EntityField } from "../interfaces/Entity"
import { dtExchanger, prefixes } from "./code-gen-config"

export const makeTableDef = (entityName: string, tableName: string, fields: EntityField[], isTemp: boolean, existingFields?: EntityField[], pkName?: string) => {
    let tableDef = ""

    const realFields = fields
        .filter((f) => !f.calcType);
    if (!existingFields?.length)
        //DROP TABLE IF EXISTS ${tableName}; \r\n 
        tableDef = `CREATE ${isTemp ? "TEMP" : ""} TABLE ${(isTemp ? "pg_temp." : "") + tableName}(\r\n${[...
            realFields.map(f =>
                `    ${f.name} ${f.dataType.toUpperCase()}${f.PK ? " PRIMARY KEY" : ""}${f.nullable || !f.PK ? "" : " NOT NULL"}${f.dataType === "UUID" && f.PK ? " DEFAULT gen_random_uuid()" : ""}`),
            "    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
            "    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
        ]
            .join(",\r\n")});`
    else {
        //create alter statement 

        const drops = existingFields.filter((f) => f.name !== 'created_at' && f.name !== 'updated_at' && !realFields.find(_f => _f.name === f.name)).map((f) => `DROP COLUMN ${f.name}`)
        const adds = realFields.filter((f) => !existingFields.find(_f => _f.name === f.name)).map((f) => `ADD COLUMN ${f.name} ${f.dataType.toUpperCase()}${f.nullable ? "" : " NOT NULL"}`)
        const alters = existingFields.filter((f) => realFields.find(_f => _f.name === f.name &&
            (dtExchanger(_f.dataType).toUpperCase() !== f.dataType.toUpperCase())
        )).map((f) => `ALTER COLUMN ${f.name} TYPE ${dtExchanger((realFields.find(_f => _f.name === f.name)?.dataType)).toUpperCase()}`)
        const nullables = existingFields.filter((f) => realFields.find(_f => _f.name === f.name && (f.nullable || false) !== (_f.nullable || false)))
            .map((f) => `ALTER COLUMN ${f.name}  ${f.nullable ? "SET" : "DROP"} NOT NULL`)

        //check if PK exists 
        const currentPk = realFields.find(f => f.PK);
        const existingPk = existingFields.find(f => f.PK);
        const constraints: string[] = [];
        //if there is a mismatch then drop the existing pk
        if (currentPk?.name !== existingPk?.name || existingPk && !currentPk || currentPk && !existingPk) {
            //drop existing
            if (existingPk)
                constraints.push(`DROP CONSTRAINT ${pkName}`);

            //add next 
            if (currentPk)
                constraints.push(`ADD PRIMARY KEY(${currentPk.name})`);
        }

        //"{""constraint_name"":""Watchlist_pkey"",""key_column"":""id""}"

        //const nullables = existingFields.filter((f) => !fields.find(_f => _f.name === f.name)).map((f) => `ALTER COLUMN ${f.name} ${f.dataType.toUpperCase()}}${f.nullable ? "" : " NOT NULL"}`)
        // Cn add renames

        const testOut = [
            ...drops,
            ...adds,
            ...alters,
            ...nullables,
            ...constraints
        ];

        if (testOut.length) {
            tableDef = [
                `ALTER TABLE ${tableName}`,
                testOut.join(",\r\n")
            ].join("\r\n") + ";"
        }
        else {
            tableDef = `/* No changes to ${tableName} [${entityName}]*/`
        }
    }
    return tableDef
}
