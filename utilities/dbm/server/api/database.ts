import { RequestHandler } from 'express';
import pg from 'pg'
import { Request } from 'express-serve-static-core';
import { ApiError, toLowerProps } from '.';
import 'dotenv/config'
import { GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { IncomingMessage } from 'http';
import { makeEntityDefs } from '../../src/shared/code/code-gen';
import { Entity, EntityField, TableDefs } from '../../src/shared/interfaces/Entity';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ensureCamelCase, ensurePascalCase, ensureSnake, isSplitCalc } from '../../src/shared/code/code-gen-util';
import { DefaultConfig } from '@tradingpost/common/configuration'

//const debug = true;

const client = new S3Client({
    region: "us-east-1"
});


// const hive = new pg.Pool({
//     host: "localhost",
//     user: "postgres",
//     password: "V5tbh@vyPG3",
//     database: "HIVE"
// });

// const pool = new pg.Pool({
//     host: "localhost",
//     user: "postgres",
//     password: "V5tbh@vyPG3",
//     database: "DBM"
// });

// export const execProc = async <Result = any, Count extends number = 0, T extends Record<string, any> = any>(proc: string, prms?: T, ensureCount?: Count, ensureCountMessage?: string): Promise<Count extends 1 ? Result : Result[]> => {

//     const result = prms ? await pool.query(`SELECT * FROM ${proc}($1)`, [JSON.stringify(prms)]) :
//         await pool.query(`SELECT * FROM ${proc}()`)
//     if (ensureCount && result.rowCount !== ensureCount) {
//         const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
//         if (debug) {
//             console.error(defaultError);
//         }
//         throw new ApiError(ensureCountMessage || defaultError, { procedure: proc, parameters: prms });
//     }

//     if (ensureCount === 1)
//         return result.rows[0]
//     else return result.rows as (Count extends 1 ? Result : Result[]);
// }

// const execProcOne = async <Result = any, T extends Record<string, any> = any>(proc: string, prms?: T, ensureCountMessage?: string) => {
//     return await execProc<Result, 1, T>(proc, prms, 1, ensureCountMessage);
// }

const streamToString = (stream: any) =>
    new Promise<string>((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

const pushJsonData = (info: { name: string, definition: any }) => {
    const { name, definition } = info;
    //const result = await execProcOne<Entity>("createEntity", { name });
    //return result;


    client.send(new PutObjectCommand({
        Bucket: "entity-manager",
        // Add the required 'Key' parameter using the 'path' module.
        Key: `${name}.json`,
        // Add the required 'Body' parameter
        Body: JSON.stringify(definition) || "",
    }))
    return { name, definition }
}

const getAllEntities = async () => {
    const r = await client.send(new ListObjectsCommand({
        Bucket: "entity-manager"
    }));

    const reads: Promise<Entity>[] = [];
    if (r.Contents)
        for (const c of r.Contents) {

            reads.push(client.send(new GetObjectCommand({
                Bucket: "entity-manager",
                Key: c.Key,
            })).then(async (r) => {
                //console.log((r.Body as Object).constructor);

                const data = await streamToString(r.Body as IncomingMessage)
                return {
                    name: c.Key?.split(".")[0] || "",
                    definition: data ? JSON.parse(data) : ""
                }
            }))
        }

    return await Promise.all(reads);
}

type ViewTracker = {
    definition: string,
    dependsOn: Set<string>,
    dependants: Set<string>
}



const getDBPool = (async () => {
    return new pg.Pool(
        process.env.TEST ?
            {
                host: "localhost",
                user: "postgres",
                password: "V5tbh@vyPG3",
                database: "HIVE"
            } : (await DefaultConfig.fromCacheOrSSM("postgres")));
})()


async function updateServer() {
    const pool = await getDBPool;
    const files = ["tables", "views", "functions"];
    for (const f of files) {
        await pool.query(readFileSync(`${f}.sql`, "utf8"));
    }
    return { "ok": "ok" }
}
async function getTableDefs(tableName?: string) {

    console.log("TABLE NAME" + tableName);
    const result = await (await getDBPool).query(`SELECT *, 
    ((SELECT json_agg(x) FROM (select tco.constraint_name, kcu.column_name as key_column
    from information_schema.table_constraints tco
    join information_schema.key_column_usage kcu 
         on kcu.constraint_name = tco.constraint_name
         and kcu.constraint_schema = tco.constraint_schema
         and kcu.constraint_name = tco.constraint_name
    where tco.constraint_type = 'PRIMARY KEY' 
                              and tco.table_name = "columns".table_name 
                              and tco.table_schema = "columns".table_schema  
                              and kcu.column_name = "columns".column_name ) as x )->>0)::json as primary_key_data
        FROM information_schema.columns WHERE 
            table_schema = 'public'` + (tableName ?
            ` and table_name = '${tableName}'` : ''));
    return result.rows as TableDefs[];
}

const calls: Record<string, RequestHandler> = {
    createEntity: async (req, res) => {
        return pushJsonData(req.body);
    },
    updateEntity: async (req, res, next) => {
        return pushJsonData(req.body);
    },
    getTableDefinitions: async (req) => {
        return await getTableDefs();
    },
    updateServer,
    createSQLDiff: async (req) => {
        const entities = await getAllEntities();
        const runTest: boolean = req.body.runTest;
        const tableDefs: string[] = []
        const viewDefs: Record<string, ViewTracker> = {};
        //const colmap: Record<string, string[]> = {};
        const functionDefs: string[] = []
        const apiDefs: Record<string, string> = {};
        const interfacesDefs: Record<string, string> = {};

        const makeOrGetDef = (viewName: string) => {
            return viewDefs[viewName] || (viewDefs[viewName] = {
                definition: "#UNDEFINED",
                dependants: new Set(),
                dependsOn: new Set()
            })
        }

        const allViewsInfo: {
            entityName: string,
            name: string,
            definition: string,
            fields: EntityField[]
        }[] = [];

        const tds = await getTableDefs();
        entities.forEach((e) => {
            //if column needs a view that view is needed at a higher level
            const defs = makeEntityDefs(e, {}, runTest, tds.filter((td) => td.table_name === (e.definition?.tableNameOverride || `data_${ensureSnake(e.name)}`)), entities);
            if (defs) {
                tableDefs.push(defs.table);
                functionDefs.push(defs.functions);
                allViewsInfo.push(...Object.keys(defs.views).map((name) => ({
                    entityName: e.name,
                    name,
                    definition: defs.views[name].definition,
                    fields: defs.views[name].fieldNames.map(fn => defs.fields[fn])
                })))
                apiDefs[e.name] = defs.api;
                interfacesDefs[e.name] = defs.interfaces
            }
        });

        allViewsInfo.forEach((view) => {
            const viewDef = makeOrGetDef(view.name);
            viewDef.definition = view.definition;
            const addDepends = (depenViewName: string) => {
                //HACK NEED TO FIGURE OUT WHY THIS IS HAPPENING
                if (depenViewName !== view.name) {
                    const dependency = makeOrGetDef(depenViewName);
                    dependency.dependants.add(view.name);
                    viewDef.dependsOn.add(view.name);
                }
            }

            //Add all dependency
            view.fields.forEach((field) => {
                const { calcType, calc } = field || {};
                //console.log(field)
                if (isSplitCalc(calcType || "") && calc)
                    addDepends(calc.split("|")[0]);
                else if (calcType === "inline" && calc) {
                    allViewsInfo.forEach((_view) => {
                        //HACKY:probably should be a parser...
                        if (calc.toLowerCase().indexOf(_view.name.toLowerCase()) >= 0)
                            addDepends(_view.name)
                    })
                }
            })

            viewDefs[view.name] = viewDef;
        })

        const viewsRequired = new Set(Object.keys(viewDefs));
        const maxLoops = 100000;
        let i = 0;

        const viewOutput: string[] = []
        while (Boolean(viewsRequired.size) && i <= maxLoops) {
            [...viewsRequired.values()].forEach((vr) => {
                const curDef = viewDefs[vr]
                if (!curDef.dependsOn.size) {

                    //remove all dependants 
                    curDef.dependants.forEach((d) =>
                        viewDefs[d].dependsOn.delete(vr))
                    //create the view
                    viewOutput.push(curDef.definition);
                    viewsRequired.delete(vr);
                }
                else {

                    //HACK I NEED TO FIX...
                    if (curDef.dependsOn.size === 1 && curDef.dependsOn.has(vr)) {
                        curDef.dependsOn.delete(vr);
                    }
                }
            })

            i++;
        }
        //HACKY ... can make a cleaner check later 
        if (i >= maxLoops) {
            throw new Error("Possible circular dependency" + JSON.stringify(Array.from(viewsRequired)));
        }

        let output: any = [];
        //Write SQL File(s)
        if (!runTest) {
            writeFileSync("tables.sql", tableDefs.join("\r\n\r\n"));
            writeFileSync("views.sql", viewOutput.join("\r\n\r\n"));
            writeFileSync("functions.sql", functionDefs.join("\r\n\r\n"));
        }
        else {
            const testQuery = ["DROP TABLE IF EXISTS errors;CREATE TEMP TABLE errors (type TEXT,entityName TEXT, name TEXT,columnname text, message TEXT, context TEXT, detail TEXT);",
                ...tableDefs,
                ...viewOutput,
                ...functionDefs,
                ...allViewsInfo.map(v =>
                    `DO
$$
DECLARE
err text;
ctx text;
col_name text;
det text;
BEGIN
    PERFORM pg_temp.view_${v.name}('{"userId":"00000000-0000-0000-0000-000000000000"}');
EXCEPTION WHEN OTHERS THEN
     GET STACKED DIAGNOSTICS err = MESSAGE_TEXT, ctx = PG_EXCEPTION_CONTEXT, col_name =COLUMN_NAME, det = PG_EXCEPTION_DETAIL;
     INSERT INTO errors(type,entityName, name,columnname, message,context,detail)
     SELECT 'view' ,'${v.entityName}','${v.name}' ,col_name,err, ctx, det ;
END;
$$;`
                ),
            ].join("\r\n");


            writeFileSync("tests.sql", testQuery);
            //const result = await pool.query(testQuery);
            const pool = await getDBPool;
            const client = await pool.connect();
            await client.query(testQuery)
            const results = await client.query("SELECT * FROM errors");
            console.log(results.rows);
            output = results.rows;
        }
        //Write API FILES
        const extensionPlaceHolder = '/*extensions*/';
        //const baseFilesNames = ["AuthApi.ts", "EntityApi.ts", "EntityApi.native.ts", "EntityApiBase.ts"];
        const baseSourcePath = join(__dirname, "..", "..", "..", "..", "common", "api");
        const entitySourcePath = join(baseSourcePath, "entities");
        //const apiTemplatePath = join(sourcePath, "templates");
        const apiExtensionsPath = join(entitySourcePath, "extensions");

        //create extensions files 

        const imports: string[] = [`import * as Dummy  from "../extensions"`]
        //const data: string[] = []
        const realExts: string[] = [];
        Object.keys(apiDefs).forEach(d => {
            const name = ensurePascalCase(d);
            if (existsSync(join(apiExtensionsPath, name + ".ts"))) {
                imports.push(`import * as ${name} from '../extensions/${name}'`)
                realExts.push(name);
                //data.push(`${name}: ${name}Ext`)
            }
            else {
                imports.push(`export const ${name} = Dummy`)
            }
        });
        imports.push(`export {${realExts.join(",")}}`);


        const outputPathForExt = join(entitySourcePath, "apis", "extensions.ts");
        console.log("WRITTING TO PATH EXT: " + outputPathForExt)
        writeFileSync(outputPathForExt, imports.join("\r\n")// + "\r\n" +
            //    `export default { ${data.join(",\r\n")}  }`
        );
        console.log("FINISHED WRITTING TO PATH EXT: " + outputPathForExt);

        [entitySourcePath
            //,
            //    join(__dirname, "..", "..", "..", "..", "app", "tradingpost", "api", "entities")
        ].forEach((apiBasePath) => {

            const apiInterfacesPath = join(apiBasePath, "interfaces");
            const apiOutputPath = join(apiBasePath, "apis");
            // baseFilesNames.forEach((baseFileName) => {
            //     copyFileSync(join(apiTemplatePath, baseFileName), join(apiOutputPath, baseFileName));
            // })

            //TODO need to add delete of all existing files
            Object.keys(apiDefs).forEach(d => {
                console.log("Writting TO " + join(apiOutputPath, `${ensurePascalCase(d)}Api.ts`));
                writeFileSync(join(apiOutputPath, `${ensurePascalCase(d)}Api.ts`), apiDefs[d]);
            });

            const allIDefs: string[] = []
            allIDefs.push("import * as Statics from '../static/interfaces'");
            Object.keys(interfacesDefs).forEach(d => {
                allIDefs.push(interfacesDefs[d]);
            });
            //Add static interfaces 
            allIDefs.push("export * from '../static/interfaces'");
            writeFileSync(join(apiInterfacesPath, `index.ts`), allIDefs.join("\r\n\r\n"));
        });

        //

        const staticFileNames = readdirSync(join(entitySourcePath, "static")).filter((v) => {
            return /.+Api\.ts/.test(v) && v !== "EntityApi.ts"
        }).map(n => ({
            short: n.substring(0, n.length - 6),
            long: n.substring(0, n.length - 3),
        }));
        writeFileSync(join(baseSourcePath, "index.ts"), [
            //static Imports 
            staticFileNames.length ? staticFileNames.map(v => `import ${v.short} from './entities/static/${v.long}'`).join("\r\n") : "",
            //dynamic Imports
            Object.keys(apiDefs).map(v => `import ${ensurePascalCase(v)} from './entities/apis/${ensurePascalCase(v)}Api'`).join("\r\n"),
            //All Interfaces
            "export * as Interface from './entities/interfaces'",
            "export const Api:{ ",
            Object.keys(apiDefs).map(v => ensurePascalCase(v) + ": typeof " + ensurePascalCase(v)).join(",") + ",",
            //All Static Apis
            staticFileNames.length ? staticFileNames.map(v => v.short + ": typeof " + v.short).join(",") : "",
            "}",
            " = {",
            //All Dynamic Apis
            Object.keys(apiDefs).map(v => ensurePascalCase(v)).join(",") + ",",
            //All Static Apis
            staticFileNames.length ? staticFileNames.map(v => v.short).join(",") : "",
            "}"
        ].join("\r\n"))

        //entities/interfaces
        // Object.keys(interfacesDefs).forEach(d => {
        //     console.log("Writting TO " + join(apiInterfacesPath, `I${ensurePascalCase(d)}Api.ts`));
        //     writeFileSync(join(apiInterfacesPath, `I${ensurePascalCase(d)}.ts`), interfacesDefs[d]);
        // });


        return output;
        //writeFileSync("functions.sql", "");
    },
    // getCode: async (req, res, next) => {
    //     const tds = await getTableDefs(`data_${ensureSnake(req.body.entity.name)}`);
    //     makeEntityDefs(req.body.entity, req.body.deleteFields || [], false, tds);
    // },
    lockEntity: async (req, res, next) => {
        // const { id } = req.body;
        // const result = await execProcOne<Entity, Pick<Entity, "id" | "lockedOn">>("updateEntity", { id, lockedOn: new Date() });
        // return result;
    },
    unlockEntity: async (req, res, next) => {
        // const { id } = req.body;
        // const result = await execProcOne<Entity, Pick<Entity, "id" | "lockedOn">>("updateEntity", { id, lockedOn: null });
        // return result;    
    },
    getEntity: async (req: Request<any, any, { name: string }>, res) => {
        const { name } = req.body;
        // const r = await execProcOne<Entity>("getEntity", { name }, `Could not find entity '${name}'`);
        // return r;
        const r = await client.send(new GetObjectCommand({
            Bucket: "entity-manager",
            Key: name + ".json",
        }))
        return {
            name,
            definition: r.Body ? JSON.parse(await streamToString(r.Body)) : ""
        }
        //const r = await execProc<Entity>("listEntity");
        //return r;

    },
    listEntity: async (req: Request, res) => {
        return await getAllEntities();
    },
    testEntities: () => {
        //create temp tables
        //select from temp data as view
    }
}

export default toLowerProps(calls);
