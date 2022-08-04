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
exports.WatchlistSaved = exports.WatchlistItem = exports.Watchlist = exports.User = exports.Upvote = exports.Subscriber = exports.Post = exports.PlatformClaim = exports.Comment = exports.Bookmark = exports.Alert = void 0;
const Dummy = __importStar(require("../extensions"));
exports.Alert = Dummy;
exports.Bookmark = Dummy;
exports.Comment = Dummy;
exports.PlatformClaim = Dummy;
exports.Post = __importStar(require("../extensions/Post"));
exports.Subscriber = Dummy;
exports.Upvote = Dummy;
exports.User = __importStar(require("../extensions/User"));
exports.Watchlist = __importStar(require("../extensions/Watchlist"));
exports.WatchlistItem = Dummy;
exports.WatchlistSaved = Dummy;
