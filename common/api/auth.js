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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWdEO0FBQ2hELGlEQUE4RDtBQUU5RCxnRUFBK0M7QUFDL0Msb0RBQWlEO0FBQ2pELG1FQUE4RDtBQUd2RCxNQUFNLFFBQVEsR0FBRyxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsRUFBRTtJQUNuRCxPQUFPLElBQUksR0FBRyxJQUFBLG1CQUFVLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEcsQ0FBQyxDQUFBO0FBRlksUUFBQSxRQUFRLFlBRXBCO0FBRUQsTUFBTSxhQUFhLEdBQUcsQ0FBTyxPQUFlLEVBQUUsRUFBRTtJQUM1QyxNQUFNLE9BQU8sR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlELE9BQU8sc0JBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELENBQUMsQ0FBQSxDQUFBO0FBQ0QsY0FBYztBQUNQLE1BQU0sU0FBUyxHQUFHLENBQU8sS0FBYSxFQUFFLElBQVksRUFBRSxJQUFZLEVBQUUsRUFBRTtJQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7SUFDbkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLGVBQVEsRUFBYyx3QkFBd0IsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUU3RixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07UUFDbEIsTUFBTSxJQUFJLDJCQUFXLENBQUMsU0FB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