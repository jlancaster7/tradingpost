//import { SSM } from '@aws-sdk/client-ssm'
import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser';
import api from './routes-api-alpha'
import cors from 'cors'
import { healthCheck } from './healthcheck'
import fetch from 'node-fetch'
import { versionCode } from '@tradingpost/common/api/entities/static/EntityApiBase'
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

app.use("/" + versionCode, api);

// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`API Server has been started at http://localhost:${port}`);
    if (process.env.CONFIGURATION_ENV === "development") {      
    }

    console.log(process.env.CONFIGURATION_ENV)
});