
import pg from 'pg'
const hive = new pg.Pool({
    host: "localhost",
    user: "postgres", 
    password: "V5tbh@vyPG3",
    database: "HIVE"
});
const debug = true;

export const execProc = async <Result = any, Count extends number = 0, T extends Record<string, any> = any>(proc: string, prms?: T, ensureCount?: Count, ensureCountMessage?: string): Promise<Count extends 1 ? Result : Result[]> => {
 
    const result = prms ? await hive.query(`SELECT * FROM ${proc}($1)`, [JSON.stringify(prms)]) :
        await hive.query(`SELECT * FROM ${proc}()`)
    if (ensureCount && result.rowCount !== ensureCount) {

        const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
        if (debug) {
            console.error(defaultError);
        }
        throw {
            message: ensureCountMessage || defaultError,
            data: {
                procedure: proc, parameters: prms
            }
        }
    }

    if (ensureCount === 1)
        return result.rows[0]
    else return result.rows as (Count extends 1 ? Result : Result[]);
}

export const execProcOne = async <Result = any, T extends Record<string, any> = any>(proc: string, prms?: T, ensureCountMessage?: string) => {
    return await execProc<Result, 1, T>(proc, prms, 1, ensureCountMessage);
}