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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxvREFBZ0M7QUFJaEMsZUFBcUIsU0FBUSxlQUFTO0lBQXRDOztRQUNJLHVDQUF1QztRQUN2QywwQkFBMEI7UUFDMUIsSUFBSTtRQUNKLFNBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFtQixNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDckQsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzFCLENBQUMsQ0FBQyxDQUFBO0lBQ1AsQ0FBQztDQUFBO0FBUEQsNEJBT0MifQ==