declare namespace Express {
    export interface Request {
        user?: {
            authToken: string
            username: string
            password: string
        }
        name: string
    }
}