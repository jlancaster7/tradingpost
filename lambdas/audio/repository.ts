import { IDatabase, IMain } from "pg-promise";
import { S3, S3Client, GetObjectCommand, _Object } from "@aws-sdk/client-s3";
//import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {Client as ElasticClient} from '@elastic/elasticsearch';
import { IElasticPost } from "@tradingpost/common/api/entities/interfaces";
import fs from 'fs'
import * as cheerio from 'cheerio';


export default class Repository {
    private db: IDatabase<any>;
    private pgp: IMain;
    private elastic: ElasticClient

    constructor(db: IDatabase<any>, pgp: IMain, elastic: ElasticClient) {
        this.db = db;
        this.pgp = pgp;
        this.elastic = elastic;
    }

    insertAudio = async (record: {relatedType: string, relatedId: string, audioUrl: string, transcript: string, userId: string}[]) => {
        const cs = new this.pgp.helpers.ColumnSet([
            {name: 'related_type', prop: 'relatedType'},
            {name: 'related_id', prop: 'relatedId'},
            {name: 'audio_url', prop: 'audioUrl'},
            {name: 'transcript', prop: 'transcript'},
            {name: 'user_id', prop: 'userId'}, 
        ], {table: 'data_audio'})
        const query = this.pgp.helpers.insert(record, cs)
        return await this.db.result(query)
    }
    getAllTpWatchlists = async () => {
        const result = await this.db.query<watchlist[]>(`select dw.id,
                                                                dw."name",
                                                                dw.user_id,
                                                                jsonb_agg(dwi.symbol) as symbols
                                                        from data_watchlist_item dwi 
                                                        inner join data_watchlist dw 
                                                            on dwi.watchlist_id = dw.id 
                                                        group by dw.id, dw."name"
                                                        order by dw.id`)
        return result;
    }
    getWatchlistsByUserId = async(userId: string) => {
        const result = await this.db.query<watchlist[]>(`select dw.id,
                                                                dw."name",
                                                                dw.user_id,
                                                                jsonb_agg(dwi.symbol) as symbols
                                                        from data_watchlist_item dwi 
                                                        inner join data_watchlist dw 
                                                        on dwi.watchlist_id = dw.id 
                                                        where dw.user_id = $1
                                                        group by dw.id, dw."name"
                                                        order by dw.id`, [userId])
        return result;
    }
    getTweetsByTicker = async (ticker: string[], page: number, sources: string[], date: Date, postsPerPage: number = 20) => {
        
        const indexName = "tradingpost-search";
        const searchQueryText = fs.readFileSync('audio/queries/searchQuery.json', 'utf-8');
        const searchSubqueryText = fs.readFileSync('audio/queries/searchSubQuery.json', 'utf-8');
        const sourceSubqueryText = fs.readFileSync('audio/queries/sourceSubQuery.json', 'utf-8');
        let subQueries = []
        for (let t of ticker) {
            subQueries.push(insertParamsIntoTemplate(searchSubqueryText, {searchTerm: t}))
        }
        subQueries.push(insertParamsIntoTemplate(sourceSubqueryText, {sources: sources}))
        
        const queryData = {searchAndSourceSubQueries: subQueries, platform: 'tweet', date: date.toISOString()}
        const searchQueryFilled = insertParamsIntoTemplate(searchQueryText, queryData)
        const result=  (await this.elastic.search<IElasticPost["_source"]>({
            index: indexName,
            size: postsPerPage,
            from: page * postsPerPage,
            query: searchQueryFilled,
            sort: [
                {
                  "platformCreatedAt": {
                    "order": "desc"
                  }
                }
              ]
        })).hits.hits
        const filteredResult = result.filter(a => {
            if (a._source?.content.body.startsWith(`RT`) 
                ) return false
            else return true
        })
        
        return filteredResult.map(a => {
            let text;
            if (a._source?.content.body.startsWith(`RT`)) {
                const $ = cheerio.load(a._source.content.htmlBody);
                text = $('blockquote').text()
            }
            else text = a._source?.content.body;

            return {username: a._source?.platform.username, text: text,  date: a._source?.platformCreatedAt}
        })
    }
    /*
    getAudioFile = async (bucketName: string, file: string) => {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: `${file}.mp3`
        })
        
        // @ts-ignore
        return await getSignedUrl(this.s3Client, command, {
            expiresIn: 3600,
          });
    }
    */
}
type watchlist = {
    id: number
    name: string
    symbols: string[]
    user_id: string
}

const insertParamsIntoTemplate = (template: string, data: Record<string, any>) => {
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ...
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;

        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array) && !(dataToReplace instanceof Object))
            throw new Error("Invalid data passed to query template");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace))

    });
    return JSON.parse(queryString);
}