import {Repository} from "./lib/repository";
import {DateTime} from "luxon";

export default class Index {
    private repository: Repository;
    private holidayMap: Record<string, object> = {};

    constructor(repository: Repository) {
        this.repository = repository;
    }

    isMarketOpen = async (): Promise<boolean> => {
        await this.setMarketHolidays(); // TODO: Wonder if we could wrap this function

        let currentTime = DateTime.now().setZone("America/New_York")
        const marketDate = currentTime.set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        });

        const isTradingDay = await this.isTradingDay(marketDate);
        if (!isTradingDay) return false;

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
    }

    isTradingDay = async (t: DateTime): Promise<boolean> => {
        await this.setMarketHolidays(); // TODO: Wonder if we could wrap this function
        return this.holidayMap[t.toUnixInteger()] === undefined;
    }

    setMarketHolidays = async () => {
        if (Object.keys(this.holidayMap).length === 0) {
            let holidays = await this.repository.getCurrentAndFutureExchangeHolidays();
            holidays.forEach((h) => this.holidayMap[h.date.toUnixInteger()] = {});
        }
    }
}
