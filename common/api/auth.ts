import { pbkdf2Sync, randomBytes } from 'crypto'
import { execProc, execProcOne, getHivePool } from '../db'
import { LoginResult } from './entities/static/AuthApi'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DefaultConfig } from '../configuration';
import { PublicError } from './entities/static/EntityApiBase';
import UserApi from './entities/apis/UserApi'
import { sendByTemplate } from '../sendGrid';

export const hashPass = (pass: string, salt: string) => {
    return salt + pbkdf2Sync(pass, Buffer.from(salt), 100000, 128, 'sha512').toString("base64");
}

const makeUserToken = async (user_id: string) => {
    const authKey = await DefaultConfig.fromCacheOrSSM("authkey");
    return jwt.sign({}, authKey, { subject: user_id });
}

//return token
export const loginPass = async (email: string, pass: string, csrf: string) => {
    const saltResult = await execProc<LoginResult>("tp.api_local_login_get", { data: { email } })

    if (!saltResult.length)
        throw new PublicError(`User '${email}' does not exists or invalid password`, 401);

    const hash = hashPass(pass, saltResult[0].hash),
        passResult = await execProc<LoginResult>("tp.api_local_login_get", { data: { email, hash } });


    if (!passResult.length)
        throw new PublicError(`User '${email}' does not exists or invalid password`, 401);

    const login = passResult[0];
    login.hash = "";

    let token = "";
    const authKey = await DefaultConfig.fromCacheOrSSM("authkey");
    if (login.user_id) {
        //TODO move to UserAPI class instead
        //const userResult = await execProcOne("public.api_api_user_get", { user_id: login.user_id, data: { id: login.user_id } });
        //TODO DISCUSS payload options CSRF, expire, etc. etc.
        //res.cookie("oj-csrf-token", crsfToken, { path: '/' });
        token = jwt.sign({ verified: login.verified }, authKey, { subject: login.user_id });
    }
    else {
        token = jwt.sign({ claims: { email } }, authKey)
    }

    return {
        ...login,
        token
    } as LoginResult;
}

export const loginToken = async (token: string) => {
    const authKey = await DefaultConfig.fromCacheOrSSM("authkey");
    let info = jwt.verify(token, authKey) as JwtPayload;
    let verified = info.verified;
    let user_id = info.sub;
    if (!info.verified) {
        const pool = await getHivePool;
        verified = (await pool.query("SELECT verified from tp.local_login where user_id = $1", [user_id])).rows[0]?.verified;
        token = jwt.sign({ verified }, authKey, { subject: user_id });
    }
    //TODO move to UserAPI class instead
    //TODO check CSRF token
    return {
        verified,
        token,
        user_id
    } as LoginResult

    //await execProcOne("public.api_api_user_get", { user_id: info.sub, data: { id: info.sub } });
}

export const createLogin = async (email: string, password: string) => {
    var byteBuf = randomBytes(30),
        salt = byteBuf.toString('base64'),
        hash = hashPass(password, salt);

    await execProc("tp.api_local_login_insert", {
        data: {
            email,
            hash
        }
    });


    const authKey = await DefaultConfig.fromCacheOrSSM("authkey");
    const token = jwt.sign({ claims: { email } }, authKey)

    return {
        token
    }
}

export const createUser = async (data: {
    email: string,
    first_name: string,
    last_name: string,
    handle: string,
    dummy: boolean
}) => {

    const [newUser] = await execProc<{ user_id: string }>("tp.api_local_login_create_user", {
        data
    });

    return {
        verified: false,
        token: await makeUserToken(newUser.user_id),
        user_id: newUser.user_id
    } as LoginResult
}

export const forgotPassword = async (email: string, callbackUrl: string) => {
    //generate reset token 
    const authKey = await DefaultConfig.fromCacheOrSSM("authkey");

    const [user] = await execProc<LoginResult>("tp.api_local_login_get", { data: { email } });

    if (user) {

        //TODO: make this token expire faster and attach this to a code ( to prevent multiple tokens from working)
        const token = jwt.sign({ resetUserId: user.user_id }, await DefaultConfig.fromCacheOrSSM("authkey"));
        await sendByTemplate({
            to: email,
            templateId: "d-f232bafc8eb04bd99986991c71ab15cd",
            dynamicTemplateData: {
                Weblink: callbackUrl + `/resetpassword?token=${token}`
            }
        })
    }
}

export const resetPassword = async (email: string, tokenOrPass: string, isPass: boolean, newPassword: string) => {
    let userId = null;
    if (isPass) {
        const result = await loginPass(email, tokenOrPass, '');
        userId = result.user_id;
    }
    else {
        const data = jwt.verify(tokenOrPass, await DefaultConfig.fromCacheOrSSM("authkey")) as jwt.JwtPayload;
        userId = data.resetUserId;
    }


    var byteBuf = randomBytes(30),
        salt = byteBuf.toString('base64'),
        hash = hashPass(newPassword, salt);

    (await getHivePool).query("UPDATE tp.local_login set hash=$1 where user_id=$2", [hash, userId])

    return {};
}