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
        while (_) try {
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
var auth_1 = require("@tradingpost/common/api/auth");
var jsonwebtoken_1 = require("jsonwebtoken");
var configuration_1 = require("@tradingpost/common/configuration");
var EntityApiBase_1 = require("@tradingpost/common/api/entities/static/EntityApiBase");
var router = express_1.default.Router();
var baseFormat = '/:entity/:id?';
//TODO: need to throw errros that will set the status number. (401 in this case)
var decodeToken = function (req, disableModelCheck) { return __awaiter(void 0, void 0, void 0, function () {
    var bearerHeader, bearer, result, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                bearerHeader = req.headers['authorization'];
                console.log("AUTH HEADER IS " + req.headers.authorization);
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
var makeRoute = function (path, action) {
    return router.post(path, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
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
var sharedHandler = function (req, routeDetails) { return __awaiter(void 0, void 0, void 0, function () {
    var reqPath, entity;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                reqPath = (0, path_1.join)("@tradingpost/common/api/entities/apis/".concat(req.params.entity)), entity = require(reqPath).default;
                return [4 /*yield*/, routeDetails(entity)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
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
    var info;
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
                        handle: req.body.handle
                    })];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); });
//INSERT AND UPDATES
makeRoute(baseFormat, function (req) {
    return sharedHandler(req, function (entity) { return __awaiter(void 0, void 0, void 0, function () {
        var id, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    id = req.params.id;
                    if (!id) return [3 /*break*/, 2];
                    return [4 /*yield*/, entity.internal.update(id, req.body)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, entity.internal.insert(req.body)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, _a];
            }
        });
    }); });
});
//GET AND LIST (TODO discuss list paylod)
router.get(baseFormat, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        sharedHandler(req, function (entity) { return __awaiter(void 0, void 0, void 0, function () {
            var id, _a, _b, _c, ex_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        id = req.params.id;
                        _b = (_a = res).json;
                        if (!id) return [3 /*break*/, 2];
                        return [4 /*yield*/, entity.internal.get(id)];
                    case 1:
                        _c = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, entity.internal.list()];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        _b.apply(_a, [_c]);
                        return [3 /*break*/, 6];
                    case 5:
                        ex_2 = _d.sent();
                        if (ex_2 instanceof EntityApiBase_1.PublicError) {
                            res.status(ex_2.statusCode).json({
                                statusCode: ex_2.statusCode,
                                message: ex_2.message
                            });
                        }
                        else {
                            console.error(ex_2);
                            res.status(400).json({
                                message: "An unknown error has occured. Please contact help@tradingpost.app"
                            });
                        }
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
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
