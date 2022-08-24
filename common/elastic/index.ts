import {Client as ElasticClient} from '@elastic/elasticsearch';
import {SearchBody} from "../models/elastic/search";


export default class ElasticService {
    private client: ElasticClient;
    private indexName: string | undefined;

    constructor(client: ElasticClient, indexName?: string) {
        this.client = client;
        this.indexName = indexName;
    }

    ingest = async (items: any[], indexName?: string): Promise<void> => {
        let idxName = '';
        if (!this.indexName && !indexName) throw new Error("create an index name on initialization, or pass via function prototype")
        if (!this.indexName && indexName) idxName = indexName
        else if (!indexName && this.indexName) idxName = this.indexName

        let group = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            group.push(item)
            if (group.length === 100 || i === items.length - 1) {
                const operations = group.flatMap(doc => [{index: {_index: idxName, _id: doc.id}}, doc]);
                const bulkResponse = await this.client.bulk({refresh: false, operations});
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
                }
            }
        }
    }
}