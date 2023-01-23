"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQuery = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
const s3Bucket = 'tradingpost-app-data';
const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});
let searchQueryTemplateAsync;
const searchQueryTemplate = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!searchQueryTemplateAsync) {
        searchQueryTemplateAsync = yield streamToString((yield client.send(new client_s3_1.GetObjectCommand({
            Bucket: s3Bucket,
            Key: "post-query-templates/search.json",
        }))).Body);
    }
    return searchQueryTemplateAsync;
});
const searchQuery = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const template = yield searchQueryTemplate();
    let queryString = template;
    Object.keys(data).forEach((k) => {
        //TODO:::: Probably should do a reverse of this in the future ...and validate object types to make sure nothing bad is pass ... 
        const dataToReplace = data[k];
        const dt = typeof dataToReplace;
        if (dt !== "number" && dt !== "string" && !(dataToReplace instanceof Array))
            throw new Error("Invalid data passed to searchQeury");
        //console.log("REG EXP:::::\${" + k + "}");
        queryString = queryString.replace(new RegExp("\\${" + k + "}", "g"), JSON.stringify(dataToReplace));
        //console.log("New QS:" + queryString);
    });
    return JSON.parse(queryString);
});
exports.searchQuery = searchQuery;
class ElasticService {
    constructor(client, indexName) {
        this.search = (searchTerm) => __awaiter(this, void 0, void 0, function* () {
            const postsPerPage = 10000;
            const result = yield this.client.search({
                index: this.indexName,
                size: postsPerPage,
                //from: 0 * postsPerPage,
                query: yield (() => __awaiter(this, void 0, void 0, function* () {
                    return yield (0, exports.searchQuery)({ 'terms': searchTerm });
                }))()
            });
            return result.hits;
        });
        this.ingest = (items, indexName, length) => __awaiter(this, void 0, void 0, function* () {
            if (items.length <= 0)
                return;
            let idxName = '';
            if (indexName)
                idxName = indexName;
            else if (this.indexName)
                idxName = this.indexName;
            else
                throw new Error("create an index name on initialization, or pass via function prototype");
            let group = [];
            const groupSize = length || 100;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                group.push(item);
                if (group.length === groupSize || i === items.length - 1) {
                    const operations = group.flatMap(doc => [{ index: { _index: idxName, _id: doc.id } }, doc]);
                    const bulkResponse = yield this.client.bulk({ refresh: false, operations, timeout: '900s' });
                    group = [];
                    if (bulkResponse.errors) {
                        const erroredDocs = [];
                        bulkResponse.items.forEach((action, idx) => {
                            const operation = Object.keys(action)[0];
                            // @ts-ignore
                            if (action[operation].error) {
                                erroredDocs.push({
                                    // @ts-ignore
                                    status: action[operation].status,
                                    // @ts-ignore
                                    error: action[operation].error,
                                });
                            }
                        });
                        console.log(erroredDocs);
                        return;
                    }
                }
            }
        });
        this.client = client;
        this.indexName = indexName;
    }
}
exports.default = ElasticService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxrREFBOEQ7QUFLOUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBUSxDQUFDO0lBQ3hCLE1BQU0sRUFBRSxXQUFXO0NBQ3RCLENBQUMsQ0FBQztBQUVILE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFBO0FBQ3ZDLE1BQU0sY0FBYyxHQUFHLENBQUMsTUFBVyxFQUFFLEVBQUUsQ0FDbkMsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDcEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUMsQ0FBQztBQUVQLElBQUksd0JBQWdDLENBQUM7QUFDckMsTUFBTSxtQkFBbUIsR0FBRyxHQUFTLEVBQUU7SUFDbkMsSUFBSSxDQUFDLHdCQUF3QixFQUFFO1FBQzNCLHdCQUF3QixHQUFHLE1BQU0sY0FBYyxDQUFDLENBQzVDLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDO1lBQ25DLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLEdBQUcsRUFBRSxrQ0FBa0M7U0FDMUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztL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