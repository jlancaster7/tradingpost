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
const index_1 = require("@tradingpost/common/configuration/index");
const pg_promise_1 = __importDefault(require("pg-promise"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield index_1.DefaultConfig.fromSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const conn = pgp({
        host: postgresConfiguration['host'],
        user: postgresConfiguration['user'],
        password: postgresConfiguration['password'],
        database: postgresConfiguration['database']
    });
    yield conn.connect();
    const data = yield conn.result("SELECT symbol from security");
    console.log(data.rows);
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtRUFBc0U7QUFDdEUsNERBQW1DO0FBRW5DLENBQUMsR0FBUSxFQUFFO0lBQ1AsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLHFCQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUM7UUFDYixJQUFJLEVBQUUscUJBQXFCLENBQUMsTUFBTSxDQUFXO1FBQzdDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNLENBQVc7UUFDN0MsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFVBQVUsQ0FBVztRQUNyRCxRQUFRLEVBQUUscUJBQXFCLENBQUMsVUFBVSxDQUFXO0tBQ3hELENBQUMsQ0FBQTtJQUVGLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRXJCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzFCLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQSJ9