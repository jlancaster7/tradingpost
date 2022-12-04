import 'dotenv/config'
import {DefaultConfig} from "./configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import Repository from './brokerage/repository';
import Robinhood from "./brokerage/robinhood";
import {PortfolioSummaryService} from "./brokerage/portfolio-summary";
import Api from "./brokerage/robinhood/api";
import Transformer from "./brokerage/robinhood/transformer";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {

    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })
    }

    const repository = new Repository(pgClient, pgp);
    const portSummarySrv = new PortfolioSummaryService(repository);

    const robinhoodTransformer = new Transformer(repository);
    const institution = await repository.getInstitutionByName("Robinhood");
    if (institution === null) throw new Error("Robinhood Institutio does not exist");
    const api = new Api("eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE2NzA1NTAxNzksInRva2VuIjoiNU1BMzlkeEx0eUdhczRLMTdqeXZNRVVSSmdDczF5IiwidXNlcl9pZCI6ImRlZmNmZTE1LWYxMGQtNDRkZC1iOWExLTIyZDQyNGVmZjE0NCIsImRldmljZV9oYXNoIjoiMDgzMjNlZDI0Mjg4ZGMwMjJhNDZjYWJlZDE2ZDc4MWMiLCJzY29wZSI6ImludGVybmFsIiwiZGN0IjoxNjY5MDUxMDU1LCJzZXJ2aWNlX3JlY29yZHMiOlt7ImhhbHRlZCI6ZmFsc2UsInNlcnZpY2UiOiJudW1tdXNfdXMiLCJzaGFyZF9pZCI6MSwic3RhdGUiOiJhdmFpbGFibGUifSx7ImhhbHRlZCI6ZmFsc2UsInNlcnZpY2UiOiJicm9rZWJhY2tfdXMiLCJzaGFyZF9pZCI6Mywic3RhdGUiOiJhdmFpbGFibGUifV0sInVzZXJfb3JpZ2luIjoiVVMiLCJvcHRpb25zIjp0cnVlLCJsZXZlbDJfYWNjZXNzIjp0cnVlfQ.hMgV8hDz7wF_9jF161UtemHiQwsSyj1r4S369bclN2NLmLV4fn02I9wn1JsI8AK9xhj5L2eZD4jLHJ08jElDjcN91TM-0QYB4vJX0dwhgi34-W4924fMRCWmG29xyB35QrMu63G8oeJVQ-WSPW404A2OyVDEloqqUZYfkpVuf-tUJulIsZI3Tb6SyGaR2ChluhmVfN4MYbrDFoC1FdkrR5JCcoD1NMnnZtk9KC9M6qnRYufIsHgIHmQ9gG-9ihdv0n7ndCTFp_FVALsi2hFlIGw8TtA2shZGfv1z2avHEq4LmNgTqZvTK9N__ROHQWaG-jyEXEw_NCHOmkguHEwU7w", "CTiqj6Tgdu2SvaMCbhzUKhBPtb7YvN");
    const robinhoodSrv = new Robinhood(api, repository, robinhoodTransformer, portSummarySrv);
    await robinhoodSrv.transactions("ea05f297-461f-49be-99b9-67ce9ad238c6");
}

(async () => {
    await run()
    console.log("Fin!")
})()