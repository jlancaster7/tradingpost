import fetch from "node-fetch";
import {DateTime} from 'luxon';
import {
    PartnerAuthenticationResponse,
    AddCustomerResponse,
    LocalFinicityKey,
    GetCustomersCustomerResponse,
    GetCustomersResponse,
    AddConsumerRequest, GenerateLinkResponse, CustomerAccount,
} from "./interfaces";
import fs from "fs";

export default class Finicity {
    partnerId: string = "";
    partnerSecret: string = "";
    appKey: string = "";
    tokenFile: string = "";
    accessToken: string = "";
    expiresAt: DateTime | undefined;

    constructor(partnerId: string, partnerSecret: string, appKey: string, tokenFile: string = 'finicity-api-token.json') {
        this.partnerId = partnerId;
        this.partnerSecret = partnerSecret;
        this.appKey = appKey;
        this.tokenFile = tokenFile;
    }

    init = async () => {
        try {
            const now = DateTime.now();
            const {token, expires} = JSON.parse(fs.readFileSync(this.tokenFile, 'utf8'));
            const dt = DateTime.fromSeconds(expires);
            if (now.toMillis() >= dt.toMillis()) await this._updateAndWriteFile()
            else {
                this.accessToken = token;
                this.expiresAt = dt;
            }
        } catch (e) {
            await this._updateAndWriteFile()
        }

        const hourAndAHalfInMilliseconds = 5400000;
        if (!this.expiresAt) throw Error("expires at not set")
        const runAgain = this.expiresAt.diffNow().as('milliseconds');
        setTimeout(async () => {
            await this._updateAndWriteFile();
            setInterval(async () => {
                await this._updateAndWriteFile();
            }, hourAndAHalfInMilliseconds)
        }, runAgain)
    }

    _updateAndWriteFile = async () => {
        const response = await this.partnerAuthentication()
        if (!response) throw Error("could not create access token");
        this.accessToken = response.token;
        this.expiresAt = DateTime.now().plus({hour: 1, minute: 30})
        fs.writeFileSync(this.tokenFile, JSON.stringify({
            token: response?.token,
            expires: this.expiresAt.toUnixInteger()
        }), {
            encoding: 'utf8'
        });
    }

    /**
     * Validate partner id and secret + receive a secure access token
     * works for 2hrs, if exceeds 90 mins then re-authenticate
     */
    partnerAuthentication = async (): Promise<PartnerAuthenticationResponse | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v2/partners/authentication", {
            method: "POST",
            body: JSON.stringify({
                "partnerId": this.partnerId,
                "partnerSecret": this.partnerSecret,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey
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
     */
    addTestCustomer = async (username: string): Promise<AddCustomerResponse | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v2/customers/testing", {
            method: "POST",
            body: JSON.stringify({username}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
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

    addCustomer = async (applicationId: string, username: string): Promise<Promise<AddCustomerResponse> | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v2/customers/active", {
            method: "POST",
            body: JSON.stringify({username, applicationId}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
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

    getCustomers = async (): Promise<Promise<GetCustomersResponse> | null> => {
        const response = await fetch("https://api.finicity.com/aggregation/v1/customers", {
            method: "POST",
            // body: JSON.stringify({username, applicationId}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
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

    generateConnectUrl = async (customerId: string, webhook: string, webhookContentType: string = "application/json", experience: string = "default"): Promise<GenerateLinkResponse> => {
        const response = await fetch("https://api.finicity.com/connect/v2/generate", {
            method: "POST",
            body: JSON.stringify({
                partnerId: this.partnerId,
                customerId: customerId,
                webhook: webhook,
                webhookContentType: webhookContentType,
                // experience: experience
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GenerateLinkResponse
        } catch (e) {
            throw e
        }
    }

    generateConnectLiteUrl = async () => {

    }

    generateConnectEmail = async (customerId: string) => {

    }

    refreshCustomerAccounts = async (customerId: string): Promise<CustomerAccount[]> => {
        const response = await fetch(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as CustomerAccount[]
        } catch (e) {
            throw e
        }
    }
}