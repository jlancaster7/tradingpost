import 'dotenv/config';
import SecApi from "./secAPI";

const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

(async () => {
    if (!process.env.SEC_API_KEY) throw new Error("Sec Api Key is missing.");
    
    const secapi = new SecApi(process.env.SEC_API_KEY)

    try {
        const filings = await secapi.pullFilings('TYL','10-K', new Date('12/31/2017'))
        console.log(filings)
        
        const items = await secapi.extractFromFiling(filings.filings[0].linkToFilingDetails, '7')
        console.log(items);
    
    } catch (err) {
        console.log(err)
    }


})()

