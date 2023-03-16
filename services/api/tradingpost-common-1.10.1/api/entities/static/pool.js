"use strict";
// import { DefaultConfig } from '../../../configuration';
// import pg from 'pg'
// import { RequestSettings } from './EntityApi';
// const debug = true;
// export const getHivePool = (async () => {
//     let hive: pg.Pool
//     const config = await DefaultConfig.fromCacheOrSSM("postgres");
//     hive = new pg.Pool({
//         host: process.env.API_DB_HOST || config.host,
//         user: process.env.API_DB_USER || config.user,
//         password: process.env.API_DB_PASS || config.password,
//         database: process.env.API_DB_NAME || config.database,
//         port: process.env.API_DB_PORT ? Number(process.env.API_DB_PORT) : config.port
//     });
//     return hive;
// })()
// export const execProc = async <Result = any, Count extends number = 0, T extends RequestSettings<any> = RequestSettings<any>>(proc: string, prms?: T, ensureCount?: Count, ensureCountMessage?: string): Promise<Count extends 1 ? Result : Result[]> => {
//     const hive = await getHivePool;
//     const result = prms ? await hive.query(`SELECT * FROM ${proc}($1)`, [JSON.stringify(prms)]) :
//         await hive.query(`SELECT * FROM ${proc}('{}')`)
//     if (ensureCount && result.rowCount !== ensureCount) {
//         const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
//         if (debug) {
//             console.error(defaultError);
//             console.error(JSON.stringify(prms));
//             console.error(JSON.stringify(proc));
//         }
//         throw {
//             message: ensureCountMessage || defaultError,
//             data: {
//                 procedure: proc,
//                 parameters: prms
//             }
//         }
//     }
//     if (ensureCount === 1)
//         return result.rows[0]
//     else return result.rows as (Count extends 1 ? Result : Result[]);
// }
// export const execProcOne = async <Result = any, T extends RequestSettings<any> = RequestSettings<any>>(proc: string, prms?: T, ensureCountMessage?: string) => {
//     return await execProc<Result, 1, T>(proc, prms, 1, ensureCountMessage);
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDBEQUEwRDtBQUMxRCxzQkFBc0I7QUFDdEIsaURBQWlEO0FBRWpELHNCQUFzQjtBQUV0Qiw0Q0FBNEM7QUFDNUMsd0JBQXdCO0FBRXhCLHFFQUFxRTtBQUNyRSwyQkFBMkI7QUFDM0Isd0RBQXdEO0FBQ3hELHdEQUF3RDtBQUN4RCxnRUFBZ0U7QUFDaEUsZ0VBQWdFO0FBQ2hFLHdGQUF3RjtBQUN4RixVQUFVO0FBRVYsbUJBQW1CO0FBQ25CLE9BQU87QUFHUCw2UEFBNlA7QUFDN1Asc0NBQXNDO0FBRXRDLG9HQUFvRztBQUNwRywwREFBMEQ7QUFDMUQsNERBQTREO0FBRTVELGlIQUFpSDtBQUNqSCx1QkFBdUI7QUFDdkIsMkNBQTJDO0FBQzNDLG1EQUFtRDtBQUNuRCxtREFBbUQ7QUFDbkQsWUFBWTtBQUNaLGtCQUFrQjtBQUNsQiwyREFBMkQ7QUFDM0Qsc0JBQXNCO0FBQ3RCLG1DQUFtQztBQUNuQyxtQ0FBbUM7QUFDbkMsZ0JBQWdCO0FBQ2hCLFlBQVk7QUFDWixRQUFRO0FBRVIsNkJBQTZCO0FBQzdCLGdDQUFnQztBQUNoQyx3RUFBd0U7QUFDeEUsSUFBSTtBQUVKLG1LQUFtSztBQUNuSyw4RUFBOEU7QUFDOUUsSUFBSSJ9