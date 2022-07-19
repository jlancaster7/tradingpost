export interface ISecurityGet {
    id: number,
    symbol: string,
    company_name: string
    exchange: string,
    industry: string
}

export interface ISecurityList {
    id: number,
    symbol: string,
    security_name: string
    company_name: string
    logo_url: string
}

export interface IAnalystProfile {
    investment_strategy: string,
    portfolio_concentration: number,
    benchmark: string
    interests: string[]
}