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
var auth_1 = require("../auth");
var router = express_1.default.Router();
var baseFormat = '/:entity/:id?';
var idReqFormat = '/:entity/:id';
var sharedHandler = function (req, res, routeDetails) { return __awaiter(void 0, void 0, void 0, function () {
    var reqPath, entity, ex_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                reqPath = path_1.join("../", "entities", "apis", req.params.entity), entity = require(reqPath).default;
                return [4 /*yield*/, routeDetails(entity)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                ex_1 = _a.sent();
                //TODO add generalized error handler
                console.error(ex_1);
                res.status(400).json({
                    message: ex_1.message
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
//AUTH
router.post("/authapi/login", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d, ex_2;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                if (!!req.body.pass) return [3 /*break*/, 1];
                res.status(401).json({
                    message: "Unauthorized..."
                });
                return [3 /*break*/, 5];
            case 1:
                if (!req.body.email) return [3 /*break*/, 3];
                _b = (_a = res).json;
                return [4 /*yield*/, auth_1.loginPass(req.body.email, req.body.pass, "")];
            case 2:
                _b.apply(_a, [_e.sent()]);
                return [3 /*break*/, 5];
            case 3:
                _d = (_c = res).json;
                return [4 /*yield*/, auth_1.loginToken(req.body.pass)];
            case 4:
                _d.apply(_c, [_e.sent()]);
                _e.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                ex_2 = _e.sent();
                res.status(400).json({
                    message: ex_2.message
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.post("/authapi/create", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!(req.body.email && req.body.pass)) return [3 /*break*/, 2];
                return [4 /*yield*/, auth_1.createLogin(req.body.email, req.body.pass)];
            case 1:
                _a.sent();
                res.json({});
                return [3 /*break*/, 3];
            case 2: throw new Error("Invalid Request");
            case 3: return [3 /*break*/, 5];
            case 4:
                ex_3 = _a.sent();
                res.status(400).json({
                    message: ex_3.message
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
//INSERT AND UPDATES
router.post(baseFormat, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        sharedHandler(req, res, function (entity) { return __awaiter(void 0, void 0, void 0, function () {
            var id, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        id = req.params.id;
                        // if (!func || typeof func !== "function")
                        //     res.status(404).json({
                        //         message: `Invalid path ${req.originalUrl}`
                        //     });
                        _b = (_a = res).json;
                        if (!id) return [3 /*break*/, 2];
                        return [4 /*yield*/, entity.internal.update(id, req.body)];
                    case 1:
                        _c = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, entity.internal.insert(req.body)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4:
                        // if (!func || typeof func !== "function")
                        //     res.status(404).json({
                        //         message: `Invalid path ${req.originalUrl}`
                        //     });
                        _b.apply(_a, [_c]);
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
//GET AND LIST (TODO discuss list paylod)
router.get(baseFormat, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        sharedHandler(req, res, function (entity) { return __awaiter(void 0, void 0, void 0, function () {
            var id, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        id = req.params.id;
                        // if (!func || typeof func !== "function")
                        //     res.status(404).json({
                        //         message: `Invalid path ${req.originalUrl}`
                        //     });
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
                        // if (!func || typeof func !== "function")
                        //     res.status(404).json({
                        //         message: `Invalid path ${req.originalUrl}`
                        //     });
                        _b.apply(_a, [_c]);
                        return [2 /*return*/];
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
