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
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var routes_api_alpha_1 = __importDefault(require("./routes-api-alpha"));
var cors_1 = __importDefault(require("cors"));
var healthcheck_1 = require("./healthcheck");
var node_fetch_1 = __importDefault(require("node-fetch"));
var EntityApiBase_1 = require("@tradingpost/common/api/entities/static/EntityApiBase");
var waitlist_1 = require("@tradingpost/common/api/waitlist");
var routes_api_beta_1 = __importDefault(require("./routes-api-beta"));
globalThis["fetch"] = node_fetch_1.default;
var app = (0, express_1.default)();
var port = process.env.PORT || 8080; // default port to listen
app.get("/", healthcheck_1.healthCheck);
app.use((0, cors_1.default)());
//TODO: chage this to something reasonable 
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(function (req, res, next) {
    next();
});
app.post('/waitlist/add', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.body.email) {
                    throw new EntityApiBase_1.PublicError("Missing Email");
                }
                return [4 /*yield*/, (0, waitlist_1.addToWaitlist)(req.body.email)];
            case 1:
                _a.sent();
                res.send('Successfully added!');
                return [2 /*return*/];
        }
    });
}); });
//Current API Routes
app.use("/" + EntityApiBase_1.versionCode, routes_api_alpha_1.default);
//Legacy Api Routes... there is an issue with this.. I knwo the fix just need to implement it .
var addAvailableApi = function (version) {
    try {
        if (version !== EntityApiBase_1.versionCode) {
            app.use("/" + version, (0, routes_api_beta_1.default)(version));
            console.log("Adding api version " + version);
        }
    }
    catch (ex) {
        console.error(ex);
    }
};
addAvailableApi("1.9.1");
addAvailableApi("1.9.1");
addAvailableApi("1.9.0");
addAvailableApi("1.8.0");
// start the express server
app.listen(port, function () {
    // tslint:disable-next-line:no-console
    console.log("API Server has been started at http://localhost:".concat(port));
    if (process.env.CONFIGURATION_ENV === "development") {
    }
    console.log(process.env.CONFIGURATION_ENV);
});
