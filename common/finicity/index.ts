import fetch from "node-fetch";
import {DateTime} from 'luxon';
import {
    PartnerAuthenticationResponse,
    AddCustomerResponse,
    LocalFinicityKey,
    GetCustomersCustomerResponse,
    GetCustomersResponse,
    AddConsumerRequest,
    GenerateLinkResponse,
    GetInstitutions,
    GetInstitutionsInstitution,
    GetConsumerResponse,
    AddConsumerResponse,
    GetCustomerByAccountIdResponse,
    GetCustomerAccountsResponse,
    GetCustomerAccountByIdResponse, GetAccountOwner, GetAllCustomerTransactions, GetInstitution, GetAccountAndHoldings,
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

    init = async (): Promise<void> => {
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
    partnerAuthentication = async (): Promise<PartnerAuthenticationResponse> => {
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
            throw new Error(body.toString());
        }
    }

    getInstitution = async (institutionId: number): Promise<GetInstitution> => {
        const response = await fetch(`https://api.finicity.com/institution/v2/institutions/${institutionId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        })

        const body = await response.text();
        try {
            return JSON.parse(body) as GetInstitution
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    getInstitutions = async (start: number, limit: number): Promise<GetInstitutions> => {
        const url = new URL("https://api.finicity.com/institution/v2/institutions");
        url.searchParams.set("start", start.toString());
        url.searchParams.set("limit", limit.toString());

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        })

        const body = await response.text();
        try {
            return JSON.parse(body) as GetInstitutions
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    addTestCustomer = async (username: string): Promise<AddCustomerResponse> => {
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
            throw new Error(body.toString());
        }
    }

    getConsumer = async (customerId: string): Promise<GetConsumerResponse> => {
        const response = await fetch(`https://api.finicity.com/decisioning/v1/customers/${customerId}/consumer`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        })

        const body = await response.text();
        try {
            return JSON.parse(body) as GetConsumerResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    addConsumer = async (customerId: string, consumer: AddConsumerRequest): Promise<AddConsumerResponse> => {
        const response = await fetch(`https://api.finicity.com/decisioning/v1/customers/${customerId}/consumer`, {
            method: "POST",
            body: JSON.stringify(consumer),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        })

        const body = await response.text();
        try {
            return JSON.parse(body) as AddConsumerResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    addCustomer = async (applicationId: string, username: string): Promise<AddCustomerResponse> => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Finicity-App-Key': this.appKey,
            'Finicity-App-Token': this.accessToken
        };

        const response = await fetch("https://api.finicity.com/aggregation/v2/customers/active", {
            method: "POST",
            body: JSON.stringify({username: username}),
            headers,
        });

        const body = await response.text();
        try {
            return await JSON.parse(body) as AddCustomerResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    getCustomers = async (): Promise<GetCustomersResponse> => {
        const response = await fetch("https://api.finicity.com/aggregation/v1/customers", {
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
            return JSON.parse(body) as GetCustomersResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    getCustomerAccounts = async (customerId: string): Promise<GetCustomerAccountsResponse> => {
        const response = await fetch(`https://api.finicity.com/aggregation/v2/customers/${customerId}/accounts`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GetCustomerAccountsResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    getCustomerAccountById = async (customerId: string, accountId: string): Promise<GetCustomerAccountByIdResponse> => {
        const response = await fetch(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GetCustomerAccountByIdResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    generateConnectUrl = async (customerId: string, webhook: string, webhookContentType: string = "application/json", experience: string = "default"): Promise<GenerateLinkResponse> => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Finicity-App-Key': this.appKey,
            'Finicity-App-Token': this.accessToken
        };

        const finicityCallbackUrl = process.env.FINICITY_CALLBACK_URL;
        if (!finicityCallbackUrl) throw new Error("finicity callback url not set within the system");

        const response = await fetch("https://api.finicity.com/connect/v2/generate", {
            method: "POST",
            body: JSON.stringify({
                partnerId: this.partnerId,
                customerId: customerId,
                webhook: webhook,
                webhookContentType: webhookContentType,
                redirectUri: finicityCallbackUrl,
            }),
            headers,
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GenerateLinkResponse
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    refreshCustomerAccounts = async (customerId: string): Promise<GetCustomerAccountsResponse[]> => {
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
            return JSON.parse(body) as GetCustomerAccountsResponse[]
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    loadHistoricTransactionsForCustomerAccount = async (customerId: string, accountId: string): Promise<void> => {
        await fetch(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}/transactions/historic`, {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });
    }

    getAccountOwner = async (customerId: string, accountId: string): Promise<GetAccountOwner> => {
        const response = await fetch(`https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts/${accountId}/owner`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GetAccountOwner
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    getAccountAndHoldings = async (customerId: string, accountId: string): Promise<GetAccountAndHoldings> => {
        const response = await fetch(`https://api.finicity.com/aggregation/v2/customers/${customerId}/accounts/${accountId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GetAccountAndHoldings
        } catch (e) {
            throw new Error(body.toString());
        }
    }

    getAllCustomerTransactions = async (customerId: string, params: { fromDate: number, toDate: number, start?: number, limit?: number, sort?: "asc" | "desc", includePending?: boolean }): Promise<GetAllCustomerTransactions> => {
        const url = new URL(`https://api.finicity.com/aggregation/v4/customers/${customerId}/transactions`)
        Object.keys(params).forEach((key: string) => {
            const val = params[key as keyof typeof params]
            if (!val) return;
            if (typeof val !== 'string' && typeof val.toString() === 'undefined') return;
            url.searchParams.set(key, val.toString())
        });

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Finicity-App-Key': this.appKey,
                'Finicity-App-Token': this.accessToken
            }
        });

        const body = await response.text();
        try {
            return JSON.parse(body) as GetAllCustomerTransactions
        } catch (e) {
            throw new Error(body.toString());
        }
    }
}