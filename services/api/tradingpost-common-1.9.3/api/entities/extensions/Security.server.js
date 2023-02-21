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
const cache_1 = require("../../cache");
const db_1 = require("../../../db");
const SecurityApi_1 = __importDefault(require("../static/SecurityApi"));
exports.default = (0, _1.ensureServerExtensions)({
    get: (sec, extra) => __awaiter(void 0, void 0, void 0, function* () {
        const prices = yield cache_1.getPriceCacheTask;
        sec.price = prices.byTicker[sec.symbol];
        //get user's quick watch
        const pool = yield db_1.getHivePool;
        const item = yield pool.query("SELECT * FROM public.data_watchlist_item where symbol=$1 and watchlist_id =(SELECT id from public.data_watchlist where type ='primary' and user_id = $2)", [sec.symbol, extra.userId]);
        sec.isOnQuickWatch = Boolean(item.rows.length);
    }),
    quickadd: (r) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_1.execProc)("tp.api_security_quickadd", {
            user_id: r.extra.userId,
            data: r.body
        });
    }),
    list: () => SecurityApi_1.default.internal.list(),
    getPrices: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const { securityId } = req.body;
        const db = yield db_1.getHivePool;
        const pricingPromises = [null, null];
        if (req.body.includeIntraday) {
            pricingPromises[1] = db.query(`SELECT high, low, open, price, time
              FROM security_price
              WHERE is_intraday = true
                AND security_id = $1
              ORDER BY time DESC`, [securityId]);
        }
        if (req.body.includeHistorical) {
            pricingPromises[0] = db.query(`SELECT high, low, open, price, time
              FROM security_price
              WHERE is_eod = true
                AND security_id = $1
              ORDER BY time asc`, [securityId]);
        }
        const [historical, intraday] = yield Promise.all(pricingPromises);
        let res = {
            historical: [],
            intraday: [],
        };
        if (req.body.includeIntraday) {
            intraday && intraday.rows.forEach((r) => {
                return res.intraday.push({
                    high: parseFloat(r.high),
                    low: parseFloat(r.low),
                    open: parseFloat(r.open),
                    close: parseFloat(r.price),
                    date: r.time.toString()
                });
            });
        }
        if (req.body.includeHistorical) {
            historical && historical.rows.forEach((r) => {
                return res.historical.push({
                    high: parseFloat(r.high),
                    low: parseFloat(r.low),
                    open: parseFloat(r.open),
                    close: parseFloat(r.price),
                    date: r.time.toString()
                });
            });
        }
        return res;
    }),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VjdXJpdHkuc2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2VjdXJpdHkuc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0JBQXlDO0FBQ3pDLHVDQUE0RDtBQUU1RCxvQ0FBa0Q7QUFDbEQsd0VBQWdEO0FBS2hELGtCQUFlLElBQUEseUJBQXNCLEVBQVc7SUFDNUMsR0FBRyxFQUFFLENBQU8sR0FBaUIsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUNwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLHlCQUFpQixDQUFDO1FBRXZDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsd0JBQXdCO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sZ0JBQVcsQ0FBQztRQUMvQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsMEpBQTBKLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ROLEdBQUcsQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbEQsQ0FBQyxDQUFBO0lBQ0QsUUFBUSxFQUFFLENBQU8sQ0FBQyxFQUFFLEVBQUU7UUFFbEIsTUFBTSxJQUFBLGFBQVEsRUFBQywwQkFBMEIsRUFBRTtZQUN2QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQ3ZCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtTQUNmLENBQUMsQ0FBQTtJQUNOLENBQUMsQ0FBQTtJQUNELElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7SUFDdkMsU0FBUyxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDckIsTUFBTSxFQUFDLFVBQVUsRUFBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDOUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxnQkFBVyxDQUFDO1FBQzdCLE1BQU0sZUFBZSxHQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDMUIsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQzVCOzs7O2lDQUlvQixFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUM1QixlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FDNUI7Ozs7Z0NBSW1CLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbEUsSUFBSSxHQUFHLEdBQW9CO1lBQ3ZCLFVBQVUsRUFBRSxFQUFFO1lBQ2QsUUFBUSxFQUFFLEVBQUU7U0FDZixDQUFBO1FBRUQsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUMxQixRQUFRLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUE2RCxFQUFFLEVBQUU7Z0JBQ2hHLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ3JCLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDeEIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUN0QixJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDMUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2lCQUMxQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQTtTQUNMO1FBRUQsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzVCLFVBQVUsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQTZELEVBQUUsRUFBRTtnQkFDcEcsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUN4QixHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ3RCLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDeEIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO29CQUMxQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7aUJBQzFCLENBQUMsQ0FBQTtZQUNOLENBQUMsQ0FBQyxDQUFBO1NBQ0w7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQSJ9