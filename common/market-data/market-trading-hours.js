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
class MarketTradingHours {
    constructor(repository) {
        this.holidayMap = {};
        this.isOpen = () => __awaiter(this, void 0, void 0, function* () {
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
exports.default = MarketTradingHours;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2V0LXRyYWRpbmctaG91cnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYXJrZXQtdHJhZGluZy1ob3Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLGlDQUErQjtBQUcvQixNQUFxQixrQkFBa0I7SUFJbkMsWUFBWSxVQUFzQjtRQUYxQixlQUFVLEdBQTJCLEVBQUUsQ0FBQztRQU1oRCxXQUFNLEdBQUcsR0FBMkIsRUFBRTtZQUNsQyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRS9CLElBQUksV0FBVyxHQUFHLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDNUQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQztnQkFDL0IsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsV0FBVyxFQUFFLENBQUM7YUFDakIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxZQUFZO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRWhDLElBQUksV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUM7Z0JBQzlCLElBQUksRUFBRSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxDQUFDO2dCQUNULE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2FBQ2pCLENBQUMsQ0FBQztZQUVILElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUM7Z0JBQzdCLElBQUksRUFBRSxDQUFDO2dCQUNQLE1BQU0sRUFBRSxFQUFFO2dCQUNWLE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2FBQ2pCLENBQUMsQ0FBQztZQUVILE9BQU8sV0FBVyxJQUFJLFVBQVUsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDO1FBQ25FLENBQUMsQ0FBQSxDQUFBO1FBRUQsaUJBQVksR0FBRyxDQUFPLENBQVcsRUFBb0IsRUFBRTtZQUNuRCxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxTQUFTLENBQUM7UUFDNUQsQ0FBQyxDQUFBLENBQUE7UUFFRCxzQkFBaUIsR0FBRyxHQUFTLEVBQUU7WUFDM0IsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzQyxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztnQkFDM0UsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQXVCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQy9GO1FBQ0wsQ0FBQyxDQUFBLENBQUE7UUE1Q0csSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztDQTRDSjtBQWxERCxxQ0FrREMifQ==