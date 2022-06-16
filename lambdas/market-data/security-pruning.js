"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("@tradingpost/common/configuration");
const pg_1 = require("pg");
const repository_1 = require("../../services/market-data/repository");
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ssmClient = new AWS.SSM();
const configuration = new configuration_1.Configuration(ssmClient);
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield configuration.fromSSM("/production/postgres");
    const pgClient = new pg_1.Client({
        host: postgresConfiguration['host'],
        user: postgresConfiguration['user'],
        password: postgresConfiguration['password'],
        database: postgresConfiguration['database'],
        port: 5432,
    });
    yield pgClient.connect();
    const repository = new repository_1.Repository(pgClient);
    yield start(repository);
    yield pgClient.end();
});
const start = (repository) => __awaiter(void 0, void 0, void 0, function* () {
    yield repository.removeSecurityPricesAfter7Days();
});
module.exports.run = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
});
