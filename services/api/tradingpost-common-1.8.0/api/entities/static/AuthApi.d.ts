export type LoginResult = {
    token: string;
    verified: boolean;
    user_id: string;
    hash: string;
};
export declare class AuthApi {
    createLogin(email: string, pass: string): Promise<LoginResult>;
    createUser(first_name: string, last_name: string, handle: string): Promise<LoginResult>;
    signOut(): void;
    loginWithToken(token: string): Promise<LoginResult>;
    login(email: string, pass: string): Promise<LoginResult>;
    resetPassword(email: string, tokenOrPass: string, isPass: boolean, newPassword: string): Promise<unknown>;
    forgotPassword(email: string, callbackUrl: string): Promise<unknown>;
}
declare const _default: AuthApi;
export default _default;
