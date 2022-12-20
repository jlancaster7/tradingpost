import { ImportAndCreate } from "./importAndCreate";
import { SearchAndRespond } from './searchAndRespond';
import { init, initOutput } from "./init"
import { GPU } from "gpu.js";


const create = async (Init: initOutput) => {
    
    const importAndCreate = new ImportAndCreate(Init);

    await importAndCreate.createMDTrainingSet();
    await importAndCreate.createQATrainingSet();
    await importAndCreate.createEmbeddings();
}

const respond = async (Init: initOutput) => {
    const gpu = new GPU({ mode: 'gpu' });
    const respond = new SearchAndRespond(Init, gpu);
    
    const response = await respond.answerQuestionUsingContext('CRWD', 'What was subscriber growth in 2022?')
    console.log(response.choices[0].text)
}

(async () => {
    try {
        const Init = await init();
        
        await create(Init);
        await respond(Init);
    } catch (err) {
        console.error(err);
    }
})()