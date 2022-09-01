import { getHivePool } from '../db/index';

export const addToWaitlist = async (email: string) => {
    try {
        const pool = await getHivePool;
        const result = await pool.query(`INSERT INTO waitlist_beta(email) VALUES ($1)`, [email]);
        return result;
    } 
    catch (err) {
        console.error(err);
        return
    }

}