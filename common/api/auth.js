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
exports.createLogin = exports.loginToken = exports.loginPass = exports.hashPass = void 0;
const crypto_1 = require("crypto");
const pool_1 = require("./entities/static/pool");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashPass = (pass, salt) => __awaiter(void 0, void 0, void 0, function* () {
    return salt + (0, crypto_1.pbkdf2Sync)(pass, Buffer.from(salt), 100000, 128, 'sha512');
});
exports.hashPass = hashPass;
const key = process.env.sign_key;
//return token
const loginPass = (email, pass, csrf) => __awaiter(void 0, void 0, void 0, function* () {
    const saltResult = yield (0, pool_1.execProc)("tp.api_local_login_get", { data: { email, hash: pass } });
    if (!saltResult.length)
        throw new Error(`User '${email}' does not exists or invalid password`);
    const hash = (0, exports.hashPass)(pass, saltResult[0].hash), passResult = yield (0, pool_1.execProc)("tp.api_local_login_get", { data: { email, hash } });
    if (!passResult.length)
        throw new Error(`User '${email}' does not exists or invalid password`);
    const login = passResult[0];
    if (login.user_id) {
        //TODO move to UserAPI class instead
        const userResult = yield (0, pool_1.execProcOne)("public.api_api_user_get", { user_id: login.user_id, data: { id: login.user_id } });
        //TODO DISCUSS payload options CSRF, expire, etc. etc.
        //res.cookie("oj-csrf-token", crsfToken, { path: '/' });
        login.hash = jsonwebtoken_1.default.sign({}, key, { subject: login.user_id });
    }
    else
        login.hash = "";
    return login;
});
exports.loginPass = loginPass;
const loginToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const info = JSON.parse(jsonwebtoken_1.default.verify(token, key));
    //TODO move to UserAPI class instead
    //TODO check CSRF token
    return yield (0, pool_1.execProcOne)("public.api_api_user_get", { user_id: info.sub, data: { id: info.sub } });
});
exports.loginToken = loginToken;
const createLogin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    var byteBuf = (0, crypto_1.randomBytes)(32), salt = byteBuf.toString('base64'), hash = (0, exports.hashPass)(password, salt);
    yield (0, pool_1.execProc)("tp.api_local_login_insert", {
        email,
        hash
    });
});
exports.createLogin = createLogin;
