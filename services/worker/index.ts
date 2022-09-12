import express, {Request, Response} from 'express';
import cors from 'cors';
import {DefaultConfig} from '@tradingpost/common/configuration';
import pgPromise from 'pg-promise';
import Finicity from "@tradingpost/common/finicity";
import Brokerage from "@tradingpost/common/brokerage";
import bodyParser from "body-parser";
import pg from 'pg';
import crypto from "crypto";

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => {
    return parseInt(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT8, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.FLOAT4, (value: string) => {
    return parseFloat(value);
});

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => {
    return parseFloat(value);
});

const run = async () => {
    console.log(":::::: Starting TradingPost Worker Process ::::::")
    const pgCfg = await DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = pgPromise({});
    const pgClient = pgp({
        host: pgCfg.host,
        user: pgCfg.user,
        password: pgCfg.password,
        database: pgCfg.database
    });

    await pgClient.connect()

    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init()
    const brokerageService = new Brokerage(pgClient, pgp, finicity);

    const app = express();
    const port = process.env.PORT || 8080;

    app.use(bodyParser.json());
    app.use(cors());

    app.get("/", (req: Request, res: Response) => {
        res.send({Hello: "World", port: port});
    });

    app.post("/finicity/webhook", async (req: Request, res: Response) => {
        const body = req.body;

        const signature = crypto.createHmac('sha256', finicityCfg.partnerSecret).update(JSON.stringify(body)).digest('hex')
        if (req.get('x-finicity-signature') !== signature && process.env.NODE_ENV !== 'development') {
            // Spoofing Detected
            throw new Error("request signature from finicity is invalid");
        }

        if (req.body.eventType === 'added') {
            const {customerId} = req.body;
            await brokerageService.addNewAccounts(customerId, 'finicity');
        }

        if (req.body.eventType === 'accountsDeleted') {
            const {customerId, eventId, payload} = req.body
            const {accounts} = payload;
            await brokerageService.removeAccounts(customerId, accounts, 'finicity');
        }

        // TODO: YEAH....
        if (req.body.eventType === 'SOMETHING') {
            const {customerId, eventId, payload} = req.body;
            await brokerageService.addNewTransactions(customerId, 'finicity')
        }

        return res.send()
    });

    app.listen(port, function () {
        console.log(`Server running at http://127.0.0.1:%s`, port)
    })
}

(async () => {
    await run()
})()
