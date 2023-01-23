import fetch, {Response} from 'node-fetch';
import {URL} from 'url';
import fs from 'fs';

import { parseStringPromise } from 'xml2js';
import { 
    HTTPConfiguration,
    secTickerJSON,
    FilingHistoryListType,
    AvailableFilingsList,
    HTTPConfigurationDefaults
 } from './interfaces';
 import * as cheerio from 'cheerio';




const DirectSecApiBaseUrl = 'https://data.sec.gov';
const DirectSecApiFilingUrl = 'https://www.sec.gov/Archives/edgar/data'

export default class DirectSecApi {
    readonly baseURL: string;
    readonly retryMax: number;
    secCompanyList: secTickerJSON;
    tickerList: string[]
    constructor (baseURL: string = DirectSecApiBaseUrl, retryMax: number = 3) {
        this.baseURL = baseURL;
        this.retryMax = retryMax;
        this.secCompanyList = JSON.parse(fs.readFileSync('src/company_tickers.json', 'utf-8'));
        this.tickerList = Object.keys(this.secCompanyList).map((item, idx) => this.secCompanyList[item].ticker )
    }
    fetch = async (endpoint: string, httpConfiguration: HTTPConfiguration, queryParameters?: Record<string, any>): Promise<any> => {
        let url = new URL(this.baseURL)
        url.pathname += endpoint;
        if (queryParameters != null) {
            for (let k in queryParameters) {
                const v = queryParameters[k];
                url.searchParams.set(k, v);
            }
        }
        const config = {...HTTPConfigurationDefaults, ...httpConfiguration};
        return await fetch(url.toString(), config);
    }
    getCIKObjectfromTicker = (ticker: string) => {
        const index = this.tickerList.findIndex((item, index) => item === ticker)
        const CIK = this.secCompanyList[String(index)]
        const CIKLength = String(CIK.cik_str).length;
        for (let i = 0; i < 10 - CIKLength ; i++) {
            CIK.cik_str = '0' + CIK.cik_str;
        }
        return CIK
    }
    getFilingList = async (ticker: string, from: string, to: string): Promise<FilingHistoryListType[]> => {
        
        const CIK = this.getCIKObjectfromTicker(ticker);
        const requestUrl = DirectSecApiBaseUrl + `/submissions/CIK${CIK.cik_str}.json`
        
        const filingHistoryResposne = await (await fetch(requestUrl, HTTPConfigurationDefaults)).json()

        const filingHistoryRawList = filingHistoryResposne.filings.recent;
        const numFilings = filingHistoryResposne.filings.recent.accessionNumber.length;
        
        let filingHistoryList: FilingHistoryListType[] = []
        for (let i = 0; i < numFilings; i++) {
            const o: FilingHistoryListType = {
                accessionNumber: filingHistoryRawList.accessionNumber[i],
                filingDate: filingHistoryRawList.filingDate[i],
                reportDate: filingHistoryRawList.reportDate[i],
                acceptanceDateTime: filingHistoryRawList.acceptanceDateTime[i],
                act: filingHistoryRawList.act[i],
                form: filingHistoryRawList.form[i],
                fileNumber: filingHistoryRawList.fileNumber[i],
                filmNumber: filingHistoryRawList.filmNumber[i],
                items: filingHistoryRawList.items[i],
                size: filingHistoryRawList.size[i],
                isXBRL: filingHistoryRawList.isXBRL[i],
                isInlineXBRL: filingHistoryRawList.isInlineXBRL[i],
                primaryDocument: filingHistoryRawList.primaryDocument[i],
                primaryDocDescription: filingHistoryRawList.primaryDocDescription[i]
            }
            filingHistoryList.push(o)
        }
        return filingHistoryList.filter(a => ((new Date (a.filingDate)).valueOf() > (new Date(from)).valueOf()) && ((new Date (a.filingDate)).valueOf() < (new Date(to)).valueOf()));
    }
    getFilingSummary = async (CIK: string, accessionNumber: string ) => {
        const requestUrl = DirectSecApiFilingUrl + `/${CIK}/${accessionNumber.split('-').join('')}`
        const filingSummaryXML = await (await fetch(requestUrl + '/FilingSummary.xml', HTTPConfigurationDefaults)).text();

        const filingSummaryJSON = await parseStringPromise(filingSummaryXML)
        
        const inputFilesObj = filingSummaryJSON.FilingSummary?.InputFiles[0]?.File;

        let inputFileIds: string[] = []
        if (filingSummaryJSON.Error) {
            const filingSummaryHtml = await (await fetch(requestUrl, HTTPConfigurationDefaults)).text();
            const $ = cheerio.load(filingSummaryHtml.toString());
             
            $('table tr a').each((index, el) => {
                inputFileIds.push($(el).text())
            })
            return inputFileIds
        }
        else {
            for (let d of Object.keys(inputFilesObj)) {            
                if (typeof inputFilesObj[d] === 'object') inputFileIds.push(inputFilesObj[d]['_'])
                else inputFileIds.push(inputFilesObj[d])
            }
            return inputFileIds
        }
    }
    getCompanyFilingsByType = async ( ticker: string, formType: string, from: string, to: string) => {
        const filingList = await this.getFilingList(ticker, from, to);
        const filingListFormType = filingList.filter(a => a.form === formType)
        return filingListFormType
    }
    getLatestFilingByType = async (ticker: string, formType: string) => {
        const CIK = this.getCIKObjectfromTicker(ticker);

        const filings = await this.getCompanyFilingsByType(ticker, formType, (new Date('1/1/2021')).toISOString(), (new Date()).toISOString());
        
        const summary = await this.getFilingSummary(CIK.cik_str as string, filings[0].accessionNumber)

    }
    getPressReleases = async (ticker: string, from: string, to: string) => {
        const CIK = this.getCIKObjectfromTicker(ticker);
        const eightKs = await this.getCompanyFilingsByType(ticker, '8-K', from, to);
        let pressReleases = []
        const prRegex1 = new RegExp('ex991', 'i')
        const prRegex2 = new RegExp('exhibit991', 'i')
        for (let d of eightKs) {
            const summary = await this.getFilingSummary(CIK.cik_str as string, d.accessionNumber);
            const pressReleaseHtm = summary.filter(a => prRegex1.test(a) || prRegex2.test(a))
            if (pressReleaseHtm.length) {
                const o = {
                    accessionNumber: d.accessionNumber,
                    filingDate: d.filingDate,
                    reportDate: d.reportDate,
                    form: d.form,
                    document: d.primaryDocument,
                    docDescription: d.primaryDocDescription,
                    filingUrl: DirectSecApiFilingUrl + `/${CIK.cik_str}/${d.accessionNumber.split('-').join('')}`,
                    prHtmlUrl: DirectSecApiFilingUrl + `/${CIK.cik_str}/${d.accessionNumber.split('-').join('')}/${pressReleaseHtm[0]}`
                }
                pressReleases.push(o)
            }
        }
        return pressReleases
    }
}

(async () => {
    //const DirectSEC = new DirectSecApi();
    //console.log(await DirectSEC.getFilingSummary('320193', '000119312522225365'))
    //const pressReleases = await DirectSEC.getPressReleases('AAPL', '12/31/2017', (new Date()).toISOString());
    

})()