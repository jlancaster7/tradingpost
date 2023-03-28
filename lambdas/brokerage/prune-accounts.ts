import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import pg from 'pg';
import {init} from "../init/init";

const run = async () => {
}

export const handler = async (event: any, context: Context) => {
    await run();
}