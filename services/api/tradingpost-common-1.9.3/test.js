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
const repository_1 = __importDefault(require("./brokerage/repository"));
const portfolio_summary_1 = require("./brokerage/portfolio-summary");
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
    // const finicityCfg = await DefaultConfig.fromCacheOrSSM("finicity");
    const repository = new repository_1.default(pgClient, pgp);
    // const finicity = new FinicityApi.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
    // const finicityTransformer = new Transformer(repository);
    const portSummaryStats = new portfolio_summary_1.PortfolioSummaryService(repository);
    // const finicitySrv = new Service(finicity, repository, finicityTransformer, portSummaryStats);
    // const baseTransformer = new BaseTransformer(repository);
    // await baseTransformer.computeHoldingsHistory(479);
    // await repository.addTradingPostAccountGroup('555dd202-664e-4708-994a-2fc591d62b35', 'default', [479], 10117)
    // await portSummaryStats.computeAccountGroupSummary('555dd202-664e-4708-994a-2fc591d62b35');
    // await finicitySrv.remove("a0c8491b-1bac-4c25-b255-c656ee3cedd1", "421720186", DateTime.now(), {
    //     accounts: [{
    //         finicityAccountId: 0,
    //         finicityAccountNumber: '421720186'
    //     }]
    // });
    // console.log("Starting")
    // await robinhoodSrv.add("4a6f0899-dc6d-40cc-aa6a-1febb579d65a", "djbozentka@gmail.com", DateTime.fromISO("2023-01-30T13:26:37.624-05:00"));
    // console.log("Finished")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBc0I7QUFDdEIsbURBQThDO0FBQzlDLDREQUF1RDtBQUN2RCw0Q0FBb0I7QUFJcEIsd0VBQWdEO0FBQ2hELHFFQUFzRTtBQVF0RSxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUM3RCxPQUFPLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQztBQUVILFlBQUUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQy9ELE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsWUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDL0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxZQUFFLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUNoRSxPQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQztBQUdILE1BQU0sR0FBRyxHQUFHLENBQU8sU0FBa0IsRUFBRSxFQUFFO0lBQ3JDLE1BQU0scUJBQXFCLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RSxNQUFNLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1FBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1FBQ2hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1FBQ3hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO0tBQzNDLENBQUMsQ0FBQztJQUVILHNFQUFzRTtJQUN0RSxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pELGtIQUFrSDtJQUNsSCwyREFBMkQ7SUFDM0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLDJDQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pFLGdHQUFnRztJQUVoRywyREFBMkQ7SUFDM0QscURBQXFEO0lBQ3JELCtHQUErRztJQUMvRyw2RkFBNkY7SUFHN0Ysa0dBQWtHO0lBQ2xHLG1CQUFtQjtJQUNuQixnQ0FBZ0M7SUFDaEMsNkNBQTZDO0lBQzdDLFNBQVM7SUFDVCxNQUFNO0lBRU4sMEJBQTBCO0lBQzFCLDZJQUE2STtJQUM3SSwwQkFBMEI7SUFFMUIsc0JBQXNCO0lBQ3RCLG9DQUFvQztJQUNwQywwQkFBMEI7SUFDMUIsTUFBTTtJQUNOLEVBQUU7SUFDRixrQ0FBa0M7SUFDbEMsMEJBQTBCO0lBQzFCLE1BQU07SUFDTixFQUFFO0lBQ0YseUJBQXlCO0lBQ3pCLGlCQUFpQjtJQUNqQixFQUFFO0lBQ0Ysb0NBQW9DO0lBQ3BDLGlCQUFpQjtJQUNqQixvQkFBb0I7SUFDcEIsbURBQW1EO0lBQ25ELGlEQUFpRDtJQUNqRCxvQ0FBb0M7SUFDcEMsc0RBQXNEO0lBQ3RELFVBQVU7SUFDVixFQUFFO0lBQ0Ysb0JBQW9CO0lBQ3BCLHlEQUF5RDtJQUN6RCxFQUFFO0lBQ0Ysc0VBQXNFO0lBQ3RFLDREQUE0RDtJQUM1RCx3QkFBd0I7SUFDeEIsZ0RBQWdEO0lBQ2hELDhGQUE4RjtJQUM5RixnR0FBZ0c7SUFDaEcsd0JBQXdCO0lBQ3hCLHlCQUF5QjtJQUN6Qix5QkFBeUI7SUFDekIsNkJBQTZCO0lBQzdCLGNBQWM7SUFDZCxFQUFFO0lBQ0YseUNBQXlDO0lBQ3pDLG9DQUFvQztJQUNwQyxxQkFBcUI7SUFDckIsUUFBUTtJQUNSLElBQUk7SUFDSixFQUFFO0lBQ0YsZ0JBQWdCO0lBQ2hCLDBEQUEwRDtJQUMxRCwrQ0FBK0M7SUFDL0Msd0NBQXdDO0lBQ3hDLCtDQUErQztJQUMvQyw4REFBOEQ7SUFDOUQsdURBQXVEO0lBQ3ZELDZHQUE2RztJQUM3Ryw2QkFBNkI7SUFDN0IsOEJBQThCO0lBQzlCLG9EQUFvRDtJQUNwRCxzREFBc0Q7SUFDdEQsMkNBQTJDO0lBQzNDLDJCQUEyQjtJQUMzQiw4QkFBOEI7SUFDOUIsY0FBYztJQUNkLDJCQUEyQjtJQUMzQiw2RkFBNkY7SUFDN0YsK0JBQStCO0lBQy9CLHdCQUF3QjtJQUN4QixzQ0FBc0M7SUFDdEMseURBQXlEO0lBQ3pELGlCQUFpQjtJQUNqQix5QkFBeUI7SUFDekIsc0NBQXNDO0lBQ3RDLDBDQUEwQztJQUMxQyxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLFVBQVU7SUFDVixFQUFFO0lBQ0Ysd0NBQXdDO0lBQ3hDLGdDQUFnQztJQUNoQyxrQ0FBa0M7SUFDbEMsb0JBQW9CO0lBQ3BCLFFBQVE7SUFDUixJQUFJO0lBQ0osRUFBRTtJQUNGLDhDQUE4QztBQUNsRCxDQUFDLENBQUEsQ0FBQTtBQUVELENBQUMsR0FBUyxFQUFFO0lBQ1IsTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNmLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQSJ9