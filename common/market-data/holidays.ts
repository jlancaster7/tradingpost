import Repository from "./repository";
import {DateTime} from "luxon";
import {getUSExchangeHoliday} from "./interfaces";

export default class Holidays {
    private repository: Repository;
    private holidayMap: Map<number, object> = new Map();

    constructor(repository: Repository) {
        this.repository = repository;
    }

    isOpen = async (): Promise<boolean> => {
        await this.setMarketHolidays();

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
        await this.setMarketHolidays();
        if (t.weekday === 6 || t.weekday === 7) return false;

        const entry = this.holidayMap.get(t.startOf('day').toUnixInteger());
        return entry === undefined
    }

    setMarketHolidays = async () => {
        if (!this.holidayMap || this.holidayMap.size === 0) {
            let holidays = await this.repository.getCurrentAndFutureExchangeHolidays();
            holidays.forEach((h: getUSExchangeHoliday) => this.holidayMap.set(h.date.startOf('day').toUnixInteger(), {}));
        }
    }
}
