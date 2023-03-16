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
const db_1 = require("../../../db");
const Subscription_server_1 = __importDefault(require("../extensions/Subscription.server"));
exports.default = (0, _1.ensureServerExtensions)({
    insertWithNotification: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, db_1.execProc)('public.api_subscriber_insert', {
            user_id: req.extra.userId,
            data: {
                subscription_id: req.body.subscription_id,
                start_date: req.body.start_date,
                approved: req.body.approved
            }
        });
        const user = (yield (0, db_1.execProc)('public.api_user_get', {
            data: { id: req.extra.userId }
        }))[0];
        if (result[0].subscription[0].settings.approve_new) {
            const pool = yield db_1.getHivePool;
            yield pool.query(`INSERT INTO notification(user_id, type, date_time, data)
                              VALUES ($1, $2, $3, $4)`, [req.body.user_id, 'NEW_SUBSCRIPTION', new Date(), {
                    userId: req.extra.userId,
                    handle: user.handle,
                    message: 'has subscribed to you.',
                    subscriber_id: result[0].id,
                    approved: false,
                }]);
        }
        return {};
    }),
    getByOwner: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const sub = yield Subscription_server_1.default.getByUserId({
            body: undefined,
            extra: {
                userId: req.extra.userId
            }
        });
        //get my subscription 
        return (sub === null || sub === void 0 ? void 0 : sub.id) ? (yield (yield db_1.getHivePool)
            .query("SELECT * FROM view_subscriber_list('{}') where subscription_id = $1", [sub === null || sub === void 0 ? void 0 : sub.id])).rows : [];
    }),
    getBySubscriber: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //get my subscription 
        return (yield (yield db_1.getHivePool)
            .query("SELECT * FROM view_subscriber_list('{}') where user_id = $1", [req.extra.userId])).rows;
    }),
    removeSubscription: (req) => __awaiter(void 0, void 0, void 0, function* () {
        //TODO: make this work with the idea of this being a ledger... should not be a hard delete ....
        yield (yield db_1.getHivePool)
            .query('DELETE FROM data_subscriber where user_id = $1 and subscription_id = $2', [req.body.userId ? req.body.userId : req.extra.userId, req.body.subscriptionId]);
        return null;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaWJlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTdWJzY3JpYmVyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHdCQUFvRDtBQUNwRCxvQ0FBa0Q7QUFFbEQsNEZBQTZEO0FBSTdELGtCQUFlLElBQUEseUJBQXNCLEVBQWE7SUFDOUMsc0JBQXNCLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRTtRQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsYUFBUSxFQUFDLDhCQUE4QixFQUFFO1lBQzFELE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU07WUFDekIsSUFBSSxFQUFFO2dCQUNGLGVBQWUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWU7Z0JBQ3pDLFVBQVUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVU7Z0JBQy9CLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVE7YUFDOUI7U0FFSixDQUFDLENBQUE7UUFDRixNQUFNLElBQUksR0FBYSxDQUFDLE1BQU0sSUFBQSxhQUFRLEVBQUMscUJBQXFCLEVBQUU7WUFDMUQsSUFBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFDO1NBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ04sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDaEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxnQkFBVyxDQUFDO1lBQy9CLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQztzREFDeUIsRUFDdEMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFO29CQUMvQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNO29CQUN4QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLE9BQU8sRUFBRSx3QkFBd0I7b0JBQ2pDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDM0IsUUFBUSxFQUFFLEtBQUs7aUJBQ2xCLENBQUMsQ0FBQyxDQUFDO1NBQ1g7UUFDRCxPQUFPLEVBQUUsQ0FBQTtJQUNiLENBQUMsQ0FBQTtJQUNELFVBQVUsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBRXRCLE1BQU0sR0FBRyxHQUFHLE1BQU0sNkJBQVksQ0FBQyxXQUFXLENBQUM7WUFDdkMsSUFBSSxFQUFFLFNBQVM7WUFDZixLQUFLLEVBQUU7Z0JBQ0gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTthQUMzQjtTQUNKLENBQUMsQ0FBQTtRQUNGLHNCQUFzQjtRQUN0QixPQUFPLENBQUEsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxnQkFBVyxDQUFDO2FBQ3RDLEtBQUssQ0FBQyxxRUFBcUUsRUFBRSxDQUFDLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDNUcsQ0FBQyxDQUFBO0lBQ0QsZUFBZSxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDM0Isc0JBQXNCO1FBQ3RCLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxnQkFBVyxDQUFDO2FBQzVCLEtBQUssQ0FBQyw2REFBNkQsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN4RyxDQUFDLENBQUE7SUFDRCxrQkFBa0IsRUFBRSxDQUFPLEdBQUcsRUFBRSxFQUFFO1FBQzlCLCtGQUErRjtRQUMvRixNQUFNLENBQUMsTUFBTSxnQkFBVyxDQUFDO2FBQ3BCLEtBQUssQ0FBQyx5RUFBeUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ3ZLLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQSJ9