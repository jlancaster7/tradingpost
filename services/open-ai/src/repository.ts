import { IDatabase, IMain } from "pg-promise";
import { 
    Transcript, 
    TranscriptTable, 
    TranscriptTrainingSet, 
    TranscriptTrainingSetTable, 
    TranscriptList, 
    TranscriptListTable,
    TranscriptWithDetailTable, 
    TranscriptEmbedding,
    TranscriptEmbeddingTable
} from './interfaces';

export default class Repository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;

    constructor(db: IDatabase<any>, pgp: IMain) {
        this.db = db;
        this.pgp = pgp;
    }
    upsertTranscriptList = async (data: TranscriptList[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'symbol', prop: 'symbol'},
                {name: 'transcript_id', prop: 'transcriptId'}, 
                {name: 'quarter', prop: 'quarter'},
                {name: 'year', prop: 'year'},
                {name: 'time', prop: 'time'},
                {name: 'title', prop: 'title'},
                {name: 'audio', prop: 'audio'},
                {name: 'participant', prop: 'participant'},
            ], {table: 'transcript_list'})
    
            const query = this.pgp.helpers.insert(data, cs) + ` ON CONFLICT ON CONSTRAINT transcript_list_transcript_id_key DO UPDATE SET
                                                                    time = EXCLUDED.time,
                                                                    title = EXCLUDED.time,
                                                                    audio = EXCLUDED.audio,
                                                                    participant = EXCLUDED.participant,
                                                                    updated_at = now()
                                                                    `
            const result = await this.db.result(query);

            return result.rowCount;
        } catch (err) {
            console.error(err)
            return 0;
        }
    }
    upsertTranscript = async (data: Transcript[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'transcript_id', prop: 'transcriptId'}, 
                {name: 'participant_description', prop: 'participantDescription'},
                {name: 'participant_name', prop: 'participantName'},
                {name: 'participant_role', prop: 'participantRole'},
                {name: 'session', prop: 'session'},
                {name: 'speech', prop: 'speech'},
                {name: 'call_ordering', prop: 'callOrdering'},
            ], {table: 'transcript'})
    
            const query = this.pgp.helpers.insert(data, cs) + ` ON CONFLICT ON CONSTRAINT transcript_unique_constraint DO UPDATE SET
                                                                    participant_description = EXCLUDED.participant_description,
                                                                    participant_name = EXCLUDED.participant_name,
                                                                    participant_role = EXCLUDED.participant_role,
                                                                    session = EXCLUDED.session,
                                                                    speech = EXCLUDED.speech,
                                                                    updated_at = now()
                                                                    `
            const result = await this.db.result(query);

            return result.rowCount;
        } catch (err) {
            console.error(err)
            return 0;
        }
    }
    insertTrainingSet = async (data: TranscriptTrainingSet[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'transcript_id', prop: 'transcriptId'}, 
                {name: 'training_set_id', prop: 'trainingSetId'}, 
                {name: 'prompt', prop: 'prompt'},
                {name: 'prompt_position', prop: 'promptPosition'},
                {name: 'response', prop: 'response'},
                {name: 'response_position', prop: 'responsePosition'},
                {name: 'type', prop: 'type'},
            ], {table: 'transcript_training_set'})
    
            const query = this.pgp.helpers.insert(data, cs) + ` ON CONFLICT ON CONSTRAINT unique_training_pair DO NOTHING`
            const result = await this.db.result(query);

            return result.rowCount;
        } catch (err) {
            console.error(err)
            return 0;
        }
    }
    upsertTranscriptEmbedding = async(data: TranscriptEmbedding[]): Promise<number> => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'transcript_id', prop: 'transcriptId'}, 
                {name: 'speech', prop: 'speech'}, 
                {name: 'embedding', prop: 'embedding'},
                {name: 'transcript_training_id', prop: 'transcriptTrainingId'},
            ], {table: 'transcript_embedding'})
    
            const query = this.pgp.helpers.insert(data, cs) //+ ` ON CONFLICT ON CONSTRAINT unique_embedding DO UPDATE SET
                                                            //        embedding = EXCLUDED.embedding,
                                                            //        updated_at = now()`
            const result = await this.db.result(query);

            return result.rowCount;
        } catch (err) {
            console.error(err)
            return 0;
        }
    }
    getTranscriptEmedding = async(symbol: string): Promise<TranscriptEmbeddingTable[]> => {
        let query = `SELECT te.id,
                            te.transcript_id,
                            te.speech,
                            te.embedding,
                            transcript_training_id,
                            te.created_at,
                            te.updated_at
                     FROM transcript_embedding te
                     LEFT JOIN transcript_list tl
                        ON te.transcript_id = tl.transcript_id
                     WHERE tl.symbol = $1 AND tl.year > 2017
                     `
        const response = await this.db.query(query, [symbol]);

        let result: TranscriptEmbeddingTable[] = [];

        response.forEach((item: any, index: number) => {
            let o: TranscriptEmbeddingTable ={
                id: item.id,
                transcriptId: item.transcript_id,
                speech: item.speech,
                embedding: item.embedding,
                transcriptTrainingId: item.transcript_training_id,
                created_at: item.created_at,
                updated_at: item.updated_at
            }
            result.push(o);
        })
        return result;
    }
    getTrainingSet = async (): Promise<TranscriptTrainingSetTable[]> => {
        let query = `SELECT id,
                            transcript_id,
                            training_set_id,
                            prompt,
                            prompt_position,
                            response,
                            response_position,
                            type,
                            created_at,
                            updated_at
                     FROM transcript_training_set tts
                     `;
        const response = await this.db.query(query);

        let result: TranscriptTrainingSetTable[] = [];

        response.forEach((item: any, index: number) => {
            let o: TranscriptTrainingSetTable = {
                id: item.id,
                transcriptId: item.transcript_id,
                trainingSetId: item.training_set_id,
                prompt: item.prompt,
                promptPosition: item.prompt_position,
                response: item.response,
                responsePosition: item.response_position,
                type: item.type,
                created_at: item.created_at,
                updated_at: item.updated_at
            }
            result.push(o);
        })
        return result;
    }

    getTranscriptsWithDetails = async (symbol: string, from: Date, to: Date, session?: string): Promise<TranscriptWithDetailTable[]> => {
        let query = `SELECT t.id,
                            t.transcript_id,
                            tl.quarter,
                            tl.year,
                            tl.symbol,
                            tl.time,
                            tl.title,
                            tl.audio,
                            t.participant_description,
                            t.participant_name,
                            t.participant_role,
                            t.session,
                            t.speech,
                            t.created_at,
                            t.updated_at,
                            t.call_ordering
                    FROM transcript t
                    LEFT JOIN transcript_list tl
                        ON t.transcript_id = tl.transcript_id
                    WHERE symbol = $1 AND tl.time BETWEEN $2 AND $3 AND tl.title like '%Earnings%'
                    `;
        let params = [symbol, from, to];
        if (session) {
            query += ' AND t.session = $4';
            params.push(session);
        }
        query += ' order by tl.year, tl.quarter, t.call_ordering'
        const response = await this.db.query(query, params);

        let result: TranscriptWithDetailTable[] = [];

        response.forEach((item: any, index: number) => {
            const o: TranscriptWithDetailTable = {
                id: item.id,
                transcriptId: item.transcript_id,
                quarter: item.quarter,
                year: item.year,
                symbol: item.symbol,
                time: item.time,
                title: item.title,
                audio: item.audio,
                participantDescription: item.participant_description,
                participantName: item.participant_name,
                participantRole: item.participant_role,
                session: item.session,
                speech: item.speech,
                callOrdering: item.call_ordering,
                created_at: item.created_at,
                updated_at: item.updated_at
            }
            result.push(o);
        })

        return result;
    }
    getTranscriptById = async (transcriptId: string, session?: string): Promise<TranscriptWithDetailTable[]> => {
        let query = `SELECT t.id,
                            t.transcript_id,
                            tl.quarter,
                            tl.year,
                            tl.symbol,
                            tl.time,
                            tl.title,
                            tl.audio,
                            t.participant_description,
                            t.participant_name,
                            t.participant_role,
                            t.session,
                            t.speech,
                            t.created_at,
                            t.updated_at,
                            t.call_ordering
                    FROM transcript t
                        LEFT JOIN transcript_list tl
                    ON t.transcript_id = tl.transcript_id
                    WHERE tl.transcript_id = $1
                    `;
        let params = [transcriptId];
        if (session) {
            query += ' AND t.session = $2';
            params.push(session);
        }
        query += ' ORDER BY tl.year, tl.quarter, t.call_ordering'
        const response = await this.db.query(query, params);

        let result: TranscriptWithDetailTable[] = [];

        response.forEach((item: any, index: number) => {
            const o: TranscriptWithDetailTable = {
                id: item.id,
                transcriptId: item.transcript_id,
                quarter: item.quarter,
                year: item.year,
                symbol: item.symbol,
                time: item.time,
                title: item.title,
                audio: item.audio,
                participantDescription: item.participant_description,
                participantName: item.participant_name,
                participantRole: item.participant_role,
                session: item.session,
                speech: item.speech,
                callOrdering: item.call_ordering,
                created_at: item.created_at,
                updated_at: item.updated_at
            }
            result.push(o);
        })

        return result;
    }
    getTranscriptList = async (symbols: string[], optional?: {from: Date, to: Date}): Promise<TranscriptListTable[]> => {
        let query = `SELECT id,
                            symbol,
                            transcript_id,
                            quarter,
                            year,
                            time,
                            title,
                            audio,
                            participant,
                            created_at,
                            updated_at
                     FROM transcript_list
                     WHERE symbol in ($1:list) 
                     AND title like '%Earnings%'
                     `
        let params: any[] = [symbols]
        if (optional) {
            query += ` AND time BETWEEN $2 AND $3`
            params.push(...[optional.from, optional.to])
        }
        query += ' ORDER BY symbol, year, quarter'
        
        const response = await this.db.query(query, params);
        let result: TranscriptListTable[] = [];
        
        response.forEach((item: any, index: number) => {
            let o: TranscriptListTable = {
                id: item.id,
                symbol: item.symbol,
                transcriptId: item.transcript_id,
                quarter: item.quarter,
                year: item.year,
                time: item.time,
                title: item.title,
                audio: item?.audio,
                participant: item?.participant,
                created_at: item.created_at,
                updated_at: item.updated_at
            }
            result.push(o);
        })
        return result;
    }

}