import {Client} from '@elastic/elasticsearch';
import 'dotenv/config';
import fs from 'fs';

const elasticCloudId = process.env.ELASTIC_CLOUD_ID || '';
const elasticApiKey = process.env.ELASTIC_API_KEY || '';
const client = new Client({
    cloud: {
        id: elasticCloudId
    },
    auth: {
        apiKey: elasticApiKey
    }
});

const run = async () => {
    const indexName = "tradingpost-search";
    // const esIndexSettings JSON.parse(fs.readFileSync('./index-settings.json', 'utf8'))
    try {
        await client.indices.delete({index: indexName});
    } catch (e) {
        console.error()
    }

    const esIndexSchema = JSON.parse(fs.readFileSync('./schema.json', 'utf8'));
    const esData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));
    const response = await client.indices.create({
        index: indexName,
        mappings: esIndexSchema.mappings,
    });
    console.log("Index Created....");
    console.log("Indexing Data....");
    // for (let i = 0; i < esData.length; i++) {
    //     await client.index({
    //         index: indexName,
    //         document: esData[i]
    //     });
    // }
    // await client.indices.refresh({index: indexName});
    console.log(`ElasticSearch Index(${indexName}) Built With New Data`);
}

run().catch(err => {
    console.error(err)
})