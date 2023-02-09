import { Request, Response } from 'express'
import { getHivePool } from '@tradingpost/common/db/index'

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const hive = await getHivePool;
        const result = await hive.query<{ Result: string }>(`SELECT 'SUCCESS' as "Result"`);

        res.send(`<h2>Derpy Derp Derp. DARP. Healthcheck says:${result.rows[0].Result} -- Docker UAT</h2>`);
    }
    catch (ex: any) {
        res.send(`<h2 color="red">Failure ${ex.message}</h2>`);
    }
}