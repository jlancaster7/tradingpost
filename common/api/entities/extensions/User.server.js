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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const client_s3_1 = require("@aws-sdk/client-s3");
const UserApi_1 = __importDefault(require("../apis/UserApi"));
const finicity_1 = require("../../../brokerage/finicity");
const configuration_1 = require("../../../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const finicity_2 = __importDefault(require("../../../finicity"));
const repository_1 = __importDefault(require("../../../brokerage/repository"));
const transformer_1 = require("../../../brokerage/finicity/transformer");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
exports.default = (0, _1.ensureServerExtensions)({
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        const pgp = (0, pg_promise_1.default)({});
        const pgClient = pgp({
            host: pgCfg.host,
            user: pgCfg.user,
            password: pgCfg.password,
            database: pgCfg.database
        });
        yield pgClient.connect();
        const repository = new repository_1.default(pgClient, pgp);
        const finicityCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("finicity");
        const finicity = new finicity_2.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
        const finicityService = new finicity_1.FinicityService(finicity, repository, new transformer_1.FinicityTransformer({
            getFinicityInstitutions() {
                throw new Error("Method Not Implemented");
            },
            getSecuritiesWithIssue() {
                throw new Error("Method Not Implemented");
            },
            getTradingPostAccountsWithFinicityNumber(userId) {
                throw new Error("Method Not Implemented");
            },
        }));
        return {
            link: finicityService.generateBrokerageAuthenticationLink(req.extra.userId)
        };
    }),
    uploadProfilePic: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        if (req.extra.userId !== body.userId) {
            yield client.send(new client_s3_1.PutObjectCommand({
                Bucket: "tradingpost-images",
                Key: `/profile-pics/${body.userId}`,
                Body: body.image
            }));
            yield UserApi_1.default.update(body.userId, {
                has_profile_pic: true
            });
        }
        else
            throw {
                message: "Unathorized",
                code: 401
            };
    })
});
