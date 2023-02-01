import fetch, {Response} from 'node-fetch';
import fs from 'fs';
import DirectSecApi from "./secDirect";
import { pressReleaseParser } from "./htmlParse";
import { HTTPConfigurationDefaults } from './interfaces';

export default class FilingImportService  {
    sourceApi: DirectSecApi;
    saveLocation: string
    constructor (sourceApi: DirectSecApi) {
        this.sourceApi = sourceApi;
        this.saveLocation = 'src/data/';
    }
    importParseSave = async (ticker: string, from: string, to: string) => {
        const filings = await this.sourceApi.getPressReleases(ticker, from, to);
        for (let f of filings) {
            const fileName = `${ticker} - ${f.filingDate} - ${f.form}`;
            console.log(fileName);
            const filingHtml = await (await fetch(f.prHtmlUrl, HTTPConfigurationDefaults)).text()
            const taggedFilingHtml = await pressReleaseParser(filingHtml)
            fs.writeFileSync(this.saveLocation + `${fileName}.html`, taggedFilingHtml)
        }
    }
}

(async () => {
    const directSecApi = new DirectSecApi()
    const filingImportService = new FilingImportService(directSecApi);

    await filingImportService.importParseSave('AAPL', '12/31/2021', '1/16/2023')
})()