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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHlDQUFvQztBQUNwQywrREFBdUM7QUFLdkMsU0FBZSxvQkFBb0IsQ0FBQyxRQUF3QixFQUFFLEdBQVU7O1FBRXBFLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxXQUFXLEdBQUcsTUFBTSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4RCxNQUFNLFVBQVUsR0FBRyxJQUFJLG1CQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFNUMsSUFBSSxNQUFvQyxDQUFDO1FBQ3pDLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBRXpCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDMUUsZ0JBQWdCLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLGdCQUFnQixxQkFBcUIsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FBQTtBQVdPLG9EQUFvQjtBQVQ1QixTQUFlLG1CQUFtQixDQUFDLGFBQWlELEVBQUUsUUFBd0IsRUFBRSxHQUFVOztRQUN0SCxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6QyxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsYUFBYSxDQUFDLFFBQVEsNkJBQTZCLGFBQWEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFBO0lBQ3RILENBQUM7Q0FBQTtBQUU2QixrREFBbUIifQ==
