import 'dotenv/config';
import fs from 'fs';
import * as cheerio from 'cheerio';
import { labels } from '../../my-app/src/data/externalData'

export const pressReleaseParser = async (html: string) => {    
    try {
            const $ = cheerio.load(html.toString());
        
            let list: any[] = []
            
            $('text div').each((i, item) => {
                elementParse($, item, i)
                
            })
            return $.html()
    } catch (err) {
        console.log(err)
        return ''
    }
}


const elementParse = ($: cheerio.CheerioAPI, element: cheerio.Element, i: number) => {
    
    
    const bulletRegex = new RegExp(/^\([0-9]\)/, 'i'),
          asteriskRegex = new RegExp(/^\*/);
          
    

    $(element).children().each((i, item) => {
        
        let editedText = $(item).text().replace(/\n/g, ' ').trim()
        editedText = editedText.split(' ').filter(a => a !== '' && a !== ' '&& a !== '  ').map((a: any) => a.replace(/\n/g, ' ')).join(' ')
        if (editedText === 'Subject to Reclassification') {
            console.log($(item).text())
        }
        if (!$(item).text().trim()) {
            return
        }
        if ($(item).is('table')) {
            if (editedText && (bulletRegex.test(editedText) || asteriskRegex.test(editedText))) $(item).wrap(tableFootnoteWrapper(String(i)))
            else if (excludeByTerms($(item))) return;
            else $(item).wrap(tableWrapper(String(i)))
            
        }
        else if (editedText && tableDenomination($(item))) {
            $(item).wrap(tableDenominationWrapper(String(i)))
        }
        
        else if ($(item).parent().next().children('table').text() || textDescribingTable($(item))) {
            $(item).wrap(textDescribingTableWrapper(String(i)))
        }
        
        else if($(item).parents('td').length) {
            
        }
        
        else if (editedText && (bulletRegex.test(editedText) || asteriskRegex.test(editedText))) {
            $(item).wrap(tableFootnoteWrapper(String(i)))
        }                
        else if ($(item).is('font')) {
            nonTableTextLabeling($(item), i)
        }
        else if($(item).is('p')) {
            nonTableTextLabeling($(item), i)
        }
        else {
    
        }
    })
    
} 


const excludeByTerms = (element: cheerio.Cheerio<cheerio.Element>): boolean => {
    const text = element.text().split(/\n/).join(' ').trim()
    if (regexFunc('forward-looking statements', text) 
        || regexFunc('exhibit 99.1', text)
        || regexFunc(/^(unaudited)/, text)
        || regexFunc(/^©/, text)
        || regexFunc(/^NOTE TO EDITORS/, text)
        || regexFunc(/^subject to reclassification/, text)
        || regexFunc(/^Press Release/, text)
        || regexFunc(/\d\d\d-\d\d\d\d/, text)
        || regexFunc(/^contacts/, text)
        || regexFunc(/^press contact/, text)
        || regexFunc(/^investor relations/, text)
        ) return true;
    else return false
}
const nonTableTextLabeling = (element: cheerio.Cheerio<cheerio.Element>, i: number) => {
    let fontSize: any = element.css('font-size')?.replace('pt', ''),
        fontWeight: any = element.css('font-weight')
    fontSize = fontSize ? parseInt(fontSize) : 8
    fontWeight = fontWeight ? parseInt(fontWeight) : 400

    if (excludeByTerms(element)) {}
    else if (fontSize > 12 || fontWeight > 500 || element.children('b').length) {
        element.wrap(sectionHeaderWrapper(`${i}`))
    }
    else {
        element.wrap(textWrapper(`${i}$`))
    }
}
const textDescribingTable = (element: cheerio.Cheerio<cheerio.Element>): boolean => {
    const text = element.text().split(/\n/).join(' ').trim()
    if (regexFunc(/^The following/, text)
        || regexFunc(/as follows:/, text)
        ) return true;
    else return false;
} 

const tableDenomination = (element: cheerio.Cheerio<cheerio.Element>): boolean => {
    const text = element.text().split(/\n/).join(' ').trim()
    if (regexFunc(/^\(/, text)
        && (regexFunc(/in millions/, text)
        || regexFunc(/in billions/, text))
        ) return true;
    else return false;
}
const regexFunc = (term: string | RegExp, text: string): boolean => {
    return new RegExp(term, 'i').test(text)
}

const textWrapper = (key: string) => `<div key=${key} id="tp_tag"  title="nonTableText" style="background-color: ${labels['nonTableText']['background-color']};"></div>`
const sectionHeaderWrapper = (key: string) => `<div key=${key} id="tp_tag"  title="sectionHeader" style="background-color: ${labels['sectionHeader']['background-color']};"></div>`
const tableFootnoteWrapper = (key: string) => `<div key=${key} id="tp_tag" title="tableFootnote" style="background-color: ${labels['tableFootnote']['background-color']};"></div>`
const tableDenominationWrapper = (key: string) => `<div key=${key} id="tp_tag" title="tableDenomination" style="background-color: ${labels['tableDenomination']['background-color']};"></div>`
const textDescribingTableWrapper = (key: string) => `<div key=${key} id="tp_tag" title="textDescribingTable" style="background-color: ${labels['textDescribingTable']['background-color']};"></div>`
const tableWrapper = (key: string) => `<div key=${key} id="tp_tag" title="Table" style="border-style: solid; border-width: thick; border-color: red;"></div>`