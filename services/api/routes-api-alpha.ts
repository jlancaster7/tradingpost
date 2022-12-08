import Express, { RequestHandler, response } from "express";
import { join } from "path";

import jwt, { JwtPayload, verify } from 'jsonwebtoken'
import { DefaultConfig } from "@tradingpost/common/configuration";
import { EntityApi, RequestSettings } from '@tradingpost/common/api/entities/static/EntityApi'
import { createLogin, createUser, forgotPassword, loginPass, loginToken, resetPassword, } from '@tradingpost/common/api/auth'
import { PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase'
import { cacheMonitor } from '@tradingpost/common/api/cache'
import { addToWaitlist } from '@tradingpost/common/api/waitlist';
import UserApi from "@tradingpost/common/api/entities/apis/UserApi";
import SecurityApi from "@tradingpost/common/api/entities/static/SecurityApi";

const router = Express.Router();
const baseFormat = '/:entity/:action';

//TODO: need to throw errros that will set the status number. (401 in this case)
const decodeToken = async (req: Express.Request, disableModelCheck?: boolean) => {

    const bearerHeader = req.headers['authorization'];

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

const makeRoute = (path: string, action: (req: Express.Request, res: Express.Response) => Promise<any>, asGet?: boolean) =>
    router[asGet ? "get" : "post"](path, async (req: Express.Request, res: Express.Response) => {
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
            //TODO: change this to a DatabaseError check then check for the code
            else if ((ex as any).code === '23505') {
                console.error((ex as Object).constructor);
                res.status(400).json({
                    type: "SQL_DUPLICATE",
                    message: (ex as any).detail
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
            const resolveKey = require.resolve(p)
            //NEED TO DISABLE FOR PROD and make this a lil less hacky 
            if (require.cache[resolveKey]) {
                delete require.cache[resolveKey];
            }

            return true;
        }
        catch (ex) {
            return false
        }
    });
    if (!output)
        throw new Error("Not path could be resolved " + path.join(","));
    return output;
}

const sharedHandler = async (req: Express.Request, routeDetails: (entity: EntityApi<any, any, any, any>) => Promise<void>) => {
    //For efficiency I will generate everything in "/api". For now doing a lookup to both
    ///... this can already be changed.. will do it later.....
    //This should be set to only happen in dev mode... 
    try {
        resolver('@tradingpost/common/api/entities/extensions/' + req.params.entity.substring(0, req.params.entity.length - 3) + ".server")
    } catch (ex) { }

    const entity =
        require(
            resolver(
                join(`@tradingpost/common/api/entities/apis/${req.params.entity}`),
                join(`@tradingpost/common/api/entities/static/${req.params.entity}`)))
            .default;
    return await routeDetails(entity);
}
makeRoute("/test", async (req) => {
    return {
        isMostRecent: true,
    }
}, true);
makeRoute("/authapi/forgotpassword", async (req) => {
    if (!req.body.email)
        throw new PublicError("Email is required", 400)
    else
        await forgotPassword(req.body.email, req.body.callbackUrl);
    return {};
})


makeRoute("/authapi/resetpassword", async (req) => {
    if (!req.body.email && req.body.isPass)
        throw new PublicError("Email is required", 400)
    else
        await resetPassword(req.body.email, req.body.tokenOrPass, req.body.isPass, req.body.newPassword);
    return {};
})

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

    const login = await createUser({
        email: info.claims.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        handle: req.body.handle,
        dummy: req.body.dummy
    });
    cacheMonitor(UserApi, "insert", login.user_id, {});
    return login;

});

makeRoute("/waitlist/add", async (req) => {
    if (!req.body.email) {
        throw new PublicError("Invalid Request");
    }
    return await addToWaitlist(req.body.email);
});

//ALL ROUTES
makeRoute(baseFormat, (req) => {
    return sharedHandler(req, async (entity) => {
        //TODO: clean up how this is decided
        const token = (req.params.action !== "list" || (entity as any).constructor.name !== SecurityApi.constructor.name) ? await decodeToken(req) : {};

        //need to add to info about requests;
        const extra = {
            userId: token.sub,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined
        };
        (req as any).extra = extra;

        const internalHandler = entity.internal[req.params.action as keyof (typeof entity)["internal"]];
        const extensionHandler = entity.internal.extensions[req.params.action]
        if (req.params.action !== "extensions" && internalHandler) {

            const settings: RequestSettings<any> = {
                user_id: token.sub,
                data: req.body,
                page: extra.page,
                limit: extra.limit
            }

            const responseData = await (internalHandler as any)(settings);
            if (extensionHandler)
                await extensionHandler(responseData, extra);
            //will type better in the future by should not be needed right now
            await cacheMonitor(entity as any, req.params.action, token.sub as string, responseData);

            return responseData;
        }
        else if (extensionHandler) {
            //will make this well redundant
            const responseData = await extensionHandler(req);
            await cacheMonitor(entity as any, req.params.action, token.sub as string, responseData);
            return responseData
        }
        else {
            throw new PublicError("Unknown Action", 400);
        }
    })
});

//GET AND LIST (TODO discuss list paylod)
// router.get(baseFormat, async (req, res) => {
//     sharedHandler(req, async (entity) => {
//         try {
//             const id = req.params.id;
//             res.json(id ? await entity.internal.get(id) : await entity.internal.list())
//         }
//         catch (ex) {
//             if (ex instanceof PublicError) {
//                 res.status(ex.statusCode).json({
//                     statusCode: ex.statusCode,
//                     message: ex.message
//                 });
//             }
//             else {
//                 console.error(ex);
//                 res.status(400).json({
//                     message: "An unknown error has occured. Please contact help@tradingpost.app"
//                 });
//             }
//         }
//     })
// });

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
