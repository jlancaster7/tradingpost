import { DateTime } from 'luxon';
import { PartnerAuthenticationResponse, AddCustomerResponse, GetCustomersResponse, AddConsumerRequest, GenerateLinkResponse, GetInstitutions, GetConsumerResponse, AddConsumerResponse, GetCustomerAccountsResponse, GetCustomerAccountByIdResponse, GetAccountOwner, GetAllCustomerTransactions } from "./interfaces";
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
    partnerAuthentication: () => Promise<PartnerAuthenticationResponse>;
    getInstitutions: (start: number, limit: number) => Promise<GetInstitutions>;
    addTestCustomer: (username: string) => Promise<AddCustomerResponse>;
    getConsumer: (customerId: string) => Promise<GetConsumerResponse>;
    addConsumer: (customerId: string, consumer: AddConsumerRequest) => Promise<AddConsumerResponse>;
    addCustomer: (applicationId: string, username: string) => Promise<AddCustomerResponse>;
    getCustomers: () => Promise<GetCustomersResponse>;
    getCustomerAccounts: (customerId: string) => Promise<GetCustomerAccountsResponse>;
    getCustomerAccountById: (customerId: string, accountId: string) => Promise<GetCustomerAccountByIdResponse>;
    generateConnectUrl: (customerId: string, webhook: string, webhookContentType?: string, experience?: string) => Promise<GenerateLinkResponse>;
    refreshCustomerAccounts: (customerId: string) => Promise<GetCustomerAccountsResponse[]>;
    loadHistoricTransactionsForCustomerAccount: (customerId: string, accountId: string) => Promise<void>;
    getAccountOwner: (customerId: string, accountId: string) => Promise<GetAccountOwner>;
    getAllCustomerTransactions: (customerId: string, params: {
        fromDate: number;
        toDate: number;
        start?: number;
        limit?: number;
        sort?: "asc" | "desc";
        includePending?: boolean;
    }) => Promise<GetAllCustomerTransactions>;
}
