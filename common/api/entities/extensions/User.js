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
        this.getComments = this._makeFetch("getComments", this._defaultPostRequest);
        this.getTrades = this._makePagedFetch("getTrades", this._defaultPostRequest);
        this.getHoldings = this._makeFetch("getHoldings", this._defaultPostRequest);
        this.getWatchlists = this._makeFetch("getWatchlists", this._defaultPostRequest);
        this.getReturns = this._makeFetch("getReturns", this._defaultPostRequest);
        this.getPortfolio = this._makeFetch("getPortfolio", this._defaultPostRequest);
        this.search = this._makeFetch("search", this._defaultPostRequest);
        this.validateUser = this._makeFetch("validateUser", this._defaultPostRequest);
        //TODO: should thorttle this to prevent DDOS
        this.sendEmailValidation = this._makeFetch("sendEmailValidation", this._defaultPostRequest);
        this.setBlocked = this._makeFetch("setBlocked", this._defaultPostRequest);
        this.getBlocked = this._makeFetch("getBlocked", this._defaultPostRequest);
        //We can lock this down to prevent abuse if we need to
        this.testNotifcation = this._makeFetch("testNotifcation", this._defaultPostRequest);
        this.getPortfolioNotifications = this._makeFetch("getPortfolioNotifications", this._defaultPostRequest);
        this.togglePortfolioNotifications = this._makeFetch("togglePortfolioNotifications", this._defaultPostRequest);
        this.discoveryOne = this._makeFetch("discoveryOne", this._defaultPostRequest);
        this.discoveryTwo = this._makeFetch("discoveryTwo", this._defaultPostRequest);
        this.discoveryThree = this._makeFetch("discoveryThree", this._defaultPostRequest);
    }
}
exports.default = User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBMkQ7QUFLM0QsTUFBcUIsSUFBSyxTQUFRLGlCQUFTO0lBQTNDOztRQUNJLHFCQUFnQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQTJCLGtCQUFrQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzFHLDBCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQThCLHVCQUF1QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3ZILHlCQUFvQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQTBILHNCQUFzQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ2pOLDBCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQWtCLHVCQUF1QixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNHLHNCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9ILG1CQUFtQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3JNLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBdUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzVHLGNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFpTCxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDdlAsZ0JBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFvTSxhQUFhLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDelEsa0JBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF1QyxlQUFlLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDaEgsZUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQStFLFlBQVksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNsSixpQkFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQW9ELGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUMzSCxXQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0MsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNGLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBb0MsY0FBYyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzNHLDRDQUE0QztRQUM1Qyx3QkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFnQixxQkFBcUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNyRyxlQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBeUQsWUFBWSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQzVILGVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUF5QixZQUFZLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDNUYsc0RBQXNEO1FBQ3RELG9CQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0IsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDN0YsOEJBQXlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBK0MsMkJBQTJCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDaEosaUNBQTRCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBaUQsOEJBQThCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDeEosaUJBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFzRixjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDN0osaUJBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFzRixjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7UUFDN0osbUJBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUE2QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUM1SCxDQUFDO0NBQUE7QUF6QkQsdUJBeUJDIn0=