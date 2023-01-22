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
exports.resetPassword = exports.forgotPassword = exports.createUser = exports.createLogin = exports.loginToken = exports.loginPass = exports.hashPass = void 0;
const crypto_1 = require("crypto");
const db_1 = require("../db");
const User_server_1 = __importDefault(require("./entities/extensions/User.server"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configuration_1 = require("../configuration");
const EntityApiBase_1 = require("./entities/static/EntityApiBase");
const sendGrid_1 = require("../sendGrid");
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
    const saltResult = yield (0, db_1.execProc)("tp.api_local_login_get", { data: { email } });
    if (!saltResult.length)
        throw new EntityApiBase_1.PublicError(`User '${email}' does not exists or invalid password`, 401);
    const hash = (0, exports.hashPass)(pass, saltResult[0].hash), passResult = yield (0, db_1.execProc)("tp.api_local_login_get", { data: { email, hash } });
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
        token = jsonwebtoken_1.default.sign({ verified: login.verified }, authKey, { subject: login.user_id });
    }
    else {
        token = jsonwebtoken_1.default.sign({ claims: { email } }, authKey);
    }
    return Object.assign(Object.assign({}, login), { token });
});
exports.loginPass = loginPass;
const loginToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
    let info = jsonwebtoken_1.default.verify(token, authKey);
    let verified = info.verified;
    let user_id = info.sub;
    if (!info.verified) {
        const pool = yield db_1.getHivePool;
        verified = (_a = (yield pool.query("SELECT verified from tp.local_login where user_id = $1", [user_id])).rows[0]) === null || _a === void 0 ? void 0 : _a.verified;
        token = jsonwebtoken_1.default.sign({ verified }, authKey, { subject: user_id });
    }
    //TODO move to UserAPI class instead
    //TODO check CSRF token
    return {
        verified,
        token,
        user_id
    };
    //await execProcOne("public.api_api_user_get", { user_id: info.sub, data: { id: info.sub } });
});
exports.loginToken = loginToken;
const createLogin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    var byteBuf = (0, crypto_1.randomBytes)(30), salt = byteBuf.toString('base64'), hash = (0, exports.hashPass)(password, salt);
    yield (0, db_1.execProc)("tp.api_local_login_insert", {
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
    const [newUser] = yield (0, db_1.execProc)("tp.api_local_login_create_user", { data });
    try {
        yield User_server_1.default.sendEmailValidation({
            body: undefined,
            extra: {
                userId: newUser.user_id,
            }
        });
    }
    catch (ex) {
        console.error(ex);
    }
    return {
        verified: false,
        token: yield makeUserToken(newUser.user_id),
        user_id: newUser.user_id
    };
});
exports.createUser = createUser;
const forgotPassword = (email, callbackUrl) => __awaiter(void 0, void 0, void 0, function* () {
    //generate reset token 
    const authKey = yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey");
    const [user] = yield (0, db_1.execProc)("tp.api_local_login_get", { data: { email } });
    if (user) {
        //TODO: make this token expire faster and attach this to a code ( to prevent multiple tokens from working)
        const token = jsonwebtoken_1.default.sign({ resetUserId: user.user_id, resetEmail: email }, yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey"));
        yield (0, sendGrid_1.sendByTemplate)({
            to: email,
            templateId: "d-f232bafc8eb04bd99986991c71ab15cd",
            dynamicTemplateData: {
                Weblink: callbackUrl + `/resetpassword?token=${token}`
            }
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (email, tokenOrPass, isPass, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = null;
    if (isPass) {
        const result = yield (0, exports.loginPass)(email, tokenOrPass, '');
        userId = result.user_id;
    }
    else {
        const data = jsonwebtoken_1.default.verify(tokenOrPass, yield configuration_1.DefaultConfig.fromCacheOrSSM("authkey"));
        userId = data.resetUserId;
        email = data.resetEmail;
    }
    var byteBuf = (0, crypto_1.randomBytes)(30), salt = byteBuf.toString('base64'), hash = (0, exports.hashPass)(newPassword, salt);
    //TODO: clean this up
    (yield db_1.getHivePool).query("UPDATE tp.local_login set hash=$1, updated_at = now()  where user_id=$2 or email=$3", [hash, userId, email]);
    return {};
});
exports.resetPassword = resetPassword;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQWdEO0FBQ2hELDhCQUEwRDtBQUUxRCxvRkFBcUU7QUFDckUsZ0VBQStDO0FBQy9DLG9EQUFpRDtBQUNqRCxtRUFBOEQ7QUFFOUQsMENBQTZDO0FBRXRDLE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxFQUFFO0lBQ25ELE9BQU8sSUFBSSxHQUFHLElBQUEsbUJBQVUsRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRyxDQUFDLENBQUE7QUFGWSxRQUFBLFFBQVEsWUFFcEI7QUFFRCxNQUFNLGFBQWEsR0FBRyxDQUFPLE9BQWUsRUFBRSxFQUFFO0lBQzVDLE1BQU0sT0FBTyxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDOUQsT0FBTyxzQkFBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDdkQsQ0FBQyxDQUFBLENBQUE7QUFFRCxjQUFjO0FBQ1AsTUFBTSxTQUFTLEdBQUcsQ0FBTyxLQUFhLEVBQUUsSUFBWSxFQUFFLElBQVksRUFBRSxFQUFFO0lBQ3pFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBQSxhQUFRLEVBQWMsd0JBQXdCLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFN0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNO1FBQ2xCLE1BQU0sSUFBSSwyQkFBVyxDQUFDLFNBQVMsS0FBSyx1Q0FBdUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJ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