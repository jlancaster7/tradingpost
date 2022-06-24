import fetch from 'node-fetch';

import {
    CreateUser, ListUsers, GetUser, WebhookMessage,
    AuthPortalScopes, SupportedBrokerages, AuthPortalResponse,
    ListOrdersStatus, ListOrdersResponse, GetOrderResponse,
    ListUsersOrdersResponse, ListPositionsResponse,
    TimeSpan, GetApproximateHistoricalHoldingsResponse,
    PerformanceInterval, GetApproximateHistoricalPerformanceResponse,
    GetInstitutionAssetResponse, ListInstitutionAssetsResponse,
    ListWebhooksResponse, ListTransactionsResponse, GetBalancesResponse
} from "./interfaces";

export const PRODUCTION_BASE_URL = "https://www.realizefi.com/api/users";
export const DEVELOPMENT_BASE_URL = "";

class RealizeFiError extends Error {
    constructor(m: string) {
        super(m);
    }
}


/**
 * TODO:
 *  - Aborting
 *  - Retrying
 *  - Failure with 4xx response, returns another json body we can further investigate
 *      should make into realizefi error
 */

export default class Finicity {
    private readonly baseUrl: string;
    private readonly redirectUrl: string;
    private apiKey: string;

    constructor(apiKey: string, redirectUrl: string, baseUrl: string = PRODUCTION_BASE_URL) {
        this.apiKey = apiKey;
        this.redirectUrl = redirectUrl
        this.baseUrl = baseUrl;
    }

    createUser = async (): Promise<CreateUser> => {
        const requestUrl = `${this.baseUrl}/users`;
        try {
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as CreateUser;
        } catch (e) {
            throw e;
        }
    }

    listUsers = async (cursor: string, take: string): Promise<ListUsers> => {
        let requestUrl = `${this.baseUrl}/users`;

        const queryParams = new URLSearchParams('');
        if (cursor) queryParams.append('cursor', cursor);
        if (take) queryParams.append('take', take)
        if (queryParams.toString().length > 0) requestUrl += queryParams.toString()

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })
            return await response.json() as ListUsers;
        } catch (e) {
            throw e;
        }
    }

    disconnectUsersInstitutionLink = async (userId: string, institutionLinkId: string): Promise<boolean> => {
        const requestUrl = `${this.baseUrl}/users/${userId}/institution_links/${institutionLinkId}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })
            return response.status === 204;
        } catch (e) {
            throw e;
        }
    }

    getUser = async (userId: string): Promise<GetUser> => {
        let requestUrl = `${this.baseUrl}/users/${userId}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })
            return await response.json() as GetUser;
        } catch (e) {
            throw e;
        }
    }

    deleteUser = async (userId: string): Promise<boolean> => {
        let requestUrl = `${this.baseUrl}/users/${userId}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })
            return response.status === 204;
        } catch (e) {
            throw e;
        }
    }

    // TODO: Add in ability to limit what brokers users sign up
    //  with
    // TODO: Add in ability to limit scopes of trades(read only, vs. execute)
    createAuthPortal = async (
        userId: string, successRedirect: string,
        failureRedirect: string, scopes?: AuthPortalScopes[], brokerages?: SupportedBrokerages[]
    ): Promise<AuthPortalResponse> => {
        let body: any = {
            redirects: {
                'success': successRedirect,
                'failure': failureRedirect
            },
            ...(scopes && {scopes: [...scopes]}),
            ...(brokerages && {select: [...brokerages]})
        };

        let requestUrl = `${this.baseUrl}/users/${userId}/auth_portals`;

        try {
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });
            return await response.json() as AuthPortalResponse;
        } catch (e) {
            throw e;
        }
    }

    // TODO:
    placeOrder = async () => {
        throw new Error("implement me")
    };

    listOrders = async (institutionLinkId: string, status: ListOrdersStatus = "ALL", cursor?: string, take?: string): Promise<ListOrdersResponse> => {
        let qp = new URLSearchParams('');
        qp.append('status', status)
        if (cursor) qp.append('cursor', cursor)
        if (take) qp.append('take', take)

        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/orders${qp.toString()}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as ListOrdersResponse;
        } catch (e) {
            throw e;
        }
    }

    getOrder = async (institutionLinkId: string, orderId: string): Promise<GetOrderResponse> => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/orders/${orderId}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as GetOrderResponse;
        } catch (e) {
            throw e;
        }
    }

    listUsersOrders = async (userId: string, status: ListOrdersStatus = "ALL", cursor?: string, take?: string): Promise<ListUsersOrdersResponse> => {
        const qp = new URLSearchParams('');
        qp.append('status', status)
        if (cursor) qp.append('cursor', cursor)
        if (take) qp.append('take', take)
        const requestUrl = `${this.baseUrl}/users/${userId}/orders${qp.toString()}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as ListUsersOrdersResponse;
        } catch (e) {
            throw e;
        }
    }

    listPositions = async (institutionLinkId: string): Promise<ListPositionsResponse> => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/positions`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as ListPositionsResponse;
        } catch (e) {
            throw e;
        }
    }

    // TODO
    createClientSession = async () => {
        throw new Error("implement me")
    }

    getApproximateHistoricalHoldings = async (institutionLinkId: string, timeSpan?: TimeSpan): Promise<GetApproximateHistoricalHoldingsResponse> => {
        let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/holdings`;
        if (timeSpan) {
            const qp = new URLSearchParams('');
            qp.append('span', timeSpan)
            requestUrl += qp.toString()
        }

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as GetApproximateHistoricalHoldingsResponse;
        } catch (e) {
            throw e;
        }
    }

    /**
     * from: yyyy-MM-dd format
     * to: yyyy-MM-dd format
     * @param institutionLinkId
     * @param interval
     * @param from
     * @param to
     */
    getApproximateHistoricalPerformance = async (institutionLinkId: string, interval?: PerformanceInterval, from?: string, to?: string): Promise<GetApproximateHistoricalPerformanceResponse> => {
        let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/historical_performance`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as GetApproximateHistoricalPerformanceResponse;
        } catch (e) {
            throw e;
        }
    }

    getInstitutionAsset = async (institutionLinkId: string, symbol: string): Promise<GetInstitutionAssetResponse> => {
        let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/assets/${symbol}`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            // TODO: This is implemented on a per institution basis
            throw new Error("no implemented yet by realizefi ... ")
            // return await response.json() as GetInstitutionAssetResponse;
        } catch (e) {
            throw e;
        }
    }

    listInstitutionAssets = async (institutionLinkId: string, symbols: string[]): Promise<ListInstitutionAssetsResponse> => {
        const qp = new URLSearchParams('');
        qp.append('symbols', symbols.join(','))
        let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/assets${qp.toString()}`;
        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            throw new Error("not implemented yet -- institution basis")
            //return await response.json() as ListInstitutionAssetsResponse;
        } catch (e) {
            throw e;
        }
    }

    listWebhooks = async (): Promise<ListWebhooksResponse> => {
        let requestUrl = `${this.baseUrl}/app/webhooks`;
        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })
            return await response.json() as ListWebhooksResponse;
        } catch (e) {
            throw e;
        }
    }

    listTransactions = async (institutionLinkId: string, cursor?: string, take?: string): Promise<ListTransactionsResponse> => {
        let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/transactions`;
        const qp = new URLSearchParams('');
        if (cursor) qp.append('cursor', cursor)
        if (take) qp.append('take', take)
        if (qp.toString().length > 0) requestUrl += qp.toString()

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as ListTransactionsResponse;
        } catch (e) {
            throw e;
        }
    }

    getBalances = async (institutionLinkId: string): Promise<GetBalancesResponse> => {
        let requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/balances`;

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            return await response.json() as GetBalancesResponse;
        } catch (e) {
            throw e;
        }
    }
}