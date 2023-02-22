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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = require("path");
var jsonwebtoken_1 = require("jsonwebtoken");
var configuration_1 = require("@tradingpost/common/configuration");
var auth_1 = require("@tradingpost/common/api/auth");
var EntityApiBase_1 = require("@tradingpost/common/api/entities/static/EntityApiBase");
var cache_1 = require("@tradingpost/common/api/cache");
var waitlist_1 = require("@tradingpost/common/api/waitlist");
var UserApi_1 = __importDefault(require("@tradingpost/common/api/entities/apis/UserApi"));
var SecurityApi_1 = __importDefault(require("@tradingpost/common/api/entities/static/SecurityApi"));
var router = express_1.default.Router();
var baseFormat = '/:entity/:action';
//TODO: need to throw errros that will set the status number. (401 in this case)
var decodeToken = function (req, disableModelCheck) { return __awaiter(void 0, void 0, void 0, function () {
    var bearerHeader, bearer, result, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                bearerHeader = req.headers['authorization'];
                if (!(typeof bearerHeader !== 'undefined')) return [3 /*break*/, 2];
                bearer = bearerHeader.split(' ');
                if (bearer[0].toLowerCase() !== "bearer")
                    throw new Error("Invalid authorization type: \"".concat(bearer[0], "\"."));
                _a = jsonwebtoken_1.verify;
                _b = [bearer[1]];
                return [4 /*yield*/, configuration_1.DefaultConfig.fromCacheOrSSM("authkey")];
            case 1:
                result = _a.apply(void 0, _b.concat([_c.sent()]));
                if (!disableModelCheck && !result.sub)
                    throw new Error("Invalid authorization token");
                else
                    return [2 /*return*/, result];
                return [3 /*break*/, 3];
            case 2: throw new Error("Unauthoized....");
            case 3: return [2 /*return*/];
        }
    });
}); };
var makeRoute = function (path, action, asGet) {
    return router[asGet ? "get" : "post"](path, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, ex_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _b = (_a = res).json;
                    return [4 /*yield*/, action(req, res)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 3];
                case 2:
                    ex_1 = _c.sent();
                    if (ex_1 instanceof EntityApiBase_1.PublicError) {
                        res.status(ex_1.statusCode).json({
                            statusCode: ex_1.statusCode,
                            message: ex_1.message
                        });
                    }
                    //TODO: change this to a DatabaseError check then check for the code
                    else if (ex_1.code === '23505') {
                        console.error(ex_1.constructor);
                        res.status(400).json({
                            type: "SQL_DUPLICATE",
                            message: ex_1.detail
                        });
                    }
                    else {
                        console.error(ex_1);
                        res.status(400).json({
                            message: "An unknown error has occured. Please contact help@tradingpost.app"
                        });
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
};
function resolver() {
    var path = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        path[_i] = arguments[_i];
    }
    var output = path.find(function (p) {
        try {
            var resolveKey = require.resolve(p);
            //NEED TO DISABLE FOR PROD and make this a lil less hacky 
            if (require.cache[resolveKey]) {
                delete require.cache[resolveKey];
            }
            return true;
        }
        catch (ex) {
            return false;
        }
    });
    if (!output)
        throw new Error("Not path could be resolved " + path.join(","));
    return output;
}
var sharedHandler = function (req, routeDetails) { return __awaiter(void 0, void 0, void 0, function () {
    var entity;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                //For efficiency I will generate everything in "/api". For now doing a lookup to both
                ///... this can already be changed.. will do it later.....
                //This should be set to only happen in dev mode... 
                try {
                    resolver('@tradingpost/common/api/entities/extensions/' + req.params.entity.substring(0, req.params.entity.length - 3) + ".server");
                }
                catch (ex) { }
                entity = require(resolver((0, path_1.join)("@tradingpost/common/api/entities/apis/".concat(req.params.entity)), (0, path_1.join)("@tradingpost/common/api/entities/static/".concat(req.params.entity))))
                    .default;
                return [4 /*yield*/, routeDetails(entity)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
makeRoute("/test", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                isMostRecent: true,
                env: configuration_1.DefaultConfig.environment
            }];
    });
}); }, true);
makeRoute("/authapi/forgotpassword", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!req.body.email) return [3 /*break*/, 1];
                throw new EntityApiBase_1.PublicError("Email is required", 400);
            case 1: return [4 /*yield*/, (0, auth_1.forgotPassword)(req.body.email, req.body.callbackUrl)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, {}];
        }
    });
}); });
makeRoute("/authapi/resetpassword", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(!req.body.email && req.body.isPass)) return [3 /*break*/, 1];
                throw new EntityApiBase_1.PublicError("Email is required", 400);
            case 1: return [4 /*yield*/, (0, auth_1.resetPassword)(req.body.email, req.body.tokenOrPass, req.body.isPass, req.body.newPassword)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, {}];
        }
    });
}); });
//AUTH
makeRoute("/authapi/login", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!req.body.pass) return [3 /*break*/, 1];
                throw new EntityApiBase_1.PublicError("Unauthorized...", 401);
            case 1:
                if (!req.body.email) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, auth_1.loginPass)(req.body.email, req.body.pass, "")];
            case 2: return [2 /*return*/, _a.sent()];
            case 3: return [4 /*yield*/, (0, auth_1.loginToken)(req.body.pass)];
            case 4: return [2 /*return*/, _a.sent()];
        }
    });
}); });
makeRoute("/authapi/create", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.body.email || !req.body.pass)
                    throw new EntityApiBase_1.PublicError("Invalid Request");
                return [4 /*yield*/, (0, auth_1.createLogin)(req.body.email, req.body.pass)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
makeRoute("/authapi/init", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var info, login;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, decodeToken(req, true)];
            case 1:
                info = _a.sent();
                if (!info.claims.email)
                    throw new Error("Invalid Request");
                return [4 /*yield*/, (0, auth_1.createUser)({
                        email: info.claims.email,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        handle: req.body.handle,
                        dummy: req.body.dummy
                    })];
            case 2:
                login = _a.sent();
                (0, cache_1.cacheMonitor)(UserApi_1.default, "insert", login.user_id, {});
                return [2 /*return*/, login];
        }
    });
}); });
makeRoute("/waitlist/add", function (req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.body.email) {
                    throw new EntityApiBase_1.PublicError("Invalid Request");
                }
                return [4 /*yield*/, (0, waitlist_1.addToWaitlist)(req.body.email)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
//ALL ROUTES
makeRoute(baseFormat, function (req) {
    return sharedHandler(req, function (entity) { return __awaiter(void 0, void 0, void 0, function () {
        var token, _a, extra, internalHandler, extensionHandler, settings, responseData, responseData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(req.params.action !== "list" || entity.constructor.name !== SecurityApi_1.default.constructor.name)) return [3 /*break*/, 2];
                    return [4 /*yield*/, decodeToken(req)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = {};
                    _b.label = 3;
                case 3:
                    token = _a;
                    extra = {
                        userId: token.sub,
                        page: req.query.page ? Number(req.query.page) : undefined,
                        limit: req.query.limit ? Number(req.query.limit) : undefined
                    };
                    req.extra = extra;
                    internalHandler = entity.internal[req.params.action];
                    extensionHandler = entity.internal.extensions[req.params.action];
                    if (!(req.params.action !== "extensions" && internalHandler)) return [3 /*break*/, 8];
                    //TODO: Eventually this should be made more modular/ as "middleware"
                    if (entity.constructor.name === UserApi_1.default.constructor.name && req.params.action === "update") {
                        delete req.body.profile_url;
                    }
                    settings = {
                        user_id: token.sub,
                        data: req.body,
                        page: extra.page,
                        limit: extra.limit
                    };
                    return [4 /*yield*/, internalHandler(settings)];
                case 4:
                    responseData = _b.sent();
                    if (!extensionHandler) return [3 /*break*/, 6];
                    return [4 /*yield*/, extensionHandler(responseData, extra)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: 
                //will type better in the future by should not be needed right now
                return [4 /*yield*/, (0, cache_1.cacheMonitor)(entity, req.params.action, token.sub, responseData)];
                case 7:
                    //will type better in the future by should not be needed right now
                    _b.sent();
                    return [2 /*return*/, responseData];
                case 8:
                    if (!extensionHandler) return [3 /*break*/, 11];
                    return [4 /*yield*/, extensionHandler(req)];
                case 9:
                    responseData = _b.sent();
                    return [4 /*yield*/, (0, cache_1.cacheMonitor)(entity, req.params.action, token.sub, responseData)];
                case 10:
                    _b.sent();
                    return [2 /*return*/, responseData];
                case 11: throw new EntityApiBase_1.PublicError("Unknown Action", 400);
            }
        });
    }); });
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
exports.default = router;
