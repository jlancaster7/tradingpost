// import 'dotenv/config'
// import {DefaultConfig} from "./configuration";
// import pgPromise, {IDatabase, IMain} from "pg-promise";
// import pg from 'pg';
// import Repository from './brokerage/repository';
// import Robinhood from "./brokerage/robinhood";
// import {S3Client} from "@aws-sdk/client-s3";
// import {PortfolioSummaryService} from "./brokerage/portfolio-summary";
// import Api from "./brokerage/robinhood/api";
//
// pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
//     return parseInt(value);
// });
//
// pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
//     return parseFloat(value);
// });
//
// pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
//     return parseFloat(value);
// });
//
// pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
//     return parseFloat(value);
// });
//
// let pgClient: IDatabase<any>;
// let pgp: IMain;
//
// const run = async () => {
//     if (!pgClient || !pgp) {
//         const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
//         pgp = pgPromise({});
//         pgClient = pgp({
//             host: postgresConfiguration.host,
//             user: postgresConfiguration.user,
//             password: postgresConfiguration.password,
//             database: postgresConfiguration.database
//         })
//     }
//
//     const repository = new Repository(pgClient, pgp);
//     const s3Client = new S3Client({region: "us-east-1"});
//     const portSummarySrv = new PortfolioSummaryService(repository);
//     const api = new Api();
//     const robinhoodSrv = new Robinhood(repository, s3Client, portSummarySrv);
//
// }
//
// (async () => {
//     await run()
// })()