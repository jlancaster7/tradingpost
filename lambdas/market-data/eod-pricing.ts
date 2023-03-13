import 'dotenv/config'
import {Context} from 'aws-lambda';
import MarketData from "@tradingpost/common/market-data";
import {DateTime} from "luxon";
import {init} from "../init";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;

    const marketData = new MarketData(marketRepository, iex, marketHolidays);

    const currentTime = DateTime.now().setZone("America/New_York")
    if (currentTime.hour !== 16) return;
    if (!await marketHolidays.isTradingDay(currentTime)) return

    // Move all pricing at EOD forward
    await marketData.ingestEodOfDayPricing();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};