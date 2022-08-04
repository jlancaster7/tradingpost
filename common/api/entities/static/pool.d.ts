import pg from 'pg';
import { RequestSettings } from './EntityApi';
export declare const getHivePool: Promise<pg.Pool>;
export declare const execProc: <Result = any, Count extends number = 0, T extends RequestSettings<any> = RequestSettings<any>>(proc: string, prms?: T | undefined, ensureCount?: Count | undefined, ensureCountMessage?: string) => Promise<Count extends 1 ? Result : Result[]>;
export declare const execProcOne: <Result = any, T extends RequestSettings<any> = RequestSettings<any>>(proc: string, prms?: T | undefined, ensureCountMessage?: string) => Promise<Result>;
