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
        this.multitermfeed = this._makeFetch("multitermfeed", (s) => ({
            body: JSON.stringify(s)
        }));
        this.getUpvotes = this._makeFetch("getUpvotes", this._defaultPostRequest);
        this.setBookmarked = this._makeFetch("setBookmarked", this._defaultPostRequest);
        this.setUpvoted = this._makeFetch("setUpvoted", this._defaultPostRequest);
        this.create = this._makeFetch("create", this._defaultPostRequest);
        this.report = this._makeFetch("report", this._defaultPostRequest);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBZ0M7QUFJaEMsZUFBcUIsU0FBUSxlQUFTO0lBQXRDOztRQUNJLHVDQUF1QztRQUN2QywwQkFBMEI7UUFDMUIsSUFBSTtRQUNKLDJDQUEyQztRQUMzQyxTQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0ssTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xNLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUMxQixDQUFDLENBQUMsQ0FBQztRQUNKLGtCQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBb0csZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hKLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUMxQixDQUFDLENBQUMsQ0FBQztRQUNKLGVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFnQyxZQUFZLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDbkcsa0JBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF5QyxlQUFlLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDbEgsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQXFELFlBQVksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUN4SCxXQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBb0csUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQy9KLFdBQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF5QyxRQUFRLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7SUFDeEcsQ0FBQztDQUFBO0FBaEJELDRCQWdCQyJ9