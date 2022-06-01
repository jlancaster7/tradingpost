"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_ssm_1 = require("@aws-sdk/client-ssm");
//fromWebToken()
var ssm = new client_ssm_1.SSM({
    apiVersion: '2014-11-06',
    region: "us-east-1"
});
ssm.getParameters({
    Names: ["TokenKey", "PG_PW"]
}).then(function (params) {
    console.log(JSON.stringify(params.Parameters));
    var _a = params.Parameters || [], token = _a[0].Value, pgPW = _a[1].Value;
    process.env.tokenKey = token;
    process.env.postgressPW = pgPW;
    process.env.postgressUN = "hive_root_user";
}).catch(function (ex) {
    console.log(ex);
});
