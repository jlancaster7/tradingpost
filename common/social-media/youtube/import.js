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
exports.importYoutubeUsersByToken = exports.importVideos = exports.importYoutubeUsersById = exports.lambdaImportYoutube = void 0;
const users_1 = require("./users");
const videos_1 = require("./videos");
const repository_1 = __importDefault(require("../repository"));
function lambdaImportYoutube(pgClient, pgp, youtubeConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const channelIds = yield repository.getYoutubeUsers();
        const Videos = new videos_1.YoutubeVideos(repository, youtubeConfiguration);
        let result;
        let videosImported = 0;
        for (let i = 0; i < channelIds.length; i++) {
            try {
                result = yield Videos.importVideos(channelIds[i].youtube_channel_id, channelIds[i].access_token, channelIds[i].refresh_token);
                videosImported += result[1];
            }
            catch (err) {
                console.error(err);
            }
        }
        console.log(`${videosImported} youtube videos were imported`);
    });
}
exports.lambdaImportYoutube = lambdaImportYoutube;
function importYoutubeUsersById(pgClient, pgp, youtubeConfiguration, userChannelUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Users = new users_1.YoutubeUsers(repository, youtubeConfiguration);
        const result = yield Users.importYoutubeUsersById(userChannelUrl);
        let length;
        if (typeof userChannelUrl === 'string') {
            length = 1;
        }
        else {
            length = userChannelUrl.length;
        }
        console.log(`Successfully imported ${result[1]} of ${length} Youtube profiles.`);
        return result;
    });
}
exports.importYoutubeUsersById = importYoutubeUsersById;
function importYoutubeUsersByToken(youtubeUsers, pgClient, pgp, youtubeConfiguration) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Users = new users_1.YoutubeUsers(repository, youtubeConfiguration);
        const result = yield Users.importYoutubeUsersbyToken(youtubeUsers);
        console.log(`Successfully imported ${result[0][0].title} Youtube profile.`);
        return result;
    });
}
exports.importYoutubeUsersByToken = importYoutubeUsersByToken;
function importVideos(pgClient, pgp, youtubeConfiguration, youtubeChannelId, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const repository = new repository_1.default(pgClient, pgp);
        const Videos = new videos_1.YoutubeVideos(repository, youtubeConfiguration);
        if (startDate !== undefined) {
            yield Videos.setStartDate(startDate);
        }
        const result = yield Videos.importVideos(youtubeChannelId);
        console.log(`${result[1]} Youtube videos were imported!`);
        return result;
    });
}
exports.importVideos = importVideos;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1wb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLG1DQUF1QztBQUN2QyxxQ0FBeUM7QUFFekMsK0RBQXVDO0FBTXZDLFNBQWUsbUJBQW1CLENBQUMsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDOztRQUUvRyxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3RELE1BQU0sTUFBTSxHQUFHLElBQUksc0JBQWEsQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUVuRSxJQUFJLE1BQXdDLENBQUM7UUFDN0MsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBRXZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hDLElBQUk7Z0JBQ0EsTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzlILGNBQWMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0I7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1NBRUo7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYywrQkFBK0IsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FBQTtBQXVDUSxrREFBbUI7QUFyQzVCLFNBQWUsc0JBQXNCLENBQUMsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQUUsY0FBd0I7O1FBQzVJLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxLQUFLLEdBQUcsSUFBSSxvQkFBWSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xFLElBQUksTUFBYyxDQUFDO1FBQ25CLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxDQUFDLENBQUE7U0FDYjthQUFNO1lBQ0gsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUE7U0FDakM7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQXdCNkIsd0RBQXNCO0FBdEJwRCxTQUFlLHlCQUF5QixDQUFDLFlBQTZGLEVBQUUsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDOztRQUNwTixNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sS0FBSyxHQUFHLElBQUksb0JBQVksQ0FBQyxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUVqRSxNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVuRSxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQWNtRSw4REFBeUI7QUFaN0YsU0FBZSxZQUFZLENBQUMsUUFBd0IsRUFBRSxHQUFVLEVBQUUsb0JBQTBDLEVBQUUsZ0JBQXdCLEVBQUUsU0FBZ0I7O1FBQ3BKLE1BQU0sVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQkFBYSxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRW5FLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUN6QixNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEM7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQzFELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQUVxRCxvQ0FBWSJ9
