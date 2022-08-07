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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxvREFBZ0M7QUFLaEMsZUFBcUIsU0FBUSxlQUFTO0lBQXRDO1FBQ0ksdUNBQXVDO1FBQ3ZDLDBCQUEwQjtRQUMxQixJQUFJOztRQUVKLDJDQUEyQztRQUMzQyxTQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBK0ksTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pMLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUMxQixDQUFDLENBQUMsQ0FBQztRQUNKLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBeUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ2xILGVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFzQyxZQUFZLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDN0csQ0FBQztDQUFBO0FBWEQsNEJBV0MifQ==