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
exports.getPgClient = exports.getAWSConfigs = void 0;
const AWS = require('aws-sdk');
const pg_1 = require("pg");
const configuration_1 = require("./configuration");
function getAWSConfigs() {
    return __awaiter(this, void 0, void 0, function* () {
        AWS.config.update({ region: 'us-east-1' });
        const ssmClient = new AWS.SSM();
        const configuration = new configuration_1.Configuration(ssmClient);
        const postgresConfiguration = yield configuration.fromSSM("/production/postgres");
        const twitterConfiguration = yield configuration.fromSSM("/production/twitter");
        const youtubeConfiguration = yield configuration.fromSSM("/production/youtube");
        const spotifyConfiguration = yield configuration.fromSSM("/production/spotify");
        return { twitter: twitterConfiguration, youtube: youtubeConfiguration, postgres: postgresConfiguration, spotify: spotifyConfiguration };
    });
}
exports.getAWSConfigs = getAWSConfigs;
function getPgClient(postgresConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = new pg_1.Client({
            host: postgresConfiguration['host'],
            user: postgresConfiguration['user'],
            database: postgresConfiguration['database'],
            password: postgresConfiguration['password'],
            port: 5432
        });
        yield pg_client.connect();
        return pg_client;
    });
}
exports.getPgClient = getPgClient;
