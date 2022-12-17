//import { SSM } from '@aws-sdk/client-ssm'
import 'dotenv/config'
console.log("WTF");
import express from 'express'
import bodyParser from 'body-parser';
import api from './routes-api-alpha'
import cors from 'cors'
import { healthCheck } from './healthcheck'
import fetch from 'node-fetch'
import { versionCode, PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase'
import { addToWaitlist } from '@tradingpost/common/api/waitlist';

import createRouterForApi from './routes-api-beta';

(globalThis as any)["fetch" as any] = fetch;
//fromWebToken()

 
const app = express();
const port = process.env.PORT || 8082; // default port to listen

app.get("/", healthCheck);

app.use(cors())
//TODO: chage this to something reasonable 
app.use(bodyParser.json({ limit: "10mb" }))

app.use((req, res, next) => {
    next();
})
//app.use("/api", api);
// define a route handler for the default home page
//app.use("/alpha", api);

app.post('/waitlist/add', async (req, res) => {
    if (!req.body.email) {
        throw new PublicError("Missing Email");
    }
    await addToWaitlist(req.body.email);
    res.send('Successfully added!');
})

//Current API Routes
app.use("/" + versionCode, api);

//Legacy Api Routes... there is an issue with this.. I knwo the fix just need to implement it .
const addAvailableApi = (version: string) => {
    try {
        if (version !== versionCode) {
            app.use("/" + version, createRouterForApi(version))
            console.log("Adding api version " + version);
        }
    }
    catch (ex) {
        console.error(ex);
    }
}
addAvailableApi("1.5.0")
addAvailableApi("1.4.0")
// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`API Server has been started at http://localhost:${port}`);
    if (process.env.CONFIGURATION_ENV === "development") {

    }
    console.log(process.env.CONFIGURATION_ENV)
});
