import {Context} from "aws-lambda";
import * as healthcheck from "@tradingpost/common/healthcheck";

const run = async () => {
    await healthcheck.api();
}

export const handler = async (event: any, context: Context) => {
    await run()
}