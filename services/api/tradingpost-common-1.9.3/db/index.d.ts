import pg from 'pg';
import pgPromise from "pg-promise";
import { PortfolioSummaryService } from "../brokerage/portfolio-summary";
import { Service } from "../brokerage/finicity";
import { SQSClient } from "@aws-sdk/client-sqs";
export declare const getHivePool: Promise<pg.Pool>;
export declare const init: Promise<{
    finicitySrv: Service;
    portfolioSummarySrv: PortfolioSummaryService;
    sqsClient: SQSClient;
    pgp: pgPromise.IMain<{}, import("pg-promise/typescript/pg-subset").IClient>;
    pgClient: pgPromise.IDatabase<{}, import("pg-promise/typescript/pg-subset").IClient>;
}>;
export declare const execProc: <Result = any, Count extends number = 0, T = any>(proc: string, prms?: T | undefined, ensureCount?: Count | undefined, ensureCountMessage?: string) => Promise<Count extends 1 ? Result : Result[]>;
export declare const execProcOne: <Result = any, T = any>(proc: string, prms?: T | undefined, ensureCountMessage?: string) => Promise<Result>;
