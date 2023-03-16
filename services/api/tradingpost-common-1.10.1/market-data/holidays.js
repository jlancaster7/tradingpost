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
class Holidays {
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
exports.default = Holidays;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9saWRheXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJob2xpZGF5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLGlDQUErQjtBQUcvQixNQUFxQixRQUFRO0lBSXpCLFlBQVksVUFBc0I7UUFGMUIsZUFBVSxHQUEyQixFQUFFLENBQUM7UUFNaEQsV0FBTSxHQUFHLEdBQTJCLEVBQUU7WUFDbEMsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUvQixJQUFJLFdBQVcsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1lBQzVELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUM7Z0JBQy9CLElBQUksRUFBRSxDQUFDO2dCQUNQLE1BQU0sRUFBRSxDQUFDO2dCQUNULE1BQU0sRUFBRSxDQUFDO2dCQUNULFdBQVcsRUFBRSxDQUFDO2FBQ2pCLENBQUMsQ0FBQztZQUVILE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsWUFBWTtnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUVoQyxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO2dCQUM5QixJQUFJLEVBQUUsRUFBRTtnQkFDUixNQUFNLEVBQUUsQ0FBQztnQkFDVCxNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsQ0FBQzthQUNqQixDQUFDLENBQUM7WUFFSCxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO2dCQUM3QixJQUFJLEVBQUUsQ0FBQztnQkFDUCxNQUFNLEVBQUUsRUFBRTtnQkFDVixNQUFNLEVBQUUsQ0FBQztnQkFDVCxXQUFXLEVBQUUsQ0FBQzthQUNqQixDQUFDLENBQUM7WUFFSCxPQUFPLFdBQVcsSUFBSSxVQUFVLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQztRQUNuRSxDQUFDLENBQUEsQ0FBQTtRQUVELGlCQUFZLEdBQUcsQ0FBTyxDQUFXLEVBQW9CLEVBQUU7WUFDbkQsTUFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUMvQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssU0FBUyxDQUFDO1FBQzVELENBQUMsQ0FBQSxDQUFBO1FBRUQsc0JBQWlCLEdBQUcsR0FBUyxFQUFFO1lBQzNCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDM0MsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7Z0JBQzNFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUF1QixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUMvRjtRQUNMLENBQUMsQ0FBQSxDQUFBO1FBNUNHLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7Q0E0Q0o7QUFsREQsMkJBa0RDIn0=