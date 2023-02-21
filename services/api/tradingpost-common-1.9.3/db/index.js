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
exports.execProcOne = exports.execProc = exports.init = exports.getHivePool = void 0;
const configuration_1 = require("../configuration");
const pg_1 = __importDefault(require("pg"));
const pg_promise_1 = __importDefault(require("pg-promise"));
const finicity_1 = __importDefault(require("../finicity"));
const portfolio_summary_1 = require("../brokerage/portfolio-summary");
const repository_1 = __importDefault(require("../brokerage/repository"));
const finicity_2 = require("../brokerage/finicity");
const transformer_1 = require("../brokerage/finicity/transformer");
const client_sqs_1 = require("@aws-sdk/client-sqs");
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, (value) => {
    return parseInt(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT8, (value) => {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT4, (value) => {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.NUMERIC, (value) => {
    return parseFloat(value);
});
const debug = true;
exports.getHivePool = (() => __awaiter(void 0, void 0, void 0, function* () {
    let hive;
    const config = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    hive = new pg_1.default.Pool(Object.assign(Object.assign({}, config), { max: 10 }));
    return hive;
}))();
exports.init = (() => __awaiter(void 0, void 0, void 0, function* () {
    const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database,
        max: 10
    });
    const repository = new repository_1.default(pgClient, pgp);
    const finicityCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new finicity_1.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    yield finicity.init();
    const finicityTransformer = new transformer_1.Transformer(repository);
    const finicitySrv = new finicity_2.Service(finicity, repository, finicityTransformer);
    const portfolioSummarySrv = new portfolio_summary_1.PortfolioSummaryService(repository);
    const sqsClient = new client_sqs_1.SQSClient({
        region: 'us-east-1',
    });
    return {
        finicitySrv,
        portfolioSummarySrv,
        sqsClient,
        pgp,
        pgClient
    };
}))();
const execProc = (proc, prms, ensureCount, ensureCountMessage) => __awaiter(void 0, void 0, void 0, function* () {
    const hive = yield exports.getHivePool;
    const result = prms ? yield hive.query(`SELECT *
                                            FROM ${proc}($1)`, [JSON.stringify(prms)]) :
        yield hive.query(`SELECT *
                          FROM ${proc}('{}')`);
    if (ensureCount && result.rowCount !== ensureCount) {
        const defaultError = `Invalid number of results. Expected ${ensureCount} Received:${result.rowCount}`;
        if (debug) {
            console.error(defaultError);
            console.error(JSON.stringify(prms));
            console.error(JSON.stringify(proc));
        }
        throw {
            message: ensureCountMessage || defaultError,
            data: {
                procedure: proc,
                parameters: prms
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBOEM7QUFDOUMsNENBQW1CO0FBQ25CLDREQUFtQztBQUNuQywyREFBbUM7QUFDbkMsc0VBQXVFO0FBQ3ZFLHlFQUFpRDtBQUNqRCxvREFBOEM7QUFDOUMsbUVBQThEO0FBQzlELG9EQUE4QztBQUU5QyxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUM3RCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQy9ELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDL0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUNoRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUVILE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQztBQUVOLFFBQUEsV0FBVyxHQUFHLENBQUMsR0FBUyxFQUFFO0lB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