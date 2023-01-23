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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watchlist = exports.User = exports.Subscription = exports.Subscriber = exports.Post = exports.Notification = exports.Ibkr = exports.Comment = exports.Brokerage = exports.WatchlistSaved = exports.WatchlistItem = exports.Upvote = exports.Trade = exports.PlatformClaim = exports.Bookmark = exports.BlockList = exports.Alert = void 0;
const Dummy = __importStar(require("../extensions"));
exports.Alert = Dummy;
exports.BlockList = Dummy;
exports.Bookmark = Dummy;
const Brokerage = __importStar(require("../extensions/Brokerage"));
exports.Brokerage = Brokerage;
const Comment = __importStar(require("../extensions/Comment"));
exports.Comment = Comment;
const Ibkr = __importStar(require("../extensions/Ibkr"));
exports.Ibkr = Ibkr;
const Notification = __importStar(require("../extensions/Notification"));
exports.Notification = Notification;
exports.PlatformClaim = Dummy;
const Post = __importStar(require("../extensions/Post"));
exports.Post = Post;
const Subscriber = __importStar(require("../extensions/Subscriber"));
exports.Subscriber = Subscriber;
const Subscription = __importStar(require("../extensions/Subscription"));
exports.Subscription = Subscription;
exports.Trade = Dummy;
exports.Upvote = Dummy;
const User = __importStar(require("../extensions/User"));
exports.User = User;
const Watchlist = __importStar(require("../extensions/Watchlist"));
exports.Watchlist = Watchlist;
exports.WatchlistItem = Dummy;
exports.WatchlistSaved = Dummy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxREFBdUM7QUFDMUIsUUFBQSxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2IsUUFBQSxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ2pCLFFBQUEsUUFBUSxHQUFHLEtBQUssQ0FBQTtBQUM3QixtRUFBb0Q7QUFjNUMsOEJBQVM7QUFiakIsK0RBQWdEO0FBYTlCLDBCQUFPO0FBWnpCLHlEQUEwQztBQVloQixvQkFBSTtBQVg5Qix5RUFBMEQ7QUFXM0Isb0NBQVk7QUFWOUIsUUFBQSxhQUFhLEdBQUcsS0FBSyxDQUFBO0FBQ2xDLHlEQUEwQztBQVNFLG9CQUFJO0FBUmhELHFFQUFzRDtBQVFMLGdDQUFVO0FBUDNELHlFQUEwRDtBQU9FLG9DQUFZO0FBTjNELFFBQUEsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNiLFFBQUEsTUFBTSxHQUFHLEtBQUssQ0FBQTtBQUMzQix5REFBMEM7QUFJK0Isb0JBQUk7QUFIN0UsbUVBQW9EO0FBRzBCLDhCQUFTO0FBRjFFLFFBQUEsYUFBYSxHQUFHLEtBQUssQ0FBQTtBQUNyQixRQUFBLGNBQWMsR0FBRyxLQUFLLENBQUEifQ==