import { ensureServerExtensions } from "."
import Ibkr from "./Ibkr"
import {getHivePool} from "../../../db";


export default ensureServerExtensions<Ibkr>({
    insertNewAccounts: async (req) => {
        const pool = await getHivePool;
        const date = new Date()
        for (let d of req.body.account_ids) {
            const result = await pool.query(`INSERT INTO ibkr_account(user_id, account_id, account_process_date) VALUES ($1, $2, $3)`, [req.extra.userId, d, date])
        }
        return {}
    }
})