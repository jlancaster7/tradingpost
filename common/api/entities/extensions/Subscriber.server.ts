import Extension, { ensureServerExtensions } from ".";
import { execProc, getHivePool } from "../../../db";

import Subscription from "../extensions/Subscription.server";
import Subscriber from './Subscriber';

export default ensureServerExtensions<Subscriber>({
    getByOwner: async (req) => {

        const sub = await Subscription.getByUserId({
            body: undefined,
            extra: {
                userId: req.extra.userId
            }
        })
        //get my subscription 
        return sub?.id ? (await (await getHivePool)
            .query("SELECT * FROM view_subscriber_list('{}') where subscription_id = $1", [sub?.id])).rows : [];
    },
    getBySubscriber: async (req) => {
        //get my subscription 
        return (await (await getHivePool)
            .query("SELECT * FROM view_subscriber_list('{}') where user_id = $1", [req.extra.userId])).rows;
    },
    removeSubscription: async (req) => {
        //TODO: make this work with the idea of this being a ledger... should not be a hard delete ....
        await (await getHivePool)
            .query('DELETE FROM data_subscriber where user_id = $1 and subscription_id = $2', [req.extra.userId, req.body.subscriptionId]);
        return null;
    }
})