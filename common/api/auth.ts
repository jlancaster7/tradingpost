import { pbkdf2Sync, randomBytes } from 'crypto'
import { execProc, execProcOne } from './entities/static/pool'
import { LoginResult } from './entities/static/AuthApi'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DefaultConfig } from '../configuration';
import { PublicError } from './entities/static/EntityApiBase';


export const hashPass = (pass: string, salt: string) => {
    return salt + pbkdf2Sync(pass, Buffer.from(salt), 100000, 128, 'sha512').toString("base64");
}

const makeUserToken = async (user_id: string) => {
    const authKey = await DefaultConfig.fromCacheOrSSM("authkey");
    return jwt.sign({}, authKey, { subject: user_id });
}
//return token
export const loginPass = async (email: string, pass: string, csrf: string) => {
    console.log(`${email}::::${pass}`);
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
        token = jwt.sign({}, authKey, { subject: login.user_id });
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
    const info = jwt.verify(token, authKey) as JwtPayload;
    //TODO move to UserAPI class instead
    //TODO check CSRF token
    return {
        verified: Boolean(info.sub),
        token,
        user_id: info.sub
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
    handle: string
}) => {

    const [newUser] = await execProc<{ user_id: string }>("tp.api_local_login_create_user", {
        data
    });

    return {
        verified: true,
        token: await makeUserToken(newUser.user_id),
        user_id: newUser.user_id
    } as LoginResult
}