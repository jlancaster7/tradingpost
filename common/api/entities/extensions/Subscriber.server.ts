import Extension, { ensureServerExtensions } from ".";
import { execProc, getHivePool } from "../../../db";

import Subscription from "../extensions/Subscription.server";
import { IUserGet } from "../interfaces";
import Subscriber from './Subscriber';

export default ensureServerExtensions<Subscriber>({
    insertWithNotification: async (req) => {
        const result = await execProc('public.api_subscriber_insert', {
            user_id: req.extra.userId,
            data: {
                subscription_id: req.body.subscription_id,
                start_date: req.body.start_date,
                approved: req.body.approved
            }

        })
        const user: IUserGet = (await execProc('public.api_user_get', {
            data: {id: req.extra.userId}
        }))[0]
        if (result[0].subscription[0].settings.approve_new) {
            const pool = await getHivePool;
            await pool.query(`INSERT INTO notification(user_id, type, date_time, data)
                              VALUES ($1, $2, $3, $4)`, 
                              [req.body.user_id, 'NEW_SUBSCRIPTION', new Date(), {userId: req.extra.userId, 
                                                                                   handle: user.handle, 
                                                                                   message: 'has subscribed to you.',
                                                                                   subscriber_id: result[0].id
                                                                                }]);
        }
    },
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
            .query('DELETE FROM data_subscriber where user_id = $1 and subscription_id = $2', [req.body.userId ? req.body.userId : req.extra.userId, req.body.subscriptionId]);
        return null;
    }
})