import { IDatabase, IMain } from "pg-promise";
import { IUserGet } from "@tradingpost/common/api/entities/interfaces";
import { 
    Transcript, 
    TranscriptTable, 
    TranscriptTrainingSet, 
    TranscriptTrainingSetTable, 
    TranscriptList, 
    TranscriptListTable,
    TranscriptWithDetailTable, 
    TranscriptEmbedding,
    TranscriptEmbeddingTable,
    PromptResponse,
    CreateUserInfo
} from './interfaces';
import { S3, S3Client, GetObjectCommand,  PutObjectCommand, ListObjectsCommand, _Object } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from '@aws-sdk/lib-storage';
import stream, { Writable } from 'stream';

export default class Repository {
    private db: IDatabase<any>;
    private readonly pgp: IMain;
    private readonly s3Client: S3Client;
    private readonly s3: S3

    constructor(db: IDatabase<any>, pgp: IMain, s3Client: S3Client, s3: S3) {
        this.db = db;
        this.pgp = pgp;
        this.s3Client = s3Client;
        this.s3 = s3;
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
    
            const query = this.pgp.helpers.insert(data, cs) + ` ON CONFLICT ON CONSTRAINT training_id_embedding DO UPDATE SET
                                                                    embedding = EXCLUDED.embedding,
                                                                    updated_at = now()`
            const result = await this.db.result(query);

            return result.rowCount;
        } catch (err) {
            console.error(err)
            return 0;
        }
    }
    insertPromptResponse = async(data: PromptResponse) => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'user_id', prop: 'userId'}, 
                {name: 'symbol', prop: 'symbol'}, 
                {name: 'prompt', prop: 'prompt'},
                {name: 'response', prop: 'response'},
                {name: 'context_length', prop: 'contextLength'},
            ], {table: 'data_prompt_response'})
    
            const query = this.pgp.helpers.insert(data, cs) //+ ` ON CONFLICT DO NOTHING`
            const result = await this.db.result(query);

            return result.rowCount;
        } catch (err) {
            console.error(err)
            return 0;
        }
    }
    insertPost = async (data: any) => {
        try {
            const cs = new this.pgp.helpers.ColumnSet([
                {name: 'user_id', prop: 'user_id'},
                {name: 'title', prop: 'title'},
                {name: 'body', prop: 'body'},
                {name: 'subscription_level', prop: 'subscription_level'},
                {name: 'max_width', prop: 'max_width'},
                {name: 'aspect_ratio', prop: 'aspect_ratio'},
            ], {table: 'data_post'})
            const query = this.pgp.helpers.insert(data, cs) + ' RETURNING id'
            const result = await this.db.result(query);
            return result.rows[0];
        } catch (err) {
            console.error(err)
            return 0;
        }    
    }
    uploadVideoStream = async(bucketName: string, fileName: string, data: stream.PassThrough) => {
        if (!data) return;
        try {
            const awsUpload = new Upload({
                client: this.s3Client,
                params: {Bucket: bucketName, Key: `${fileName}.mp4`, Body: data}
            })
            awsUpload.on("httpUploadProgress", (progress) => {
                console.log(progress)
            })
            await awsUpload.done()
            /*
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Body: data,
                Key: `${fileName}.mp4`,
                //ContentType: 'mp4'
    
            })
            await this.s3Client.send(command)
            */
        } catch (err: any) {
            console.log(err);
        }

    }
    getVideoUrl = async (bucketName: string, file: string) => {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: `${file}.mp4`
            
        })
        return await getSignedUrl(this.s3Client, command, {
            expiresIn: 3600,
          });
    }
    getAudioFile = async (bucketName: string, file: string) => {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: `${file}.mp3`
        })
        return await getSignedUrl(this.s3Client, command, {
            expiresIn: 3600,
          });
    }
    getSymbolMostRecent = async (symbol: string): Promise<string> => {
        let query = `SELECT quarter, year FROM transcript_list where symbol = $1 ORDER BY year DESC, quarter DESC LIMIT 1`;
        const response = await this.db.query(query, [symbol])

        if (!response.length) return '';

        return `Q${response[0].quarter} ${response[0].year}`
    }
    
    getS3TranscriptEmbeddings = async(symbol: string ): Promise<TranscriptEmbedding[]>  => {
        return await this._getFileFromS3<TranscriptEmbedding>(symbol);
    }
    getTrainingSet = async (tickers: string[]): Promise<(TranscriptTrainingSetTable & {symbol: string})[]> => {
        let query = `SELECT tts.id,
                            tl.symbol,
                            tl.quarter,
                            tl.year,
                            tts.transcript_id,
                            tts.training_set_id,
                            tts.prompt,
                            tts.prompt_position,
                            tts.response,
                            tts.response_position,
                            tts.type,
                            tts.created_at,
                            tts.updated_at
                     FROM transcript_training_set tts
                     INNER JOIN transcript_list tl
                        on tl.transcript_id = tts.transcript_id
                     WHERE tl.symbol in ($1:list)
                     ORDER BY tl.symbol asc;
                     `;
        
        const response = await this.db.query(query, [tickers]);

        let result: (TranscriptTrainingSetTable & {symbol: string})[] = [];

        response.forEach((item: any, index: number) => {
            let o: (TranscriptTrainingSetTable & {symbol: string}) = {
                id: item.id,
                symbol: item.symbol,
                quarter: item.quarter,
                year: item.year,
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
        console.log(response);
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
    getTokensused = async (userId: string): Promise<number> => {
        const month = (new Date()).getMonth() + 1;
        const year = (new Date()).getFullYear();
        const query = `SELECT count(*) as tokens_used
                       FROM data_prompt_response
                       WHERE user_id = $1 
                       AND created_at >= '${month}/1/${year}'`;
        const response = await this.db.query(query, [userId]);

        return parseInt(response[0].tokens_used);
    }
    getTradingPostUser = async (userId: string): Promise<IUserGet> => {
        
        const result = await this.db.query(`SELECT * FROM public.api_user_get ($1)`, [JSON.stringify({data: {id: userId}})])
        if (!result.length) throw new Error("User not found!");
        
        return result[0] as IUserGet;
    }
    verifyToken = async (userId: string) => {
        return await this.db.query(`UPDATE tp.local_login 
                                           SET verified = true 
                                           WHERE user_id = $1`, [userId]);
    }
    createUser = async (data: CreateUserInfo) => {
        return await this.db.query(`SELECT * from tp.api_local_login_create_user ($1)`, [JSON.stringify({data})])
    }
    deleteLogin = async (email: string) => {
        return await this.db.query('DELETE FROM tp.local_login WHERE email = $1', [email]);
    }
    _getFileFromS3 = async <T>(key: string, mapFn?: (data: T) => T): Promise<T[]> => {
        
        const streamToString = (stream: any) =>
            new Promise<string>((resolve, reject) => {
                const chunks: any[] = [];
                stream.on("data", (chunk: any) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            });
        const bucketList = await this.s3Client.send(new ListObjectsCommand({
            Bucket: `tradingpost-embedding`,
            Prefix: key
        }))
        
        let mostRecentEmbeddings: _Object;
        if (bucketList.Contents) {
            mostRecentEmbeddings = (bucketList.Contents?.sort((a, b) => (b.LastModified?.valueOf() || 0) - (a.LastModified?.valueOf() || 0)))[0]
        }
        else {
            throw new Error(`No object found in folder with key ${key}`);
        }
        
        const data = (async () => JSON.parse(
            await streamToString((
              await this.s3Client.send(new GetObjectCommand({
                Bucket: 'tradingpost-embedding',
                Key: mostRecentEmbeddings.Key,
              }))).Body)))()

        
        return data;
    }

}