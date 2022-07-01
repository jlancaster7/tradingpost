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
exports.importTweets = exports.importTwitterUsers = exports.lambdaImportTweets = void 0;
const utils_1 = require("../utils/utils");
const users_1 = require("./users");
const tweets_1 = require("./tweets");
const awsConfigs = (0, utils_1.getAWSConfigs)();
/*
let stream = fs.createReadStream('twitterHandles.csv');
let csvData: string[] = [];
let csvStream = parse()
    .on("data", data => {
        csvData.push(data[0]);
    })
    .on("end", () => {
        importTwitterUsers(csvData);
    });
stream.pipe(csvStream);
*/
lambdaImportTweets();
function lambdaImportTweets() {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        let query = `SELECT twitter_user_id FROM twitter_users`;
        const twitterIds = (yield pg_client.query(query)).rows;
        const Tweet = new tweets_1.Tweets((yield awsConfigs).twitter, pg_client);
        let result;
        let tweetsImported = 0;
        for (let i = 0; i < twitterIds.length; i++) {
            result = yield Tweet.importTweets(twitterIds[i].twitter_user_id);
            tweetsImported += result[1];
        }
        console.log(`${tweetsImported} tweets were imported!`);
        pg_client.end();
        return;
    });
}
exports.lambdaImportTweets = lambdaImportTweets;
function importTwitterUsers(handles) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const TwitterUser = new users_1.TwitterUsers((yield awsConfigs).twitter, pg_client);
        const result = yield TwitterUser.importUser(handles);
        let length;
        if (typeof handles === 'string') {
            length = 1;
        }
        else {
            length = handles.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Twitter profiles.`);
        pg_client.end();
        return result;
    });
}
exports.importTwitterUsers = importTwitterUsers;
function importTweets(twitterUserId, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const Tweet = new tweets_1.Tweets((yield awsConfigs).twitter, pg_client);
        if (startDate !== undefined) {
            Tweet.setStartDate(startDate);
        }
        const result = yield Tweet.importTweets(twitterUserId);
        console.log(`${result[1]} tweets were imported!`);
        pg_client.end();
        return result;
    });
}
exports.importTweets = importTweets;
