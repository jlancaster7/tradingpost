
import 'dotenv/config';
import { init, initOutput, availableTickers } from './init';
import FinnhubService from './service';
import { OpenAIClass } from './openAI';
import { Configuration, OpenAIApi, OpenAIFile, CreateEmbeddingResponseDataInner } from 'openai';
import { TranscriptEmbedding, TranscriptEmbeddingTable } from './interfaces';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


const client = new S3Client({
    region: "us-east-1"
});


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
    createEmbeddings = async (tickers: string[]) => {
        
        for (let t of tickers) {
            const transcripts = await this.finnhubService.getTrainingSet([t]);
    
            const total = transcripts.length, 
                batchSize = 50, 
                embedModelName = 'text-embedding-ada-002';
            let batchList = [], 
                textList = [], 
                embedList: CreateEmbeddingResponseDataInner[] = [], 
                upsertCounter = 0, 
                counter = 0, 
                embeddings: TranscriptEmbedding[] = [];
            
            console.log(`Creating Embeddings for ${total} pieces of text for ${t}`)
            for (let d of transcripts) {
                batchList.push(d)
                if (batchList.length === batchSize){
                    textList = batchList.map(a => a.prompt)
                    try {
                        embedList = await this.openaiServices.getModelEmbeddings(embedModelName, textList) 
                        
                    } catch (err) {
                        console.error(err)
                        continue;
                    }
                    
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
                        console.log(`Successfully uploaded ${upsertCounter} of ${total} embeddings to s3 for ${t}`);
                    }
                    batchList = []; textList = []; embedList = [];
                }
            }
            const upsertResult = await this.finnhubService.repo.upsertTranscriptEmbedding(embeddings);
            upsertCounter += upsertResult;
            console.log(`Successfully uploaded ${upsertCounter} embeddings to s3 for ${t}`);
        }
        
    }
    createEmbeddings2 = async (tickers: string[]) => {
        const transcripts = await this.finnhubService.getTrainingSet(tickers);
        const total = transcripts.length, 
            batchSize = 50, 
            embedModelName = 'text-embedding-ada-002';
        let batchList = [],
            embedList: CreateEmbeddingResponseDataInner[] = [],
            counter = 0,
            embeddings: TranscriptEmbedding[] = [];
        for (let i = 0; i < transcripts.length; i++) {
            batchList.push(transcripts[i])

            if (batchList.length === batchSize || (!transcripts[i+1] || transcripts[i].symbol !== transcripts[i+1].symbol)) {
                try {
                    embedList = await this.openaiServices.getModelEmbeddings(embedModelName, batchList.map(a => a.prompt)) 
                    
                } catch (err) {
                    console.error(err)
                    continue;
                }
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
                console.log(`${counter} of ${total} processed.`)
                if (!transcripts[i+1] || transcripts[i].symbol !== transcripts[i+1].symbol) {
                    try {
                        await this.uploadEmbeddings(transcripts[i].symbol, embeddings);
                        console.log(`${embeddings.length} embeddings uploaded for ${transcripts[i].symbol} uploaded to s3.`)
                    } catch (err) {
                        console.error(err)
                        console.error(`Embeddings for ${transcripts[i].symbol} failed to upload to s3.`)
                    }
                    embeddings = [];
                }
                batchList = [];
            }
        }
    }
    uploadEmbeddings = async (symbol: string, data: TranscriptEmbedding[]) => {
        const buf = Buffer.from(JSON.stringify(data));
        const timeStamp = (new Date()).toISOString();
        const result = await client.send(new PutObjectCommand({
            Bucket: "tradingpost-embedding",
            Key: `${symbol}/${timeStamp}`,
            ContentEncoding: 'base64',
            ContentType: 'application/json',
            Body: buf
        }))
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








