import {DateTime} from "luxon";

declare namespace Express {
    export interface Request {
        user?: UserInterface
    }
}

interface Config {
    finicityAppKey: string
    finicityPartnerId: string
    finicityPartnerSecret: string
    finicityWebhook: string
}

interface UserInterface {
    authToken: string
    username: string
    password: string
    finicityCustomerId: string
    finicityCustomerUsername: string
    finicityCustomerCreated: DateTime | undefined
}