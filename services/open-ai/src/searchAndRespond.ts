
import 'dotenv/config';
import { init, initOutput, availableTickers } from './init';
import { dot, multiply, norm } from 'mathjs';
import FinnhubService from './service';
import { OpenAIClass } from './openAI';
import { TranscriptEmbedding, TranscriptEmbeddingTable } from './interfaces';


export class SearchAndRespond {
    openaiServices: OpenAIClass;
    finnhubService: FinnhubService;
    openAiResponseModel: string;
    openAiEmbedModel: string;
    maxResponseTokens: number;
    temperature: number;
    n: number;

    constructor(init: initOutput, 
        openAiResponseModel: string = 'text-davinci-003', 
        maxResponseTokens: number = 500, 
        openAiEmbedModel: string = 'text-embedding-ada-002',
        temperature: number = 1,
        n: number = 3
        ) {
        this.openaiServices = init.openaiServices;
        this.finnhubService = init.finnhubService;
        this.openAiResponseModel = openAiResponseModel;
        this.openAiEmbedModel = openAiEmbedModel;
        this.maxResponseTokens = maxResponseTokens;
        this.temperature = temperature;
        this.n = n;
    }

    euclideanDistance = (arr1: number[], arr2: number[]): number => {
        if (arr1.length !== arr2.length) throw new Error('arrays in dot product calc were not of the same length');
        return dot(arr1, arr2);
    }

    cosineSimilarity = (arr1: number[], arr2: number[]): number => {
        if (arr1.length !== arr2.length) throw new Error('arrays in dot product calc were not of the same length');
        const norm1 = Number(norm(arr1));
        const norm2 = Number(norm(arr2));
        return dot(arr1, arr2) / (norm1 * norm2);
    }

    matrixMultiplication = (matrix1: number[][], matrix2: number[][]): number[][] => {
        for (let i = 0; i < matrix2.length - 1; i++) {
            if (matrix2[i] !== matrix2[i + 1]) throw new Error("Matrix 2 doesn't have rows of equal length.");
        }
        if (matrix1[0].length !== matrix2.length) throw new Error("Inner dimenssion of the two matricies do not equal.");
    
        return multiply(matrix1, matrix2);
    }

    gpuMatrixMultiplication = (matrix1: number[][], matrix2: number[][]): number[][] => {
        return [[]];
    }

    findMostSimilarSpeech = async (symbol: string, prompt: string): Promise<string>  => {
        const embeddings = await this.finnhubService.repo.getTranscriptEmedding(symbol);
        const promptEmbedding = (await this.openaiServices.getModelEmbeddings(this.openAiEmbedModel, prompt))[0].embedding;
        let embeddingsWithDist: (TranscriptEmbeddingTable & {dist?: number})[] = embeddings;
        for (let i = 0; i < embeddingsWithDist.length; i++) {
            const embed = JSON.parse(embeddingsWithDist[i].embedding)
            embeddingsWithDist[i].dist = this.euclideanDistance(embed, promptEmbedding);
        }
        embeddingsWithDist.sort((a ,b) => (b.dist || -100) - (a.dist || 100))
        
        let result = ''
        for (let d of embeddingsWithDist) {
            if (result.split(' ').length > 1800 || (d.dist || 0) < 0.85) return result;
            else result += `* ${d.speech}\n`;
        }
        return result;
    }

    answerQuestionUsingContext = async (symbol: string, prompt: string) => {
        const preContext = `Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "I don't know."\n\nContext:\n`;
        
        const context = await this.findMostSimilarSpeech(symbol, prompt)
        console.log(`Context is ${context.split(' ').length} words long.\n`)
        
        let promptWithContext = preContext + `${context}\n` + `Q: ${prompt}\nA: `;
        console.log(promptWithContext);
        
        const response = await this.openaiServices.getModelResponse(this.openAiResponseModel,{
            prompt: promptWithContext,
            n: this.n,
            max_tokens: this.maxResponseTokens,
            temperature: this.temperature
        })
        
        return response;
    }
}

//answerQuestionUsingContext('CRWD', `What was subscriber growth in 2022?`);
