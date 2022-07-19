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
