import {Client} from '@elastic/elasticsearch'
import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3";
import PostApi from '../api/entities/apis/PostApi';
import {IElasticPost} from '../api/entities/interfaces';

const client = new S3Client({
    region: "us-east-1"
});

const s3Bucket = 'tradingpost-app-data'
const streamToString = (stream: any) =>
    new Promise<string>((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

let searchQueryTemplateAsync: string;
const searchQueryTemplate = async () => {
    if (!searchQueryTemplateAsync) {
        searchQueryTemplateAsync = await streamToString((
            await client.send(new GetObjectCommand({
                Bucket: s3Bucket,
                Key: "post-query-templates/search.json",
            }))).Body);
    }
    return searchQueryTemplateAsync
}

export const searchQuery = async (data: Exclude<Parameters<(typeof PostApi)["extensions"]["feed"]>["0"]["data"], undefined>) => {
    const template = await searchQueryTemplate();
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ... 
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");

        //console.log("REG EXP:::::\${" + k + "}");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace))
        console.log("New QS:" + queryString);
    });
    return JSON.parse(queryString);
}

export default class ElasticService {
    private client: Client;
    private readonly indexName: string | undefined;

    constructor(client: Client, indexName?: string) {
        this.client = client;
        this.indexName = indexName;
    }

    search = async (searchTerm: string, indexName: string) => {
        const postsPerPage = 20;

        const result = await this.client.search<IElasticPost["_source"]>({
            index: indexName,
            size: postsPerPage,
            from: 0 * postsPerPage,
            query: await (async () => {
                return await searchQuery({0: searchTerm});
            })()
        })
        return result.hits;
    }

    ingest = async (items: any[], indexName?: string | null, length?: number): Promise<void> => {
        if (items.length <= 0) return;
        let idxName = '';
        if (indexName) idxName = indexName
        else if (this.indexName) idxName = this.indexName
        else throw new Error("create an index name on initialization, or pass via function prototype")

        let group = [];
        const groupSize = length || 100;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            group.push(item)
            if (group.length === groupSize || i === items.length - 1) {
                const operations = group.flatMap(doc => [{index: {_index: idxName, _id: doc.id}}, doc]);

                const bulkResponse = await this.client.bulk({refresh: false, operations, timeout: '900s'});
                group = []

                if (bulkResponse.errors) {
                    const erroredDocs: {
                        // @ts-ignore
                        status: any;
                        // @ts-ignore
                        error: any;
                    }[] = [];
                    bulkResponse.items.forEach((action, idx) => {
                        const operation = Object.keys(action)[0]
                        // @ts-ignore
                        if (action[operation].error) {
                            erroredDocs.push({
                                // @ts-ignore
                                status: action[operation].status,
                                // @ts-ignore
                                error: action[operation].error,
                            })
                        }
                    });
                    console.log(erroredDocs)
                    return
                }
            }
        }
    }
}