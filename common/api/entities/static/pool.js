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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMERBQXVEO0FBQ3ZELDRDQUFtQjtBQUduQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7QUFFTixRQUFBLFdBQVcsR0FBRyxDQUFDLEdBQVMsRUFBRTtJQUNuQyxJQUFJLElBQWEsQ0FBQTtJQUVqQixNQUFNLE1BQU0sR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzlELElBQUksR0FBRyxJQUFJLFlBQUUsQ0FBQyxJQUFJLENBQUM7UUFDZixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUk7UUFDNUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJO1FBQzVDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsUUFBUTtRQUNwRCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLFFBQVE7UUFDcEQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUk7S0FDaEYsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFBO0FBR0csTUFBTSxRQUFRLEdBQUcsQ0FBc0csSUFBWSxFQUFFLElBQVEsRUFBRSxXQUFtQixFQUFFLGtCQUEyQixFQUFnRCxFQUFFO0lBQ3BQLE1BQU0sSUFBSSxHQUFHLE1BQU0sbUJBQVcsQ0FBQztJQUUvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxRQUFRLENBQUMsQ0FBQTtJQUNuRCxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsUUFBUSxLQUFLLFdBQVcsRUFBRTtRQUVoRCxNQUFNLFlBQVksR0FBRyx1Q0FBdUMsV0FBVyxhQUFhLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0RyxJQUFJLEtBQUssRUFBRTtZQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDL0I7UUFDRCxNQUFNO1lBQ0YsT0FBTyxFQUFFLGtCQUFrQixJQUFJLFlBQVk7WUFDM0MsSUFBSSxFQUFFO2dCQUNGLFNBQVMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUk7YUFDcEM7U0FDSixDQUFBO0tBQ0o7SUFFRCxJQUFJLFdBQVcsS0FBSyxDQUFDO1FBQ2pCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTs7UUFDcEIsT0FBTyxNQUFNLENBQUMsSUFBNkMsQ0FBQztBQUNyRSxDQUFDLENBQUEsQ0FBQTtBQXRCWSxRQUFBLFFBQVEsWUFzQnBCO0FBRU0sTUFBTSxXQUFXLEdBQUcsQ0FBNEUsSUFBWSxFQUFFLElBQVEsRUFBRSxrQkFBMkIsRUFBRSxFQUFFO0lBQzFKLE9BQU8sTUFBTSxJQUFBLGdCQUFRLEVBQWUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUMzRSxDQUFDLENBQUEsQ0FBQTtBQUZZLFFBQUEsV0FBVyxlQUV2QiJ9