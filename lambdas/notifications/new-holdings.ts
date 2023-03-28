import {Context} from "aws-lambda";
import Notifications from "@tradingpost/common/notifications";
import Repository from "@tradingpost/common/notifications/repository";
import {subscriptionsNewHoldings} from "@tradingpost/common/notifications/bll";
import {init} from "../init/init";
import {initNotifications} from "../init/notifications";

const run = async () => {
    const {pgp, pgClient, marketHolidays} = await init;
    const {apnProvider, androidProvider} = await initNotifications;
    const notificationsRepo = new Repository(pgClient, pgp);
    const notificationsSrv = new Notifications(apnProvider, androidProvider, notificationsRepo);

    await subscriptionsNewHoldings(notificationsSrv, notificationsRepo, marketHolidays);
}

export const handler = async (event: any, context: Context) => {
    await run();
}