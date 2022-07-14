import { DateTime } from 'luxon';
import { PartnerAuthenticationResponse, AddCustomerResponse, GetCustomersResponse, AddConsumerRequest, GenerateLinkResponse, CustomerAccount } from "./interfaces";
export default class Finicity {
    partnerId: string;
    partnerSecret: string;
    appKey: string;
    tokenFile: string;
    accessToken: string;
    expiresAt: DateTime | undefined;
    constructor(partnerId: string, partnerSecret: string, appKey: string, tokenFile?: string);
    init: () => Promise<void>;
    _updateAndWriteFile: () => Promise<void>;
    /**
     * Validate partner id and secret + receive a secure access token
     * works for 2hrs, if exceeds 90 mins then re-authenticate
     */
    partnerAuthentication: () => Promise<PartnerAuthenticationResponse | null>;
    /**
     * Adds user to testing FinBank
     * @param username
     */
    addTestCustomer: (username: string) => Promise<AddCustomerResponse | null>;
    addConsumer: (customerId: string, consumer: AddConsumerRequest, appKey: string, appToken: string) => Promise<void>;
    addCustomer: (applicationId: string, username: string) => Promise<Promise<AddCustomerResponse> | null>;
    getCustomers: () => Promise<Promise<GetCustomersResponse> | null>;
    getCustomer: () => Promise<void>;
    generateConnectUrl: (customerId: string, webhook: string, webhookContentType?: string, experience?: string) => Promise<GenerateLinkResponse>;
    generateConnectLiteUrl: () => Promise<void>;
    generateConnectEmail: (customerId: string) => Promise<void>;
    refreshCustomerAccounts: (customerId: string) => Promise<CustomerAccount[]>;
}
