import { SSM } from '@aws-sdk/client-ssm'
import express from 'express'
import bodyParser from 'body-parser';
import api from './routes-api-v1'
import 'dotenv/config'
//fromWebToken()

const ssm = new SSM({
    apiVersion: '2014-11-06',
    region: "us-east-1"
});

ssm.getParameters({
    Names: ["TokenKey", "PG_PW"]
}).then((params) => {
    const [{ Value: token }, { Value: pgPW }] = params.Parameters || [];
    process.env.tokenKey = token;
    process.env.postgressPW = pgPW;
    process.env.postgressUN = "hive_root_user";

    const app = express();
    const port = 8082; // default port to listen

    app.use(bodyParser.json())
    //app.use("/api", api);
    // define a route handler for the default home page
    app.use("/alpha", api);
    // start the express server
    app.listen(port, () => {
        // tslint:disable-next-line:no-console
        console.log(`API Server has been started at http://localhost:${port}`);
    });

}).catch((ex) => {
    console.log(ex);
});
