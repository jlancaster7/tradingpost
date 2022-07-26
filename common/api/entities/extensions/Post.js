"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
class default_1 extends index_1.default {
    constructor() {
        super(...arguments);
        // setPostsPerPage = (ppp: number) => {
        //     postsPerPage = ppp;
        // }
        this.feed = this._makeFetch("feed", (s) => ({
            body: JSON.stringify(s)
        }));
    }
}
exports.default = default_1;
