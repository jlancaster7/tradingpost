import { Request, Response } from 'express'
import { getHivePool } from '@tradingpost/common/api/entities/static/pool'


export const healthCheck = async (req: Request, res: Response) => {
    try {
        const hive = await getHivePool();
        const result = await hive.query<{ Result: string }>(`SELECT 'SUCCESS' as "Result"`);

        res.send(`<h2>Derp. Healthcheck says:${result.rows[0].Result}</h2>`);
    }
    catch (ex: any) {
        res.send(`<h2 color="red">Failure ${ex.message}</h2>`);
    }
}