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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const configuration_1 = require("./configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const pg_1 = __importDefault(require("pg"));
const luxon_1 = require("luxon");
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.INT8, (value) => {
    return parseInt(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT8, (value) => {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.FLOAT4, (value) => {
    return parseFloat(value);
});
pg_1.default.types.setTypeParser(pg_1.default.types.builtins.NUMERIC, (value) => {
    return parseFloat(value);
});
const run = (tokenFile) => __awaiter(void 0, void 0, void 0, function* () {
    const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
    const pgp = (0, pg_promise_1.default)({});
    const pgClient = pgp({
        host: postgresConfiguration.host,
        user: postgresConfiguration.user,
        password: postgresConfiguration.password,
        database: postgresConfiguration.database
    });
    const dtNow = luxon_1.DateTime.now().setZone("America/New_York");
    console.log(dtNow.toISO());
    console.log(new Date(Date.now()).toISOString());
    // const sqsClient = new SQSClient({
    //     region: "us-east-1"
    // });
    //
    // const s3Client = new S3Client({
    //     region: "us-east-1"
    // });
    //
    // const repository = new Repository(pgClient, pgp);
    // const portSummaryStats = new PortfolioSummaryService(repository);
    // const ibkrService = new Service(repository, s3Client, portSummaryStats, sqsClient);
    // const dt = DateTime.now().set({day: 25, month: 1, year: 2023});
    // console.log("Started")
    // await ibkrService.update("e96aea04-9a60-4832-9793-f790e60df8eb", "F6017651", dt)
    // console.log("Fin")
    // Generate Ibkr Tasks
    // const sqsClient = new SQSClient({
    //     region: "us-east-1"
    // });
    //
    // const s3Client = new S3Client({
    //     region: "us-east-1"
    // });
    //
    // let lastMarker = null;
    // let count = 0;
    //
    // const availableDates = new Set();
    // while (true) {
    //     // @ts-ignore
    //     const getIbkrKeys = new ListObjectsCommand({
    //         Bucket: "tradingpost-brokerage-files",
    //         Prefix: "ibkr/F6017651/",
    //         Marker: lastMarker ? lastMarker : undefined
    //     });
    //
    //     // @ts-ignore
    //     const response = await s3Client.send(getIbkrKeys);
    //
    //     if (!response.Contents || response.Contents.length <= 0) break;
    //     for (let i = 0; i < response.Contents?.length; i++) {
    //         // @ts-ignore
    //         const content = response.Contents[i];
    //         const dateStr = content.Key.split('/')[2].split("_")[2].replace(".csv", "").trim();
    //         const dt = DateTime.fromFormat(dateStr, "yyyyMMdd").setZone("America/New_York").set({
    //             hour: 16,
    //             minute: 0,
    //             second: 0,
    //             millisecond: 0
    //         });
    //
    //         availableDates.add(dt.toISO())
    //         lastMarker = content.Key;
    //         count += 1
    //     }
    // }
    //
    // let arr = [];
    // for (let item of Array.from(availableDates.values())) {
    //     const command = new SendMessageCommand({
    //         MessageBody: JSON.stringify({
    //             type: BrokerageTaskType.NewData,
    //             userId: "e96aea04-9a60-4832-9793-f790e60df8eb",
    //             status: BrokerageTaskStatusType.Pending,
    //             data: {filenames: ["NAV", "Security", "Position", "PL", "CashReport", "Activity", "Account"]},
    //             started: null,
    //             finished: null,
    //             brokerage: DirectBrokeragesType.Ibkr,
    //             date: DateTime.fromISO(item as string),
    //             brokerageUserId: "F6017651",
    //             error: null,
    //             messageId: null
    //         }),
    //         DelaySeconds: 0,
    //         QueueUrl: "https://sqs.us-east-1.amazonaws.com/670171407375/brokerage-task-queue",
    //         MessageAttributes: {
    //             Broker: {
    //                 DataType: "String",
    //                 StringValue: DirectBrokeragesType.Ibkr
    //             },
    //             Account: {
    //                 DataType: "String",
    //                 StringValue: "F6017651"
    //             }
    //         },
    //     });
    //
    //     arr.push(sqsClient.send(command))
    //     if (arr.length === 100) {
    //         await Promise.all(arr);
    //         arr = [];
    //     }
    // }
    //
    // if (arr.length > 0) await Promise.all(arr);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBc0I7QUFDdEIsbURBQThDO0FBQzlDLDREQUF1RDtBQUN2RCw0Q0FBb0I7QUFNcEIsaUNBQStCO0FBUy9CLFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQzdELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDL0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUMvRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQ2hFLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBR0gsTUFBTSxHQUFHLEdBQUcsQ0FBTyxTQUFrQixFQUFFLEVBQUU7SUFDckMsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdFLE1BQU0sR0FBRyxH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