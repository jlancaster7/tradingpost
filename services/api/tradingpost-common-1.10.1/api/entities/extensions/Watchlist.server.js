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
const interfaces_1 = require("../../../notifications/interfaces");
exports.default = (0, _1.ensureServerExtensions)({
    get: (watchlistId) => __awaiter(void 0, void 0, void 0, function* () {
    }),
    getAllWatchlists: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const cache = yield (0, cache_1.getUserCache)();
        const { extra: { userId } } = req;
        const curUser = cache[userId];
        const watchlists = yield WatchlistApi_1.default.internal.list({
            user_id: userId,
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
        if (req.body.is_saved) {
            yield pool.query(`INSERT INTO data_watchlist_saved(watchlist_id,user_id) VALUES($1,$2)`, [req.body.id, req.extra.userId]);
            return { id: req.body.id, is_saved: true };
        }
        else {
            yield pool.query(`DELETE FROM data_watchlist_saved WHERE watchlist_id= $1 and user_id = $2`, [req.body.id, req.extra.userId]);
            yield pool.query(`DELETE
                    FROM data_notification_subscription
                    WHERE user_id = $1
                    and type_id = $2
                    and type = $3`, [req.extra.userId, req.body.id, interfaces_1.NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION]);
            return { id: req.body.id, is_saved: false };
        }
    }),
    toggleNotification: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        console.log('toggle api firing');
        if (req.body.is_notification) {
            yield pool.query(`
                    INSERT INTO data_notification_subscription (type, type_id, user_id, disabled)
                    VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, type, type_id)
                              DO
                    UPDATE SET type = EXCLUDED.type, type_id = EXCLUDED.type_id, disabled = EXCLUDED.disabled;`, [interfaces_1.NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION, req.body.id, req.extra.userId, false]);
            return true;
        }
        else {
            yield pool.query(`DELETE
                    FROM data_notification_subscription
                    WHERE user_id = $1
                    and type_id = $2
                    and type = $3`, [req.extra.userId, req.body.id, interfaces_1.NotificationSubscriptionTypes.WATCHLIST_NOTIFICATION]);
            return false;
        }
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2F0Y2hsaXN0LnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIldhdGNobGlzdC5zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3QkFBeUM7QUFDekMsdUNBQTREO0FBRTVELHdFQUFpRTtBQUNqRSxvQ0FBdUM7QUFHdkMsa0VBQWdGO0FBRWhGLGtCQUFlLElBQUEseUJBQXNCLEVBQVk7SUFDN0MsR0FBRyxFQUFFLENBQU8sV0FBbUIsRUFBRSxFQUFFO0lBR25DLENBQUMsQ0FBQTtJQUNELGdCQUFnQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDNUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEdBQUUsQ0FBQztRQUNuQyxNQUFNLEVBQUMsS0FBSyxFQUFFLEVBQUMsTUFBTSxFQUFDLEVBQUMsR0FBRyxHQUFHLENBQUE7UUFDN0IsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLE1BQU0sVUFBVSxHQUFHLE1BQU0sc0JBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2hELE9BQU8sRUFBRSxNQUFNO1lBQ2YsSUFBSSxFQUFFO2dCQUNGLEdBQUcsRUFBRSxPQUFPLENBQUMsVUFBVTthQUMxQjtTQUNKLENBQUMsQ0FBQztRQUVILE9BQU87WUFDSCxLQUFLLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUk7Z0JBQ2pELEVBQUUsRUFBRSxDQUFDO2dCQUNMLFVBQVUsRUFBRSxDQUFDO2dCQUNiLElBQUksRUFBRSxtQkFBbUI7Z0JBQ3pCLElBQUksRUFBRSxTQUFTO2dCQUNmLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2FBQzFCO1lBQ0QsdUJBQXVCO1lBQ3ZCLE9BQU8sRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7WUFDN0UsMkJBQTJCO1lBQzNCLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUM7U0FDdEQsQ0FBQTtJQUNMLENBQUMsQ0FBQTtJQUNELGFBQWEsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQ3pCLDREQUE0RDtRQUM1RCxNQUFNLElBQUksR0FBRyxNQUFNLGdCQUFXLENBQUM7UUFDL0IsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNuQixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsc0VBQXNFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDekgsT0FBTyxFQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDNUM7YUFDSTtZQUNELE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQywwRUFBMEUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUM3SCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7a0NBSUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLDBDQUE2QixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUMvRyxPQUFPLEVBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQTtTQUM1QztJQUNMLENBQUMsQ0FBQTtJQUNELGtCQUFrQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDOUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBVyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNoQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFDO1lBQ3pCLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQzs7OzsrR0FJa0YsRUFDbkcsQ0FBQywwQ0FBNkIsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO1lBQzdGLE9BQU8sSUFBSSxDQUFBO1NBQ2Q7YUFDSTtZQUNELE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQzs7OztrQ0FJSyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsMENBQTZCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBQy9HLE9BQU8sS0FBSyxDQUFBO1NBQ2Y7SUFDTCxDQUFDLENBQUE7Q0FDSixDQUFDLENBQUMifQ==