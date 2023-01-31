import express, {Request, Response} from 'express';
import cors from 'cors';
import {DefaultConfig} from '@tradingpost/common/configuration';
import pgPromise from 'pg-promise';
import Finicity from "@tradingpost/common/finicity";
import bodyParser from "body-parser";
import pg from 'pg';
import crypto from "crypto";
import Repository from "@tradingpost/common/brokerage/repository";
import {
    BrokerageTaskStatusType,
    BrokerageTaskType,
    DirectBrokeragesType
} from "@tradingpost/common/brokerage/interfaces";
import {DateTime} from "luxon";
import {SQSClient, SendMessageCommand} from "@aws-sdk/client-sqs";


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

    const repository = new Repository(pgClient, pgp);
    const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const finicity = new Finicity(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    await finicity.init()

    const sqsClient = new SQSClient({
        region: "us-east-1"
    });

    const app = express();
    const port = process.env.PORT || 8080;

    app.use(bodyParser.json());
    app.use(cors());

    app.get("/", (req: Request, res: Response) => {
        res.send({Hello: "World"});
    });

    app.post("/finicity/webhook", async (req: Request, res: Response) => {
            const body = req.body;

            // Spoofing Detected
            const signature = crypto.createHmac('sha256', finicityCfg.partnerSecret).update(JSON.stringify(body)).digest('hex')
            if (req.get('x-finicity-signature') !== signature && process.env.NODE_ENV !== 'development') {
                throw new Error("request signature is invalid");
            }

            console.log(req.body);

            if (req.body.eventType === 'added') {
                console.log("Adding Account")
                const {customerId} = req.body;
                const tpUser = await repository.getTradingPostUserByFinicityCustomerId(customerId);
                if (!tpUser) throw new Error("finicity user does not exist")
                const command = new SendMessageCommand({
                    MessageBody: JSON.stringify({
                        type: BrokerageTaskType.NewAccount,
                        userId: tpUser.id,
                        status: BrokerageTaskStatusType.Pending,
                        data: null,
                        started: null,
                        finished: null,
                        brokerage: DirectBrokeragesType.Finicity,
                        date: DateTime.now().setZone("America/New_York"),
                        brokerageUserId: customerId,
                        error: null,
                        messageId: null
                    }),
                    DelaySeconds: 0,
                    QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
                });
                await sqsClient.send(command)
            }

            if (req.body.eventType === 'accountsDeleted') {
                console.log("Deleting Account")
                const {customerId, eventId, payload} = req.body
                const {accounts} = payload;
                const tpUser = await repository.getTradingPostUserByFinicityCustomerId(customerId);
                if (!tpUser) throw new Error("finicity user does not exist")

                const command = new SendMessageCommand({
                    MessageBody: JSON.stringify({
                        type: BrokerageTaskType.DeleteAccount,
                        finished: null,
                        brokerageUserId: customerId,
                        date: DateTime.now().setZone("America/New_York"),
                        started: null,
                        data: {accounts: accounts},
                        brokerage: DirectBrokeragesType.Finicity,
                        status: BrokerageTaskStatusType.Pending,
                        userId: tpUser.id,
                        error: null,
                        messageId: null
                    }),
                    DelaySeconds: 0,
                    QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
                });
                await sqsClient.send(command)
            }

            if (req.body.eventType === 'institutionLoginDeleted') {
                console.log("Removing Institution");
                const {customerId, eventType, eventId, payload} = req.body;
                const {institutionLoginId} = payload;
                const faAccounts = await repository.getFinicityAccountByInstitutionLoginIdAndCustomerId(customerId, institutionLoginId);
                if (faAccounts.length <= 0) throw new Error("could not find finicity account for institution login deletion");

                const accounts: { finicityAccountId: number; finicityAccountNumber: string; }[] = [];
                faAccounts.forEach(fa => accounts.push({finicityAccountId: fa.id, finicityAccountNumber: fa.accountId}))

                const command = new SendMessageCommand({
                    MessageBody: JSON.stringify({
                        type: BrokerageTaskType.DeleteAccount,
                        finished: null,
                        brokerageUserId: customerId,
                        date: DateTime.now().setZone("America/New_York"),
                        started: null,
                        data: {
                            accounts: accounts
                        },
                        brokerage: DirectBrokeragesType.Finicity,
                        status: BrokerageTaskStatusType.Pending,
                        userId: faAccounts[0].tpUserId,
                        error: null,
                        messageId: null
                    }),
                    DelaySeconds: 0,
                    QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
                });
                await sqsClient.send(command)
            }

            if (req.body.eventType === 'credentialsUpdated') {
                console.log("Credentials Updating")
                const {institutionLoginId, customerId} = req.body.payload;
                const tpUser = await repository.getTradingPostUserByFinicityCustomerId(customerId);
                if (!tpUser) throw new Error("finicity user does not exist")

                const command = new SendMessageCommand({
                    MessageBody: JSON.stringify({
                        type: BrokerageTaskType.UpdateAccount,
                        finished: null,
                        brokerageUserId: customerId,
                        date: DateTime.now().setZone("America/New_York"),
                        started: null,
                        data: null,
                        brokerage: DirectBrokeragesType.Finicity,
                        status: BrokerageTaskStatusType.Pending,
                        userId: tpUser.id,
                        error: null,
                        messageId: null
                    }),
                    DelaySeconds: 0,
                    QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
                });
                await sqsClient.send(command)
            }

            return res.send()
        }
    )
    ;

    app.listen(port, function () {
        console.log(`Server running at http://127.0.0.1:%s`, port)
    })
}

(async () => {
    await run()
})()
