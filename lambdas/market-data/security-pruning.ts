import 'dotenv/config'
import {Context} from "aws-lambda";
import MarketData from "@tradingpost/common/market-data/index";
import {init} from "../init";

const runLambda = async () => {
    const {marketHolidays, marketRepository, iex} = await init;
    const marketSrv = new MarketData(marketRepository, iex, marketHolidays);

    await marketSrv.prunePricing()
}

export const run = async (event: any, context: Context) => {
    await runLambda();
};