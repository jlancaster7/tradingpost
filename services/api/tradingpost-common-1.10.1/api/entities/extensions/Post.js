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
        // This needs to be decoupled in the future
        this.feed = this._makeFetch("feed", (s) => ({
            body: JSON.stringify(s)
        }));
        /*
        multitermfeed = this._makeFetch<{ page: number, data?: Record<string, number | string | (number | string)[]> }, IElasticPostExt[]>("multitermfeed", (s) => ({
            body: JSON.stringify(s)
        }));
        */
        this.getUpvotes = this._makeFetch("getUpvotes", this._defaultPostRequest);
        this.setBookmarked = this._makeFetch("setBookmarked", this._defaultPostRequest);
        this.setUpvoted = this._makeFetch("setUpvoted", this._defaultPostRequest);
        this.create = this._makeFetch("create", this._defaultPostRequest);
        this.report = this._makeFetch("report", this._defaultPostRequest);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBZ0M7QUFJaEMsZUFBcUIsU0FBUSxlQUFTO0lBQXRDOztRQUNJLHVDQUF1QztRQUN2QywwQkFBMEI7UUFDMUIsSUFBSTtRQUNKLDJDQUEyQztRQUMzQyxTQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0ssTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xNLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUMxQixDQUFDLENBQUMsQ0FBQztRQUNKOzs7O1VBSUU7UUFDRixlQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0MsWUFBWSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ25HLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBeUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ2xILGVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFxRCxZQUFZLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDeEgsV0FBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9HLFFBQVEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUMvSixXQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBMEQsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQ3pILENBQUM7Q0FBQTtBQWxCRCw0QkFrQkMifQ==