"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_ssm_1 = require("@aws-sdk/client-ssm");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_api_v1_1 = __importDefault(require("./routes-api-v1"));
require("dotenv/config");
//fromWebToken()
const ssm = new client_ssm_1.SSM({
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
    const app = (0, express_1.default)();
    const port = 8082; // default port to listen
    app.use(body_parser_1.default.json());
    //app.use("/api", api);
    // define a route handler for the default home page
    app.use("/alpha", routes_api_v1_1.default);
    // start the express server
    app.listen(port, () => {
        // tslint:disable-next-line:no-console
        console.log(`API Server has been started at http://localhost:${port}`);
    });
}).catch((ex) => {
    console.log(ex);
});
