import Extension, { ensureServerExtensions } from ".";
import { getHivePool } from "../../../db";
import { ISubscriptionGet } from "../interfaces";
import Subscription from './Subscription';

export default ensureServerExtensions<Subscription>({
    getByUserId: async (req) => {
        const pool = await getHivePool;
        //todo: resolve wtf is up with the view
        const result = await pool.query<ISubscriptionGet>("SELECT * FROM data_subscription where user_id = $1", [req.extra.userId])
        console.log(result.command);
        //todo: put in fix to trasnlate types that DJ mentioned instead of everything being a string ( oh postgres...... /sigh ;) )
        if (result.rows.length) {
            result.rows[0].cost = parseFloat((result.rows[0].cost as any as string).substring(1))
        }
        return result.rows[0] || null;
    }
})

