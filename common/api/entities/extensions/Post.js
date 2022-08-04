"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
class default_1 extends index_1.default {
    constructor() {
        // setPostsPerPage = (ppp: number) => {
        //     postsPerPage = ppp;
        // }
        super(...arguments);
        // This needs to be decoupled in the future
        this.feed = this._makeFetch("feed", (s) => ({
            body: JSON.stringify(s)
        }));
        this.setBookmarked = this._makeFetch("setBookmarked", this._defaultPostRequest);
        this.setUpvoted = this._makeFetch("setUpvoted", this._defaultPostRequest);
    }
}
exports.default = default_1;
