import Finnhub from './finnhub';
import { 
    TranscriptResponse, 
    Transcript, 
    TranscriptTable, 
    TranscriptTrainingSet, 
    TranscriptTrainingSetTable, 
    TranscriptListResponse, 
    TranscriptList, 
    TranscriptListTable,
    TranscriptWithDetailTable
} from './interfaces';
import Repository from './repository';
import Fuse from 'fuse.js';

const nameRoleMap: any = {
    'Unidentified Analyst': 'analyst',
    'Unidentified Company Representative': 'executive',
    'Unknown Executive': 'executive',
    'Unverified Company Representative': 'executive',
    'Unknown Analyst': 'analyst',
    'UnidentifiedAnalyst': 'analyst',
    'Unknown Shareholder': 'analyst',
    'Unidentified Company Speaker': 'executive',
    'Shannon Cross': 'analyst',
    'Unidentified Corporate Participant': 'executive',
    'Analysts': 'analyst'
}

export default class FinnhubService {
    repo: Repository;
    finnhub: Finnhub;
    constructor(repo: Repository, finnhub: Finnhub) {
        this.repo = repo;
        this.finnhub = finnhub;
    }
    nameMatch = (term: string, list: TranscriptResponse['participant']) => {
        const options = {
            includeScore: true,
            keys: ['name']
          }
        const fuse = new Fuse(list, options)
        const commaSplit = term.split(',').length === 2 ? term.split(',') : term.split('-')
        let result: Fuse.FuseResult<{
            description: string;
            name: string;
            role: string;
        }>[];
        if (commaSplit.length === 2) {
            const result1 = fuse.search(commaSplit[0]);
            const result2 = fuse.search(commaSplit[1]);
            if (result1[0] && result1[0].score) {
                if (result2[0] && result2[0].score && (result2[0].score < result1[0].score)) {
                    result = result2;
                }
                else {result = result1;}
            }
            else if (result2[0] && result2[0].score) {result = result2}
            else result = []
        } 
        else {result = fuse.search(term)}
        if (result[0] && result[0].score && result[0].score < 0.55) return result[0].item;
        else return undefined;     
    }

    getTrainingSet = async (tickers: string[]): Promise<(TranscriptTrainingSetTable & {symbol: string}) []> => {
        const transcripts = await this.repo.getTrainingSet(tickers);
        return transcripts;

    }
    createMATrainingSet = async (symbols: string[], trainingSetId: number) => {
        symbols = symbols.filter(a => a !== 'NFLX');
        let transcriptList = await this.repo.getTranscriptList(symbols, {from: new Date('1/1/2017'), to: new Date()})
        
        const regexGen = (term: string, body: string): boolean => {
            return (new RegExp(term.toLocaleLowerCase(), 'i')).test(body.toLocaleLowerCase());
        }
        let trainingSet: TranscriptTrainingSet[] = [];
        for (let d of transcriptList) {
            if (d.transcriptId === 'MSFT_217043') continue;
            const transcript = await this.repo.getTranscriptById(d.transcriptId, 'management_discussion');
            
            let mgmtDiscussion = '';
            for (let f of transcript) {
                if (f.callOrdering === 0 || f.participantRole === 'Operator' || regexGen('Investor Relations', f.participantDescription)|| (new RegExp('IR')).test(f.participantDescription)|| regexGen('General Counsel', f.participantDescription)) continue;
                if (f.participantRole === 'executive') {
                    const o = f.speech.replace('{"', '').replace('"}', '')
                    mgmtDiscussion += mgmtDiscussion === '' ? o : ` ${o}`;
                }
            }
            const sentenceList = mgmtDiscussion.split('. ')
            
            let prompt = `Q${d.quarter} ${d.year} `, index = 0;

            for (let g of sentenceList) {
                if (prompt.split(' ').length < 60 ) prompt += `${g}. `;
                else {
                    trainingSet.push({
                        transcriptId: d.transcriptId,
                        trainingSetId: trainingSetId,
                        prompt: prompt,
                        promptPosition: String(index),
                        response: '',
                        responsePosition: '',
                        type: 'MD'
                    })
                    prompt = `Q${d.quarter} ${d.year} - ${g}. `; index += 1;
                }
            }
        }
        const result = await this.repo.insertTrainingSet(trainingSet);
        
        console.log(`${result} training examples were inserted into the DB`);
    }
    createQATrainingSet = async (symbols: string[], trainingSetId: number) => {
        let transcripts: TranscriptWithDetailTable[] = [];
        for (let d of symbols) {
            const o = await this.repo.getTranscriptsWithDetails(d, new Date('1/1/2017'), new Date(), 'question_answer');
            throw new Error("test");
            
            transcripts.push(...o)
        }
        
        let trainingSet: TranscriptTrainingSet[] = [];
        let prompt = '', response = '', promptTranscriptId = '', responseTranscriptId = '', promptPosition = '', responsePosition = '';

        const regexGen = (term: string): RegExp => new RegExp(term, 'i');
        
        for (let i = 0; i < transcripts.length; i++) {
            if (transcripts[i].participantRole === 'Operator' || (transcripts[i].transcriptId === 'WMT_182560' && transcripts[i].callOrdering === 87)) {
                if (prompt && response && (promptTranscriptId === responseTranscriptId)) {
                    trainingSet.push({
                        transcriptId: transcripts[i].transcriptId,
                        trainingSetId: trainingSetId,
                        prompt: prompt,
                        promptPosition: String(promptPosition),
                        response: response,
                        responsePosition: String(responsePosition),
                        type: 'Q&A'
                    });
                }
                prompt = ''; response = ''; promptTranscriptId = ''; responseTranscriptId = ''; promptPosition = ''; responsePosition = '';
                continue;
            }
            if (transcripts[i].participantRole === 'analyst' || (transcripts[i].participantName === 'Martin Viecha' && regexGen('question').test(transcripts[i].speech.toLocaleLowerCase()) )) {
                if (transcripts[i].speech.length < 40 || (transcripts[i].speech.length < 80 && (regexGen('thank').test(transcripts[i].speech.toLocaleLowerCase()) || regexGen('congrat').test(transcripts[i].speech.toLocaleLowerCase())))) {
                    continue;
                }
                if (prompt && response && (promptTranscriptId === responseTranscriptId)) {
                    trainingSet.push({
                        transcriptId: transcripts[i].transcriptId,
                        trainingSetId: trainingSetId,
                        prompt: prompt,
                        promptPosition: String(promptPosition),
                        response: response,
                        responsePosition: String(responsePosition),
                        type: 'Q&A'
                    });
                }
                prompt = ''; response = ''; promptTranscriptId = ''; responseTranscriptId = ''; promptPosition = ''; responsePosition = '';
    
                prompt = `Q${transcripts[i].quarter} ${transcripts[i].year} ${transcripts[i].speech.replace('{"', '').replace('"}', '')}`;
                prompt = prompt.replace('Thank you. ', '').replace('Excellent. ', '').replace('Wonderful. ', '').replace('Great. ', '').replace('Okay. ', '').replace('Hi. ', '').replace('Got it. ', '')
                promptTranscriptId = transcripts[i].transcriptId;
                promptPosition = String(transcripts[i].callOrdering);
                
            }
             
            else if (transcripts[i].participantRole === 'executive' && prompt !== ''){
                
                if (transcripts[i].speech.length < 150 && regexGen('repeat').test(transcripts[i].speech.toLocaleLowerCase()) && regexGen('sorry').test(transcripts[i].speech.toLocaleLowerCase())) {
                    continue;
                }
                if (transcripts[i].speech.length < 60 && (regexGen('thank').test(transcripts[i].speech.toLocaleLowerCase()) || regexGen('next question').test(transcripts[i].speech.toLocaleLowerCase()) || regexGen('unintelligible').test(transcripts[i].speech.toLocaleLowerCase()))) {
                    continue;
                }
                if (response && (transcripts[i].transcriptId === responseTranscriptId)) {
                    response += `${transcripts[i].speech.replace('{"', '').replace('"}', '')}`;
                    responsePosition += ` ${transcripts[i].callOrdering}`
                }
                else {
                    response += `Q${transcripts[i].quarter} ${transcripts[i].year} ${transcripts[i].speech.replace('{"', '').replace('"}', '')}. `;
                    responseTranscriptId = transcripts[i].transcriptId;
                    responsePosition += `${transcripts[i].callOrdering}`
                }
            }
        }
        const result = await this.repo.insertTrainingSet(trainingSet);
        console.log(`${result} training examples were inserted into the DB`);
    }
    importTranscript = async (symbol: string): Promise<Transcript[]> => {
        const rawTranscriptList = await this.finnhub.pullTranscriptList(symbol);
        const mappedTranscriptList = this.mapTranscriptList(rawTranscriptList);

        const transcriptListUpload = await this.repo.upsertTranscriptList(mappedTranscriptList);

        console.log(`Uploaded meta data for ${transcriptListUpload} ${symbol} transcripts!`)

        let transcripts: Transcript[] = []
        for (let d of mappedTranscriptList) {
            
            const transcript = await this.finnhub.pullTranscript(d.transcriptId);

            if (!Object.keys(transcript).length) continue;
            
            const mappedTranscript = this.mapTranscript(transcript);
            const cleanedTranscript = this.sessionCleanUp(symbol, mappedTranscript);
            transcripts.push(...cleanedTranscript);
        }
        console.log(`Inserting ${transcripts.length} speakers in transcripts for ${symbol}`)
        this.repo.upsertTranscript(transcripts);
        return transcripts;
    }
    
    roleCleanup = (name: string, role: string): string => {
        const roleMapKey = Object.keys(nameRoleMap);
        
        if(roleMapKey.includes(name) && role === 'n/a') {
            role = nameRoleMap[name]
        }
        return role;
    }
    sessionCleanUp = (symbol: string, transcript: Transcript[]) => {
        const callOrderingIssue = ['META', 'AMZN', 'ADBE', 'SNOW', 'GOOGL', 'NVDA', 'TGT', 'CRM', 'CRWD', 'SNAP', 'DDOG']
        if (!callOrderingIssue.includes(symbol)) {
            return transcript;
        }
        else {
            transcript.sort((a, b) => a.callOrdering - b.callOrdering)
            for (let i = 1; i < transcript.length - 1; i++) {
                if (transcript[i - 1].session === 'management_discussion' && transcript[i].session === 'question_answer' && transcript[i + 1].participantRole === 'Operator') {
                    transcript[i].session = 'management_discussion'
                    return transcript;
                }
            }
            return transcript;
        }

    }
    mapTranscriptList = (data: TranscriptListResponse): TranscriptList[] => {
        let result: TranscriptList[] = []
        const filteredData = data.transcripts.filter((v, i, s) => {
            const dupIndex = s.findIndex(v2 => v2.title === v.title && v2.id !== v.id)
            if (dupIndex === -1 || ((new Date(v.time)).valueOf() > (new Date(s[dupIndex].time)).valueOf())) return true;
            else return false;
        })
        console.log(`${data.symbol} - Length of Filtered transcript list: ${filteredData.length} vs unfiltered list: ${data.transcripts.length}`)
        filteredData.forEach((item) => {
            const o = {
                symbol: data.symbol,
                transcriptId: item.id,
                quarter: item.quarter,
                year: item.year,
                time: item.time,
                title: item.title,
                audio: null,
                participant: null
            }
            result.push(o);
        })
        return result;
    }

    mapTranscript = (data: TranscriptResponse): Transcript[] => {
        const participant = data.participant;
        const transcript = data.transcript;
        let result: Transcript[] = []
        
        transcript.forEach((item, index) => {
            let nameMatch: TranscriptResponse['participant'][0] | undefined;
            if (item.name !== 'Operator') {
                nameMatch = participant.find(a => a.name === item.name);
                if (!nameMatch) nameMatch = this.nameMatch(item.name, participant)
                if (!nameMatch) nameMatch = {name: item.name, description: 'n/a', role: 'n/a'}
            }
            else {
                nameMatch = {
                    name: 'Operator',
                    description: 'Operator',
                    role: 'Operator'
                }
            }
            let o: Transcript = {
                        transcriptId: data.id,
                        participantDescription: nameMatch.description,
                        participantName: nameMatch.name,
                        participantRole: this.roleCleanup(nameMatch.name, nameMatch?.role),
                        session: item.session,
                        speech: item.speech,
                        callOrdering: index,
                        }
            result.push(o);
        })
        return result;
    }
    getTranscript = async (symbol: string, from: Date, to: Date): Promise<TranscriptTable[]> => {
       return await this.repo.getTranscriptsWithDetails(symbol, from, to);
    }
}