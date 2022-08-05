
import { DefaultConfig } from '../../../configuration';
import pg from 'pg'
import { RequestSettings } from './EntityApi';

const debug = true;

export const getHivePool = (async () => {
    let hive: pg.Pool

    const config = await DefaultConfig.fromCacheOrSSM("postgres");
    hive = new pg.Pool({
        host: process.env.API_DB_HOST || config.host,
        user: process.env.API_DB_USER || config.user,
        password: process.env.API_DB_PASS || config.password,
        database: process.env.API_DB_NAME || config.database,
        port: process.env.API_DB_PORT ? Number(process.env.API_DB_PORT) : config.port
    });

    return hive;
})()


export const execProc = async <Result = any, Count extends number = 0, T extends RequestSettings<any> = RequestSettings<any>>(proc: string, prms?: T, ensureCount?: Count, ensureCountMessage?: string): Promise<Count extends 1 ? Result : Result[]> => {
    const hive = await getHivePool;

    const result = prms ? await hive.query(`SELECT * FROM ${proc}($1)`, [JSON.stringify(prms)]) :
        await hive.query(`SELECT * FROM ${proc}('{}')`)
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

export const execProcOne = async <Result = any, T extends RequestSettings<any> = RequestSettings<any>>(proc: string, prms?: T, ensureCountMessage?: string) => {
    return await execProc<Result, 1, T>(proc, prms, 1, ensureCountMessage);
}