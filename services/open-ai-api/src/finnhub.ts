import fetch, {Response} from 'node-fetch';
import {URL} from 'url';
import { 
    TranscriptResponse, 
    TranscriptListResponse, 
    HTTPConfiguration 
} from './interfaces'
export const ProductionBaseURL = 'https://finnhub.io/api/v1';

const HTTPConfigurationDefaults = {
    method: "GET"
}

export default class Finnhub {
    readonly baseURL: string;
    readonly token: string;
    readonly retryMax: number;

    constructor(token: string, baseURL: string = ProductionBaseURL, retryMax: number = 3) {
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

        const config = {...HTTPConfigurationDefaults, ...httpConfiguration};
        return await fetch(url.toString(), config);
    }
    pullTranscript = async (transcript_id: string): Promise<TranscriptResponse> => {
        const response = await this.fetch(`/stock/transcripts`, {
            method: 'GET'
        }, {"token": this.token, "id": transcript_id})

        if (((response.status / 100) - (response.status % 100)) === 4) throw response;

        return await response.json() as TranscriptResponse;
    }
    pullTranscriptList = async (symbol: string): Promise<TranscriptListResponse> => {
        const response: Response = await this.fetch(`/stock/transcripts/list`, {
            method: 'GET'
        }, {symbol: symbol ,token: this.token})
        
        if (((response.status / 100) - (response.status % 100)) === 4) throw response;

        return await response.json() as TranscriptListResponse;
    }
}