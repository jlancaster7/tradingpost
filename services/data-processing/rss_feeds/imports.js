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
const substack_1 = require("./substack");
function lambdaImportRSSFeeds(pgClient, substackConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = `SELECT substack_user_id
                 FROM substack_users`;
        //TODO: I could do this a lot better.. making getting the substack Ids apart of the class
        //      and adding a function to set your own list of substackIds.. similar to start date.
        //      but its fine for now
        const substackIds = (yield pgClient.query(query)).rows;
        const ssArticles = new substack_1.Substack(pgClient);
        let result;
        let articlesImported = 0;
        for (let i = 0; i < substackIds.length; i++) {
            result = yield ssArticles.importArticles(substackIds[i].substack_user_id);
            articlesImported += result[1];
        }
        console.log(`Imported ${articlesImported} substack articles.`);
    });
}
exports.lambdaImportRSSFeeds = lambdaImportRSSFeeds;
function importSubstackUsers(username, pgClient, substackConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const ssUsers = new substack_1.Substack(pgClient);
        const result = yield ssUsers.importUsers(username);
        let length;
        if (typeof username === 'string') {
            length = 1;
        }
        else {
            length = username.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Substack users.`);
    });
}
exports.importSubstackUsers = importSubstackUsers;
