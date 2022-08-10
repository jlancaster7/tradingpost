import { apiUrl, EntityApiBase } from "./EntityApiBase";

export type LoginResult = { hash: string, verified: boolean, user_id: string }

export class AuthApi {
    async createLogin(email: string, pass: string) {
        const resp = await fetch(apiUrl(this.constructor.name, "create"), {
            method: "POST",
            body: JSON.stringify({
                email,
                pass,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await EntityApiBase.handleFetchResponse<LoginResult>(resp)
    }
    async loginWithToken(token: string) {
        await this.login("", token);
    }
    async login(email: string, pass: string) {
        const resp = await fetch(apiUrl(this.constructor.name, "login"), {
            method: "POST",
            body: JSON.stringify({
                email,
                pass,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await EntityApiBase.handleFetchResponse<LoginResult>(resp);
    }
}

export default new AuthApi();



