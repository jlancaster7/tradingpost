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
require("dotenv/config");
const realizefi_provider_1 = __importDefault(require("./realizefi-provider"));
const realizefi_1 = __importDefault(require("@tradingpost/common/realizefi"));
const repository_1 = __importDefault(require("./repository"));
const configuration_1 = require("@tradingpost/common/configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const service_1 = __importDefault(require("./service"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const conn = pgp({
        host: postgresConfiguration['host'],
        user: postgresConfiguration['user'],
        password: postgresConfiguration['password'],
        database: postgresConfiguration['database']
    });
    const realizefi = new realizefi_1.default(process.env.REALIZEFI_SECRET_KEY || "", process.env.REALIZEFI_AUTH_URLS || "");
    const repository = new repository_1.default(conn, pgp);
    const realizefiProvider = new realizefi_provider_1.default(realizefi, repository);
    // const userId = 'usr_DCEwWdTVMg3exFlUVMic4Rhgr851kz8p';
    // const institutionId = 'il_UlaMrIsnVBGLCuME9todgFh1rweYkblX';
    // await realizefiProvider.importPositions(userId)
    const brokerageService = new service_1.default(realizefiProvider, repository);
    yield brokerageService.newRealizefiAccounts('');
}))();
