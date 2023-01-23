import fetch, {Response} from 'node-fetch';
import {URL} from 'url';
export interface HTTPConfiguration {
    method: string
    headers?: Record<string, string>
    body?: any
}


const HTTPConfigurationDefaults = {
    method: "GET"
}

const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

export const SecApiBaseUrl = 'https://api.sec-api.io'

export default class SecApi {
    readonly baseURL: string;
    readonly token: string;
    readonly retryMax: number;
    constructor(token: string, baseURL: string = SecApiBaseUrl, retryMax: number = 3) {
        this.token = token;
        this.baseURL = baseURL;
        this.retryMax = retryMax;
    }
    fetch = async (endpoint: string, httpConfiguration: HTTPConfiguration, queryParameters?: Record<string, any>): Promise<any> => {
        let url = new URL(this.baseURL)
        url.pathname += endpoint;
        if (queryParameters != null) {
            for (let k in queryParameters) {
                const v = queryParameters[k];
                url.searchParams.set(k, v);
            }
        }
        const config = {...httpConfiguration};
        return await fetch(url.toString(), config);
    }
    pullFilings = async (symbol: string, filingType: string, from: Date, to: Date = new Date()): Promise<any> => {
        let offset = 0;
        let size = 50;
        const queryString = `ticker:${symbol} AND filedAt:[${from.toISOString().split('T')[0]} TO ${to.toISOString().split('T')[0]}] AND formType:"${filingType}"`
        const response = await this.fetch(``, {
            method: 'POST',
            headers: {
                "Content-type": 'application/json',
                Authorization: this.token
            },
            body: JSON.stringify({
                "query": {
                    "query_string": {
                        "query": queryString
                    }
                },
                "from": `"${offset}"`,
                "size": `"${size}"`,
                "sort": [{ "filedAt": {"order": "desc"}}]
            })
        })

        if (((response.status / 100) - (response.status % 100)) === 4) throw response;

        return await response.json() as any;
    }
    extractFromFiling = async (url: string, item: string ): Promise<any> => {
        const response = await this.fetch(`extractor`, {
            method: 'GET',
            headers: {
                Authorization: this.token
            }
        }, {
            url: url,
            item: item,
            type: 'text'
        })

        if (((response.status / 100) - (response.status % 100)) === 4) throw response;

        return await response.text();
    }
}
