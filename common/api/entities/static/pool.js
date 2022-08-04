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
exports.execProcOne = exports.execProc = exports.getHivePool = void 0;
const configuration_1 = require("../../../configuration");
const pg_1 = __importDefault(require("pg"));
const debug = true;
exports.getHivePool = (() => __awaiter(void 0, void 0, void 0, function* () {
    let hive;
    const config = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    hive = new pg_1.default.Pool({
        host: process.env.API_DB_HOST || config.host,
        user: process.env.API_DB_USER || config.user,
        password: process.env.API_DB_PASS || config.password,
        database: process.env.API_DB_NAME || config.database,
        port: process.env.API_DB_PORT ? Number(process.env.API_DB_PORT) : config.port
    });
    return hive;
}))();
const execProc = (proc, prms, ensureCount, ensureCountMessage) => __awaiter(void 0, void 0, void 0, function* () {
    const hive = yield exports.getHivePool;
    const result = prms ? yield hive.query(`SELECT * FROM ${proc}($1)`, [JSON.stringify(prms)]) :
        yield hive.query(`SELECT * FROM ${proc}('{}')`);
    if (ensureCount && result.rowCount !== ensureCount) {
        const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
        if (debug) {
            console.error(defaultError);
        }
        throw {
            message: ensureCountMessage || defaultError,
            data: {
                procedure: proc, parameters: prms
            }
        };
    }
    if (ensureCount === 1)
        return result.rows[0];
    else
        return result.rows;
});
exports.execProc = execProc;
const execProcOne = (proc, prms, ensureCountMessage) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, exports.execProc)(proc, prms, 1, ensureCountMessage);
});
exports.execProcOne = execProcOne;
