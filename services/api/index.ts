import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser';
import api from './routes-api-alpha'
import cors from 'cors'
import { healthCheck } from './healthcheck'
import fetch from 'node-fetch'
import { versionCode, PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase'
import { addToWaitlist } from '@tradingpost/common/api/waitlist';

import createRouterForApi from './routes-api-beta';
import { join } from 'path';

(globalThis as any)["fetch" as any] = fetch;

const app = express();
const port = process.env.PORT || 8080; // default port to listen

app.get("/", healthCheck);

app.use(cors())
//TODO: chage this to something reasonable 
app.use(bodyParser.json({ limit: "10mb" }))

app.use((req, res, next) => {
    next();
})

app.post('/waitlist/add', async (req, res) => {
    if (!req.body.email) {
        throw new PublicError("Missing Email");
    }
    await addToWaitlist(req.body.email);
    res.send('Successfully added!');
})

//Current API Routes
app.use("/" + versionCode, api);

//Legacy Api Routes... there is an issue with this.. I knwo the fix just need to implement it.
const addAvailableApi = (version: string) => {
    try {
        const baseRoute = join(__dirname, "tradingpost-common-" + version)
        const { versionCode: legacyVersionCode } = require(baseRoute + '/api/entities/static/EntityApi'),
        //TODO: should probablu also check that a route was not already registered incase of adding the name major+minor version 
        if (legacyVersionCode !== versionCode) {
            app.use("/" + version, createRouterForApi(legacyVersionCode, baseRoute))
            console.log("Adding api version " + version + " with route on " + legacyVersionCode);
        }
    } catch (ex) {
        console.error(ex);
    }
}

addAvailableApi("1.9.3")

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`API Server has been started at http://localhost:${port}`);
    if (process.env.CONFIGURATION_ENV === "development") {

    }
    console.log(process.env.CONFIGURATION_ENV)
});
