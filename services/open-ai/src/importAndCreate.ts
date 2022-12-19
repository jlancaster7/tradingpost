
import 'dotenv/config';
import { init, initOutput, availableTickers } from './init';
import FinnhubService from './service';
import { OpenAIClass } from './openAI';
import { Configuration, OpenAIApi, OpenAIFile, CreateEmbeddingResponseDataInner } from 'openai';
import { TranscriptEmbedding, TranscriptEmbeddingTable } from './interfaces';


export class ImportAndCreate {
    openaiServices: OpenAIClass;
    finnhubService: FinnhubService;

    constructor(init: initOutput) {
        this.openaiServices = init.openaiServices;
        this.finnhubService = init.finnhubService;
    }
    runFinnhubTranscriptImport = async () => {
        for (let d of availableTickers) {
            await this.finnhubService.importTranscript(d);
            console.log(`Successfully imported transcripts for ${d}!`)
        }
    }
    createQATrainingSet = async (trainingSetId: number = 1) => {
        await this.finnhubService.createQATrainingSet(availableTickers, trainingSetId);
        console.log(`Q&A for training set id ${trainingSetId} has been processed and inserted into the DB.`)
    }
    createMDTrainingSet = async (trainingSetId: number = 1) => {
        await this.finnhubService.createMATrainingSet(availableTickers, trainingSetId)
        console.log(`MD for training set id ${trainingSetId} has been processed and inserted into the DB.`)
    }
    createEmbeddings = async () => {
        //const {openaitraining, openairesponse, finnhubService} = await init();
        const transcripts = await this.finnhubService.getTrainingSet();
    
        const total = transcripts.length, 
            batchSize = 100, 
            embedModelName = 'text-embedding-ada-002';
        let batchList = [], 
            textList = [], 
            embedList: CreateEmbeddingResponseDataInner[] = [], 
            upsertCounter = 0, 
            counter = 0, 
            embeddings: TranscriptEmbedding[] = [];
        
        console.log(`Creating Embeddings for ${total} pieces of text`)
        for (let d of transcripts) {
            batchList.push(d)
            if (batchList.length === batchSize){
                textList = batchList.map(a => a.prompt)
                embedList = await this.openaiServices.getModelEmbeddings(embedModelName, textList)
                if (batchList.length !== embedList.length) throw new Error("batchList and embedList were of different sizes.");
                for (let i = 0; i < batchList.length; i++) {
                    if (batchList[i].type === 'MD') {
                        embeddings.push({
                            transcriptId: batchList[i].transcriptId,
                            speech: batchList[i].prompt,
                            embedding: JSON.stringify(embedList[i].embedding),
                            transcriptTrainingId: batchList[i].id
                        })
                    }
                    else if (batchList[i].type === 'Q&A') {
                        embeddings.push({
                            transcriptId: batchList[i].transcriptId,
                            speech: batchList[i].response,
                            embedding: JSON.stringify(embedList[i].embedding),
                            transcriptTrainingId: batchList[i].id
                        })
                    }
                }
                counter += batchSize;
                console.log(`${counter} of ${total} completed.`)
                if (!(counter % 2000) && counter !== 0) {
                    const upsertResult = await this.finnhubService.repo.upsertTranscriptEmbedding(embeddings);
                    upsertCounter += upsertResult;
                    embeddings = []
                    console.log(`Successfully upserted ${upsertCounter} of ${total} embeddings to the table`);
                }
                batchList = []; textList = []; embedList = [];
            }
        }
        const upsertResult = await this.finnhubService.repo.upsertTranscriptEmbedding(embeddings);
        console.log(`Successfully upserted ${upsertResult} embeddings to the table`);
    }
}

// ########################################################################################################
// OG training pipeline for openAI
/*
const openAIPipeline = async () => {

    let {openaitraining, openairesponse, finnhubService} = await init();

    const transcripts = await finnhubService.getTrainingSet();
    const trainingFileName = 'trainingSetMSFT.jsonl';
    console.log(`training set is ${transcripts.length} items long`)
    const createResult = openaitraining.createJSONLFile(transcripts, trainingFileName);
    if (createResult === '') {
        console.log('File creation failed, see logs')
        return;
    }
    const uploadList = await openaitraining.listUploadedFiles();
    

    if (typeof uploadList === 'string') return;
    let uploadResult: OpenAIFile | string;
    const fileExists = uploadList.data.find(a => a.filename === trainingFileName)

    if (fileExists) {
        const deleteResult = await openaitraining.deleteUploadedFiles(fileExists.id)
        if (typeof deleteResult !== 'string') uploadResult = await openaitraining.uploadFile(trainingFileName);
        else throw new Error(deleteResult);    
    }
    else uploadResult = await openaitraining.uploadFile(trainingFileName);
    
    if (typeof uploadResult === 'string') throw new Error(uploadResult);
    

    console.log(await openaitraining.listUploadedFiles());

    const fineTuneResult = await openaitraining.createFineTuneJob(uploadResult.id, {model: 'davinci', n_epochs: 10, batch_size: 5});
    if (typeof fineTuneResult === 'string') {
        console.log(fineTuneResult);
        return;
    }
    console.log(`Fine tune job id: ${fineTuneResult.id}`)
}

const checkFineTuneJob = async () => {

    let {openaitraining, openairesponse, finnhubService} = await init();
    const status = await openaitraining.getFineTuneJob('ft-FDgWNPRr2177zE7ScneBtgqp');
    console.log(status)
    await openaitraining.retrieveUploadedFileContent('file-YjjurmnW1RfE7ZlzPGLTpdIa')
    //const file = await openaitraining.deleteUploadedFiles('file-2rGSSZUmr0AnG6ILkwVKraXL');
    //console.log(await openaitraining.listUploadedFiles());
    //console.log(file);
}

const runTunedModel = async () => {
    let {openaitraining, openairesponse, finnhubService} = await init();
    //const modelList = await openairesponse.listTrainedModels();

    //console.log(modelList);
    const now = (new Date()).toISOString();
    const response = await openairesponse.getModelResponse('davinci:ft-hivemind-2022-12-16-17-24-08', {
        prompt: `${now} - Provide a summarized answer to the following question, using information from as close to the current date as possible.
        If you do not have a high degree of certainty about the answer, please return "I'm sorry, I'm not sure.". 
        How much was revenue up in Q1 2022?`,
        max_tokens: 50,
        temperature: 0.01
    })

    console.log(response);
}


(async ()=> {
    
    
    await openAIPipeline();
    await checkFineTuneJob();
    await runTunedModel();
})()
*/








