import 'dotenv/config'
import { PortfolioSummaryService } from './portfolio-summary';
import { DefaultConfig } from "../configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import Repository from './repository';

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
    const repo = new Repository(pgClient, pgp);
    const service = new PortfolioSummaryService(repo);

    const test = await service.computeAccountGroupSummary('e96aea04-9a60-4832-9793-f790e60df8eb');

    console.log(test);
}

run();