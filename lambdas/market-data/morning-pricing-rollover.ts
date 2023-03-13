import 'dotenv/config'
import {Context} from 'aws-lambda';
import MarketData from "@tradingpost/common/market-data";
import {DateTime} from "luxon";
import {init} from "../init";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;

    const marketData = new MarketData(marketRepository, iex, marketHolidays);

    const currentTime = DateTime.now().setZone("America/New_York")
    if (currentTime.hour !== 9) return;
    if (!await marketHolidays.isTradingDay(currentTime)) return

    // Rolls-forward pricing regardless of IEX or any other source
    await marketData.morningPricingRollover();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};