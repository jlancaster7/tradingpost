import Express, { RequestHandler } from "express";
import { join } from "path";
import { EntityApi } from '../entities/templates/EntityApi'
import { createLogin, loginPass, loginToken } from '../auth'
const router = Express.Router();
const baseFormat = '/:entity/:id?';
const idReqFormat = '/:entity/:id'
const sharedHandler = async (req: Express.Request, res: Express.Response, routeDetails: (entity: EntityApi<any, any, any, any>) => Promise<void>) => {
    try {
        const reqPath = join("../", "entities", "apis", req.params.entity),
            entity = require(reqPath).default;
        await routeDetails(entity);
    }
    catch (ex) {
        //TODO add generalized error handler
        console.error(ex);
        res.status(400).json({
            message: (ex as any).message
        });
    }
}

//AUTH
router.post("/authapi/login", async (req, res, next) => {
    try {
        if (!req.body.pass)
            res.status(401).json({
                message: "Unauthorized..."
            });
        else {
            if (req.body.email) {
                res.json(await loginPass(req.body.email, req.body.pass, ""));
            }
            else
                res.json(await loginToken(req.body.pass));
        }
    }
    catch (ex) {
        res.status(400).json({
            message:(ex as any).message
        })
    }

});
router.post("/authapi/create", async (req, res, next) => {
    try {
        if (req.body.email && req.body.pass) {
            await createLogin(req.body.email, req.body.pass);
            res.json({})
        }
        else {
            throw new Error("Invalid Request");
        }
    }
    catch (ex) {
        res.status(400).json({
            message: (ex as any).message
        });
    }

});


//INSERT AND UPDATES
router.post(baseFormat, async (req, res, next) => {
    sharedHandler(req, res, async (entity) => {
        const id = req.params.id;
        // if (!func || typeof func !== "function")
        //     res.status(404).json({
        //         message: `Invalid path ${req.originalUrl}`
        //     });
        res.json(id ? await entity.internal.update(id, req.body) : await entity.internal.insert(req.body));
    })
});

//GET AND LIST (TODO discuss list paylod)
router.get(baseFormat, async (req, res, next) => {
    sharedHandler(req, res, async (entity) => {
        const id = req.params.id;
        // if (!func || typeof func !== "function")
        //     res.status(404).json({
        //         message: `Invalid path ${req.originalUrl}`
        //     });
        res.json(id ? await entity.internal.get(id) : await entity.internal.list());
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