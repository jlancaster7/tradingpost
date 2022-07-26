export declare type LoginResult = {
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
}
declare const _default: AuthApi;
export default _default;
