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
exports.__esModule = true;
exports.useTwitterAuth = void 0;
var async_storage_1 = require("@react-native-async-storage/async-storage");
var api_1 = require("@tradingpost/common/api");
var expo_web_browser_1 = require("expo-web-browser");
var react_1 = require("react");
var react_native_uuid_1 = require("react-native-uuid");
//TODO: SHould put this all in the app later as a generate link 
var clientId = "cm9mUHBhbVUxZzcyVGJNX0xrc2E6MTpjaQ";
var platform = "twitter", redirectUriText = "http://localhost:19006/auth/".concat(platform), redirectUri = new URL(redirectUriText), authUrlText = "https://twitter.com/i/oauth2/authorize";
function useTwitterAuth() {
    var _this = this;
    var state = (0, react_1.useRef)(react_native_uuid_1["default"].v4());
    var intervalHandler = (0, react_1.useRef)();
    var openAuth = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _challenge, authUrl, openResult, code;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, async_storage_1["default"].removeItem("auth-twitter-code")];
                case 1:
                    _a.sent();
                    _challenge = Math.random().toString().substring(2, 10);
                    authUrl = new URL(authUrlText);
                    authUrl.searchParams.append("response_type", "code");
                    authUrl.searchParams.append("client_id", clientId);
                    authUrl.searchParams.append("redirect_uri", redirectUriText);
                    authUrl.searchParams.append("state", state.current);
                    authUrl.searchParams.append("scope", "users.read tweet.read");
                    authUrl.searchParams.append("code_challenge", _challenge);
                    authUrl.searchParams.append("code_challenge_method", "plain");
                    return [4 /*yield*/, (0, expo_web_browser_1.openBrowserAsync)(authUrl.toString())];
                case 2:
                    openResult = _a.sent();
                    return [4 /*yield*/, new Promise(function (res, rej) {
                            //HACK: will look for a better solution later 
                            //TODO: Also need to check state here just in case no matter what ... 
                            clearInterval(intervalHandler.current);
                            intervalHandler.current = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                var code;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, async_storage_1["default"].getItem("auth-twitter-code")];
                                        case 1:
                                            code = _a.sent();
                                            if (code) {
                                                res(code);
                                                clearInterval(intervalHandler.current);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 1000);
                        })
                        // let respTest = await resp.text();
                        // if (!resp.ok)
                        //     throw new Error(respTest)
                        // else {
                        //     //respTest = await resp.text();
                        //     console.log(respTest);
                        // }
                        //const auth    //: ITokenResponse =  JSON.parse(respTest);  //await resp.json();
                    ];
                case 3:
                    code = _a.sent();
                    return [4 /*yield*/, api_1.Api.User.extensions.linkSocialAccount({ platform: platform, code: code, challenge: _challenge })];
                case 4: 
                // let respTest = await resp.text();
                // if (!resp.ok)
                //     throw new Error(respTest)
                // else {
                //     //respTest = await resp.text();
                //     console.log(respTest);
                // }
                //const auth    //: ITokenResponse =  JSON.parse(respTest);  //await resp.json();
                return [2 /*return*/, _a.sent()];
            }
        });
    }); }, []);
    //Clean up interval if its dangling 
    (0, react_1.useEffect)(function () {
        return function () { return clearInterval(intervalHandler.current); };
    }, []);
    return openAuth;
}
exports.useTwitterAuth = useTwitterAuth;
// export const getToken = async (info: {
//     code: string
// }) => {
//     try {
//         // const meResp = await fetch("https://api.twitter.com/2/users/me", {
//         //     method: "GET",
//         //     headers: {
//         //         Authorization: `Bearer ${auth.access_token}`
//         //     }
//         // });
//         // if (!meResp.ok)
//         //     throw new Error(await meResp.text())
//         // const meData: {
//         //     data: TwitterMe
//         // } = await meResp.json();
//     })
// }
