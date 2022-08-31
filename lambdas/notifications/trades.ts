import 'dotenv/config'
import {Context} from 'aws-lambda';
import {DefaultConfig} from "@tradingpost/common/configuration";
import pgPromise, {IDatabase, IMain} from "pg-promise";
import Notifications from "@tradingpost/common/notifications";
import Repository from "@tradingpost/common/notifications/repository"
import admin from 'firebase-admin';
import {DateTime} from 'luxon';
import pg from 'pg';
import {BulkMessage} from "@tradingpost/common/notifications/interfaces";

const {zones} = require('tzdata');

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

let pgClient: IDatabase<any>;
let pgp: IMain;

const run = async () => {
    if (!pgClient || !pgp) {
        const postgresConfiguration = await DefaultConfig.fromCacheOrSSM("postgres");
        pgp = pgPromise({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        })

        await pgClient.connect();
    }

    const fcmConfig = await DefaultConfig.fromCacheOrSSM("fcm");

    const app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: fcmConfig.project_id,
            clientEmail: fcmConfig.client_email,
            privateKey: fcmConfig.private_key
        }),
    });

    const notificationsRepo = new Repository(pgClient, pgp);
    const notifications = new Notifications(app.messaging(), app.messaging(), notificationsRepo);

    // Get Users with Trades at 8:00AM
    // Run every hour
    const subscribers: Record<string, { tradeCount: number, analysts: Set<string>, deviceIds: Set<string> }> = {};
    const currentZones = get8AMTimezones();
    for (const tz of currentZones) {
        const subscriberTradeNotifs = await notificationsRepo.getTradeNotificationsWithSubscribers(tz, DateTime.now().setZone(tz));

        for (const trade of subscriberTradeNotifs) {
            const s = subscribers[trade.subscriberUserId];
            if (!s) {
                const analysts = new Set<string>([trade.traderUserId]);
                const devices = new Set<string>([trade.subscriberDeviceId]);
                subscribers[trade.subscriberUserId] = {
                    tradeCount: 1,
                    deviceIds: devices,
                    analysts: analysts
                }
                continue
            }

            s.analysts.add(trade.traderUserId)
            s.deviceIds.add(trade.subscriberDeviceId)
            s.tradeCount += 1
            subscribers[trade.subscriberUserId] = s
        }
    }

    const bulkMsgs: BulkMessage[] = [];
    for (const subscriberKey in subscribers) {
        const subscriber = subscribers[subscriberKey];
        if (subscriber.tradeCount === 0 || subscriber.analysts.size === 0) continue
        let msg = '';
        const tradesMsg = subscriber.tradeCount === 1 ? '1 trade.' : `${subscriber.tradeCount} trades.`;
        if (subscriber.analysts.size === 1) {
            msg = `1 Analyst you follow has made a total of ${tradesMsg}`
        } else {
            msg = `${subscriber.analysts.size} Analysts you follow have made a total of ${tradesMsg}`
        }

        // TODO: Make sure the deeplink is correct...
        for (const deviceId of subscriber.deviceIds) {
            bulkMsgs.push({
                data: {link: "tradingpostapp://watchlist/trades"},
                body: msg,
                title: "Trade Notification",
                token: deviceId
            });
        }
    }

    if (bulkMsgs.length <= 500) {
        await notifications.sendBatchMessages(bulkMsgs)
        return
    }

    const jobs: Promise<any>[] = [];
    for (let i = 0; i < bulkMsgs.length; i += 500) {
        jobs.push(notifications.sendBatchMessages(bulkMsgs.slice(i, i + 500)))
    }

    await Promise.all(jobs)
}

const get8AMTimezones = (): string[] => {
    const tzs = [
        ...new Set<string>(
            Object.keys(zones).filter(
                tz => tz.includes('/') && DateTime.local().setZone(tz).isValid
            )
        ),
    ].sort((a, b) => (a < b ? -1 : 1));

    const returnZones: string[] = [];
    for (const tz of tzs) {
        const dt = DateTime.now().setZone(tz);
        if (dt.hour === 8) returnZones.push(tz)
    }
    return returnZones
}

export const handler = async (event: any, context: Context) => {
    await run();
}