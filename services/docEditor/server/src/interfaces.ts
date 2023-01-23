export interface HTTPConfiguration {
    method: string
    headers?: Record<string, string>
    body?: any
}

export type secTickerJSON = {
    [key: string]: {
        cik_str: number | string,
        ticker: string,
        title: string
    }
}
export type FilingHistoryListType = {
    accessionNumber: string,
    filingDate: string,
    reportDate: string,
    acceptanceDateTime: string,
    act: string,
    form: string,
    fileNumber: string,
    filmNumber: string,
    items: string,
    size: string,
    isXBRL: string,
    isInlineXBRL: string,
    primaryDocument: string,
    primaryDocDescription: string
}
export const HTTPConfigurationDefaults = {
    method: "GET",
    headers: {
        "user-agent": 'TradingpostApp josh@tradingpostapp.com',
        "accept-encoding": 'gzip,deflate'
    }
}


export const AvailableFilingsList = [
    '8-K',
    '10-K',
    '10-Q'
]

export const AllFilingTypes = [
    "DEFA14A", 
    "DEF 14A", 
    "4", 
    "25-NSE", 
    "8-K", 
    "10-K", 
    "424B2", 
    "FWP", 
    "10-Q", 
    "S-8", 
    "S-8 POS", 
    "SD", 
    "SC 13G", 
    "PX14A6G", 
    "PX14A6N", 
    "3", 
    "S-3ASR", 
    "IRANNOTICE", 
    "CERT", 
    "8-A12B", 
    "25", 
    "CERTNYS", 
    "NO ACT", 
    "UPLOAD", 
    "CORRESP", 
    "PRE 14A", 
    "DFAN14A",

]