"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.Interface = void 0;
const AuthApi_1 = __importDefault(require("./entities/static/AuthApi"));
const SecurityApi_1 = __importDefault(require("./entities/static/SecurityApi"));
const AlertApi_1 = __importDefault(require("./entities/apis/AlertApi"));
const BookmarkApi_1 = __importDefault(require("./entities/apis/BookmarkApi"));
const CommentApi_1 = __importDefault(require("./entities/apis/CommentApi"));
const PlatformClaimApi_1 = __importDefault(require("./entities/apis/PlatformClaimApi"));
const PostApi_1 = __importDefault(require("./entities/apis/PostApi"));
const SubscriberApi_1 = __importDefault(require("./entities/apis/SubscriberApi"));
const UpvoteApi_1 = __importDefault(require("./entities/apis/UpvoteApi"));
const UserApi_1 = __importDefault(require("./entities/apis/UserApi"));
const WatchlistApi_1 = __importDefault(require("./entities/apis/WatchlistApi"));
const WatchlistItemApi_1 = __importDefault(require("./entities/apis/WatchlistItemApi"));
exports.Interface = __importStar(require("./entities/interfaces"));
exports.Api = {
    Alert: AlertApi_1.default, Bookmark: BookmarkApi_1.default, Comment: CommentApi_1.default, PlatformClaim: PlatformClaimApi_1.default, Post: PostApi_1.default, Subscriber: SubscriberApi_1.default, Upvote: UpvoteApi_1.default, User: UserApi_1.default, Watchlist: WatchlistApi_1.default, WatchlistItem: WatchlistItemApi_1.default,
    Auth: AuthApi_1.default, Security: SecurityApi_1.default
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdFQUE0QztBQUM1QyxnRkFBb0Q7QUFDcEQsd0VBQTRDO0FBQzVDLDhFQUFrRDtBQUNsRCw0RUFBZ0Q7QUFDaEQsd0ZBQTREO0FBQzVELHNFQUEwQztBQUMxQyxrRkFBc0Q7QUFDdEQsMEVBQThDO0FBQzlDLHNFQUEwQztBQUMxQyxnRkFBb0Q7QUFDcEQsd0ZBQTREO0FBQzVELG1FQUFrRDtBQUNyQyxRQUFBLEdBQUcsR0FJYjtJQUNILEtBQUssRUFBTCxrQkFBSyxFQUFDLFFBQVEsRUFBUixxQkFBUSxFQUFDLE9BQU8sRUFBUCxvQkFBTyxFQUFDLGFBQWEsRUFBYiwwQkFBYSxFQUFDLElBQUksRUFBSixpQkFBSSxFQUFDLFVBQVUsRUFBVix1QkFBVSxFQUFDLE1BQU0sRUFBTixtQkFBTSxFQUFDLElBQUksRUFBSixpQkFBSSxFQUFDLFNBQVMsRUFBVCxzQkFBUyxFQUFDLGFBQWEsRUFBYiwwQkFBYTtJQUN4RixJQUFJLEVBQUosaUJBQUksRUFBQyxRQUFRLEVBQVIscUJBQVE7Q0FDWixDQUFBIn0=