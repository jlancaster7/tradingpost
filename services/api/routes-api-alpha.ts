import Express, { RequestHandler, response } from "express";
import { join } from "path";
import { EntityApi } from '@tradingpost/common/api/entities/static/EntityApi'
import { createLogin, createUser, loginPass, loginToken, } from '@tradingpost/common/api/auth'
import { JwtPayload, verify } from 'jsonwebtoken'
import { DefaultConfig } from "@tradingpost/common/configuration";
import { PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase'
const router = Express.Router();
const baseFormat = '/:entity/:id?';


//TODO: need to throw errros that will set the status number. (401 in this case)
const decodeToken = async (req: Express.Request, disableModelCheck?: boolean) => {
    const bearerHeader = req.headers['authorization'];
    console.log("AUTH HEADER IS " + req.headers.authorization);
    //check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        //split the space at the bearer
        const bearer = bearerHeader.split(' ');
        if (bearer[0].toLowerCase() !== "bearer")
            throw new Error(`Invalid authorization type: "${bearer[0]}".`)

        const result = verify(bearer[1],
            await DefaultConfig.fromCacheOrSSM("authkey"));

        if (!disableModelCheck && !result.sub)
            throw new Error(`Invalid authorization token`);
        else
            return result as JwtPayload;

    } else {
        throw new Error("Unauthoized....");
    }
}

const makeRoute = (path: string, action: (req: Express.Request, res: Express.Response) => Promise<any>) =>
    router.post(path, async (req: Express.Request, res: Express.Response) => {
        try {
            res.json(await action(req, res))
        }
        catch (ex) {
            if (ex instanceof PublicError) {
                res.status(ex.statusCode).json({
                    statusCode: ex.statusCode,
                    message: ex.message
                });
            }
            else {
                console.error(ex);
                res.status(400).json({
                    message: "An unknown error has occured. Please contact help@tradingpost.app"
                });
            }
        }
    })

function resolver(...path: string[]) {
    const output = path.find(p => {
        try {
            require.resolve(p)
            return true;
        }
        catch (ex) {
            return false
        }
    });
    if (!output)
        throw new Error("Not path could be resolved ");
    return output;
}

const sharedHandler = async (req: Express.Request, routeDetails: (entity: EntityApi<any, any, any, any>) => Promise<void>) => {
    //For efficiency I will generate everything in "/api". For now doing a lookup to both
    const entity =
        require(
            resolver(
                join(`@tradingpost/common/api/entities/apis/${req.params.entity}`),
                join(`@tradingpost/common/api/entities/static/${req.params.entity}`)))
            .default;
    return await routeDetails(entity);
}

//AUTH
makeRoute("/authapi/login", async (req) => {
    if (!req.body.pass)
        throw new PublicError("Unauthorized...", 401)
    else {
        if (req.body.email) {
            return await loginPass(req.body.email, req.body.pass, "");
        }
        else
            return await loginToken(req.body.pass);
    }
});
makeRoute("/authapi/create", async (req) => {
    if (!req.body.email || !req.body.pass)
        throw new PublicError("Invalid Request");

    return await createLogin(req.body.email, req.body.pass);
});

makeRoute("/authapi/init", async (req) => {
    const info = await decodeToken(req, true);
    if (!info.claims.email)
        throw new Error("Invalid Request");

    return await createUser({
        email: info.claims.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        handle: req.body.handle
    });
});

//INSERT AND UPDATES
makeRoute(baseFormat, (req) => {
    return sharedHandler(req, async (entity) => {
        const id = req.params.id;
        return id ? await entity.internal.update(id, req.body) : await entity.internal.insert(req.body);
    })
});

//GET AND LIST (TODO discuss list paylod)
router.get(baseFormat, async (req, res) => {
    sharedHandler(req, async (entity) => {
        try {
            const id = req.params.id;
            res.json(id ? await entity.internal.get(id) : await entity.internal.list())
        }
        catch (ex) {
            if (ex instanceof PublicError) {
                res.status(ex.statusCode).json({
                    statusCode: ex.statusCode,
                    message: ex.message
                });
            }
            else {
                console.error(ex);
                res.status(400).json({
                    message: "An unknown error has occured. Please contact help@tradingpost.app"
                });
            }
        }
    })
});

//DELETE
// router.delete(idReqFormat, async (req, res, next) => {
//     sharedHandler(req, res, async (entity) => {

//         // if (!func || typeof func !== "function")
//         //     res.status(404).json({
//         //         message: `Invalid path ${req.originalUrl}`
//         //     });
//         //res.json(await entity.update(id) : await entity.list());
//     })
// });



export default router
