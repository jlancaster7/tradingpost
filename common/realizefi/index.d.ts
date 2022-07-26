import { CreateUser, ListUsers, GetUser, AuthPortalScopes, SupportedBrokerages, AuthPortalResponse, ListOrdersStatus, ListOrdersResponse, GetOrderResponse, ListUsersOrdersResponse, ListPositionsResponse, TimeSpan, GetApproximateHistoricalHoldingsResponse, PerformanceInterval, GetApproximateHistoricalPerformanceResponse, GetInstitutionAssetResponse, ListInstitutionAssetsResponse, ListWebhooksResponse, ListTransactionsResponse, GetBalancesResponse } from "./interfaces";
export declare const PRODUCTION_BASE_URL = "https://www.realizefi.com/api";
export declare const DEVELOPMENT_BASE_URL = "";
/**
 * TODO:
 *  - Aborting
 *  - Retrying
 *  - Failure with 4xx response, returns another json body we can further investigate
 *      should make into realizefi error
 */
export default class Realizefi {
    private readonly baseUrl;
    private readonly redirectUrl;
    private apiKey;
    constructor(apiKey: string, redirectUrl: string, baseUrl?: string);
    createUser: () => Promise<CreateUser>;
    listUsers: (cursor: string, take: string) => Promise<ListUsers>;
    disconnectUsersInstitutionLink: (userId: string, institutionLinkId: string) => Promise<boolean>;
    getUser: (userId: string) => Promise<GetUser>;
    deleteUser: (userId: string) => Promise<boolean>;
    createAuthPortal: (userId: string, successRedirect: string, failureRedirect: string, scopes?: AuthPortalScopes[] | undefined, brokerages?: SupportedBrokerages[] | undefined) => Promise<AuthPortalResponse>;
    placeOrder: () => Promise<never>;
    listOrders: (institutionLinkId: string, status?: ListOrdersStatus, cursor?: string | undefined, take?: string | undefined) => Promise<ListOrdersResponse>;
    getOrder: (institutionLinkId: string, orderId: string) => Promise<GetOrderResponse>;
    listUsersOrders: (userId: string, status?: ListOrdersStatus, cursor?: string | undefined, take?: string | undefined) => Promise<ListUsersOrdersResponse>;
    listPositions: (institutionLinkId: string) => Promise<ListPositionsResponse>;
    createClientSession: () => Promise<never>;
    getApproximateHistoricalHoldings: (institutionLinkId: string, timeSpan?: TimeSpan | undefined) => Promise<GetApproximateHistoricalHoldingsResponse>;
    /**
     * from: yyyy-MM-dd format
     * to: yyyy-MM-dd format
     * @param institutionLinkId
     * @param interval
     * @param from
     * @param to
     */
    getApproximateHistoricalPerformance: (institutionLinkId: string, interval?: PerformanceInterval | undefined, from?: string | undefined, to?: string | undefined) => Promise<GetApproximateHistoricalPerformanceResponse>;
    getInstitutionAsset: (institutionLinkId: string, symbol: string) => Promise<GetInstitutionAssetResponse>;
    listInstitutionAssets: (institutionLinkId: string, symbols: string[]) => Promise<ListInstitutionAssetsResponse>;
    listWebhooks: () => Promise<ListWebhooksResponse>;
    listTransactions: (institutionLinkId: string, cursor?: string | undefined, take?: string | undefined) => Promise<ListTransactionsResponse>;
    getBalances: (institutionLinkId: string) => Promise<GetBalancesResponse>;
}
