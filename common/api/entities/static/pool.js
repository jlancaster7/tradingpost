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
let hive;
const debug = true;
const getHivePool = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!hive) {
        const config = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        hive = new pg_1.default.Pool({
            host: process.env.API_DB_HOST || config.host,
            user: process.env.API_DB_USER || config.user,
            password: process.env.API_DB_PASS || config.password,
            database: process.env.API_DB_NAME || config.database,
            port: process.env.API_DB_PORT ? Number(process.env.API_DB_PORT) : config.port
        });
    }
    return hive;
});
exports.getHivePool = getHivePool;
const execProc = (proc, prms, ensureCount, ensureCountMessage) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.getHivePool)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsMERBQXVEO0FBQ3ZELDRDQUFtQjtBQUNuQixJQUFJLElBQWEsQ0FBQTtBQUNqQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7QUFFWixNQUFNLFdBQVcsR0FBRyxHQUFTLEVBQUU7SUFDbEMsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNQLE1BQU0sTUFBTSxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUQsSUFBSSxHQUFHLElBQUksWUFBRSxDQUFDLElBQUksQ0FBQztZQUNmLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSTtZQUM1QyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLElBQUk7WUFDNUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxRQUFRO1lBQ3BELFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsUUFBUTtZQUNwRCxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtTQUNoRixDQUFDLENBQUM7S0FDTjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQSxDQUFBO0FBWlksUUFBQSxXQUFXLGVBWXZCO0FBR00sTUFBTSxRQUFRLEdBQUcsQ0FBb0YsSUFBWSxFQUFFLElBQVEsRUFBRSxXQUFtQixFQUFFLGtCQUEyQixFQUFnRCxFQUFFO0lBQ2xPLE1BQU0sSUFBQSxtQkFBVyxHQUFFLENBQUM7SUFFcEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLElBQUksTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLElBQUksUUFBUSxDQUFDLENBQUE7SUFDbkQsSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxXQUFXLEVBQUU7UUFFaEQsTUFBTSxZQUFZLEdBQUcsdUNBQXVDLFdBQVcsYUFBYSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEcsSUFBSSxLQUFLLEVBQUU7WUFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsTUFBTTtZQUNGLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxZQUFZO1lBQzNDLElBQUksRUFBRTtnQkFDRixTQUFTLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJO2FBQ3BDO1NBQ0osQ0FBQTtLQUNKO0lBRUQsSUFBSSxXQUFXLEtBQUssQ0FBQztRQUNqQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7O1FBQ3BCLE9BQU8sTUFBTSxDQUFDLElBQTZDLENBQUM7QUFDckUsQ0FBQyxDQUFBLENBQUE7QUF0QlksUUFBQSxRQUFRLFlBc0JwQjtBQUVNLE1BQU0sV0FBVyxHQUFHLENBQTBELElBQVksRUFBRSxJQUFRLEVBQUUsa0JBQTJCLEVBQUUsRUFBRTtJQUN4SSxPQUFPLE1BQU0sSUFBQSxnQkFBUSxFQUFlLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDM0UsQ0FBQyxDQUFBLENBQUE7QUFGWSxRQUFBLFdBQVcsZUFFdkIifQ==