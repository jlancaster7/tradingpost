

export interface PartnerAuthenticationResponse {
    token: string
}

export interface AddCustomerResponse {
    id: string
    username: string
    createdDate: number
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

export interface CustomerAccount {

}

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