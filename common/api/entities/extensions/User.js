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
        this.validateUser = this._makeFetch("validateUser", this._defaultPostRequest);
        //TODO: should thorttle this to prevent DDOS
        this.sendEmailValidation = this._makeFetch("sendEmailValidation", this._defaultPostRequest);
    }
}
exports.default = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBMkQ7QUFJM0QsTUFBcUIsSUFBSyxTQUFRLGlCQUFTO0lBQTNDOztRQUNJLHFCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQTJCLGtCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzFHLDBCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQThCLHVCQUF1QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3ZILHlCQUFvQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQTRGLHNCQUFzQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ25MLDBCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQWtCLHVCQUF1QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNHLHNCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9ILG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3JNLGNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFpTCxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDdlAsZ0JBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF5TCxhQUFhLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDOVAsa0JBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF1QyxlQUFlLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDaEgsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQStFLFlBQVksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNsSixpQkFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9ELGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUMzSCxXQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0MsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNGLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBb0MsY0FBYyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNHLDRDQUE0QztRQUM1Qyx3QkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFnQixxQkFBcUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUN6RyxDQUFDO0NBQUE7QUFmRCx1QkFlQyJ9