"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var api_1 = __importDefault(require("./api"));
var body_parser_1 = __importDefault(require("body-parser"));
var app = (0, express_1.default)();
var port = 8083; // default port to listen
app.use(body_parser_1.default.json());
// define a route handler for the default home page
app.use("/api", api_1.default);
app.get("/", function (req, res) {
    // render the index template
    res.json({ "HELLO": "thing" });
});
// start the express server
app.listen(port, function () {
    // tslint:disable-next-line:no-console
    console.log("Entity Manager server started at http://localhost:".concat(port));
});
