import 'dotenv/config';
import SecApi from "./secAPI";
import fs from 'fs';
import fetch, {Response} from 'node-fetch';
import * as cheerio from 'cheerio';

const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

(async () => {
    if (!process.env.SEC_API_KEY) throw new Error("Sec Api Key is missing.");
    
    const secapi = new SecApi(process.env.SEC_API_KEY)

    try {
        /*
        const filings = await secapi.pullFilings('CRWD','8-K', new Date('12/31/2021'))
        //console.log(filings.filings[0])
        const pressRelease = filings.filings[0].documentFormatFiles.find((a: any) => a.type === 'EX-99.1')
        
        if (!pressRelease) return;
        const prHTML = await fetch(pressRelease.documentUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Hivemind Studios Inc josh@tradingpostapp.com',
                'Accept-Encoding': 'gzip, deflate',
                'host': 'www.sec.gov'
            }
        })
        //console.log(await prHTML.text())
        */
        const prHTML = fs.readFileSync('./src/test.html'); 
        
        const $ = cheerio.load(prHTML.toString());
        //console.log($)
        let list: any[] = []
        const footnoteRegex = RegExp(/^\([0-9]\)/, 'i');
        const followingTableRegex = RegExp(/^The following /, 'i');
        const allFont = $('text div').each((i, item) => {
            let textToAdd = ''
            console.log($(this).children())
            for (let d of item.children) {

                // @ts-ignore
                if (d.name === 'font' && d.children[0].name === 'br') continue;
                // @ts-ignore
                
                if (d.name === 'table') {
                    
                    let tableTitle = ''
                    // @ts-ignore
                    //console.log(item.prev.prev.children)
                    if (item.prev?.prev?.children) {
                        // @ts-ignore
                        for (let f of item.prev.prev.children) {
                                                
                            // @ts-ignore
                            if (f.name === 'font') {
                                f.children.forEach((el: any) => tableTitle += String(el.data).trim())
                                //console.log(f)
                                // @ts-ignore
                                //console.log(f.children)
                            }
                        }
                    }
                    
                    //console.log(tableTitle)
                }
                // @ts-ignore
                if (d.name === 'font' && d.children[0].data && d.parent?.parent.name !== 'td') {
                    
                    
                    // @ts-ignore
                    const str = String(d.children[0].data);
                    //console.log(str.split(' ').filter(a => a !== '' && a !== ' '&& a !== '  ' && a !== '\n').map((a: any) => a.replace(/\n/g, '')))
                    // @ts-ignore
                    textToAdd += str.split(' ').filter(a => a !== '' && a !== ' '&& a !== '  ').map((a: any) => a.replace(/\n/g, ' ')).join(' ').replace('•', ' ').split('  ').join(' ')
                    
                    
                    // @ts-ignore
                    //console.log(`${textToAdd}f`)
                    
                    // @ts-ignore
                    //list.push()
                }
            }
            //if (textToAdd !== '') list.push(textToAdd.replace(/\n/g, ' ').split('  ').join(' '));
            const textToAdd1 = textToAdd.split(/\n/g).join(' ').split('  ').join(' ').trim();
            
            if (textToAdd1 !== '' && !footnoteRegex.test(textToAdd1) && !followingTableRegex.test(textToAdd1)) list.push(textToAdd1);
            
            
        })
        
        let newList = []
        for (let d of list) {
            newList.push(d.trim())
        }
        console.log(newList);
        //const items = await secapi.extractFromFiling(filings.filings[0].linkToFilingDetails, '2-2')
        //console.log(items);
    
    } catch (err) {
        console.log(err)
    }


})()

