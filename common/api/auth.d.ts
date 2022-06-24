export declare const hashPass: (pass: string, salt: string) => string;
export declare const loginPass: (email: string, pass: string, csrf: string) => Promise<{
    token: string;
    verified: boolean;
    user_id: string;
    hash: string;
}>;
export declare const loginToken: (token: string) => Promise<{
    verified: boolean;
    token: string;
}>;
export declare const createLogin: (email: string, password: string) => Promise<{
    token: string;
}>;
export declare const createUser: (data: {
    email: string;
    first_name: string;
    last_name: string;
    handle: string;
}) => Promise<any[]>;
