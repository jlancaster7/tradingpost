<<<<<<< Updated upstream:common/market-data/market-trading-hours.d.ts
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
=======
import Repository from "./repository";
import { DateTime } from "luxon";
export default class MarketTradingHours {
    private repository;
    private holidayMap;
    constructor(repository: Repository);
    isOpen: () => Promise<boolean>;
    isTradingDay: (t: DateTime) => Promise<boolean>;
    setMarketHolidays: () => Promise<void>;
}
>>>>>>> Stashed changes:common/market-data/market-closure.d.ts
