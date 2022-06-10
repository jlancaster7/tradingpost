import { pbkdf2Sync, randomBytes } from 'crypto'
import { execProc, execProcOne } from './entities/static/pool'
import { LoginResult } from './entities/apis/AuthApi'
import jwt from 'jsonwebtoken';


export const hashPass = async (pass: string, salt: string) => {
    return salt + pbkdf2Sync(pass, Buffer.from(salt), 100000, 128, 'sha512')
}

const key = process.env.sign_key as string;
//return token
export const loginPass = async (email: string, pass: string, csrf: string) => {

    const saltResult = await execProc<LoginResult>("tp.api_local_login_get", { data: { email, hash: pass } })
    if (!saltResult.length)
        throw new Error(`User '${email}' does not exists or invalid password`);

    const hash = hashPass(pass, saltResult[0].hash),
        passResult = await execProc<LoginResult>("tp.api_local_login_get", { data: { email, hash } });

    if (!passResult.length)
        throw new Error(`User '${email}' does not exists or invalid password`);

    const login = passResult[0];
    if (login.user_id) {
        //TODO move to UserAPI class instead
        const userResult = await execProcOne("public.api_api_user_get", { user_id: login.user_id, data: { id: login.user_id } });
        //TODO DISCUSS payload options CSRF, expire, etc. etc.
        //res.cookie("oj-csrf-token", crsfToken, { path: '/' });
        login.hash = jwt.sign({}, key, { subject: login.user_id });
    }
    else login.hash = "";
    return login;
}

export const loginToken = async (token: string) => {
    const info = JSON.parse(jwt.verify(token, key) as string);
    //TODO move to UserAPI class instead
    //TODO check CSRF token
    return await execProcOne("public.api_api_user_get", { user_id: info.sub, data: { id: info.sub } });
}

export const createLogin = async (email: string, password: string) => {
    var byteBuf = randomBytes(32),
        salt = byteBuf.toString('base64'),
        hash = hashPass(password, salt);
    await execProc("tp.api_local_login_insert", {
        email,
        hash
    });
}