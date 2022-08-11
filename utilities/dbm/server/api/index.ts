import Express, { RequestHandler } from "express";
import { join } from "path";
const router = Express.Router();

router.post('/test', (req, res, next) => {
    res.json({ "EMPTY": "RESP" })
});

export class ApiError<T = any> extends Error {
    name: string = "ApiError"
    message: string = "";
    data: T | undefined
    stack?: string;
    constructor(message: string, data?: T) {
        super(message)
        this.data = data;
    }
}

export const toLowerProps = (obj: Record<string, RequestHandler>) => {
    const output: Record<string, RequestHandler> = {}
    Object.keys(obj).forEach((k) => output[k.toLowerCase()] = obj[k]);
    return output;
}

router.post('/:path/:func', async (req, res, next) => {
    try {
        const
            reqPath = join(__dirname, req.params.path),
            page = require(reqPath).default,
            func = page[req.params.func.toLowerCase()];

        if (!func)
            res.status(404).json({
                message: `Invalid path ${req.originalUrl}`
            });
        if(typeof func !== "function" ){
            res.status(400).json({
                message: `Invalid func ${req.originalUrl}`
            });
        }

        res.json(await func(req, res, next));
    }
    catch (ex) {
        if (ex instanceof ApiError) {
            res.status(400).send({
                message: ex.message,
                data: ex.data
            })
        }
        else {
            console.error(ex);
            res.status(400).json({
                message: (ex as any).message
            });
        }
    }
});

export default router;