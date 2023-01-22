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
const _1 = require(".");
const db_1 = require("../../../db");
exports.default = (0, _1.ensureServerExtensions)({
    getByUserId: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        //todo: resolve wtf is up with the view
        const result = yield pool.query(`SELECT id, 
                                                                  user_id, 
                                                                  name, 
                                                                  cost, 
                                                                  settings, 
                                                                  created_at, 
                                                                  updated_at 
                                                           FROM data_subscription WHERE user_id = $1`, [req.extra.userId]);
        //todo: put in fix to trasnlate types that DJ mentioned instead of everything being a string ( oh postgres...... /sigh ;) )
        if (result.rows.length) {
            result.rows[0].cost = parseFloat(result.rows[0].cost.substring(1));
        }
        return result.rows[0] || null;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9uLnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlN1YnNjcmlwdGlvbi5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx3QkFBc0Q7QUFDdEQsb0NBQTBDO0FBSTFDLGtCQUFlLElBQUEseUJBQXNCLEVBQWU7SUFDaEQsV0FBVyxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBVyxDQUFDO1FBQy9CLHVDQUF1QztRQUN2QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQW1COzs7Ozs7O3FHQU8yQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1FBRWxILDJIQUEySDtRQUMzSCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDeEY7UUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ2xDLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQSJ9