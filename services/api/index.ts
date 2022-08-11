//import { SSM } from '@aws-sdk/client-ssm'
import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser';
import api from './routes-api-alpha'
import cors from 'cors'
import { healthCheck } from './healthcheck'
import fetch from 'node-fetch'


(globalThis as any)["fetch" as any] = fetch;
//fromWebToken()

const app = express();
const port = process.env.PORT || 8082; // default port to listen

app.get("/", healthCheck);

app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
    console.log(req.url);
    next();
})
//app.use("/api", api);
// define a route handler for the default home page
app.use("/alpha", api);
// start the express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`API Server has been started at http://localhost:${port}`);
    console.log(process.env.CONFIGURATION_ENV)
});