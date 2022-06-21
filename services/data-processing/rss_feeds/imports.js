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
exports.importSubstackUsers = exports.lambdaImportRSSFeeds = void 0;
const utils_1 = require("../utils/utils");
const substack_1 = require("./substack");
const awsConfigs = (0, utils_1.getAWSConfigs)();
function lambdaImportRSSFeeds() {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        let query = `SELECT substack_user_id FROM substack_users`;
        //TODO: I could do this a lot better.. making getting the substack Ids apart of the class
        //      and adding a function to set your own list of substackIds.. similar to start date.
        //      but its fine for now
        const substackIds = (yield pg_client.query(query)).rows;
        const ssArticles = new substack_1.Substack(pg_client);
        let result;
        let articlesImported = 0;
        for (let i = 0; i < substackIds.length; i++) {
            result = yield ssArticles.importArticles(substackIds[i].substack_user_id);
            articlesImported += result[1];
        }
        console.log(`Imported ${articlesImported} substack articles.`);
        pg_client.end();
        return;
    });
}
exports.lambdaImportRSSFeeds = lambdaImportRSSFeeds;
function importSubstackUsers(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const pg_client = yield (0, utils_1.getPgClient)((yield awsConfigs).postgres);
        const ssUsers = new substack_1.Substack(pg_client);
        const result = yield ssUsers.importUsers(username);
        let length;
        if (typeof username === 'string') {
            length = 1;
        }
        else {
            length = username.length;
        }
        ;
        console.log(`Successfully imported ${result[1]} of ${length} Substack users.`);
    });
}
exports.importSubstackUsers = importSubstackUsers;
