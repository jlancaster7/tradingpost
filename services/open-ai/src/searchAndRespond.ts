
import 'dotenv/config';
import { init, initOutput, availableTickers } from './init';
import { dot, matrix, multiply, norm } from 'mathjs';
import FinnhubService from './service';
import { OpenAIClass } from './openAI';
import { TranscriptEmbedding, TranscriptEmbeddingTable } from './interfaces';
//import { GPU } from 'gpu.js';


export class SearchAndRespond {
    openaiServices: OpenAIClass;
    finnhubService: FinnhubService;
    //gpu: GPU;
    openAiResponseModel: string;
    openAiEmbedModel: string;
    maxResponseTokens: number;
    temperature: number;
    n: number;

    constructor(init: initOutput, 
        //gpu: GPU,
        openAiResponseModel: string = 'text-davinci-003', 
        maxResponseTokens: number = 1000, 
        openAiEmbedModel: string = 'text-embedding-ada-002',
        temperature: number = 1,
        n: number = 1
        ) {
        this.openaiServices = init.openaiServices;
        this.finnhubService = init.finnhubService;
        //this.gpu = gpu;
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
        return dot(arr1, arr2) / (Number(norm(arr1)) * Number(norm(arr2)));
    }
    checkForMatrixMult = (matrix1: number[][], matrix2: number[][]) => {
        for (let i = 0; i < matrix2.length - 1; i++) {
            if (matrix2[i].length !== matrix2[i + 1].length) throw new Error(`Matrix 2 doesn't have rows of equal length. Row ${i} - ${matrix2[i].length} and Row ${i+1} - ${matrix2[i+1].length}`);
        }
        if (matrix1[0].length !== matrix2.length) throw new Error("Inner dimenssion of the two matricies do not equal.");
    }
    matrixMultiplication = (matrix1: number[][], matrix2: number[][]): number[][] => {
        this.checkForMatrixMult(matrix1, matrix2);
        return multiply(matrix1, matrix2);
    }
    /*
    gpuMatrixMultiplication = (matrix1: number[][], matrix2: number[][]): number[] => {
        
        this.checkForMatrixMult(matrix1, matrix2);
        const multiplyMatrix = this.gpu.createKernel(function(a: number[][], b: number[][]) {
            let sum = 0;
            for (let i = 0; i < this.constants.n; i++) {
                sum += a[0][i] * b[i][this.thread.y];
            }
            return sum;
        }, {
            output: [matrix1.length, matrix2[0].length],
            constants: {n: matrix1[0].length},
            optimizeFloatMemory: true
        })
        const result = multiplyMatrix(matrix1, matrix2)
        return result as number[];
    }
    */
    gpuCosineSimilarity = (matrix1: number[][], matrix2: number[][]): number[] => {
        const distances = this.matrixMultiplication(matrix1, this.transposeMatrix(matrix2))[0]
        const matrix1Norm = Number(norm(matrix1[0]))
        const matrix2Norm = matrix2.map(a => Number(norm(a)))
        for (let i = 0; i < distances.length; i++) {
            distances[i] = distances[i] / (matrix1Norm * matrix2Norm[i])
        }
        return distances;
    }
    transposeMatrix = (matrix: number[][]): number[][] => {
        const rows = matrix.length, cols = matrix[0].length;
        const grid = [];
        for (let j = 0; j < cols; j++) {
          grid[j] = Array(rows);
        }
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            grid[j][i] = matrix[i][j];
          }
        }
        return grid;
      }

    findMostSimilarSpeech = async (symbol: string, prompt: string): Promise<string>  => {
        //const startTime = new Date()
        //console.log(`Getting Embeddings ${startTime.toTimeString()}`)
        const embeddings = await this.finnhubService.repo.getS3TranscriptEmbeddings(symbol);
        //const endTime = new Date()
        //console.log(endTime.valueOf() - startTime.valueOf())
        //console.log(`Received Embeddings ${endTime.toTimeString()}`)
        
        let embeddingsWithDist: (TranscriptEmbedding & {dist?: number})[] = embeddings;
        const promptEmbedding = [(await this.openaiServices.getModelEmbeddings(this.openAiEmbedModel, prompt))[0].embedding];
        
        const distances = this.gpuCosineSimilarity(promptEmbedding, embeddings.map(a => JSON.parse(a.embedding) as number[]))
        
        for (let i = 0; i < embeddingsWithDist.length; i++) {
            embeddingsWithDist[i].dist = distances[i]
        }
        
        /*
        for (let i = 0; i < embeddingsWithDist.length; i++) {
            const embed = JSON.parse(embeddingsWithDist[i].embedding)
            embeddingsWithDist[i].dist = this.euclideanDistance(embed, promptEmbedding);
        }
        */
        embeddingsWithDist.sort((a ,b) => (b.dist || -100) - (a.dist || 100))
        //console.log(embeddingsWithDist[0])
        //console.log(embeddingsWithDist[embeddingsWithDist.length - 1])
        let result = ''
        for (let d of embeddingsWithDist) {
            if (result.split(' ').length > 1000 || (d.dist || 0) < 0.80 ) return result;
            else result += `* ${d.speech}\n`;
        }
        return result;
    }
    promptProcessing = async (symbol: string, prompt: string): Promise<string> => {
        
        const mostRecentQuarter = await this.finnhubService.repo.getSymbolMostRecent(symbol);
        
        const timePeriodPrompt = `In the text labeled question, is a time period being referenced? If so, explicitly state which time periods that are being referenced. Only return the list. Otherwise, return 'None'. For context, the most recent time period is ${mostRecentQuarter}. If the question contains 'latest', 'most recent', or 'last', start with ${mostRecentQuarter}. Question: "${prompt}" Answer: `;
        console.log(timePeriodPrompt)
        const timePeriodInfo = await this.openaiServices.getModelResponse(this.openAiResponseModel, {
            prompt: timePeriodPrompt,
            n: 1,
            max_tokens: 100,
            temperature: 1
        })
        
        const noneRegex = RegExp('none', 'i')
        const dupeRegex = RegExp(timePeriodInfo.choices[0].text || '', 'i')
        let postProcessedPrompt = `${(!timePeriodInfo.choices[0].text || noneRegex.test(timePeriodInfo.choices[0].text) ? mostRecentQuarter : (dupeRegex.test(prompt) ? '' : timePeriodInfo.choices[0].text))} - ` + prompt;
        
        const epsRegex = RegExp('eps', 'i')
        if (epsRegex.test(postProcessedPrompt)) postProcessedPrompt += ' earnings per share';

        return postProcessedPrompt;
    }
    answerQuestionUsingContext = async (symbol: string, prompt: string, userId: string = 'n/a') => {
        const preContext = `Answer the question as truthfully as possible using the provided context, and if the answer is not in the available context, provide a related question that you could be answered and then answer that question. Context:\n`;
        const postProcessedPrompt = await this.promptProcessing(symbol, prompt);
        console.log(postProcessedPrompt)
        const context = await this.findMostSimilarSpeech(symbol, postProcessedPrompt)
        //console.log(`Context is ${context.split(' ').length} words long.\n`)
        
        let promptWithContext = preContext + `${context}\n` + `Question: ${postProcessedPrompt}\nAnswer: `;
        
        if (!context.length) return `It looks like I don't have the necessary information available to me to answer your quesiton. Please try asking it again in a different way.`;
        const response = await this.openaiServices.getModelResponse(this.openAiResponseModel,{
            prompt: promptWithContext,
            n: this.n,
            max_tokens: this.maxResponseTokens,
            temperature: this.temperature
        })
        
        if (!response.choices[0].text) return `I'm sorry, I've had a bit of a hiccup, please try submitting your question again!`;
        await this.finnhubService.repo.insertPromptResponse({
            userId, 
            symbol, 
            prompt, 
            response: response.choices[0].text || '', 
            contextLength: context.split(' ').length
        })
        
        return response.choices[0].text.replace('"', '').replace('"', '').replace('\n', '');
    }
}

//answerQuestionUsingContext('CRWD', `What was subscriber growth in 2022?`);
