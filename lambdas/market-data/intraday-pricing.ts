import 'dotenv/config'
import {Context} from 'aws-lambda';
import MarketData from "@tradingpost/common/market-data";
import {DateTime} from "luxon";
import {init} from "../init/init";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;
    const marketData = new MarketData(marketRepository, iex, marketHolidays);

    const currentTime = DateTime.now().setZone("America/New_York")
    const time930Am = currentTime.setZone("America/New_York").set({hour: 9, minute: 30, second: 0, millisecond: 0})
    const time400pm = currentTime.setZone("America/New_York").set({hour: 16, minute: 0, second: 0, millisecond: 0})

    if (currentTime.toUnixInteger() < time930Am.toUnixInteger()) return;
    if (currentTime.toUnixInteger() > time400pm.toUnixInteger()) return;
    if (!await marketHolidays.isTradingDay(currentTime)) return

    await marketData.ingestPricing();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};