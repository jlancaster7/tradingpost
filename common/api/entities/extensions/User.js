"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class User extends index_1.Extension {
    constructor() {
        super(...arguments);
        this.uploadProfilePic = this._makeFetch("uploadProfilePic", this._defaultPostRequest);
        this.generateBrokerageLink = this._makeFetch("generateBrokerageLink", this._defaultPostRequest);
        this.getBrokerageAccounts = this._makeFetch("getBrokerageAccounts", this._defaultPostRequest);
        this.initBrokerageAccounts = this._makeFetch("initBrokerageAccounts", this._defaultPostRequest);
        this.linkSocialAccount = this._makeFetch("linkSocialAccount", this._defaultPostRequest);
        this.getTrades = this._makePagedFetch("getTrades", this._defaultPostRequest);
        this.getHoldings = this._makeFetch("getHoldings", this._defaultPostRequest);
        this.getWatchlists = this._makeFetch("getWatchlists", this._defaultPostRequest);
        this.getReturns = this._makeFetch("getReturns", this._defaultPostRequest);
        this.getPortfolio = this._makeFetch("getPortfolio", this._defaultPostRequest);
        this.search = this._makeFetch("search", this._defaultPostRequest);
    }
}
exports.default = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBMkQ7QUFJM0QsTUFBcUIsSUFBSyxTQUFRLGlCQUFTO0lBQTNDOztRQUNJLHFCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQTJCLGtCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzFHLDBCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQThCLHVCQUF1QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3ZILHlCQUFvQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQTRGLHNCQUFzQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ25MLDBCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQWtCLHVCQUF1QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNHLHNCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQWdFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ2pKLGNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUE2SSxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDbk4sZ0JBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUEwSSxhQUFhLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDL00sa0JBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF1QyxlQUFlLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDaEgsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQStFLFlBQVksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNsSixpQkFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9ELGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUMzSCxXQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0MsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQy9GLENBQUM7Q0FBQTtBQVpELHVCQVlDIn0=