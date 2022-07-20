// import 'dotenv/config';
// import {Context} from "aws-lambda";
// import {lambdaImportRSSFeeds} from "@tradingpost/common/social-media/rss_feeds/import";
// import {DefaultConfig} from "@tradingpost/common/configuration";
// import pgPromise, {IDatabase, IMain} from "pg-promise";
//
// let pgClient: IDatabase<any>;
// let pgp: IMain;
//
// const run = async () => {
//     if (!pgClient || !pgp) {
//         const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
//         pgp = pgPromise({});
//         pgClient = pgp({
//             host: postgresConfiguration['host'] as string,
//             user: postgresConfiguration['user'] as string,
//             password: postgresConfiguration['password'] as string,
//             database: postgresConfiguration['database'] as string
//         })
//         await pgClient.connect()
//     }
//
//     const substackConfiguration = await DefaultConfig.fromCacheOrSSM("substack");
//
//     try {
//         await lambdaImportRSSFeeds(pgClient, substackConfiguration);
//     } catch (e) {
//         console.error(e)
//         throw e
//     }
// }
//
// module.exports.run = async (event: any, context: Context) => {
//     await run();
// }