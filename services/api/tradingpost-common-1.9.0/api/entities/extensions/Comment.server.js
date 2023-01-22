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
    postList: (r) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield db_1.getHivePool;
        const query = `SELECT q.id,
                              related_type,
                              related_id,
                              comment,
                              user_id,
                              created_at,
                              updated_at,
                              f.handle,
                              f.display_name,
                              f.profile_url,
                              f.subscription
                       FROM data_comment AS q
                                LEFT JOIN api_user_list('{}') AS f
                                          ON
                                              q.user_id = f.id
                       WHERE q.related_type = $1
                         AND q.related_id = $2
        `;
        const result = yield pool.query(query, [r.body.type, r.body.id]);
        if (!result.rowCount) {
            return [];
        }
        else {
            return result.rows.map((a) => {
                let o = {
                    id: a.id,
                    related_type: a.related_type,
                    related_id: a.related_id,
                    comment: a.comment,
                    user_id: a.user_id,
                    created_at: a.created_at,
                    updated_at: a.updated_at,
                    handle: a.handle,
                    display_name: a.display_name,
                    profile_url: a.profile_url,
                    subscription: a.subscriber
                };
                return o;
            });
        }
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWVudC5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb21tZW50LnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHdCQUF3QztBQUV4QyxvQ0FBd0M7QUFZeEMsa0JBQWUsSUFBQSx5QkFBc0IsRUFBVTtJQUMzQyxRQUFRLEVBQUUsQ0FBTyxDQUFDLEVBQUUsRUFBRTtRQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLGdCQUFXLENBQUM7UUFDL0IsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBaUJiLENBQUE7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxDQUFBO1NBQ1o7YUFBTTtZQUNILE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLEdBQWlCO29CQUNsQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUU7b0JBQ1IsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZO29CQUM1QixVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVU7b0JBQ3hCLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztvQkFDbEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO29CQUNsQixVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVU7b0JBQ3hCLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTtvQkFDeEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO29CQUNoQixZQUFZLEVBQUUsQ0FBQyxDQUFDLFlBQVk7b0JBQzVCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztvQkFDMUIsWUFBWSxFQUFFLENBQUMsQ0FBQyxVQUFVO2lCQUM3QixDQUFBO2dCQUNELE9BQU8sQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUE7U0FDTDtJQUVMLENBQUMsQ0FBQTtDQUNKLENBQUMsQ0FBQSJ9