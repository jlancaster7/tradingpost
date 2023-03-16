import Repository from "./repository";
import { DateTime } from "luxon";
export default class Holidays {
    private repository;
    private holidayMap;
    constructor(repository: Repository);
    isOpen: () => Promise<boolean>;
    isTradingDay: (t: DateTime) => Promise<boolean>;
    setMarketHolidays: () => Promise<void>;
}
