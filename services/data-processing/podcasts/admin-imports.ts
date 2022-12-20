import 'dotenv/config';
process.env.CONFIGURATION_ENV = "production";
import { DateTime } from 'luxon';
import pgPromise from 'pg-promise';
import {DefaultConfig} from '@tradingpost/common/configuration';
import { lambdaImportEpisodes, importSpotifyShows } from './imports';



(async () => {

    const test = ['7cRZcoh8fO0uJ9lwruKf4b',
                  '54wcTJS0kYranEJYHjF0Du',
                  '4XKvjmFiZLxWZ58vBfT4v9',
                  '06cmbUqsVNkhvZWxXqkpMZ',
                  '4RajWGfe80Wfy9J6rswE4L',
                  '1mew67liBaxMEs7VPxLoMt',
                  '1te7oSFyRVekxMBJUSethH',
                  '5OXBdcyxYWOEcN8Y2aO6v9',
                  '7yAAsaj77q3jQLbX8NAQ7J'
                ]
    
    const postgresConfiguration = await DefaultConfig.fromSSM("postgres");
    const spotifyConfiguration = await DefaultConfig.fromSSM("spotify");
    const pgp = pgPromise({});
    const conn = pgp({
        host: postgresConfiguration['host'] as string,
        user: postgresConfiguration['user'] as string,
        password: postgresConfiguration['password'] as string,
        database: postgresConfiguration['database'] as string
    })

    await importSpotifyShows(test, conn, spotifyConfiguration);
    await lambdaImportEpisodes(conn, spotifyConfiguration);

    pgp.end();

})()