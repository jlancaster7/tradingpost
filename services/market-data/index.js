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
const luxon_1 = require("luxon");
class Index {
    constructor(repository) {
        this.holidayMap = {};
        this.isMarketOpen = () => __awaiter(this, void 0, void 0, function* () {
            yield this.setMarketHolidays();
            let currentTime = luxon_1.DateTime.now().setZone("America/New_York");
            const marketDate = currentTime.set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            });
            const isTradingDay = yield this.isTradingDay(marketDate);
            if (!isTradingDay)
                return false;
            let marketClose = currentTime.set({
                hour: 16,
                minute: 0,
                second: 0,
                millisecond: 0
            });
            let marketOpen = currentTime.set({
                hour: 9,
                minute: 30,
                second: 0,
                millisecond: 0
            });
            return currentTime >= marketOpen && currentTime <= marketClose;
        });
        this.isTradingDay = (t) => __awaiter(this, void 0, void 0, function* () {
            yield this.setMarketHolidays();
            return this.holidayMap[t.toUnixInteger()] === undefined;
        });
        this.setMarketHolidays = () => __awaiter(this, void 0, void 0, function* () {
            if (Object.keys(this.holidayMap).length === 0) {
                let holidays = yield this.repository.getCurrentAndFutureExchangeHolidays();
                holidays.forEach((h) => this.holidayMap[h.date.toUnixInteger()] = {});
            }
        });
        this.repository = repository;
    }
}
exports.default = Index;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLGlDQUErQjtBQUcvQixNQUFxQixLQUFLO0lBSXRCLFlBQVksVUFBc0I7UUFGMUIsZUFBVSxHQUEyQixFQUFFLENBQUM7UUFNaEQsaUJBQVksR0FBRyxHQUEyQixFQUFFO1lBQ3hDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFL0IsSUFBSSxXQUFXLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtZQUM1RCxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO2dCQUMvQixJQUFJLEVBQUUsQ0FBQztnQkFDUCxNQUFNLEVBQUUsQ0FBQztnQkFDVCxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsQ0FBQzthQUNqQixDQUFDLENBQUM7WUFFSCxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFaEMsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQztnQkFDOUIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLENBQUM7YUFDakIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQztnQkFDN0IsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLENBQUM7YUFDakIsQ0FBQyxDQUFDO1lBRUgsT0FBTyxXQUFXLElBQUksVUFBVSxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUM7UUFDbkUsQ0FBQyxDQUFBLENBQUE7UUFFRCxpQkFBWSxHQUFHLENBQU8sQ0FBVyxFQUFvQixFQUFFO1lBQ25ELE1BQU0sSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDL0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxLQUFLLFNBQVMsQ0FBQztRQUM1RCxDQUFDLENBQUEsQ0FBQTtRQUVELHNCQUFpQixHQUFHLEdBQVMsRUFBRTtZQUMzQixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzNDLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO2dCQUMzRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBdUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDL0Y7UUFDTCxDQUFDLENBQUEsQ0FBQTtRQTVDRyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0NBNENKO0FBbERELHdCQWtEQyJ9