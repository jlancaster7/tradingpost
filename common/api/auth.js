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
exports.createUser = exports.createLogin = exports.loginToken = exports.loginPass = exports.hashPass = void 0;
const crypto_1 = require("crypto");
const pool_1 = require("./entities/static/pool");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configuration_1 = require("../configuration");
const EntityApiBase_1 = require("./entities/static/EntityApiBase");
const hashPass = (pass, salt) => {
    return salt + (0, crypto_1.pbkdf2Sync)(pass, Buffer.from(salt), 100000, 128, 'sha512').toString("base64");
};
exports.hashPass = hashPass;
const makeUserToken = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
    return jsonwebtoken_1.default.sign({}, authKey, { subject: user_id });
});
//return token
const loginPass = (email, pass, csrf) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${email}::::${pass}`);
    const saltResult = yield (0, pool_1.execProc)("tp.api_local_login_get", { data: { email } });
    if (!saltResult.length)
        throw new EntityApiBase_1.PublicError(`User '${email}' does not exists or invalid password`, 401);
    const hash = (0, exports.hashPass)(pass, saltResult[0].hash), passResult = yield (0, pool_1.execProc)("tp.api_local_login_get", { data: { email, hash } });
    if (!passResult.length)
        throw new EntityApiBase_1.PublicError(`User '${email}' does not exists or invalid password`, 401);
    const login = passResult[0];
    login.hash = "";
    let token = "";
    const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
    if (login.user_id) {
        //TODO move to UserAPI class instead
        //const userResult = await execProcOne("public.api_api_user_get", { user_id: login.user_id, data: { id: login.user_id } });
        //TODO DISCUSS payload options CSRF, expire, etc. etc.
        //res.cookie("oj-csrf-token", crsfToken, { path: '/' });
        token = jsonwebtoken_1.default.sign({}, authKey, { subject: login.user_id });
    }
    else {
        token = jsonwebtoken_1.default.sign({ claims: { email } }, authKey);
    }
    return Object.assign(Object.assign({}, login), { token });
});
exports.loginPass = loginPass;
const loginToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
    const info = jsonwebtoken_1.default.verify(token, authKey);
    //TODO move to UserAPI class instead
    //TODO check CSRF token
    return {
        verified: Boolean(info.sub),
        token,
        user_id: info.sub
    };
    //await execProcOne("public.api_api_user_get", { user_id: info.sub, data: { id: info.sub } });
});
exports.loginToken = loginToken;
const createLogin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    var byteBuf = (0, crypto_1.randomBytes)(30), salt = byteBuf.toString('base64'), hash = (0, exports.hashPass)(password, salt);
    yield (0, pool_1.execProc)("tp.api_local_login_insert", {
        data: {
            email,
            hash
        }
    });
    const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
    const token = jsonwebtoken_1.default.sign({ claims: { email } }, authKey);
    return {
        token
    };
});
exports.createLogin = createLogin;
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const [newUser] = yield (0, pool_1.execProc)("tp.api_local_login_create_user", {
        data
    });
    return {
        verified: true,
        token: yield makeUserToken(newUser.user_id),
        user_id: newUser.user_id
    };
});
exports.createUser = createUser;
