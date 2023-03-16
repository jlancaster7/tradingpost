"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
class Subscriber extends _1.default {
    constructor() {
        super(...arguments);
        this.insertWithNotification = this._makeFetch("insertWithNotification", this._defaultPostRequest);
        this.getByOwner = this._makeFetch("getByOwner", this._defaultPostRequest);
        this.getBySubscriber = this._makeFetch("getBySubscriber", this._defaultPostRequest);
        this.removeSubscription = this._makeFetch("removeSubscription", this._defaultPostRequest);
    }
}
exports.default = Subscriber;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaWJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlN1YnNjcmliZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx5Q0FBMEI7QUFHMUIsTUFBcUIsVUFBVyxTQUFRLFVBQVM7SUFBakQ7O1FBQ0ksMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBd0Isd0JBQXdCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDbkgsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQStCLFlBQVksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNsRyxvQkFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQStCLGlCQUFpQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzVHLHVCQUFrQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9ELG9CQUFvQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQzNJLENBQUM7Q0FBQTtBQUxELDZCQUtDIn0=