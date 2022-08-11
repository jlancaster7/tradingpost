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
// import Finicity from "@tradingpost/common/finicity/index";
// import Brokerage from "@tradingpost/common/brokerage";
var body_parser_1 = __importDefault(require("body-parser"));
var pg_1 = __importDefault(require("pg"));
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, function (value) {
    return parseInt(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT8, function (value) {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT4, function (value) {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.NUMERIC, function (value) {
    return parseFloat(value);
});
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var app, port;
    return __generator(this, function (_a) {
        console.log(":::::: Starting TradingPost Worker Process ::::::");
        app = (0, express_1.default)();
        port = process.env.PORT || 8080;
        app.use(body_parser_1.default.json());
        app.use((0, cors_1.default)());
        app.get("/", function (req, res) {
            console.log("Request Made");
            res.send({ Hello: "World", port: port });
        });
        app.post("/finicity/webhook", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
            var customerId, _a, customerId, eventId, payload, accounts;
            return __generator(this, function (_b) {
                if (req.body.eventType === 'added') {
                    customerId = req.body.customerId;
                    // await brokerageService.addNewAccounts(customerId, 'finicity');
                }
                if (req.body.eventType === 'accountsDeleted') {
                    _a = req.body, customerId = _a.customerId, eventId = _a.eventId, payload = _a.payload;
                    accounts = payload.accounts;
                    // await brokerageService.removeAccounts(customerId, accounts, 'finicity');
                }
                return [2 /*return*/, res.send()];
            });
        }); });
        app.listen(port, function () {
            console.log("Server running at http://127.0.0.1:%s", port);
        });
        return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUFtRDtBQUNuRCw4Q0FBd0I7QUFHeEIsNkRBQTZEO0FBQzdELHlEQUF5RDtBQUN6RCw0REFBcUM7QUFDckMsMENBQW9CO0FBR3BCLFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFDLEtBQWE7SUFDekQsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFhO0lBQzNELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBYTtJQUMzRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQWE7SUFDNUQsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFNLEdBQUcsR0FBRzs7O1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO1FBaUIxRCxHQUFHLEdBQUcsSUFBQSxpQkFBTyxHQUFFLENBQUM7UUFDaEIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztRQUV0QyxHQUFHLENBQUMsR0FBRyxDQUFDLHFCQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzQixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUEsY0FBSSxHQUFFLENBQUMsQ0FBQztRQUVoQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFDLEdBQVksRUFBRSxHQUFhO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7WUFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLFVBQU8sR0FBWSxFQUFFLEdBQWE7OztnQkFDNUQsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxPQUFPLEVBQUU7b0JBQ3pCLFVBQVUsR0FBSSxHQUFHLENBQUMsSUFBSSxXQUFaLENBQWE7b0JBQzlCLGlFQUFpRTtpQkFDcEU7Z0JBRUQsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxpQkFBaUIsRUFBRTtvQkFDcEMsS0FBaUMsR0FBRyxDQUFDLElBQUksRUFBeEMsVUFBVSxnQkFBQSxFQUFFLE9BQU8sYUFBQSxFQUFFLE9BQU8sYUFBQSxDQUFZO29CQUN4QyxRQUFRLEdBQUksT0FBTyxTQUFYLENBQVk7b0JBQzNCLDJFQUEyRTtpQkFDOUU7Z0JBRUQsc0JBQU8sR0FBRyxDQUFDLElBQUksRUFBRSxFQUFBOzthQUNwQixDQUFDLENBQUM7UUFFSCxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDOUQsQ0FBQyxDQUFDLENBQUE7OztLQUNMLENBQUE7QUFFRCxDQUFDOzs7b0JBQ0cscUJBQU0sR0FBRyxFQUFFLEVBQUE7O2dCQUFYLFNBQVcsQ0FBQTs7OztLQUNkLENBQUMsRUFBRSxDQUFBIn0=