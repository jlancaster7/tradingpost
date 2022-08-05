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
process.env.CONFIGURATION_ENV = 'production';
const randomstring_1 = __importDefault(require("randomstring"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const crypto_1 = __importDefault(require("crypto"));
const base64url_1 = __importDefault(require("base64url"));
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const _1 = require(".");
const configuration_1 = require("../../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const redirectUri = 'http://localhost:19006/auth/twitter';
(() => __awaiter(void 0, void 0, void 0, function* () {
    let pgClient;
    let pgp;
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    pgp = (0, pg_promise_1.default)({});
    pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    yield pgClient.connect();
    const twitterConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("twitter");
    const codeVerifier = randomstring_1.default.generate(100);
    const base64Digest = crypto_1.default.createHash("sha256")
        .update(codeVerifier)
        .digest("base64");
    const codeChallenge = base64url_1.default.fromBase64(base64Digest);
    const searchParams = new URLSearchParams({
        response_type: 'code',
        client_id: twitterConfiguration.client_id,
        //redirect_uri: redirectUri,
        //scope: 'tweet.read,users.read,offline.access',
        state: codeVerifier,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });
    let authorizationUrl = `https://twitter.com/i/oauth2/authorize?` + searchParams + `&scope=tweet.read%20users.read%20offline.access&redirect_uri=${redirectUri}`;
    console.log(authorizationUrl);
    let server = http_1.default.createServer(function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.url == '/') { //check the URL of the current request
                // set response header
                res.writeHead(301, { "Location": authorizationUrl });
                res.end();
            }
            if (req.url.startsWith('/auth/twitter')) {
                //console.log(url.parse(req.url!));
                // @ts-ignore
                let q = url_1.default.parse(req.url, true).query;
                const params = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        code: q.code,
                        grant_type: 'authorization_code',
                        client_id: twitterConfiguration.client_id,
                        code_verifier: q.state,
                        redirect_uri: redirectUri
                    })
                };
                const response = yield (0, node_fetch_1.default)('https://api.twitter.com/2/oauth2/token', params);
                const tokens = yield response.json();
                // Get access and refresh tokens (if access_type is offline)
                const addUser = yield (0, _1.addTwitterUsersByToken)({ userId: 'a71912d5-d505-4b88-a1af-c36f610be84d',
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiration: tokens.expires_in }, pgClient, pgp, twitterConfiguration);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(`<html><body><p>complete</p></body></html>`);
                res.end();
            }
        });
    });
    server.listen(19006); //6 - listen for any incoming requests
    console.log('Node.js web server at port 19006 is running..');
}))();
