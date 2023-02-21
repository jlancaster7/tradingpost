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
const WatchlistApi_1 = __importDefault(require("../apis/WatchlistApi"));
const db_1 = require("../../../db");
exports.default = (0, _1.ensureServerExtensions)({
    get: (watchlist) => __awaiter(void 0, void 0, void 0, function* () {
        const prices = yield cache_1.getPriceCacheTask;
        watchlist.items.forEach((wi) => {
            const found = prices.byTicker[wi.symbol];
            wi.price = found;
        });
        //return watchlist;
    }),
    getAllWatchlists: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const cache = yield (0, cache_1.getUserCache)();
        const curUser = cache[req.extra.userId];
        const { extra: { userId } } = req;
        const watchlists = yield WatchlistApi_1.default.internal.list({
            user_id: req.extra.userId,
            data: {
                ids: curUser.watchlists
            }
        });
        return {
            quick: watchlists.find(w => w.type === "primary") || {
                id: 0,
                item_count: 0,
                name: "Invalid Watchlist",
                type: "primary",
                saved_by_count: 0,
                user: [curUser.profile]
            },
            //get all my watchlists
            created: watchlists.filter(w => w.user_id === userId && w.type !== "primary"),
            //get all shared watchlists
            saved: watchlists.filter(w => w.user_id !== userId)
        };
    }),
    saveWatchlist: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO:  need to to add incorp into api build in the future 
        const pool = yield db_1.getHivePool;
        if (req.body.is_saved)
            yield pool.query(`INSERT INTO data_watchlist_saved(watchlist_id,user_id) VALUES($1,$2)`, [req.body.id, req.extra.userId]);
        else
            yield pool.query(`DELETE FROM data_watchlist_saved WHERE watchlist_id= $1 and user_id = $2`, [req.body.id, req.extra.userId]);
        return req.body;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2F0Y2hsaXN0LnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIldhdGNobGlzdC5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBMkM7QUFDM0MsdUNBQThEO0FBRTlELHdFQUFtRTtBQUNuRSxvQ0FBMEM7QUFJMUMsa0JBQWUsSUFBQSx5QkFBc0IsRUFBWTtJQUM3QyxHQUFHLEVBQUUsQ0FBTyxTQUF3QixFQUFFLEVBQUU7UUFDcEMsTUFBTSxNQUFNLEdBQUcsTUFBTSx5QkFBaUIsQ0FBQztRQUV0QyxTQUE4QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUNqRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUd4QyxFQUFFLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQTtRQUdGLG1CQUFtQjtJQUN2QixDQUFDLENBQUE7SUFDRCxnQkFBZ0IsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQzVCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxvQkFBWSxHQUFFLENBQUM7UUFDbkMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFBO1FBQ2pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sc0JBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2hELE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU07WUFDekIsSUFBSSxFQUFFO2dCQUNGLEdBQUcsRUFBRSxPQUFPLENBQUMsVUFBVTthQUMxQjtTQUNKLENBQUMsQ0FBQztRQUdILE9BQU87WUFDSCxLQUFLLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUk7Z0JBQ2pELEVBQUUsRUFBRSxDQUFDO2dCQUNMLFVBQVUsRUFBRSxDQUFDO2dCQUNiLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxTQUFTO2dCQUNmLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2FBQzFCO1lBQ0QsdUJBQXVCO1lBQ3ZCLE9BQU8sRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7WUFDN0UsMkJBQTJCO1lBQzNCLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUM7U0FDdEQsQ0FBQTtJQUNMLENBQUMsQ0FBQTtJQUNELGFBQWEsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQ3pCLDREQUE0RDtRQUM1RCxNQUFNLElBQUksR0FBRyxNQUFNLGdCQUFXLENBQUM7UUFDL0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDakIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLHNFQUFzRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBOztZQUV6SCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsMEVBQTBFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFFakksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO0lBQ3BCLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQyJ9