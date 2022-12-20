import 'dotenv/config';
process.env.CONFIGURATION_ENV = "production";
import { DateTime } from 'luxon';
import pgPromise from 'pg-promise';
import {DefaultConfig} from '@tradingpost/common/configuration';
import { importSubstackUsers, lambdaImportRSSFeeds } from './imports';



(async () => {
    const test = ['twebs',
                'theglobalinvestor',
                'sleepwell',
                'jiggy',
                'theslothinvestor',
                'honestinvesting',
                'crosswindcapital',
                'innovestor',
                'knowhowcapital',
                'mindsetvalue',
                'thebearcave',
                'neckar',
                'tanay',
                'from100kto1m',
                'richardchu97'
                ]
    
    const postgresConfiguration = await DefaultConfig.fromSSM("postgres");

    const pgp = pgPromise({});
    const conn = pgp({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    })


    await importSubstackUsers(test, conn, {});
    await lambdaImportRSSFeeds(conn, {});

    pgp.end();

})()