import fs from 'fs'
import { Configuration, OpenAIApi, CreateEmbeddingResponseDataInner, CreateCompletionResponse } from 'openai';
import Repository from './repository';
import { 
    TranscriptTrainingSetTable, 
    FineTuneJobInput, 
    ModelResponseInput 
} from './interfaces';
import { PublicError } from '@tradingpost/common/api/entities/static/EntityApiBase';

export class OpenAIClass {
    readonly apiKey: string;
    configuration: Configuration;
    openAI: OpenAIApi;
    repo: Repository;
    
    constructor(apiKey: string, repo: Repository) {
        this.apiKey = apiKey;
        this.configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
          });
        this.openAI = new OpenAIApi(this.configuration);
        this.repo = repo;
    }

    createFineTuneJob = async (trainingFileName: string, optionalParams?: Omit<FineTuneJobInput, 'training_file' >) => {
        let jobInput: FineTuneJobInput;

        if (optionalParams) jobInput = { training_file: trainingFileName, ...optionalParams }
        else jobInput = { training_file: trainingFileName }

        const response = await this.openAI.createFineTune(jobInput);
        if (response.status !== 200) {
            throw response;
        }
        return response.data;
    }
    getFineTuneJob = async (fineTuneId: string) => {
        const response = await this.openAI.retrieveFineTune(fineTuneId);
        if (response.status !== 200) {
            throw response;
        }
        return response.data;
    }
    listFineTuneJobs = async () => {
        const response = await this.openAI.listFineTunes();
        if (response.status !== 200) {
            throw response;
        }
        return response.data;
    }
    cancelFineTuneJob = async (fineTuneId: string) => {
        const response = await this.openAI.cancelFineTune(fineTuneId);
        if (response.status !== 200) {
            throw response;
        }
        return response.data;
    }

    createJSONLFile = (data: TranscriptTrainingSetTable[], fileName: string): string => {
        let formattedTranscripts: any[] = []
        for (let i = 0; i < data.length; i++) {
            formattedTranscripts.push({"prompt": data[i].prompt, "completion": data[i].response});
        }
        let output = ''; 
        for (let d of formattedTranscripts) {
            output += JSON.stringify(d) + '\n';
        }
        const fileLocation = `./${fileName}`
        let result = '';
        fs.writeFile(fileLocation, output, function(err) {
            if (err) {
                throw err;
            }
            console.log('Successfully created JSOL file!');
            result = fileLocation;
        })
        return fileLocation;
    }

    uploadFile = async (fileName: string) => {
        const response = await this.openAI.createFile(
            // @ts-ignore
            fs.createReadStream(`./${fileName}`),
            "fine-tune"
            );
        if (response.status !== 200) {
            throw response;
        }
        console.log(`File ${fileName} was successfully uploaded`)
        return response.data;
    }
    listUploadedFiles = async () => {
        const response = await this.openAI.listFiles();
        if (response.status !== 200) {
            throw response;
        }
        return response.data;
    }
    retrieveUploadedFileContent = async (fileId: string) =>{
        const response = await this.openAI.downloadFile(fileId);
        if (response.status !== 200) {
            throw response;
        }
        fs.writeFile(`./${fileId}.csv`, response.data, function(err) {
            if (err) {
                return console.error(err);
            }
        })
        console.log(`File ${fileId} was successfully retrieved`)
        return response.data;
    }
    deleteUploadedFiles = async (fileId: string) => {
        const response = await this.openAI.deleteFile(fileId);
        if (response.status !== 200) {
            throw response;
        }
        console.log(`File ${fileId} was successfully deleted`)
        return response.data;
    }
    getModelEmbeddings = async (model: string, text: string | string[]): Promise<CreateEmbeddingResponseDataInner[]> => {
        const response = await this.openAI.createEmbedding({model: model, input: text})
        if (response.status !== 200) {
            throw response;
        }
        return response.data.data
    }
    listTrainedModels = async () => {
        const response = await this.openAI.listModels();
        if (response.status !== 200) {
            throw response;
        }
        return response.data;
    }
    getModelResponse = async (model: string, optionalParams?: Omit<ModelResponseInput, 'model'>) => {
        let modelInput: ModelResponseInput;

        if (optionalParams) modelInput = { model: model, ...optionalParams }
        else modelInput = { model: model }

        const response = await this.openAI.createCompletion(modelInput);
        if (response.status !== 200) {
            throw new PublicError("Call to OpenAI failed. Please try again!", 401);
        }
        return response.data;
    }
}

