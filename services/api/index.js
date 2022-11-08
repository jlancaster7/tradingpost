"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { SSM } from '@aws-sdk/client-ssm'
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var routes_api_alpha_1 = __importDefault(require("./routes-api-alpha"));
var cors_1 = __importDefault(require("cors"));
var healthcheck_1 = require("./healthcheck");
var node_fetch_1 = __importDefault(require("node-fetch"));
var EntityApiBase_1 = require("@tradingpost/common/api/entities/static/EntityApiBase");
globalThis["fetch"] = node_fetch_1.default;
//fromWebToken()
var app = (0, express_1.default)();
var port = process.env.PORT || 8082; // default port to listen
app.get("/", healthcheck_1.healthCheck);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(function (req, res, next) {
    next();
});
//app.use("/api", api);
// define a route handler for the default home page
//app.use("/alpha", api);
app.use("/" + EntityApiBase_1.versionCode, routes_api_alpha_1.default);
// start the express server
app.listen(port, function () {
    // tslint:disable-next-line:no-console
    console.log("API Server has been started at http://localhost:".concat(port));
    if (process.env.CONFIGURATION_ENV === "development") {
    }
    console.log(process.env.CONFIGURATION_ENV);
});
