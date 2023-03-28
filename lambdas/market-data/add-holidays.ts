import 'dotenv/config';
import {Context} from 'aws-lambda';
import {init} from "../init/init";
import MarketData from "@tradingpost/common/market-data/index";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;
    const marketData = new MarketData(marketRepository, iex, marketHolidays);

    await marketData.upsertHolidays();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
}