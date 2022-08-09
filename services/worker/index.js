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
var cors_1 = __importDefault(require("cors"));
var configuration_1 = require("@tradingpost/common/configuration");
var pg_promise_1 = __importDefault(require("pg-promise"));
var index_1 = __importDefault(require("@tradingpost/common/finicity/index"));
var index_2 = __importDefault(require("@tradingpost/common/brokerage/index"));
var body_parser_1 = __importDefault(require("body-parser"));
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var pgCfg, pgp, pgClient, finicityCfg, finicity, brokerageService, app, port;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Starting :D ");
                return [4 /*yield*/, configuration_1.DefaultConfig.fromCacheOrSSM("postgres")];
            case 1:
                pgCfg = _a.sent();
                pgp = (0, pg_promise_1.default)({});
                pgClient = pgp({
                    host: pgCfg.host,
                    user: pgCfg.user,
                    password: pgCfg.password,
                    database: pgCfg.database
                });
                return [4 /*yield*/, pgClient.connect()];
            case 2:
                _a.sent();
                return [4 /*yield*/, configuration_1.DefaultConfig.fromCacheOrSSM("finicity")];
            case 3:
                finicityCfg = _a.sent();
                finicity = new index_1.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
                return [4 /*yield*/, finicity.init()];
            case 4:
                _a.sent();
                brokerageService = new index_2.default(pgClient, pgp, finicity);
                app = (0, express_1.default)();
                port = process.env.PORT || 8080;
                app.use(body_parser_1.default.json());
                app.use((0, cors_1.default)());
                app.get("/", function (req, res) {
                    console.log("Request Made");
                    res.send({ Hello: "World" });
                });
                app.post("/finicity/webhook", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var customerId, _a, customerId, eventId, payload, accounts;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!(req.body.eventType === 'added')) return [3 /*break*/, 2];
                                customerId = req.body.customerId;
                                return [4 /*yield*/, brokerageService.newlyAuthenticatedBrokerage(customerId, 'finicity')];
                            case 1:
                                _b.sent();
                                _b.label = 2;
                            case 2:
                                if (!(req.body.eventType === 'accountsDeleted')) return [3 /*break*/, 4];
                                _a = req.body, customerId = _a.customerId, eventId = _a.eventId, payload = _a.payload;
                                accounts = payload.accounts;
                                console.log("Removing accounts for ".concat(customerId));
                                return [4 /*yield*/, brokerageService.removeAccounts(customerId, accounts, 'finicity')];
                            case 3:
                                _b.sent();
                                _b.label = 4;
                            case 4: return [2 /*return*/, res.send()];
                        }
                    });
                }); });
                app.listen(port, function () {
                    console.log("Server running at http://127.0.0.1:%s", port);
                });
                return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, run()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUFtRDtBQUNuRCw4Q0FBd0I7QUFDeEIsbUVBQWdFO0FBQ2hFLDBEQUFtQztBQUNuQyw2RUFBMEQ7QUFDMUQsOEVBQTREO0FBQzVELDREQUFxQztBQUVyQyxJQUFNLEdBQUcsR0FBRzs7Ozs7Z0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtnQkFDYixxQkFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBQTs7Z0JBQXRELEtBQUssR0FBRyxTQUE4QztnQkFDdEQsR0FBRyxHQUFHLElBQUEsb0JBQVMsRUFBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEIsUUFBUSxHQUFHLEdBQUcsQ0FBQztvQkFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7b0JBQ2hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtvQkFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO2lCQUMzQixDQUFDLENBQUM7Z0JBRUgscUJBQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFBOztnQkFBeEIsU0FBd0IsQ0FBQTtnQkFFSixxQkFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBQTs7Z0JBQTVELFdBQVcsR0FBRyxTQUE4QztnQkFDNUQsUUFBUSxHQUFHLElBQUksZUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BHLHFCQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7Z0JBQXJCLFNBQXFCLENBQUE7Z0JBQ2YsZ0JBQWdCLEdBQUcsSUFBSSxlQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFFMUQsR0FBRyxHQUFHLElBQUEsaUJBQU8sR0FBRSxDQUFDO2dCQUNoQixJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO2dCQUV0QyxHQUFHLENBQUMsR0FBRyxDQUFDLHFCQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGNBQUksR0FBRSxDQUFDLENBQUM7Z0JBRWhCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQUMsR0FBWSxFQUFFLEdBQWE7b0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7b0JBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQTtnQkFDOUIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxVQUFPLEdBQVksRUFBRSxHQUFhOzs7OztxQ0FDeEQsQ0FBQSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQUEsRUFBOUIsd0JBQThCO2dDQUN2QixVQUFVLEdBQUksR0FBRyxDQUFDLElBQUksV0FBWixDQUFhO2dDQUM5QixxQkFBTSxnQkFBZ0IsQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7O2dDQUExRSxTQUEwRSxDQUFDOzs7cUNBRzNFLENBQUEsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssaUJBQWlCLENBQUEsRUFBeEMsd0JBQXdDO2dDQUNsQyxLQUFpQyxHQUFHLENBQUMsSUFBSSxFQUF4QyxVQUFVLGdCQUFBLEVBQUUsT0FBTyxhQUFBLEVBQUUsT0FBTyxhQUFBLENBQVk7Z0NBQ3hDLFFBQVEsR0FBSSxPQUFPLFNBQVgsQ0FBWTtnQ0FDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBeUIsVUFBVSxDQUFFLENBQUMsQ0FBQTtnQ0FDbEQscUJBQU0sZ0JBQWdCLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUE7O2dDQUF2RSxTQUF1RSxDQUFDOztvQ0FHNUUsc0JBQU8sR0FBRyxDQUFDLElBQUksRUFBRSxFQUFBOzs7cUJBQ3BCLENBQUMsQ0FBQztnQkFFSCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtvQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUM5RCxDQUFDLENBQUMsQ0FBQTs7OztLQUNMLENBQUE7QUFFRCxDQUFDOzs7b0JBQ0cscUJBQU0sR0FBRyxFQUFFLEVBQUE7O2dCQUFYLFNBQVcsQ0FBQTs7OztLQUNkLENBQUMsRUFBRSxDQUFBIn0=