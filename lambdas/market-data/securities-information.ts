import 'dotenv/config'
import {Context} from 'aws-lambda';
import MarketData from "@tradingpost/common/market-data";
import {init} from "../init/init";
import {DateTime} from "luxon";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;
    const marketData = new MarketData(marketRepository, iex, marketHolidays);

    const dt = DateTime.now().setZone("America/New_York")
    if (dt.hour !== 5) return;

    await marketData.updateSecuritiesInformation();
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};
