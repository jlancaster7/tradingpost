"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const auth_1 = require("../auth");
const router = express_1.default.Router();
const baseFormat = '/:entity/:id?';
const idReqFormat = '/:entity/:id';
const sharedHandler = (req, res, routeDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reqPath = (0, path_1.join)("../", "entities", "apis", req.params.entity), entity = require(reqPath).default;
        yield routeDetails(entity);
    }
    catch (ex) {
        //TODO add generalized error handler
        console.error(ex);
        res.status(400).json({
            message: ex.message
        });
    }
});
//AUTH
router.post("/authapi/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.pass)
            res.status(401).json({
                message: "Unauthorized..."
            });
        else {
            if (req.body.email) {
                res.json(yield (0, auth_1.loginPass)(req.body.email, req.body.pass, ""));
            }
            else
                res.json(yield (0, auth_1.loginToken)(req.body.pass));
        }
    }
    catch (ex) {
        res.status(400).json({
            message: ex.message
        });
    }
}));
router.post("/authapi/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.email && req.body.pass) {
            yield (0, auth_1.createLogin)(req.body.email, req.body.pass);
            res.json({});
        }
        else {
            throw new Error("Invalid Request");
        }
    }
    catch (ex) {
        res.status(400).json({
            message: ex.message
        });
    }
}));
//INSERT AND UPDATES
router.post(baseFormat, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    sharedHandler(req, res, (entity) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        // if (!func || typeof func !== "function")
        //     res.status(404).json({
        //         message: `Invalid path ${req.originalUrl}`
        //     });
        res.json(id ? yield entity.internal.update(id, req.body) : yield entity.internal.insert(req.body));
    }));
}));
//GET AND LIST (TODO discuss list paylod)
router.get(baseFormat, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    sharedHandler(req, res, (entity) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        // if (!func || typeof func !== "function")
        //     res.status(404).json({
        //         message: `Invalid path ${req.originalUrl}`
        //     });
        res.json(id ? yield entity.internal.get(id) : yield entity.internal.list());
    }));
}));
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
exports.default = router;
