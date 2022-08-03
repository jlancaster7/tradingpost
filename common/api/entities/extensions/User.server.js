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
const _1 = require(".");
const client_s3_1 = require("@aws-sdk/client-s3");
const UserApi_1 = __importDefault(require("../apis/UserApi"));
const finicity_1 = __importDefault(require("../../../brokerage/finicity"));
const configuration_1 = require("../../../configuration");
const pg_promise_1 = __importDefault(require("pg-promise"));
const finicity_2 = __importDefault(require("../../../finicity"));
const repository_1 = __importDefault(require("../../../brokerage/repository"));
const transformer_1 = __importDefault(require("../../../brokerage/finicity/transformer"));
const client = new client_s3_1.S3Client({
    region: "us-east-1"
});
exports.default = (0, _1.ensureServerExtensions)({
    generateBrokerageLink: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const pgCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("postgres");
        const pgp = (0, pg_promise_1.default)({});
        const pgClient = pgp({
            host: pgCfg.host,
            user: pgCfg.user,
            password: pgCfg.password,
            database: pgCfg.database
        });
        yield pgClient.connect();
        const repository = new repository_1.default(pgClient, pgp);
        const finicityCfg = yield configuration_1.DefaultConfig.fromCacheOrSSM("finicity");
        const finicity = new finicity_2.default(finicityCfg.partnerId, finicityCfg.partnerSecret, finicityCfg.appKey);
        const repo = new repository_1.default(pgClient, pgp);
        const finicityService = new finicity_1.default(finicity, repository, new transformer_1.default(repo));
        return {
            link: finicityService.generateBrokerageAuthenticationLink(req.extra.userId)
        };
    }),
    uploadProfilePic: (req) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        if (req.extra.userId !== body.userId) {
            yield client.send(new client_s3_1.PutObjectCommand({
                Bucket: "tradingpost-images",
                Key: `/profile-pics/${body.userId}`,
                Body: body.image
            }));
            yield UserApi_1.default.update(body.userId, {
                has_profile_pic: true
            });
        }
        else
            throw {
                message: "Unathorized",
                code: 401
            };
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJVc2VyLnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLHdCQUF3QztBQUN4QyxrREFBOEQ7QUFDOUQsOERBQW9EO0FBQ3BELDJFQUF5RDtBQUN6RCwwREFBcUQ7QUFDckQsNERBQW1DO0FBQ25DLGlFQUF5QztBQUN6QywrRUFBc0Q7QUFDdEQsMEZBQXlFO0FBRXpFLE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQVEsQ0FBQztJQUN4QixNQUFNLEVBQUUsV0FBVztDQUN0QixDQUFDLENBQUM7QUFFSCxrQkFBZSxJQUFBLHlCQUFzQixFQUFPO0lBQ3hDLHFCQUFxQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDakMsTUFBTSxLQUFLLEdBQUcsTUFBTSw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3RCxNQUFNLEdBQUcsR0FBRyxJQUFBLG9CQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDO1lBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQ3hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUMzQixDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpELE1BQU0sV0FBVyxHQUFHLE1BQU0sNkJBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxrQkFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEcsTUFBTSxJQUFJLEdBQUcsSUFBSSxvQkFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGtCQUFlLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLHFCQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakcsT0FBTztZQUNILElBQUksRUFBRSxlQUFlLENBQUMsbUNBQW1DLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7U0FDOUUsQ0FBQTtJQUVMLENBQUMsQ0FBQTtJQUNELGdCQUFnQixFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUU7UUFDNUIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQTRCLENBQUM7UUFDOUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2xDLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDO2dCQUNuQyxNQUFNLEVBQUUsb0JBQW9CO2dCQUM1QixHQUFHLEVBQUUsaUJBQWlCLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ25DLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSzthQUNuQixDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0saUJBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDOUIsZUFBZSxFQUFFLElBQUk7YUFDeEIsQ0FBQyxDQUFDO1NBQ047O1lBQ0csTUFBTTtnQkFDRixPQUFPLEVBQUUsYUFBYTtnQkFDdEIsSUFBSSxFQUFFLEdBQUc7YUFDWixDQUFBO0lBQ1QsQ0FBQyxDQUFBO0NBQ0osQ0FBQyxDQUFBIn0=