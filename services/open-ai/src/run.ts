import { ImportAndCreate } from "./importAndCreate";
import { SearchAndRespond } from './searchAndRespond';
import { init, initOutput, availableTickers } from "./init"
//import { GPU } from "gpu.js";
import fs from "fs";

const importTranscripts = async (Init: initOutput) => {
    const importAndCreate = new ImportAndCreate(Init);

    await importAndCreate.runFinnhubTranscriptImport();
} 


const create = async (Init: initOutput) => {
    
    const importAndCreate = new ImportAndCreate(Init);

    await importAndCreate.createMDTrainingSet();
    await importAndCreate.createQATrainingSet();
    await importAndCreate.createEmbeddings2(availableTickers);
}

const respond = async (Init: initOutput) => {
    //const gpu = new GPU({ mode: 'cpu' });
    const respond = new SearchAndRespond(Init
        //,gpu
        );

    const response = await respond.answerQuestionUsingContext('ADBE', 'How much did revenue grow in Q1 2022?')
    
    console.log(response.choices[0].text)

}


const respondTest = async (Init: initOutput) => {
    //const gpu = new GPU({ mode: 'cpu' });
    const respond = new SearchAndRespond(Init
        //,gpu
        );
    //let responseResults = []
    let writeStream = fs.createWriteStream('./testResults.txt')
    for (let t of availableTickers) {
        console.log(t)
        const transcriptList = await Init.finnhubService.repo.getTranscriptList([t], {from: new Date('12/31/2017'), to: new Date()})
        transcriptList.sort((a, b) => (new Date(b.time)).valueOf() - (new Date(a.time)).valueOf())
        const maxYear = transcriptList[0].year;
        const QinMaxYear = transcriptList[0].quarter;
        for (let y = 2018; y <= maxYear; y++) {
            const maxQuarter = y === maxYear ? QinMaxYear : 4
            for (let q = 1; q <= maxQuarter; q++) {
                const prompt = `How much did revenue grow in Q${q} ${y}?`
                try {
                    const response = await respond.answerQuestionUsingContext(t, prompt)
                    writeStream.write(t + '|' + prompt + '|' + response.choices[0].text + '\n')
                    //responseResults.push({prompt, response});
                }
                catch (err) {
                    console.error(err);
                    writeStream.write(t + '|' + prompt + '|' + ' ' + '\n')
                    //responseResults.push({prompt, response: ''});
                }
            }
        }        
    }
    writeStream.end();
}

(async () => {
    try {
        const Init = await init();
        //await importTranscripts(Init);
        await create(Init);
        //await respondTest(Init);
    } catch (err) {
        console.error(err);
    }
})()