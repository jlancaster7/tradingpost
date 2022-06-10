import fetch from "node-fetch";
import {
    PartnerAuthenticationResponse,
    AddCustomerResponse,
    LocalFinicityKey,
    GetCustomersCustomerResponse,
    GetCustomersResponse,
    AddConsumerRequest,
} from "./interfaces";

export default class FinicityApi {
    constructor() {
    }

    /**
     * Validate partner id and secret + receive a secure access token
     * works for 2hrs, if exceeds 90 mins then re-authenticate
     * @param partnerId
     * @param partnerSecret
     * @param appKey
     */
    partnerAuthentication = async (partnerId: string, partnerSecret: string, appKey: string): Promise<PartnerAuthenticationResponse | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v2/partners/authentication", {
            method: "POST",
            body: JSON.stringify({
                "partnerId": partnerId,
                "partnerSecret": partnerSecret,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': appKey
            }
        })

        const body = await response.text();
        try {
            return JSON.parse(body) as PartnerAuthenticationResponse
        } catch (e) {
            console.log(body)
            return null
        }
    }

    /**
     * Adds user to testing FinBank
     * @param username
     * @param appToken
     * @param appKey
     */
    addTestCustomer = async (username: string, appToken: string, appKey: string): Promise<AddCustomerResponse | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v2/customers/testing", {
            method: "POST",
            body: JSON.stringify({username}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': appKey,
                'Finicity-App-Token': appToken
            }
        })

        const body = await response.text();
        try {
            return JSON.parse(body) as AddCustomerResponse
        } catch (e) {
            console.log(body)
            return null
        }
    }

    addConsumer = async (customerId: string, consumer: AddConsumerRequest, appKey: string, appToken: string) => {

    }

    addCustomer = async (applicationId: string, username: string, appToken: string, appKey: string): Promise<Promise<AddCustomerResponse> | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v2/customers/active", {
            method: "POST",
            body: JSON.stringify({username, applicationId}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': appKey,
                'Finicity-App-Token': appToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as AddCustomerResponse
        } catch (e) {
            console.log(body)
            return null
        }
    }

    getCustomers = async (appToken: string, appKey: string): Promise<Promise<GetCustomersResponse> | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v1/customers", {
            method: "POST",
            // body: JSON.stringify({username, applicationId}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': appKey,
                'Finicity-App-Token': appToken
            }
        });
        console.log(response.status)
        console.log(response.statusText)
        const body = await response.text();
        try {
            return JSON.parse(body) as GetCustomersResponse
        } catch (e) {
            console.log(body)
            return null
        }
    }

    getCustomer = async () => {

    }

    generateConnectUrl = async (appToken: string, appKey: string, partnerId: string, customerId: string, webhook: string, webhookContentType: string = "application/json", experience: string = "default") => {
        const response = await fetch("https://api.finicity.com/connect/v2/generate", {
            method: "POST",
            body: JSON.stringify({
                partnerId: partnerId,
                customerId: customerId,
                webhook: webhook,
                webhookContentType: webhookContentType,
                experience: experience
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': appKey,
                'Finicity-App-Token': appToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as AddCustomerResponse
        } catch (e) {
            console.log(body)
            return null
        }
    }

    generateConnectLiteUrl = async () => {

    }

    generateConnectEmail = async () => {

    }
}