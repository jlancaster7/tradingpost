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
const brokerage_1 = __importDefault(require("../../../brokerage"));
const configuration_1 = require("../../../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const finicity_1 = __importDefault(require("../../../finicity"));
const repository_1 = __importDefault(require("../../../brokerage/repository"));
const pool_1 = require("../static/pool");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
let finicityService;
exports.default = (0, _1.ensureServerExtensions)({
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO: make this use a better pardigm... is a pool being used? Alternatively Maybe we ensure this loads when the server gets up and running.
        if (!finicityService) {
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
            const finicity = new finicity_1.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
            yield finicity.init();
            finicityService = new brokerage_1.default(pgClient, pgp, finicity);
        }
        //console.log(typeof test);
        //console.log(JSON.stringify(test));
        return {
            link: yield finicityService.generateBrokerageAuthenticationLink(req.extra.userId, "finicity")
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
    }),
    getBrokerageAccounts: (r) => __awaiter(void 0, void 0, void 0, function* () {
        return (0, pool_1.execProc)("public.api_brokerage_account", {
            user_id: r.extra.userId,
            data: {}
        });
    }),
    initBrokerageAccounts: () => __awaiter(void 0, void 0, void 0, function* () {
        return [];
    }),
    linkSocialAccount: (req) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.body.platform === "twitter") {
            const info = yield fetch("https://api.twitter.com/2/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: req.body.code,
                    grant_type: "authorization_code",
                    client_id: "cm9mUHBhbVUxZzcyVGJNX0xrc2E6MTpjaQ",
                    redirect_uri: 'http://localhost:19006/auth/twitter',
                    code_verifier: req.body.challenge
                }),
            });
            return (yield info.json()).access_token;
        }
        else
            return "";
    })
});
