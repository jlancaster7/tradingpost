import {DateTime} from "luxon";

export type RobinhoodUser = {
    userId: string
    username: string
    deviceToken: string
    status: string
    usesMfa: boolean,
    accessToken: string | null
    refreshToken: string | null
}

export type RobinhoodUserTable = {
    id: number
    updatedAt: DateTime
    createdAt: DateTime
} & RobinhoodUser