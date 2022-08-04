import { IDatabase, IMain } from "pg-promise";
declare function lambdaImportRSSFeeds(pgClient: IDatabase<any>, pgp: IMain): Promise<void>;
declare function importSubstackUsers(username: string | string[], pgClient: IDatabase<any>, pgp: IMain): Promise<void>;
export { lambdaImportRSSFeeds, importSubstackUsers };
