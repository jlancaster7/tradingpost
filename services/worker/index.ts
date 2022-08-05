import express, {Request, Response} from 'express';
import cors from 'cors';
import {DefaultConfig} from '@tradingpost/common/configuration';
import pgPromise from 'pg-promise';
import Finicity from "@tradingpost/common/finicity/index";
import Brokerage from "@tradingpost/common/brokerage/index";
import bodyParser from "body-parser";

const run = async () => {
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
        console.log("Request Made")
        res.send({Hello: "World"})
    });

    app.post("/finicity/webhook", async (req: Request, res: Response) => {
        if (req.body.eventType === 'added') {
            const {customerId} = req.body;
            await brokerageService.newlyAuthenticatedBrokerage(customerId, 'finicity');
        }

        if (req.body.eventType === 'accountsDeleted') {
            const {customerId, eventId, payload} = req.body
            const {accounts} = payload;
            console.log(`Removing accounts for ${customerId}`)
            await brokerageService.removeAccounts(customerId, accounts, 'finicity');
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
