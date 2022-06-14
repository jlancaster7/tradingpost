import fetch from 'node-fetch';

export default class Index {
    constructor(apiKey, baseUrl, redirectUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.redirectUrl = redirectUrl;
    }

    createUser = async({}) => {
        const requestUrl = `${this.baseUrl}/users`
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    getUsers = async({cursor, take}) => {
        const requestUrl = `${this.baseUrl}/users`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        })
        return await response.json();
    }

    getUser = async({userId}) => {
        const response = await fetch(`${this.baseUrl}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    authPortal = async({userId}) => {
        const requestUrl = `${this.baseUrl}/users/${userId}/auth_portals`
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                redirects: {
                    success: this.redirectUrl,
                    failure: this.redirectUrl
                }
            })
        });
        return await response.json();
    }

    listOrders = async({institutionLinkId, cursor, take, status}) => {
        const params = new URLSearchParams();
        status === null ? '' : params.append('status', status);
        // cursor === null ? '' : params.append('cursor', parseInt(cursor));
        // take === null ? '' : params.append('take', parseInt(take));
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/orders?${params.toString()}`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    listPositions = async({institutionLinkId}) => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/positions`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    getOrder = async({institutionLinkId, orderId}) => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/orders/${orderId}`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    getTransactions = async({institutionLinkId, cursor, take, includeRaw}) => {
        const params = new URLSearchParams();
        includeRaw === null ? '' : params.append('includeRaw', includeRaw);
        // cursor === null ? '' : params.append('cursor', parseInt(cursor));
        // take === null ? '' : params.append('take', parseInt(take));
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/transactions?${params.toString()}`;
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();

    }

    getBalances = async({institutionLinkId}) => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/balances`
        const response = await fetch(requestUrl, {
            method:'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    listUserOrders = async({userId, cursor, take, status }) => {
        const params = new URLSearchParams();
        status === null ? '' : params.append('status', status);
        // cursor === null ? '' : params.append('cursor', parseInt(cursor));
        // take === null ? '' : params.append('take', parseInt(take));
        const requestUrl = `${this.baseUrl}/users/${userId}/orders?${params.toString()}`
        const response = await fetch(requestUrl, {
            method:'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    getHistoricalPerformance = async({institutionLinkId}) => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/historical_performance`
        const response = await fetch(requestUrl, {
            method:'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    getInstitutionalAsset = async({institutionLinkId, symbol}) => {
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/assets/${symbol}`
        const response = await fetch(requestUrl, {
            method:'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }

    listInstitutionalAssets = async({institutionLinkId, symbols}) => {
        const params = new URLSearchParams();
        symbols === null ? '' : params.append('symbols', symbols);
        const requestUrl = `${this.baseUrl}/institution_links/${institutionLinkId}/assets?${params.toString()}`
        const response = await fetch(requestUrl, {
            method:'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return await response.json();
    }


}