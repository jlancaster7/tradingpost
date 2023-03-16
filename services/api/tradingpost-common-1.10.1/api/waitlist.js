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
exports.addToWaitlist = void 0;
const index_1 = require("../db/index");
const addToWaitlist = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield index_1.getHivePool;
        const result = yield pool.query(`INSERT INTO waitlist_beta(email) VALUES ($1)`, [email]);
        return result;
    }
    catch (err) {
        console.error(err);
        return;
    }
});
exports.addToWaitlist = addToWaitlist;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FpdGxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3YWl0bGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMEM7QUFFbkMsTUFBTSxhQUFhLEdBQUcsQ0FBTyxLQUFhLEVBQUUsRUFBRTtJQUNqRCxJQUFJO1FBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxtQkFBVyxDQUFDO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDekYsT0FBTyxNQUFNLENBQUM7S0FDakI7SUFDRCxPQUFPLEdBQUcsRUFBRTtRQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsT0FBTTtLQUNUO0FBRUwsQ0FBQyxDQUFBLENBQUE7QUFYWSxRQUFBLGFBQWEsaUJBV3pCIn0=