import { apiUrl, EntityApiBase } from "./EntityApiBase";

export type LoginResult = { token: string, verified: boolean, user_id: string, hash: string }
export class AuthApi {
    async createLogin(email: string, pass: string) {
        const resp = await fetch(apiUrl("AuthApi", "create"), {
            method: "POST",
            body: JSON.stringify({
                email,
                pass,
            }),
            headers: EntityApiBase.makeHeaders()
        });
        const lr = await EntityApiBase.handleFetchResponse<LoginResult>(resp)
        EntityApiBase.token = lr.token;
        return lr;
    }

    async createUser(first_name: string, last_name: string, handle: string) {
        const resp = await fetch(apiUrl("AuthApi", "init"), {
            method: "POST",
            body: JSON.stringify({
                first_name,
                last_name,
                handle,
                dummy: false
            }),
            headers: EntityApiBase.makeHeaders()
        });
        const user = await EntityApiBase.handleFetchResponse<LoginResult>(resp)
        EntityApiBase.token = user.token;
        return user;
    }
    signOut() {
        EntityApiBase.token = "";
    }
    async loginWithToken(token: string) {
        return await this.login("", token);
    }
    async login(email: string, pass: string) {
        const resp = await fetch(apiUrl("AuthApi", "login"), {
            method: "POST",
            body: JSON.stringify({
                email,
                pass,
            }),
            headers: EntityApiBase.makeHeaders()
        });
        const result = await EntityApiBase.handleFetchResponse<LoginResult>(resp);
        //console.log("MY TOKEN IS BEING SET AS" + result.token);
        EntityApiBase.token = result.token;
        return result;
    }
    async resetPassword(email: string, tokenOrPass: string, isPass: boolean, newPassword: string) {
        const resp = await fetch(apiUrl("AuthApi", "resetpassword"), {
            method: "POST",
            body: JSON.stringify({
                email,
                tokenOrPass,
                isPass,
                newPassword
            }),
            headers: EntityApiBase.makeHeaders()
        });
        const result = await EntityApiBase.handleFetchResponse(resp);
        return result;
    }
}

export default new AuthApi();
