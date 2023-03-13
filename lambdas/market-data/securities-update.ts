import 'dotenv/config'
import {Context} from 'aws-lambda';
import MarketData from "@tradingpost/common/market-data";
import {init} from "../init";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;

    const marketData = new MarketData(marketRepository, iex, marketHolidays);

    // Fetches all securities from IEX and upserts them and then upserts our db
    await marketData.upsertSecurities();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};