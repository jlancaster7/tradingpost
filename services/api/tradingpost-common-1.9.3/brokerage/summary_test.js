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
const configuration_1 = require("../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const repository_1 = __importDefault(require("./repository"));
const interfaces_1 = require("./interfaces");
const luxon_1 = require("luxon");
let pgClient;
let pgp;
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!pgClient || !pgp) {
        const postgresConfiguration = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        pgp = (0, pg_promise_1.default)({});
        pgClient = pgp({
            host: postgresConfiguration.host,
            user: postgresConfiguration.user,
            password: postgresConfiguration.password,
            database: postgresConfiguration.database
        });
        yield pgClient.connect();
    }
    const repo = new repository_1.default(pgClient, pgp);
    try {
        yield repo.execTx((t) => __awaiter(void 0, void 0, void 0, function* () {
            yield t.upsertBrokerageTasks([{
                    status: interfaces_1.BrokerageTaskStatusType.Pending,
                    date: luxon_1.DateTime.now(),
                    userId: "4a6f0899-dc6d-40cc-aa6a-1febb579d65a",
                    messageId: null,
                    brokerage: interfaces_1.DirectBrokeragesType.Robinhood,
                    type: interfaces_1.BrokerageTaskType.ToDo,
                    started: null,
                    data: null,
                    finished: null,
                    brokerageUserId: "12347",
                    error: null
                }]);
            yield t.upsertBrokerageTasks([{
                    status: interfaces_1.BrokerageTaskStatusType.Pending,
                    date: luxon_1.DateTime.now(),
                    userId: "4a6f0899-dc6d-40cc-aa6a-1febb579d65a",
                    messageId: null,
                    brokerage: interfaces_1.DirectBrokeragesType.Robinhood,
                    type: interfaces_1.BrokerageTaskType.ToDo,
                    started: null,
                    data: null,
                    finished: null,
                    brokerageUserId: "123456",
                    error: null
                }]);
            throw new Error("Yeah");
        }));
    }
    catch (e) {
        console.error("Error happened: ", e);
    }
    console.log("FIN!");
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield run();
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV90ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3VtbWFyeV90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUJBQXNCO0FBQ3RCLG9EQUErQztBQUMvQyw0REFBdUQ7QUFDdkQsOERBQXNDO0FBQ3RDLDZDQUE4RjtBQUM5RixpQ0FBK0I7QUFFL0IsSUFBSSxRQUF3QixDQUFDO0FBQzdCLElBQUksR0FBVSxDQUFDO0FBRWYsTUFBTSxHQUFHLEdBQUcsR0FBUyxFQUFFO0lBQ25CLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDbkIsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLDZCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdFLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEIsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUNYLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1lBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxJQUFJO1lBQ2hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3hDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1NBQzNDLENBQUMsQ0FBQTtRQUNGLE1BQU0sUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCO0lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMzQyxJQUFJO1FBQ0EsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQU8sQ0FBQyxFQUFFLEVBQUU7WUFDMUIsTUFBTSxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDMUIsTUFBTSxFQUFFLG9DQUF1QixDQUFDLE9BQU87b0JBQ3ZDLElBQUksRUFBRSxnQkFBUSxDQUFDLEdBQUcsRUFBRTtvQkFDcEIsTUFBTSxFQUFFLHNDQUFzQztvQkFDOUMsU0FBUyxFQUFFLElBQUk7b0JBQ2YsU0FBUyxFQUFFLGlDQUFvQixDQUFDLFNBQVM7b0JBQ3pDLElBQUksRUFBRSw4QkFBaUIsQ0FBQyxJQUFJO29CQUM1QixPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUUsSUFBSTtvQkFDVixRQUFRLEVBQUUsSUFBSTtvQkFDZCxlQUFlLEVBQUUsT0FBTztvQkFDeEIsS0FBSyxFQUFFLElBQUk7aUJBQ2QsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUMxQixNQUFNLEVBQUUsb0NBQXVCLENBQUMsT0FBTztvQkFDdkMsSUFBSSxFQUFFLGdCQUFRLENBQUMsR0FBRyxFQUFFO29CQUNwQixNQUFNLEVBQUUsc0NBQXNDO29CQUM5QyxTQUFTLEVBQUUsSUFBSTtvQkFDZixTQUFTLEVBQUUsaUNBQW9CLENBQUMsU0FBUztvQkFDekMsSUFBSSxFQUFFLDhCQUFpQixDQUFDLElBQUk7b0JBQzVCLE9BQU8sRUFBRSxJQUFJO29CQUNiLElBQUksRUFBRSxJQUFJO29CQUNWLFFBQVEsRUFBRSxJQUFJO29CQUNkLGVBQWUsRUFBRSxRQUFRO29CQUN6QixLQUFLLEVBQUUsSUFBSTtpQkFDZCxDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDM0IsQ0FBQyxDQUFBLENBQUMsQ0FBQztLQUNOO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQ3ZDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN2QixDQUFDLENBQUEsQ0FBQTtBQUVELENBQUMsR0FBUyxFQUFFO0lBQ1IsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixDQUFDLENBQUEsQ0FBQyxFQUFFLENBQUEifQ==