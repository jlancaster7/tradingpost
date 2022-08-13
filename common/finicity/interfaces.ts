import {bool} from "aws-sdk/clients/signer";
import {DateTime} from "luxon";

export interface PartnerAuthenticationResponse {
    token: string
}

export interface GetInstitution {
    institution: {
        id: number
        name: string
        voa: boolean
        voi: boolean
        stateAgg: boolean
        ach: boolean
        transAgg: boolean
        aha: boolean
        availBalance: boolean
        accountOwner: boolean
        loanPaymentDetails: boolean
        studentLoanData: boolean
        accountTypeDescription: string
        phone: string
        urlHomeApp: string
        urlLogonApp: string
        oauthEnabled: boolean
        urlForgotPassword: string
        urlOnlineRegistration: string
        class: string
        specialText: string
        timeZone: string
        specialInstructions: string
        specialInstructionsTitle: string
        address: {
            city: string
            state: string
            country: string
            postalCode: string
            addressLine1: string
            addressLine2: string
        }
        currency: string
        email: string
        status: string
        newInstitutionId: number
        branding: {
            logo: string
            alternateLogo: string
            icon: string
            primaryColor: string
            title: string
        }
        oauthInstitutionId: string
        productionStatus: {
            overallStatus: string
            transAgg: string
            voa: string
            stateAgg: string
            ach: string
            aha: string
        }
    }
}

export interface GetInstitutions {
    found: number
    displaying: number
    moreAvailable: boolean
    createdDate: number
    institutions: GetInstitutionsInstitution[]
}

export interface GetInstitutionsInstitution {
    id: number
    name: string
    voa: boolean
    voi: boolean
    stateAgg: boolean
    ach: boolean
    transAgg: boolean
    aha: boolean
    availBalance: boolean
    accountOwner: boolean
    loanPaymentDetails: boolean
    studentLoanData: boolean
    accountTypeDescription: string
    phone: string
    urlHomeApp: string
    urlLogonApp: string
    oauthEnabled: boolean
    urlForgotPassword: string
    urlOnlineRegistration: string
    class: string
    specialText: string
    timeZone: string
    specialInstructions: string
    specialInstructionsTitle: string
    address: {
        city: string
        state: string
        country: string
        postalCode: string
        addressLine1: string
        addressLine2: string
    }
    currency: string
    email: string
    status: string
    newInstitutionId: string
    branding: {
        logo: string
        alternateLogo: string
        icon: string
        primaryColor: string
        title: string
    }
    oauthInstitutionId: string
    productionStatus: {
        overallStatus: string
        transAgg: string
        voa: string
        stateAgg: string
        ach: string
        aha: string
    }
}

export interface AddCustomerResponse {
    id: string
    username: string
    createdDate: number
}

export interface AddConsumerRequest {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    ssn: string
    birthday: {
        year: number
        month: number
        dayOfMonth: number
    }
    email: string
    suffix: string
}

export interface AddConsumerResponse {
    id: string
    createdDate: number
    customerId: number
}

export interface GetConsumerResponse {
    id: string
    firstName: string
    lastName: string
    customerId: number
    address: string
    city: string
    state: string
    zip: string
    phone: string
    ssn: string
    birthday: {
        year: number
        month: number
        dayOfMonth: number
    }
    email: string
    createdAt: number
    suffix: string
}

export interface LocalFinicityKey {
    token: string
    expiresAt: Date
}

export interface GetCustomersCustomerResponse {
    id: number
    username: string
    firstName: string
    lastName: string
    type: string
    createdDate: number
}

export type AccountType = "checking" | "savings" | "cd" | "moneyMarket" | "creditCard" | "lineOfCredit" | "investment"
    | "investmentTaxDeferred" | "employeeStockPurchasePlan" | "ira" | "401k" | "roth" | "403b" | "529plan"
    | "rollover" | "ugma" | "utma" | "keogh" | "457plan" | "401a" | "brokerageAccount" | "educationSavings"
    | "healthSavingsAccount" | "pension" | "profitSharingPlan" | "roth401k" | "sepIRA" | "simpleIRA"
    | "thriftSavingsPlan" | "variableAnnuity" | "cryptocurrency" | "mortgage" | "loan" | "studentLoan"
    | "studentLoanGroup" | "studentLoanAccount"

export interface GenerateLinkResponse {
    link: string
}

export interface GetCustomersResponse {
    found: number
    displaying: number
    moreAvailable: boolean
    customers: GetCustomersCustomerResponse[]
}

export interface AddConsumerRequest {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    ssn: string
    birthday: {
        year: number
        month: number
        dayOfMonth: number
    }
    email: string
    suffix: string
    emailAddress: string
}

export interface GetCustomerByAccountIdResponse {

}

export interface CustomerAccountsDetail {
    margin: number
    marginAllowed: boolean
    cashAccountAllowed: boolean
    description: string
    marginBalance: number
    shortBalance: number
    availableCashBalance: number
    currentBalance: number
    dateAsOf: number
}

export interface GetCustomerAccountsResponse {
    accounts: {
        id: string
        number: string
        realAccountNumberLast4: string
        accountNumberDisplay: string
        name: string
        balance: number
        type: AccountType
        aggregationStatusCode: number
        status: string
        customerId: string
        institutionId: string
        balanceDate: number
        aggregationSuccessDate: number
        aggregationAttemptDate: number
        createdDate: number
        currency: string
        lastTransactionDate: number
        oldestTransactionDate: number
        institutionLoginId: number
        lastUpdatedDate: number
        detail: CustomerAccountsDetail
        position: {
            id: number
            securityIdType: string
            posType: string
            subAccountType: string
            description: string
            symbol: string
            cusipNo: string
            currentPrice: number
            transactionType: string
            marketValue: string
            securityUnitPrice: number
            units: number
            costBasis: number
            status: string
            securityType: string
            securityName: string
            securityCurrency: string
            currentPriceDate: number
            optionStrikePrice: number
            optionType: string
            optionSharesPerContract: number
            optionExpireDate: number
            fiAssetClass: string
            assetClass: string
            currencyRate: number
            costBasisPerShare: number
            mfType: string
            totalGLDollar: number
            totalGLPercent: number
            todayGLDollar: number
            todayGLPercent: number
        }[]
        displayPosition: number
        parentAccount: number
        accountNickname: string
        marketSegment: string
    }[]
}

export interface GetCustomerAccountByIdResponse extends GetCustomerAccountsResponse {
}

export interface GetAccountOwner {
    ownerName: string
    ownerAddress: string
    asOfDate: number
}

export interface GetAccountAndHoldings {
    id: string
    number: string
    accountNumberDisplay: string
    name: string
    balance: number
    type: string
    aggregationStatusCode: number
    status: string
    customerId: string
    institutionId: string
    balanceDate: number
    aggregationSuccessDate: number
    aggregationAttemptDate: number
    createdDate: number
    lastUpdatedDate: number
    currency: string
    lastTransactionDate: number
    institutionLoginId: number
    detail: {
        description: string
        availableCashBalance: number
        currentBalance: number
        dateAsOf: number
    }
    position: {
        securityId: string
        securityIdType: string
        id: number
        description: string
        symbol: string
        currentPrice: number
        transactionType: string
        marketValue: number
        costBasis: number
        units: number
        status: string
        securityType: string
        securityName: string
        securityCurrency: string
    }[]
    displayPosition: number
    accountNickname: string
    oldestTransactionDate: number
    marketSegment: string
}

export interface GetAllCustomerTransactions {
    found: number
    displaying: number
    moreAvailable: string
    fromDate: string
    toDate: string
    sort: string
    transactions: {
        id: number
        amount: number
        accountId: string
        customerId: string
        status: string
        description: string
        memo: string
        type: string
        unitQuantity: number
        feeAmount: number
        cusipNo: string
        postedDate: number
        transactionDate: number
        createdDate: number
        categorization: {
            normalizedPayeeName: string
            category: string
            bestRepresentation: string
            country: string
        }
        commissionAmount: number
        ticker: string
        unitPrice: number
        investmentTransactionType: string
    }[]
}