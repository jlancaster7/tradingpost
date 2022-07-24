import { Repository } from "./repository";
import { DateTime } from "luxon";
export default class MarketClosure {
    private repository;
    private holidayMap;
    constructor(repository: Repository);
    isMarketOpen: () => Promise<boolean>;
    isTradingDay: (t: DateTime) => Promise<boolean>;
    setMarketHolidays: () => Promise<void>;
}
