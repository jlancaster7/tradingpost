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
exports.importSubstackUsers = exports.lambdaImportRSSFeeds = void 0;
const substack_1 = require("./substack");
const repository_1 = __importDefault(require("../repository"));
function lambdaImportRSSFeeds(pgClient, pgp) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const substackIds = yield repository.getSubstackUsers();
        const ssArticles = new substack_1.Substack(repository);
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
function importSubstackUsers(substackUsers, pgClient, pgp) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const ssUsers = new substack_1.Substack(repository);
        const result = yield ssUsers.importUsers(substackUsers);
        console.log(`Successfully imported ${substackUsers.username}Substack user for userId: ${substackUsers.username}.`);
    });
}
exports.importSubstackUsers = importSubstackUsers;
