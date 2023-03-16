import { DateTime } from 'luxon';
import { PartnerAuthenticationResponse, AddCustomerResponse, GetCustomersResponse, AddConsumerRequest, GenerateLinkResponse, GetInstitutions, GetConsumerResponse, AddConsumerResponse, GetCustomerAccountsResponse, GetCustomerAccountByIdResponse, GetAccountOwner, GetAllCustomerTransactions, GetInstitution, GetAccountAndHoldings, EnableCustomerTx, AddCustomerResponseError, ConnectFixRequest, ConnectFixResponse } from "./interfaces";
export default class Service {
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
    getInstitution: (institutionId: number) => Promise<GetInstitution>;
    getInstitutions: (start: number, limit: number) => Promise<GetInstitutions>;
    addTestCustomer: (username: string) => Promise<AddCustomerResponse>;
    getConsumer: (customerId: string) => Promise<GetConsumerResponse>;
    addConsumer: (customerId: string, consumer: AddConsumerRequest) => Promise<AddConsumerResponse>;
    addCustomer: (applicationId: string, username: string) => Promise<AddCustomerResponse | AddCustomerResponseError>;
    getCustomers: (start?: number, limit?: number, username?: string) => Promise<GetCustomersResponse>;
    getCustomerAccounts: (customerId: string) => Promise<GetCustomerAccountsResponse>;
    getCustomerAccountById: (customerId: string, accountId: string) => Promise<GetCustomerAccountByIdResponse>;
    generateConnectFix: (request: ConnectFixRequest) => Promise<ConnectFixResponse>;
    generateConnectUrl: (customerId: string, webhook: string, webhookContentType?: string, experience?: string) => Promise<GenerateLinkResponse>;
    refreshCustomerAccounts: (customerId: string) => Promise<GetCustomerAccountsResponse[]>;
    loadHistoricTransactionsForCustomerAccount: (customerId: string, accountId: string) => Promise<void>;
    getAccountOwner: (customerId: string, accountId: string) => Promise<GetAccountOwner>;
    getAccountAndHoldings: (customerId: string, accountId: string) => Promise<GetAccountAndHoldings>;
    getAllCustomerTransactions: (customerId: string, params: {
        fromDate: number;
        toDate: number;
        start?: number;
        limit?: number;
        sort?: "asc" | "desc";
        includePending?: boolean;
    }) => Promise<GetAllCustomerTransactions>;
    registerTxPush: (customerId: string, accountId: string, callbackUrl: string) => Promise<EnableCustomerTx>;
    deleteTxPushSubscription: (customerId: string, subscriptionId: string) => Promise<void>;
}
