
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
        temperature: number = 0,
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
    createPeriodWeights = (periods: string []) => {
        let periodWeighting: any = {}
        let curPeriod = periods[0]
        if (periods.length > 1) {
            periods.sort((a, b) => b.substring(4) === a.substring(4) ? parseInt(b.substring(1,2)) - parseInt(a.substring(1,2)) : parseInt(b.substring(4)) - parseInt(a.substring(4)))
            curPeriod = periods[0]
        }
        
        console.log(periods)
        let weight = 1
        while (curPeriod !== 'Q1 2016') {
            periodWeighting[curPeriod] = periods.includes(curPeriod) ? 1 : weight
            const curQuarter = parseInt(curPeriod.substring(1,2));
            const curYear = parseInt(curPeriod.substring(3));
            weight -= 0.01
            curPeriod = `Q${curQuarter === 0 ? 4 : curQuarter - 1} ${curQuarter === 0 ? curYear - 1 : curYear}`
        }
        curPeriod = periods[0]
        weight = 1
        while (curPeriod !== 'Q4 2023') {
            periodWeighting[curPeriod] = periods.includes(curPeriod) ? 1 : weight
            const curQuarter = parseInt(curPeriod.substring(1,2));
            const curYear = parseInt(curPeriod.substring(3));
            weight -= 0.01
            curPeriod = `Q${curQuarter === 4 ? 0 : curQuarter + 1} ${curQuarter === 4 ? curYear + 1 : curYear}`
        }
        
        return periodWeighting
    }
    findUniqueEmbeddings = (embeddings: (TranscriptEmbedding & {dist?: number | undefined})[]) => {
        embeddings.sort((a ,b) => (b.dist || -100) - (a.dist || 100))
        let result = ''
        const uniqueEmbeddings = embeddings.filter((item, i, array) => {
                return i === array.findIndex((t) => t.transcriptTrainingId === item.transcriptTrainingId)
            })
        for (let i = 0; i < uniqueEmbeddings.length; i++) {
            if (result.split(' ').length > 1500) {
                return result;
            }
            else result += `* ${uniqueEmbeddings[i].speech} \n`;
        }
        return result;
    }

    findMostSimilarSpeech = async (symbol: string, prompt: string |string[], periods: string[], agg: boolean): Promise<[string[], string[]]>  => {
        if (typeof prompt === 'string') prompt = [prompt]
        
        const embeddings = await this.finnhubService.repo.getS3TranscriptEmbeddings(symbol);
        const periodWeighting = this.createPeriodWeights(periods)
        
        let embeddingsWithDist: (TranscriptEmbedding & {dist?: number})[] = embeddings;
        let embeddingsWithDistTimeAdjusted: (TranscriptEmbedding & {dist?: number})[] = JSON.parse(JSON.stringify(embeddings));
        let result = []
        let resultTimeAdjusted = []
        let topEmbeddings = []
        let topEmbeddingsTimeAdjusted = []
        for (let q of prompt) {

            const promptEmbedding = [(await this.openaiServices.getModelEmbeddings(this.openAiEmbedModel, q))[0].embedding];
            let distances = []
            distances = this.gpuCosineSimilarity(promptEmbedding, embeddings.map(a => JSON.parse(a.embedding) as number[]))
            
            for (let i = 0; i < embeddingsWithDist.length; i++) {
                embeddingsWithDist[i].dist = distances[i] 
                
            }
            for (let i = 0; i < embeddingsWithDistTimeAdjusted.length; i++) {
                embeddingsWithDistTimeAdjusted[i].dist = distances[i] * (periodWeighting[embeddingsWithDistTimeAdjusted[i].period] || 1)
            }
            embeddingsWithDist.sort((a ,b) => (b.dist || -100) - (a.dist || 100))
            embeddingsWithDistTimeAdjusted.sort((a ,b) => (b.dist || -100) - (a.dist || 100))
            if (agg) {
                topEmbeddings.push(...embeddingsWithDist.filter(a => (a.dist || 0) > 0.75))
                topEmbeddingsTimeAdjusted.push(...embeddingsWithDistTimeAdjusted.filter(a => (a.dist || 0) > 0.75))
            }
            else {
                result.push(this.findUniqueEmbeddings(embeddingsWithDist.filter(a => (a.dist || 0) > 0.75)))
                resultTimeAdjusted.push(this.findUniqueEmbeddings(embeddingsWithDistTimeAdjusted.filter(a => (a.dist || 0) > 0.75)))
            }
        }
        if (agg) {
            result.push(this.findUniqueEmbeddings(topEmbeddings))
            resultTimeAdjusted.push(this.findUniqueEmbeddings(topEmbeddingsTimeAdjusted))
        }
        return [result, resultTimeAdjusted];
    }
    timePeriodProcessing = async (symbol: string, prompt: string): Promise<[string, string[]]> => {
        const mostRecentQuarter = await this.finnhubService.repo.getSymbolMostRecent(symbol);
        const mostRecentYear = mostRecentQuarter.split(' ')[0].split('')[1] === '4' ? mostRecentQuarter.split(' ')[1] : String(parseInt(mostRecentQuarter.split(' ')[1]) - 1);
        /*
        //const timePeriodPrompt = `In the text following 'Q:', is a specific quarter or year being referenced? If yes, then after 'A:' we will explicitly write which quarters or years are being referenced. We will only return the list. If no quarter or year is referenced in the text after 'Q:' or if the text after 'Q:' asks about which quarter or year something occured in, we will write 'None' after 'A:'.  If the text after 'Q:' refers to specific quarters or years but uses absstract words like latest, most recent, or last, we should writer a list of quarters or years starting with ${mostRecentQuarter} after 'A:'. However, if the text after 'Q:' does not abstractly reference quarters or years using these words, then return 'None'. The format of the Quarters and Years is QQ YYYY, an example of the format for the second quarter of 2021 would be Q2 2021. 'Q:' ${prompt} 'A:' `;
        const isTimePeriodPrompt = `The following question will reference a set of text that will be labeled as Reference Text. The question that you will be answering will be referring to the Reference Text. In order to best answer the question about the Reference Text, you may use information in the Context provided and your general knowledge. Please try to answer the question about the Reference Text as best you can. \nContext: An example of the proper formating for a specific quarter is as follows: the second quarter of 2021 would be formatted as Q1 2021. An example of a correctly answered question is: "Question: How much did revenue grow last quarter? Answer: Yes". \nReference Text: ${prompt} \nQuestion: Yes or No: Is a quarter, year, span of quarters or span of years referred to in the question? \nAnswer:`
        console.log(isTimePeriodPrompt)
        const isTimePeriodInfo = (await this.openaiServices.getModelResponse(this.openAiResponseModel, {
            prompt: isTimePeriodPrompt,
            n: 1,
            max_tokens: 100,
            temperature: 0
        })).choices[0].text?.replace(/\n/, '').split(',').map(a => a.replace(/\n/, '').trim()).filter(a => a !== '').join(', ')
        console.log(isTimePeriodInfo)
        let timePeriodText = '';
        let timePeriodList: string[] = [];

        const noneRegex = new RegExp('no', 'i')
        if (noneRegex.test(isTimePeriodInfo || '')) {
            timePeriodText = `No time period was referenced in the question. The most recent quarter that the company has released an earnings release for, reported financial metrics and hosted and earnings call for is ${mostRecentQuarter}. However, it may be necessary to first ask a question that helps determine what quarter or quarters we should consider if it is unclear.`;
            timePeriodList = [mostRecentQuarter]
        }
        else {
        */
            const noneRegex = new RegExp('none', 'i')
            let timePeriodText = '';
            let timePeriodList: string[] = [];
            const timePeriodPrompt = `The following question will reference a set of text that will be labeled as Reference Text. The question that you will be answering will be referring to the Reference Text. In order to best answer the question about the Reference Text, you may use information in the Context provided and your general knowledge. Please try to answer the question about the Reference Text as best you can. Your answer should be a list of quarters and years and nothing else. If you can't answer the question accurately, please answer with None. \nContext: As an example of the formatting of quarters, Q4 2021 is equivelant to the fourth quarter of 2021, there are 4 quarters in a year. The most recently quarter reported for the company is ${mostRecentQuarter}. The last quarter in which the company reported financial metrics is ${mostRecentQuarter}.  If the question refers to the last quarter or last quarters, the list should start with the most recently reported quarter. If the question refers to the last year or latest years, the list should start with Q4 ${mostRecentYear}. If the question refers to a specific quarter and year, return that.  \nReference Text: ${prompt} \nQuestion: What quarter, year, span of quarters or span of years is the question referring to? \nAnswer:`
            console.log(timePeriodPrompt)
            const timePeriodInfo = (await this.openaiServices.getModelResponse(this.openAiResponseModel, {
                prompt: timePeriodPrompt,
                n: 1,
                max_tokens: 100,
                temperature: 0
            })).choices[0].text?.replace(/\n/, '').split(',').map(a => a.replace(/\n/, '').trim()).filter(a => a !== '').join(', ') || 'None'
            console.log(timePeriodInfo)
            const dupeRegex = new RegExp(timePeriodInfo, 'i')
            if (dupeRegex.test(prompt)) {
                timePeriodText = ``
                timePeriodList = [timePeriodInfo]
            }
            else if (noneRegex.test(timePeriodInfo)) {
                timePeriodText = `The most recent quarter reported by the company was ${mostRecentQuarter}.`
                timePeriodList = [mostRecentQuarter]
            }
            else {
                timePeriodText = `The time periods being referenced in the question is ${timePeriodInfo}.`;
                timePeriodList = timePeriodInfo.split(', ')
            }   
        //}
        return [timePeriodText, timePeriodList]
    }
    abbrivationProcessing = (prompt: string) => {
        const epsRegex = new RegExp('eps', 'i');
        const opMarginRegex = new RegExp('operating margin', 'i');
        let processedPrompt = prompt;
        if (epsRegex.test(prompt)) {
            processedPrompt += '\neps stands for earnings per share.' 
        }
        if (opMarginRegex.test(prompt)) {
            processedPrompt += '\noperating margin equals operating income divided by revenue or sales.'
        }
        return processedPrompt;
    }
    promptProcessing = async (symbol: string, prompt: string, returnQuestionList: boolean): Promise<[string, string[], string[]]> => {
        
        const [timePeriodText, timePeriodList] = await this.timePeriodProcessing(symbol, prompt);
        
        let postProcessedPrompt = timePeriodText ? timePeriodText + '\n' + prompt : prompt;
        
        postProcessedPrompt = this.abbrivationProcessing(postProcessedPrompt);
        let questionList: string[] = [];
        if (returnQuestionList) questionList = await this.promptEngineering(symbol, postProcessedPrompt);

       
        return [postProcessedPrompt, questionList, timePeriodList];
    }
    promptEngineering = async (symbol: string, prompt: string): Promise<string[]> => {

        const leadingQuestion = `Context: The ticker of the company being referenced in the question is ${symbol}. The only information you have available to you are quarterly earnings transcripts, quarterly earnings press releases and quarterly reports. Data from each source is broken up into chunks with maximum size of 60 words and is prepended with the Quarter and Year in which it is from, an example of the format for the second quarter of 2021 would be Q2 2021. Do not return anything other than the list of questions. Try to be as concise as possible. Avoid asking repetitive or redundant questions. Provide a numbered list (1. 2. etc.) of questions, in logical order, that if searched against the context provided, using word embeddings and a cosine similarity score, would lead to the information necessary to answer the following question. Question: ${prompt} Answer:`
        
        console.log(leadingQuestion)
        const leadingQuestionAnswer = await this.openaiServices.getModelResponse(this.openAiResponseModel, {
            prompt: leadingQuestion,
            n: 1,
            max_tokens: 400,
            temperature: 0
        })
        //console.log(leadingQuestionAnswer);
        
        const questionList = leadingQuestionAnswer.choices[0].text?.split(/\n/).map(a => a.replace(/^\d\. /, '')).filter(a => a !== '')
        //console.log(questionList)
        
        return questionList || []
    }
    answerQuestionUsingContext = async(prompt: string, context: string, userId: string, symbol: string, save: boolean) => {
        let preContext = ''
        if (save) {
            //preContext = `Answer the question as truthfully as possible using the provided context, and if the answer is not in the available context, then provide a related and relevant question that could be answered and answer that question. The following context is a list of excerpts from earnings call transcripts and is separated by a * and then the quarter and year in which the information is from. An example for the first quarter of 2021 would be * Q1 2021. Do not use outdated information when making statements about what is happening today. Do not use information from one time period to answer a question about another time period. Be clear about what period you are talking about when answering the question. Context:\n`;
            preContext = `Answer the question as truthfully as possible using the provided context, and if the answer is not in the available context, then say, I can't find a specific answer for you, but here is some information I found that may be helpful:, and then summarize facts that are relevant to the question that the user may find useful. The following context is a list of excerpts from earnings call transcripts and is separated by a * and then the quarter and year in which the information is from. An example for the first quarter of 2021 would be * Q1 2021. Do not use outdated information when making statements about what is happening today. Do not use information from one quarter to answer a question about another quarter. Be clear about what period you are talking about when answering the question. Context:\n`;
        }
        else {
            preContext = `Answer the question as truthfully as possible using the provided context, and if the answer is not in the available context, then return None. The following context is a list of excerpts from earnings call transcripts and is separated by a * and then the quarter and year in which the information is from. An example for the first quarter of 2021 would be * Q1 2021. Do not use outdated information when making statements about what is happening today. Do not use information from one time period to answer a question about another time period. Be clear about what period you are talking about when answering the question. Context:\n`;
        }
        
        let promptWithContext = preContext + `${context}\n` + `Question: ${prompt}\nAnswer: `;
        if (!context.length) return `It looks like I don't have the necessary information available to me to answer your quesiton. Please try asking it again in a different way.`;
        const response = await this.openaiServices.getModelResponse(this.openAiResponseModel,{
            prompt: promptWithContext,
            n: this.n,
            max_tokens: this.maxResponseTokens,
            temperature: this.temperature
        })
        
        if (!response.choices[0].text) return `I'm sorry, I've had a bit of a hiccup, please try submitting your question again!`;
        if (save) {
            await this.finnhubService.repo.insertPromptResponse({
                userId, 
                symbol, 
                prompt, 
                response: response.choices[0].text || '', 
                contextLength: context.split(' ').length
            })
        }
        return response.choices[0].text.replace('"', '').replace('"', '');
    }
    answerQuestion = async (symbol: string, prompt: string, userId: string = 'n/a', iterate: boolean = true) => {
        //const preContext = `Answer the question as truthfully as possible using the provided context, and if the answer is not in the available context, then provide a related and relevant question that could be answered and answer that question. The following context is a list of excerpts from earnings call transcripts and is separated by a * and then the quarter and year in which the information is from. An example for the first quarter of 2021 would be * Q1 2021. Do not use outdated information when making statements about what is happening today. Do not use information from one time period to answer a question about another time period. Be clear about what period you are talking about when answering the question. Context:\n`;
        
        let [postProcessedPrompt, questionList, timePeriods] = await this.promptProcessing(symbol, prompt, iterate);
        if (!questionList.length) questionList.push(prompt);
        console.log(questionList)
        const context = await this.findMostSimilarSpeech(symbol, questionList, timePeriods, true)
        console.log(context[1][0])
        const timeRankedresponse = await this.answerQuestionUsingContext(postProcessedPrompt ,context[1][0], userId, symbol, true);
        console.log(timeRankedresponse)
        const noAnswerRegEx = new RegExp(`I can't find a specific answer for you`, 'i');
        if (noAnswerRegEx.test(timeRankedresponse)) return await this.answerQuestionUsingContext(postProcessedPrompt ,context[0][0], userId, symbol, true);
        else return timeRankedresponse;
        
    }
}

