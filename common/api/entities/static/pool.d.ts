import pg from 'pg';
export declare const getHivePool: () => Promise<pg.Pool>;
export declare const execProc: <Result = any, Count extends number = 0, T extends Record<string, any> = any>(proc: string, prms?: T | undefined, ensureCount?: Count | undefined, ensureCountMessage?: string | undefined) => Promise<Count extends 1 ? Result : Result[]>;
export declare const execProcOne: <Result = any, T extends Record<string, any> = any>(proc: string, prms?: T | undefined, ensureCountMessage?: string | undefined) => Promise<Result>;
