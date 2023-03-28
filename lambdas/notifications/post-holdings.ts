import {Context} from "aws-lambda";
import Notifications from "@tradingpost/common/notifications";
import Repository from "@tradingpost/common/notifications/repository";
import {holdingsPostNotifications} from "@tradingpost/common/notifications/bll";
import {init} from "../init/init";
import {initNotifications} from "../init/notifications";

const run = async () => {
    const {pgp, pgClient} = await init;
    const {apnProvider, androidProvider, elasticClient} = await initNotifications;
    const notificationsRepo = new Repository(pgClient, pgp);
    const notificationsSrv = new Notifications(apnProvider, androidProvider, notificationsRepo);
    await holdingsPostNotifications(notificationsSrv, notificationsRepo, elasticClient);
}
export const handler = async (event: any, context: Context) => {
    await run();
}