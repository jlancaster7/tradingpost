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
exports.developmentAlert = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const index_1 = require("../configuration/index");
// Webhook Url Below
const developmentAlert = () => __awaiter(void 0, void 0, void 0, function* () {
    const teams = yield index_1.DefaultConfig.fromCacheOrSSM("teams");
    const res = yield (0, node_fetch_1.default)(teams.alertChannel, {
        method: 'POST',
        body: JSON.stringify({
            text: "Test Notification"
        })
    });
});
exports.developmentAlert = developmentAlert;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0REFBK0I7QUFDL0Isa0RBQXFEO0FBQ3JELG9CQUFvQjtBQUViLE1BQU0sZ0JBQWdCLEdBQUcsR0FBUyxFQUFFO0lBQ3ZDLE1BQU0sS0FBSyxHQUFHLE1BQU0scUJBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDekQsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFBLG9CQUFLLEVBQUMsS0FBSyxDQUFDLFlBQVksRUFBRTtRQUN4QyxNQUFNLEVBQUUsTUFBTTtRQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2pCLElBQUksRUFBRSxtQkFBbUI7U0FDNUIsQ0FBQztLQUNMLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQSxDQUFBO0FBUlksUUFBQSxnQkFBZ0Isb0JBUTVCIn0=