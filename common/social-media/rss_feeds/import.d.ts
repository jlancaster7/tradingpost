import { IDatabase, IMain } from "pg-promise";
declare type SubstackConfiguration = {};
declare function lambdaImportRSSFeeds(pgClient: IDatabase<any>, pgp: IMain, substackConfiguration: SubstackConfiguration): Promise<void>;
declare function importSubstackUsers(username: string | string[], pgClient: IDatabase<any>, pgp: IMain, substackConfiguration: SubstackConfiguration): Promise<void>;
export { lambdaImportRSSFeeds, importSubstackUsers };
