export interface CreateUser {
    id: string
    institutionLinks: any[]
}

export interface ListUsers {
    data: {
        id: string
        institutionLinks: {
            id: string
            institution: string
            accountNumber: string
            healthStatus: string
            permissionScopes: string[]
        }[]
    }
}

export interface GetUser {
    id: string
    institutionLinks: {
        id: string
        institution: string
        accountNumber: string
        healthStatus: string
        permissionScopes: string[]
    }[]
}

export interface WebhookMessage {
    eventType: string
    institutionLinkId: string
    userId: string
    data: {
        id: string
        status: string
    }[]
}

export type AuthPortalScopes = "institution_link:read_and_trade" | "institution_link:read"
export type SupportedBrokerages =
    "ALPACA"
    | "TD"
    | "COINBASE"
    | "ROBINHOOD"
    | "WEBULL"
    | "SCHWAB"
    | "ETRADE"
    | "VANGUARD"

export interface AuthPortalResponse {
    id: string
    url: string
    name: string
    scopes: string[]
    env: string
    authUrls: {
        ALPACA: string
        TD: string
        COINBASE: string
        ROBINHOOD: string
        WEBULL: string
        SCHWAB: string
        ETRADE: string
        VANGUARD: string
    }
}

export type ListOrdersStatus = "ALL" | "OPEN"

export interface ListOrdersResponse {
    data: {
        id: string
        institutionLinkId: string
        institutionLink: {
            id: string
            institution: string
        }
        institutionReceivedAt: string
        filledQuantity: string
        filledAveragePrice: string
        closedAt: string
        quantity: string
        status: string
        type: string
        class: string
        side: string
        timeInForce: string
        limitPrice: string
        stopPrice: string
        security: {
            id: string
            type: string
            symbol: string
            shareClassFigi: string
            compositeFigi: string
            strikePrice: string
            expiration: string
            contractType: string
            primaryExchange: string
        }
    }[]
}

export interface GetOrderResponse {

}

export interface ListUsersOrdersResponse {

}

export interface ListPositionsResponse {
    data: {
        averagePrice: string
        costBasis: string
        currentDayProfitLossPercentage: string
        currentDayProfitLoss: string
        longQuantity: string
        marketValue: string
        symbol: string
        shortQuantity: string
        security: {
            id: string
            type: string
            primaryExchange: string
            shareClassFigi: string
            compositeFigi: string
            strikePrice: string
            expiration: string
            contractType: string
            symbol: string
        }
    }[]
    institution: SupportedBrokerages
}

export type TimeSpan = "all" | "3month" | "month" | "week" | "day"

export interface GetApproximateHistoricalHoldingsResponse {
    holdingEntry: {
        cash: string
        accountValue: string
        timestamp: string
        positions: Record<string, {
            marketValue: string
            qty: string
            security: {
                id: string
                symbol: string
                type: string
            }
        }>
    }[]
    timestamp: number
    interval: string
}

export type PerformanceInterval = "1Min" | "5Min" | "1H" | "1D" | "10Min"

export interface GetApproximateHistoricalPerformanceResponse {
    data: {
        timestamp: number[]
        equity: string[]
        interval: PerformanceInterval
    }
}

export interface GetInstitutionAssetResponse {

}

export interface ListInstitutionAssetsResponse {

}

export interface ListWebhooksResponse {

}

// TODO: do the details schema change as our type changes?
export interface ListTransactionsResponse {
    // data: {
    //     id: string
    //     transactionDate: string
    //     settlementDate: string
    //     type: string
    //     netAmount: string
    //     details: {
    //         transactionType: string
    //         transactionSubType: string
    //         side: string
    //         amount: string
    //         quantity: string
    //         price: string
    //         adjustmentRatio: number
    //         instrument: {
    //             symbol: string
    //             underlying: {
    //                 instrument: {
    //                     symbol: string
    //                 }
    //             },
    //             strike: string
    //             expiration: string
    //             type: string // CALL | PUT
    //         }
    //         fees: string
    //     } | null
    // }[]
}

export interface GetBalancesResponse {
    buyingPower: string
    cash: string
    accountValue: string
    margin: string
}